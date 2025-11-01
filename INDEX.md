# 📑 Danh Mục File - Tutor Support System

Tài liệu này liệt kê và giải thích tất cả các file trong dự án.

---

## 📚 Documentation Files (Đọc theo thứ tự)

| # | File | Mục đích | Khi nào đọc |
|---|------|----------|-------------|
| 1 | **README.md** | Tổng quan dự án, tech stack, cài đặt cơ bản | **ĐỌC ĐẦU TIÊN** |
| 2 | **QUICKSTART.md** | Hướng dẫn chạy nhanh | Muốn test ngay |
| 3 | **INSTALLATION.md** | Hướng dẫn cài đặt chi tiết từng bước | Gặp lỗi khi setup |
| 4 | **ARCHITECTURE.md** | Kiến trúc, design patterns, luồng xử lý | Hiểu cách dự án hoạt động |
| 5 | **DEVELOPMENT_GUIDE.md** | Hướng dẫn viết code, triển khai Use Cases | Bắt đầu code |
| 6 | **TODO.md** | Danh sách công việc cần làm | Phân công task |
| 7 | **PROJECT_SUMMARY.md** | Tóm tắt toàn bộ dự án | Overview nhanh |
| 8 | **INDEX.md** | File này - Liệt kê tất cả files | Tìm file cụ thể |

---

## 🏗️ Configuration Files

| File | Mô tả | Tự động tạo? |
|------|-------|--------------|
| **package.json** | Dependencies, scripts, project metadata | ❌ Manual |
| **tsconfig.json** | TypeScript compiler config | ❌ Manual |
| **tsconfig.build.json** | TypeScript build config | ❌ Manual |
| **nest-cli.json** | NestJS CLI configuration | ❌ Manual |
| **.prettierrc** | Code formatter config | ❌ Manual |
| **.env.example** | Environment variables template | ❌ Manual |
| **.env** | Environment variables (KHÔNG commit) | ✅ Copy từ .example |
| **.gitignore** | Files to ignore in Git | ❌ Manual |

---

## 🗄️ Database Files

