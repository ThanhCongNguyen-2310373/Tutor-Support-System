import { PrismaClient, Role, MeetingStatus, ComplaintStatus, TutorApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Danh sách các khoa
const faculties = [
  'KHOA CƠ KHÍ',
  'KHOA KỸ THUẬT ĐỊA CHẤT VÀ DẦU KHÍ',
  'KHOA ĐIỆN - ĐIỆN TỬ',
  'KHOA KỸ THUẬT GIAO THÔNG',
  'KHOA KỸ THUẬT HÓA HỌC',
  'KHOA MÔI TRƯỜNG VÀ TÀI NGUYÊN',
  'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH',
  'KHOA QUẢN LÝ CÔNG NGHIỆP',
  'KHOA KHOA HỌC ỨNG DỤNG',
  'KHOA CÔNG NGHỆ VẬT LIỆU',
  'KHOA KỸ THUẬT XÂY DỰNG',
];

const adminDepartment = 'BAN QUẢN TRỊ';

// Hàm lấy ngẫu nhiên 1 khoa
function getRandomFaculty() {
  return faculties[Math.floor(Math.random() * faculties.length)];
}

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
      department: adminDepartment, // ✅ Admin thuộc Ban Quản Trị
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
      department: adminDepartment, // ✅ Coordinator thuộc Ban Quản Trị
    },
  });
  console.log('✅ Created Coordinator:', coordinator.email);

  // Create TBM (Trưởng Bộ Môn)
  const tbm = await prisma.user.upsert({
    where: { email: 'tbm@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'tbm@hcmut.edu.vn',
      password: await bcrypt.hash('tbm123', 10),
      fullName: 'Quản Thành Thơ',
      mssv: 'TBM001',
      role: Role.TBM,
      department: 'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH', // ✅ Ví dụ TBM thuộc khoa Máy Tính
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
        department: getRandomFaculty(), // ✅ Tutor thuộc 1 khoa ngẫu nhiên
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
    console.log(`✅ Created Tutor ${i}:`, tutor.email, `(${tutor.department})`);
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
        department: getRandomFaculty(), // ✅ Student thuộc 1 khoa ngẫu nhiên
      },
    });
    students.push(student);
    console.log(`✅ Created Student ${i}:`, student.email, `(${student.department})`);
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

  // 9. Create Sample Tutor Applications (Self-applications)
  for (let i = 0; i < 3; i++) {
    await prisma.tutorApplication.create({
      data: {
        studentId: students[i].id,
        // tbmId is now optional, so we omit it to simulate self-application
        status: TutorApplicationStatus.PENDING,
        // Adding mock data for the application details
        bio: `Tôi là ${students[i].fullName}, có niềm đam mê giảng dạy và thành tích tốt các môn đại cương.`,
        expertise: ['Giải Tích', 'Vật Lý 1&2', 'Hóa Đại Cương'].slice(0, 2), // Mock expertise
      },
    });
  }
  console.log('✅ Created 3 tutor applications (Self-applied)');

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