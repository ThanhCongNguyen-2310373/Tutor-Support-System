import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { MeetingStatus, Role } from '@prisma/client';
import { RescheduleMeetingDto } from './dto/reschedule-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}



// ========================================================
  // UC_STU_01: Student đặt lịch (Logic Nhóm)
  // ========================================================
  async createBooking(studentId: number, dto: CreateBookingDto) {
    // 1. Lấy thông tin Slot và đếm số sinh viên đã tham gia
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.slotId },
      include: { 
        tutor: { include: { user: true } },
        meeting: { include: { students: true } } // Lấy meeting hiện tại (nếu có) và danh sách SV
      },
    });

    if (!slot) throw new NotFoundException('Slot không tồn tại');
    if (slot.tutorId !== dto.tutorId) throw new BadRequestException('Slot không thuộc tutor này');

    // 2. Kiểm tra xem Slot đã đầy chưa
    // Logic: isBooked = true nghĩa là đã Full chỗ
    if (slot.isBooked) {
      throw new BadRequestException('Slot này đã đầy (Full)');
    }

    // Kiểm tra kỹ hơn bằng cách đếm số lượng thực tế
    const currentStudentCount = slot.meeting?.students.length || 0;
    if (currentStudentCount >= slot.maxStudents) {
      // Đáng lẽ isBooked phải là true, nhưng check lại cho chắc
      throw new BadRequestException('Slot này đã đủ số lượng sinh viên');
    }

    // 3. Kiểm tra Student đã join slot này chưa (tránh duplicate)
    if (slot.meeting?.students.some(s => s.id === studentId)) {
      throw new BadRequestException('Bạn đã đăng ký slot này rồi');
    }

    // 4. Thực hiện Booking (Transaction)
    const result = await this.prisma.$transaction(async (prisma) => {
      let meetingId: number;

      if (slot.meeting) {
        // A. Nếu Slot đã có Meeting -> Join vào Meeting đó
        await prisma.meeting.update({
          where: { id: slot.meeting.id },
          data: {
            students: { connect: { id: studentId } } // Thêm SV vào danh sách
          }
        });
        meetingId = slot.meeting.id;
      } else {
        // B. Nếu Slot chưa có Meeting -> Tạo mới
        const newMeeting = await prisma.meeting.create({
          data: {
            tutorId: dto.tutorId,
            slotId: dto.slotId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            topic: dto.topic,
            status: MeetingStatus.PENDING, // Chờ Tutor duyệt
            students: { connect: { id: studentId } } // Connect SV đầu tiên
          }
        });
        meetingId = newMeeting.id;
      }

      // 5. Cập nhật trạng thái Slot: Nếu sĩ số mới == max -> Set isBooked = true
      const newCount = currentStudentCount + 1;
      if (newCount >= slot.maxStudents) {
        await prisma.availabilitySlot.update({
          where: { id: slot.id },
          data: { isBooked: true }
        });
      }

      return prisma.meeting.findUnique({ 
        where: { id: meetingId },
        include: { students: true } 
      });
    });

    // Notification
    const studentName = result.students.find(s => s.id === studentId)?.fullName || 'Sinh viên';
    await this.notificationsService.notifyNewBookingRequest(slot.tutor.userId, {
      meetingId: result.id,
      studentName: studentName,
      scheduledTime: slot.startTime,
      topic: dto.topic,
    });

    return result;
  }

