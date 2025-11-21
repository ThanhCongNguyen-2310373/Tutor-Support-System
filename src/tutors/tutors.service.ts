import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CreateProgressRecordDto } from './dto/create-progress-record.dto';

@Injectable()
export class TutorsService {
  constructor(private prisma: PrismaService) {}




//###################################
//## Get tutor profile by user ID ###
//###################################
  async getTutorProfileByUserId(userId: number) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
            role: true,
          },
        },
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    return tutor;
  }




//##########################################
//## UC_TUT_01: Create availability slot ###
//##########################################
  async createAvailability(tutorUserId: number, dto: CreateAvailabilityDto) {
    // Find tutor profile
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    // Validate time range
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Không thể tạo slot trong quá khứ');
    }

    // Check for overlapping slots
    const overlapping = await this.prisma.availabilitySlot.findFirst({
      where: {
        tutorId: tutor.id,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Slot bị trùng với slot khác đã tồn tại');
    }

    // Create slot
    const slot = await this.prisma.availabilitySlot.create({
      data: {
        tutorId: tutor.id,
        startTime,
        endTime,
        isBooked: false,
        maxStudents: dto.maxStudents || 1, // 🟢 Lưu số lượng tối đa
      },
    });

    return slot;
  }




//##########################################
//## UC_TUT_01: Delete availability slot ###
//##########################################
  async deleteAvailability(tutorUserId: number, slotId: number) {
    // Find tutor profile
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    // Find slot
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot không tồn tại');
    }

    // Check ownership
    if (slot.tutorId !== tutor.id) {
      throw new ForbiddenException('Bạn không có quyền xóa slot này');
    }

    // Check if booked
    if (slot.isBooked) {
      throw new BadRequestException('Không thể xóa slot đã được đặt');
    }

    // Delete slot
    await this.prisma.availabilitySlot.delete({
      where: { id: slotId },
    });

    return { message: 'Xóa slot thành công' };
  }




//################################################
//## UC_TUT_01: Get tutor's availability slots ###
//################################################
  async getAvailability(tutorUserId: number) {
    // Find tutor profile
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    // Get slots
    const slots = await this.prisma.availabilitySlot.findMany({
      where: {
        tutorId: tutor.id,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return slots;
  }




//########################################################
//## Get all available tutors (for students to browse) ###
//########################################################
  async getAllTutors() {
    const tutors = await this.prisma.tutorProfile.findMany({
      where: {
        available: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
            role:true,
          },
        },
        availabilitySlots: {
          where: {
            isBooked: false,
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    return tutors;
  }




//#############################
//## Get tutor detail by ID ###
//#############################
  async getTutorById(tutorId: number) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
          },
        },
        availabilitySlots: {
          where: {
            isBooked: false,
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor không tồn tại');
    }

    return tutor;
  }




//########################################
//## UC_TUT_03: Create progress record ###
//########################################
  async createProgressRecord(tutorUserId: number, dto: CreateProgressRecordDto) {
    // Find tutor profile
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    // Check student exists
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student không tồn tại');
    }

    // Create progress record
    const record = await this.prisma.progressRecord.create({
      data: {
        tutorId: tutor.id,
        studentId: dto.studentId,
        note: dto.note,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
          },
        },
      },
    });

    // Send notification to student
    await this.prisma.notification.create({
      data: {
        recipientId: dto.studentId,
        title: 'Ghi nhận tiến độ mới',
        message: `Tutor đã ghi nhận tiến độ học tập của bạn: ${dto.note.substring(0, 100)}${dto.note.length > 100 ? '...' : ''}`,
      },
    });

    return record;
  }


 //##############################################
//## UC_TUT_03: Get student progress records ###
//##############################################
  async getStudentProgress(tutorUserId: number, studentId: number) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    // FIX: Updated for Many-to-Many (Meeting has 'students', not 'studentId')
    const hasRelation = await this.prisma.meeting.findFirst({
      where: {
        tutorId: tutor.id,
        students: {
          some: { id: studentId } // Check if 'students' list contains this ID
        },
        status: { in: ['COMPLETED', 'CONFIRMED'] } 
      }
    });

    if (!hasRelation) {
      throw new ForbiddenException('Bạn không có quyền xem tiến độ của sinh viên này (Chưa có lớp học chung)');
    }

    const records = await this.prisma.progressRecord.findMany({
      where: {
        tutorId: tutor.id,
        studentId,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records;
  }

//#############################################
//## Get all students tutored by this tutor ###
//#############################################
  async getMyStudents(tutorUserId: number) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    // FIX: Query Users directly based on relationship
    // Instead of getting meetings and mapping (which is hard with M-N distinct),
    // we find Users who have at least one COMPLETED meeting with this tutor.
    const students = await this.prisma.user.findMany({
      where: {
        studentMeetings: {
          some: {
            tutorId: tutor.id,
            status: 'COMPLETED'
          }
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mssv: true,
        avatarUrl: true,
      }
    });

    return students;
  }
}
