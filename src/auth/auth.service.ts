// src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/prisma.service';
import { HcmutSsoService } from '../external/hcmut-sso.service';
import { HcmutDatacoreService } from '../external/hcmut-datacore.service';
import { LoginDto } from './dto/login.dto';

/**
 * Auth Service với tích hợp HCMUT_SSO và DATACORE
 * 
 * Flow đăng nhập mới:
 * 1. User gửi email (@hcmut.edu.vn)
 * 2. Backend gọi HCMUT_SSO.authenticateUser(email) → Xác thực qua SSO
 * 3. Nếu SSO thành công, gọi HCMUT_DATACORE.syncUserData(userId) → Lấy profile đầy đủ
 * 4. Cập nhật/Tạo User trong local database
 * 5. Ký JWT token với user info
 * 6. Trả về access_token cho client
 * 
 * JWT token được dùng cho các request tiếp theo (không cần gọi SSO mỗi lần)
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private ssoService: HcmutSsoService,
    private datacoreService: HcmutDatacoreService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    try {
      // ========== BƯỚC 1: XÁC THỰC QUA HCMUT_SSO ==========
      this.logger.log(`🔐 Step 1: Authenticating ${email} via HCMUT_SSO`);
      const ssoResponse = await this.ssoService.authenticateUser(email);

      if (!ssoResponse.success) {
        throw new UnauthorizedException('SSO authentication failed');
      }

      // ========== BƯỚC 2: ĐỒNG BỘ DỮ LIỆU TỪ HCMUT_DATACORE ==========
      this.logger.log(`🔄 Step 2: Syncing user data from HCMUT_DATACORE`);
      const datacoreUser = await this.datacoreService.syncUserData(ssoResponse.userId);

      // ========== BƯỚC 3: CẬP NHẬT/TẠO USER TRONG DATABASE ==========
      this.logger.log(`💾 Step 3: Updating/Creating user in local database`);
      let user = await this.prisma.user.findUnique({
        where: { email: datacoreUser.email },
      });

      if (!user) {
        // Tạo user mới với data từ DATACORE
        user = await this.prisma.user.create({
          data: {
            email: datacoreUser.email,
            fullName: datacoreUser.fullName,
            mssv: datacoreUser.userId,
            role: datacoreUser.role,
          },
        });
        this.logger.log(`✅ Created new user: ${user.email} (${user.role})`);
      } else {
        // Cập nhật thông tin nếu đã tồn tại (sync lại từ DATACORE)
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            fullName: datacoreUser.fullName,
            role: datacoreUser.role,
          },
        });
        this.logger.log(`✅ Updated existing user: ${user.email}`);
      }

      // ========== BƯỚC 4: KÝ JWT TOKEN ==========
      this.logger.log(`🔑 Step 4: Generating JWT token`);
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);

      // ========== BƯỚC 5: TRẢ VỀ RESPONSE ==========
      this.logger.log(`✅ Login successful for ${user.email}`);
      return {
        message: 'Login successful via HCMUT_SSO',
        access_token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          mssv: user.mssv,
        },
        ssoInfo: {
          authenticatedVia: 'HCMUT_SSO',
          dataSyncedFrom: 'HCMUT_DATACORE',
        },
      };
    } catch (error) {
      this.logger.error(`❌ Login failed for ${email}:`, error.message);
      throw new UnauthorizedException('Login failed: ' + error.message);
    }
  }
}
