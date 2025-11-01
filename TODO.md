# 📋 TODO - Tutor Support System Backend

## ✅ Completed (Giai đoạn 1 - Scaffold hoàn tất)

### Infrastructure
- [x] Khởi tạo dự án NestJS
- [x] Cấu hình Prisma ORM
- [x] Setup PostgreSQL database schema
- [x] Cấu hình TypeScript
- [x] Setup Swagger API Documentation
- [x] Cấu hình ESLint & Prettier
- [x] Tạo .env.example và .gitignore

### Core Module
- [x] PrismaService implementation
- [x] CoreModule với @Global decorator

### Auth Module
- [x] JWT Strategy implementation
- [x] Login endpoint (UC_GENERAL_01)
- [x] RolesGuard cho RBAC
- [x] @Roles() decorator
- [x] LoginDto validation

### Users Module
- [x] GET /users/me endpoint (UC_GENERAL_02)
- [x] UsersService.getProfile()

### Empty Scaffolds
- [x] TutorsModule
- [x] MyScheduleModule
- [x] MeetingsModule
- [x] ManagementModule
- [x] AcademicModule
- [x] NotificationsModule

### Documentation
- [x] README.md (Hướng dẫn tổng quan)
- [x] INSTALLATION.md (Hướng dẫn cài đặt chi tiết)
- [x] ARCHITECTURE.md (Kiến trúc hệ thống)
- [x] DEVELOPMENT_GUIDE.md (Hướng dẫn phát triển)

---

## 🔄 In Progress (Giai đoạn 2 - Core Features)

### Meetings Module (Priority: HIGH)
- [ ] **UC_STU_01:** Student đặt lịch hẹn
  - [ ] POST /meetings/book
  - [ ] CreateBookingDto validation
  - [ ] Check slot availability
  - [ ] Update slot status
  - [ ] Create meeting record
  - [ ] Send notification to tutor

- [ ] **UC_STU_05:** Student đánh giá buổi học
  - [ ] POST /meetings/:id/rating
  - [ ] CreateRatingDto validation
  - [ ] Check meeting completed
  - [ ] Prevent duplicate rating
  - [ ] Update tutor rating average

- [ ] **Common endpoints:**
  - [ ] GET /meetings/my-meetings (Student view)
  - [ ] PATCH /meetings/:id/cancel
  - [ ] GET /meetings/:id (Detail)

### Tutors Module (Priority: HIGH)
- [ ] **UC_TUT_01:** Tutor quản lý lịch rảnh
  - [ ] POST /tutors/availability
  - [ ] DELETE /tutors/availability/:id
  - [ ] GET /tutors/availability
  - [ ] CreateAvailabilityDto
  - [ ] Validate time range
  - [ ] Prevent overlapping slots

- [ ] **UC_TUT_02:** Tutor quản lý buổi tư vấn
  - [ ] GET /tutors/booking-requests
  - [ ] PATCH /tutors/bookings/:id/confirm
  - [ ] PATCH /tutors/bookings/:id/reject
  - [ ] Send notification to student

- [ ] **UC_TUT_03:** Theo dõi tiến độ sinh viên
  - [ ] POST /tutors/progress
  - [ ] GET /tutors/students/:id/progress
  - [ ] CreateProgressRecordDto
  - [ ] Link to learning roadmap

---

## 📅 Planned (Giai đoạn 3 - Management & Admin)

### Management Module
- [ ] **UC_COO_01:** Coordinator duyệt ghép cặp
  - [ ] GET /management/pairing-queue
  - [ ] POST /management/manual-pair
  - [ ] Override existing pairing
  - [ ] Notification logic

- [ ] **UC_COO_02:** Xử lý khiếu nại
  - [ ] GET /management/complaints
  - [ ] POST /management/complaints (Student create)
  - [ ] PATCH /management/complaints/:id/resolve
  - [ ] Escalate to higher authority

- [ ] **UC_ADMIN_01:** Quản lý tài khoản
  - [ ] GET /management/users (Paginated)
  - [ ] GET /management/users/:id
  - [ ] PATCH /management/users/:id
  - [ ] POST /management/users/:id/reset-password
  - [ ] Audit log

- [ ] **UC_ADMIN_02:** Phê duyệt tutor
  - [ ] GET /management/tutor-applications
  - [ ] PATCH /management/tutor-applications/:id/approve
  - [ ] PATCH /management/tutor-applications/:id/reject
  - [ ] Create TutorProfile on approval

- [ ] **UC_ADMIN_03:** Xử lý lỗi kỹ thuật
  - [ ] GET /management/system-errors
  - [ ] POST /management/errors/:id/retry-sync
  - [ ] POST /management/errors/:id/escalate

---

## 📚 Planned (Giai đoạn 4 - Academic Features)

