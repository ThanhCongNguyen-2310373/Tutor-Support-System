# 🧪 WEBSOCKET NOTIFICATIONS - TESTING GUIDE

## 📋 Giới Thiệu

Hướng dẫn này giúp team test đầy đủ hệ thống WebSocket notifications với **Postman** (chi tiết từng bước).

## 🔧 Setup

### 1. Cài Đặt Dependencies (Already Done)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run start:dev
```

Server sẽ chạy tại `http://localhost:3000`

### 3. Setup Postman

#### Bước 1: Tạo Postman Collection
1. Mở Postman
2. Click **New** → **Collection**
3. Đặt tên: `TutorSupportSystem - Notifications`
4. Click **Create**

#### Bước 2: Setup Environment Variables
1. Click biểu tượng **⚙️** (Settings) ở góc trên bên phải
2. Click **Environments** → **Add**
3. Đặt tên: `TutorSupportSystem Dev`
4. Thêm các variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `studentToken` | (để trống) | (để trống) |
| `tutorToken` | (để trống) | (để trống) |
| `coordinatorToken` | (để trống) | (để trống) |
| `meetingId` | (để trống) | (để trống) |
| `notificationId` | (để trống) | (để trống) |
| `slotId` | (để trống) | (để trống) |

5. Click **Save**
6. Select environment này ở dropdown góc trên bên phải

## 🎯 Test Scenarios với Postman

### Scenario 0: Setup - Login và Lấy JWT Tokens

**Objective**: Lấy JWT tokens cho Student, Tutor, và Coordinator

#### Step 1: Login Student Account

1. **Tạo request mới trong Postman**:
   - Click **Add Request**
   - Đặt tên: `Login - Student`
   - Method: **POST**
   - URL: `{{baseUrl}}/api/auth/login`

2. **Setup Headers**:
   - Click tab **Headers**
   - Thêm: `Content-Type: application/json`

3. **Setup Body**:
   - Click tab **Body**
   - Chọn **raw** và **JSON**
   - Nhập:
   ```json
   {
     "email": "student1@example.com",
     "password": "password123"
   }
   ```

4. **Send Request**:
   - Click **Send**
   - Verify response (200 OK):
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 123,
       "email": "student1@example.com",
       "role": "STUDENT",
       "fullName": "Nguyễn Văn A"
     }
   }
   ```

5. **Lưu Token vào Environment**:
   - Click tab **Tests**
   - Thêm script:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("studentToken", jsonData.accessToken);
       console.log("✅ Student token saved:", jsonData.accessToken);
   }
   ```
   - Click **Send** lại để script chạy

6. **Verify**: Check environment variables, `studentToken` đã có giá trị

#### Step 2: Login Tutor Account

1. **Duplicate request** `Login - Student`:
   - Right-click → **Duplicate**
   - Đổi tên: `Login - Tutor`

2. **Sửa Body**:
   ```json
   {
     "email": "tutor1@example.com",
     "password": "password123"
   }
   ```

3. **Sửa Tests script**:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("tutorToken", jsonData.accessToken);
       console.log("✅ Tutor token saved:", jsonData.accessToken);
   }
   ```

4. **Send** và verify `tutorToken` được lưu

#### Step 3: Login Coordinator Account

1. **Duplicate** lại request
2. **Đổi tên**: `Login - Coordinator`
3. **Sửa Body**:
   ```json
   {
     "email": "coordinator@example.com",
     "password": "password123"
   }
   ```
4. **Sửa Tests script**: đổi thành `coordinatorToken`
5. **Send**

---

### Scenario 1: Test WebSocket Connection (Browser Console)

**Objective**: Verify WebSocket connection với JWT authentication

**Steps**:
1. Lấy JWT token từ Scenario 0
2. Mở browser console (F12)
3. Paste code sau:

```javascript
// Load Socket.IO client
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
document.head.appendChild(script);

