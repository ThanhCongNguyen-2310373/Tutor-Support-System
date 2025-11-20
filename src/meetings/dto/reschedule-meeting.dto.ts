import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleMeetingDto {
  @ApiProperty({ description: 'ID của slot mới muốn chuyển sang', example: 6 })
  @IsNumber()
  newSlotId: number;

  @ApiProperty({ description: 'Lý do đổi lịch', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}