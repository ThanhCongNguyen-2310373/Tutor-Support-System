import { IsEmail, IsString, IsEnum, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email người dùng',
    example: 'newuser@hcmut.edu.vn',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Họ tên đầy đủ',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'MSSV (sinh viên) hoặc MSCB (cán bộ)',
    example: '2310373',
    required: false,
  })
  @IsOptional()
  @IsString()
  mssv?: string;

   @ApiProperty({
    description: 'Khoa hoặc Phòng ban',
    example: 'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH',
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: Role,
    example: Role.STUDENT,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'Chuyên môn (dành cho tutor)',
    example: ['Toán', 'Lý'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  expertise?: string[];
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Họ tên đầy đủ',
    example: 'Nguyễn Văn B',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: Role,
    example: Role.TUTOR,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'Chuyên môn (dành cho tutor)',
    example: ['Toán', 'Hóa'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  expertise?: string[];

  @ApiProperty({
    description: 'Trạng thái available (dành cho tutor)',
    example: true,
    required: false,
  })
  @IsOptional()
  available?: boolean;
}
