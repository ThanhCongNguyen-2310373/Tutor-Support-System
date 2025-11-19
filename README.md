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

#### ✅ Business Modules (31 endpoints)
- **Meetings Module** (5 endpoints) - Đặt lịch, đánh giá, quản lý buổi hẹn
- **Tutors Module** (11 endpoints) - Quản lý lịch rảnh, tiến độ học sinh
- **Management Module** (13 endpoints) - Ghép cặp, khiếu nại, quản lý users
- **Auth Module** (1 endpoint) - SSO Login mock
- **Users Module** (1 endpoint) - Profile management

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
│   └── schema.prisma              # Database Schema (10 models)
├── src/
│   ├── core/                      # Core Module
│   │   ├── prisma.service.ts      # Prisma Client Service
│   │   └── core.module.ts
│   ├── auth/                      # ✅ Auth Module (100%)
│   │   ├── auth.controller.ts     # Login endpoint
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts        # Passport JWT Strategy
│   │   ├── jwt-auth.guard.ts      # JWT Authentication Guard
│   │   ├── roles.guard.ts         # RBAC Guard
│   │   ├── roles.decorator.ts     # @Roles() decorator
│   │   ├── get-user.decorator.ts  # @GetUser() decorator
│   │   └── dto/
│   ├── users/                     # ✅ Users Module
│   │   ├── users.controller.ts    # Profile management
│   │   └── users.service.ts
│   ├── meetings/                  # ✅ Meetings Module (100%)
│   │   ├── meetings.controller.ts # 5 endpoints
│   │   ├── meetings.service.ts    # 9 methods (560+ lines)
│   │   └── dto/                   # 4 DTOs
│   ├── tutors/                    # ✅ Tutors Module (100%)
│   │   ├── tutors.controller.ts   # 11 endpoints
│   │   ├── tutors.service.ts      # 10 methods (365+ lines)
│   │   └── dto/                   # 2 DTOs
│   ├── management/                # ✅ Management Module (100%)
│   │   ├── management.controller.ts # 13 endpoints
│   │   ├── management.service.ts  # 12 methods (520+ lines)
│   │   └── dto/                   # 3 DTOs
│   ├── my-schedule/               # 🔄 Schedule Module (empty scaffold)
│   ├── academic/                  # 🔄 Academic Module (empty scaffold)
│   ├── notifications/             # 🔄 Notifications Module (empty scaffold)
│   ├── app.module.ts              # Root Module
│   └── main.ts                    # Entry Point (Swagger setup)
├── documentation/                 # 📚 Documentation
│   ├── New/
│   │   ├── guide.md              # Setup guide
│   │   └── new_summary.md        # Project summary & tasks
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT_GUIDE.md
│   └── ...
├── .env.example
├── package.json
└── README.md
```

---

## 🎯 API Endpoints Overview

### 📌 Auth Module (1 endpoint)
```
POST   /auth/login              # SSO Login (mock)
```

### 👤 Users Module (1 endpoint)
```
GET    /users/me                # Get current user profile (Protected)
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
GET    /tutors                         # Browse all tutors
GET    /tutors/:id                     # Tutor detail
POST   /tutors/availability            # Tạo lịch rảnh
DELETE /tutors/availability/:id        # Xóa lịch rảnh
GET    /tutors/me/availability         # Xem lịch rảnh của tôi
GET    /tutors/booking-requests        # Xem booking requests
PATCH  /tutors/bookings/:id/confirm    # Confirm booking
PATCH  /tutors/bookings/:id/reject     # Reject booking
POST   /tutors/progress                # Ghi nhận tiến độ học sinh
GET    /tutors/students/:id/progress   # Xem tiến độ student
GET    /tutors/me/students             # Danh sách students của tôi
```

### 🛠️ Management Module (13 endpoints)
```
POST   /management/manual-pair                    # Coordinator ghép cặp
POST   /management/complaints                     # Tạo khiếu nại
GET    /management/complaints                     # Xem khiếu nại
PATCH  /management/complaints/:id/resolve         # Xử lý khiếu nại
GET    /management/users                          # Danh sách users (pagination)
GET    /management/users/:id                      # Chi tiết user
POST   /management/users                          # Tạo user
PATCH  /management/users/:id                      # Cập nhật user
DELETE /management/users/:id                      # Xóa user
POST   /management/users/:id/reset-password       # Reset password
GET    /management/tutor-applications             # Danh sách đơn xin tutor
PATCH  /management/tutor-applications/:id/approve # Duyệt đơn
PATCH  /management/tutor-applications/:id/reject  # Từ chối đơn
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

