# 🧪 TESTING GUIDE - Use Cases Completion

## 📋 Module Overview

Sau khi hoàn thiện, hệ thống có **3 modules mới/cải tiến**:

1. ✅ **Notifications API** 
2. ✅ **Academic/LearningRoadmap** (mới tạo)
3. ✅ **My-Schedule Filters** (cải tiến)

---

## 🔐 Prerequisites

### 1. Start Server
```bash
cd d:\HK251\CNPM\BTL\Sub3\TutorSupportSystem
npm run start:dev
```

### 2. Setup Test Accounts

Tạo 3 tài khoản test (nếu chưa có):

```bash
# Admin (để tạo Coordinator)
POST http://localhost:3000/auth/register
{
  "email": "admin@hcmut.edu.vn",
  "password": "admin123",
  "fullName": "Admin HCMUT",
  "role": "ADMIN"
}

# Coordinator (TBM)
POST http://localhost:3000/auth/register
{
  "email": "tbm@hcmut.edu.vn",
  "password": "tbm123",
  "fullName": "Trưởng Bộ Môn Toán",
  "role": "COORDINATOR"
}

# Student
POST http://localhost:3000/auth/register
{
  "email": "student1@hcmut.edu.vn",
  "password": "student123",
  "fullName": "Nguyễn Văn A",
  "mssv": "2310001"
}

# Tutor (cần approve trước)
# Step 1: Register as Student
POST http://localhost:3000/auth/register
{
  "email": "tutor1@hcmut.edu.vn",
  "password": "tutor123",
  "fullName": "Trần Thị B"
}

# Step 2: Admin approve (chi tiết xem Phase 2 docs)
```

---

## 🧪 TEST SCENARIOS

### **Scenario 1: Notifications API** ✅

**Mục tiêu:** Verify notifications được tạo và hiển thị đúng

#### Step 1.1: Login as Student
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "student1@hcmut.edu.vn",
  "password": "student123"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "email": "student1@hcmut.edu.vn",
    "role": "STUDENT"
  }
}
```

**Action:** Copy `access_token` → Set environment variable `STUDENT_TOKEN`

---

#### Step 1.2: Get Notifications
```http
GET http://localhost:3000/notifications?limit=10
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Meeting đã được confirm",
    "message": "Tutor Trần Thị B đã xác nhận meeting vào 20/11/2024 10:00",
    "isRead": false,
    "createdAt": "2024-11-19T08:30:00Z",
    "recipientId": 3
  }
]
```

**Verify:**
- ✅ Status: 200 OK
- ✅ Có ít nhất 1 notification
- ✅ `isRead` = false cho notification mới

---

#### Step 1.3: Mark as Read
```http
POST http://localhost:3000/notifications/1/read
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
{
  "id": 1,
  "isRead": true,
  "message": "Notification marked as read"
}
```

---

#### Step 1.4: Get Unread Count
```http
GET http://localhost:3000/notifications/unread-count
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
{
  "unreadCount": 0
}
```

**Verify:**
- ✅ Count giảm sau khi mark as read

---

### **Scenario 2: LearningRoadmap (TBM)** ✅

**Mục tiêu:** TBM tạo lộ trình học và Tutor/Student xem được

#### Step 2.1: Login as Coordinator (TBM)
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "tbm@hcmut.edu.vn",
  "password": "tbm123"
}
```

**Action:** Copy `access_token` → Set `TBM_TOKEN`

---

#### Step 2.2: TBM Create Roadmap
```http
POST http://localhost:3000/academic/roadmaps
Authorization: Bearer {{TBM_TOKEN}}
Content-Type: application/json

{
  "title": "Lộ trình học Giải Tích 1",
  "description": "Chương 1: Giới hạn và liên tục\nChương 2: Đạo hàm và vi phân\nChương 3: Tích phân xác định\nChương 4: Tích phân bất định\nChương 5: Chuỗi số và chuỗi hàm\nChương 6: Phương trình vi phân",
  "documentUrl": "https://library.hcmut.edu.vn/documents/calculus-1-syllabus.pdf"
}
```

