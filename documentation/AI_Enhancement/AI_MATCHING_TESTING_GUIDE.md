# 🧪 AI Matching Testing Guide - Swagger UI

## 📋 Tổng quan
Hướng dẫn chi tiết để test **AI Matching Service** qua Swagger UI.

**Mục tiêu**: 
- ✅ Test 2 API endpoints: `POST /ai/match-tutors` và `GET /ai/similar-tutors/:tutorId`
- ✅ Validate response time < 2 giây
- ✅ Xác nhận matching score và explanation hợp lý

---

## 🚀 Bước 1: Khởi động Server & Truy cập Swagger

### **1.1. Khởi động server**
```powershell
cd d:\HK251\CNPM\BTL\Sub3\TutorSupportSystem
npm run start:dev
```

**Output mong đợi**:
```
[Nest] LOG [NestApplication] Nest application successfully started
📚 Swagger API Documentation: http://localhost:3000/api-docs
```

### **1.2. Mở Swagger UI**
Truy cập: **http://localhost:3000/api-docs**

**Xác nhận**: Bạn thấy danh sách API endpoints, trong đó có section **"ai"** với 2 endpoints:
- `POST /ai/match-tutors`
- `GET /ai/similar-tutors/{tutorId}`

---

## 🔐 Bước 2: Lấy JWT Token (STUDENT)

### **2.1. Tạo tài khoản STUDENT test (nếu chưa có)**

**Option A: Qua Swagger UI** (nếu có endpoint `/auth/register`)
- Mở `POST /auth/register`
- Click **"Try it out"**
- Nhập body:
```json
{
  "email": "student.test@hcmut.edu.vn",
  "fullName": "Nguyễn Văn Test",
  "password": "123456",
  "role": "STUDENT"
}
```
- Click **"Execute"**

**Option B: Qua SQL trực tiếp**
```sql
-- Chạy trong pgAdmin hoặc psql
INSERT INTO "User" (email, "fullName", role, password) VALUES (
  'student.test@hcmut.edu.vn',
  'Nguyễn Văn Test',
  'STUDENT',
  '$2b$10$abcdefghijklmnopqrstuvwxyz' -- Hashed password "123456"
);
```

### **2.2. Login để lấy JWT token**

1. Mở endpoint **`POST /auth/login`** trong Swagger
2. Click **"Try it out"**
3. Nhập body:
```json
{
  "email": "student.test@hcmut.edu.vn",
  "password": "123456"
}
```
4. Click **"Execute"**
5. **Copy JWT token** từ response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **2.3. Authorize trong Swagger**

1. Click nút **"Authorize"** (🔓 icon) ở góc trên bên phải Swagger UI
2. Nhập token vào field "Value":
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
   ⚠️ **Lưu ý**: Phải có từ "Bearer " trước token!
3. Click **"Authorize"** → Click **"Close"**

**Xác nhận**: Icon 🔓 chuyển thành 🔒 (locked)

---

## 🧪 Bước 3: Seed Test Data (Tutors)

**Trước khi test, cần có ít nhất 3-5 tutors trong database.**

### **3.1. Kiểm tra tutors hiện có**

Chạy SQL:
```sql
SELECT 
  tp.id, 
  u."fullName", 
  tp.expertise, 
  tp."averageRating", 
  tp.available
FROM "TutorProfile" tp
JOIN "User" u ON tp."userId" = u.id
WHERE tp.available = true;
```

**Nếu không có tutors**, chạy script sau để tạo:

