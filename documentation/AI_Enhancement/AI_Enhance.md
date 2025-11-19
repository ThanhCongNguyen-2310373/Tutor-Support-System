# 🤖 AI-ENHANCED FEATURES - NGHIÊN CỨU & TRIỂN KHAI

## 📋 Tổng Quan

Tài liệu này nghiên cứu việc tích hợp các tính năng AI vào **Tutor Support System** để nâng cao trải nghiệm người dùng và hiệu quả học tập.

**Chiến lược triển khai**: Tập trung vào 3 tính năng AI **khả thi** và **có giá trị cao** , thay vì cố gắng làm nhiều tính năng phức tạp.

## 🎯 3 Tính Năng AI Ưu Tiên (Theo Mức Độ Khả Thi)

### 🥇 Ưu Tiên 1: AI MATCHING - Ghép Cặp Thông Minh
**Độ ưu tiên**: ⭐⭐⭐⭐⭐ (Cao nhất)  
**Giá trị demo**: Cực cao - Đây là tính năng "cốt lõi" nhất

### 🥈 Ưu Tiên 2: CHATBOT & SEMANTIC SEARCH
**Độ ưu tiên**: ⭐⭐⭐⭐ (Cao)  
**Giá trị demo**: Cao - UX tốt, dễ thấy

### 🥉 Ưu Tiên 3: AUTO-GENERATED CONTENT
**Độ ưu tiên**: ⭐⭐⭐ (Trung bình)  
**Giá trị demo**: Trung bình - Hỗ trợ learning roadmap

---


## 🎯 Chi Tiết 3 Tính Năng Ưu Tiên

## 1️⃣ AI MATCHING - Ghép Cặp Thông Minh (🥇 Cao Nhất)

### 📖 Tại Sao Đây Là Tính Năng Quan Trọng Nhất?

**Vấn đề giải quyết**:
- ❓ Sinh viên không biết chọn Tutor nào trong hàng chục người
- ❓ Tutor không tìm được học viên phù hợp với chuyên môn
- ❓ Hệ thống manual matching tốn thời gian và không tối ưu

**Giá trị demo**:
- ✅ Tính năng "ăn tiền" nhất trong đồ án
- ✅ Logic rõ ràng, dễ giải thích trong báo cáo
- ✅ Hiển thị trực quan trên UI (danh sách tutor được xếp hạng)

### 🔬 Công Nghệ: Content-Based Filtering (Đơn Giản & Hiệu Quả)

**Tại sao chọn Content-Based thay vì Collaborative Filtering?**
- ✅ Không cần lượng lớn dữ liệu lịch sử
- ✅ Hoạt động tốt ngay từ đầu (cold start problem)
- ✅ Dễ implement và debug
```
Input:
- Thông tin sinh viên: môn học, level, mục tiêu
- Profile tutor: chuyên môn, kinh nghiệm, đánh giá

Algorithm:
- Vector embedding cho skills/subjects
- Cosine similarity để tính độ match
- Ranking tutors theo similarity score

Output:
- Top 5 tutors phù hợp nhất với điểm số match
```

**B. Collaborative Filtering**
```
Dựa trên:
- Lịch sử bookings thành công
- Rating patterns của students tương tự
- "Students like you also booked..."

Algorithm:
- User-based CF hoặc Item-based CF
- Matrix Factorization (SVD)
- Neural Collaborative Filtering (nếu có nhiều data)
```

**C. Hybrid Approach (Khuyến nghị)**
```
Kết hợp:
- Content-based (60%): Skills/expertise matching
- Collaborative (30%): Behavior patterns
- Business rules (10%): Availability, rating threshold, response time

Final Score = 0.6*ContentScore + 0.3*CollabScore + 0.1*BusinessScore
```

### 🛠️ Tech Stack: Chọn Option Đơn Giản Nhất

**❌ KHÔNG dùng Python Microservice** (Quá phức tạp cho đồ án)  
**❌ KHÔNG dùng TensorFlow/Deep Learning** (Overkill)  
**✅ DÙNG: Node.js Libraries + PostgreSQL pgvector**