| Thư mục/File | Mô tả | Tự động tạo? |
|--------------|-------|--------------|
| **prisma/** | Prisma ORM files | - |
| **prisma/schema.prisma** | Database schema definition (10 models, 7 roles) | ❌ Manual |
| **prisma/migrations/** | Database migrations | ✅ `prisma migrate` |
| **node_modules/.prisma/client/** | Generated Prisma Client | ✅ `prisma generate` |

---

## 💻 Source Code Files

### Core Module (Hạ tầng)
```
src/core/
├── prisma.service.ts        # PrismaClient wrapper
└── core.module.ts           # @Global() module export PrismaService
```

### Auth Module (Xác thực)
```
src/auth/
├── auth.module.ts           # Module definition
├── auth.controller.ts       # POST /auth/login
├── auth.service.ts          # Login logic (find-or-create user)
├── jwt.strategy.ts          # Passport JWT Strategy
├── roles.guard.ts           # Role-based access control
├── roles.decorator.ts       # @Roles() decorator
└── dto/
    └── login.dto.ts         # Login DTO với validation
```

### Users Module (Người dùng)
```
src/users/
├── users.module.ts          # Module definition
├── users.controller.ts      # GET /users/me
└── users.service.ts         # User profile logic
```

### Business Modules (Empty Scaffolds)
```
src/tutors/tutors.module.ts                  # UC_TUT_01-03
src/my-schedule/my-schedule.module.ts        # UC_STU_01-05
src/meetings/meetings.module.ts              # Meeting management
src/management/management.module.ts          # UC_COO_*, UC_ADMIN_*
src/academic/academic.module.ts              # UC_TBM_*, UC_OAA_*, UC_OSA_*
src/notifications/notifications.module.ts    # UC_SYS_01
```

### Root Files
```
src/
├── app.module.ts            # Root module, import tất cả modules
└── main.ts                  # Bootstrap app (port 3000, Swagger /api-docs)
```

---

## 🔧 VS Code Config

```
.vscode/
├── settings.json            # Editor settings (format on save, etc.)
└── extensions.json          # Recommended extensions
```

**Recommended Extensions:**
- Prettier - Code formatter
- ESLint - Linter
- Prisma - Syntax highlighting cho schema.prisma
- GitHub Copilot (Optional)
- Jest Runner (Optional)

---

## 📦 Generated/Ignored Files (Không commit)

| File/Folder | Mô tả | Size |
|-------------|-------|------|
| **node_modules/** | Dependencies (300+ packages) | ~200-500 MB |
| **dist/** | Compiled JavaScript output | ~10-50 MB |
| **.env** | Environment variables (secrets) | < 1 KB |
| **prisma/migrations/** | Migration history | ~10-100 KB |
| **coverage/** | Test coverage reports | ~1-10 MB |

---

## 📋 File Count Summary

| Category | Count |
|----------|-------|
| Documentation | 8 files |
| Config files | 8 files |
| Source code (TypeScript) | 18 files |
| Database schema | 1 file |
| VS Code config | 2 files |
| **Total committed files** | **~37 files** |

---

## 🗂️ Complete Tree Structure

```
Tutor Support System/
│
├── 📚 Documentation (8 files)
│   ├── README.md                    # 📖 Hướng dẫn tổng quan
│   ├── QUICKSTART.md                # ⚡ Chạy nhanh 5 phút
│   ├── INSTALLATION.md              # 🔧 Cài đặt chi tiết
│   ├── ARCHITECTURE.md              # 🏗️ Kiến trúc hệ thống
│   ├── DEVELOPMENT_GUIDE.md         # 🛠️ Hướng dẫn phát triển
│   ├── TODO.md                      # 📋 Danh sách công việc
│   ├── PROJECT_SUMMARY.md           # 📊 Tóm tắt dự án
│   └── INDEX.md                     # 📑 File này
│
├── ⚙️ Configuration (8 files)
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── tsconfig.build.json          # Build config
│   ├── nest-cli.json                # NestJS CLI
│   ├── .prettierrc                  # Code formatter
│   ├── .env.example                 # Env template
│   ├── .gitignore                   # Git ignore rules
│   └── .env                         # 🔒 (Not committed)
│
├── 🗄️ Database (1 file + migrations)
│   └── prisma/
│       ├── schema.prisma            # Schema definition
│       └── migrations/              # ✅ Auto-generated
│
├── 💻 Source Code (18 files)
│   └── src/
│       ├── core/                    # ✅ Infrastructure (2 files)
│       │   ├── prisma.service.ts
│       │   └── core.module.ts
│       │
│       ├── auth/                    # ✅ Authentication (7 files)
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── jwt.strategy.ts
│       │   ├── roles.guard.ts
│       │   ├── roles.decorator.ts
│       │   └── dto/
│       │       └── login.dto.ts
│       │
│       ├── users/                   # ✅ Users (3 files)
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   └── users.service.ts
│       │
│       ├── tutors/                  # 🔄 Empty (1 file)
│       │   └── tutors.module.ts
│       │
│       ├── my-schedule/             # 🔄 Empty (1 file)
│       │   └── my-schedule.module.ts
│       │
│       ├── meetings/                # 🔄 Empty (1 file)
│       │   └── meetings.module.ts
│       │
│       ├── management/              # 🔄 Empty (1 file)
│       │   └── management.module.ts
│       │
│       ├── academic/                # 🔄 Empty (1 file)
│       │   └── academic.module.ts
│       │
│       ├── notifications/           # 🔄 Empty (1 file)
│       │   └── notifications.module.ts
│       │
│       ├── app.module.ts            # Root module
│       └── main.ts                  # Bootstrap
│
├── 🔧 VS Code (2 files)
│   └── .vscode/
│       ├── settings.json            # Editor config
│       └── extensions.json          # Recommended extensions
│
└── 📦 Generated (Not committed)
    ├── node_modules/                # ~300 packages (~500 MB)
    ├── dist/                        # Compiled JS
    ├── coverage/                    # Test coverage
    └── .env                         # Environment secrets
```

---

## 🔍 Tìm file theo mục đích

### Muốn hiểu dự án?
→ Đọc `README.md` → `PROJECT_SUMMARY.md`

### Muốn chạy ngay?
→ Đọc `QUICKSTART.md`

### Gặp lỗi cài đặt?
→ Đọc `INSTALLATION.md`

### Muốn hiểu kiến trúc?
→ Đọc `ARCHITECTURE.md`

### Muốn bắt đầu code?
→ Đọc `DEVELOPMENT_GUIDE.md`

### Muốn biết việc cần làm?
→ Đọc `TODO.md`

### Muốn sửa database schema?
→ Sửa `prisma/schema.prisma` → chạy `npm run prisma:migrate`

### Muốn thêm endpoint mới?
→ Sửa `src/<module>/<module>.controller.ts` và `service.ts`

### Muốn thêm validation?
→ Tạo DTO trong `src/<module>/dto/`

### Muốn thêm role mới?
→ Sửa `enum Role` trong `prisma/schema.prisma`

### Muốn config môi trường?
→ Sửa `.env`

### Muốn thay đổi port?
→ Sửa `PORT` trong `.env`

---


## 🎯 Workflow chung

```
1. Clone repo
   ↓
2. npm install (tải node_modules)
   ↓
3. Tạo .env (copy từ .env.example)
   ↓
4. npm run prisma:generate (tạo Prisma Client)
   ↓
5. npm run prisma:migrate (tạo database tables)
   ↓
6. npm run start:dev (chạy server)
   ↓
7. Mở http://localhost:3000/api-docs (Swagger)
   ↓
8. Test API /auth/login
   ↓
9. Bắt đầu code modules mới
```

---

## 💡 Tips

### Khi thêm file mới:
- **Service:** Logic nghiệp vụ
- **Controller:** HTTP endpoints
- **DTO:** Validation cho input/output
- **Module:** Đăng ký providers & controllers
- **Don't forget:** Import module vào `app.module.ts`

### Khi sửa database:
```bash
# 1. Sửa prisma/schema.prisma
# 2. Chạy migration
npm run prisma:migrate
# 3. Prisma Client tự động update
```

### Khi gặp lỗi TypeScript:
```bash
# Xóa cache và rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

