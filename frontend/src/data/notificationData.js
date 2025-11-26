// src/data/notificationData.js

export const notificationStats = {
  total: 1234,
  sent: 1180,
  pending: 42,
  failed: 12
};

export const notificationList = [
  {
    id: 'notif_001',
    title: 'Nhắc nhở nộp bài tập tuần 5',
    recipient: '45 students',
    recipientCount: 45,
    status: 'sent',
    time: '10:30 AM',
    createdDate: '2025-10-24'
  },
  {
    id: 'notif_002',
    title: 'Thông báo thay đổi lịch học',
    recipient: 'All users',
    recipientCount: 165,
    status: 'sent',
    time: '09:15 AM',
    createdDate: '2025-10-24'
  },
  {
    id: 'notif_003',
    title: 'Deadline đăng ký TA sắp hết hạn',
    recipient: '120 students',
    recipientCount: 120,
    status: 'pending',
    time: '08:00 AM',
    createdDate: '2025-10-24'
  },
  {
    id: 'notif_004',
    title: 'Xác nhận ghép cặp Tutor-Student',
    recipient: '12 students',
    recipientCount: 12,
    status: 'failed',
    time: '07:45 AM',
    createdDate: '2025-10-24'
  },
  {
    id: 'notif_005',
    title: 'Thông báo buổi học bổ sung',
    recipient: '30 students',
    recipientCount: 30,
    status: 'sent',
    time: '07:00 AM',
    createdDate: '2025-10-24'
  }
];

export const notificationLogs = [
  {
    id: 'msg_001',
    messageId: 'msg_001',
    recipient: 'student456',
    recipientName: 'Trần Văn A',
    status: 'success',
    channel: 'Dashboard',
    timestamp: '2025-10-24 14:30:00',
    title: 'Nhắc nhở nộp bài tập'
  },
  {
    id: 'msg_002',
    messageId: 'msg_002',
    recipient: 'tutor789',
    recipientName: 'Nguyễn Thị B',
    status: 'success',
    channel: 'Dashboard + Email',
    timestamp: '2025-10-24 14:29:45',
    title: 'Thông báo lịch dạy'
  },
  {
    id: 'msg_003',
    messageId: 'msg_003',
    recipient: 'student123',
    recipientName: 'Lê Văn C',
    status: 'retry',
    channel: 'Dashboard',
    timestamp: '2025-10-24 14:29:30',
    title: 'Nhắc nộp bài'
  },
  {
    id: 'msg_004',
    messageId: 'msg_004',
    recipient: 'all_users',
    recipientName: 'Tất cả người dùng',
    status: 'success',
    channel: 'Dashboard',
    timestamp: '2025-10-24 14:28:15',
    title: 'Thông báo chung'
  },
  {
    id: 'msg_005',
    messageId: 'msg_005',
    recipient: 'invalid_user',
    recipientName: 'User không tồn tại',
    status: 'failed',
    channel: 'Dashboard',
    timestamp: '2025-10-24 14:27:00',
    title: 'Test notification'
  }
];

export const scheduledNotifications = [
  {
    id: 'schedule_001',
    name: 'Nhắc nộp bài hằng tuần',
    schedule: 'Mỗi thứ 6, 10:00 AM',
    recipients: '45 students',
    recipientCount: 45,
    active: true,
    lastRun: '2025-10-18 10:00:00',
    nextRun: '2025-10-25 10:00:00'
  },
  {
    id: 'schedule_002',
    name: 'Tổng kết tiến độ hằng tháng',
    schedule: 'Ngày 1 hằng tháng, 9:00 AM',
    recipients: 'All tutors',
    recipientCount: 25,
    active: true,
    lastRun: '2025-10-01 09:00:00',
    nextRun: '2025-11-01 09:00:00'
  },
  {
    id: 'schedule_003',
    name: 'Nhắc đánh giá sau buổi học',
    schedule: '2 giờ sau mỗi buổi học',
    recipients: 'Paired students',
    recipientCount: 80,
    active: false,
    lastRun: '2025-10-20 16:00:00',
    nextRun: null
  },
  {
    id: 'schedule_004',
    name: 'Báo cáo tuần cho Admin',
    schedule: 'Mỗi chủ nhật, 8:00 PM',
    recipients: 'Admins',
    recipientCount: 3,
    active: true,
    lastRun: '2025-10-20 20:00:00',
    nextRun: '2025-10-27 20:00:00'
  }
];

export const recipientGroups = [
  { id: 'all_students', name: 'All Students', count: 120 },
  { id: 'all_tutors', name: 'All Tutors', count: 25 },
  { id: 'all_coordinators', name: 'All Coordinators', count: 5 },
  { id: 'all_admins', name: 'All Admins', count: 3 },
  { id: 'cc01', name: 'Lớp CC01', count: 30 },
  { id: 'cc02', name: 'Lớp CC02', count: 28 },
  { id: 'cc03', name: 'Lớp CC03', count: 32 }
];

export const notificationTemplates = [
  {
    id: 'template_001',
    name: 'Nhắc nhở nộp bài',
    title: 'Nhắc nhở nộp bài tập',
    content: 'Bạn có bài tập sắp đến hạn. Vui lòng hoàn thành và nộp bài đúng thời gian.',
    priority: 'normal'
  },
  {
    id: 'template_002',
    name: 'Thông báo lịch học',
    title: 'Thay đổi lịch học',
    content: 'Lịch học của bạn đã có thay đổi. Vui lòng kiểm tra lịch mới.',
    priority: 'important'
  },
  {
    id: 'template_003',
    name: 'Xác nhận ghép cặp',
    title: 'Xác nhận ghép cặp Tutor-Student',
    content: 'Bạn đã được ghép cặp thành công. Vui lòng liên hệ với người được ghép.',
    priority: 'urgent'
  }
];