#### **Option A: Node.js `natural` library (Khuyến nghị)**

```bash
npm install natural
```

```typescript
// src/ai/matching.service.ts
import { Injectable } from '@nestjs/common';
import * as natural from 'natural';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class AIMatchingService {
  private tfidf: any;

  constructor(private prisma: PrismaService) {
    this.tfidf = new natural.TfIdf();
  }

  /**
   * Match students với tutors dựa trên Content-Based Filtering
   */
  async matchTutors(studentProfile: StudentProfile): Promise<RankedTutor[]> {
    // 1. Lấy tất cả tutors available
    const tutors = await this.prisma.tutorProfile.findMany({
      where: { available: true },
      include: { user: true },
    });

    // 2. Tạo vector cho student
    const studentVector = this.createProfileVector(studentProfile);

    // 3. Tính similarity score cho từng tutor
    const rankedTutors = tutors.map(tutor => {
      const tutorVector = this.createTutorVector(tutor);
      const score = this.calculateCosineSimilarity(studentVector, tutorVector);
      
      return {
        ...tutor,
        matchScore: score,
        matchReasons: this.explainMatch(studentProfile, tutor),
      };
    });

    // 4. Sắp xếp theo score và trả về top 10
    return rankedTutors
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  /**
   * Tạo vector đặc trưng cho student
   */
  private createProfileVector(student: StudentProfile): number[] {
    const features = [
      student.subject,              // "Calculus"
      student.level,                // "Beginner"
      student.learningStyle,        // "Visual"
      ...student.weaknesses,        // ["Integration", "Derivatives"]
      ...student.goals,             // ["Pass exam", "Deep understanding"]
    ];

    // Dùng TF-IDF để vector hóa
    const document = features.join(' ');
    this.tfidf.addDocument(document);
    
    // Trả về vector
    return this.tfidf.listTerms(0 /* document index */)
      .map(item => item.tfidf);
  }

  /**
   * Tạo vector đặc trưng cho tutor
   */
  private createTutorVector(tutor: any): number[] {
    const features = [
      tutor.specialization,         // "Mathematics"
      tutor.teachingStyle,          // "Interactive"
      tutor.yearsExperience.toString(),
      ...tutor.expertise,           // ["Calculus", "Linear Algebra"]
    ];

    const document = features.join(' ');
    this.tfidf.addDocument(document);
    
    return this.tfidf.listTerms(1 /* document index */)
      .map(item => item.tfidf);
  }

  /**
   * Tính Cosine Similarity giữa 2 vectors
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Giải thích tại sao match (cho UI hiển thị)
   */
  private explainMatch(student: StudentProfile, tutor: any): string[] {
    const reasons = [];
    
    if (tutor.expertise.includes(student.subject)) {
      reasons.push(`✅ Chuyên môn về ${student.subject}`);
    }
    
    if (tutor.rating >= 4.5) {
      reasons.push(`⭐ Đánh giá cao (${tutor.rating}/5.0)`);
    }
    
    if (tutor.yearsExperience >= 3) {
      reasons.push(`📚 Kinh nghiệm ${tutor.yearsExperience} năm`);
    }
    
    return reasons;
  }
}

// Types
interface StudentProfile {
  subject: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  learningStyle: 'Visual' | 'Auditory' | 'Kinesthetic';
  weaknesses: string[];
  goals: string[];
}

interface RankedTutor {
  id: number;
  user: any;
  matchScore: number;        // 0.0 - 1.0
  matchReasons: string[];    // ["✅ Chuyên môn về Calculus", ...]
}
```

#### **Option B: PostgreSQL pgvector (Nếu muốn xịn hơn)**

```sql
-- Enable pgvector extension
CREATE EXTENSION vector;

-- Add vector column
ALTER TABLE tutor_profiles 
ADD COLUMN expertise_vector vector(384);

-- Index for fast similarity search
CREATE INDEX ON tutor_profiles 
USING ivfflat (expertise_vector vector_cosine_ops);
```