```sql
-- Tutor 1: Giải Tích expert (rating cao)
INSERT INTO "User" (email, "fullName", role, password) VALUES 
  ('tutor1@hcmut.edu.vn', 'TS. Nguyễn Văn A', 'TUTOR', '$2b$10$test');

INSERT INTO "TutorProfile" ("userId", bio, expertise, "averageRating", available) VALUES (
  (SELECT id FROM "User" WHERE email='tutor1@hcmut.edu.vn'),
  'Giảng viên khoa Toán - Tin, chuyên Giải Tích và Toán Cao Cấp. 10 năm kinh nghiệm giảng dạy.',
  ARRAY['Giải Tích 1', 'Giải Tích 2', 'Toán Cao Cấp A1', 'Giải Tích Hàm'],
  4.8,
  true
);

-- Tutor 2: Đại Số expert (rating trung bình)
INSERT INTO "User" (email, "fullName", role, password) VALUES 
  ('tutor2@hcmut.edu.vn', 'ThS. Trần Thị B', 'TUTOR', '$2b$10$test');

INSERT INTO "TutorProfile" ("userId", bio, expertise, "averageRating", available) VALUES (
  (SELECT id FROM "User" WHERE email='tutor2@hcmut.edu.vn'),
  'Chuyên gia Đại Số Tuyến Tính và Lý thuyết số. Nghiên cứu sinh ngành Toán Ứng Dụng.',
  ARRAY['Đại Số Tuyến Tính', 'Đại Số Đại Cương', 'Toán Rời Rạc'],
  4.5,
  true
);

-- Tutor 3: Multi-subject (rating cao)
INSERT INTO "User" (email, "fullName", role, password) VALUES 
  ('tutor3@hcmut.edu.vn', 'ThS. Lê Văn C', 'TUTOR', '$2b$10$test');

INSERT INTO "TutorProfile" ("userId", bio, expertise, "averageRating", available) VALUES (
  (SELECT id FROM "User" WHERE email='tutor3@hcmut.edu.vn'),
  'Tutor đa năng với kinh nghiệm 5 năm. Từng đạt giải Nhất Olympic Toán sinh viên.',
  ARRAY['Giải Tích 1', 'Đại Số Tuyến Tính', 'Vật Lý Đại Cương 1', 'Xác Suất Thống Kê'],
  4.9,
  true
);

-- Tutor 4: Beginner (rating thấp)
INSERT INTO "User" (email, "fullName", role, password) VALUES 
  ('tutor4@hcmut.edu.vn', 'Phạm Thị D', 'TUTOR', '$2b$10$test');

INSERT INTO "TutorProfile" ("userId", bio, expertise, "averageRating", available) VALUES (
  (SELECT id FROM "User" WHERE email='tutor4@hcmut.edu.vn'),
  'Sinh viên năm 4 ngành Toán Tin. Mới bắt đầu làm tutor, nhiệt tình và tận tâm.',
  ARRAY['Giải Tích 1', 'Toán Cao Cấp A1'],
  3.2,
  true
);

-- Tutor 5: Vật Lý expert (cho test môn không match)
INSERT INTO "User" (email, "fullName", role, password) VALUES 
  ('tutor5@hcmut.edu.vn', 'PGS. Hoàng Văn E', 'TUTOR', '$2b$10$test');

INSERT INTO "TutorProfile" ("userId", bio, expertise, "averageRating", available) VALUES (
  (SELECT id FROM "User" WHERE email='tutor5@hcmut.edu.vn'),
  'Phó Giáo sư khoa Vật Lý Kỹ Thuật. Chuyên Cơ Học Lượng Tử và Nhiệt Động Lực.',
  ARRAY['Vật Lý Đại Cương 1', 'Vật Lý Đại Cương 2', 'Cơ Học Lượng Tử'],
  4.7,
  true
);
```

### **3.2. (Optional) Thêm Availability Slots**

```sql
-- Add slots cho Tutor 1 (cho availability test)
INSERT INTO "AvailabilitySlot" ("tutorId", "startTime", "endTime", "isBooked") VALUES 
  ((SELECT id FROM "TutorProfile" WHERE "userId" = (SELECT id FROM "User" WHERE email='tutor1@hcmut.edu.vn')),
   '2024-01-20 09:00:00', '2024-01-20 11:00:00', false),
  ((SELECT id FROM "TutorProfile" WHERE "userId" = (SELECT id FROM "User" WHERE email='tutor1@hcmut.edu.vn')),
   '2024-01-20 14:00:00', '2024-01-20 16:00:00', false);

-- Add slot cho Tutor 3
INSERT INTO "AvailabilitySlot" ("tutorId", "startTime", "endTime", "isBooked") VALUES 
  ((SELECT id FROM "TutorProfile" WHERE "userId" = (SELECT id FROM "User" WHERE email='tutor3@hcmut.edu.vn')),
   '2024-01-21 10:00:00', '2024-01-21 12:00:00', false);
```

