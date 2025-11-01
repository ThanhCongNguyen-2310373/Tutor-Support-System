# 📊 Tóm Tắt Dự Án - Tutor Support System Backend

## 🎯 Thông tin Dự án

| Thông tin | Chi tiết |
|-----------|----------|
| **Tên dự án** | Tutor Support System - Backend API |
| **Môn học** | Công Nghệ Phần Mềm (CO3001) |
| **Học kỳ** | HK251 |
| **Trường** | Đại học Bách Khoa - ĐHQG TP.HCM |
| **Framework** | NestJS v10.0.0 |
| **Database** | PostgreSQL >= 14.x |
| **ORM** | Prisma v5.5.0 |
| **Authentication** | JWT + Passport |
| **API Docs** | Swagger/OpenAPI |

---

## 📁 Cấu trúc Thư mục

```
Tutor Support System/
│
├── prisma/
│   └── schema.prisma              # Database Schema (10 models, 7 roles)
│
├── src/
│   ├── core/                      # ✅ Core Infrastructure
│   │   ├── prisma.service.ts
│   │   └── core.module.ts
│   │
│   ├── auth/                      # ✅ Authentication & Authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts     # POST /auth/login
│   │   ├── auth.service.ts        # Find-or-create user logic
│   │   ├── jwt.strategy.ts        # JWT validation
│   │   ├── roles.guard.ts         # RBAC
│   │   ├── roles.decorator.ts
│   │   └── dto/
│   │       └── login.dto.ts
│   │
│   ├── users/                     # ✅ User Profile Management
│   │   ├── users.module.ts
│   │   ├── users.controller.ts    # GET /users/me
│   │   └── users.service.ts
│   │
│   ├── tutors/                    # 🔄 Tutor Features (Empty scaffold)
│   ├── my-schedule/               # 🔄 Schedule Management (Empty scaffold)
│   ├── meetings/                  # 🔄 Meeting & Booking (Empty scaffold)
│   ├── management/                # 🔄 Admin & Coordinator (Empty scaffold)
│   ├── academic/                  # 🔄 TBM, OAA, OSA (Empty scaffold)
│   ├── notifications/             # 🔄 System Notifications (Empty scaffold)
│   │
│   ├── app.module.ts              # Root Module
│   └── main.ts                    # Bootstrap (Port 3000, Swagger /api-docs)
│
├── .env.example                   # Environment template
├── .gitignore
├── package.json                   # Dependencies & Scripts
├── tsconfig.json                  # TypeScript Config
├── nest-cli.json                  # NestJS CLI Config
│
└── Documentation/
    ├── README.md                  # 📖 Hướng dẫn tổng quan
    ├── QUICKSTART.md              # ⚡ Chạy ngay trong 5 phút
    ├── INSTALLATION.md            # 🔧 Cài đặt chi tiết từng bước
    ├── ARCHITECTURE.md            # 🏗️ Kiến trúc & Design Patterns
    ├── DEVELOPMENT_GUIDE.md       # 🛠️ Hướng dẫn phát triển Use Cases
    ├── TODO.md                    # 📋 Danh sách công việc
    └── PROJECT_SUMMARY.md         # 📊 File này
```

---

## 🗄️ Database Schema Tóm tắt

### Models (10)

| Model | Thuộc miền | Quan hệ chính | Mô tả |
|-------|-----------|---------------|-------|
| **User** | Core | 1-1 TutorProfile, 1-N Meeting, Rating, etc. | Người dùng (7 roles) |
| **TutorProfile** | Core | 1-1 User, 1-N AvailabilitySlot, Meeting | Hồ sơ Tutor |
| **AvailabilitySlot** | Schedule | N-1 TutorProfile, 1-1 Meeting | Lịch rảnh của Tutor |
| **Meeting** | Schedule | N-1 Student, N-1 Tutor, 1-1 Slot | Buổi hẹn |
| **Rating** | Feedback | 1-1 Meeting, N-1 Student | Đánh giá |
| **ProgressRecord** | Academic | N-1 Student, N-1 Tutor | Ghi nhận tiến độ |
| **Complaint** | Management | N-1 Student, 0..1 Meeting | Khiếu nại |
| **LearningRoadmap** | Academic | N-1 TBM | Lộ trình học |
| **TutorApplication** | Management | N-1 Student, N-1 TBM, 0..1 Admin | Yêu cầu duyệt Tutor |
| **Notification** | System | N-1 User | Thông báo |