```typescript
// Sử dụng trong service
async matchWithPgVector(studentVector: number[]): Promise<RankedTutor[]> {
  const sql = `
    SELECT *, 
           1 - (expertise_vector <=> $1::vector) as similarity
    FROM tutor_profiles
    WHERE available = true
    ORDER BY similarity DESC
    LIMIT 10
  `;
  
  return this.prisma.$queryRawUnsafe(sql, JSON.stringify(studentVector));
}
```

#### 📊 Data Requirements

**Training Data:**
```sql
-- Historical bookings với outcomes
SELECT 
  student_id,
  tutor_id,
  subject,
  rating,
  completed,
  student_level,
  tutor_specialization
FROM meetings
WHERE status = 'COMPLETED' AND rating IS NOT NULL;

-- Features cần thu thập
- Student: major, year, GPA, subjects_interested, learning_style
- Tutor: expertise[], years_experience, avg_rating, subjects_taught[]
- Interaction: booking_success_rate, avg_session_duration, rating_distribution
```

### 🏗️ Architecture (Đơn Giản - Không Dùng Microservice)

```
┌─────────────────────────┐
│   Frontend (React)      │
│  "Tìm tutor phù hợp"    │
└───────────┬─────────────┘
            │ GET /api/tutors/match?subject=Calculus&level=Beginner
            ↓
┌─────────────────────────┐
│   NestJS API Server     │
│                         │
│  ┌──────────────────┐   │
│  │ TutorsController │   │
│  └────────┬─────────┘   │
│           │             │
│  ┌────────▼──────────┐  │
│  │ AIMatchingService │  │ ← Node.js 'natural' library
│  │  (Content-Based)  │  │   Cosine Similarity
│  └────────┬──────────┘  │
│           │             │
│  ┌────────▼──────────┐  │
│  │  PrismaService    │  │
│  └────────┬──────────┘  │
└───────────┼─────────────┘
            │
            ↓
┌─────────────────────────┐
│   PostgreSQL Database   │
│  - tutors               │
│  - expertise[]          │
│  - ratings              │
└─────────────────────────┘
```

**Ưu điểm**:
- ✅ Tất cả trong 1 NestJS project
- ✅ Không cần deploy thêm Python service
- ✅ Dễ debug và maintain

### 🚀 Implementation Steps (1-2 Tuần)

#### **Tuần 1: Setup & Basic Logic**

**Day 1-2: Database Schema**
```sql
-- Thêm fields cần thiết cho matching
ALTER TABLE tutor_profiles
ADD COLUMN expertise TEXT[],
ADD COLUMN teaching_style VARCHAR(50),
ADD COLUMN specialization VARCHAR(100);

-- Sample data
UPDATE tutor_profiles SET 
  expertise = ARRAY['Calculus', 'Linear Algebra', 'Statistics'],
  teaching_style = 'Interactive',
  specialization = 'Mathematics'
WHERE id = 1;
```

**Day 3-4: Install Dependencies & Create Service**
```bash
npm install natural
```

Create `src/ai/ai-matching.service.ts` với code ở trên.

**Day 5-7: API Endpoint**
```typescript
// src/tutors/tutors.controller.ts
@Get('match')
async matchTutors(@Query() query: MatchTutorDto) {
  return this.aiMatchingService.matchTutors({
    subject: query.subject,
    level: query.level || 'Intermediate',
    learningStyle: query.learningStyle || 'Visual',
    weaknesses: query.weaknesses?.split(',') || [],
    goals: query.goals?.split(',') || [],
  });
}
```

#### **Tuần 2: Testing & UI Integration**

**Day 8-10: Test với Postman**
```bash
GET /api/tutors/match?subject=Calculus&level=Beginner
# Response: Top 10 tutors với match scores
```

**Day 11-14: Frontend Integration**
```jsx
// React component
function TutorMatchingPage() {
  const [matches, setMatches] = useState([]);
  
  const findMatches = async () => {
    const res = await fetch('/api/tutors/match?subject=Calculus');
    setMatches(await res.json());
  };
  
  return (
    <div>
      {matches.map(tutor => (
        <TutorCard 
          tutor={tutor}
          matchScore={tutor.matchScore}
          reasons={tutor.matchReasons}
        />
      ))}
    </div>
  );
}
```

