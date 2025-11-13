// src/external/hcmut-sso.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SSOAuthResponse } from './dto/sync-user.dto';
import { Role } from '@prisma/client';

/**
 * Service tích hợp với HCMUT_SSO để xác thực người dùng
 * 
 * HCMUT_SSO là dịch vụ xác thực tập trung của trường ĐHBK
 * Tất cả sinh viên, giảng viên, cán bộ phải đăng nhập qua SSO
 * 
 * Hiện tại: MOCK implementation để development
 * Production: Sẽ gọi API thật của HCMUT_SSO
 */
@Injectable()
export class HcmutSsoService {
  private readonly logger = new Logger(HcmutSsoService.name);
  private readonly ssoUrl: string;
  private readonly ssoApiKey: string;

  constructor(private configService: ConfigService) {
    this.ssoUrl = this.configService.get<string>('HCMUT_SSO_URL') || 'https://sso.hcmut.edu.vn/api';
    this.ssoApiKey = this.configService.get<string>('HCMUT_SSO_API_KEY') || 'mock_api_key';
  }

  /**
   * Xác thực người dùng qua HCMUT_SSO
   * 
   * Flow thật sẽ là:
   * 1. User redirect đến SSO login page
   * 2. User nhập MSSV/email + password vào SSO
   * 3. SSO redirect về với authorization code
   * 4. Backend đổi code lấy access token
   * 5. Backend lấy user info từ SSO
   * 
   * @param email - Email HCMUT (@hcmut.edu.vn)
   * @returns User info nếu xác thực thành công
   */
  async authenticateUser(email: string): Promise<SSOAuthResponse> {
    this.logger.log(`🔐 [HCMUT_SSO] Authenticating user: ${email}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.post(`${this.ssoUrl}/authenticate`, {
      //   email,
      //   apiKey: this.ssoApiKey
      // }).toPromise();
      // return response.data;

      // MOCK: Giả lập response từ SSO
      return this.mockSsoAuthenticate(email);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_SSO] Authentication failed for ${email}:`, error.message);
      throw new UnauthorizedException('SSO authentication failed');
    }
  }

  /**
   * Validate SSO token (cho middleware authentication)
   * 
   * @param token - SSO access token
   * @returns User info nếu token hợp lệ
   */
  async validateToken(token: string): Promise<SSOAuthResponse> {
    this.logger.log(`🔍 [HCMUT_SSO] Validating token`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.ssoUrl}/validate`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // }).toPromise();
      // return response.data;

      // MOCK: Giả lập validation
      return this.mockSsoValidate(token);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_SSO] Token validation failed:`, error.message);
      throw new UnauthorizedException('Invalid SSO token');
    }
  }

  /**
   * Logout khỏi SSO (single sign-out)
   * 
   * @param userId - MSSV/Mã CB
   */
  async logout(userId: string): Promise<void> {
    this.logger.log(`🚪 [HCMUT_SSO] Logging out user: ${userId}`);

    try {
      // TODO: Production - Gọi API thật
      // await this.httpService.post(`${this.ssoUrl}/logout`, {
      //   userId,
      //   apiKey: this.ssoApiKey
      // }).toPromise();

      // MOCK: Giả lập logout
      this.logger.log(`✅ [HCMUT_SSO] User logged out successfully`);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_SSO] Logout failed:`, error.message);
    }
  }

  // ==================== MOCK METHODS (Development only) ====================

  private mockSsoAuthenticate(email: string): SSOAuthResponse {
    // Validate email format
    if (!email.endsWith('@hcmut.edu.vn')) {
      throw new UnauthorizedException('Only @hcmut.edu.vn emails are allowed');
    }

    // Extract userId from email (giả sử email format: mssv@hcmut.edu.vn)
    const userId = email.split('@')[0].toUpperCase();

    // Determine role based on email pattern
    let role: Role = Role.STUDENT;
    if (userId.startsWith('GV')) {
      role = Role.TUTOR;
    } else if (userId.startsWith('ADMIN')) {
      role = Role.ADMIN;
    } else if (userId.startsWith('COORD')) {
      role = Role.COORDINATOR;
    }

    this.logger.log(`✅ [HCMUT_SSO MOCK] Authentication successful for ${email}`);

    return {
      success: true,
      userId,
      email,
      fullName: this.generateMockName(userId),
      role,
      message: 'SSO authentication successful (MOCK)'
    };
  }

  private mockSsoValidate(token: string): SSOAuthResponse {
    // MOCK: Giả sử token format: "sso_token_<userId>"
    const userId = token.replace('sso_token_', '');

    return {
      success: true,
      userId,
      email: `${userId.toLowerCase()}@hcmut.edu.vn`,
      fullName: this.generateMockName(userId),
      role: Role.STUDENT,
      message: 'Token validation successful (MOCK)'
    };
  }

  private generateMockName(userId: string): string {
    const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Võ', 'Đặng'];
    const midNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Anh', 'Hoàng'];
    const names = ['An', 'Bình', 'Cường', 'Dũng', 'Hải', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân'];

    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
    const randomMidName = midNames[Math.floor(Math.random() * midNames.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];

    return `${randomSurname} ${randomMidName} ${randomName}`;
  }

  /**
   * Health check - Kiểm tra SSO service có hoạt động không
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // TODO: Production - Ping SSO API
      // await this.httpService.get(`${this.ssoUrl}/health`).toPromise();

      return {
        status: 'healthy',
        message: 'HCMUT_SSO service is available (MOCK)'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'HCMUT_SSO service is unavailable'
      };
    }
  }
}
