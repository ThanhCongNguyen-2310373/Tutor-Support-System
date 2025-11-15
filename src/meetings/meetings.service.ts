import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { MeetingStatus, Role } from '@prisma/client';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}




//######################################
//## UC_STU_01: Student đặt lịch hẹn ###
//######################################
  async createBooking(studentId: number, dto: CreateBookingDto) {
    // 1. Check slot availability
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.slotId },
      include: {
        tutor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Slot không tồn tại');
    }

    if (slot.isBooked) {
      throw new BadRequestException('Slot đã được đặt');
    }

    if (slot.tutorId !== dto.tutorId) {
      throw new BadRequestException('Slot không thuộc tutor này');
    }

    // 2. Check tutor exists and available
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: dto.tutorId },
      include: { user: true },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor không tồn tại');
    }

    if (!tutor.available) {
      throw new BadRequestException('Tutor hiện không available');
    }

    // 3. Create meeting and update slot (transaction)
    const meeting = await this.prisma.$transaction(async (prisma) => {
      // Update slot status
      await prisma.availabilitySlot.update({
        where: { id: dto.slotId },
        data: { isBooked: true },
      });

      // Create meeting
      const newMeeting = await prisma.meeting.create({
        data: {
          studentId,
          tutorId: dto.tutorId,
          slotId: dto.slotId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          topic: dto.topic,
          status: MeetingStatus.PENDING,
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
        },
      });

      // 4. Send notification to tutor
      await prisma.notification.create({
        data: {
          recipientId: tutor.userId,
          title: 'Yêu cầu đặt lịch mới',
          message: `Sinh viên ${newMeeting.student.fullName} đã đặt lịch hẹn với bạn vào ${slot.startTime.toLocaleString('vi-VN')}. Chủ đề: ${dto.topic || 'Không có'}`,
        },
      });

      return newMeeting;
    });

    return meeting;
  }




//###########################################
//## UC_STU_05: Student đánh giá buổi học ###
//###########################################
	async submitRating(userId: number, role: Role, meetingId: number, dto: CreateRatingDto) {
	  if (role !== Role.STUDENT){ throw new ForbiddenException('Bạn không có quyền rating meeting này'); }

	  // 1. Check meeting exists
	  const meeting = await this.prisma.meeting.findUnique({
		where: { id: meetingId },
		include: {
		  rating: true,
		  student: true,
		  tutor: {
		    include: {
		      user: true,
		    },
		  },
		},
	  });

	  if (!meeting) {
		throw new NotFoundException('Meeting không tồn tại');
	  }

	  // 2. Check ownership
	  if (meeting.studentId !== userId) {
		throw new ForbiddenException('Bạn không có quyền rating meeting này');
	  }

	  // 3. Check meeting completed
	  if (meeting.status !== MeetingStatus.COMPLETED) {
		throw new BadRequestException('Chỉ có thể rating meeting đã Complete');
	  }

	  // 4. Prevent duplicate rating
	  if (meeting.rating) {
		throw new BadRequestException('Meeting này đã được rating');
	  }

	  // 5. Create rating and update tutor average rating
	  const rating = await this.prisma.$transaction(async (prisma) => {
		// Create rating
		const newRating = await prisma.rating.create({
		  data: {
		    studentId: userId,
		    meetingId,
		    score: dto.score,
		    comment: dto.comment,
		  },
		});

		// Calculate new average rating for tutor
		const ratings = await prisma.rating.findMany({
		  where: {
		    meeting: { tutorId: meeting.tutorId },
		  },
		});

		const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

		// Update tutor profile (optional: add rating field to TutorProfile)
		console.log(`Tutor ${meeting.tutorId} new average rating: ${avgRating}`);

		// Send notification to tutor
		await prisma.notification.create({
		  data: {
		    recipientId: meeting.tutor.userId,
		    title: 'Đánh giá mới',
		    message: `${meeting.student.fullName} đã đánh giá buổi học: ${dto.score}/5 sao. ${dto.comment || ''}`,
		  },
		});

		return newRating;
	  });

	  return rating;
	}