script.onload = () => {
  const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
  
  const socket = io('http://localhost:3000/notifications', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('✅ Connected! Socket ID:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  socket.on('notification', (payload) => {
    console.log('🔔 Notification received:', payload);
  });

  // Save to window for later use
  window.testSocket = socket;
};
```

**Expected Results**:
- ✅ Console log: "✅ Connected! Socket ID: ..."
- ✅ Không có error messages

**Failure Cases**:
- ❌ "Authentication error" → Token không hợp lệ hoặc expired
- ❌ "Connection error" → Server không chạy hoặc CORS issue

---

### Scenario 2: Test New Booking Request Notification

**Objective**: Student tạo booking → Tutor nhận notification real-time

**Prerequisites**:
- 2 accounts: Student và Tutor (đã login - Scenario 0)
- Tutor có availability slot available
- Tutor connect WebSocket ở browser console (Scenario 1)

#### Postman Steps:

#### Step 1: Lấy danh sách Tutors để chọn tutorId

1. **Tạo request mới**:
   - Tên: `Get Tutors List`
   - Method: **GET**
   - URL: `{{baseUrl}}/api/tutors`

2. **Setup Authorization**:
   - Click tab **Authorization**
   - Type: **Bearer Token**
   - Token: `{{studentToken}}`

3. **Send**:
   - Response sẽ có danh sách tutors
   - Copy `id` của một tutor (ví dụ: `1`)

#### Step 2: Lấy available slots của tutor

1. **Tạo request mới**:
   - Tên: `Get Tutor Slots`
   - Method: **GET**
   - URL: `{{baseUrl}}/api/tutors/1/slots`
   - *(Thay `1` bằng tutorId từ Step 1)*

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{studentToken}}`

3. **Send**:
   - Response có danh sách slots
   - Tìm slot có `isBooked: false`
   - Copy `id` của slot đó (ví dụ: `123`)

4. **Lưu slotId vào Environment**:
   - Tab **Tests**:
   ```javascript
   if (pm.response.code === 200) {
       var slots = pm.response.json();
       var availableSlot = slots.find(slot => !slot.isBooked);
       if (availableSlot) {
           pm.environment.set("slotId", availableSlot.id);
           console.log("✅ Available slot ID:", availableSlot.id);
       }
   }
   ```

#### Step 3: Student tạo booking mới

1. **Tạo request mới**:
   - Tên: `Create Booking`
   - Method: **POST**
   - URL: `{{baseUrl}}/api/meetings/bookings`

2. **Setup Headers**:
   - `Content-Type: application/json`

3. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{studentToken}}`

4. **Setup Body** (raw JSON):
   ```json
   {
     "tutorId": 1,
     "slotId": {{slotId}},
     "topic": "Học React Hooks"
   }
   ```
   *(Chú ý: `{{slotId}}` sẽ tự động thay bằng giá trị từ environment)*

5. **Setup Tests** (để lưu meetingId):
   ```javascript
   if (pm.response.code === 201) {
       var meeting = pm.response.json();
       pm.environment.set("meetingId", meeting.id);
       console.log("✅ Meeting created! ID:", meeting.id);
       console.log("📩 Tutor should receive notification now!");
   }
   ```

6. **Send**:
   - Click **Send**
   - Expected response (201 Created):
   ```json
   {
     "id": 456,
     "studentId": 123,
     "tutorId": 1,
     "slotId": 123,
     "topic": "Học React Hooks",
     "status": "PENDING",
     "startTime": "2024-12-20T10:00:00.000Z",
     "endTime": "2024-12-20T11:00:00.000Z",
     ...
   }
   ```

#### Step 4: Check Tutor's Browser Console

**Expected Results**:

1. **Tutor's Browser Console** hiển thị (real-time):
```javascript
🔔 Notification received: {
  type: 'NEW_BOOKING_REQUEST',
  title: '📩 Yêu cầu đặt lịch mới',
  message: 'Bạn có một yêu cầu đặt lịch mới từ Nguyễn Văn A',
  data: {
    meetingId: 456,
    studentName: 'Nguyễn Văn A',
    scheduledTime: '2024-12-20T10:00:00.000Z',
    topic: 'Học React Hooks'
  },
  priority: 'high',
  read: false,
  createdAt: '2024-12-15T...'
}
```

2. **Database** có record mới trong `Notification` table

#### Step 5: Verify qua REST API (Postman)

1. **Tạo request mới**:
   - Tên: `Get Tutor Notifications`
   - Method: **GET**
   - URL: `{{baseUrl}}/api/notifications?limit=10`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{tutorToken}}` *(Chú ý: dùng tutorToken, không phải studentToken)*