### Roles (7)

| Role | Mô tả | Use Cases |
|------|-------|-----------|
| **STUDENT** | Sinh viên | UC_STU_01-05 |
| **TUTOR** | Tutor | UC_TUT_01-03 |
| **COORDINATOR** | Điều phối viên | UC_COO_01-02 |
| **TBM** | Trưởng bộ môn | UC_TBM_01-02 |
| **OAA** | Phòng Đào tạo | UC_OAA_01-02 |
| **OSA** | Phòng CTSV | UC_OSA_01-02 |
| **ADMIN** | Quản trị viên | UC_ADMIN_01-03 |

---

## 📡 API Endpoints Hiện tại

### ✅ Đã triển khai (2 endpoints)

| Method | Endpoint | Auth | Roles | Use Case | Mô tả |
|--------|----------|------|-------|----------|-------|
| POST | `/auth/login` | ❌ | All | UC_GENERAL_01 | Đăng nhập (mô phỏng SSO) |
| GET | `/users/me` | ✅ | All | UC_GENERAL_02 | Xem hồ sơ cá nhân |

### 🔄 Cần triển khai (~50 endpoints)

#### Meetings Module (6 endpoints)
- POST `/meetings/book` - Đặt lịch hẹn
- GET `/meetings/my-meetings` - Danh sách lịch hẹn
- PATCH `/meetings/:id/cancel` - Hủy lịch
- GET `/meetings/:id` - Chi tiết
- POST `/meetings/:id/rating` - Đánh giá
- GET `/meetings/:id/rating` - Xem đánh giá

#### Tutors Module (8 endpoints)
- POST `/tutors/availability` - Thêm lịch rảnh
- DELETE `/tutors/availability/:id` - Xóa lịch rảnh
- GET `/tutors/availability` - Xem lịch rảnh
- GET `/tutors/booking-requests` - Yêu cầu đặt lịch
- PATCH `/tutors/bookings/:id/confirm` - Chấp nhận
- PATCH `/tutors/bookings/:id/reject` - Từ chối
- POST `/tutors/progress` - Ghi nhận tiến độ
- GET `/tutors/students/:id/progress` - Xem tiến độ

#### Management Module (12 endpoints)
- Coordinator: Pairing, Complaints (4 endpoints)
- Admin: Users, Tutor Applications, System Errors (8 endpoints)

#### Academic Module (10 endpoints)
- TBM: Roadmaps, Tutor Requests (4 endpoints)
- OAA: Reports, Dashboard (3 endpoints)
- OSA: Training Credits, Scholarships (3 endpoints)

#### Notifications Module (3 endpoints)
- GET `/notifications` - Danh sách thông báo
- PATCH `/notifications/:id/read` - Đánh dấu đã đọc
- DELETE `/notifications/:id` - Xóa

---

## 🔐 Security Features

### Đã triển khai ✅
- JWT Authentication (Bearer token)
- Role-Based Access Control (RBAC)
- Input validation (class-validator)
- CORS enabled
- Password-less login (SSO mock)

### Cần triển khai 🔄
- Rate limiting (Throttler)
- Helmet.js security headers
- CSRF protection
- Input sanitization
- Environment variable validation

---

## 🧪 Testing Status

| Type | Status | Coverage |
|------|--------|----------|
| Unit Tests | ❌ Not started | 0% |
| Integration Tests | ❌ Not started | 0% |
| E2E Tests | ❌ Not started | 0% |
| Load Tests | ❌ Not started | - |

**Recommended:** Bắt đầu viết tests từ Sprint 2 trở đi.

---

## 📦 Dependencies Chính

