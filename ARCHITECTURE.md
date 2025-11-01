# 🏗️ Kiến Trúc Dự Án - Tutor Support System

## 📐 Tổng quan Kiến trúc

Dự án sử dụng kiến trúc **Layered Architecture (Kiến trúc phân lớp)** của NestJS, tuân theo các nguyên tắc:

1. **Separation of Concerns** - Tách biệt trách nhiệm
2. **Dependency Injection** - Tiêm phụ thuộc
3. **Modularity** - Tính mô-đun hóa
4. **SOLID Principles** - Nguyên tắc thiết kế hướng đối tượng

---

## 🎯 Các lớp trong Kiến trúc

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer (API)              │
│          Controllers + DTOs + Guards            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│          Business Logic Layer                   │
│             Services (Use Cases)                │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│          Data Access Layer                      │
│        Prisma ORM + Database Models             │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│             Database (PostgreSQL)               │
└─────────────────────────────────────────────────┘
```

---

## 📦 Cấu trúc Module (Domain-Driven Design Light)

### 1. Core Module (Miền Hạ tầng)
**Vai trò:** Cung cấp các service cơ sở cho toàn bộ ứng dụng.

```
src/core/
├── prisma.service.ts      # Kết nối Database
└── core.module.ts         # @Global() Module
```

**Đặc điểm:**
- `@Global()` decorator → Tự động available cho tất cả module
- Không chứa business logic
- Chỉ chứa infrastructure services

---

### 2. Auth Module (Miền Xác thực)
**Vai trò:** Xử lý xác thực, phân quyền, và JWT.

```
src/auth/
├── auth.module.ts          # Module definition
├── auth.controller.ts      # POST /auth/login
├── auth.service.ts         # Business logic: login, find-or-create user
├── jwt.strategy.ts         # Passport JWT Strategy
├── roles.guard.ts          # Role-based access control
├── roles.decorator.ts      # @Roles() decorator
└── dto/
    └── login.dto.ts        # Data Transfer Object
```

**Use Cases:**
- UC_GENERAL_01: Đăng nhập vào hệ thống

**Flow:**
```
Client Request
    ↓
AuthController.login()
    ↓
AuthService.login()
    ↓
PrismaService.user.findUnique() hoặc create()
    ↓
JwtService.sign(payload)
    ↓
Return { access_token, user }
```

---

### 3. Users Module (Miền Người dùng)
**Vai trò:** Quản lý thông tin người dùng.

```
src/users/
├── users.module.ts
├── users.controller.ts     # GET /users/me (protected)
└── users.service.ts        # Business logic: getProfile()
```

**Use Cases:**
- UC_GENERAL_02: Quản lý hồ sơ cá nhân

**Flow:**
```
Client Request + JWT Token
    ↓
@UseGuards(AuthGuard('jwt'))
    ↓
JwtStrategy.validate() → req.user = { id, email, role }
    ↓
UsersController.getMyProfile(req)
    ↓
UsersService.getProfile(req.user.id)
    ↓
PrismaService.user.findUnique({ include: { tutorProfile: true } })
    ↓
Return user data
```

---

### 4. Business Modules (Miền Nghiệp vụ) - **Empty Scaffolds**

Các module này đã được khởi tạo rỗng, sẵn sàng để triển khai các Use Cases tương ứng:

#### 4.1. TutorsModule
**Đường dẫn:** `src/tutors/`  
**Use Cases:** UC_TUT_01, UC_TUT_02, UC_TUT_03

#### 4.2. MyScheduleModule
**Đường dẫn:** `src/my-schedule/`  
**Use Cases:** UC_STU_01, UC_STU_05

#### 4.3. MeetingsModule
**Đường dẫn:** `src/meetings/`  
**Use Cases:** UC_STU_01, UC_TUT_02

#### 4.4. ManagementModule
**Đường dẫn:** `src/management/`  
**Use Cases:** UC_COO_01, UC_COO_02, UC_ADMIN_01, UC_ADMIN_02, UC_ADMIN_03

#### 4.5. AcademicModule
**Đường dẫn:** `src/academic/`  
**Use Cases:** UC_TBM_01, UC_TBM_02, UC_OAA_01, UC_OAA_02, UC_OSA_01, UC_OSA_02

#### 4.6. NotificationsModule
**Đường dẉn:** `src/notifications/`  
**Use Cases:** UC_SYS_01

---

## 🗄️ Database Schema (Prisma)

### Entity Relationship Diagram (Simplified)

```
User (1) ─────── (0..1) TutorProfile
  │                          │
  │                          │
  │ (1)                      │ (1)
  │                          │
  ▼ (*)                      ▼ (*)
Meeting ◄────── (1) AvailabilitySlot
  │
  │ (1)
  │
  ▼ (0..1)
Rating