### Academic Module
- [ ] **UC_TBM_01:** Lộ trình học
  - [ ] POST /academic/roadmaps
  - [ ] GET /academic/roadmaps
  - [ ] GET /academic/roadmaps/:id
  - [ ] PATCH /academic/roadmaps/:id
  - [ ] Upload to HCMUT_LIBRARY

- [ ] **UC_TBM_02:** Yêu cầu tạo tutor
  - [ ] POST /academic/tutor-requests
  - [ ] GET /academic/tutor-requests
  - [ ] Send to Admin for approval

- [ ] **UC_OAA_01:** Báo cáo phân bổ
  - [ ] GET /academic/resource-reports
  - [ ] Query parameters: semester, department
  - [ ] Export to Excel/PDF
  - [ ] Cache results

- [ ] **UC_OAA_02:** Dashboard hiệu suất
  - [ ] GET /academic/performance-dashboard
  - [ ] Statistics: participation, completion rate
  - [ ] Charts data for frontend

- [ ] **UC_OSA_01:** Điểm rèn luyện
  - [ ] GET /academic/training-credits
  - [ ] Calculate based on participation
  - [ ] Query by student, class, department
  - [ ] Export report

- [ ] **UC_OSA_02:** Học bổng
  - [ ] GET /academic/scholarship-candidates
  - [ ] Filter by GPA, training credits
  - [ ] Sort by eligibility score
  - [ ] Export list

---

## 🔔 Planned (Giai đoạn 5 - Notifications & Integration)

### Notifications Module
- [ ] **UC_SYS_01:** Hệ thống thông báo
  - [ ] GET /notifications
  - [ ] PATCH /notifications/:id/read
  - [ ] DELETE /notifications/:id
  - [ ] Real-time notifications (WebSocket?)
  - [ ] Email notifications (Nodemailer)
  - [ ] Notification templates

- [ ] **UC_SYS_02:** Đồng bộ dữ liệu
  - [ ] Cron job sync HCMUT_DATACORE
  - [ ] Sync user profiles
  - [ ] Sync enrollment data
  - [ ] Error handling & retry logic
  - [ ] Manual sync endpoint

### External API Integration
- [ ] **HCMUT_SSO Mock**
  - [ ] Simulate SSO authentication flow
  - [ ] Token validation endpoint

- [ ] **HCMUT_DATACORE Mock**
  - [ ] User data sync API
  - [ ] Enrollment data API

- [ ] **HCMUT_LIBRARY Mock**
  - [ ] Document search API
  - [ ] Document sharing API

---

## 🧪 Testing (Priority: MEDIUM)

### Unit Tests
- [ ] Auth Service tests
- [ ] Users Service tests
- [ ] Meetings Service tests
- [ ] Tutors Service tests
- [ ] Management Service tests
- [ ] Academic Service tests

### Integration Tests (E2E)
- [ ] Auth flow (login)
- [ ] Booking flow (student + tutor)
- [ ] Rating flow
- [ ] Complaint resolution flow
- [ ] Admin approval flow

### Load Testing
- [ ] Concurrent booking requests
- [ ] Notification system stress test
- [ ] Database query performance

---

## 🔒 Security & Optimization (Priority: HIGH before Production)

### Security
- [ ] Rate limiting (Throttler module)
- [ ] Helmet.js for security headers
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma auto-handles)
- [ ] XSS prevention
- [ ] CORS configuration for production
- [ ] Environment variables validation

### Performance
- [ ] Database indexing optimization
- [ ] Query performance tuning
- [ ] Caching layer (Redis)
- [ ] API response compression
- [ ] Pagination for all list endpoints
- [ ] N+1 query prevention (Prisma includes)

### Monitoring
- [ ] Logging service (Winston/Pino)
- [ ] Error tracking (Sentry)
- [ ] APM (Application Performance Monitoring)
- [ ] Database monitoring
- [ ] Health check endpoint

---

## 📖 Documentation (Ongoing)

- [ ] Swagger annotations cho tất cả endpoints
- [ ] API usage examples
- [ ] Postman collection
- [ ] Database schema diagram
- [ ] Sequence diagrams cho main flows
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 🚀 DevOps & Deployment (Priority: LOW - After core features)

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Automated testing on PR
- [ ] Automated build
- [ ] Docker containerization
- [ ] Docker Compose for local development

### Deployment
- [ ] Production environment setup
- [ ] Database migration strategy
- [ ] Backup & recovery plan
- [ ] Zero-downtime deployment
- [ ] Environment-specific configs

---

## ✅ Definition of Done

Một feature được coi là hoàn thành khi:
- [ ] Code đã được viết và test thủ công
- [ ] DTOs có validation đầy đủ
- [ ] Service có error handling
- [ ] Controller có Swagger annotations
- [ ] API test qua Swagger UI thành công
- [ ] Code đã được review bởi ít nhất 1 người khác
- [ ] Unit tests coverage >= 70% (nếu áp dụng)
- [ ] Documentation đã được cập nhật

---

