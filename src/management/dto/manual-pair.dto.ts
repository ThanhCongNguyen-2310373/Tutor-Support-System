import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManualPairDto {
  @ApiProperty({
    description: 'ID của student',
    example: 3,
  })
  @IsNumber()
  studentId: number;

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
}