---

## 🎯 Bước 4: Test Cases - POST /ai/match-tutors

### **Test Case 1: Tìm tutor Giải Tích 1 (Basic)**

1. Mở endpoint **`POST /ai/match-tutors`** trong Swagger
2. Click **"Try it out"**
3. Nhập Request Body:
```json
{
  "subjects": ["Giải Tích 1"],
  "limit": 5
}
```
4. Click **"Execute"**
5. **Đo thời gian**: Xem "Duration" trong Swagger (phải < 2000ms)

#### **✅ Expected Output**:
```json
{
  "message": "AI Matching completed",
  "data": [
    {
      "tutorId": 1,
      "tutorName": "TS. Nguyễn Văn A",
      "tutorEmail": "tutor1@hcmut.edu.vn",
      "score": 85,
      "explanation": {
        "subjectMatch": 1.0,
        "experienceMatch": 0.5,
        "ratingMatch": 0.96,
        "availabilityMatch": 1.0,
        "reasons": [
          "✅ Chuyên môn: Giải Tích 1",
          "📊 Số chuyên môn: 4 lĩnh vực",
          "⭐ Đánh giá: 4.8/5 (cao)",
          "📅 Có 2 slot trống"
        ]
      },
      "profile": {
        "specialization": "Giải Tích 1, Giải Tích 2, Toán Cao Cấp A1, Giải Tích Hàm",
        "yearsExperience": 0,
        "rating": 4.8,
        "hourlyRate": 50000
      }
    },
    {
      "tutorId": 3,
      "tutorName": "ThS. Lê Văn C",
      "tutorEmail": "tutor3@hcmut.edu.vn",
      "score": 82,
      "explanation": {
        "subjectMatch": 1.0,
        "experienceMatch": 0.5,
        "ratingMatch": 0.98,
        "availabilityMatch": 1.0,
        "reasons": [
          "✅ Chuyên môn: Giải Tích 1",
          "📊 Số chuyên môn: 4 lĩnh vực",
          "⭐ Đánh giá: 4.9/5 (cao)",
          "📅 Có 1 slot trống"
        ]
      },
      "profile": {
        "specialization": "Giải Tích 1, Đại Số Tuyến Tính, Vật Lý Đại Cương 1, Xác Suất Thống Kê",
        "yearsExperience": 0,
        "rating": 4.9,
        "hourlyRate": 50000
      }
    },
    {
      "tutorId": 4,
      "tutorName": "Phạm Thị D",
      "tutorEmail": "tutor4@hcmut.edu.vn",
      "score": 55,
      "explanation": {
        "subjectMatch": 1.0,
        "experienceMatch": 0.5,
        "ratingMatch": 0.64,
        "availabilityMatch": 0.0,
        "reasons": [
          "✅ Chuyên môn: Giải Tích 1",
          "📊 Số chuyên môn: 2 lĩnh vực",
          "⭐ Đánh giá: 3.2/5",
          "⚠️ Chưa có slot trống"
        ]
      },
      "profile": {
        "specialization": "Giải Tích 1, Toán Cao Cấp A1",
        "yearsExperience": 0,
        "rating": 3.2,
        "hourlyRate": 50000
      }
    }
  ]
}
```

#### **📋 Checklist - Ghi lại output của bạn**:
```
✅ Status Code: _____ (expected: 200)
✅ Response Time: _____ms (expected: < 2000ms)
✅ Number of tutors returned: _____ (expected: 3-5)
✅ Top tutor score: _____ (expected: 80-90)
✅ Top tutor có "✅ Chuyên môn: Giải Tích 1" trong reasons: ☐ Yes ☐ No
✅ Tutors sắp xếp theo score giảm dần: ☐ Yes ☐ No
```

---

### **Test Case 2: Filter với minRating cao**

1. Nhập Request Body:
```json
{
  "subjects": ["Giải Tích 1"],
  "minRating": 4.5,
  "limit": 5
}
```
2. Click **"Execute"**