3. **Send**:
   - Expected response (200 OK):
   ```json
   [
     {
       "id": 789,
       "recipientId": 1,
       "title": "Yêu cầu đặt lịch mới",
       "message": "Sinh viên Nguyễn Văn A đã đặt lịch hẹn với bạn...",
       "isRead": false,
       "createdAt": "2024-12-15T10:00:00.000Z"
     }
   ]
   ```

4. **Lưu notificationId**:
   - Tab **Tests**:
   ```javascript
   if (pm.response.code === 200) {
       var notifications = pm.response.json();
       if (notifications.length > 0) {
           pm.environment.set("notificationId", notifications[0].id);
           console.log("✅ First notification ID:", notifications[0].id);
       }
   }
   ```

---

### Scenario 3: Test Booking Confirmed Notification

**Objective**: Tutor confirm booking → Student nhận notification real-time

**Prerequisites**:
- Có booking PENDING (từ Scenario 2)
- Student connect WebSocket ở browser console
- meetingId đã lưu trong environment

#### Postman Steps:

#### Step 1: Tutor confirm booking

1. **Tạo request mới**:
   - Tên: `Confirm Booking`
   - Method: **PATCH**
   - URL: `{{baseUrl}}/api/meetings/{{meetingId}}/confirm`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{tutorToken}}`

3. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "id": 456,
     "status": "CONFIRMED",
     "student": {
       "id": 123,
       "fullName": "Nguyễn Văn A",
       "email": "student1@example.com"
     },
     "tutor": {
       "id": 1,
       "user": {
         "fullName": "Trần Thị B"
       }
     },
     ...
   }
   ```

#### Step 2: Check Student's Browser Console

**Expected Results**:

1. **Student's Browser Console** hiển thị (real-time):
```javascript
🔔 Notification received: {
  type: 'BOOKING_CONFIRMED',
  title: 'Meeting đã được xác nhận',
  message: 'Tutor Trần Thị B đã xác nhận meeting vào 20/12/2024',
  data: {
    meetingId: 456,
    tutorName: 'Trần Thị B',
    scheduledTime: '2024-12-20T10:00:00.000Z'
  },
  priority: 'high',
  read: false
}
```

2. **Student email** (Phase 2) - check inbox

3. **Meeting status** = CONFIRMED

#### Step 3: Verify qua Postman

1. **Tạo request**:
   - Tên: `Get Student Notifications`
   - Method: **GET**
   - URL: `{{baseUrl}}/api/notifications?limit=10`

2. **Authorization**: Bearer Token = `{{studentToken}}`

3. **Send** và verify có notification mới với type BOOKING_CONFIRMED

---

### Scenario 4: Test Booking Rejected Notification

**Objective**: Tutor reject booking → Student nhận notification với lý do

**Prerequisites**:
- Tạo booking mới (PENDING) - repeat Scenario 2 Step 3
- Student connect WebSocket
- Lưu meetingId mới vào environment

#### Postman Steps:

#### Step 1: Tutor reject booking

1. **Tạo request mới**:
   - Tên: `Reject Booking`
   - Method: **PATCH**
   - URL: `{{baseUrl}}/api/meetings/{{meetingId}}/reject`

2. **Setup Headers**:
   - `Content-Type: application/json`

3. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{tutorToken}}`

4. **Setup Body** (raw JSON):
   ```json
   {
     "reason": "Bận lịch đột xuất"
   }
   ```

5. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "id": 456,
     "status": "CANCELED",
     ...
   }
   ```

#### Step 2: Check Student's Browser Console

**Expected Results**:

1. **Student Console** hiển thị:
```javascript
🔔 Notification received: {
  type: 'BOOKING_REJECTED',
  title: 'Meeting đã bị từ chối',
  message: 'Tutor Trần Thị B đã từ chối meeting...',
  data: {
    meetingId: 456,
    tutorName: 'Trần Thị B',
    scheduledTime: '2024-12-20T10:00:00.000Z',
    reason: 'Bận lịch đột xuất'
  },
  priority: 'medium'
}
```

2. **Slot status**: isBooked = false (slot được giải phóng)

#### Step 3: Verify slot freed up

1. **Reuse request**: `Get Tutor Slots` (từ Scenario 2)
2. **Send** và verify slot `{{slotId}}` có `isBooked: false`

---

### Scenario 5: Test Meeting Completed Notification

**Objective**: Tutor complete meeting → Student nhận notification + request rating

**Prerequisites**:
- Có meeting CONFIRMED (từ Scenario 3)
- Student connect WebSocket

#### Postman Steps:

#### Step 1: Tutor complete meeting

1. **Tạo request mới**:
   - Tên: `Complete Meeting`
   - Method: **PATCH**
   - URL: `{{baseUrl}}/api/meetings/{{meetingId}}/complete`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{tutorToken}}`

3. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "id": 456,
     "status": "COMPLETED",
     ...
   }
   ```

#### Step 2: Check Student's Browser Console

**Expected Results**:

1. **Student Console**:
```javascript
🔔 Notification received: {
  type: 'MEETING_COMPLETED',
  title: 'Meeting đã hoàn thành',
  message: 'Meeting với tutor Trần Thị B đã hoàn thành. Hãy đánh giá!',
  data: {
    meetingId: 456,
    tutorName: 'Trần Thị B',
    completedTime: '2024-12-20T11:00:00.000Z'
  },
  priority: 'medium'
}
```

2. **Student Email** - Rating request (Phase 2)

3. **Meeting status** = COMPLETED

#### Step 3: Verify via Postman

1. **Get Student Notifications** (reuse request từ Scenario 3)
2. Verify có notification MEETING_COMPLETED

---

### Scenario 6: Test REST API - Mark as Read

**Objective**: Verify mark notification as read

#### Postman Steps:

#### Step 1: Get unread count (trước khi mark)

1. **Tạo request mới**:
   - Tên: `Get Unread Count`
   - Method: **GET**
   - URL: `{{baseUrl}}/api/notifications/unread-count`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{studentToken}}` (hoặc `{{tutorToken}}` tùy account đang test)

3. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "unreadCount": 5
   }
   ```

4. **Lưu count vào variable** (optional):
   - Tab **Tests**:
   ```javascript
   if (pm.response.code === 200) {
       var data = pm.response.json();
       pm.environment.set("unreadCountBefore", data.unreadCount);
       console.log("📊 Unread count:", data.unreadCount);
   }
   ```

#### Step 2: Mark một notification as read

1. **Tạo request mới**:
   - Tên: `Mark Notification as Read`
   - Method: **POST**
   - URL: `{{baseUrl}}/api/notifications/{{notificationId}}/read`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{studentToken}}`

3. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "id": 789,
     "recipientId": 123,
     "title": "Meeting đã được xác nhận",
     "message": "...",
     "isRead": true,
     "createdAt": "..."
   }
   ```

#### Step 3: Verify count giảm

1. **Reuse request**: `Get Unread Count`
2. **Send**:
   - Expected: `{ "unreadCount": 4 }`
   - Count giảm 1 so với Step 1

