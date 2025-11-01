# 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Dự Án

## Bước 1: Chuẩn bị môi trường

### 1.1. Cài đặt Node.js
- Tải và cài đặt Node.js >= 18.x từ: https://nodejs.org/
- Kiểm tra phiên bản:
```bash
node --version
npm --version
```

### 1.2. Cài đặt PostgreSQL
- Tải và cài đặt PostgreSQL >= 14.x từ: https://www.postgresql.org/download/
- Sau khi cài đặt, tạo database:

```sql
-- Mở psql hoặc pgAdmin
CREATE DATABASE tutor_support_db;
```

---

## Bước 2: Clone và cài đặt dependencies

```bash
# Di chuyển vào thư mục dự án
cd "d:\HK251\CNPM\BTL\Sub3\Tutor Support System"

# Cài đặt tất cả dependencies
npm install
```

**Lưu ý:** Quá trình cài đặt có thể mất 2-5 phút tùy tốc độ mạng.

---

## Bước 3: Cấu hình Database Connection

### 3.1. Tạo file .env

Sao chép file `.env.example` thành `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Hoặc tạo thủ công
```

### 3.2. Chỉnh sửa file .env

Mở file `.env` và cập nhật thông tin kết nối PostgreSQL:

```env
# Định dạng: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tutor_support_db?schema=public"

# Thay đổi:
# - postgres: username PostgreSQL của bạn
# - yourpassword: mật khẩu PostgreSQL của bạn
# - localhost: địa chỉ server (giữ nguyên nếu chạy local)
# - 5432: port PostgreSQL (mặc định)
# - tutor_support_db: tên database đã tạo ở bước 1.2

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

## Bước 4: Khởi tạo Database với Prisma

### 4.1. Generate Prisma Client

```bash
npm run prisma:generate
```

Lệnh này sẽ:
- Đọc file `prisma/schema.prisma`
- Tạo Prisma Client để tương tác với database
- Output: `node_modules/.prisma/client`

### 4.2. Chạy Database Migrations

```bash
npm run prisma:migrate
```

Khi được hỏi tên migration, nhập: `init`

Lệnh này sẽ:
- Tạo tất cả tables trong PostgreSQL theo schema
- Tạo thư mục `prisma/migrations` (đã bị ignore trong git)

### 4.3. (Tùy chọn) Kiểm tra Database

```bash
npm run prisma:studio
```

Lệnh này sẽ mở Prisma Studio tại `http://localhost:5555` để xem database GUI.

---

## Bước 5: Chạy ứng dụng

### 5.1. Development Mode (Khuyến nghị)

```bash
npm run start:dev
```

**Output:**
```
[Nest] 12345  - 01/01/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/01/2025, 10:00:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 01/01/2025, 10:00:00 AM     LOG [RoutesResolver] AuthController {/auth}:
[Nest] 12345  - 01/01/2025, 10:00:00 AM     LOG [RouterExplorer] Mapped {/auth/login, POST} route
[Nest] 12345  - 01/01/2025, 10:00:00 AM     LOG [NestApplication] Nest application successfully started
```

Ứng dụng chạy tại: `http://localhost:3000`

### 5.2. Production Mode

```bash
# Build
npm run build

# Chạy
npm run start:prod
```

---

## Bước 6: Kiểm tra API

### 6.1. Swagger UI

Truy cập: `http://localhost:3000/api-docs`

### 6.2. Test endpoint Login

#### Cách 1: Sử dụng Swagger UI
1. Mở `http://localhost:3000/api-docs`
2. Mở section **"1. Auth"**
3. Click **"POST /auth/login"**
4. Click **"Try it out"**
5. Nhập body:
```json
{
  "email": "hoang.nhan23@hcmut.edu.vn"
}
```
6. Click **"Execute"**

#### Cách 2: Sử dụng cURL (PowerShell)

```bash
curl -X POST "http://localhost:3000/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"hoang.nhan23@hcmut.edu.vn"}'
```

#### Response mong đợi:

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

### 6.3. Test endpoint Protected (GET /users/me)

#### Bước 1: Copy access_token từ response login

#### Bước 2: Gọi API

```bash
curl -X GET "http://localhost:3000/users/me" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Thay `YOUR_ACCESS_TOKEN_HERE` bằng token vừa nhận được.

#### Response mong đợi:

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

## Bước 7: Kiểm tra Database

### Cách 1: Prisma Studio

```bash
npm run prisma:studio
```

Truy cập: `http://localhost:5555`

### Cách 2: pgAdmin hoặc psql

```sql
-- Kết nối database
\c tutor_support_db

-- Xem tất cả tables
\dt

-- Xem dữ liệu User
SELECT * FROM "User";
```

---

## ✅ Checklist Hoàn thành

- [ ] Node.js >= 18.x đã cài đặt
- [ ] PostgreSQL >= 14.x đã cài đặt
- [ ] Database `tutor_support_db` đã được tạo
- [ ] File `.env` đã được cấu hình đúng
- [ ] `npm install` chạy thành công
- [ ] `npm run prisma:generate` chạy thành công
- [ ] `npm run prisma:migrate` chạy thành công
- [ ] `npm run start:dev` chạy thành công
- [ ] Swagger UI tại `http://localhost:3000/api-docs` hoạt động
- [ ] API `/auth/login` trả về token
- [ ] API `/users/me` trả về thông tin user

---

## 🐛 Troubleshooting

### Lỗi 1: "Cannot find module '@nestjs/common'"

**Nguyên nhân:** Dependencies chưa được cài đặt.

**Giải pháp:**
```bash
npm install
```

### Lỗi 2: "Prisma Client not found"

**Nguyên nhân:** Prisma Client chưa được generate.

**Giải pháp:**
```bash
npm run prisma:generate
```

### Lỗi 3: "Can't reach database server"

**Nguyên nhân:** 
- PostgreSQL chưa chạy
- Thông tin kết nối trong `.env` sai

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy:
```bash
# Windows
services.msc
# Tìm "PostgreSQL" và Start
```

2. Kiểm tra lại `DATABASE_URL` trong `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/tutor_support_db?schema=public"
```

### Lỗi 4: "Port 3000 already in use"

**Nguyên nhân:** Port 3000 đang được sử dụng bởi ứng dụng khác.

**Giải pháp:**
1. Đổi port trong `.env`:
```env
PORT=3001
```

2. Hoặc kill process đang dùng port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Lỗi 5: Migration failed

**Nguyên nhân:** Database có vấn đề hoặc migrations bị conflict.

**Giải pháp:**
```bash
# Reset database (XÓA TẤT CẢ DỮ LIỆU)
npx prisma migrate reset

# Chạy lại migrations
npm run prisma:migrate
```

---