// ========================================================
  // Support Feature: Đổi lịch (Reschedule - Logic Nhóm)
  // ========================================================
  async rescheduleMeeting(userId: number, meetingId: number, dto: RescheduleMeetingDto) {
    // 1. Lấy Meeting cũ và Slot cũ
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { slot: true, students: true, tutor: { include: { user: true } } }
    });

    if (!meeting) throw new NotFoundException('Meeting không tồn tại');

    // Check quyền
    const isParticipant = meeting.students.some(s => s.id === userId);
    if (!isParticipant) throw new ForbiddenException('Bạn không tham gia meeting này');

    // 2. Lấy Slot mới
    const newSlot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.newSlotId },
      include: { meeting: { include: { students: true } } }
    });

    if (!newSlot) throw new NotFoundException('Slot mới không tồn tại');
    
    // Validate cơ bản
    if (newSlot.tutorId !== meeting.tutorId) throw new BadRequestException('Chỉ được đổi sang slot của cùng một Tutor');
    const newSlotCount = newSlot.meeting?.students.length || 0;
    if (newSlot.isBooked || newSlotCount >= newSlot.maxStudents) {
      throw new BadRequestException('Slot mới đã đầy');
    }

    // Kiểm tra xem Student có đang bận ở giờ của Slot mới không?
    const timeConflict = await this.prisma.meeting.findFirst({
      where: {
        students: { some: { id: userId } }, // Tìm các meeting CỦA SINH VIÊN NÀY
        startTime: newSlot.startTime,       // Trùng giờ bắt đầu
        // (Hoặc logic phức tạp hơn: start < newEnd && end > newStart nếu thời lượng khác nhau)
        status: { in: ['PENDING', 'CONFIRMED'] }, // Chỉ tính các lớp đang hoạt động
        id: { not: meetingId }              // Trừ chính cái meeting đang đi đổi
      }
    });

    if (timeConflict) {
      throw new BadRequestException(`Bạn đã có lịch học khác vào lúc ${newSlot.startTime.toLocaleString('vi-VN')}`);
    }

    // 3. Thực hiện chuyển đổi (Transaction giữ nguyên như cũ)
    await this.prisma.$transaction(async (prisma) => {
       // ... (Logic remove student cũ, add student mới giữ nguyên) ...
       
       // A. Rời meeting cũ
       await prisma.meeting.update({
        where: { id: meetingId },
        data: { students: { disconnect: { id: userId } } }
       });
       
       // Mở lại slot cũ
       await prisma.availabilitySlot.update({
        where: { id: meeting.slotId },
        data: { isBooked: false }
       });

       // B. Vào meeting mới
       if (newSlot.meeting) {
         await prisma.meeting.update({
           where: { id: newSlot.meeting.id },
           data: { students: { connect: { id: userId } } }
         });
       } else {
         await prisma.meeting.create({
           data: {
             tutorId: meeting.tutorId,
             slotId: newSlot.id,
             startTime: newSlot.startTime,
             endTime: newSlot.endTime,
             status: MeetingStatus.PENDING,
             students: { connect: { id: userId } }
           }
         });
       }
       
       // Đóng slot mới nếu full
       if (newSlotCount + 1 >= newSlot.maxStudents) {
         await prisma.availabilitySlot.update({
           where: { id: newSlot.id },
           data: { isBooked: true }
         });
       }
    });

    return { message: 'Đổi lịch thành công' };
  }


//###########################################
//## UC_STU_05: Student đánh giá buổi học ###
//###########################################
	async submitRating(userId: number, role: Role, meetingId: number, dto: CreateRatingDto) {
    if (role !== Role.STUDENT){ throw new ForbiddenException('Bạn không có quyền rating meeting này'); }

    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        ratings: true, // FIX: 'rating' -> 'ratings' (One-to-Many)
        students: true, // FIX: 'student' -> 'students'
        tutor: {
          include: { user: true },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting không tồn tại');
    }

    // FIX: Check participation using Array.some()
    const isParticipant = meeting.students.some(s => s.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Bạn không có quyền rating meeting này');
    }

    if (meeting.status !== MeetingStatus.COMPLETED) {
      throw new BadRequestException('Chỉ có thể rating meeting đã Complete');
    }

    // FIX: Check if THIS student has already rated
    const hasRated = meeting.ratings.some(r => r.studentId === userId);
    if (hasRated) {
      throw new BadRequestException('Bạn đã đánh giá meeting này rồi');
    }

    const rating = await this.prisma.$transaction(async (prisma) => {
      const newRating = await prisma.rating.create({
        data: {
          studentId: userId,
          meetingId,
          score: dto.score,
          comment: dto.comment,
        },
      });

      // Calculate avg
      const aggregations = await prisma.rating.aggregate({
        where: { 
          meeting: { tutorId: meeting.tutorId } 
        },
        _avg: { score: true }
      });

      const newAvg = aggregations._avg.score || 0;

      // 2. Update the TutorProfile with the new average
      await prisma.tutorProfile.update({
        where: { id: meeting.tutorId },
        data: { averageRating: newAvg }
      });
      
      console.log(`Tutor ${meeting.tutorId} new average rating updated to: ${newAvg}`);
      
      // Optional: Update tutor profile avgRating here

      // Send notification
      const studentName = meeting.students.find(s => s.id === userId)?.fullName || 'Sinh viên';
      
      await prisma.notification.create({
        data: {
          recipientId: meeting.tutor.userId,
          title: 'Đánh giá mới',
          message: `${studentName} đã đánh giá buổi học: ${dto.score}/5 sao. ${dto.comment || ''}`,
        },
      });

      return newRating;
    });

    return rating;
  }

