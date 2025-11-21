import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional,IsNumber,Min } from 'class-validator';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Thời gian bắt đầu (ISO 8601)',
    example: '2025-11-10T09:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Thời gian kết thúc (ISO 8601)',
    example: '2025-11-10T11:00:00Z',
  })
  @IsDateString()
  endTime: string;

  // NEW: Số lượng sinh viên tối đa (Mặc định 1 nếu không gửi)
  @ApiProperty({ description: 'Số lượng sinh viên tối đa', example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStudents?: number;
}
