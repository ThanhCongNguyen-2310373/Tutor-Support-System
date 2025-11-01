// src/auth/auth.controller.ts
import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('1. Auth') // Gom nhóm API trong Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    // Chỉ cần gửi email để mô phỏng SSO (UC_GENERAL_01)
    return this.authService.login(loginDto);
  }
}
