// src/users/dto/apply-tutor.dto.ts
import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}