#### 📈 Success Metrics

- **Booking Success Rate**: Increase từ 60% → 80%+
- **Student Satisfaction**: Rating > 4.5/5 cho recommended tutors
- **Response Time**: < 500ms cho recommendation API
- **Model Accuracy**: Precision@5 > 70%

---

---

## 2️⃣ CHATBOT & SEMANTIC SEARCH (🥈 Ưu Tiên Cao)

### 📖 Tại Sao Cần Tính Năng Này?

**Vấn đề giải quyết**:
- ❓ Student mới không biết quy trình đăng ký/đặt lịch
- ❓ Tìm kiếm theo từ khóa chính xác không hiệu quả (phải gõ đúng "Giải tích 1", không search được "mất gốc toán")
- ❓ Support manual tốn thời gian

**Giá trị demo**:
- ✅ Giao diện chatbot trực quan, hiện đại
- ✅ Dễ triển khai (chỉ gọi API)
- ✅ UX cải thiện rõ rệt

### 🛠️ Tech Stack: OpenAI API hoặc Google Gemini

**Chi phí**:
- OpenAI GPT-3.5-turbo: $0.0005/1K tokens (~$10-20/tháng cho demo)
- Google Gemini: FREE (có giới hạn request)

**Khuyến nghị**: Dùng **Google Gemini** cho đồ án (miễn phí)

### 🤖 2 Tính Năng Chính

#### **A. Chatbot Q&A - Trả Lời Câu Hỏi Thường Gặp**

**Use Cases**:
```
Student: "Làm sao để đặt lịch với tutor?"
Bot: "Bạn vào trang Tìm Tutor → Chọn tutor → Chọn slot thời gian 
     → Click Đặt lịch. Tutor sẽ xác nhận trong vòng 24h."

Student: "Hủy lịch thế nào?"
Bot: "Vào Lịch Của Tôi → Chọn meeting → Click Hủy. 
     Lưu ý: Hủy trước 24h để không bị trừ điểm."

Student: "Tìm tutor giỏi về machine learning"
Bot: [Gọi API matching] "Tôi tìm thấy 3 tutors phù hợp: ..."
```

#### **B. Semantic Search - Tìm Kiếm Ngữ Nghĩa**

**Khác biệt với search thường**:
```
Search thường:
  Input: "Giải tích 1"
  Output: Chỉ tìm tutors có từ "Giải tích 1" chính xác

Semantic Search:
  Input: "Tôi mất gốc toán, cần người dạy lại từ đầu"
  Output: 
    - AI hiểu: Student cần tutor giỏi nền tảng, kiên nhẫn
    - Tìm tutors: 
      ✅ Chuyên "Calculus Basics"
      ✅ Rating cao về "giải thích dễ hiểu"
      ✅ Kinh nghiệm dạy beginners
```

### 💻 Implementation Code

#### **Setup: Install Google Generative AI SDK**

```bash
npm install @google/generative-ai
```

#### **Backend Service**

```typescript
// src/ai/chatbot.service.ts
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Chatbot Q&A với RAG (Retrieval-Augmented Generation)
   */
  async chat(userMessage: string): Promise<string> {
    // 1. Lấy context từ FAQs (trong database)
    const faqs = await this.prisma.fAQ.findMany({
      where: {
        question: { contains: userMessage, mode: 'insensitive' },
      },
      take: 3,
    });

    // 2. Xây dựng prompt với context
    const context = faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
    
    const prompt = `
Bạn là trợ lý ảo của hệ thống Tutor Support System.
Hãy trả lời câu hỏi của sinh viên dựa trên thông tin sau:

${context}

Câu hỏi của sinh viên: ${userMessage}

