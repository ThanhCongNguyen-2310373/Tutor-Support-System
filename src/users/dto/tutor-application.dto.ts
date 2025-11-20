// src/users/dto/apply-tutor.dto.ts
import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber,Min,Max } from 'class-validator';

export class ApplyTutorDto {
  @ApiProperty({
    description: 'Tiểu sử / Giới thiệu bản thân',
    example: 'Chuyên môn: Lập trình hướng đối tượng, Cấu trúc dữ liệu. Đã có kinh nghiệm trợ giảng.',
  })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiProperty({
    description: 'Danh sách các môn chuyên môn',
    example: ['Java', 'C++', 'Python', 'Data Structures'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  expertise: string[];

  //THÊM TRƯỜNG GPA
  @ApiProperty({
    description: 'Điểm trung bình tích lũy (GPA)',
    example: 3.6,
    minimum: 0,
    maximum: 4, // Hoặc 10 tùy theo thang điểm trường bạn
  })
  @IsNumber()
  @Min(0)
  @Max(4) 
  gpa: number;
}