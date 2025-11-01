# Tutor Support System - Backend API

[![NestJS](https://img.shields.io/badge/NestJS-v10.0.0-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v5.5.0-2D3748.svg)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.1.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-336791.svg)](https://www.postgresql.org/)

> 🎓 **Software Engineering Project (CO3001) - HCMUT**  
> Backend API hệ thống hỗ trợ Tutor/Mentor tại Trường Đại học Bách Khoa - ĐHQG TP.HCM

## 📋 Mô tả Dự án

Hệ thống backend cho **Tutor Support System** của Trường Đại học Bách Khoa - ĐHQG TP.HCM (HCMUT). Dự án được xây dựng bằng **NestJS**, **Prisma ORM**, **PostgreSQL**, và **JWT Authentication**.

### Tính năng chính:
- ✅ Xác thực JWT (mô phỏng HCMUT_SSO)
- ✅ Quản lý người dùng đa vai trò (Student, Tutor, Coordinator, TBM, OAA, OSA, Admin)
- ✅ Quản lý lịch hẹn và tiến độ học tập
- ✅ Đánh giá và khiếu nại
- ✅ Phê duyệt tutor và quản trị hệ thống
- ✅ Tích hợp Swagger API Documentation

---

## 🚀 Cài đặt & Chạy Dự án

### 1. Yêu cầu hệ thống
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### 2. Clone và cài đặt dependencies

```bash
# Clone repository từ GitHub
git clone https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System.git
cd Tutor-Support-System

# Cài đặt dependencies
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin PostgreSQL của bạn:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/tutor_support_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key
```

### 4. Khởi tạo Database với Prisma

```bash
# Tạo Prisma Client
npm run prisma:generate

# Chạy migrations để tạo tables
npm run prisma:migrate

# (Tùy chọn) Mở Prisma Studio để xem database
npm run prisma:studio
```

### 5. Chạy ứng dụng

```bash
# Development mode (hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

---

## 📖 API Documentation (Swagger)

Sau khi chạy ứng dụng, truy cập Swagger UI tại:

```
http://localhost:3000/api-docs
```

Tại đây bạn có thể:
- Xem tất cả endpoints
- Test API trực tiếp
- Xem schema của request/response

---

## 🗂️ Cấu trúc Dự án

```
Tutor Support System/
├── prisma/
│   └── schema.prisma          # Prisma Schema (Database Models)
├── src/
│   ├── core/
│   │   ├── prisma.service.ts  # Prisma Service
│   │   └── core.module.ts     # Core Module (Global)
│   ├── auth/                  # Auth Module (JWT, Guards, Strategy)
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── roles.guard.ts
│   │   ├── roles.decorator.ts
│   │   └── dto/
│   │       └── login.dto.ts
│   ├── users/                 # Users Module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   ├── tutors/                # Tutors Module (empty scaffold)
│   ├── my-schedule/           # Schedule Module (empty scaffold)
│   ├── meetings/              # Meetings Module (empty scaffold)
│   ├── management/            # Management Module (empty scaffold)
│   ├── academic/              # Academic Module (empty scaffold)
│   ├── notifications/         # Notifications Module (empty scaffold)
│   ├── app.module.ts          # Root Module
│   └── main.ts                # Entry Point
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 🧪 Test API với cURL hoặc Postman

### 1. Đăng nhập (Login)

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "hoang.nhan23@hcmut.edu.vn"
}
```

**Response:**
```json
{
  "message": "Login successful (SSO Mock)",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "hoang.nhan23@hcmut.edu.vn",
    "fullName": "hoang.nhan23",
    "role": "STUDENT"
  }
}
```

### 2. Lấy thông tin cá nhân (Protected Route)

```bash
GET http://localhost:3000/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "id": 1,
  "email": "hoang.nhan23@hcmut.edu.vn",
  "mssv": "HOANG.NHAN23",
  "fullName": "hoang.nhan23",
  "role": "STUDENT",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "tutorProfile": null
}
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

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Build production
npm run build

# Prisma Studio (Database GUI)
npm run prisma:studio
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

## 📝 Use Cases Được Triển khai

### Giai đoạn 1 (Đã hoàn thành):
- ✅ UC_GENERAL_01: Đăng nhập vào hệ thống
- ✅ UC_GENERAL_02: Quản lý hồ sơ cá nhân

### Giai đoạn 2 (Cần triển khai):
- 🔄 UC_STU_01-05: Student Use Cases
- 🔄 UC_TUT_01-03: Tutor Use Cases
- 🔄 UC_COO_01-02: Coordinator Use Cases
- 🔄 UC_TBM_01-02: TBM Use Cases
- 🔄 UC_ADMIN_01-03: Admin Use Cases
- 🔄 UC_OAA_01-02: OAA Use Cases
- 🔄 UC_OSA_01-02: OSA Use Cases
- 🔄 UC_SYS_01-02: System Use Cases

---

## 🐛 Troubleshooting

### Lỗi kết nối Database
```bash
# Kiểm tra PostgreSQL đang chạy
psql -U postgres

# Tạo database nếu chưa có
CREATE DATABASE tutor_support_db;
```

### Lỗi Prisma Client
```bash
# Regenerate Prisma Client
npm run prisma:generate
```

---

## 📞 Liên hệ & Hỗ trợ

- **Môn học:** Công Nghệ Phần Mềm (CO3001)
- **Trường:** Đại học Bách Khoa - ĐHQG TP.HCM
- **Học kỳ:** HK251
- **Repository:** [GitHub](https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System)

---

