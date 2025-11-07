import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiProperty({
    description: 'ID của meeting liên quan (nếu có)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  meetingId?: number;

  @ApiProperty({
    description: 'Mô tả khiếu nại',
    example: 'Tutor không đến đúng giờ và không thông báo trước',
  })
  @IsString()
  description: string;
}

export class ResolveComplaintDto {
  @ApiProperty({
    description: 'Kết quả giải quyết',
    example: 'Đã liên hệ với tutor và nhắc nhở. Đã refund slot cho sinh viên.',
  })
  @IsString()
  resolution: string;
}