//##############################################
//## Get my meetings (Student or Tutor view) ###
//##############################################
  async getMyMeetings(userId: number, role: Role) {
    const where = role === Role.STUDENT 
      ? { studentId: userId }
      : role === Role.TUTOR
      ? { tutor: { userId } }
      : {};

    const meetings = await this.prisma.meeting.findMany({
      where,
      include: {
        student: {
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
        rating: true,
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
        student: {
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
        rating: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting không tồn tại');
    }

    // Check permission
    const isStudent = meeting.studentId === userId;
    const isTutor = meeting.tutor.userId === userId;
    const isAdmin = role === Role.ADMIN || role === Role.COORDINATOR;

    if (!isStudent && !isTutor && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xem meeting này');
    }

    return meeting;
  }


//##################################
//## UC_TUT_02: Complete meeting ###
//##################################
  /**
   * Cancel meeting (Student or Tutor)
   */
  async cancelMeeting(userId: number, role: Role, meetingId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        student: true,
        tutor: {
          include: { user: true },
        },
        slot: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting không tồn tại');
    }

    // Check permission
    const isStudent = meeting.studentId === userId;
    const isTutor = meeting.tutor.userId === userId;

    if (!isStudent && !isTutor) {
      throw new ForbiddenException('Bạn không có quyền hủy meeting này');
    }

    // Check status
    if (meeting.status === MeetingStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy meeting đã hoàn thành');
    }

    if (meeting.status === MeetingStatus.CANCELED) {
      throw new BadRequestException('Meeting đã được hủy trước đó');
    }

    // Cancel meeting and free up slot
    const updatedMeeting = await this.prisma.$transaction(async (prisma) => {
      // Update meeting status
      const updated = await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: MeetingStatus.CANCELED },
        include: {
          student: true,
          tutor: { include: { user: true } },
        },
      });

      // Free up slot
      await prisma.availabilitySlot.update({
        where: { id: meeting.slotId },
        data: { isBooked: false },
      });

      // Send notification to the other party
      const notificationRecipient = isStudent ? meeting.tutor.userId : meeting.studentId;
      const canceledBy = isStudent ? meeting.student.fullName : meeting.tutor.user.fullName;

      await prisma.notification.create({
        data: {
          recipientId: notificationRecipient,
          title: 'Meeting đã bị hủy',
          message: `${canceledBy} đã hủy meeting vào ${meeting.startTime.toLocaleString('vi-VN')}`,
        },
      });

      return updated;
    });

    return updatedMeeting;
  }




//#######################################
//## UC_TUT_02: Tutor confirm booking ###
//#######################################
  async confirmBooking(tutorUserId: number, meetingId: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        student: true,
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
          student: true,
          tutor: { include: { user: true } },
        },
      });

      // Send notification to student
      await prisma.notification.create({
        data: {
          recipientId: meeting.studentId,
          title: 'Meeting đã được xác nhận',
          message: `Tutor ${meeting.tutor.user.fullName} đã xác nhận meeting vào ${meeting.startTime.toLocaleString('vi-VN')}`,
        },
      });

      return updated;
    });

    return updatedMeeting;
  }




//######################################
//## UC_TUT_02: Tutor reject booking ###
//######################################
  async rejectBooking(tutorUserId: number, meetingId: number, reason?: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        student: true,
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
      throw new ForbiddenException('Bạn không có quyền reject meeting này');
    }

    // Check status
    if (meeting.status !== MeetingStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể reject meeting đang PENDING');
    }

    // Reject meeting and free slot
    const updatedMeeting = await this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: MeetingStatus.CANCELED },
        include: {
          student: true,
          tutor: { include: { user: true } },
        },
      });

      // Free up slot
      await prisma.availabilitySlot.update({
        where: { id: meeting.slotId },
        data: { isBooked: false },
      });

      // Send notification to student
      await prisma.notification.create({
        data: {
          recipientId: meeting.studentId,
          title: 'Meeting đã bị từ chối',
          message: `Tutor ${meeting.tutor.user.fullName} đã từ chối meeting vào ${meeting.startTime.toLocaleString('vi-VN')}. ${reason ? `Lý do: ${reason}` : ''}`,
        },
      });

      return updated;
    });

    return updatedMeeting;
  }



  
//##################################
//## UC_TUT_02: Complete meeting ###
//##################################
	async completeMeeting(userId: number, role: Role, meetingId: number) {
	  const meeting = await this.prisma.meeting.findUnique({
		where: { id: meetingId },
		include: {
		  student: true,
		  tutor: {
		    include: { user: true },
		  },
		},
	  });

	  if (!meeting) {
		throw new NotFoundException('Meeting không tồn tại');
	  }

	  // Only tutors can complete meetings
	  if (role !== Role.TUTOR || meeting.tutor.userId !== userId) {
		throw new ForbiddenException('Bạn không có quyền complete meeting này');
	  }

	  // Can't complete cancelled or pending meetings
	  if (meeting.status === MeetingStatus.CANCELED || meeting.status === MeetingStatus.PENDING) {
		throw new BadRequestException('Không thể Complete meeting đã Cancel hoặc Pending');
	  }

	  // Already completed
	  if (meeting.status === MeetingStatus.COMPLETED) {
		return meeting;
	  }

	  // Complete meeting
	  const updatedMeeting = await this.prisma.$transaction(async (prisma) => {
		const updated = await prisma.meeting.update({
		  where: { id: meetingId },
		  data: { status: MeetingStatus.COMPLETED },
		  include: {
		    student: true,
		    tutor: { include: { user: true } },
		  },
		});

		// Notify student
		await prisma.notification.create({
		  data: {
		    recipientId: meeting.studentId,
		    title: 'Meeting đã hoàn thành',
		    message: `Meeting với tutor ${meeting.tutor.user.fullName} đã hoàn thành. Hãy đánh giá buổi học!`,
		  },
		});

		return updated;
	  });

	  return updatedMeeting;
	}




//################################################
//## UC_TUT_02: Get booking requests for tutor ###
//################################################
  async getBookingRequests(tutorUserId: number) {
    // Find tutor profile
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId: tutorUserId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor profile không tồn tại');
    }

    const requests = await this.prisma.meeting.findMany({
      where: {
        tutorId: tutor.id,
        status: MeetingStatus.PENDING,
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
        slot: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return requests;
  }
}