User (1) ────── (*) Complaint
User (1) ────── (*) ProgressRecord ◄────── (1) TutorProfile
User (1) ────── (*) LearningRoadmap
User (1) ────── (*) TutorApplication
User (1) ────── (*) Notification
```

### Các Models chính:

| Model | Mô tả | Thuộc miền |
|-------|-------|------------|
| `User` | Người dùng cơ sở (7 roles) | Core |
| `TutorProfile` | Hồ sơ mở rộng của Tutor | Core |
| `AvailabilitySlot` | Lịch rảnh của Tutor | Schedule |
| `Meeting` | Buổi hẹn | Schedule |
| `Rating` | Đánh giá của Student | Feedback |
| `ProgressRecord` | Ghi nhận tiến độ | Academic |
| `Complaint` | Khiếu nại | Management |
| `LearningRoadmap` | Lộ trình học | Academic |
| `TutorApplication` | Yêu cầu duyệt Tutor | Management |
| `Notification` | Thông báo | System |

---

## 🔐 Security & Authorization

### JWT Flow

```
1. Login
   ├─ POST /auth/login { email }
   └─ Return { access_token }

2. Access Protected Route
   ├─ GET /users/me
   ├─ Header: Authorization: Bearer <token>
   ├─ JwtStrategy validates token
   ├─ Decode payload: { sub, email, role }
   ├─ Find user in database
   └─ Attach user to request object
```

### Role-Based Access Control (RBAC)

```typescript
// Sử dụng RolesGuard + @Roles() decorator

@Get('admin-only')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.COORDINATOR)
getAdminData() {
  // Chỉ ADMIN và COORDINATOR mới vào được
}
```

**Ma trận phân quyền:**

| Endpoint | STUDENT | TUTOR | COORDINATOR | TBM | OAA | OSA | ADMIN |
|----------|---------|-------|-------------|-----|-----|-----|-------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /users/me | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /meetings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| POST /tutors/availability | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| POST /management/complaints | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| POST /academic/roadmaps | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| GET /academic/reports | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /academic/scholarships | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 🔄 Request Lifecycle

### Luồng xử lý 1 request:

```
1. Client gửi HTTP Request
   ↓
2. Middleware (CORS, Body Parser)
   ↓
3. Guards (AuthGuard, RolesGuard)
   ↓
4. Interceptors (Logging, Transform)
   ↓
5. Pipes (ValidationPipe - class-validator)
   ↓
6. Controller Method
   ↓
7. Service Method (Business Logic)
   ↓
8. Repository/Prisma (Database)
   ↓
9. Response
   ↓
10. Interceptors (Transform Response)
   ↓
11. Client nhận Response
```

---

## 📋 Design Patterns Được Sử Dụng

### 1. Dependency Injection (DI)
```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,  // Injected
    private jwtService: JwtService,  // Injected
  ) {}
}
```

### 2. Repository Pattern (via Prisma)
```typescript
// Prisma abstraction
this.prisma.user.findUnique({ where: { id } });
```

### 3. Strategy Pattern (Passport JWT)
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Strategy implementation
}
```

### 4. Guard Pattern (Authorization)
```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)
```

### 5. Decorator Pattern
```typescript
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiTags('Admin')
```

---

## 🚀 Scalability Considerations

### Horizontal Scaling
- ✅ Stateless API (JWT không lưu session)
- ✅ Database connection pooling (Prisma)
- ✅ Có thể deploy multiple instances

### Vertical Scaling
- ✅ NestJS hỗ trợ clustering
- ✅ Async/await everywhere
- ✅ Non-blocking I/O

### Future Improvements
- 🔄 Implement caching (Redis)
- 🔄 Message Queue (Bull/RabbitMQ)
- 🔄 Microservices architecture
- 🔄 WebSocket for real-time notifications

---

## 📊 Monitoring & Logging

### Recommended Tools
- **Logger:** Winston hoặc Pino
- **APM:** New Relic hoặc Datadog
- **Error Tracking:** Sentry
- **Database Monitoring:** Prisma Pulse

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example: auth.service.spec.ts
describe('AuthService', () => {
  it('should create user if not exists', async () => {
    // Test logic
  });
});
```

### Integration Tests
```typescript
// Example: auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@hcmut.edu.vn' })
      .expect(201);
  });
});
```

---

## 📚 Tài liệu tham khảo

- **NestJS:** https://docs.nestjs.com/
- **Prisma:** https://www.prisma.io/docs/
- **Passport JWT:** https://www.passportjs.org/packages/passport-jwt/
- **Class Validator:** https://github.com/typestack/class-validator

---

**📌 Ghi chú:** Kiến trúc này được thiết kế để dễ mở rộng và bảo trì. Mỗi module độc lập và có thể phát triển song song bởi các thành viên khác nhau trong team.