//##############################################
//## Get my meetings (Student or Tutor view) ###
//##############################################
async getMyMeetings(
    userId: number, 
    role: Role, 
    filters?: { status?: string; startDate?: string; endDate?: string }
  ) {
    // FIX: Logic for Student view (Many-to-Many)
    const where: any = role === Role.STUDENT 
      ? { students: { some: { id: userId } } } // Find meetings where 'students' contains me
      : role === Role.TUTOR
      ? { tutor: { userId } }
      : {};

    if (filters?.status) {
      where.status = filters.status as MeetingStatus;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) where.startTime.gte = new Date(filters.startDate);
      if (filters.endDate) where.startTime.lte = new Date(filters.endDate);
    }

    const meetings = await this.prisma.meeting.findMany({
      where,
      include: {
        // FIX: 'student' -> 'students'
        students: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
          },
        },
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
        slot: true,
        ratings: true, // FIX: 'rating' -> 'ratings'
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return meetings;
  }




//#########################
//## Get meeting detail ###
//#########################
  async getMeetingById(id: number, userId: number, role: Role) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        students: { // FIX: 'student' -> 'students'
          select: {
            id: true,
            fullName: true,
            email: true,
            mssv: true,
          },
        },
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
        slot: true,
        ratings: true, // FIX: 'rating' -> 'ratings'
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting không tồn tại');
    }

    // FIX: Check permission via Array
    const isStudent = meeting.students.some(s => s.id === userId);
    const isTutor = meeting.tutor.userId === userId;
    const isAdmin = role === Role.ADMIN || role === Role.COORDINATOR;

    if (!isStudent && !isTutor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xem meeting này');
    }

    return meeting;
  }