## � Tiến độ Use Cases (9/19 hoàn thành - 47%)

### ✅ Đã triển khai (9 use cases)

#### Student Use Cases
- ✅ **UC_STU_01**: Đặt lịch hẹn với Tutor
- ✅ **UC_STU_05**: Đánh giá Tutor sau buổi học

#### Tutor Use Cases  
- ✅ **UC_TUT_01**: Quản lý lịch rảnh (availability slots)
- ✅ **UC_TUT_02**: Quản lý booking requests (confirm/reject)
- ✅ **UC_TUT_03**: Ghi nhận tiến độ học sinh

#### Coordinator Use Cases
- ✅ **UC_COO_01**: Ghép cặp thủ công Student-Tutor
- ✅ **UC_COO_02**: Xử lý khiếu nại

#### Admin Use Cases
- ✅ **UC_ADMIN_01**: Quản lý Users (CRUD + reset password)
- ✅ **UC_ADMIN_02**: Phê duyệt đơn xin làm Tutor

---

### 🔄 Đang triển khai (10 use cases)

#### Admin Use Cases
- 🔄 **UC_ADMIN_03**: Xử lý lỗi hệ thống (system errors)

#### TBM (Trưởng Bộ Môn) Use Cases
- 🔄 **UC_TBM_01**: Xem báo cáo hiệu suất Tutor
- 🔄 **UC_TBM_02**: Đồng bộ dữ liệu từ hệ thống khác

#### OAA (Office of Academic Affairs) Use Cases
- 🔄 **UC_OAA_01**: Xem thống kê hệ thống
- 🔄 **UC_OAA_02**: Xuất báo cáo

#### OSA (Office of Student Affairs) Use Cases
- 🔄 **UC_OSA_01**: Review đơn xin làm Tutor (bước 1)
- 🔄 **UC_OSA_02**: Quản lý hoạt động sinh viên

#### Student Use Cases (còn lại)
- 🔄 **UC_STU_02**: Xem lịch sử buổi học
- 🔄 **UC_STU_03**: Hủy buổi hẹn
- 🔄 **UC_STU_04**: Gửi khiếu nại

---

## 📈 Thống kê Dự án

| Metric | Số lượng | Status |
|--------|----------|--------|
| **Database Models** | 10 | ✅ Complete |
| **Modules** | 6 chính + 3 empty | 🔄 In Progress |
| **DTOs** | 11 | ✅ Complete |
| **Service Methods** | 33 | ✅ Complete |
| **Controller Endpoints** | 31 | ✅ Complete |
| **Use Cases Completed** | 9/19 (47%) | 🔄 In Progress |
| **Lines of Code** | 2,200+ | 📈 Growing |

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


## 📚 Tài liệu bổ sung

- **📊 Tổng kết Backend:** [`TONG_KET_BACKEND.md`](TONG_KET_BACKEND.md) - Báo cáo chi tiết về tiến độ và kế hoạch
- **🎤 Presentation Summary:** [`PRESENTATION_SUMMARY.md`](PRESENTATION_SUMMARY.md) - Tóm tắt cho team meeting (10 phút)
- **✅ Development Checklist:** [`DEVELOPMENT_CHECKLIST.md`](DEVELOPMENT_CHECKLIST.md) - Checklist công việc 8 tuần
- **🎨 Frontend Integration:** [`FRONTEND_INTEGRATION.md`](FRONTEND_INTEGRATION.md) - Hướng dẫn tích hợp Frontend (React/React Native)
- **⚡ Frontend Quick Reference:** [`FRONTEND_QUICKREF.md`](FRONTEND_QUICKREF.md) - Cheat sheet nhanh cho Frontend
- **📖 Documentation:** [`/documentation`](documentation/) - Tài liệu kỹ thuật chi tiết

---

## 📞 Liên hệ & Hỗ trợ

- **Môn học:** Công Nghệ Phần Mềm (CO3001)
- **Trường:** Đại học Bách Khoa - ĐHQG TP.HCM
- **Học kỳ:** HK251 (2024-2025)
- **Repository:** [github.com/ThanhCongNguyen-2310373/Tutor-Support-System](https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System)
- **Issues:** [GitHub Issues](https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System/issues)

---


