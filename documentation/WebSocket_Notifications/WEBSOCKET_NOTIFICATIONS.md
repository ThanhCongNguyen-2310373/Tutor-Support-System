# 🔔 WEBSOCKET NOTIFICATIONS

## 📋 Tổng Quan

triển khai hệ thống real-time notifications sử dụng **Socket.IO** để gửi thông báo tức thời đến users mà không cần refresh trang.

### ✅ Hoàn Thành
- ✅ WebSocket Gateway với Socket.IO
- ✅ JWT Authentication cho WebSocket connections
- ✅ User-Socket mapping system
- ✅ 13 notification event types
- ✅ REST API cho notification management
- ✅ Database persistence với Prisma
- ✅ Tích hợp với MeetingsService
- ✅ Frontend integration guide

## 🏗️ Kiến Trúc

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     WebSocket Client                         │
│                  (Browser/Mobile App)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ Socket.IO Protocol
                     │ (JWT Token in handshake)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              NotificationsGateway                            │
│  - Connection management (JWT auth)                          │
│  - User-Socket mapping (bidirectional)                       │
│  - Real-time event emission                                  │
│  - Message handlers (subscribe, mark_read)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              NotificationsService                            │
│  - Business logic                                            │
│  - Database operations (CRUD)                                │
│  - Notification helpers                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              PrismaService → Database                        │
│  - Notification persistence                                  │
│  - Read status tracking                                      │
└─────────────────────────────────────────────────────────────┘
```

### Integration Flow

```
MeetingsService → NotificationsService → NotificationsGateway → WebSocket Client
     (Event)          (Store in DB)        (Emit to user)       (Display UI)
