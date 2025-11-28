import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  /**
   * UC_TBM_01: Trưởng Bộ Môn tạo lộ trình học
   */
  async createRoadmap(authorId: number, dto: CreateRoadmapDto) {
    const roadmap = await this.prisma.learningRoadmap.create({
      data: {
        title: dto.title,
        description: dto.description,
        documentUrl: dto.documentUrl,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Tạo lộ trình học thành công',
      data: roadmap,
    };
  }

  /**
   * UC_TUT_03 & UC_STU_03: Tutor/Student xem danh sách lộ trình
   */
  async getRoadmaps() {
    const roadmaps = await this.prisma.learningRoadmap.findMany({
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      message: 'Lấy danh sách lộ trình thành công',
      data: roadmaps,
      total: roadmaps.length,
    };
  }

  /**
   * UC_TBM_01: TBM xem chi tiết lộ trình (để chỉnh sửa)
   */
  async getRoadmapById(id: number) {
    const roadmap = await this.prisma.learningRoadmap.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!roadmap) {
      throw new NotFoundException('Lộ trình không tồn tại');
    }

    return {
      message: 'Lấy chi tiết lộ trình thành công',
      data: roadmap,
    };
  }

  /**
   * UC_TBM_01: TBM cập nhật lộ trình
   */
  async updateRoadmap(id: number, authorId: number, dto: CreateRoadmapDto) {
    const roadmap = await this.prisma.learningRoadmap.findUnique({
      where: { id },
    });

    if (!roadmap) {
      throw new NotFoundException('Lộ trình không tồn tại');
    }

    // Check permission: chỉ author mới có thể update
    // if (roadmap.authorId !== authorId) {
    //   throw new ForbiddenException('Bạn không có quyền chỉnh sửa lộ trình này');
    // }

    const updated = await this.prisma.learningRoadmap.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        documentUrl: dto.documentUrl,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật lộ trình thành công',
      data: updated,
    };
  }

  /**
   * UC_TBM_01: TBM xóa lộ trình
   */
  async deleteRoadmap(id: number, authorId: number) {
    const roadmap = await this.prisma.learningRoadmap.findUnique({
      where: { id },
    });

    if (!roadmap) {
      throw new NotFoundException('Lộ trình không tồn tại');
    }

    // Check permission: chỉ author mới có thể delete
    // if (roadmap.authorId !== authorId) {
    //   throw new ForbiddenException('Bạn không có quyền xóa lộ trình này');
    // }

    await this.prisma.learningRoadmap.delete({
      where: { id },
    });

    return {
      message: 'Xóa lộ trình thành công',
    };
  }
}
