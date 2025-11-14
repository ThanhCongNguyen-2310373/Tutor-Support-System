// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  async updateProfile(userId: number, updateDto: UpdateProfileDto) {
    // Kiểm tra user có tồn tại không
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Chuẩn bị dữ liệu update cho User
    const userUpdateData: any = {};
    if (updateDto.fullName !== undefined) {
      userUpdateData.fullName = updateDto.fullName;
    }

    // Update thông tin User
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
      include: { tutorProfile: true },
    });

    // Nếu có bio hoặc expertise và user là TUTOR, update TutorProfile
    if (
      (updateDto.bio !== undefined || updateDto.expertise !== undefined) &&
      user.tutorProfile
    ) {
      const tutorUpdateData: any = {};
      if (updateDto.bio !== undefined) {
        tutorUpdateData.bio = updateDto.bio;
      }
      if (updateDto.expertise !== undefined) {
        tutorUpdateData.expertise = updateDto.expertise;
      }

      await this.prisma.tutorProfile.update({
        where: { id: user.tutorProfile.id },
        data: tutorUpdateData,
      });

      // Lấy lại user với tutorProfile đã update
      return this.prisma.user.findUnique({
        where: { id: userId },
        include: { tutorProfile: true },
      });
    }

    return updatedUser;
  }
}