Trả lời:`;

    // 3. Gọi Gemini API
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  }

  /**
   * Semantic Search - Tìm tutors theo mô tả tự nhiên
   */
  async semanticSearch(query: string): Promise<any[]> {
    // 1. Dùng AI để extract ý định
    const intent = await this.extractIntent(query);
    
    // 2. Query database với intent
    const tutors = await this.prisma.tutorProfile.findMany({
      where: {
        specialization: { in: intent.subjects },
        rating: { gte: intent.minRating || 0 },
        yearsExperience: { gte: intent.minExperience || 0 },
      },
      include: { user: true },
      take: 5,
    });
    
    return tutors;
  }

  /**
   * Extract intent từ natural language query
   */
  private async extractIntent(query: string): Promise<SearchIntent> {
    const prompt = `
Phân tích câu sau và trích xuất thông tin tìm kiếm tutor:
"${query}"

Trả về JSON format:
{
  "subjects": ["môn học"],
  "level": "Beginner/Intermediate/Advanced",
  "minRating": 0-5,
  "minExperience": 0-10,
  "keywords": ["từ khóa quan trọng"]
}`;

    const result = await this.model.generateContent(prompt);
    const text = await result.response.text();
    
    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { subjects: [], level: 'Intermediate' };
  }
}

interface SearchIntent {
  subjects: string[];
  level?: string;
  minRating?: number;
  minExperience?: number;
  keywords?: string[];
}
```

#### **API Endpoints**

```typescript
// src/ai/ai.controller.ts
@Controller('ai')
export class AIController {
  constructor(private chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Body() dto: { message: string }) {
    return {
      response: await this.chatbotService.chat(dto.message),
    };
  }

  @Get('search')
  async semanticSearch(@Query('q') query: string) {
    return this.chatbotService.semanticSearch(query);
  }
}
```

#### **Frontend Chatbot Widget**

```jsx
// components/Chatbot.tsx
import { useState } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages([...messages, { role: 'user', text: input }]);
    
    // Call API
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    
    const data = await res.json();
    
    // Add bot response
    setMessages([...messages, 
      { role: 'user', text: input },
      { role: 'bot', text: data.response }
    ]);
    
    setInput('');
  };

  return (
    <div className="chatbot-widget">
      {/* Floating button */}
      <button onClick={() => setIsOpen(!isOpen)} className="chat-button">
        💬
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Hỏi gì đó..."
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### ⏱️ Implementation Timeline

**Week 3: Chatbot & Semantic Search**

**Day 1-2: Setup & Basic Chatbot**
```bash
# Install dependencies
npm install @google/generative-ai

# Add to .env
GEMINI_API_KEY=your_api_key_here
```

**Day 3-4: RAG Implementation**
- Create FAQ database seeding
- Implement context retrieval logic
- Test prompt engineering with different contexts

**Day 5-6: Semantic Search**
- Add intent extraction prompt
- Implement tutors filtering based on AI intent
- Test with various natural language queries

**Day 7: Frontend Integration**
- Create chatbot widget component
- Add semantic search to tutor search page
- Deploy and test end-to-end

#### 🎯 Expected Outcomes

✅ **Chatbot:**
- Trả lời 80%+ câu hỏi FAQ tự động
- Giảm tải cho support team
- Cải thiện UX khi tìm thông tin

✅ **Semantic Search:**
- Sinh viên tìm tutor dễ dàng hơn (natural language)
- Tăng conversion rate (từ search → booking)
- Demo ấn tượng với stakeholders

---

## 🥉 **PRIORITY 3: AUTO-GENERATED CONTENT (1 tuần)**
*Tự Động Tạo Nội Dung Hỗ Trợ Học Tập*

**Mức độ ưu tiên:** ⭐⭐⭐  
**Thời gian:** 1 tuần  
**Chi phí:** $10-20/tháng (OpenAI API)

### ❓ Tại Sao Cần Tính Năng Này?

**Vấn đề:**
- Tutors mất nhiều thời gian tạo tài liệu học tập
- Sinh viên cần tóm tắt nhanh sau mỗi buổi học
- Quiz/bài tập khó tạo và mất thời gian

**Giá trị:**
- **Tiết kiệm thời gian:** Tutors chỉ cần review thay vì tạo từ đầu
- **Cải thiện chất lượng:** AI tạo quiz đa dạng và có cấu trúc
- **Demo ấn tượng:** Tự động tạo nội dung là tính năng "wow" cho presentation

### 🎯 Use Cases

**A. Auto Summary (Tóm Tắt Buổi Học)**

```
INPUT (Tutor nhập):
"Hôm nay chúng ta học về React Hooks. Hooks cho phép sử dụng state và lifecycle trong function components. Các hooks cơ bản: useState, useEffect, useContext. Bài tập: Xây dựng counter app với useState."

