import { PrismaClient, Role, MeetingStatus, ComplaintStatus, TutorApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'admin@hcmut.edu.vn',
      password: await bcrypt.hash('admin123', 10),
      fullName: 'System Administrator',
      mssv: 'ADMIN001',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Created Admin:', admin.email);

  // 2. Create Coordinator
  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'coordinator@hcmut.edu.vn',
      password: await bcrypt.hash('coord123', 10),
      fullName: 'Đinh Văn Điều Phối',
      mssv: 'COORD001',
      role: Role.COORDINATOR,
    },
  });
  console.log('✅ Created Coordinator:', coordinator.email);

  // create TBM
  const tbm = await prisma.user.upsert({
    where: { email: 'tbm@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'tbm1@hcmut.edu.vn',
      password: await bcrypt.hash('tbm123', 10),
      fullName: 'Quản Thành Thơ',
      mssv: 'TBM001',
      role: Role.TBM,
    },
  });
  console.log('✅ Created TBM:', tbm.email);

  // 3. Create 5 Tutors with Profiles
  const tutors = [];
  for (let i = 1; i <= 5; i++) {
    const tutor = await prisma.user.upsert({
      where: { email: `tutor${i}@hcmut.edu.vn` },
      update: {},
      create: {
        email: `tutor${i}@hcmut.edu.vn`,
        password: await bcrypt.hash('tutor123', 10),
        fullName: `Giảng viên ${i}`,
        mssv: `TUTOR00${i}`,
        role: Role.TUTOR,
      },
    });

    const tutorProfile = await prisma.tutorProfile.upsert({
      where: { userId: tutor.id },
      update: {},
      create: {
        userId: tutor.id,
        expertise: ['Toán', 'Lý', 'Hóa'].slice(0, Math.floor(Math.random() * 3) + 1),
        averageRating: 4 + Math.random(),
        available: true,
      },
    });

    tutors.push({ user: tutor, profile: tutorProfile });
    console.log(`✅ Created Tutor ${i}:`, tutor.email);
  }

  // 4. Create 10 Students
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@hcmut.edu.vn` },
      update: {},
      create: {
        email: `student${i}@hcmut.edu.vn`,
        password: await bcrypt.hash('student123', 10),
        fullName: `Sinh viên ${i}`,
        mssv: `211234${i.toString().padStart(2, '0')}`,
        role: Role.STUDENT,
      },
    });
    students.push(student);
    console.log(`✅ Created Student ${i}:`, student.email);
  }

  // 5. Create Availability Slots for Tutors (next 7 days)
  const now = new Date();
  for (const tutor of tutors) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Morning slot (9:00 - 11:00)
      await prisma.availabilitySlot.create({
        data: {
          tutorId: tutor.profile.id,
          startTime: new Date(date.setHours(9, 0, 0, 0)),
          endTime: new Date(date.setHours(11, 0, 0, 0)),
          isBooked: false,
        },
      });

      // Afternoon slot (14:00 - 16:00)
      await prisma.availabilitySlot.create({
        data: {
          tutorId: tutor.profile.id,
          startTime: new Date(date.setHours(14, 0, 0, 0)),
          endTime: new Date(date.setHours(16, 0, 0, 0)),
          isBooked: false,
        },
      });
    }
    console.log(`✅ Created 14 availability slots for Tutor:`, tutor.user.email);
  }

  // 6. Create Sample Meetings (COMPLETED + PENDING)
  const meetings = [];
  for (let i = 0; i < 5; i++) {
    const tutor = tutors[i % tutors.length];
    const student = students[i % students.length];
    
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        tutorId: tutor.profile.id,
        isBooked: false,
      },
    });

    if (slot) {
      const meeting = await prisma.meeting.create({
        data: {
          studentId: student.id,
          tutorId: tutor.profile.id,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: i < 3 ? MeetingStatus.COMPLETED : MeetingStatus.PENDING,
          topic: `Học môn ${['Toán', 'Lý', 'Hóa'][i % 3]}`,
        },
      });

      await prisma.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      meetings.push(meeting);
      console.log(`✅ Created Meeting ${i + 1}:`, meeting.status);
    }
  }

  // 7. Create Ratings for COMPLETED meetings
  for (const meeting of meetings.filter(m => m.status === MeetingStatus.COMPLETED)) {
    await prisma.rating.create({
      data: {
        studentId: meeting.studentId,
        meetingId: meeting.id,
        score: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: 'Giảng viên dạy rất tốt!',
      },
    });
    console.log(`✅ Created Rating for Meeting:`, meeting.id);
  }

  // 8. Create Sample Complaints
  await prisma.complaint.create({
    data: {
      studentId: students[0].id,
      meetingId: meetings[0]?.id,
      description: 'Tutor không đến đúng giờ',
      status: ComplaintStatus.OPEN,
    },
  });
  console.log('✅ Created 1 sample complaint');

  // 9. Create Sample Tutor Applications
  for (let i = 0; i < 3; i++) {
    await prisma.tutorApplication.create({
      data: {
        studentId: students[i].id,
        tbmId: tbm.id,
        status: TutorApplicationStatus.PENDING,
      },
    });
  }
  console.log('✅ Created 3 tutor applications');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