```

## 🔐 Authentication

WebSocket connection yêu cầu **JWT token** trong handshake:

```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: userToken  // JWT token từ login
  }
});
```

Backend verify token và extract userId để:
- Join user vào personal room: `user:{userId}`
- Map userId ↔ socketId (bidirectional)
- Emit targeted notifications

## 📡 Notification Events

### 1. NEW_BOOKING_REQUEST
**Người nhận**: Tutor  
**Khi nào**: Student tạo booking mới

```typescript
{
  type: 'NEW_BOOKING_REQUEST',
  title: 'Yêu cầu đặt lịch mới',
  message: 'Sinh viên Nguyễn Văn A đã đặt lịch hẹn với bạn...',
  data: {
    meetingId: 123,
    studentName: 'Nguyễn Văn A',
    scheduledTime: '2024-12-20T10:00:00Z',
    topic: 'Học React'
  },
  priority: 'high'
}
```

### 2. BOOKING_CONFIRMED
**Người nhận**: Student  
**Khi nào**: Tutor xác nhận booking

```typescript
{
  type: 'BOOKING_CONFIRMED',
  title: 'Meeting đã được xác nhận',
  message: 'Tutor Trần Thị B đã xác nhận meeting...',
  data: {
    meetingId: 123,
    tutorName: 'Trần Thị B',
    scheduledTime: '2024-12-20T10:00:00Z'
  },
  priority: 'high'
}
```

### 3. BOOKING_REJECTED
**Người nhận**: Student  
**Khi nào**: Tutor từ chối booking

```typescript
{
  type: 'BOOKING_REJECTED',
  title: 'Meeting đã bị từ chối',
  message: 'Tutor Trần Thị B đã từ chối meeting...',
  data: {
    meetingId: 123,
    tutorName: 'Trần Thị B',
    scheduledTime: '2024-12-20T10:00:00Z',
    reason: 'Bận lịch đột xuất' // Optional
  },
  priority: 'medium'
}
```

### 4. BOOKING_CANCELLED
**Người nhận**: Tutor hoặc Student (phụ thuộc ai cancel)  
**Khi nào**: Một bên hủy meeting

```typescript
{
  type: 'BOOKING_CANCELLED',
  title: 'Meeting đã bị hủy',
  message: 'Meeting vào 20/12/2024 đã bị hủy',
  data: {
    meetingId: 123,
    cancelledBy: 'student', // or 'tutor'
    scheduledTime: '2024-12-20T10:00:00Z'
  },
  priority: 'medium'
}
```

### 5. MEETING_REMINDER_24H
**Người nhận**: Tutor và Student  
**Khi nào**: 24 giờ trước meeting

```typescript
{
  type: 'MEETING_REMINDER_24H',
  title: 'Nhắc nhở: Meeting sắp diễn ra',
  message: 'Bạn có meeting vào 20/12/2024 lúc 10:00',
  data: {
    meetingId: 123,
    scheduledTime: '2024-12-20T10:00:00Z'
  },
  priority: 'medium'
}
```

### 6. MEETING_REMINDER_1H
**Người nhận**: Tutor và Student  
**Khi nào**: 1 giờ trước meeting

```typescript
{
  type: 'MEETING_REMINDER_1H',
  title: 'Nhắc nhở: Meeting bắt đầu trong 1 giờ',
  message: 'Meeting của bạn sẽ bắt đầu lúc 10:00',
  data: {
    meetingId: 123,
    scheduledTime: '2024-12-20T10:00:00Z'
  },
  priority: 'high'
}
```

### 7. MEETING_STARTED
**Người nhận**: Tutor và Student  
**Khi nào**: Meeting bắt đầu

```typescript
{
  type: 'MEETING_STARTED',
  title: 'Meeting đã bắt đầu',
  message: 'Meeting của bạn đang bắt đầu',
  data: {
    meetingId: 123,
    meetingLink: 'https://meet.google.com/abc-xyz'
  },
  priority: 'urgent'
}
```

### 8. MEETING_COMPLETED
**Người nhận**: Student  
**Khi nào**: Tutor đánh dấu meeting hoàn thành

```typescript
{
  type: 'MEETING_COMPLETED',
  title: 'Meeting đã hoàn thành',
  message: 'Meeting với tutor Trần Thị B đã hoàn thành. Hãy đánh giá!',
  data: {
    meetingId: 123,
    tutorName: 'Trần Thị B',
    completedTime: '2024-12-20T11:00:00Z'
  },
  priority: 'medium'
}
```

### 9. NEW_MESSAGE
**Người nhận**: Recipient của message  
**Khi nào**: Nhận tin nhắn mới

```typescript
{
  type: 'NEW_MESSAGE',
  title: 'Tin nhắn mới',
  message: 'Bạn có tin nhắn mới từ Nguyễn Văn A',
  data: {
    senderId: 456,
    senderName: 'Nguyễn Văn A',
    messagePreview: 'Xin chào...'
  },
  priority: 'low'
}
```

### 10. NEW_NOTIFICATION
**Người nhận**: Specific user  
**Khi nào**: General notification

```typescript
{
  type: 'NEW_NOTIFICATION',
  title: 'Thông báo',
  message: 'Bạn có thông báo mới',
  data: {
    category: 'general'
  },
  priority: 'low'
}
```

### 11. SYSTEM_ALERT
**Người nhận**: All users hoặc specific role  
**Khi nào**: System announcement

```typescript
{
  type: 'SYSTEM_ALERT',
  title: 'Thông báo hệ thống',
  message: 'Hệ thống sẽ bảo trì vào 25/12/2024',
  data: {
    scheduledTime: '2024-12-25T00:00:00Z'
  },
  priority: 'medium'
}
```

### 12. MAINTENANCE_MODE
**Người nhận**: All users  
**Khi nào**: System maintenance

```typescript
{
  type: 'MAINTENANCE_MODE',
  title: 'Chế độ bảo trì',
  message: 'Hệ thống đang trong chế độ bảo trì',
  data: {
    estimatedDuration: '2 hours'
  },
  priority: 'urgent'
}
```

### 13. EMERGENCY_ALERT
**Người nhận**: All users  
**Khi nào**: Critical emergency

```typescript
{
  type: 'EMERGENCY_ALERT',
  title: 'Cảnh báo khẩn cấp',
  message: 'Vui lòng đăng xuất và thay đổi mật khẩu ngay',
  data: {
    action: 'change_password'
  },
  priority: 'urgent'
}
```

## 🔄 WebSocket Gateway

### Connection Lifecycle

```typescript
// 1. Client connects with JWT token
socket.connect({ auth: { token } })

// 2. Gateway validates token
handleConnection(client: Socket) {
  const token = client.handshake.auth.token;
  const payload = jwtService.verify(token);
  const userId = payload.sub;
  
  // 3. Map user to socket
  userSocketMap.set(userId, client.id);
  socketUserMap.set(client.id, userId);
  
  // 4. Join personal room
  client.join(`user:${userId}`);
}

// 5. Client disconnects
handleDisconnect(client: Socket) {
  const userId = socketUserMap.get(client.id);
  userSocketMap.delete(userId);
  socketUserMap.delete(client.id);
}
```

### Emit Methods

```typescript
// Emit to specific user
emitNewBookingRequest(userId, meetingId, studentName, scheduledTime, topic)
emitBookingConfirmed(userId, meetingId, tutorName, scheduledTime)
emitBookingRejected(userId, meetingId, tutorName, scheduledTime, reason?)

// Emit to all online users
emitMaintenanceMode(message, estimatedDuration)
emitEmergencyAlert(message, action)

