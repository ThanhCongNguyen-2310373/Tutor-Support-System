import { IsString, IsArray, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({
    description: 'Câu hỏi của user',
    example: 'Làm sao để đặt lịch với tutor?',
  })
  @IsString()
  @MaxLength(500)
  message: string;

  @ApiProperty({
    description: 'Lịch sử hội thoại (optional, để chatbot hiểu context)',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['user', 'assistant'] },
        content: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
    example: [
      {
        role: 'user',
        content: 'Tutor có thể hủy lịch không?',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        role: 'assistant',
        content: 'Tutor chỉ có thể từ chối lịch hẹn khi còn ở trạng thái PENDING...',
        timestamp: '2024-01-15T10:30:05Z',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export class SearchFAQDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    example: 'đặt lịch tutor',
  })
  @IsString()
  @MaxLength(200)
  query: string;

  @ApiProperty({
    description: 'Category (optional)',
    required: false,
    enum: ['booking', 'tutor', 'schedule', 'payment', 'complaint', 'general'],
    example: 'booking',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
