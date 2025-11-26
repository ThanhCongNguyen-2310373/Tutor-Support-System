// src/data/sessions.js

const SESSION_DATA = {
  pending: [
    {
      id: "rq-001",
      studentName: "Nguyễn Lê Nguyên",
      studentId: "CO3001",

      studentCode: "2012345",
      email: "studentNguyen@hcmut.edu.vn",
      previousSessions: 3,
      courseName: "Kỹ thuật phần mềm",
      duration: "2 giờ",
      mode: "Trực tuyến (Zoom)",
      topic: "Sơ đồ UML và Mẫu thiết kế (Design Patterns)",
      conflict: false,

      weekday: "Thứ Hai",
      date: "2025-11-17",
      timeRange: "15:00–17:00 sáng",
      note: "Em đang gặp khó khăn với sơ đồ lớp và cần được hỗ trợ trong việc hiểu mối quan hệ giữa các lớp.",
      submittedAgo: "2 giờ",
    },
    {
      id: "rq-002",
      studentName: "Hoàng Hữu Nhân",
      studentId: "MT1007",
      studentCode: "2012567",
      email: "nhan.mt1007@hcmut.edu.vn",
      previousSessions: 1,
      courseName: "Toán cao cấp 2",
      duration: "2 giờ",
      mode: "Trực tiếp tại phòng A3-201",
      topic: "Ôn ma trận và định thức",
      conflict: false,

      weekday: "Thứ Tư",
      date: "2025-11-19",
      timeRange: "13:00–15:00",      
      note: "Bài tập đại số tuyến tính",
      submittedAgo: "1 ngày",
    },
    {
      id: "rq-003",
      studentName: "Phạm Minh Châu",
      studentId: "SE1402",
      studentCode: "2012789",
      email: "chau.se1402@hcmut.edu.vn",
      previousSessions: 0,
      courseName: "Cấu trúc dữ liệu và Giải thuật",
      duration: "2 giờ",           
      mode: "Trực tuyến (Teams)",
      topic: "Ôn tập giữa kỳ CTDL&GT (stack, queue, tree)",
      conflict: false,

      weekday: "Thứ Hai",
      date: "2025-11-17",
      timeRange: "09:00–11:00",      
      note: "Ôn tập giữa kỳ CTDL&GT",
      submittedAgo: "30 phút",
    },
    {
      id: "rq-004",
      studentName: "Trần Hải Đăng",
      studentId: "CO2010",
      studentCode: "2012346",
      email: "dang.co2010@hcmut.edu.vn",
      previousSessions: 2,
      courseName: "Lập trình Python",
      duration: "2 giờ",
      mode: "Trực tuyến (Zoom)",
      topic: "Hướng dẫn đồ án nhỏ Python",
      conflict: false,

      weekday: "Chủ Nhật",
      date: "2025-11-23",
      timeRange: "09:00–11:00",      // ✅ khung 9–11
      note: "Hướng dẫn đồ án nhỏ Python",
      submittedAgo: "3 giờ",
    },
    {
      id: "rq-005",
      studentName: "Võ Thị Mỹ Linh",
      studentId: "EE2045",
      studentCode: "2012901",
      email: "linh.ee2045@hcmut.edu.vn",
      previousSessions: 1,
      courseName: "Mạch điện cơ bản",
      duration: "2 giờ",
      mode: "Trực tiếp tại phòng B4-301",
      topic: "Ôn tập mạch điện cơ bản",
      conflict: false,

      weekday: "Thứ Ba",
      date: "2025-11-18",
      timeRange: "15:00–17:00",      // ✅ khung 15–17
      note: "Ôn tập mạch điện cơ bản",
      submittedAgo: "5 giờ",
    },
  ],
  confirmed: [
    {
      id: "cf-201",
      studentName: "Đào Thanh Phong",
      studentId: "CO3010",
      studentCode: "2012111",
      email: "phong.co3010@hcmut.edu.vn",
      previousSessions: 2,
      courseName: "Lập trình hướng đối tượng",
      duration: "2 giờ",             // ✅ 2 giờ
      mode: "Trực tuyến (Zoom)",
      topic: "Thảo luận bài tập lớn OOP",
      conflict: false,

      weekday: "Thứ Năm",
      date: "2025-11-20",
      timeRange: "07:00–09:00",      // ✅ khung 7–9
      note: "Thảo luận bài tập lớn OOP",
    },
    {
      id: "cf-202",
      studentName: "Lê Quỳnh Như",
      studentId: "MA2003",
      studentCode: "2012333",
      email: "nhu.ma2003@hcmut.edu.vn",
      previousSessions: 1,
      courseName: "Xác suất thống kê",
      duration: "2 giờ",             
      mode: "Trực tiếp tại thư viện",
      topic: "Ôn xác suất thống kê",
      conflict: false,

      weekday: "Thứ Bảy",
      date: "2025-11-22",
      timeRange: "13:00–15:00",    
      note: "Ôn xác suất thống kê",
    },
  ],
};

// giống style getCourseListFromDetail()
export function getSessions() {
  return JSON.parse(JSON.stringify(SESSION_DATA));
}

// Chấp nhận 1 yêu cầu trong pending → đẩy sang confirmed
export function acceptSession(id) {
  const idx = SESSION_DATA.pending.findIndex((s) => s.id === id);
  if (idx === -1) return getSessions(); // không thấy thì thôi

  const item = SESSION_DATA.pending.splice(idx, 1)[0];

  // bỏ submittedAgo, giữ các field còn lại
  const { submittedAgo, ...rest } = item;

  const toConfirmed = {
    id: `cf-${Date.now()}`, // id mới cho confirmed
    ...rest,
  };

  SESSION_DATA.confirmed.unshift(toConfirmed);
  return getSessions();
}

// Từ chối 1 yêu cầu trong pending → chỉ xóa khỏi pending
export function rejectSession(id) {
  const idx = SESSION_DATA.pending.findIndex((s) => s.id === id);
  if (idx === -1) return getSessions();

  SESSION_DATA.pending.splice(idx, 1);
  return getSessions();
}
