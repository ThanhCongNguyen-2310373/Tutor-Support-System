# 🎓 Tutor Support System - Backend API

[![NestJS](https://img.shields.io/badge/NestJS-v10.0.0-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v5.22.0-2D3748.svg)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.1.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 🎓 **Software Engineering Project (CO3001) - HCMUT**  
> Backend API hệ thống hỗ trợ Tutor/Mentor tại Trường Đại học Bách Khoa - ĐHQG TP.HCM

---

## 📋 Mô tả Dự án

Hệ thống **Tutor Support System** là giải pháp quản lý và hỗ trợ hoạt động Tutor/Mentor tại Trường Đại học Bách Khoa - ĐHQG TP.HCM. Backend API được xây dựng với **NestJS**, **Prisma ORM**, **PostgreSQL**, và **JWT Authentication**, cung cấp 31 REST endpoints với tài liệu Swagger đầy đủ.

### 🎯 Tính năng đã triển khai:

#### ✅ Core Features
- **JWT Authentication** - Xác thực với Passport Strategy
- **Role-Based Access Control (RBAC)** - 7 vai trò người dùng
- **Database Schema** - 10 models với Prisma ORM
- **API Documentation** - Swagger UI tích hợp
- **Validation** - class-validator cho tất cả DTOs
- **🤖 AI Integration** - Gemini API với TF-IDF & RAG pattern

#### ✅ Business Modules (38 endpoints)
- **Auth Module** (2 endpoints) - Register, Login với password authentication
- **Users Module** (1 endpoint) - Profile management
- **Meetings Module** (5 endpoints) - Đặt lịch, đánh giá, quản lý buổi hẹn
- **Tutors Module** (11 endpoints) - Quản lý lịch rảnh, tiến độ học sinh
- **Management Module** (13 endpoints) - Ghép cặp, khiếu nại, quản lý users
- **🤖 AI Module** (5 endpoints) - AI Matching, Chatbot, FAQ Search
- **Email Module** (1 endpoint) - Email service (non-blocking)

---

## 🚀 Hướng dẫn Cài đặt

### 📋 Yêu cầu hệ thống
- **Node.js**: >= 18.x
- **PostgreSQL**: >= 14.x  
- **npm**: >= 9.x

### ⚡ Cài đặt nhanh (5 bước)

#### 1️⃣ Clone repository
```bash
git clone https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System.git
cd Tutor-Support-System
```

#### 2️⃣ Cài đặt dependencies
```bash
npm install
```

#### 3️⃣ Tạo database PostgreSQL
```bash
# Mở PostgreSQL terminal
psql -U postgres

# Tạo database
CREATE DATABASE tutor_support_db;

# Thoát
\q
```

#### 4️⃣ Cấu hình environment variables
Tạo file `.env` trong thư mục root:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tutor_support_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development
```

**⚠️ Lưu ý:** Thay `YOUR_PASSWORD` bằng password PostgreSQL của bạn!

#### 5️⃣ Setup database & chạy ứng dụng
```bash
# Generate Prisma Client
npx prisma generate

# Đồng bộ database schema
npx prisma db push

# Build TypeScript
npm run build

# Chạy production server
npm run start:prod
```

### ✅ Kiểm tra cài đặt thành công

Khi terminal hiển thị như sau, truy cập: **http://localhost:3000/api-docs** để test APIs (Swagger).
```
✅ 📚 Swagger API Documentation: http://localhost:3000/api-docs
```
Xem db: # Opens a browser at "http://localhost:5555/"

```
npx prisma studio
```

---

## 🗂️ Cấu trúc Dự án

```
TutorSupportSystem/
├── prisma/
│   ├── schema.prisma              # Database Schema (10 models)
│   └── seed.ts                    # Database seeding script
├── src/
│   ├── core/                      # Core Module
│   │   ├── prisma.service.ts      # Prisma Client Service
│   │   └── core.module.ts
│   ├── auth/                      # ✅ Auth Module
│   │   ├── auth.controller.ts     # 2 endpoints (Register, Login)
│   │   ├── auth.service.ts        # Password auth with bcrypt
│   │   ├── jwt.strategy.ts        # Passport JWT Strategy
│   │   ├── jwt-auth.guard.ts      # JWT Authentication Guard
│   │   ├── roles.guard.ts         # RBAC Guard
│   │   ├── roles.decorator.ts     # @Roles() decorator
│   │   ├── get-user.decorator.ts  # @GetUser() decorator
│   │   └── dto/                   # Login, Register DTOs
│   ├── users/                     # ✅ Users Module
│   │   ├── users.controller.ts    # 5 endpoints
│   │   ├── users.service.ts       # Profile, Avatar, Tutor Application
│   │   └── dto/                   # User DTOs
│   ├── meetings/                  # ✅ Meetings Module
│   │   ├── meetings.controller.ts # 5 endpoints
│   │   ├── meetings.service.ts    # 560+ lines
│   │   └── dto/                   # 4 DTOs
│   ├── tutors/                    # ✅ Tutors Module
│   │   ├── tutors.controller.ts   # 11 endpoints
│   │   ├── tutors.service.ts      # 365+ lines
│   │   └── dto/                   # 2 DTOs
│   ├── management/                # ✅ Management Module
│   │   ├── management.controller.ts # 13 endpoints
│   │   ├── management.service.ts  # 520+ lines
│   │   └── dto/                   # User, Complaint DTOs
│   ├── notifications/             # ✅ Notifications Module
│   │   ├── notifications.controller.ts # 6 endpoints
│   │   ├── notifications.service.ts    # CRUD notifications
│   │   ├── notifications.gateway.ts    # WebSocket Gateway
│   │   └── dto/                        # Notification DTOs
│   ├── ai/                        # ✅ AI Module ⭐ NEW
│   │   ├── ai.controller.ts       # 5 endpoints
│   │   ├── ai-matching.service.ts # 410 lines (TF-IDF)
│   │   ├── chatbot.service.ts     # 370+ lines (RAG + Gemini)
│   │   ├── ai.module.ts
│   │   └── dto/                   # Match, Chat DTOs
│   ├── external/                  # ✅ External Services Module
│   │   ├── external.controller.ts # 14 endpoints (SSO, Datacore, Library)
│   │   ├── hcmut-sso.service.ts   # Mock SSO authentication
│   │   ├── hcmut-datacore.service.ts # Mock Datacore sync
│   │   ├── bklib.service.ts       # Mock Library integration
│   │   └── external.module.ts
│   ├── email/                     # ✅ Email Module
│   │   ├── email.controller.ts    # 5 test endpoints
│   │   ├── email.service.ts       # Nodemailer + Handlebars
│   │   └── email.module.ts
│   ├── upload/                    # ✅ Upload Module
│   │   ├── upload.service.ts      # File upload service
│   │   └── upload.module.ts
│   ├── types/                     # TypeScript type definitions
│   ├── academic/                  # 🚫 Academic Module (REMOVED - out of scope)
│   ├── my-schedule/               # 🚫 Schedule Module (REMOVED - redundant with meetings)
│   ├── app.module.ts              # Root Module
│   └── main.ts                    # Entry Point (Swagger + CORS)
├── documentation/                 # 📚 Documentation
│   ├── AI_Enhancement/            # AI features documentation
│   │   ├── README.md
│   │   ├── AI_MATCHING_SUMMARY.md
│   │   ├── AI_MATCHING_TESTING_GUIDE.md
│   │   ├── CHATBOT_SUMMARY.md
│   │   └── AI_Enhance.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT_GUIDE.md
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 API Endpoints Overview

**Tổng cộng: 61 endpoints** (Auth: 2, Users: 5, Meetings: 5, Tutors: 11, Management: 13, Notifications: 6, AI: 5, External: 14)

### 📌 Auth Module (2 endpoints)
```
POST   /auth/register           # Register new account with email & password
POST   /auth/login              # Login with Email & Password
```

### 👤 Users Module (5 endpoints)
```
GET    /users/me                # Get current user profile
POST   /users/me/avatar         # Upload avatar
DELETE /users/me/avatar         # Delete avatar
GET    /users/me/progress       # Xem tiến độ học tập (Student)
POST   /users/apply-tutor       # Nộp đơn xin làm Tutor
```

### 📅 Meetings Module (5 endpoints)
```
POST   /meetings/book           # Student đặt lịch hẹn
POST   /meetings/:id/rating     # Student đánh giá sau meeting
GET    /meetings/my-meetings    # Xem lịch hẹn của tôi
GET    /meetings/:id            # Chi tiết meeting
PATCH  /meetings/:id/cancel     # Hủy meeting
```

### 👨‍🏫 Tutors Module (11 endpoints)
```
GET    /tutors                         # Browse all tutors (with filters)
GET    /tutors/:id                     # Tutor detail
POST   /tutors/availability            # Tạo lịch rảnh
DELETE /tutors/availability/:id        # Xóa lịch rảnh
GET    /tutors/me/availability         # Xem lịch rảnh của tôi
GET    /tutors/booking-requests        # Xem booking requests (PENDING)
PATCH  /tutors/bookings/:id/confirm    # Confirm booking
PATCH  /tutors/bookings/:id/reject     # Reject booking
POST   /tutors/progress                # Ghi nhận tiến độ học sinh
GET    /tutors/students/:id/progress   # Xem tiến độ student
GET    /tutors/me/students             # Danh sách students của tôi
```

### 🛠️ Management Module (13 endpoints)
```
POST   /management/manual-pair                    # Coordinator ghép cặp thủ công
POST   /management/complaints                     # Tạo khiếu nại
GET    /management/complaints                     # Xem danh sách khiếu nại
PATCH  /management/complaints/:id/resolve         # Xử lý khiếu nại
GET    /management/users                          # Danh sách users (pagination, filters)
GET    /management/users/:id                      # Chi tiết user
POST   /management/users                          # Tạo user mới (Admin)
PATCH  /management/users/:id                      # Cập nhật user
DELETE /management/users/:id                      # Xóa user
POST   /management/users/:id/reset-password       # Reset password
GET    /management/tutor-applications             # Danh sách đơn xin tutor
PATCH  /management/tutor-applications/:id/approve # Duyệt đơn (Admin)
PATCH  /management/tutor-applications/:id/reject  # Từ chối đơn
```

### 🔔 Notifications Module (6 endpoints) ⭐ NEW
```
GET    /notifications                 # Lấy danh sách thông báo
GET    /notifications/unread-count    # Đếm số thông báo chưa đọc
POST   /notifications/:id/read        # Đánh dấu đã đọc
POST   /notifications/read-all        # Đánh dấu tất cả đã đọc
DELETE /notifications/:id             # Xóa thông báo
DELETE /notifications/read/all        # Xóa tất cả đã đọc

# WebSocket Gateway
ws://localhost:3000/notifications  # Real-time notifications
```

### 🤖 AI Module (5 endpoints) ⭐ NEW
```
POST   /ai/match-tutors         # AI Matching - Tìm tutors phù hợp (TF-IDF)
GET    /ai/similar-tutors/:id   # Tìm tutors tương tự với tutor hiện tại
POST   /ai/chat                 # Chatbot - Hỏi đáp AI assistant (Gemini + RAG)
POST   /ai/faq-search           # Tìm kiếm FAQs theo từ khóa (Semantic search)
GET    /ai/chatbot/health       # Health check Gemini API
```

### 🌐 External Services Module (14 endpoints) ⭐ NEW
```
# SSO Service (Mock HCMUT SSO)
GET    /external/sso/health                   # SSO health check

# Datacore Service (Mock HCMUT Datacore)
GET    /external/datacore/health              # Datacore health check
POST   /external/datacore/sync-user           # Đồng bộ thông tin 1 user
POST   /external/datacore/bulk-sync           # Đồng bộ hàng loạt users
GET    /external/datacore/students/:dept      # Lấy danh sách sinh viên theo khoa
GET    /external/datacore/tutors/:dept        # Lấy danh sách tutors theo khoa
GET    /external/datacore/user-status/:id     # Kiểm tra trạng thái user

# Library Service (Mock BKLib)
GET    /external/library/health               # Library health check
GET    /external/library/search               # Tìm kiếm tài liệu
POST   /external/library/document-url         # Lấy URL tài liệu
GET    /external/library/document/:id         # Chi tiết tài liệu
GET    /external/library/recommendations      # Gợi ý tài liệu
GET    /external/library/popular              # Tài liệu phổ biến

# Overall Health
GET    /external/health-all                   # Tổng hợp health check tất cả services
```

### 📧 Email Module (5 test endpoints) ⭐ NEW
```
GET    /email/test-connection       # Test SMTP connection
POST   /email/test-welcome          # Test welcome email template
POST   /email/test-confirmation     # Test meeting confirmation email
POST   /email/test-rating           # Test rating request email
POST   /email/test-complaint        # Test complaint notification email
```

---

## 🧪 Test API

### Khuyến nghị: Sử dụng Swagger UI
👉 **http://localhost:3000/api-docs**

Swagger UI cung cấp:
- ✅ Giao diện trực quan để test tất cả endpoints
- ✅ Tự động generate request body templates
- ✅ Authentication token management
- ✅ Response preview với syntax highlighting
- ✅ Schema documentation đầy đủ

### Hoặc sử dụng cURL/Postman

**Ví dụ 1: Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@hcmut.edu.vn"}'
```

**Ví dụ 2: Get Profile (Protected)**
```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ví dụ 3: Đặt lịch hẹn**
```bash
curl -X POST http://localhost:3000/meetings/book \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": 1,
    "slotId": 5,
    "topic": "Học môn Toán"
  }'
```

---

## 📚 Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **NestJS** | ^10.0.0 | Framework Backend |
| **Prisma** | ^5.5.0 | ORM & Database Migrations |
| **PostgreSQL** | >= 14.x | Database |
| **JWT** | ^10.1.0 | Authentication |
| **Passport** | ^0.6.0 | Authentication Middleware |
| **class-validator** | ^0.14.0 | DTO Validation |
| **Swagger** | ^7.1.0 | API Documentation |
| **@google/generative-ai** | ^0.21.0 | Gemini AI Integration ⭐ |
| **natural** | ^7.0.7 | TF-IDF Vectorization ⭐ |
| **bcrypt** | ^5.1.1 | Password Hashing ⭐ |

---

## 🛠️ Các lệnh hữu ích

### Development
```bash
npm run start:dev          # Chạy với hot-reload
npm run build              # Build TypeScript
npm run start:prod         # Chạy production
```

### Database (Prisma)
```bash
npx prisma generate        # Generate Prisma Client
npx prisma db push         # Sync schema với database
npx prisma studio          # Mở Database GUI
npx prisma db seed         # Seed data mẫu (coming soon)
```

### Code Quality
```bash
npm run format             # Format code với Prettier
npm run lint               # Lint code với ESLint
npm run test               # Run unit tests (coming soon)
npm run test:e2e           # Run E2E tests (coming soon)
```

### Git Workflow
```bash
git pull origin main       # Pull code mới nhất
git checkout -b feature/x  # Tạo branch mới
git add .                  # Stage changes
git commit -m "message"    # Commit
git push origin feature/x  # Push & tạo PR
```

---

## 👥 Phân quyền (Roles)

Hệ thống hỗ trợ 7 vai trò:

1. **STUDENT** - Sinh viên
2. **TUTOR** - Tutor
3. **COORDINATOR** - Điều phối viên
4. **TBM** - Trưởng bộ môn
5. **OAA** - Office of Academic Affairs (Phòng Đào tạo)
6. **OSA** - Office of Student Affairs (Phòng Công tác Sinh viên)
7. **ADMIN** - Quản trị viên hệ thống

---

## 📈 Tiến độ Use Cases (13/19 hoàn thành - 68%)

### ✅ Đã triển khai (13 use cases)

#### Student Use Cases (8/8)
- ✅ **UC_STU_01**: Đặt lịch hẹn với Tutor
- ✅ **UC_STU_02**: Xem lịch sử buổi học (`GET /meetings/my-meetings`)
- ✅ **UC_STU_03**: Hủy buổi hẹn (`PATCH /meetings/:id/cancel`)
- ✅ **UC_STU_04**: Gửi khiếu nại (`POST /management/complaints`)
- ✅ **UC_STU_05**: Đánh giá Tutor sau buổi học
- ✅ **UC_STU_06**: Nộp đơn xin làm Tutor (`POST /users/apply-tutor`) ⭐
- ✅ **UC_STU_07**: Upload Avatar (`POST /users/me/avatar`) ⭐
- ✅ **UC_STU_08**: Xem tiến độ học tập (`GET /users/me/progress`) ⭐

#### Tutor Use Cases (3/3)
- ✅ **UC_TUT_01**: Quản lý lịch rảnh (availability slots)
- ✅ **UC_TUT_02**: Quản lý booking requests (confirm/reject)
- ✅ **UC_TUT_03**: Ghi nhận tiến độ học sinh

#### Coordinator Use Cases (2/2)
- ✅ **UC_COO_01**: Ghép cặp thủ công Student-Tutor
- ✅ **UC_COO_02**: Xử lý khiếu nại

#### Admin Use Cases (3/3)
- ✅ **UC_ADMIN_01**: Quản lý Users (CRUD + reset password)
- ✅ **UC_ADMIN_02**: Phê duyệt đơn xin làm Tutor
- ✅ **UC_ADMIN_03**: Quản lý Email Service (non-blocking) ⭐

---

### 🚫 Đã quyết định Bỏ (6 use cases - Out of Scope)

#### TBM (Trưởng Bộ Môn) Use Cases
- 🚫 **UC_TBM_01**: Xem báo cáo hiệu suất Tutor (Requires complex analytics)
- 🚫 **UC_TBM_02**: Đồng bộ dữ liệu từ hệ thống khác (External services mocked only)

#### OAA (Office of Academic Affairs) Use Cases
- 🚫 **UC_OAA_01**: Xem thống kê hệ thống (Requires BI/dashboard frontend)
- 🚫 **UC_OAA_02**: Xuất báo cáo (Requires report generation libraries)

#### OSA (Office of Student Affairs) Use Cases
- 🚫 **UC_OSA_01**: Review đơn xin làm Tutor bước 1 (Simplified to 1-step approval by Admin)
- 🚫 **UC_OSA_02**: Quản lý hoạt động sinh viên (Out of project scope)

**Lý do bỏ:** Phức tạp về frontend (charts, dashboards), cần thư viện bên ngoài (PDF generation), hoặc ngoài phạm vi dự án (student activity management)

---

## 📈 Thống kê Dự án

### 📊 Core Metrics

| Metric | Số lượng | Chi tiết | Status |
|--------|----------|---------|--------|
| **Database Models** | 10 | User, Meeting, AvailabilitySlot, TutorSubject, Rating, Progress, Complaint, TutorApplication, Notification, Session | ✅ Complete |
| **Modules** | 10 | Auth, Users, Meetings, Tutors, Management, Notifications, AI, External, Email, Upload | ✅ Complete |
| **Controller Endpoints** | 61 | Auth(2) + Users(5) + Meetings(5) + Tutors(11) + Management(13) + Notifications(6) + AI(5) + External(14) | ✅ Complete |
| **DTOs** | 20+ | Validation với class-validator | ✅ Complete |
| **Service Files** | 12 | AIMatching, Chatbot, SSO, Datacore, Library, Email, v.v. | ✅ Complete |
| **Use Cases Completed** | 13/19 (68%) | 13 đã triển khai, 6 bỏ (out of scope) | 📈 Growing |


### ⭐ Feature Highlights

| Feature | Technology | Status |
|---------|------------|--------|
| **Authentication** | JWT + Passport + bcrypt | ✅ Complete |
| **RBAC** | 7 roles (Guards + Decorators) | ✅ Complete |
| **AI Matching** | TF-IDF + Cosine Similarity | ✅ Complete |
| **Chatbot** | Gemini 2.5 Flash + RAG | ✅ Complete |
| **Real-time Notifications** | WebSocket (Socket.IO) | ✅ Complete |
| **External Services** | SSO, Datacore, Library (Mocked) | ✅ Complete |
| **Email Service** | Nodemailer + SMTP | ✅ Complete |
| **File Upload** | Multer (Avatar) | ✅ Complete |
| **API Documentation** | Swagger UI | ✅ Complete |

### 🛠️ Dependencies

| Category | Libraries |
|----------|----------|
| **Core** | NestJS, Prisma, PostgreSQL |
| **Auth** | @nestjs/jwt, @nestjs/passport, bcrypt |
| **AI** | @google/generative-ai, natural |
| **Real-time** | @nestjs/websockets, socket.io |
| **Email** | @nestjs-modules/mailer, nodemailer, handlebars |
| **Validation** | class-validator, class-transformer |
| **Documentation** | @nestjs/swagger |
| **File Upload** | multer, @types/multer |

---

## 🐛 Troubleshooting

### ❌ Lỗi: "Cannot connect to database"
```bash
# Kiểm tra PostgreSQL đang chạy (Windows)
# Services → PostgreSQL

# Hoặc test connection
psql -U postgres -d tutor_support_db

# Kiểm tra DATABASE_URL trong .env đúng chưa
```

### ❌ Lỗi: "Module not found"
```bash
npm install
npx prisma generate
```

### ❌ Lỗi: "Port 3000 already in use"
```bash
# Đổi PORT trong .env
PORT=3001

# Hoặc kill process đang dùng port 3000
# Windows PowerShell:
Get-Process node | Stop-Process -Force
```

### ❌ Lỗi compilation TypeScript
```bash
# Xóa cache và rebuild
rm -rf dist node_modules
npm install
npm run build
```

### ❌ Lỗi: "Prisma schema out of sync"
```bash
npx prisma generate
npx prisma db push
```

---


## 🤖 AI Features

### ✅ Priority 1: AI Matching (COMPLETED)
**Tìm tutors phù hợp nhất với student sử dụng Machine Learning**

- **Algorithm**: TF-IDF Vectorization + Cosine Similarity
- **Input**: Student preferences (subjects, experience level, preferred times, budget)
- **Output**: Danh sách tutors được xếp hạng theo điểm matching (0-100)
- **Features**:
  - Content-Based Filtering
  - Weighted scoring (subjects: 40%, experience: 25%, rating: 20%, availability: 15%)
  - Detailed explanation cho mỗi match
- **Endpoints**:
  - `POST /ai/match-tutors` - Tìm tutors phù hợp
  - `GET /ai/similar-tutors/:id` - Tìm tutors tương tự
- **Testing**: ✅ 7/7 test cases passed
- **Code**: `ai-matching.service.ts`

### ✅ Priority 2: Chatbot + RAG (COMPLETED)
**AI Assistant trả lời câu hỏi về hệ thống**

- **Model**: Google Gemini 2.5 Flash (FREE tier, 60 req/min)
- **Architecture**: RAG (Retrieval-Augmented Generation)
  - **Retrieval**: Semantic search on FAQs database
  - **Augmented**: Build context from conversation history + relevant FAQs
  - **Generation**: Gemini API generates Vietnamese response
- **Features**:
  - Intent extraction (keyword-based for performance)
  - Conversation history support
  - 6 FAQ categories (booking, tutor, rating, complaint, etc.)
  - Retry mechanism with exponential backoff (handle 503 overload)
  - Non-critical email service (won't block registration)
- **Endpoints**:
  - `POST /ai/chat` - Chat với AI assistant
  - `POST /ai/faq-search` - Tìm kiếm FAQs
  - `GET /ai/chatbot/health` - Health check Gemini API
- **Testing**: ✅ 5/5 test cases passed
- **Code**: `chatbot.service.ts`

### ⏸️ Priority 3: Content Generation (POSTPONED)
**Tạo nội dung tự động cho tutors** - Tạm hoãn do phức tạp tích hợp frontend

---


## 📞 Liên hệ & Hỗ trợ

- **Môn học:** Công Nghệ Phần Mềm (CO3001)
- **Trường:** Đại học Bách Khoa - ĐHQG TP.HCM
- **Học kỳ:** HK251 (2024-2025)
- **Repository:** [github.com/ThanhCongNguyen-2310373/Tutor-Support-System](https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System)
- **Issues:** [GitHub Issues](https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System/issues)

---


