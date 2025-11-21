# Backend API Summary & Frontend Integration Guide

> **Tổng quan**: Hệ thống có **61 endpoints** phân bố trong **10 modules**. Document này cung cấp overview về các API và cách tích hợp cơ bản vào Frontend.

## 📋 Table of Contents
- [1. Authentication Module (2 endpoints)](#1-authentication-module)
- [2. Users Module (5 endpoints)](#2-users-module)
- [3. Meetings Module (5 endpoints)](#3-meetings-module)
- [4. Tutors Module (11 endpoints)](#4-tutors-module)
- [5. Management Module (13 endpoints)](#5-management-module)
- [6. Notifications Module (6 endpoints)](#6-notifications-module)
- [7. AI Module (5 endpoints)](#7-ai-module)
- [8. External Module (14 endpoints)](#8-external-module)
- [9. Email Module (Backend Only)](#9-email-module)
- [10. Upload Module (Backend Only)](#10-upload-module)

---

## 1. Authentication Module

**Base URL**: `/auth`

### 1.1 Register
- **Endpoint**: `POST /auth/register`
- **Mô tả**: Đăng ký tài khoản mới
- **Request Body**:
  ```json
  {
    "email": "student@hcmut.edu.vn",
    "password": "password123",
    "fullName": "Nguyễn Văn A",
    "mssv": "2210001",
    "role": "STUDENT",
    "department": "KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH",
    "phoneNumber": "0901234567",
    "studentClass": "CC01"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "email": "student@hcmut.edu.vn",
    "fullName": "Nguyễn Văn A",
    "role": "STUDENT"
  }
  ```
- **Frontend Integration**:
  - Form validation: Email format, password strength
  - Toast notification khi thành công
  - Redirect về login page
  - Handle errors: Email đã tồn tại, thông tin thiếu

### 1.2 Login
- **Endpoint**: `POST /auth/login`
- **Mô tả**: Đăng nhập và nhận JWT token
- **Request Body**:
  ```json
  {
    "email": "student@hcmut.edu.vn",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "student@hcmut.edu.vn",
      "fullName": "Nguyễn Văn A",
      "role": "STUDENT"
    }
  }
  ```
- **Frontend Integration**:
  - Lưu `access_token` vào localStorage/sessionStorage
  - Lưu user info vào state management (Redux/Context)
  - Redirect theo role: STUDENT → student dashboard, TUTOR → tutor dashboard, etc.
  - Handle errors: Sai email/password, account locked

---

## 2. Users Module

**Base URL**: `/users`  
**Authentication**: Required (Bearer Token)

### 2.1 Get User Profile
- **Endpoint**: `GET /users/profile`
- **Mô tả**: Lấy thông tin user đang đăng nhập
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "email": "student@hcmut.edu.vn",
    "fullName": "Nguyễn Văn A",
    "mssv": "2210001",
    "role": "STUDENT",
    "department": "KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH",
    "phoneNumber": "0901234567",
    "studentClass": "CC01"
  }
  ```
- **Frontend Integration**:
  - Gọi khi mount Dashboard/Profile page
  - Hiển thị thông tin trong header/sidebar
  - Cache trong state để tránh gọi lại nhiều lần

### 2.2 Update Profile
- **Endpoint**: `PATCH /users/profile`
- **Mô tả**: Cập nhật thông tin cá nhân
- **Request Body**:
  ```json
  {
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0909999999",
    "studentClass": "CC02"
  }
  ```
- **Response**: `200 OK`
- **Frontend Integration**:
  - Form edit profile với pre-filled data
  - Validation trước khi submit
  - Toast notification khi thành công
  - Update state sau khi save

### 2.3 Change Password
- **Endpoint**: `PATCH /users/change-password`
- **Request Body**:
  ```json
  {
    "currentPassword": "old123",
    "newPassword": "new456"
  }
  ```
- **Frontend Integration**:
  - Form với 3 fields: current, new, confirm
  - Password strength indicator
  - Show/hide password toggle
  - Handle error: Sai current password

### 2.4 Get All Users (Admin only)
- **Endpoint**: `GET /users`
- **Query Params**: `?role=STUDENT&page=1&limit=10`
- **Response**: Paginated list of users
- **Frontend Integration**:
  - Admin dashboard table
  - Filter by role dropdown
  - Pagination controls
  - Search bar

### 2.5 Delete User (Admin only)
- **Endpoint**: `DELETE /users/:id`
- **Frontend Integration**:
  - Confirmation modal trước khi delete
  - Refresh list sau khi delete
  - Handle error: Cannot delete (có meetings active)

---

## 3. Meetings Module

**Base URL**: `/meetings`  
**Authentication**: Required

### 3.1 Create Meeting Request
- **Endpoint**: `POST /meetings`
- **Mô tả**: Student tạo yêu cầu meeting với tutor
- **Request Body**:
  ```json
  {
    "tutorId": 5,
    "subject": "Giải Tích 1",
    "topic": "Giới hạn và liên tục",
    "description": "Cần hỗ trợ giải bài tập tuần 3",
    "availabilitySlotId": 10
  }
  ```
- **Response**: `201 Created`
- **Frontend Integration**:
  - Form tạo meeting với:
    - Dropdown chọn tutor (từ AI matching results)
    - Input subject, topic, description
    - Calendar picker chọn availability slot
  - Disable button khi đang submit
  - Toast notification + redirect về meeting list

### 3.2 Get My Meetings
- **Endpoint**: `GET /meetings/my-meetings`
- **Query Params**: `?status=PENDING&page=1&limit=10`
- **Response**: Paginated meetings list
- **Frontend Integration**:
  - Tab navigation: All/Pending/Confirmed/Completed/Cancelled
  - Meeting cards hiển thị: tutor name, subject, time, status
  - Action buttons: Cancel (nếu PENDING), Rate (nếu COMPLETED)
  - Real-time update với WebSocket/polling

### 3.3 Update Meeting Status
- **Endpoint**: `PATCH /meetings/:id/status`
- **Request Body**:
  ```json
  {
    "status": "CONFIRMED",
    "reason": "Optional rejection reason"
  }
  ```
- **Frontend Integration**:
  - Tutor dashboard: Accept/Reject buttons
  - Confirmation modal với textarea cho reason (nếu reject)
  - Update UI optimistically
  - Handle error: Meeting không tồn tại

### 3.4 Rate Meeting
- **Endpoint**: `POST /meetings/:id/rate`
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Tutor giảng rất dễ hiểu"
  }
  ```
- **Frontend Integration**:
  - Modal rating với star component (1-5 stars)
  - Textarea cho comment
  - Disable sau khi rate (không cho rate lại)
  - Update meeting status thành COMPLETED

### 3.5 Get Meeting Details
- **Endpoint**: `GET /meetings/:id`
- **Response**: Full meeting object với tutor/student info
- **Frontend Integration**:
  - Meeting detail page
  - Hiển thị timeline: Created → Confirmed → Completed
  - Show rating nếu đã có
  - Show Google Meet link nếu có

---

## 4. Tutors Module

**Base URL**: `/tutors`

### 4.1 Get All Tutors (Public)
- **Endpoint**: `GET /tutors`
- **Query Params**: 
  - `?subject=Giải Tích 1`
  - `?minRating=4.0`
  - `?available=true`
  - `?page=1&limit=10`
- **Response**: Paginated tutors list
- **Frontend Integration**:
  - Tutor browse page với grid layout
  - Filter panel: Subject, Rating, Availability
  - Sort by: Rating, Name, Most booked
  - Tutor card: Avatar, name, rating, expertise tags

### 4.2 Get Tutor Profile (Public)
- **Endpoint**: `GET /tutors/:id`
- **Response**: 
  ```json
  {
    "id": 5,
    "email": "tutor@hcmut.edu.vn",
    "fullName": "TS. Nguyễn Văn A",
    "department": "KHOA KHOA HỌC ỨNG DỤNG",
    "tutorProfile": {
      "bio": "Giảng viên khoa Toán...",
      "expertise": ["Giải Tích 1", "Giải Tích 2"],
      "averageRating": 4.8,
      "totalMeetings": 120,
      "available": true
    }
  }
  ```
- **Frontend Integration**:
  - Tutor detail page
  - Show: Bio, expertise tags, stats (rating, total meetings)
  - "Book Meeting" button → redirect to create meeting form
  - Reviews section (từ ratings)

### 4.3 Update Tutor Profile (Tutor only)
- **Endpoint**: `PATCH /tutors/profile`
- **Request Body**:
  ```json
  {
    "bio": "Updated bio...",
    "expertise": ["New subject 1", "New subject 2"],
    "available": false
  }
  ```
- **Frontend Integration**:
  - Tutor settings page
  - Rich text editor cho bio
  - Tag input cho expertise (add/remove)
  - Toggle switch cho availability

### 4.4 Manage Availability Slots
- **Endpoint**: `POST /tutors/availability`
- **Request Body**:
  ```json
  {
    "dayOfWeek": "MONDAY",
    "startTime": "08:00",
    "endTime": "10:00",
    "isRecurring": true
  }
  ```
- **Frontend Integration**:
  - Weekly calendar view
  - Drag to create time slots
  - Checkbox cho recurring
  - Color code: Available (green), Booked (red), Past (gray)

### 4.5 Get Tutor Statistics
- **Endpoint**: `GET /tutors/statistics`
- **Response**:
  ```json
  {
    "totalMeetings": 120,
    "completedMeetings": 100,
    "cancelledMeetings": 5,
    "averageRating": 4.8,
    "monthlyStats": [...]
  }
  ```
- **Frontend Integration**:
  - Tutor dashboard
  - Charts: Line chart (meetings per month), Pie chart (status distribution)
  - Cards: Total meetings, avg rating, completion rate

### 4.6-4.11 Other Endpoints
- `GET /tutors/:id/reviews`: Lấy reviews của tutor
- `GET /tutors/:id/availability`: Lấy availability slots
- `DELETE /tutors/availability/:id`: Xóa slot
- `GET /tutors/my-students`: Danh sách students đã meeting
- `GET /tutors/upcoming-meetings`: Meetings sắp tới
- `GET /tutors/past-meetings`: Meetings đã qua

---

## 5. Management Module

**Base URL**: `/management`  
**Authentication**: Admin/Coordinator only

### 5.1 Dashboard Statistics
- **Endpoint**: `GET /management/dashboard`
- **Response**:
  ```json
  {
    "totalUsers": 500,
    "totalTutors": 50,
    "totalStudents": 400,
    "totalMeetings": 1000,
    "pendingComplaints": 5,
    "recentActivities": [...]
  }
  ```
- **Frontend Integration**:
  - Admin dashboard landing page
  - KPI cards with icons
  - Recent activities timeline
  - Quick actions panel

### 5.2 User Management
- **Endpoints**:
  - `GET /management/users`: List all users với filters
  - `PATCH /management/users/:id`: Update user info
  - `DELETE /management/users/:id`: Soft delete user
  - `POST /management/users/:id/restore`: Restore deleted user
- **Frontend Integration**:
  - Data table với sort, filter, pagination
  - Bulk actions: Delete, Export CSV
  - Edit modal với form validation
  - Confirmation dialogs

### 5.3 Meeting Management
- **Endpoints**:
  - `GET /management/meetings`: All meetings
  - `PATCH /management/meetings/:id`: Force update status
  - `GET /management/meetings/statistics`: Meeting stats by status/subject
- **Frontend Integration**:
  - Calendar view hoặc table view toggle
  - Filter by date range, tutor, student, status
  - Export reports (PDF/Excel)
  - Charts: Meetings per week, Popular subjects

### 5.4 Complaint Management
- **Endpoints**:
  - `GET /management/complaints`: All complaints
  - `PATCH /management/complaints/:id/status`: Update complaint status
  - `POST /management/complaints/:id/assign`: Assign to staff
- **Frontend Integration**:
  - Complaint queue với priority sorting
  - Detail modal: Complaint content, related meeting, actions
  - Status workflow: New → In Progress → Resolved
  - Comment thread cho internal discussion

### 5.5 System Logs
- **Endpoint**: `GET /management/logs`
- **Query Params**: `?level=ERROR&startDate=2025-01-01&endDate=2025-12-31`
- **Frontend Integration**:
  - Log viewer với syntax highlighting
  - Filter by level (INFO/WARN/ERROR)
  - Search log content
  - Auto-refresh với interval

---

## 6. Notifications Module

**Base URL**: `/notifications`  
**Authentication**: Required

### 6.1 Get Notifications
- **Endpoint**: `GET /notifications`
- **Query Params**: `?read=false&page=1&limit=20`
- **Response**:
  ```json
  [
    {
      "id": 1,
      "type": "MEETING_CONFIRMED",
      "title": "Meeting confirmed",
      "message": "Your meeting with TS. Nguyễn Văn A has been confirmed",
      "read": false,
      "createdAt": "2025-11-20T10:00:00Z"
    }
  ]
  ```
- **Frontend Integration**:
  - Notification bell icon trong header
  - Badge hiển thị số unread
  - Dropdown list khi click bell
  - Mark as read khi click notification

### 6.2 Mark as Read
- **Endpoint**: `PATCH /notifications/:id/read`
- **Frontend Integration**:
  - Auto mark as read khi mở notification
  - "Mark all as read" button
  - Optimistic UI update

### 6.3 Real-time Notifications (WebSocket)
- **Endpoint**: `ws://localhost:3000/notifications`
- **Frontend Integration**:
  - WebSocket connection khi user login
  - Listen for events: 
    - `meeting.created`
    - `meeting.confirmed`
    - `meeting.cancelled`
    - `complaint.created`
  - Toast notification khi có event mới
  - Update notification list real-time

### 6.4-6.6 Other Endpoints
- `DELETE /notifications/:id`: Xóa notification
- `POST /notifications/mark-all-read`: Đánh dấu tất cả đã đọc
- `GET /notifications/unread-count`: Đếm số unread

---

## 7. AI Module

**Base URL**: `/ai`  
**Authentication**: Required

### 7.1 AI Tutor Matching
- **Endpoint**: `POST /ai/match-tutors`
- **Mô tả**: Tìm tutors phù hợp dựa trên subject và preferences
- **Request Body**:
  ```json
  {
    "subject": "Giải Tích 1",
    "topic": "Giới hạn",
    "preferredTime": "MORNING",
    "minRating": 4.0
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "matches": [
      {
        "tutor": { "id": 5, "fullName": "TS. Nguyễn Văn A", ... },
        "score": 0.95,
        "reasons": ["Expertise match", "High rating", "Available"]
      }
    ]
  }
  ```
- **Frontend Integration**:
  - AI matching wizard với multi-step form
  - Step 1: Subject selection với autocomplete
  - Step 2: Topic + preferences
  - Step 3: Show matching results với score bars
  - "Book with this tutor" button trên mỗi card

### 7.2 Get Similar Tutors
- **Endpoint**: `GET /ai/similar-tutors/:tutorId`
- **Mô tả**: Tìm tutors tương tự (nếu tutor ban đầu không available)
- **Frontend Integration**:
  - "Similar tutors" section trong tutor detail page
  - Carousel hoặc grid layout
  - Show similarity score

### 7.3 AI Chatbot
- **Endpoint**: `POST /ai/chat`
- **Mô tả**: Chat với AI để hỏi về hệ thống, tutors, subjects
- **Request Body**:
  ```json
  {
    "message": "Làm sao để book meeting với tutor?",
    "sessionId": "user-123-session"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "reply": "Để book meeting với tutor, bạn cần làm theo các bước sau...",
    "suggestions": ["Xem danh sách tutors", "Tìm tutor theo môn học"],
    "intent": "how_to_book_meeting"
  }
  ```
- **Frontend Integration**:
  - Chatbot widget fixed bottom-right
  - Minimize/maximize button
  - Chat UI: Message bubbles (user/bot)
  - Typing indicator khi bot đang trả lời
  - Quick reply buttons cho suggestions
  - Session persistence (lưu sessionId trong localStorage)

### 7.4 FAQ Search
- **Endpoint**: `POST /ai/faq-search`
- **Request Body**:
  ```json
  {
    "query": "thời gian meeting"
  }
  ```
- **Response**: Relevant FAQs
- **Frontend Integration**:
  - FAQ page với search bar
  - Autocomplete suggestions
  - Highlight matching keywords trong results

### 7.5 Chatbot Health Check
- **Endpoint**: `GET /ai/chatbot/health`
- **Frontend Integration**:
  - Internal monitoring dashboard
  - Show Gemini API status

---

## 8. External Module

**Base URL**: `/external`  
**Authentication**: Required for some endpoints

### 8.1 BKZalo Integration
- **Endpoints**:
  - `POST /external/bkzalo/send-message`: Gửi message qua BKZalo
  - `GET /external/bkzalo/conversations`: Lấy conversations
  - `POST /external/bkzalo/webhook`: Webhook nhận message từ BKZalo
- **Frontend Integration**:
  - BKZalo chat window embed
  - Send message form
  - Conversation list

### 8.2 Google Calendar Integration
- **Endpoints**:
  - `POST /external/google-calendar/create-event`: Tạo calendar event
  - `GET /external/google-calendar/events`: Lấy events
  - `PATCH /external/google-calendar/events/:id`: Update event
  - `DELETE /external/google-calendar/events/:id`: Delete event
- **Frontend Integration**:
  - "Add to Google Calendar" button sau khi meeting confirmed
  - OAuth flow: Redirect to Google → Get access token → Save
  - Calendar sync status indicator

### 8.3 Google Meet Integration
- **Endpoints**:
  - `POST /external/google-meet/create-meeting`: Tạo Google Meet link
  - `GET /external/google-meet/meetings/:id`: Get meeting details
- **Frontend Integration**:
  - Auto create Google Meet link khi meeting confirmed
  - "Join Meeting" button hiển thị 15 phút trước meeting time
  - Copy link button

### 8.4 Email Templates
- **Endpoints**:
  - `GET /external/email-templates`: List templates
  - `POST /external/email-templates`: Create template
  - `PATCH /external/email-templates/:id`: Update template
- **Frontend Integration**:
  - Admin email template editor
  - Rich text editor với variables: {{fullName}}, {{meetingTime}}
  - Preview pane

### 8.5 File Upload
- **Endpoints**:
  - `POST /external/upload/avatar`: Upload avatar
  - `POST /external/upload/documents`: Upload documents
  - `GET /external/files/:filename`: Download file
  - `DELETE /external/files/:filename`: Delete file
- **Frontend Integration**:
  - Avatar upload với crop/resize
  - Drag & drop file upload
  - Progress bar
  - File size/type validation
  - Preview thumbnails

---

## 9. Email Module

**Backend Only** - Không có endpoints public. Backend tự động gửi email khi:
- User đăng ký → Welcome email
- Meeting confirmed → Confirmation email
- Meeting reminder → 1 giờ trước meeting
- Meeting completed → Rating request email
- Complaint created → Notification email

---

## 10. Upload Module

**Backend Only** - File storage được handle qua External module endpoints.

---

## 🔐 Authentication Flow

### Initial Setup
```javascript
// 1. Login
const response = await fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { access_token, user } = await response.json();

// 2. Lưu token
localStorage.setItem('token', access_token);
localStorage.setItem('user', JSON.stringify(user));

// 3. Setup axios interceptor (hoặc fetch wrapper)
axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
```

### Token Refresh
- Token expires sau 24h
- Frontend check expiry trước mỗi request
- Nếu expired → Redirect về login page
- Option: Implement refresh token (cần backend support)

---

## 🚀 Integration Best Practices

### 1. API Client Setup
```javascript
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Error Handling
```javascript
try {
  const data = await apiClient.post('/meetings', meetingData);
  showSuccess('Meeting created successfully');
} catch (error) {
  if (error.response?.status === 400) {
    showError(error.response.data.message);
  } else if (error.response?.status === 403) {
    showError('You do not have permission');
  } else {
    showError('Something went wrong');
  }
}
```

### 3. Loading States
```javascript
const [loading, setLoading] = useState(false);

const fetchMeetings = async () => {
  setLoading(true);
  try {
    const data = await apiClient.get('/meetings/my-meetings');
    setMeetings(data);
  } finally {
    setLoading(false);
  }
};
```

### 4. Real-time Updates
```javascript
// WebSocket connection
const ws = new WebSocket('ws://localhost:3000/notifications');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Update UI
  addNotification(notification);
  showToast(notification.message);
};
```

---

## 📱 Recommended UI Components

### Per Module
- **Auth**: Login form, Register form, Password strength meter
- **Users**: Profile card, Edit profile modal, Avatar uploader
- **Meetings**: Meeting card, Calendar picker, Status badge, Rating modal
- **Tutors**: Tutor card, Filter panel, Availability calendar
- **Management**: Data table, Charts (Chart.js/Recharts), Export buttons
- **Notifications**: Notification bell, Dropdown list, Toast notifications
- **AI**: Chatbot widget, Matching wizard, Score bars
- **External**: File uploader, Calendar sync button, Meet join button

---

## 🔗 Next Steps

Đọc file `FRONTEND_IMPLEMENTATION.md` để xem **chi tiết code implementation** cho từng module với:
- React components structure
- State management (Redux/Context)
- API service layers
- Form validation
- Real-time features
- Error handling
- Testing strategies
