// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

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

  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    // Get current user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      const publicId = this.uploadService.extractPublicId(user.avatarUrl);
      if (publicId) {
        await this.uploadService.deleteFile(publicId);
      }
    }

    // Upload new avatar
    const avatarUrl = await this.uploadService.uploadAvatar(file, userId);

    // Update user avatar URL in database
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return avatarUrl;
  }

  async deleteAvatar(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.avatarUrl) {
      throw new NotFoundException('No avatar to delete');
    }

    // Delete from Cloudinary
    const publicId = this.uploadService.extractPublicId(user.avatarUrl);
    if (publicId) {
      await this.uploadService.deleteFile(publicId);
    }

    // Remove avatar URL from database
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });
  }
  
  // Fetch student progress list
  async getMyProgress(userId: number) {
    // Kiểm tra user có tồn tại không (optional, vì qua Guard đã check token rồi)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const progressRecords = await this.prisma.progressRecord.findMany({
      where: {
        studentId: userId,
      },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return progressRecords;
  }

}
