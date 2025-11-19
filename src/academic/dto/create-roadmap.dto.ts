import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoadmapDto {
  @ApiProperty({ 
    example: 'Lộ trình học Giải Tích 1',
    description: 'Tiêu đề lộ trình học' 
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    example: 'Lộ trình gồm 12 chương: Giới hạn, Đạo hàm, Tích phân...',
    description: 'Mô tả chi tiết lộ trình',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: 'https://library.hcmut.edu.vn/document/calculus-1-syllabus.pdf',
    description: 'Link tài liệu từ thư viện HCMUT',
    required: false
  })
  @IsString()
  @IsOptional()
  documentUrl?: string;
}
