import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../core/prisma.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  relatedFAQs?: FAQ[];
  confidence: number; // 0-1
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.logger.log('🤖 ChatbotService initialized with Gemini API (gemini-2.5-flash)');
  }

  /**
   * Retry helper with exponential backoff for handling API overload
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const isOverloaded = error.message?.includes('503') || error.message?.includes('overloaded');
        
        if (isOverloaded && attempt < this.MAX_RETRIES - 1) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          this.logger.warn(
            `⏳ ${operationName} failed (attempt ${attempt + 1}/${this.MAX_RETRIES}). Retrying in ${delay}ms...`,
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Main chat method - RAG pattern
   * 1. Extract intent from user message
   * 2. Search relevant FAQs from database
   * 3. Generate response using Gemini with context
   */
  async chat(
    userId: number,
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<ChatResponse> {
    this.logger.log(`💬 User ${userId}: ${userMessage}`);

    try {
      // Step 1: Use simple keyword extraction (skip Gemini API call for intent)
      const intent = this.extractIntentSimple(userMessage);
      this.logger.log(`🎯 Intent: ${intent.category} | Keywords: ${intent.keywords.join(', ')}`);

      // Step 2: Retrieve relevant FAQs (RAG - Retrieval)
      const relatedFAQs = await this.semanticSearch(intent.keywords, intent.category);
      this.logger.log(`📚 Found ${relatedFAQs.length} related FAQs`);

      // Step 3: Build context for Gemini
      const context = this.buildContext(relatedFAQs, conversationHistory);

      // Step 4: Generate response using Gemini with retry (RAG - Augmented Generation)
      const prompt = this.buildPrompt(userMessage, context);
      const result: any = await this.retryWithBackoff(
        () => this.model.generateContent(prompt),
        'Generate response',
      );
      const response = result.response;
      const generatedText = response.text();

      this.logger.log(`✅ Generated response (${generatedText.length} chars)`);

      return {
        message: generatedText,
        relatedFAQs: relatedFAQs.slice(0, 3), // Top 3 FAQs
        confidence: this.calculateConfidence(relatedFAQs),
      };
    } catch (error) {
      this.logger.error(`❌ Chat error: ${error.message}`, error.stack);
      return {
        message: 'Xin lỗi, hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút.',
        relatedFAQs: [],
        confidence: 0,
      };
    }
  }

  /**
   * Simple keyword-based intent extraction (no API call)
   * This replaces the Gemini-based extraction to reduce API load
   */
  private extractIntentSimple(userMessage: string): {
    category: string;
    keywords: string[];
  } {
    const message = userMessage.toLowerCase();
    
    // Category detection based on keywords
    let category = 'general';
    if (message.includes('đặt') || message.includes('booking') || message.includes('lịch hẹn') || message.includes('hẹn')) {
      category = 'booking';
    } else if (message.includes('tutor') || message.includes('gia sư') || message.includes('ai matching')) {
      category = 'tutor';
    } else if (message.includes('đánh giá') || message.includes('rating') || message.includes('review')) {
      category = 'rating';
    } else if (message.includes('hủy') || message.includes('cancel')) {
      category = 'booking';
    } else if (message.includes('khiếu nại') || message.includes('complaint') || message.includes('phàn nàn')) {
      category = 'complaint';
    } else if (message.includes('thanh toán') || message.includes('payment') || message.includes('tiền')) {
      category = 'payment';
    }
    
    // Extract keywords (words > 2 chars, filter common words)
    const stopwords = ['là', 'gì', 'thế', 'nào', 'như', 'của', 'để', 'với', 'cho', 'và', 'có', 'trong', 'thì', 'sao'];
    const keywords = message
      .split(' ')
      .filter(w => w.length > 2 && !stopwords.includes(w))
      .slice(0, 5); // Max 5 keywords
    
    return { category, keywords };
  }

  /**
   * Extract intent and keywords from user message using Gemini (DEPRECATED)
   * Kept for reference, but not used to reduce API calls
   */
  private async extractIntent(userMessage: string): Promise<{
    category: string;
    keywords: string[];
  }> {
    const intentPrompt = `
Analyze this user question and extract:
1. Category (one of: booking, tutor, schedule, payment, complaint, general)
2. Keywords (2-5 important words)

Question: "${userMessage}"

Response format (JSON only):
{
  "category": "booking",
  "keywords": ["đặt lịch", "tutor", "hẹn"]
}
`;

    try {
      const result = await this.model.generateContent(intentPrompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || 'general',
          keywords: parsed.keywords || [userMessage],
        };
      }
    } catch (error) {
      this.logger.warn(`Intent extraction failed: ${error.message}`);
    }

    // Fallback: simple keyword extraction
    return this.extractIntentSimple(userMessage);
  }

  /**
   * Semantic search - Find relevant FAQs from database
   * Using keyword matching (simple version, can upgrade to embeddings later)
   */
  async semanticSearch(keywords: string[], category?: string): Promise<FAQ[]> {
    // For now, mock FAQs (will be replaced with real database queries)
    const mockFAQs: FAQ[] = [
      {
        id: 1,
        question: 'Làm sao để đặt lịch với tutor?',
        answer: 'Để đặt lịch với tutor, bạn vào trang "Tìm Tutor", chọn tutor phù hợp, xem lịch rảnh, và click "Đặt lịch" tại slot mong muốn. Tutor sẽ xác nhận hoặc từ chối trong vòng 24h.',
        category: 'booking',
        tags: ['đặt lịch', 'booking', 'tutor', 'hẹn'],
      },
      {
        id: 2,
        question: 'Tutor có thể hủy lịch hẹn không?',
        answer: 'Tutor chỉ có thể từ chối lịch hẹn khi còn ở trạng thái PENDING. Sau khi đã CONFIRMED, tutor không thể tự ý hủy. Nếu có vấn đề khẩn cấp, liên hệ Coordinator.',
        category: 'booking',
        tags: ['hủy lịch', 'cancel', 'tutor'],
      },
      {
        id: 3,
        question: 'Làm sao để đánh giá tutor?',
        answer: 'Sau khi buổi hẹn hoàn thành (status COMPLETED), bạn vào "Lịch sử", chọn buổi hẹn, và click "Đánh giá". Bạn có thể cho điểm 1-5 sao và viết nhận xét.',
        category: 'rating',
        tags: ['đánh giá', 'rating', 'review'],
      },
      {
        id: 4,
        question: 'AI Matching là gì?',
        answer: 'AI Matching là tính năng dùng trí tuệ nhân tạo để tìm tutors phù hợp nhất với bạn dựa trên môn học, kinh nghiệm, đánh giá, và lịch rảnh. Điểm matching từ 0-100, càng cao càng phù hợp.',
        category: 'tutor',
        tags: ['ai matching', 'tìm tutor', 'matching'],
      },
      {
        id: 5,
        question: 'Làm sao để trở thành tutor?',
        answer: 'Để trở thành tutor, bạn cần được Trưởng Bộ Môn (TBM) đề cử, sau đó Admin sẽ duyệt. Liên hệ TBM khoa của bạn để biết thêm chi tiết.',
        category: 'tutor',
        tags: ['đăng ký tutor', 'trở thành tutor', 'application'],
      },
      {
        id: 6,
        question: 'Khiếu nại được xử lý như thế nào?',
        answer: 'Khi bạn gửi khiếu nại, Coordinator sẽ nhận được thông báo qua email. Họ sẽ xem xét và xử lý trong vòng 3-5 ngày làm việc. Bạn sẽ nhận thông báo khi khiếu nại được giải quyết.',
        category: 'complaint',
        tags: ['khiếu nại', 'complaint', 'xử lý'],
      },
    ];

    // Simple keyword matching
    const filteredFAQs = mockFAQs.filter((faq) => {
      const categoryMatch = !category || faq.category === category;
      const keywordMatch = keywords.some((keyword) =>
        faq.tags.some((tag) => tag.includes(keyword.toLowerCase())) ||
        faq.question.toLowerCase().includes(keyword.toLowerCase()) ||
        faq.answer.toLowerCase().includes(keyword.toLowerCase()),
      );
      return categoryMatch && keywordMatch;
    });

    return filteredFAQs;
  }

  /**
   * Build context string from FAQs and conversation history
   */
  private buildContext(faqs: FAQ[], history: ChatMessage[]): string {
    let context = '=== KNOWLEDGE BASE ===\n';
    
    faqs.forEach((faq, index) => {
      context += `\nFAQ ${index + 1}:\nQ: ${faq.question}\nA: ${faq.answer}\n`;
    });

    if (history.length > 0) {
      context += '\n=== CONVERSATION HISTORY ===\n';
      history.slice(-5).forEach((msg) => {
        context += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    return context;
  }

  /**
   * Build prompt for Gemini with context and user message
   */
  private buildPrompt(userMessage: string, context: string): string {
    return `
You are a helpful assistant for a Tutor Support System at HCMUT (Ho Chi Minh University of Technology).

Your role:
- Answer questions about booking tutors, schedules, ratings, complaints, and system features
- Be friendly, concise, and professional
- Use Vietnamese language
- If you don't know the answer, suggest contacting support or checking the FAQ page

${context}

User question: "${userMessage}"

Your response (in Vietnamese, max 200 words):
`;
  }

  /**
   * Calculate confidence based on FAQ relevance
   */
  private calculateConfidence(faqs: FAQ[]): number {
    if (faqs.length === 0) return 0.3; // Low confidence if no FAQs found
    if (faqs.length === 1) return 0.7; // Medium confidence
    if (faqs.length >= 2) return 0.9; // High confidence
    return 0.5;
  }

  /**
   * Get all FAQs by category (for FAQ page)
   */
  async getFAQsByCategory(category?: string): Promise<FAQ[]> {
    const allFAQs = await this.semanticSearch([], category);
    return allFAQs;
  }

  /**
   * Health check for Gemini API
   */
  async healthCheck(): Promise<{ status: string; model: string }> {
    try {
      const result = await this.model.generateContent('Hello');
      const response = result.response.text();
      return {
        status: response ? 'OK' : 'FAILED',
        model: 'gemini-2.5-flash',
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return {
        status: 'ERROR',
        model: 'gemini-2.5-flash',
      };
    }
  }
}