// ========================================================
  // UC_STU_03 / UC_TUT_02: Cancel Meeting (Logic Nhóm)
  // ========================================================
  async cancelMeeting(userId: number, role: Role, meetingId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        students: true, // Lấy danh sách sinh viên
        tutor: { include: { user: true } },
        slot: true,
      },
    });

    if (!meeting) throw new NotFoundException('Meeting không tồn tại');

    // Check status
    if (meeting.status === MeetingStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy meeting đã hoàn thành');
    }
    if (meeting.status === MeetingStatus.CANCELED) {
      throw new BadRequestException('Meeting đã được hủy trước đó');
    }

    // --- CASE 1: TUTOR HỦY (Hủy toàn bộ lớp) ---
    if (role === Role.TUTOR) {
      if (meeting.tutor.userId !== userId) {
        throw new ForbiddenException('Bạn không có quyền hủy meeting này');
      }

      return this.prisma.$transaction(async (prisma) => {
        // 1. Update status Meeting
        const updated = await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: MeetingStatus.CANCELED },
        });

        // 2. Free up slot
        await prisma.availabilitySlot.update({
          where: { id: meeting.slotId },
          data: { isBooked: false },
        });

        // 3. Notify ALL students
        if (meeting.students.length > 0) {
          await prisma.notification.createMany({
            data: meeting.students.map((s) => ({
              recipientId: s.id,
              title: 'Lớp học đã bị hủy',
              message: `Tutor ${meeting.tutor.user.fullName} đã hủy lớp học vào ${meeting.startTime.toLocaleString('vi-VN')}`,
            })),
          });
        }

        return updated;
      });
    }

    // --- CASE 2: STUDENT HỦY (Rời khỏi lớp) ---
    if (role === Role.STUDENT) {
      // Check if student is in the meeting
      const isParticipant = meeting.students.some((s) => s.id === userId);
      if (!isParticipant) {
        throw new ForbiddenException('Bạn không tham gia meeting này');
      }

      return this.prisma.$transaction(async (prisma) => {
        // 1. Remove student from meeting
        const updated = await prisma.meeting.update({
          where: { id: meetingId },
          data: {
            students: { disconnect: { id: userId } },
          },
          include: { students: true },
        });

        // 2. Update Slot: Luôn mở lại slot (isBooked = false) vì có người vừa rời đi
        await prisma.availabilitySlot.update({
          where: { id: meeting.slotId },
          data: { isBooked: false },
        });

        // 3. Notify Tutor
        const studentName = meeting.students.find((s) => s.id === userId)?.fullName;
        await prisma.notification.create({
          data: {
            recipientId: meeting.tutor.userId,
            title: 'Sinh viên rời lớp',
            message: `Sinh viên ${studentName} đã hủy tham gia lớp học vào ${meeting.startTime.toLocaleString('vi-VN')}`,
          },
        });

        // 4. (Optional) Nếu lớp trống trơn -> Có thể hủy luôn meeting hoặc giữ nguyên
        if (updated.students.length === 0) {
             // Logic tùy chọn: Hủy meeting nếu không còn ai
             // await prisma.meeting.update({ where: { id: meetingId }, data: { status: 'CANCELED' } });
        }

        return updated;
      });
    }
  }

  // #######################################
  // ## UC_TUT_02: Tutor confirm booking ###
  // #######################################
  async confirmBooking(tutorUserId: number, meetingId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        students: true, //  Updated: Get list of students
        tutor: {
          include: { user: true },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting không tồn tại');
    }

    // Check permission
    if (meeting.tutor.userId !== tutorUserId) {
      throw new ForbiddenException('Bạn không có quyền confirm meeting này');
    }

    // Check status
    if (meeting.status !== MeetingStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể confirm meeting đang PENDING');
    }

    // Confirm meeting
    const updatedMeeting = await this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: MeetingStatus.CONFIRMED },
        include: {
          students: true,
          tutor: { include: { user: true } },
        },
      });

      // Updated: Send notification to ALL students
      if (meeting.students.length > 0) {
        await prisma.notification.createMany({
          data: meeting.students.map((student) => ({
            recipientId: student.id,
            title: 'Meeting đã được xác nhận',
            message: `Tutor ${meeting.tutor.user.fullName} đã xác nhận meeting vào ${meeting.startTime.toLocaleString('vi-VN')}`,
          })),
        });
      }

      return updated;
    });

    // Updated: Send emails and real-time notifications to ALL students
    const timeString = `${meeting.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${meeting.endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    const dateString = meeting.startTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Use Promise.all to send concurrently
    await Promise.all(meeting.students.map(async (student) => {
      // Send Email
      this.emailService.sendMeetingConfirmation(student.email, {
        studentName: student.fullName,
        tutorName: meeting.tutor.user.fullName,
        meetingDate: dateString,
        meetingTime: timeString,
        topic: meeting.topic || 'Không có chủ đề cụ thể',
        meetingLink: `${process.env.FRONTEND_URL}/meetings/${meetingId}`,
      }).catch(err => {
        console.error(`Failed to send confirmation email to ${student.email}:`, err.message);
      });

      // Send Real-time Notification
      return this.notificationsService.notifyBookingConfirmed(student.id, {
        meetingId: meetingId,
        tutorName: meeting.tutor.user.fullName,
        scheduledTime: meeting.startTime,
      });
    }));

    return updatedMeeting;
  }

//##################################
//## UC_TUT_02: Complete meeting ###
//##################################
	async completeMeeting(userId: number, role: Role, meetingId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        students: true, //  FIX
        tutor: { include: { user: true } },
      },
    });

    if (!meeting) throw new NotFoundException('Meeting không tồn tại');
    if (role !== Role.TUTOR || meeting.tutor.userId !== userId) throw new ForbiddenException('Bạn không có quyền complete meeting này');
    if (meeting.status !== MeetingStatus.CONFIRMED) throw new BadRequestException('Chỉ có thể Complete meeting đã Confirm'); // Logic chuẩn thường là Confirm -> Complete

    // 1. Update Status
    const updatedMeeting = await this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: MeetingStatus.COMPLETED },
        include: { students: true, tutor: { include: { user: true } } },
      });

      // FIX: Notify all students
      if (updated.students.length > 0) {
        await prisma.notification.createMany({
          data: updated.students.map((s) => ({
            recipientId: s.id,
            title: 'Meeting đã hoàn thành',
            message: `Meeting với tutor ${meeting.tutor.user.fullName} đã hoàn thành. Hãy đánh giá buổi học!`,
          })),
        });
      }
      return updated;
    });

    // 2. Gửi Email Rating & Realtime Notification cho TẤT CẢ
    const dateStr = meeting.startTime.toLocaleDateString('vi-VN');
    
    // FIX: Loop qua danh sách students
    await Promise.all(updatedMeeting.students.map(async (student) => {
        // Send Email
        this.emailService.sendRatingRequest(student.email, {
            studentName: student.fullName,
            tutorName: meeting.tutor.user.fullName,
            meetingDate: dateStr,
            meetingTime: '...', // (Format tương tự trên)
            topic: meeting.topic || '...',
            ratingLink: `${process.env.FRONTEND_URL}/meetings/${meetingId}/rating`,
        }).catch(err => console.error(err));

        // Send Realtime
        return this.notificationsService.notifyMeetingCompleted(student.id, {
            meetingId: meetingId,
            tutorName: meeting.tutor.user.fullName,
            completedTime: meeting.startTime,
        });
    }));

    return updatedMeeting;
  }

//################################################
//## UC_TUT_02: Get booking requests for tutor ###
//################################################
 async getBookingRequests(tutorUserId: number) {
        const tutor = await this.prisma.tutorProfile.findUnique({ where: { userId: tutorUserId } });
        if (!tutor) throw new NotFoundException('Tutor profile không tồn tại');
    
        const requests = await this.prisma.meeting.findMany({
          where: {
            tutorId: tutor.id,
            status: MeetingStatus.PENDING,
          },
          include: {
            students: { // FIX: 'student' -> 'students'
              select: {
                id: true,
                fullName: true,
                email: true,
                mssv: true,
              },
            },
            slot: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        });
        return requests;
      }
}
