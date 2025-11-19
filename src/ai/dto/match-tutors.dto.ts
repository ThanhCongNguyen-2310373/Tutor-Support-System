import { IsArray, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MatchTutorsDto {
  @ApiProperty({
    description: 'Danh sách môn học cần tìm tutor',
    example: ['Giải Tích 1', 'Đại Số Tuyến Tính'],
    type: [String],
  })
  @IsArray()
  subjects: string[];

  @ApiProperty({
    description: 'Kinh nghiệm mong muốn (năm)',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preferredExperience?: number;

  @ApiProperty({
    description: 'Đánh giá tối thiểu (0-5)',
    example: 4.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiProperty({
    description: 'Học phí tối đa (VND/giờ)',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxHourlyRate?: number;

  @ApiProperty({
    description: 'Thời gian rảnh mong muốn',
    example: 'weekdays',
    required: false,
  })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiProperty({
    description: 'Số lượng tutors trả về',
    example: 5,
    default: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number;
}
