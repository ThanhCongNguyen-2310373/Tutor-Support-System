import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { ManualPairDto } from './dto/manual-pair.dto';
import { CreateComplaintDto, ResolveComplaintDto } from './dto/complaint.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // UC_COO_01: Coordinator - Manual Pairing
  // ==========================================

  async manualPair(dto: ManualPairDto) {
    // Check slot availability
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.slotId },
      include: { tutor: true },
    });

    if (!slot) {
      throw new NotFoundException('Slot không tồn tại');
    }

    if (slot.tutorId !== dto.tutorId) {
      throw new BadRequestException('Slot không thuộc tutor này');
    }

    if (slot.isBooked) {
      throw new BadRequestException('Slot đã được đặt');
    }

    // Check student and tutor exist
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: dto.tutorId },
      include: { user: true },
    });

    if (!student || student.role !== Role.STUDENT) {
      throw new NotFoundException('Student không tồn tại');
    }

    if (!tutor) {
      throw new NotFoundException('Tutor không tồn tại');
    }

    // Create meeting (manual override - auto CONFIRMED)
    const meeting = await this.prisma.$transaction(async (prisma) => {
      // Update slot
      await prisma.availabilitySlot.update({
        where: { id: dto.slotId },
        data: { isBooked: true },
      });

      // Create meeting with CONFIRMED status
      const newMeeting = await prisma.meeting.create({
        data: {
          studentId: dto.studentId,
          tutorId: dto.tutorId,
          slotId: dto.slotId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'CONFIRMED', // Manual pair => auto confirmed
          topic: 'Ghép cặp bởi Coordinator',
        },
        include: {
          student: true,
          tutor: { include: { user: true } },
        },
      });

      // Notify both student and tutor
      await prisma.notification.createMany({
        data: [
          {
            recipientId: dto.studentId,
            title: 'Đã được ghép cặp với tutor',
            message: `Coordinator đã ghép bạn với tutor ${tutor.user.fullName} vào ${slot.startTime.toLocaleString('vi-VN')}`,
          },
          {
            recipientId: tutor.userId,
            title: 'Đã được ghép cặp với student',
            message: `Coordinator đã ghép bạn với student ${student.fullName} vào ${slot.startTime.toLocaleString('vi-VN')}`,
          },
        ],
      });

      return newMeeting;
    });

    return meeting;
  }

  // ==========================================
  // UC_COO_02: Coordinator - Complaints
  // ==========================================

  async createComplaint(studentId: number, dto: CreateComplaintDto) {
    // Check meeting if provided
    if (dto.meetingId) {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: dto.meetingId },
      });

      if (!meeting) {
        throw new NotFoundException('Meeting không tồn tại');
      }

      if (meeting.studentId !== studentId) {
        throw new ForbiddenException('Không có quyền khiếu nại meeting này');
      }
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        studentId,
        meetingId: dto.meetingId,
        description: dto.description,
        status: 'OPEN',
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        meeting: {
          include: {
            tutor: {
              include: { user: true },
            },
          },
        },
      },
    });

    return complaint;
  }

  async getAllComplaints() {
    const complaints = await this.prisma.complaint.findMany({
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        meeting: {
          include: {
            tutor: {
              include: { user: true },
            },
          },
        },
        resolvedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return complaints;
  }

  async resolveComplaint(coordinatorId: number, complaintId: number, dto: ResolveComplaintDto) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        student: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    if (complaint.status === 'RESOLVED') {
      throw new BadRequestException('Khiếu nại đã được giải quyết');
    }

    // Update complaint
    const updated = await this.prisma.$transaction(async (prisma) => {
      const resolved = await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'RESOLVED',
          coordinatorId,
        },
        include: {
          student: true,
          resolvedBy: true,
        },
      });

      // Notify student
      await prisma.notification.create({
        data: {
          recipientId: complaint.studentId,
          title: 'Khiếu nại đã được giải quyết',
          message: `Khiếu nại của bạn đã được giải quyết: ${dto.resolution}`,
        },
      });

      return resolved;
    });

    return updated;
  }

  // ==========================================
  // UC_ADMIN_01: Admin - User Management
  // ==========================================

  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          tutorProfile: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tutorProfile: {
          include: {
            availabilitySlots: {
              where: {
                startTime: {
                  gte: new Date(),
                },
              },
            },
          },
        },
        studentMeetings: {
          take: 10,
          orderBy: { startTime: 'desc' },
        },
        studentRatings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    return user;
  }

  async createUser(dto: CreateUserDto) {
    // Check email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Create user
    const user = await this.prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          email: dto.email,
          fullName: dto.fullName,
          mssv: dto.mssv,
          role: dto.role,
        },
      });

      // If TUTOR, create tutor profile
      if (dto.role === Role.TUTOR && dto.expertise) {
        await prisma.tutorProfile.create({
          data: {
            userId: newUser.id,
            expertise: dto.expertise,
            available: true,
          },
        });
      }

      return newUser;
    });

    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { tutorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Update user
    const updated = await this.prisma.$transaction(async (prisma) => {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          fullName: dto.fullName,
          role: dto.role,
        },
        include: {
          tutorProfile: true,
        },
      });

      // Update tutor profile if exists
      if (user.tutorProfile && (dto.expertise || dto.available !== undefined)) {
        await prisma.tutorProfile.update({
          where: { userId: id },
          data: {
            expertise: dto.expertise,
            available: dto.available,
          },
        });
      }

      // Create tutor profile if role changed to TUTOR
      if (dto.role === Role.TUTOR && !user.tutorProfile && dto.expertise) {
        await prisma.tutorProfile.create({
          data: {
            userId: id,
            expertise: dto.expertise,
            available: dto.available ?? true,
          },
        });
      }

      return updatedUser;
    });

    return updated;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Soft delete or hard delete based on business logic
    // For now, hard delete (be careful with foreign keys)
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Xóa user thành công' };
  }

  async resetPassword(id: number) {
    // Mock reset password (in reality, generate token and send email)
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Send notification
    await this.prisma.notification.create({
      data: {
        recipientId: id,
        title: 'Reset mật khẩu',
        message: 'Mật khẩu của bạn đã được reset. Vui lòng check email để đặt lại mật khẩu mới.',
      },
    });

    return { message: 'Email reset password đã được gửi' };
  }

  // ==========================================
  // UC_ADMIN_02: Admin - Tutor Applications
  // ==========================================

  async getTutorApplications() {
    const applications = await this.prisma.tutorApplication.findMany({
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
          },
        },
        tbm: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return applications;
  }

  async approveTutorApplication(adminId: number, applicationId: number) {
    const application = await this.prisma.tutorApplication.findUnique({
      where: { id: applicationId },
      include: {
        student: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application không tồn tại');
    }

    if (application.status === 'APPROVED') {
      throw new BadRequestException('Application đã được duyệt');
    }

    if (application.status === 'REJECTED') {
      throw new BadRequestException('Application đã bị từ chối');
    }

    // Approve and create tutor profile
    const updated = await this.prisma.$transaction(async (prisma) => {
      // Update application
      const approved = await prisma.tutorApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          adminId,
        },
        include: {
          student: true,
        },
      });

      // Update user role to TUTOR
      await prisma.user.update({
        where: { id: application.studentId },
        data: {
          role: Role.TUTOR,
        },
      });

      // Create tutor profile
      await prisma.tutorProfile.create({
        data: {
          userId: application.studentId,
          expertise: [],
          available: true,
        },
      });

      // Notify student
      await prisma.notification.create({
        data: {
          recipientId: application.studentId,
          title: 'Đơn xin làm tutor đã được duyệt',
          message: 'Chúc mừng! Đơn xin làm tutor của bạn đã được phê duyệt. Bạn có thể bắt đầu đăng ký lịch rảnh.',
        },
      });

      return approved;
    });

    return updated;
  }

  async rejectTutorApplication(adminId: number, applicationId: number, reason?: string) {
    const application = await this.prisma.tutorApplication.findUnique({
      where: { id: applicationId },
      include: {
        student: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application không tồn tại');
    }

    if (application.status === 'APPROVED') {
      throw new BadRequestException('Không thể reject application đã được duyệt');
    }

    if (application.status === 'REJECTED') {
      throw new BadRequestException('Application đã bị từ chối');
    }

    // Reject application
    const updated = await this.prisma.$transaction(async (prisma) => {
      const rejected = await prisma.tutorApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          adminId,
        },
        include: {
          student: true,
        },
      });

      // Notify student
      await prisma.notification.create({
        data: {
          recipientId: application.studentId,
          title: 'Đơn xin làm tutor bị từ chối',
          message: `Đơn xin làm tutor của bạn đã bị từ chối. ${reason ? `Lý do: ${reason}` : ''}`,
        },
      });

      return rejected;
    });

    return updated;
  }
}
