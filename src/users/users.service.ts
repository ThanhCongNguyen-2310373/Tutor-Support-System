// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tutorProfile: true, // Lấy luôn hồ sơ tutor nếu có
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
