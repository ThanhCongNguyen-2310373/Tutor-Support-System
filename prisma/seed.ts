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
      phoneNumber: '0901234567', // ✅ Admin phone
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
      phoneNumber: '0902345678', // ✅ Coordinator phone
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
      phoneNumber: '0903456789', // ✅ TBM phone
    },
  });
  console.log('✅ Created TBM:', tbm.email);

  // 3. Create 5 Tutors with Detailed Profiles (for AI Testing)
  const tutors = [];
  
  // Tutor 1: Giải Tích expert (rating cao)
  const tutor1 = await prisma.user.upsert({
    where: { email: 'tutor1@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'tutor1@hcmut.edu.vn',
      password: await bcrypt.hash('tutor123', 10),
      fullName: 'TS. Nguyễn Văn A',
      mssv: 'TUTOR001',
      role: Role.TUTOR,
      department: 'KHOA KHOA HỌC ỨNG DỤNG', // ✅ Khoa Toán - Tin
      phoneNumber: '0904567890', // ✅ Tutor 1 phone
    },
  });
  const tutorProfile1 = await prisma.tutorProfile.upsert({
    where: { userId: tutor1.id },
    update: {},
    create: {
      userId: tutor1.id,
      bio: 'Giảng viên khoa Toán - Tin, chuyên Giải Tích và Toán Cao Cấp. 10 năm kinh nghiệm giảng dạy.',
      expertise: ['Giải Tích 1', 'Giải Tích 2', 'Toán Cao Cấp A1', 'Giải Tích Hàm'],
      averageRating: 4.8,
      available: true,
    },
  });
  tutors.push({ user: tutor1, profile: tutorProfile1 });
  console.log('✅ Created Tutor 1:', tutor1.email, `(${tutor1.department})`);

  // Tutor 2: Đại Số expert (rating trung bình)
  const tutor2 = await prisma.user.upsert({
    where: { email: 'tutor2@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'tutor2@hcmut.edu.vn',
      password: await bcrypt.hash('tutor123', 10),
      fullName: 'ThS. Trần Thị B',
      mssv: 'TUTOR002',
      role: Role.TUTOR,
      department: 'KHOA KHOA HỌC ỨNG DỤNG', // ✅ Khoa Toán - Tin
      phoneNumber: '0905678901', // ✅ Tutor 2 phone
    },
  });
  const tutorProfile2 = await prisma.tutorProfile.upsert({
    where: { userId: tutor2.id },
    update: {},
    create: {
      userId: tutor2.id,
      bio: 'Chuyên gia Đại Số Tuyến Tính và Lý thuyết số. Nghiên cứu sinh ngành Toán Ứng Dụng.',
      expertise: ['Đại Số Tuyến Tính', 'Đại Số Đại Cương', 'Toán Rời Rạc'],
      averageRating: 4.5,
      available: true,
    },
  });
  tutors.push({ user: tutor2, profile: tutorProfile2 });
  console.log('✅ Created Tutor 2:', tutor2.email, `(${tutor2.department})`);

  // Tutor 3: Multi-subject (rating cao)
  const tutor3 = await prisma.user.upsert({
    where: { email: 'tutor3@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'tutor3@hcmut.edu.vn',
      password: await bcrypt.hash('tutor123', 10),
      fullName: 'ThS. Lê Văn C',
      mssv: 'TUTOR003',
      role: Role.TUTOR,
      department: 'KHOA KHOA HỌC ỨNG DỤNG', // ✅ Khoa Toán - Tin
      phoneNumber: '0906789012', // ✅ Tutor 3 phone
    },
  });
  const tutorProfile3 = await prisma.tutorProfile.upsert({
    where: { userId: tutor3.id },
    update: {},
    create: {
      userId: tutor3.id,
      bio: 'Tutor đa năng với kinh nghiệm 5 năm. Từng đạt giải Nhất Olympic Toán sinh viên.',
      expertise: ['Giải Tích 1', 'Đại Số Tuyến Tính', 'Vật Lý Đại Cương 1', 'Xác Suất Thống Kê'],
      averageRating: 4.9,
      available: true,
    },
  });
  tutors.push({ user: tutor3, profile: tutorProfile3 });
  console.log('✅ Created Tutor 3:', tutor3.email, `(${tutor3.department})`);

  // Tutor 4: Beginner (rating thấp)
  const tutor4 = await prisma.user.upsert({
    where: { email: 'tutor4@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'tutor4@hcmut.edu.vn',
      password: await bcrypt.hash('tutor123', 10),
      fullName: 'Phạm Thị D',
      mssv: 'TUTOR004',
      role: Role.TUTOR,
      department: 'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH', // ✅ Khoa Máy Tính
      phoneNumber: '0907890123', // ✅ Tutor 4 phone
    },
  });
  const tutorProfile4 = await prisma.tutorProfile.upsert({
    where: { userId: tutor4.id },
    update: {},
    create: {
      userId: tutor4.id,
      bio: 'Sinh viên năm 4 ngành Toán Tin. Mới bắt đầu làm tutor, nhiệt tình và tận tâm.',
      expertise: ['Giải Tích 1', 'Toán Cao Cấp A1'],
      averageRating: 3.2,
      available: true,
    },
  });
  tutors.push({ user: tutor4, profile: tutorProfile4 });
  console.log('✅ Created Tutor 4:', tutor4.email, `(${tutor4.department})`);

  // Tutor 5: Vật Lý expert (cho test môn không match)
  const tutor5 = await prisma.user.upsert({
    where: { email: 'tutor5@hcmut.edu.vn' },
    update: {},
    create: {
      email: 'tutor5@hcmut.edu.vn',
      password: await bcrypt.hash('tutor123', 10),
      fullName: 'PGS. Hoàng Văn E',
      mssv: 'TUTOR005',
      role: Role.TUTOR,
      department: 'KHOA KHOA HỌC ỨNG DỤNG', // ✅ Khoa Vật Lý Kỹ Thuật
      phoneNumber: '0908901234', // ✅ Tutor 5 phone
    },
  });
  const tutorProfile5 = await prisma.tutorProfile.upsert({
    where: { userId: tutor5.id },
    update: {},
    create: {
      userId: tutor5.id,
      bio: 'Phó Giáo sư khoa Vật Lý Kỹ Thuật. Chuyên Cơ Học Lượng Tử và Nhiệt Động Lực.',
      expertise: ['Vật Lý Đại Cương 1', 'Vật Lý Đại Cương 2', 'Cơ Học Lượng Tử'],
      averageRating: 4.7,
      available: true,
    },
  });
  tutors.push({ user: tutor5, profile: tutorProfile5 });
  console.log('✅ Created Tutor 5:', tutor5.email, `(${tutor5.department})`)

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
        phoneNumber: `090${Math.floor(1000000 + Math.random() * 9000000)}`, // ✅ Random phone
        studentClass: `CC${20 + Math.floor(i / 3)}MB`, // ✅ Class: CC20MB, CC21MB, CC22MB, CC23MB
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