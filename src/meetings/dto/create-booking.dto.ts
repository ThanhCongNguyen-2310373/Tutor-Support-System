import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID của tutor',
    example: 2,
  })
  @IsNumber()
  tutorId: number;

  @ApiProperty({
    description: 'ID của availability slot',
    example: 5,
  })
  @IsNumber()
  slotId: number;

  @ApiProperty({
    description: 'Chủ đề buổi hẹn',
    example: 'Tư vấn môn Toán Cao Cấp 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  topic?: string;
}
