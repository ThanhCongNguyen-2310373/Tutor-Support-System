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
  async createRoadmap(dto: CreateRoadmapDto) {
  // XÓA authorId HOÀN TOÀN
    return this.prisma.learningRoadmap.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        documentUrl: dto.documentUrl || null,
        // KHÔNG CÓ authorId NỮA!!!
      },
    });
  }

  async getRoadmaps() {
    return this.prisma.learningRoadmap.findMany({
      // XÓA include author vì không còn quan hệ
      orderBy: { id: 'desc' },
    });
  }

  /**
   * UC_TBM_01: TBM xem chi tiết lộ trình (để chỉnh sửa)
   */
  async getRoadmapById(id: number) {
    const roadmap = await this.prisma.learningRoadmap.findUnique({
      where: { id },
      // XÓA HOÀN TOÀN include vì không còn author
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
  async updateRoadmap(id: number, dto: CreateRoadmapDto) {
    // XÓA kiểm tra authorId vì không còn nữa
    const updated = await this.prisma.learningRoadmap.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description || null,
        documentUrl: dto.documentUrl || null,
      },
    });

    return { message: 'Cập nhật lộ trình thành công', data: updated };
  }

  async deleteRoadmap(id: number) {
    // XÓA kiểm tra authorId
    await this.prisma.learningRoadmap.delete({ where: { id } });
    return { message: 'Xóa lộ trình thành công' };
  }
}
