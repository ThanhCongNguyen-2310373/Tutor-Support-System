import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
