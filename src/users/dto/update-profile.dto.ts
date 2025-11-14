import { IsOptional, IsString, IsArray, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn An',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự' })
  fullName?: string;

  @ApiProperty({
    description: 'Tiểu sử cá nhân (dành cho Tutor)',
    example: 'Chuyên môn: Lập trình hướng đối tượng, Cấu trúc dữ liệu',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Danh sách chuyên môn (dành cho Tutor)',
    example: ['Java', 'C++', 'Python', 'Data Structures'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  expertise?: string[];
}