#### **✅ Expected Output**:
- **KHÔNG** thấy Tutor 4 (rating 3.2) trong kết quả
- Chỉ thấy Tutor 1, 3 (rating >= 4.5)
- Top tutors có explanation "⭐ Đánh giá: X/5 (cao)"

#### **📋 Checklist**:
```
✅ Tutor có rating < 4.5 bị loại: ☐ Yes ☐ No
✅ Top tutor score: _____ (expected: 85-95)
✅ Response Time: _____ms
```

---

### **Test Case 3: Multiple Subjects (Giải Tích + Đại Số)**

1. Nhập Request Body:
```json
{
  "subjects": ["Giải Tích 1", "Đại Số Tuyến Tính"],
  "minRating": 4.0,
  "limit": 5
}
```
2. Click **"Execute"**

#### **✅ Expected Output**:
- **Top tutor**: Tutor 3 (có cả 2 môn) → score cao nhất (90+)
- Explanation có **2 dòng** "✅ Chuyên môn":
  - "✅ Chuyên môn: Giải Tích 1"
  - "✅ Chuyên môn: Đại Số Tuyến Tính"
- `subjectMatch: 1.0` (100% match)

#### **📋 Checklist**:
```
✅ Top tutor là Tutor 3 (ThS. Lê Văn C): ☐ Yes ☐ No
✅ subjectMatch của top tutor: _____ (expected: 1.0)
✅ Có 2 dòng "✅ Chuyên môn" trong reasons: ☐ Yes ☐ No
✅ Response Time: _____ms
```

---

### **Test Case 4: Edge Case - Môn không tồn tại**

1. Nhập Request Body:
```json
{
  "subjects": ["Quantum Mechanics Advanced"],
  "limit": 5
}
```
2. Click **"Execute"**

#### **✅ Expected Output**:
```json
{
  "message": "AI Matching completed",
  "data": []
}
```

#### **📋 Checklist**:
```
✅ Status Code: _____ (expected: 200)
✅ data array rỗng: ☐ Yes ☐ No
✅ Không có error: ☐ Yes ☐ No
```

---

### **Test Case 5: Error - Missing subjects**

1. Nhập Request Body (không có field "subjects"):
```json
{
  "limit": 5
}
```
2. Click **"Execute"**

#### **✅ Expected Output**:
```json
{
  "statusCode": 400,
  "message": "Subjects are required"
}
```

#### **📋 Checklist**:
```
✅ Status Code: _____ (expected: 400)
✅ Error message: "___________" (expected: "Subjects are required")
```

---

## 🎯 Bước 5: Test Cases - GET /ai/similar-tutors/{tutorId}

### **Test Case 6: Tìm tutors tương tự Tutor 1**

1. Lấy **tutorId** của Tutor 1:
```sql
SELECT id FROM "TutorProfile" 
WHERE "userId" = (SELECT id FROM "User" WHERE email='tutor1@hcmut.edu.vn');
-- Giả sử result = 1
```

2. Mở endpoint **`GET /ai/similar-tutors/{tutorId}`** trong Swagger
3. Click **"Try it out"**
4. Nhập Parameters:
   - `tutorId`: **1** (hoặc ID bạn vừa lấy)
   - `limit`: **3**
5. Click **"Execute"**

#### **✅ Expected Output**:
```json
{
  "message": "Similar tutors found",
  "data": [
    {
      "tutorId": 3,
      "tutorName": "ThS. Lê Văn C",
      "score": 78,
      "explanation": {...},
      "profile": {...}
    },
    {
      "tutorId": 4,
      "tutorName": "Phạm Thị D",
      "score": 65,
      "explanation": {...},
      "profile": {...}
    }
  ]
}
```

#### **📋 Checklist**:
```
✅ Status Code: _____ (expected: 200)
✅ Không bao gồm Tutor 1 trong kết quả: ☐ Yes ☐ No
✅ Số tutors trả về: _____ (expected: 2-3)
✅ Tutors có expertise tương tự Tutor 1 (Giải Tích/Toán): ☐ Yes ☐ No
✅ Response Time: _____ms
```

---

### **Test Case 7: Invalid tutorId**

1. Nhập Parameters:
   - `tutorId`: **9999**
   - `limit`: **3**
