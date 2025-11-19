import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AIMatchingService } from './ai-matching.service';
import { ChatbotService } from './chatbot.service';
import { MatchTutorsDto } from './dto/match-tutors.dto';
import { ChatDto, SearchFAQDto } from './dto/chat.dto';

@ApiTags('AI Features')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AIController {
  constructor(
    private readonly aiMatchingService: AIMatchingService,
    private readonly chatbotService: ChatbotService,
  ) {}

  /**
   * POST /ai/match-tutors
   * Tìm tutors phù hợp dựa trên AI Matching
   * Chỉ STUDENT được dùng
   */
  @Post('match-tutors')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'AI Matching - Tìm tutors phù hợp với student' })
  @ApiResponse({ status: 200, description: 'Matching thành công' })
  @ApiResponse({ status: 400, description: 'Thiếu subjects hoặc dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền (chỉ STUDENT)' })
  async matchTutors(@Request() req, @Body() dto: MatchTutorsDto) {
    try {
      if (!dto.subjects || dto.subjects.length === 0) {
        throw new HttpException(
          'Subjects are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const matches = await this.aiMatchingService.matchTutors(
        req.user.id,
        {
          subjects: dto.subjects,
          preferredExperience: dto.preferredExperience,
          minRating: dto.minRating,
          maxHourlyRate: dto.maxHourlyRate,
          availability: dto.availability,
        },
        dto.limit || 5,
      );

      return {
        message: 'AI Matching completed',
        data: matches,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'AI Matching failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /ai/similar-tutors/:tutorId
   * Tìm tutors tương tự (for "Tutors like this" feature)
   * Tất cả users đều có thể xem
   */
  @Get('similar-tutors/:tutorId')
  @ApiOperation({ summary: 'Tìm tutors tương tự với tutor cho trước' })
  @ApiResponse({ status: 200, description: 'Tìm thành công' })
  @ApiResponse({ status: 400, description: 'Invalid tutor ID' })
  async getSimilarTutors(
    @Param('tutorId') tutorId: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const tutorIdNum = parseInt(tutorId, 10);
      if (isNaN(tutorIdNum)) {
        throw new HttpException('Invalid tutor ID', HttpStatus.BAD_REQUEST);
      }

      const limitNum = limit ? parseInt(limit, 10) : 3;

      const similarTutors =
        await this.aiMatchingService.getSimilarTutors(tutorIdNum, limitNum);

      return {
        message: 'Similar tutors found',
        data: similarTutors,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get similar tutors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /ai/chat
   * Chatbot - Trả lời câu hỏi của user với RAG pattern
   * Tất cả authenticated users đều có thể dùng
   */
  @Post('chat')
  @HttpCode(200)
  @ApiOperation({ summary: 'Chatbot - Hỏi đáp với AI assistant' })
  @ApiResponse({ status: 200, description: 'Trả lời thành công' })
  @ApiResponse({ status: 400, description: 'Message không hợp lệ' })
  async chat(@Request() req, @Body() dto: ChatDto) {
    try {
      if (!dto.message || dto.message.trim().length === 0) {
        throw new HttpException(
          'Message cannot be empty',
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await this.chatbotService.chat(
        req.user.id,
        dto.message,
        dto.conversationHistory || [],
      );

      return {
        message: 'Chat response generated',
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Chatbot failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /ai/faq-search
   * Semantic search - Tìm FAQs liên quan
   */
  @Post('faq-search')
  @HttpCode(200)
  @ApiOperation({ summary: 'Semantic search - Tìm FAQs theo từ khóa' })
  @ApiResponse({ status: 200, description: 'Tìm kiếm thành công' })
  async searchFAQ(@Body() dto: SearchFAQDto) {
    try {
      const keywords = dto.query.toLowerCase().split(' ').filter(w => w.length > 2);
      const faqs = await this.chatbotService.semanticSearch(keywords, dto.category);

      return {
        message: 'FAQ search completed',
        data: {
          query: dto.query,
          count: faqs.length,
          faqs: faqs,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'FAQ search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /ai/chatbot/health
   * Health check cho Gemini API
   */
  @Get('chatbot/health')
  @ApiOperation({ summary: 'Health check Gemini API' })
  @ApiResponse({ status: 200, description: 'API khỏe mạnh' })
  async chatbotHealth() {
    try {
      const health = await this.chatbotService.healthCheck();
      return {
        message: 'Chatbot health check',
        data: health,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Health check failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