OUTPUT (AI generated):
📝 TÓM TẮT BUỔI HỌC
---
🎯 Chủ đề: React Hooks
✅ Nội dung đã học:
- Định nghĩa và mục đích của Hooks
- useState: Quản lý state trong function components
- useEffect: Xử lý side effects
- useContext: Chia sẻ data giữa components

💡 Key Takeaways:
1. Hooks thay thế class components
2. useState cho state management đơn giản
3. useEffect chạy sau mỗi render

📚 Bài tập về nhà:
- Xây dựng Counter App với useState
- Đọc: React Hooks documentation
```

**B. Auto Quiz Generation (Tạo Quiz Tự Động)**

```
INPUT (Từ tài liệu):
"Binary Search Tree (BST) là cây nhị phân có tính chất: node con trái < node cha < node con phải. Độ phức tạp tìm kiếm: O(log n) trong trường hợp cân bằng, O(n) trong trường hợp xấu nhất."

OUTPUT (AI generated):
📋 QUIZ - BINARY SEARCH TREE
---
1️⃣ BST là gì?
A) Cây có tất cả nodes con trái nhỏ hơn cha
B) Cây nhị phân với node trái < cha < node phải ✅
C) Cây có độ cao log(n)
D) Cây có tất cả leaves ở cùng level

2️⃣ Độ phức tạp tìm kiếm trong BST cân bằng?
A) O(n)
B) O(log n) ✅
C) O(1)
D) O(n log n)

3️⃣ (Tự luận) Khi nào BST có độ phức tạp O(n)?
💡 Gợi ý: Suy nghĩ về trường hợp cây mất cân bằng
```

### 💻 Implementation Code

#### **Backend Service**

```typescript
// src/ai/content-generator.service.ts
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

@Injectable()
export class ContentGeneratorService {
  private genAI: GoogleGenerativeAI;
  private openai: OpenAI;

  constructor() {
    // Option 1: Google Gemini (FREE)
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Option 2: OpenAI (Paid, but better quality)
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Tạo tóm tắt buổi học từ notes của tutor
   */
  async generateSummary(lessonNotes: string, subject: string): Promise<string> {
    const prompt = `
Bạn là trợ lý giáo dục. Hãy tóm tắt buổi học sau theo format:

📝 TÓM TẮT BUỔI HỌC
---
🎯 Chủ đề: [Tên chủ đề]
✅ Nội dung đã học:
- [Điểm 1]
- [Điểm 2]
- [Điểm 3]

💡 Key Takeaways:
1. [Điểm quan trọng 1]
2. [Điểm quan trọng 2]
3. [Điểm quan trọng 3]

📚 Bài tập về nhà:
- [Bài tập 1]
- [Tài liệu đọc thêm]

Notes từ tutor:
${lessonNotes}

Môn học: ${subject}
`;

    // Option 1: Gemini
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    return result.response.text();

    // Option 2: OpenAI (uncomment nếu dùng)
    // const completion = await this.openai.chat.completions.create({
    //   model: 'gpt-3.5-turbo',
    //   messages: [{ role: 'user', content: prompt }],
    // });
    // return completion.choices[0].message.content;
  }

  /**
   * Tạo quiz từ tài liệu học tập
   */
  async generateQuiz(
    content: string,
    subject: string,
    numQuestions: number = 5,
  ): Promise<Quiz> {
    const prompt = `
Tạo ${numQuestions} câu hỏi trắc nghiệm từ nội dung sau.
Format JSON:
{
  "questions": [
    {
      "question": "Câu hỏi",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Giải thích"
    }
  ]
}

Nội dung:
${content}

Môn học: ${subject}
`;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to generate quiz');
  }

  /**
   * Tạo flashcards từ tài liệu
   */
  async generateFlashcards(content: string, numCards: number = 10): Promise<Flashcard[]> {
    const prompt = `
Tạo ${numCards} flashcards từ nội dung sau.
Format JSON:
{
  "flashcards": [
    {
      "front": "Câu hỏi/Thuật ngữ",
      "back": "Trả lời/Định nghĩa",
      "hint": "Gợi ý (optional)"
    }
  ]
}

Nội dung:
${content}
`;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return data.flashcards;
    }
    
    return [];
  }
}

