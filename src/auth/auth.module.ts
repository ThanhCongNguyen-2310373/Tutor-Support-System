// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExternalModule } from '../external/external.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    ExternalModule, // Import để sử dụng HCMUT_SSO và DATACORE services
    EmailModule, // Import để gửi welcome email
    // Đăng ký JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Lấy secret key từ .env
        secret: config.get<string>('JWT_SECRET') || 'defaultSecretKey', 
        signOptions: { expiresIn: '1d' }, // Token hết hạn sau 1 ngày
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Thêm JwtStrategy
})
export class AuthModule {}