**Expected Response:**
```json
{
  "message": "Tạo lộ trình học thành công",
  "data": {
    "id": 1,
    "title": "Lộ trình học Giải Tích 1",
    "description": "Chương 1: Giới hạn...",
    "documentUrl": "https://library.hcmut.edu.vn/...",
    "author": {
      "id": 2,
      "fullName": "Trưởng Bộ Môn Toán",
      "email": "tbm@hcmut.edu.vn",
      "role": "COORDINATOR"
    }
  }
}
```

**Verify:**
- ✅ Status: 201 Created
- ✅ `author.role` = "COORDINATOR"
- ✅ `id` được tạo tự động

---

#### Step 2.3: Create More Roadmaps
```http
# Roadmap 2
POST http://localhost:3000/academic/roadmaps
Authorization: Bearer {{TBM_TOKEN}}
Content-Type: application/json

{
  "title": "Lộ trình học Đại Số Tuyến Tính",
  "description": "Chương 1: Ma trận và định thức\nChương 2: Hệ phương trình tuyến tính\nChương 3: Không gian vector\nChương 4: Ánh xạ tuyến tính\nChương 5: Trị riêng và vector riêng",
  "documentUrl": "https://library.hcmut.edu.vn/documents/linear-algebra.pdf"
}

# Roadmap 3
POST http://localhost:3000/academic/roadmaps
Authorization: Bearer {{TBM_TOKEN}}
Content-Type: application/json

{
  "title": "Lộ trình học Cấu Trúc Dữ Liệu",
  "description": "Chương 1: Mảng và danh sách liên kết\nChương 2: Stack và Queue\nChương 3: Tree và Binary Search Tree\nChương 4: Graph và thuật toán\nChương 5: Heap và Priority Queue\nChương 6: Hash Table",
  "documentUrl": "https://library.hcmut.edu.vn/documents/data-structures.pdf"
}
```

---

#### Step 2.4: Student View Roadmaps
```http
GET http://localhost:3000/academic/roadmaps
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
{
  "message": "Lấy danh sách lộ trình thành công",
  "total": 3,
  "data": [
    {
      "id": 3,
      "title": "Lộ trình học Cấu Trúc Dữ Liệu",
      "description": "Chương 1: Mảng và danh sách liên kết...",
      "documentUrl": "https://library.hcmut.edu.vn/documents/data-structures.pdf",
      "author": { ... }
    },
    { ... }
  ]
}
```

**Verify:**
- ✅ Status: 200 OK
- ✅ Student có thể xem tất cả roadmaps
- ✅ Sorted by `id` DESC (newest first)

---

#### Step 2.5: Get Roadmap Detail
```http
GET http://localhost:3000/academic/roadmaps/1
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
{
  "message": "Lấy chi tiết lộ trình thành công",
  "data": {
    "id": 1,
    "title": "Lộ trình học Giải Tích 1",
    "description": "Chương 1: Giới hạn...",
    "documentUrl": "https://library.hcmut.edu.vn/...",
    "author": {
      "id": 2,
      "fullName": "Trưởng Bộ Môn Toán",
      "role": "COORDINATOR"
    }
  }
}
```

---

#### Step 2.6: TBM Update Roadmap
```http
PATCH http://localhost:3000/academic/roadmaps/1
Authorization: Bearer {{TBM_TOKEN}}
Content-Type: application/json

{
  "title": "Lộ trình học Giải Tích 1 (Cập nhật 2024)",
  "description": "Chương 1: Giới hạn và liên tục (3 tuần)\nChương 2: Đạo hàm và vi phân (4 tuần)\nChương 3: Tích phân (5 tuần)\nTổng: 12 tuần",
  "documentUrl": "https://library.hcmut.edu.vn/documents/calculus-1-2024.pdf"
}
```

**Expected Response:**
```json
{
  "message": "Cập nhật lộ trình thành công",
  "data": {
    "id": 1,
    "title": "Lộ trình học Giải Tích 1 (Cập nhật 2024)",
    ...
  }
}
```

---

#### Step 2.7: Non-Author Cannot Update (403)
```http
# Login as different Coordinator
POST http://localhost:3000/auth/login
{
  "email": "tbm2@hcmut.edu.vn",
  "password": "tbm123"
}

# Try to update roadmap created by another TBM
PATCH http://localhost:3000/academic/roadmaps/1
Authorization: Bearer {{TBM2_TOKEN}}
Content-Type: application/json

{
  "title": "Hacked"
}
```

**Expected Response:**
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền chỉnh sửa lộ trình này"
}
```

**Verify:**
- ✅ Status: 403 Forbidden
- ✅ Authorization working correctly

---

### **Scenario 3: My-Schedule Filters** ✅

**Mục tiêu:** Filter meetings theo status và date range

#### Prerequisites:
- Student đã có ít nhất 3 meetings với trạng thái khác nhau:
  - 1 PENDING
  - 1 CONFIRMED
  - 1 COMPLETED

*(Xem TESTING_GUIDE.md Phase 2 để tạo meetings)*

---

#### Step 3.1: View All Meetings (No Filter)
```http
GET http://localhost:3000/meetings/my-meetings
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": 5,
    "status": "COMPLETED",
    "topic": "Học Giải Tích - Tích phân",
    "startTime": "2024-11-15T10:00:00Z",
    "endTime": "2024-11-15T12:00:00Z",
    "student": { ... },
    "tutor": { ... },
    "rating": { score: 5, comment: "Rất tốt" }
  },
  {
    "id": 3,
    "status": "CONFIRMED",
    "topic": "Học Đại Số",
    "startTime": "2024-11-20T14:00:00Z",
    ...
  },
  {
    "id": 1,
    "status": "PENDING",
    "topic": "Học Cấu Trúc Dữ Liệu",
    "startTime": "2024-11-22T09:00:00Z",
    ...
  }
]
```

---

#### Step 3.2: Filter by Status = PENDING (Upcoming)
```http
GET http://localhost:3000/meetings/my-meetings?status=PENDING
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "status": "PENDING",
    "topic": "Học Cấu Trúc Dữ Liệu",
    "startTime": "2024-11-22T09:00:00Z",
    ...
  }
]
```

**Verify:**
- ✅ Chỉ trả về meetings có `status = PENDING`
- ✅ UC_STU_02 (Lịch cá nhân - Sắp tới)

---

#### Step 3.3: Filter by Status = COMPLETED (History)
```http
GET http://localhost:3000/meetings/my-meetings?status=COMPLETED
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": 5,
    "status": "COMPLETED",
    "topic": "Học Giải Tích - Tích phân",
    "startTime": "2024-11-15T10:00:00Z",
    "rating": { ... }
  }
]
```

**Verify:**
- ✅ Chỉ trả về meetings đã COMPLETED
- ✅ UC_STU_04 (Lịch sử buổi học)

---

#### Step 3.4: Filter by Date Range
```http
GET http://localhost:3000/meetings/my-meetings?startDate=2024-11-01&endDate=2024-11-18
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": 5,
    "status": "COMPLETED",
    "startTime": "2024-11-15T10:00:00Z",
    ...
  }
  // Chỉ meetings trong tháng 11 (tuần 1-3)
]
```

**Verify:**
- ✅ Chỉ trả về meetings trong khoảng `startDate` đến `endDate`

---

#### Step 3.5: Combine Filters
```http
GET http://localhost:3000/meetings/my-meetings?status=COMPLETED&startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer {{STUDENT_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": 5,
    "status": "COMPLETED",
    "startTime": "2024-11-15T10:00:00Z",
    ...
  }
  // Chỉ COMPLETED meetings trong tháng 11
]
```

**Verify:**
- ✅ Combine cả status và date range
- ✅ UC_STU_04 với time range specific

---

#### Step 3.6: Tutor View Their Schedule
```http
# Login as Tutor
POST http://localhost:3000/auth/login
{
  "email": "tutor1@hcmut.edu.vn",
  "password": "tutor123"
}

# View upcoming sessions
GET http://localhost:3000/meetings/my-meetings?status=CONFIRMED
Authorization: Bearer {{TUTOR_TOKEN}}
```

**Expected Response:**
```json
[
  {
    "id": 3,
    "status": "CONFIRMED",
    "topic": "Học Đại Số",
    "student": {
      "fullName": "Nguyễn Văn A",
      "mssv": "2310001"
    },
    "tutor": {
      "user": {
        "fullName": "Trần Thị B"
      }
    }
  }
]
```

**Verify:**
- ✅ Tutor chỉ thấy meetings của mình
- ✅ UC_TUT_04 (Tutor xem lịch dạy)

---

## ✅ VERIFICATION CHECKLIST

### Module 11: Notifications
- [ ] GET /notifications trả về đúng notifications của user
- [ ] POST /notifications/:id/read đánh dấu thành công
- [ ] GET /notifications/unread-count đếm chính xác
- [ ] 403 nếu user cố mark notification của người khác

### Module 10: Academic (LearningRoadmap)
- [ ] TBM tạo được roadmap (POST)
- [ ] Student/Tutor xem được danh sách (GET)
- [ ] Author update được roadmap của mình (PATCH)
- [ ] Non-author không update được (403)
- [ ] Delete roadmap working (DELETE)

### Module 9: My-Schedule Filters
- [ ] ?status=PENDING trả về đúng upcoming meetings
- [ ] ?status=COMPLETED trả về lịch sử
- [ ] ?startDate & ?endDate filter theo date range
- [ ] Combine filters working (status + date)
- [ ] Tutor chỉ thấy meetings của mình

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: 401 Unauthorized
**Cause:** Token expired hoặc sai
**Solution:** Re-login và copy token mới

### Issue 2: 403 Forbidden - Role không đúng
**Cause:** Dùng Student token để tạo roadmap
**Solution:** Dùng Coordinator (TBM) token

### Issue 3: Empty array khi GET /meetings/my-meetings
**Cause:** User chưa có meetings
**Solution:** Tạo booking trước (xem Phase 2 docs)

### Issue 4: Date filter không hoạt động
**Cause:** Format date sai
**Solution:** Dùng ISO format: `2024-11-01` (YYYY-MM-DD)

---

## 📊 POSTMAN COLLECTION

Import collection sau vào Postman:

```json
{
  "info": {
    "name": "Use Cases Completion",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Notifications",
      "item": [
        {
          "name": "Get Notifications",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{STUDENT_TOKEN}}"
              }
            ],
            "url": "{{baseUrl}}/notifications?limit=10"
          }
        },
        {
          "name": "Mark as Read",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{STUDENT_TOKEN}}"
              }
            ],
            "url": "{{baseUrl}}/notifications/1/read"
          }
        }
      ]
    },
    {
      "name": "Academic/LearningRoadmap",
      "item": [
        {
          "name": "Create Roadmap (TBM)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{TBM_TOKEN}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Lộ trình học Giải Tích 1\",\n  \"description\": \"12 chương...\",\n  \"documentUrl\": \"https://library.hcmut.edu.vn/calculus-1.pdf\"\n}"
            },
            "url": "{{baseUrl}}/academic/roadmaps"
          }
        },
        {
          "name": "Get All Roadmaps",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{STUDENT_TOKEN}}"
              }
            ],
            "url": "{{baseUrl}}/academic/roadmaps"
          }
        }
      ]
    },
    {
      "name": "My-Schedule Filters",
      "item": [
        {
          "name": "View Upcoming (PENDING)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{STUDENT_TOKEN}}"
              }
            ],
            "url": "{{baseUrl}}/meetings/my-meetings?status=PENDING"
          }
        },
        {
          "name": "View History (COMPLETED)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{STUDENT_TOKEN}}"
              }
            ],
            "url": "{{baseUrl}}/meetings/my-meetings?status=COMPLETED"
          }
        },
        {
          "name": "Filter by Date Range",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{STUDENT_TOKEN}}"
              }
            ],
            "url": "{{baseUrl}}/meetings/my-meetings?startDate=2024-11-01&endDate=2024-11-30"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "STUDENT_TOKEN",
      "value": ""
    },
    {
      "key": "TUTOR_TOKEN",
      "value": ""
    },
    {
      "key": "TBM_TOKEN",
      "value": ""
    }
  ]
}
```

---

**Document created:** November 19, 2024  
**Last updated:** November 19, 2024  
**Status:** ✅ Ready for Testing
