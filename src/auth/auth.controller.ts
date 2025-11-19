// // src/auth/auth.controller.ts
// import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { ApiTags } from '@nestjs/swagger';
// import { LoginDto } from './dto/login.dto';

// @ApiTags('1. Auth') // Gom nhóm API trong Swagger
// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('login')
//   login(@Body(ValidationPipe) loginDto: LoginDto) {
//     // Chỉ cần gửi email để mô phỏng SSO (UC_GENERAL_01)
//     return this.authService.login(loginDto);
//   }
// }

// src/auth/auth.controller.ts
import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('1. Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new account' })
  @ApiResponse({ status: 201, description: 'Success' })
  register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with Email & Password' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body(ValidationPipe) dto: LoginDto) {
    return this.authService.login(dto);
  }
}