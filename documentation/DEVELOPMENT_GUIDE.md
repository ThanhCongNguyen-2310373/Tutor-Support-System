# 🛠️ Hướng Dẫn Phát Triển Tiếp - Development Guide

## 📝 Giới thiệu

File này hướng dẫn cách triển khai các Use Cases còn lại sau khi đã có scaffold cơ bản. Mỗi Use Case sẽ được triển khai theo pattern chuẩn của NestJS.

---

## 🎯 Quy trình Phát triển 1 Use Case

### Pattern chuẩn:

```
1. Tạo DTO (Data Transfer Object)
   └─ Định nghĩa input/output cho API

2. Cập nhật Service
   └─ Viết business logic

3. Cập nhật Controller
   └─ Tạo endpoint API

4. (Optional) Tạo Guard/Decorator
   └─ Phân quyền nếu cần

5. Test API qua Swagger
   └─ Kiểm tra hoạt động
```

---

## 📚 Ví dụ: Triển khai UC_STU_01 - Đặt lịch hẹn

### Bước 1: Tạo DTOs

**File:** `src/meetings/dto/create-booking.dto.ts`

```typescript
import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID của Tutor' })
  @IsInt()
  tutorId: number;

  @ApiProperty({ example: 1, description: 'ID của Availability Slot' })
  @IsInt()
  slotId: number;

  @ApiProperty({ example: 'Học phần Calculus 1', required: false })
  @IsOptional()
  @IsString()
  topic?: string;
}
```

**File:** `src/meetings/dto/booking-response.dto.ts`

```typescript
import { MeetingStatus } from '@prisma/client';

export class BookingResponseDto {
  id: number;
  startTime: Date;
  endTime: Date;
  status: MeetingStatus;
  topic: string | null;
  student: {
    id: number;
    fullName: string;
    email: string;
  };
  tutor: {
    id: number;
    expertise: string[];
  };
}
```

---

### Bước 2: Cập nhật Service

**File:** `src/meetings/meetings.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(
    studentId: number,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    // 1. Kiểm tra Slot có tồn tại và chưa bị book
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: dto.slotId },
    });

    if (!slot) {
      throw new NotFoundException('Slot không tồn tại');
    }

    if (slot.isBooked) {
      throw new BadRequestException('Slot đã được đặt');
    }

    if (slot.tutorId !== dto.tutorId) {
      throw new BadRequestException('Slot không thuộc về Tutor này');
    }

    // 2. Tạo Meeting
    const meeting = await this.prisma.meeting.create({
      data: {
        studentId: studentId,
        tutorId: dto.tutorId,
        slotId: dto.slotId,
        topic: dto.topic,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        tutor: {
          select: {
            id: true,
            expertise: true,
          },
        },
      },
    });

    // 3. Đánh dấu Slot đã được book
    await this.prisma.availabilitySlot.update({
      where: { id: dto.slotId },
      data: { isBooked: true },
    });

    // 4. (Optional) Gửi thông báo cho Tutor
    // await this.notificationService.sendToTutor(...)

    return meeting;
  }

  async getMyMeetings(studentId: number) {
    return this.prisma.meeting.findMany({
      where: { studentId },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }
}
```

---

### Bước 3: Cập nhật Controller

**File:** `src/meetings/meetings.controller.ts`

```typescript
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('3. Meetings')
@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Post('book')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Student đặt lịch hẹn với Tutor' })
  createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    return this.meetingsService.createBooking(req.user.id, dto);
  }

  @Get('my-meetings')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Xem danh sách lịch hẹn của tôi' })
  getMyMeetings(@Request() req) {
    return this.meetingsService.getMyMeetings(req.user.id);
  }
}
```

---

### Bước 4: Cập nhật Module

**File:** `src/meetings/meetings.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService], // Export nếu module khác cần dùng
})
export class MeetingsModule {}
```

---

### Bước 5: Test API

#### 5.1. Đăng nhập để lấy token

```bash
POST http://localhost:3000/auth/login
{
  "email": "student@hcmut.edu.vn"
}
```

#### 5.2. Đặt lịch

```bash
POST http://localhost:3000/meetings/book
Authorization: Bearer YOUR_TOKEN
{
  "tutorId": 1,
  "slotId": 1,
  "topic": "Học Calculus 1"
}
```

#### 5.3. Xem lịch của tôi

```bash
GET http://localhost:3000/meetings/my-meetings
Authorization: Bearer YOUR_TOKEN
```

---

## 📋 Checklist Use Cases Cần Triển Khai

### Module: Tutors (UC_TUT_*)

- [ ] **UC_TUT_01:** Quản lý lịch rảnh
  - [ ] POST /tutors/availability - Thêm lịch rảnh
  - [ ] DELETE /tutors/availability/:id - Xóa lịch rảnh
  - [ ] GET /tutors/availability - Xem lịch rảnh của tôi

- [ ] **UC_TUT_02:** Quản lý buổi tư vấn
  - [ ] GET /tutors/booking-requests - Xem yêu cầu đặt lịch
  - [ ] PATCH /tutors/bookings/:id/confirm - Chấp nhận
  - [ ] PATCH /tutors/bookings/:id/reject - Từ chối

- [ ] **UC_TUT_03:** Theo dõi tiến độ sinh viên
  - [ ] POST /tutors/progress - Thêm ghi nhận tiến độ
  - [ ] GET /tutors/students/:id/progress - Xem tiến độ 1 SV

---

### Module: Meetings (UC_STU_01, 05)

