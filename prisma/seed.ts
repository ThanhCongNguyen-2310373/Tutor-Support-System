import { PrismaClient, Role, MeetingStatus, ComplaintStatus, TutorApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- CONSTANTS & HELPERS ---

const FACULTIES = [
  'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH',
  'KHOA ĐIỆN - ĐIỆN TỬ',
  'KHOA CƠ KHÍ',
  'KHOA KỸ THUẬT HÓA HỌC',
  'KHOA KỸ THUẬT XÂY DỰNG',
  'KHOA QUẢN LÝ CÔNG NGHIỆP',
  'KHOA CÔNG NGHỆ VẬT LIỆU',
  'KHOA KỸ THUẬT GIAO THÔNG',
  'KHOA MÔI TRƯỜNG VÀ TÀI NGUYÊN',
  'KHOA TOÁN ỨNG DỤNG', // Khoa khoa học ứng dụng
];

const SUBJECTS = {
  IT: ['Lập trình C++', 'Cấu trúc dữ liệu', 'Nhập môn điện toán', 'Mạng máy tính', 'Hệ điều hành'],
  EE: ['Mạch điện 1', 'Điện tử số', 'Vi xử lý', 'Trường điện từ'],
  ME: ['Cơ lý thuyết', 'Sức bền vật liệu', 'Chi tiết máy', 'Vẽ kỹ thuật'],
  GEN: ['Giải tích 1', 'Giải tích 2', 'Đại số tuyến tính', 'Vật lý đại cương'],
};

const ADMIN_DEPT = 'BAN QUẢN TRỊ';

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generatePhone() {
  return `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

function generateGPA() {
  return parseFloat((Math.random() * (4.0 - 2.0) + 2.0).toFixed(2)); // 2.0 - 4.0
}

// --- MAIN SEEDING ---

async function main() {
  console.log('🌱 Starting database seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ==========================================
  // 1. SEED SYSTEM ADMINS & STAFF
  // ==========================================
  console.log('Creating Admin & Staff...');

  await prisma.user.create({
    data: {
      email: 'osa@hcmut.edu.vn',
      password: hashedPassword,
      fullName: 'Super Admin',
      mssv: 'ADMIN000',
      role: Role.OSA,
      department: ADMIN_DEPT,
      phoneNumber: generatePhone(),

    },
  });
  await prisma.user.create({
    data: {
      email: 'admin@hcmut.edu.vn',
      password: hashedPassword,
      fullName: 'Super Admin',
      mssv: 'ADMIN001',
      role: Role.ADMIN,
      department: ADMIN_DEPT,
      phoneNumber: generatePhone(),

    },
  });

  await prisma.user.create({
    data: {
      email: 'coord@hcmut.edu.vn',
      password: hashedPassword,
      fullName: 'Nguyễn Điều Phối',
      mssv: 'COORD001',
      role: Role.COORDINATOR,
      department: ADMIN_DEPT,
      phoneNumber: generatePhone(),
    },
  });

  await prisma.user.create({
    data: {
      email: 'tbm.cse@hcmut.edu.vn',
      password: hashedPassword,
      fullName: 'TS. Phạm Trưởng Khoa',
      mssv: 'TBM001',
      role: Role.TBM,
      department: 'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH',
      phoneNumber: generatePhone(),

    },
  });

  // ==========================================
  // 2. SEED STUDENTS (Số lượng lớn: 50 SV)
  // ==========================================
  console.log('Creating 50 Students...');
  const students = [];
  
  for (let i = 1; i <= 50; i++) {
    const dept = getRandomItem(FACULTIES);
    // MSSV số: 21xxxxx
    const mssv = `21${Math.floor(10000 + Math.random() * 90000)}`; 
    
    // Dùng upsert để không lỗi nếu chạy lại
    const s = await prisma.user.upsert({
      where: { email: `student${i}@hcmut.edu.vn` },
      update: {},
      create: {
        email: `student${i}@hcmut.edu.vn`,
        password: hashedPassword,
        fullName: `Sinh viên ${i}`,
        mssv: mssv,
        role: Role.STUDENT,
        department: dept,
        phoneNumber: generatePhone(),
        studentClass: `CC${20 + Math.floor(i / 10)}MB`,
        gpa: generateGPA(),
      },
    });
    students.push(s);
  }

  // ==========================================
  // 3. SEED TUTORS (3 Loại: SV, GV, NCS)
  // ==========================================
  console.log('Creating Tutors...');
  const tutors = [];

  // --- PHẦN A: 5 Tutor Cụ Thể (Từ main - Để test AI) ---
  const tutorData = [
    { email: 'tutor1@hcmut.edu.vn', name: 'TS. Nguyễn Văn A', mssv: 'TUTOR001', phone: '0904567890', dept: 'KHOA KHOA HỌC ỨNG DỤNG', expertise: ['Giải Tích 1', 'Giải Tích 2', 'Toán Cao Cấp A1', 'Giải Tích Hàm'], bio: 'Giảng viên khoa Toán - Tin, chuyên Giải Tích.', rating: 4.8 },
    { email: 'tutor2@hcmut.edu.vn', name: 'ThS. Trần Thị B', mssv: 'TUTOR002', phone: '0905678901', dept: 'KHOA KHOA HỌC ỨNG DỤNG', expertise: ['Đại Số Tuyến Tính', 'Đại Số Đại Cương', 'Toán Rời Rạc'], bio: 'Chuyên gia Đại Số Tuyến Tính.', rating: 4.5 },
    { email: 'tutor3@hcmut.edu.vn', name: 'ThS. Lê Văn C', mssv: 'TUTOR003', phone: '0906789012', dept: 'KHOA KHOA HỌC ỨNG DỤNG', expertise: ['Giải Tích 1', 'Đại Số Tuyến Tính', 'Vật Lý Đại Cương 1', 'Xác Suất Thống Kê'], bio: 'Tutor đa năng, kinh nghiệm 5 năm.', rating: 4.9 },
    { email: 'tutor4@hcmut.edu.vn', name: 'Phạm Thị D', mssv: 'TUTOR004', phone: '0907890123', dept: 'KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH', expertise: ['Giải Tích 1', 'Toán Cao Cấp A1'], bio: 'Sinh viên năm 4, nhiệt tình.', rating: 3.2 },
    { email: 'tutor5@hcmut.edu.vn', name: 'PGS. Hoàng Văn E', mssv: 'TUTOR005', phone: '0908901234', dept: 'KHOA KHOA HỌC ỨNG DỤNG', expertise: ['Vật Lý Đại Cương 1', 'Vật Lý Đại Cương 2', 'Cơ Học Lượng Tử'], bio: 'Phó Giáo sư khoa Vật Lý Kỹ Thuật.', rating: 4.7 }
  ];

  for (const t of tutorData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email, password: hashedPassword, fullName: t.name, mssv: t.mssv, role: Role.TUTOR, department: t.dept, phoneNumber: t.phone
      }
    });
    const profile = await prisma.tutorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, bio: t.bio, expertise: t.expertise, averageRating: t.rating, available: true }
    });
    tutors.push({ user, profile });
  }

  // --- PHẦN B: Random Tutors (Từ group-meeting-logic - Để tăng số lượng) ---
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `sv.tutor${i}@hcmut.edu.vn`,
        password: hashedPassword,
        fullName: `Nguyễn Văn Tutor SV ${i}`,
        mssv: `19${Math.floor(10000 + Math.random() * 90000)}`,
        role: Role.TUTOR,
        department: getRandomItem(FACULTIES),
        phoneNumber: generatePhone(),
      },
    });
    const profile = await prisma.tutorProfile.create({
      data: {
        userId: user.id,
        bio: 'Sinh viên giỏi, hỗ trợ nhiệt tình.',
        expertise: getRandomItems([...SUBJECTS.GEN, ...SUBJECTS.IT], 3),
        available: true,
        averageRating: 4.0 + Math.random(),
      }
    });
    tutors.push({ user, profile });
  }

  // C. Researcher Tutors (Nghiên cứu sinh) - 5 người
  // MSSV bắt đầu bằng 'NCS'
  for (let i = 1; i <= 5; i++) {
    const mssv = `NCS${Math.floor(1000 + Math.random() * 9000)}`;
    const user = await prisma.user.create({
      data: {
        email: `ncs.tutor${i}@hcmut.edu.vn`,
        password: hashedPassword,
        fullName: `ThS. Lê Nghiên Cứu ${i}`,
        mssv: mssv,
        role: Role.TUTOR,
        department: 'KHOA ĐIỆN - ĐIỆN TỬ',
        phoneNumber: generatePhone(),

      },
    });

    const profile = await prisma.tutorProfile.create({
      data: {
        userId: user.id,
        bio: 'Nghiên cứu sinh, chuyên sâu về AI và Vi mạch.',
        expertise: getRandomItems(SUBJECTS.EE, 3),
        available: true,
        averageRating: 4.8,
      }
    });
    tutors.push({ user, profile });
  }

  // ==========================================
  // 4. SEED AVAILABILITY SLOTS & MEETINGS
  // ==========================================
  console.log('Generating Slots & Meetings...');
  
  const now = new Date();
  
  for (const tutor of tutors) {
    // Mỗi tutor tạo 10 slots trong 7 ngày tới
    for (let day = 0; day < 10; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + (day % 7)); // Rải đều trong tuần
      
      const startHour = 8 + Math.floor(Math.random() * 8); // 8h - 16h
      const startTime = new Date(date.setHours(startHour, 0, 0, 0));
      const endTime = new Date(date.setHours(startHour + 2, 0, 0, 0)); // Ca 2 tiếng

      // Random loại lớp: 1-1 (60%) hoặc Nhóm (40%)
      const isGroupClass = Math.random() > 0.6;
      const maxStudents = isGroupClass ? 5 : 1;

      // Random trạng thái booking
      // 30% Trống, 30% Pending, 20% Confirmed, 20% Completed
      const randStatus = Math.random();
      let bookingStatus = 'EMPTY';
      if (randStatus > 0.3) bookingStatus = 'PENDING';
      if (randStatus > 0.6) bookingStatus = 'CONFIRMED';
      if (randStatus > 0.8) bookingStatus = 'COMPLETED';

      // Tạo Slot
      const slot = await prisma.availabilitySlot.create({
        data: {
          tutorId: tutor.profile.id,
          startTime,
          endTime,
          maxStudents,
          isBooked: bookingStatus !== 'EMPTY', // Nếu có người đặt thì set booked tạm (logic thực tế phức tạp hơn chút)
        }
      });

      // Nếu không trống -> Tạo Meeting
      if (bookingStatus !== 'EMPTY') {
        // Lấy ngẫu nhiên 1 hoặc nhiều sinh viên
        const participantCount = isGroupClass ? Math.floor(Math.random() * 3) + 1 : 1;
        const participants = getRandomItems(students, participantCount);
        
        // Map status string sang Enum
        let statusEnum: MeetingStatus = MeetingStatus.PENDING;
        if (bookingStatus === 'CONFIRMED') statusEnum = MeetingStatus.CONFIRMED;
        if (bookingStatus === 'COMPLETED') statusEnum = MeetingStatus.COMPLETED;

        const meeting = await prisma.meeting.create({
          data: {
            tutorId: tutor.profile.id,
            slotId: slot.id,
            startTime,
            endTime,
            status: statusEnum,
            topic: `Học ${getRandomItem(tutor.profile.expertise)}`,
            // 🟢 Quan hệ N-N: Connect danh sách sinh viên
            students: {
              connect: participants.map(p => ({ id: p.id }))
            }
          }
        });

        // Nếu Completed -> Tạo Rating & Progress
        if (bookingStatus === 'COMPLETED') {
          for (const p of participants) {
            // Student rate Tutor
            await prisma.rating.create({
              data: {
                studentId: p.id,
                meetingId: meeting.id,
                score: 4 + Math.floor(Math.random() * 2), // 4 hoặc 5
                comment: 'Thầy dạy rất dễ hiểu, nhiệt tình!',
              }
            });

            // Tutor ghi progress cho Student
            await prisma.progressRecord.create({
              data: {
                tutorId: tutor.profile.id,
                studentId: p.id,
                // meetingId: meeting.id, // Nếu bạn đã thêm meetingId vào ProgressRecord
                note: `Sinh viên ${p.fullName} nắm bài tốt, cần làm thêm bài tập về nhà.`,
              }
            });
          }
        }
      }
    }
  }

  // ==========================================
  // 5. SEED TUTOR APPLICATIONS (Pending)
  // ==========================================
  console.log('Creating Tutor Applications...');
  const applicants = getRandomItems(students, 5); // 5 sinh viên nộp đơn
  
  for (const app of applicants) {
    await prisma.tutorApplication.create({
      data: {
        studentId: app.id,
        status: TutorApplicationStatus.PENDING,
        bio: `Em là ${app.fullName}, GPA ${app.gpa}, mong muốn được làm tutor hỗ trợ các bạn khóa dưới.`,
        expertise: getRandomItems(SUBJECTS.GEN, 2),
        gpa: app.gpa, // Snapshot GPA
      }
    });
  }

  console.log('🎉 Seeding completed successfully!');
  console.log(`Created:
  - 1 Admin, 1 Coord, 1 TBM
  - 50 Students
  - 20 Tutors (10 SV, 5 GV, 5 NCS)
  - ~200 Slots & Meetings`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });