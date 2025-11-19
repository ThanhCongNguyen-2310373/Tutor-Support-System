import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import * as bcrypt from 'bcrypt';
import { SSOAuthResponse } from './dto/sync-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class HcmutSsoService {
  private readonly logger = new Logger(HcmutSsoService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Authenticate user credentials against Local DB
   */
  async authenticateUser(email: string, password?: string): Promise<SSOAuthResponse> {
    this.logger.log(`[HCMUT_SSO] Verifying credentials for: ${email}`);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!password || !user.password) {
      throw new UnauthorizedException('Password is required');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    return {
      success: true,
      userId: user.mssv || user.id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      message: 'Authentication successful',
    };
  }

  /**
   * Validate Token Mock (Required if used in middleware)
   */
  async validateToken(token: string): Promise<SSOAuthResponse> {
    // Mock validation or implement DB token check if you store tokens
    return {
      success: true,
      userId: 'mock-id',
      email: 'mock@hcmut.edu.vn',
      fullName: 'Mock User',
      role: Role.STUDENT,
    };
  }

  async healthCheck() {
    return { status: 'healthy', mode: 'local-db-backed' };
  }
}