// Emit to specific role
emitSystemAlertToRole(role, message, data?)
```

## 📊 Database Schema

```prisma
model Notification {
  id          Int      @id @default(autoincrement())
  recipientId Int      @map("recipient_id")
  recipient   User     @relation(fields: [recipientId], references: [id])
  
  title       String
  message     String   @db.Text
  read        Boolean  @default(false)
  
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("notifications")
}
```

## 🔧 REST API Endpoints

### GET /api/notifications
Lấy danh sách notifications (có pagination)

**Query params**:
- `limit`: Số lượng notifications (default: 20)

**Response**:
```json
[
  {
    "id": 123,
    "recipientId": 456,
    "title": "Yêu cầu đặt lịch mới",
    "message": "Sinh viên Nguyễn Văn A...",
    "read": false,
    "createdAt": "2024-12-20T10:00:00Z"
  }
]
```

### GET /api/notifications/unread-count
Lấy số lượng notifications chưa đọc

**Response**:
```json
{
  "count": 5
}
```

### POST /api/notifications/:id/read
Đánh dấu notification đã đọc

**Response**:
```json
{
  "id": 123,
  "read": true
}
```

### POST /api/notifications/read-all
Đánh dấu tất cả notifications đã đọc

**Response**:
```json
{
  "updated": 10
}
```

### DELETE /api/notifications/:id
Xóa notification

**Response**:
```json
{
  "message": "Notification deleted"
}
```

### DELETE /api/notifications/read/all
Xóa tất cả notifications đã đọc

**Response**:
```json
{
  "deleted": 8
}
```

## 🧪 Testing

### 1. Test WebSocket Connection

Sử dụng browser console hoặc Postman:

```javascript
// Browser console
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('notification', (data) => {
  console.log('🔔 Notification:', data);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
});
```

### 2. Test REST API

```bash
# Get notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get unread count
curl -X GET http://localhost:3000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mark as read
curl -X POST http://localhost:3000/api/notifications/123/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mark all as read
curl -X POST http://localhost:3000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Real-time Notifications

1. Mở 2 browser tabs
2. Tab 1: Login as Student, connect WebSocket
3. Tab 2: Login as Tutor, connect WebSocket
4. Student tạo booking → Tutor nhận notification real-time
5. Tutor confirm booking → Student nhận notification real-time

## 🎯 Integration Points

### MeetingsService
```typescript
// Các method đã tích hợp NotificationsService:
- createBooking()       → notifyNewBookingRequest()
- confirmBooking()      → notifyBookingConfirmed()
- rejectBooking()       → notifyBookingRejected()
- completeMeeting()     → notifyMeetingCompleted()
```

### Future Integration (TODO)
```typescript
// ManagementService
- createComplaint()     → notify coordinators

// ChatService (if implemented)
- sendMessage()         → notifyNewMessage()

// SchedulerService (for reminders)
- checkMeetings24h()    → notifyMeetingReminder24h()
- checkMeetings1h()     → notifyMeetingReminder1h()
```

## 🚀 Deployment Notes

### Environment Variables
```env
# Backend
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# Frontend
REACT_APP_SOCKET_URL=http://localhost:3000/notifications
```

### CORS Configuration
Gateway đã cấu hình CORS cho:
- `http://localhost:3000`
- `http://localhost:5173`

Production cần update `origin` trong `notifications.gateway.ts`:
```typescript
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  },
})
```

### Load Balancing
Nếu deploy nhiều instances, cần Redis adapter:
```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));
```

## 📝 Best Practices

### 1. Connection Management
- ✅ Chỉ tạo 1 socket connection duy nhất
- ✅ Close socket khi component unmount
- ✅ Handle reconnection gracefully

### 2. Error Handling
- ✅ Listen to `connect_error` event
- ✅ Handle authentication errors
- ✅ Show offline/online status

### 3. Performance
- ✅ Limit số lượng notifications load (pagination)
- ✅ Debounce mark as read actions
- ✅ Cache notifications trong memory

### 4. Security
- ✅ Validate JWT token trong mọi WebSocket connection
- ✅ Verify user permission trước khi emit notification
- ✅ Sanitize notification content

### 5. UX
- ✅ Hiển thị toast notification cho events quan trọng
- ✅ Badge với số lượng unread
- ✅ Sound/vibration cho urgent notifications
- ✅ Group notifications by type/time

## 📊 Monitoring

### Metrics cần track:
- Active WebSocket connections
- Notifications sent/received per minute
- Average notification delivery time
- Failed notification deliveries
- Reconnection rate

### Logging:
```typescript
Logger.log(`User ${userId} connected (${onlineCount} online)`);
Logger.log(`Notification sent: ${type} → User ${userId}`);
Logger.error(`Failed to emit notification: ${error.message}`);
```

## 🔄 Future Enhancements

- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Email fallback cho offline users
- [ ] Notification preferences (user settings)
- [ ] Scheduled notifications (reminders)
- [ ] Notification templates
- [ ] Multi-language support
- [ ] Rich notifications (images, actions)
- [ ] Notification history pagination
- [ ] Export notification logs

---