### Production Dependencies
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/jwt": "^10.1.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/swagger": "^7.1.0",
  "@prisma/client": "^5.5.0",
  "class-validator": "^0.14.0",
  "passport-jwt": "^4.0.1"
}
```

### Dev Dependencies
```json
{
  "@nestjs/cli": "^10.0.0",
  "@nestjs/testing": "^10.0.0",
  "prisma": "^5.5.0",
  "typescript": "^5.1.3"
}
```

**Total packages:** ~300 (sau khi `npm install`)

---

## 📊 Tiến độ Dự án

### ✅ Giai đoạn 1: Scaffold (100% hoàn thành)
- Infrastructure setup
- Core Module
- Auth Module
- Users Module
- Empty scaffolds cho 6 modules khác
- Documentation (5 files)

### 🔄 Giai đoạn 2: Core Features (0% - Đang ở đây)
- Meetings Module (UC_STU_01, 05)
- Tutors Module (UC_TUT_01, 02, 03)

### 📅 Giai đoạn 3: Management & Admin (0%)
- Management Module (UC_COO_*, UC_ADMIN_*)

### 📅 Giai đoạn 4: Academic Features (0%)
- Academic Module (UC_TBM_*, UC_OAA_*, UC_OSA_*)

### 📅 Giai đoạn 5: Integration & Polish (0%)
- Notifications Module
- External API integration
- Testing & Deployment


---

## 🎯 Next Steps (Việc cần làm ngay)

### Sprint 1:
1. **Cài đặt môi trường**
   - Cài Node.js, PostgreSQL
   - Clone repo
   - `npm install`
   - Setup database
   - Test API /auth/login

2. **Triển khai Meetings Module**
   - DTOs (CreateBookingDto, RatingDto)
   - Service methods
   - Controller endpoints
   - Test qua Swagger

3. **Triển khai Tutors Module**
   - DTOs (AvailabilityDto, ProgressDto)
   - Service methods
   - Controller endpoints
   - Test qua Swagger

4. **Code review & merge**

---

## 💡 Tips cho Team

### Quy tắc Git
```bash
# Branch naming
feature/UC_STU_01-booking
feature/UC_TUT_01-availability
bugfix/fix-jwt-validation

# Commit messages
feat: implement UC_STU_01 booking endpoint
fix: resolve slot booking race condition
docs: update API documentation
```

### Code Style
- Tuân thủ Prettier & ESLint config
- Format code trước khi commit: `npm run format`
- Viết Swagger annotations cho mọi endpoint
- Validate input bằng DTOs
- Error handling đầy đủ

### Communication
- Daily standup (10 phút)
- Code review trước khi merge
- Update TODO.md hàng tuần
- Document trong code khi cần

---

## 📞 Support & Resources

### Documentation Files
- 📖 `README.md` - Tổng quan
- ⚡ `QUICKSTART.md` - Chạy nhanh
- 🔧 `INSTALLATION.md` - Cài đặt chi tiết
- 🏗️ `ARCHITECTURE.md` - Kiến trúc
- 🛠️ `DEVELOPMENT_GUIDE.md` - Hướng dẫn dev
- 📋 `TODO.md` - Task list

### External Resources
- **NestJS Docs:** https://docs.nestjs.com/
- **Prisma Docs:** https://www.prisma.io/docs/
- **JWT.io:** https://jwt.io/
- **Swagger:** https://swagger.io/

### Tools
- **Swagger UI:** http://localhost:3000/api-docs
- **Prisma Studio:** http://localhost:5555
- **PostgreSQL:** pgAdmin hoặc psql

---

## 📈 Success Metrics

### MVP Success Criteria:
- [ ] 80% Use Cases được triển khai
- [ ] All endpoints có Swagger docs
- [ ] Core features hoạt động ổn định
- [ ] API response time < 500ms
- [ ] Zero critical bugs
- [ ] Documentation hoàn chỉnh

### Long-term Goals:
- [ ] Test coverage >= 70%
- [ ] Load test: 100 concurrent users
- [ ] Production deployment
- [ ] CI/CD pipeline
- [ ] Monitoring & logging

---
