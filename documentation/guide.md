# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN - TUTOR SUPPORT SYSTEM

## 📋 YÊU CẦU HỆ THỐNG

- **Node.js**: >= 18.x
- **PostgreSQL**: >= 14.x
- **npm**: >= 9.x

---

## ⚡ BƯỚC 1: CÀI ĐẶT

```bash
# Clone repository
git clone https://github.com/ThanhCongNguyen-2310373/Tutor-Support-System.git
cd Tutor-Support-System

# Cài đặt dependencies
npm install
```

---

## 🗄️ BƯỚC 2: SETUP DATABASE

### A. Tạo Database PostgreSQL

```bash
# Mở PostgreSQL terminal
psql -U postgres

# Tạo database
CREATE DATABASE tutor_support_db;

# Thoát
\q
```

### B. Cấu hình Environment Variables

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

**⚠️ LƯU Ý:** Thay `YOUR_PASSWORD` bằng password PostgreSQL của bạn!

---

## 🔧 BƯỚC 3: MIGRATION & SEEDING

```bash
# Generate Prisma Client
npx prisma generate

# Đồng bộ database schema
npx prisma db push

# (Optional) Seed data mẫu - CHỜ DBA hoàn thành seed.ts
# npx prisma db seed
```

---

## 🏃 BƯỚC 4: CHẠY PROJECT

### Development Mode (không chạy cái này cũng được)
```bash
npm run start:dev
```

### Production Mode (bắt đầu từ đây cũng được)
```bash
# Build
npm run build

# Start
npm run start:prod
```

---

## ✅ BƯỚC 5: KIỂM TRA

### Kiểm tra server chạy thành công
```
✅ Terminal hiển thị: "Nest application successfully started"
✅ Hiển thị: "📚 Swagger API Documentation: http://localhost:3000/api-docs"
```

### Truy cập Swagger UI
👉 **http://localhost:3000/api-docs** - Test tất cả APIs tại đây

---

## 🔥 COMMANDS QUAN TRỌNG

```bash
# Development
npm run start:dev          # Chạy với hot-reload

# Production
npm run build              # Build TypeScript
npm run start:prod         # Chạy production

# Database
npx prisma generate        # Generate Prisma Client
npx prisma db push         # Sync schema với DB
npx prisma studio          # Mở GUI quản lý database

# Testing (sau khi implement)
npm run test               # Unit tests
npm run test:e2e           # E2E tests
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot connect to database"
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows: Services → PostgreSQL
# Kiểm tra DATABASE_URL trong .env đúng chưa
```

### Lỗi: "Module not found"
```bash
npm install
npx prisma generate
```

### Lỗi: Port 3000 đã được sử dụng
```bash
# Đổi PORT trong .env
PORT=3001
```

### Lỗi compilation
```bash
# Xóa cache và rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

## 📚 API DOCUMENTATION

Sau khi chạy server, truy cập **Swagger UI** để xem và test tất cả APIs:

👉 **http://localhost:3000/api-docs**

### Các module có sẵn:
- ✅ **Auth** (1 endpoint): Login
- ✅ **Meetings** (5 endpoints): Book, Rate, View
- ✅ **Tutors** (11 endpoints): Profile, Availability, Progress
- ✅ **Management** (13 endpoints): Users, Complaints, Applications

**Tổng: 33 endpoints**

---

