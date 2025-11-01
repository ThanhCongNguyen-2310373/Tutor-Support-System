# ⚡ Quick Start Guide

## 🎯 Prerequisites (Chuẩn bị sẵn)

Đảm bảo bạn đã cài đặt:
- ✅ Node.js >= 18.x
- ✅ PostgreSQL >= 14.x
- ✅ npm hoặc yarn

---

## 🚀 Các lệnh chạy nhanh

### 1️⃣ Cài đặt Dependencies (2 phút)

```powershell
cd "d:\HK251\CNPM\BTL\Sub3\Tutor Support System"
npm install
```

### 2️⃣ Cấu hình Database (1 phút)

Tạo file `.env`:

```powershell
Copy-Item .env.example .env
```

Chỉnh sửa `.env` (thay `yourpassword`):

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tutor_support_db?schema=public"
JWT_SECRET=my-super-secret-key-123
```

Tạo database trong PostgreSQL:

```sql
CREATE DATABASE tutor_support_db;
```

### 3️⃣ Khởi tạo Database với Prisma (1 phút)

```powershell
npm run prisma:generate
npm run prisma:migrate
```

Khi được hỏi migration name, gõ: `init`

### 4️⃣ Chạy Server (30 giây)

```powershell
npm run start:dev
```

**Thành công khi thấy:**
```
[Nest] LOG [NestApplication] Nest application successfully started
```

---

## ✅ Test ngay API

### 1. Mở Swagger UI

Truy cập: http://localhost:3000/api-docs

### 2. Test Login

Click vào **"1. Auth"** → **"POST /auth/login"** → **"Try it out"**

Body:
```json
{
  "email": "test@hcmut.edu.vn"
}
```

Click **"Execute"** → Copy `access_token`

### 3. Test Protected Route

Click vào **"2. Users"** → **"GET /users/me"** → **"Try it out"**

Click nút **"Authorize"** (góc phải trên) → Paste token → **"Authorize"** → **"Close"**

Click **"Execute"** → Xem thông tin user

---

## 🛠️ Các lệnh hữu ích

```powershell
# Chạy development mode (hot-reload)
npm run start:dev

# Chạy Prisma Studio (Database GUI)
npm run prisma:studio
# Truy cập: http://localhost:5555

# Format code
npm run format

# Build production
npm run build

# Chạy production
npm run start:prod
```

---

## ❓ Troubleshooting Nhanh

### ❌ Lỗi: "Cannot connect to database"

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra `DATABASE_URL` trong `.env`
3. Thử kết nối bằng psql:
```powershell
psql -U postgres -d tutor_support_db
```

### ❌ Lỗi: "Module not found"

**Giải pháp:**
```powershell
rm -rf node_modules
npm install
```

### ❌ Lỗi: "Prisma Client not found"

**Giải pháp:**
```powershell
npm run prisma:generate
```

### ❌ Lỗi: "Port 3000 already in use"

**Giải pháp:**
Đổi port trong `.env`:
```env
PORT=3001
```

---

## 📚 Đọc tiếp

- 📖 **README.md** - Tổng quan dự án
- 🔧 **INSTALLATION.md** - Hướng dẫn cài đặt chi tiết
- 🏗️ **ARCHITECTURE.md** - Kiến trúc hệ thống
- 🛠️ **DEVELOPMENT_GUIDE.md** - Hướng dẫn phát triển
- 📋 **TODO.md** - Danh sách công việc

---

## 🎉 Hoàn tất!

Bây giờ bạn có thể:
- ✅ Gọi API qua Swagger UI
- ✅ Xem database qua Prisma Studio
- ✅ Bắt đầu phát triển các Use Cases tiếp theo

**Happy Coding! 🚀**
