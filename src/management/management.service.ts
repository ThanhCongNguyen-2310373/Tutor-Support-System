import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { EmailService } from '../email/email.service';
import { ManualPairDto } from './dto/manual-pair.dto';
import { CreateComplaintDto, ResolveComplaintDto } from './dto/complaint.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ManagementService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // src/management/management.service.ts

//###############################################
//##  UC_COO_01: Coordinator - Manual Pairing ###
//###############################################
  async manualPair(dto: ManualPairDto) {
    // 1. Check slot availability AND fetch existing meeting
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.slotId },
      include: { 
        tutor: true,
        meeting: { include: { students: true } } // Check if meeting exists
      },
    });

    if (!slot) {
      throw new NotFoundException('Slot không tồn tại');
    }

    if (slot.tutorId !== dto.tutorId) {
      throw new BadRequestException('Slot không thuộc tutor này');
    }

    // Check if slot is FULL (isBooked = true)
    if (slot.isBooked) {
      throw new BadRequestException('Slot đã được đặt (Full)');
    }

    // Check capacity manually just in case
    const currentStudents = slot.meeting?.students || [];
    if (currentStudents.length >= slot.maxStudents) {
      throw new BadRequestException('Slot đã đủ số lượng sinh viên tối đa');
    }

    // Check if student is already in this slot
    if (currentStudents.some(s => s.id === dto.studentId)) {
      throw new BadRequestException('Sinh viên đã có trong lớp này rồi');
    }

    // 2. Check student exist
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

    // 3. Execute Logic (Create or Update)
    const meeting = await this.prisma.$transaction(async (prisma) => {
      let resultMeeting;

      if (slot.meeting) {
        // CASE A: Meeting exists -> Add student to it
        resultMeeting = await prisma.meeting.update({
          where: { id: slot.meeting.id },
          data: {
            students: { connect: { id: dto.studentId } },
            // Ensure status is confirmed if it wasn't
            status: 'CONFIRMED', 
          },
          include: {
            students: true,
            tutor: { include: { user: true } },
          },
        });
      } else {
        // CASE B: No meeting -> Create new one
        resultMeeting = await prisma.meeting.create({
          data: {
            students: { connect: { id: dto.studentId } },
            tutorId: dto.tutorId,
            slotId: dto.slotId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: 'CONFIRMED', // Manual pair => auto confirmed
            topic: 'Ghép cặp bởi Coordinator',
          },
          include: {
            students: true,
            tutor: { include: { user: true } },
          },
        });
      }

      // 4. Update Slot isBooked if we reached max capacity
      // (current + 1 because we just added one)
      if (currentStudents.length + 1 >= slot.maxStudents) {
        await prisma.availabilitySlot.update({
          where: { id: dto.slotId },
          data: { isBooked: true },
        });
      }

      // 5. Notify (Only notify the NEW student and the Tutor)
      await prisma.notification.createMany({
        data: [
          {
            recipientId: dto.studentId,
            title: 'Đã được ghép cặp với tutor',
            message: `Coordinator đã ghép bạn với tutor ${tutor.user.fullName} vào ${slot.startTime.toLocaleString('vi-VN')}`,
          },
          {
            recipientId: tutor.userId,
            title: 'Lớp học có thành viên mới',
            message: `Coordinator đã thêm student ${student.fullName} vào lớp lúc ${slot.startTime.toLocaleString('vi-VN')}`,
          },
        ],
      });

      return resultMeeting;
    });

    return meeting;
  }


//##########################################
//## UC_COO_02: Student create complaint ###
//##########################################
  async createComplaint(userId: number, role: Role, dto: CreateComplaintDto) {
    if (role !== Role.STUDENT){ throw new ForbiddenException('Bạn không có quyền complaint meeting này'); }
    
    // Check meeting if provided
    if (dto.meetingId) {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: dto.meetingId },
        // FIX: Include students to verify participation
        include: { students: true }
      });

      if (!meeting) {
        throw new NotFoundException('Meeting không tồn tại');
      }

      // FIX: Check if user is in the students list
      const isParticipant = meeting.students.some(s => s.id === userId);
      if (!isParticipant) {
        throw new ForbiddenException('Không có quyền khiếu nại meeting này');
      }
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        studentId: userId,
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

    // Send email to all coordinators (don't await)
    this.notifyCoordinatorsOfComplaint(complaint).catch(err => {
      console.error('Failed to send complaint notification emails:', err.message);
    });

    return complaint;
  }




