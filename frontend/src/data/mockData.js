// drlData.js - Dữ liệu mẫu cho trang xét điểm rèn luyện

export const studentData = [
  {
    id: 1,
    mssv: "2211234",
    name: "Nguyễn Văn A",
    class: "MT01",
    gpa: 3.45,
    sessions: "12/12",
    drlBonus: 5.0,
    status: "completed"
  },
  {
    id: 2,
    mssv: "2211235",
    name: "Trần Thị B",
    class: "MT01",
    gpa: 3.67,
    sessions: "11/12",
    drlBonus: 5.0,
    status: "completed"
  },
  {
    id: 3,
    mssv: "2211236",
    name: "Lê Văn C",
    class: "MT02",
    gpa: 2.98,
    sessions: "10/12",
    drlBonus: 4.0,
    status: "completed"
  },
  {
    id: 4,
    mssv: "2211237",
    name: "Phạm Thị D",
    class: "MT02",
    gpa: 3.12,
    sessions: "12/12",
    drlBonus: 5.0,
    status: "completed"
  },
  {
    id: 5,
    mssv: "2211238",
    name: "Hoàng Văn E",
    class: "MT03",
    gpa: 2.45,
    sessions: "8/12",
    drlBonus: 3.0,
    status: "incomplete"
  },
  {
    id: 6,
    mssv: "2211239",
    name: "Vũ Thị F",
    class: "MT03",
    gpa: 3.89,
    sessions: "12/12",
    drlBonus: 6.0,
    status: "completed"
  },
  {
    id: 7,
    mssv: "2211240",
    name: "Đặng Văn G",
    class: "MT04",
    gpa: 2.67,
    sessions: "6/12",
    drlBonus: 2.0,
    status: "incomplete"
  },
  {
    id: 8,
    mssv: "2211241",
    name: "Bùi Thị H",
    class: "MT04",
    gpa: 3.23,
    sessions: "11/12",
    drlBonus: 5.0,
    status: "completed"
  },
  {
    id: 9,
    mssv: "2211242",
    name: "Đinh Văn I",
    class: "MT05",
    gpa: 2.12,
    sessions: "0/12",
    drlBonus: 0.0,
    status: "warning"
  },
  {
    id: 10,
    mssv: "2211243",
    name: "Mai Thị K",
    class: "MT05",
    gpa: 3.56,
    sessions: "12/12",
    drlBonus: 5.0,
    status: "completed"
  }
];

export const overviewStats = {
  totalStudents: 1847,
  participationRate: 87.9,
  participationCount: 1623,
  averageGpa: 3.12,
  averageDrlBonus: 4.2
};

export const faculties = [
  "Tất cả khoa",
  "Khoa Khoa học và Kỹ thuật Máy tính",
  "Khoa Cơ khí",
  "Khoa Điện - Điện tử",
  "Khoa Hóa học",
  "Khoa Môi trường"
];

export const majors = [
  "Tất cả ngành",
  "Khoa học máy tính",
  "Kỹ thuật phần mềm",
  "Hệ thống thông tin",
  "Công nghệ thông tin"
];

export const classes = [
  "Tất cả lớp",
  "MT01",
  "MT02",
  "MT03",
  "MT04",
  "MT05"
];

export const gpaRanges = [
  "Tất cả",
  "< 2.0",
  "2.0 - 2.5",
  "2.5 - 3.0",
  "3.0 - 3.5",
  "> 3.5"
];

export const scoringRules = [
  "Tham gia ≥90% buổi học → +5 điểm ĐRL",
  "Tham gia 70-89% buổi học → +3 điểm ĐRL",
  "Tham gia <70% buổi học → +0 điểm ĐRL",
  "GPA tăng ≥10% → +3 điểm ĐRL",
  "GPA tăng 5-7% → +2 điểm ĐRL",
  "Đánh giá xuất sắc (≥4.5⭐) → +1 điểm ĐRL (Bonus)"
];

export const studentDetail = {
  mssv: "2211234",
  name: "Nguyễn Văn A",
  class: "MT01",
  faculty: "CNTT",
  academicRecord: {
    currentGpa: 3.45,
    previousGpa: 3.02,
    improvement: 14.2
  },
  tutorParticipation: {
    totalSessions: 12,
    attended: 12,
    attendanceRate: 100,
    subject: "Giải tích 1, Đại số tuyến tính",
    tutors: "TS. Trần Văn X, ThS. Nguyễn Y",
    rating: 5.0,
    ratingComment: "Rất tích cực và tiến bộ"
  },
  drlCalculation: {
    attendanceBonus: 5.0,
    gpaImprovementBonus: 3.0,
    ratingBonus: 1.0,
    totalBonus: 9.0
  }
};