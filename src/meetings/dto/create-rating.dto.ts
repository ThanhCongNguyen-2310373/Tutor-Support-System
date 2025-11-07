import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    description: 'Điểm đánh giá từ 1-5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({
    description: 'Nhận xét của sinh viên',
    example: 'Tutor rất nhiệt tình và giải thích dễ hiểu',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