interface Quiz {
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
  hint?: string;
}
```

#### **API Endpoints**

```typescript
// src/ai/ai.controller.ts
@Controller('ai')
export class AIController {
  constructor(private contentGenerator: ContentGeneratorService) {}

  @Post('generate-summary')
  @UseGuards(JwtAuthGuard)
  async generateSummary(@Body() dto: { lessonNotes: string; subject: string }) {
    return {
      summary: await this.contentGenerator.generateSummary(
        dto.lessonNotes,
        dto.subject,
      ),
    };
  }

  @Post('generate-quiz')
  @UseGuards(JwtAuthGuard)
  async generateQuiz(
    @Body() dto: { content: string; subject: string; numQuestions?: number },
  ) {
    return this.contentGenerator.generateQuiz(
      dto.content,
      dto.subject,
      dto.numQuestions,
    );
  }

  @Post('generate-flashcards')
  @UseGuards(JwtAuthGuard)
  async generateFlashcards(@Body() dto: { content: string; numCards?: number }) {
    return {
      flashcards: await this.contentGenerator.generateFlashcards(
        dto.content,
        dto.numCards,
      ),
    };
  }
}
```

#### **Frontend Integration**

```jsx
// pages/lessons/[id]/summary.tsx
import { useState } from 'react';

function LessonSummaryPage() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    
    const res = await fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonNotes: notes,
        subject: 'React',
      }),
    });
    
    const data = await res.json();
    setSummary(data.summary);
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Tạo Tóm Tắt Buổi Học</h1>
      
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Nhập notes của buổi học..."
        rows={10}
        className="w-full border rounded p-4"
      />
      
      <button 
        onClick={generateSummary}
        disabled={loading || !notes}
        className="btn btn-primary mt-4"
      >
        {loading ? '⏳ Đang tạo...' : '✨ Tạo Tóm Tắt'}
      </button>
      
      {summary && (
        <div className="mt-6 bg-gray-50 p-6 rounded">
          <h2>📝 Tóm Tắt</h2>
          <pre className="whitespace-pre-wrap">{summary}</pre>
          
          <div className="mt-4 flex gap-2">
            <button className="btn btn-secondary">📋 Copy</button>
            <button className="btn btn-secondary">💾 Lưu</button>
            <button className="btn btn-secondary">📧 Gửi cho sinh viên</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

```jsx
// pages/materials/[id]/quiz.tsx
function QuizGeneratorPage() {
  const [content, setContent] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    
    const res = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        subject: 'Data Structures',
        numQuestions: 5,
      }),
    });
    
    const data = await res.json();
    setQuiz(data);
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Tạo Quiz Tự Động</h1>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste nội dung bài học..."
        rows={10}
        className="w-full border rounded p-4"
      />
      
      <button 
        onClick={generateQuiz}
        disabled={loading || !content}
        className="btn btn-primary mt-4"
      >
        {loading ? '⏳ Đang tạo quiz...' : '✨ Tạo Quiz (5 câu)'}
      </button>
      
      {quiz && (
        <div className="mt-6">
          <h2>📋 Quiz Generated</h2>
          
          {quiz.questions.map((q, i) => (
            <div key={i} className="bg-white p-4 rounded shadow mb-4">
              <p className="font-bold">{i + 1}. {q.question}</p>
              
              <div className="mt-2 space-y-1">
                {q.options.map((opt, j) => (
                  <div key={j} className={q.correctAnswer === j ? 'text-green-600' : ''}>
                    {String.fromCharCode(65 + j)}) {opt}
                    {q.correctAnswer === j && ' ✅'}
                  </div>
                ))}
              </div>
              
              <p className="mt-2 text-sm text-gray-600">
                💡 {q.explanation}
              </p>
            </div>
          ))}
          
          <div className="mt-4 flex gap-2">
            <button className="btn btn-secondary">💾 Lưu Quiz</button>
            <button className="btn btn-secondary">📧 Gửi cho sinh viên</button>
            <button className="btn btn-secondary">🔄 Tạo lại</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🛠️ TECH STACK SUMMARY

### Backend
- **NestJS**: API framework
- **Prisma**: ORM cho PostgreSQL
- **Node.js `natural`**: NLP library cho AI Matching
- **@google/generative-ai**: Google Gemini SDK
- **openai**: OpenAI SDK (optional)

### Frontend
- **React/Next.js**: UI framework
- **TailwindCSS**: Styling
- **Socket.IO Client**: WebSocket notifications

### Database
- **PostgreSQL**: Main database
- **pgvector**: Vector similarity search (optional cho semantic search)

### AI Services
- **Google Gemini** (FREE): Chatbot, content generation

### DevOps
- **Git**: Version control
- **Postman**: API testing
- **Vercel/Railway**: Deployment

---

## 🚧 CHALLENGES & CONSIDERATIONS

### 1. **Data Privacy**
⚠️ **Issue:** AI models có thể learn từ user data

✅ **Solution:**
- Không gửi sensitive data (passwords, personal info) lên AI APIs
- Add disclaimer: "AI-generated content, please review before using"
- Tuân thủ GDPR/local privacy laws

### 2. **Model Bias**
⚠️ **Issue:** AI có thể biased (ví dụ: prefer certain tutors)

✅ **Solution:**
- Test với diverse test cases
- Add manual review step for critical decisions
- Allow users to report biased results

### 3. **API Rate Limits**
⚠️ **Issue:** Free tiers có giới hạn requests

✅ **Solution:**
- Implement caching (Redis hoặc in-memory)
- Rate limiting per user (max 10 AI requests/day)
- Fallback to rule-based logic nếu API fails

### 4. **Explainability**
⚠️ **Issue:** Users không hiểu tại sao AI recommend X

✅ **Solution:**
- Add "Why this match?" explanation (đã implement trong Priority 1)
- Show matching factors: Subject (40%), Experience (30%), Rating (20%), Availability (10%)
- Allow users to adjust weights

### 5. **Cost Management**
⚠️ **Issue:** API costs có thể tăng nhanh khi scale

---

## 📚 RESOURCES & LEARNING

### Documentation
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Node.js Natural Library](https://github.com/NaturalNode/natural)
- [PostgreSQL pgvector](https://github.com/pgvector/pgvector)

### Tutorials
- **AI Matching:** [Content-Based Filtering with TF-IDF](https://towardsdatascience.com/content-based-filtering-with-tfidf)
- **RAG Pattern:** [Retrieval-Augmented Generation Guide](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- **Prompt Engineering:** [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)

### Example Projects
- [Chatbot với Gemini](https://github.com/google-gemini/gemini-api-quickstart)
- [Quiz Generator](https://github.com/openai/openai-cookbook/blob/main/examples/Quiz_generator.ipynb)
- [Semantic Search với pgvector](https://github.com/pgvector/pgvector-node)

---

## 🎉 CONCLUSION

Với 3 tính năng AI được prioritize này, TutorSupportSystem sẽ:

1. ✅ **Differentiate** so với các hệ thống khác (AI Matching là unique selling point)
2. ✅ **Improve UX** đáng kể (Chatbot giúp users tìm info nhanh hơn)
3. ✅ **Save time** cho tutors (Auto-generated content)
4. ✅ **Demo impressive** cho stakeholders và potential users
5. ✅ **Achievable** trong 3-4 tuần với existing tech stack

**Key Success Factors:**
- ✅ **Practical:** Không cần GPU, Big Data, hay Python microservices
- ✅ **Maintainable:** All code trong 1 NestJS monolith
- ✅ **Scalable:** Có thể nâng cấp sau (thêm collaborative filtering, deep learning, etc.)

---