//###############################################
//## UC_COO_02: Coordinator get all complaint ###
//###############################################
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




//###############################################
//## UC_COO_02: Coordinator resolve complaint ###
//###############################################
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




//########################################
//## UC_ADMIN_01: Admin - get all user ###
//########################################
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




//##########################################
//## UC_ADMIN_01: Admin - get user by id ###
//##########################################
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




//#######################################
//## UC_ADMIN_01: Admin - create user ###
//#######################################
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
          department: dto.department,
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




//#######################################
//## UC_ADMIN_01: Admin - update user ###
//#######################################
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




//#######################################
//## UC_ADMIN_01: Admin - delete user ###
//#######################################
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




//##################################################
//## UC_ADMIN_02: Admin - Get Tutor Applications ###
//##################################################
  async getTutorApplications() {
    const applications = await this.prisma.tutorApplication.findMany({
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
            department: true,
            studentClass: true,
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




//#####################################################
//## UC_ADMIN_02: Admin - approve Tutor Application ###
//#####################################################
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
          expertise: application.expertise,
          bio: application.bio,
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




//####################################################
//## UC_ADMIN_02: Admin - reject Tutor Application ###
//####################################################
  /**
   * Helper: Send complaint notification to all coordinators
   */
  private async notifyCoordinatorsOfComplaint(complaint: any) {
    // Get all coordinators
    const coordinators = await this.prisma.user.findMany({
      where: { role: Role.COORDINATOR },
      select: { email: true, fullName: true },
    });

    // Send email to each coordinator
    const emailPromises = coordinators.map(coordinator =>
      this.emailService.sendComplaintNotification(coordinator.email, {
        coordinatorName: coordinator.fullName,
        studentName: complaint.student.fullName,
        studentEmail: complaint.student.email,
        description: complaint.description,
        complaintId: complaint.id.toString(),
        createdAt: complaint.createdAt.toLocaleString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        dashboardLink: `${process.env.FRONTEND_URL}/management/complaints/${complaint.id}`,
        meetingInfo: complaint.meeting
          ? `Meeting ID ${complaint.meeting.id} với tutor ${complaint.meeting.tutor.user.fullName}`
          : 'Không liên quan đến meeting cụ thể',
      })
    );

    await Promise.allSettled(emailPromises);
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
  
//####################################################
//## UC_TBM_02: TBM - get potential tutor          ###
//####################################################
  async getPotentialTutors(filters: { gpaMin?: number; department?: string }) {
    const { gpaMin = 3.0, department } = filters;

    return this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        gpa: { gte: gpaMin },
        department: department ? { contains: department, mode: 'insensitive' } : undefined,
        // Loại bỏ những người đã là tutor
        tutorProfile: null,
      },
      select: {
        id: true,
        fullName: true,
        mssv: true,
        department: true,
        studentClass: true,
        gpa: true,
      },
      orderBy: { gpa: 'desc' },
    });
  }

//####################################################
//## UC_TBM_02: TBM - send to admin to aproval     ###
//####################################################
  async proposeTutorApplication(data: {
    studentId: number;
    expertise: string[];
    bio: string;
    gpa: number;
    proposedById: number;
  }) {
    const existing = await this.prisma.tutorApplication.findFirst({
    where: {
      studentId: data.studentId,
      status: 'PENDING', // chỉ check đơn đang chờ duyệt
    },
    });

    if (existing) {
      throw new ConflictException(
        'Sinh viên này đã có đơn xin làm Tutor đang chờ duyệt! Không thể đề xuất thêm.'
      );
    }
    return this.prisma.tutorApplication.create({
      data: {
        studentId: data.studentId,
        expertise: data.expertise,
        bio: data.bio,
        gpa: data.gpa,
        status: "PENDING",
      },
      include: {
        student: {
          select: { 
            fullName: true,
            mssv: true,
            studentClass: true,
            department: true,
            email: true,
          }
        }
      }
    });
  }

}