- [ ] **UC_STU_01:** Đặt lịch hẹn
  - [ ] POST /meetings/book - Đặt lịch
  - [ ] GET /meetings/my-meetings - Xem lịch của tôi
  - [ ] PATCH /meetings/:id/cancel - Hủy lịch

- [ ] **UC_STU_05:** Đánh giá
  - [ ] POST /meetings/:id/rating - Đánh giá buổi học
  - [ ] GET /meetings/:id/rating - Xem đánh giá

---

### Module: Management (UC_COO_*, UC_ADMIN_*)

- [ ] **UC_COO_01:** Duyệt ghép cặp
  - [ ] GET /management/pairing-queue - Xem hàng đợi
  - [ ] POST /management/manual-pair - Ghép cặp thủ công

- [ ] **UC_COO_02:** Xử lý khiếu nại
  - [ ] GET /management/complaints - Danh sách khiếu nại
  - [ ] PATCH /management/complaints/:id/resolve - Giải quyết

- [ ] **UC_ADMIN_01:** Quản lý tài khoản
  - [ ] GET /management/users - Danh sách users
  - [ ] PATCH /management/users/:id - Cập nhật user
  - [ ] POST /management/users/:id/reset-password

- [ ] **UC_ADMIN_02:** Phê duyệt tutor
  - [ ] GET /management/tutor-applications - Danh sách ứng viên
  - [ ] PATCH /management/tutor-applications/:id/approve

---

### Module: Academic (UC_TBM_*, UC_OAA_*, UC_OSA_*)

- [ ] **UC_TBM_01:** Lộ trình học
  - [ ] POST /academic/roadmaps - Tạo lộ trình
  - [ ] GET /academic/roadmaps - Danh sách lộ trình

- [ ] **UC_TBM_02:** Yêu cầu tạo tutor
  - [ ] POST /academic/tutor-requests - Gửi yêu cầu

- [ ] **UC_OAA_01:** Báo cáo phân bổ
  - [ ] GET /academic/resource-reports - Tạo báo cáo

- [ ] **UC_OAA_02:** Theo dõi hiệu suất
  - [ ] GET /academic/performance-dashboard

- [ ] **UC_OSA_01:** Điểm rèn luyện
  - [ ] GET /academic/training-credits - Tính điểm RL

- [ ] **UC_OSA_02:** Học bổng
  - [ ] GET /academic/scholarship-candidates

---

### Module: Notifications (UC_SYS_01)

- [ ] **UC_SYS_01:** Gửi thông báo
  - [ ] GET /notifications - Lấy thông báo của tôi
  - [ ] PATCH /notifications/:id/read - Đánh dấu đã đọc

---

## 🎨 Best Practices

### 1. Error Handling

```typescript
// Sử dụng built-in exceptions
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Token expired');
throw new ForbiddenException('Access denied');
```

### 2. Validation

```typescript
// Sử dụng class-validator trong DTOs
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  fullName: string;
}
```

### 3. Transactions

```typescript
// Sử dụng Prisma transactions khi cần atomic operations
await this.prisma.$transaction([
  this.prisma.meeting.create({ ... }),
  this.prisma.availabilitySlot.update({ ... }),
  this.prisma.notification.create({ ... }),
]);
```

### 4. Pagination

```typescript
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    this.prisma.user.findMany({
      skip,
      take: limit,
    }),
    this.prisma.user.count(),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### 5. Logging

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething() {
    this.logger.log('Starting operation...');
    this.logger.error('Error occurred', error.stack);
    this.logger.warn('Warning message');
  }
}
```

---

## 🧪 Testing

### Unit Test Example

**File:** `src/meetings/meetings.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsService } from './meetings.service';
import { PrismaService } from '../core/prisma.service';

describe('MeetingsService', () => {
  let service: MeetingsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        {
          provide: PrismaService,
          useValue: {
            meeting: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a booking', async () => {
    // Test logic
  });
});
```

---

## 📊 Database Tips

### 1. Seeding Data

**File:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Tạo Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hcmut.edu.vn',
      fullName: 'System Admin',
      mssv: 'ADMIN001',
      role: 'ADMIN',
    },
  });

  // Tạo Tutor
  const tutor = await prisma.user.create({
    data: {
      email: 'tutor@hcmut.edu.vn',
      fullName: 'Tutor Nguyen',
      mssv: 'TUTOR001',
      role: 'TUTOR',
      tutorProfile: {
        create: {
          expertise: ['Calculus', 'Linear Algebra'],
          bio: 'Experienced tutor',
        },
      },
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Chạy seed:**
```bash
npx prisma db seed
```

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production` trong `.env`
- [ ] Thay đổi `JWT_SECRET` thành key mạnh
- [ ] Cấu hình CORS cho production domain
- [ ] Enable HTTPS
- [ ] Setup database backup
- [ ] Configure logging (Winston/Pino)
- [ ] Setup monitoring (Sentry, New Relic)
- [ ] Rate limiting (Throttler Module)
- [ ] Helmet.js cho security headers

---

## 📚 Tài nguyên hữu ích

- **NestJS Docs:** https://docs.nestjs.com/
- **Prisma Docs:** https://www.prisma.io/docs/
- **JWT Best Practices:** https://jwt.io/introduction
- **REST API Design:** https://restfulapi.net/

---

## 💡 Tips

1. **Luôn sử dụng DTOs** cho input validation
2. **Tách biệt business logic** vào Service, không để trong Controller
3. **Sử dụng Transactions** cho operations phức tạp
4. **Log đầy đủ** để dễ debug
5. **Viết tests** cho các logic quan trọng
6. **Document APIs** bằng Swagger decorators
7. **Commit thường xuyên** với message rõ ràng

---

