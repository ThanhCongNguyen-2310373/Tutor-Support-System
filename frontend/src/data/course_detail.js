// src/data/course_detail.js
export const COURSE_DETAIL = {
  CO3001: {
    id: "CO3001",
    name: "Kỹ thuật phần mềm",
    desc:
      "Các phương pháp phát triển phần mềm nâng cao, quy trình Agile/Scrum, kiểm thử và đảm bảo chất lượng.",
    teacherSummary:
      "Giảng viên Nguyễn Lê Nguyên: Ph.D. Software Engineering, 10+ năm kinh nghiệm công nghiệp.",
    slots: [
      { day: "Thứ hai", time: "13:00–15:00", teacher: "Thầy Nguyên", seats: 15 },
      { day: "Thứ tư",  time: "13:00–15:00", teacher: "Thầy Hùng",   seats: 1  },
      { day: "Thứ sáu", time: "13:00–15:00", teacher: "Thầy Thắng",  seats: 0  },
    ],
  },

  CO3011: {
    id: "CO3011",
    name: "Cơ sở dữ liệu nâng cao",
    desc:
      "Mô hình ER mở rộng, chuẩn hoá, tối ưu truy vấn, xử lý song song; phân mảnh & nhân bản trong hệ CSDL phân tán.",
    teacherSummary:
      "Giảng viên Trần Minh Quân: Ph.D. Database Systems, 8+ năm kinh nghiệm giảng dạy & tư vấn doanh nghiệp.",
    slots: [
      { day: "Thứ hai",  time: "07:30–09:30", teacher: "Thầy Quân", seats: 10 },
      { day: "Thứ tư",   time: "09:45–11:45", teacher: "Cô Hà",     seats: 5  },
      { day: "Thứ sáu",  time: "13:00–15:00", teacher: "Thầy Quân", seats: 0  },
    ],
  },

  CO3094: {
    id: "CO3094",
    name: "Trí tuệ nhân tạo cơ bản",
    desc:
      "Tìm kiếm trạng thái, heuristic, xác suất; học có giám sát: hồi quy, phân lớp; thực hành Python/NumPy.",
    teacherSummary:
      "Giảng viên Phạm Bảo An: M.Sc. AI/ML, 6+ năm kinh nghiệm kỹ sư ML trong công nghiệp.",
    slots: [
      { day: "Thứ ba",   time: "13:00–15:00", teacher: "Thầy An",  seats: 20 },
      { day: "Thứ năm",  time: "07:00–09:00", teacher: "Cô Uyên", seats: 2  },
      { day: "Thứ bảy",  time: "09:00–11:00", teacher: "Thầy An",  seats: 0  },
    ],
  },
};

// Helpers để lấy summary cho Register list
export const getCourseListFromDetail = () => {
  return Object.values(COURSE_DETAIL).map((c) => {
    const teachers = new Set(c.slots.map((s) => s.teacher)).size;
    const remaining = c.slots.reduce((sum, s) => sum + Math.max(0, s.seats || 0), 0);
    // Lịch tóm tắt: "Thứ hai 13:00–15:00, Thứ tư 13:00–15:00, ..."
    const schedule = c.slots.map((s) => `${s.day} ${s.time}`).join(", ");
    return { id: c.id, name: c.name, teachers, remaining, schedule };
  });
};