2. Click **"Execute"**

#### **✅ Expected Output**:
```json
{
  "message": "Similar tutors found",
  "data": []
}
```

#### **📋 Checklist**:
```
✅ Status Code: _____ (expected: 200)
✅ data array rỗng: ☐ Yes ☐ No
✅ Không có error 500: ☐ Yes ☐ No
```

---

## 📊 Bước 6: Tổng hợp kết quả

### **Performance Metrics**:
```
Test Case 1 - Response Time: _____ms
Test Case 2 - Response Time: _____ms
Test Case 3 - Response Time: _____ms
Test Case 4 - Response Time: _____ms
Test Case 6 - Response Time: _____ms

Average Response Time: _____ms (Target: < 2000ms)
```

### **Accuracy Validation** (Manual Review):
```
✅ Top 3 tutors trong Test Case 1 logically match "Giải Tích 1": ☐ Yes ☐ No
✅ Score distribution hợp lý (80-90 cho good match, 50-70 cho partial match): ☐ Yes ☐ No
✅ Explanation reasons rõ ràng và chính xác: ☐ Yes ☐ No
✅ Filters (minRating) hoạt động đúng: ☐ Yes ☐ No
```

### **Bug Report** (nếu có):
```
❌ Bug 1: [Mô tả vấn đề]
   - Test Case: _____
   - Expected: _____
   - Actual: _____
   - Screenshot/Log: _____

❌ Bug 2: [Mô tả vấn đề]
   ...
```

---

## 📤 Bước 7: Báo cáo kết quả

**Copy template sau và điền kết quả của bạn**:

```markdown
# AI Matching Test Results

**Date**: [YYYY-MM-DD HH:mm]
**Tester**: [Tên bạn]

## Summary
- Total Test Cases: 7
- Passed: _____ / 7
- Failed: _____ / 7
- Average Response Time: _____ms

## Test Case Results

| Test Case | Status | Response Time | Top Score | Notes |
|-----------|--------|---------------|-----------|-------|
| TC1: Basic search | ☐ Pass ☐ Fail | _____ms | _____ | _____ |
| TC2: minRating filter | ☐ Pass ☐ Fail | _____ms | _____ | _____ |
| TC3: Multiple subjects | ☐ Pass ☐ Fail | _____ms | _____ | _____ |
| TC4: No match | ☐ Pass ☐ Fail | _____ms | N/A | _____ |
| TC5: Missing subjects | ☐ Pass ☐ Fail | N/A | N/A | _____ |
| TC6: Similar tutors | ☐ Pass ☐ Fail | _____ms | _____ | _____ |
| TC7: Invalid tutorId | ☐ Pass ☐ Fail | _____ms | N/A | _____ |

## Issues Found
1. [Issue description]
2. [Issue description]

## Screenshots (Optional)
- [Attach Swagger screenshots if needed]

## Recommendations
- [Performance optimization ideas]
- [Feature enhancement suggestions]
```

**Gửi kết quả này cho tôi** sau khi hoàn thành testing! 🚀

---

## 🛠️ Troubleshooting

### **Lỗi 401 Unauthorized**:
- ✅ Kiểm tra đã Authorize với JWT token chưa
- ✅ Token có từ "Bearer " ở đầu không?
- ✅ Token có hết hạn không? (login lại để lấy token mới)

### **Lỗi 403 Forbidden**:
- ✅ Kiểm tra role của user phải là STUDENT
- ✅ Endpoint `/ai/match-tutors` chỉ cho STUDENT

### **Response Time > 2s**:
- ✅ Kiểm tra số lượng tutors trong DB (nếu > 100, có thể chậm)
- ✅ Kiểm tra kết nối DB (latency)
- ✅ Run lại test 3-5 lần, lấy average

### **Empty data array (không mong đợi)**:
- ✅ Kiểm tra có tutors với `available=true` không?
- ✅ Chạy SQL seed script ở Bước 3

---

**Author**: AI Implementation Team  
**Version**: 1.0  
**Last Updated**: 2024-01-XX  
**Related Files**: `src/ai/ai-matching.service.ts`, `src/ai/ai.controller.ts`