**Expected Results**:
- ✅ Notification `isRead` = `true`
- ✅ Unread count decreased by 1

---

### Scenario 7: Test REST API - Mark All as Read

#### Postman Steps:

#### Step 1: Check unread count trước

1. **Reuse**: `Get Unread Count`
2. **Send**: Ví dụ response `{ "unreadCount": 3 }`

#### Step 2: Mark all as read

1. **Tạo request mới**:
   - Tên: `Mark All Notifications as Read`
   - Method: **POST**
   - URL: `{{baseUrl}}/api/notifications/read-all`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{studentToken}}`

3. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "markedCount": 3
   }
   ```

#### Step 3: Verify unread count = 0

1. **Reuse**: `Get Unread Count`
2. **Send**: Expected `{ "unreadCount": 0 }`

#### Step 4: Verify all notifications isRead = true

1. **Reuse**: `Get Student Notifications`
2. **Send** và verify tất cả items có `"isRead": true`

**Expected Results**:
- ✅ Response: `{ "markedCount": 3 }`
- ✅ Unread count = 0
- ✅ All notifications có `isRead = true`

---

### Scenario 8: Test REST API - Delete Notification

#### Postman Steps:

#### Step 1: Delete một notification

1. **Tạo request mới**:
   - Tên: `Delete Notification`
   - Method: **DELETE**
   - URL: `{{baseUrl}}/api/notifications/{{notificationId}}`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{studentToken}}`

3. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "message": "Notification deleted successfully"
   }
   ```

#### Step 2: Verify notification đã bị xóa

1. **Reuse**: `Get Student Notifications`
2. **Send**: Notification với ID đó không còn trong list

#### Step 3: Test security - Không thể xóa notification của user khác

1. **Duplicate**: `Delete Notification`
2. **Sửa**: Dùng `{{notificationId}}` của tutor
3. **Authorization**: `{{studentToken}}` (student cố xóa notification của tutor)
4. **Send**:
   - Expected response (403 Forbidden hoặc 404 Not Found):
   ```json
   {
     "statusCode": 403,
     "message": "Forbidden"
   }
   ```

**Expected Results**:
- ✅ Response: `{ "message": "Notification deleted successfully" }`
- ✅ Notification removed from list
- ✅ Can't delete other user's notifications (403 Forbidden)

---

### Scenario 9: Test REST API - Delete All Read

#### Postman Steps:

#### Step 1: Chuẩn bị data
- Mark một số notifications as read (Scenario 7)
- Để lại một số unread

#### Step 2: Check notifications trước

1. **Reuse**: `Get Student Notifications`
2. Count: Bao nhiêu có `isRead: true` vs `isRead: false`
3. Ví dụ: 5 read, 2 unread

#### Step 3: Delete all read

1. **Tạo request mới**:
   - Tên: `Delete All Read Notifications`
   - Method: **DELETE**
   - URL: `{{baseUrl}}/api/notifications/read/all`

2. **Setup Authorization**:
   - Type: **Bearer Token**
   - Token: `{{studentToken}}`

3. **Send**:
   - Expected response (200 OK):
   ```json
   {
     "deletedCount": 5
   }
   ```

#### Step 4: Verify chỉ còn unread

1. **Reuse**: `Get Student Notifications`
2. **Send**: Chỉ còn 2 notifications (all có `isRead: false`)

**Expected Results**:
- ✅ Response: `{ "deletedCount": 5 }`
- ✅ Only read notifications deleted
- ✅ Unread notifications vẫn còn (2 items)

---

### Scenario 10: Test Multiple Connections (Same User)

**Objective**: Verify user receives notifications on all devices

**Steps**:

1. Open 2 browser tabs (Tab A và Tab B)
2. Login same user in both tabs
3. Connect WebSocket in both tabs
4. Trigger a notification (e.g., another user creates booking)

**Expected Results**:
- ✅ Both tabs receive the same notification
- ✅ Server log: "User X connected (2 online)" → Shows 2 connections tracked

