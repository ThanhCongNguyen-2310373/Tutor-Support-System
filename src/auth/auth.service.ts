// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    // 1. Logic "Tìm hoặc Tạo" (Mô phỏng SSO & DATACORE Sync)
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 2. Nếu chưa có, tạo mới (mô phỏng đồng bộ DATACORE)
      user = await this.prisma.user.create({
        data: {
          email: email,
          fullName: email.split('@')[0], // Tên tạm
          mssv: email.split('@')[0].toUpperCase(),
          role: 'STUDENT', // Mặc định là STUDENT
        },
      });
    }

    // 3. Tạo payload và ký JWT
    const payload = { 
      sub: user.id,
      email: user.email, 
      role: user.role 
    };
    
    return {
      message: 'Login successful (SSO Mock)',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    };
  }
}
