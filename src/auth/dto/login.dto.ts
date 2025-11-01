// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'hoang.nhan23@hcmut.edu.vn' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