---

### Scenario 11: Test Disconnect/Reconnect

**Objective**: Verify reconnection handles gracefully

**Steps**:

1. Connect WebSocket
2. Kill server (`Ctrl+C`)
3. Restart server (`npm run start:dev`)
4. Check browser console

**Expected Results**:
- ✅ Socket.IO auto-reconnects
- ✅ Console: "🔄 Reconnecting..."
- ✅ Console: "✅ Connected! Socket ID: ..."
- ✅ User can receive notifications after reconnect

---

### Scenario 12: Test Invalid Token

**Objective**: Verify authentication errors handled properly

**Steps**:

```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'INVALID_TOKEN' }
});

socket.on('connect_error', (error) => {
  console.error('❌ Error:', error.message);
});
```

**Expected Results**:
- ❌ Connection fails
- ❌ Console: "Authentication error"
- ❌ Socket disconnected immediately

---

### Scenario 13: Test Expired Token

**Objective**: Verify expired JWT tokens rejected

**Steps**:

1. Use a token that expired (older than 7 days)
2. Try to connect

**Expected Results**:
- ❌ Connection fails
- ❌ Error: "jwt expired"

**Solution**: User should login again to get fresh token

---

### Scenario 14: Test Notification Persistence

**Objective**: Verify notifications persist across sessions

**Steps**:

1. User A triggers notification to User B
2. User B is offline (not connected)
3. Notification stored in database
4. User B logs in later
5. Fetch notifications via REST API

**Expected Results**:
- ✅ User B can see the notification via GET `/api/notifications`
- ✅ Notification has `isRead = false`
- ✅ createdAt timestamp shows when it was sent

---

## 🔍 Database Verification

### Check Notifications Table

```sql
-- PostgreSQL
SELECT * FROM notifications 
WHERE recipient_id = 123 
ORDER BY created_at DESC 
LIMIT 10;

-- Check unread count
SELECT COUNT(*) FROM notifications 
WHERE recipient_id = 123 AND is_read = false;
```

## 📊 Performance Testing

### Test Load (Optional)

Test with many concurrent connections:

```javascript
// Create 100 connections
for (let i = 0; i < 100; i++) {
  const socket = io('http://localhost:3000/notifications', {
    auth: { token: VALID_TOKEN }
  });
  
  socket.on('connect', () => {
    console.log(`Connection ${i} established`);
  });
}
```

**Expected**: Server should handle without crashing

## 🐛 Common Issues & Solutions

### Issue 1: "CORS error"
**Solution**: Check `notifications.gateway.ts` CORS config includes your frontend URL

### Issue 2: "Authentication error" 
**Solution**: Verify JWT_SECRET matches between token generation and WebSocket gateway

### Issue 3: "Notification not received"
**Solution**: 
- Check if recipient is online (connected to WebSocket)
- Check database for notification record
- Verify userId matches

### Issue 4: "Cannot read property of undefined"
**Solution**: Check Prisma schema field names (use `isRead` not `read`)

## ✅ Test Checklist

Phase 3 hoàn thành khi:

- [ ] ✅ WebSocket connection thành công với valid JWT
- [ ] ✅ Student tạo booking → Tutor nhận notification real-time
- [ ] ✅ Tutor confirm → Student nhận notification
- [ ] ✅ Tutor reject → Student nhận notification với reason
- [ ] ✅ Meeting completed → Student nhận notification
- [ ] ✅ REST API: Get notifications list
- [ ] ✅ REST API: Get unread count
- [ ] ✅ REST API: Mark as read
- [ ] ✅ REST API: Mark all as read
- [ ] ✅ REST API: Delete notification
- [ ] ✅ REST API: Delete all read
- [ ] ✅ Multiple connections (same user) work
- [ ] ✅ Reconnection handles gracefully
- [ ] ✅ Invalid token rejected
- [ ] ✅ Expired token rejected
- [ ] ✅ Notifications persist when user offline

