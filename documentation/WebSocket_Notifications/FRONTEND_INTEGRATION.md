# WebSocket Notifications - Frontend Integration Guide

## 📋 Tổng Quan

Hướng dẫn này giúp team frontend tích hợp Socket.IO client để nhận real-time notifications từ backend.

## 🔧 Cài Đặt

```bash
npm install socket.io-client
# hoặc
yarn add socket.io-client
```

## 🔑 Xác Thực (Authentication)

WebSocket server yêu cầu JWT token trong handshake. Có 2 cách gửi token:

### Cách 1: Query Parameter (Khuyến nghị)
```javascript
import { io } from 'socket.io-client';

const token = localStorage.getItem('accessToken'); // Lấy từ login response
const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: token
  }
});
```

### Cách 2: Authorization Header
```javascript
const socket = io('http://localhost:3000/notifications', {
  extraHeaders: {
    Authorization: `Bearer ${token}`
  }
});
```

## 📡 Kết Nối WebSocket

### React Example

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function NotificationsProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) return;

    // Kết nối WebSocket
    const newSocket = io('http://localhost:3000/notifications', {
      auth: { token }
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });

    // Lắng nghe notifications
    newSocket.on('notification', (payload) => {
      console.log('🔔 New notification:', payload);
      setNotifications(prev => [payload, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Hiển thị toast notification
      showToast(payload.title, payload.message);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ socket, notifications, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}
```

## 🎯 Lắng Nghe Notification Events

### 1. New Booking Request (Tutor nhận)
```javascript
socket.on('notification', (payload) => {
  if (payload.type === 'NEW_BOOKING_REQUEST') {
    // payload.data = { meetingId, studentName, scheduledTime, topic }
    console.log('📅 New booking from', payload.data.studentName);
  }
});
```

### 2. Booking Confirmed (Student nhận)
```javascript
socket.on('notification', (payload) => {
  if (payload.type === 'BOOKING_CONFIRMED') {
    // payload.data = { meetingId, tutorName, scheduledTime }
    console.log('✅ Booking confirmed by', payload.data.tutorName);
  }
});
```

### 3. Booking Rejected (Student nhận)
```javascript
socket.on('notification', (payload) => {
  if (payload.type === 'BOOKING_REJECTED') {
    // payload.data = { meetingId, tutorName, scheduledTime, reason }
    console.log('❌ Booking rejected:', payload.data.reason);
  }
});
```

### 4. Meeting Reminder
```javascript
socket.on('notification', (payload) => {
  if (payload.type === 'MEETING_REMINDER_24H') {
    // payload.data = { meetingId, scheduledTime }
    console.log('⏰ Meeting in 24 hours');
  }
});
```

### 5. Meeting Completed (Student nhận)
```javascript
socket.on('notification', (payload) => {
  if (payload.type === 'MEETING_COMPLETED') {
    // payload.data = { meetingId, tutorName, completedTime }
    console.log('🎉 Meeting completed! Please rate.');
  }
});
```

### 6. System Alert (Tất cả users)
```javascript
socket.on('notification', (payload) => {
  if (payload.type === 'SYSTEM_ALERT') {
    // payload.priority = 'urgent' | 'high' | 'medium' | 'low'
    if (payload.priority === 'urgent') {
      // Hiển thị modal hoặc alert quan trọng
      showUrgentAlert(payload.message);
    }
  }
});
```

## 🔄 Gửi Events Đến Server

### Subscribe to Notifications
```javascript
socket.emit('subscribe', { userId: currentUser.id });
```

### Mark Notification as Read
```javascript
socket.emit('notification:mark_read', { notificationId: 123 });
```

## 📬 REST API Endpoints

Ngoài WebSocket, còn có REST API để quản lý notifications:

### GET /api/notifications
Lấy danh sách notifications (có pagination)
```javascript
const response = await fetch('http://localhost:3000/api/notifications?limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const notifications = await response.json();
```

### GET /api/notifications/unread-count
Lấy số lượng notifications chưa đọc
```javascript
const response = await fetch('http://localhost:3000/api/notifications/unread-count', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { count } = await response.json();
```

### POST /api/notifications/:id/read
Đánh dấu 1 notification đã đọc
```javascript
await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### POST /api/notifications/read-all
Đánh dấu tất cả notifications đã đọc
```javascript
await fetch('http://localhost:3000/api/notifications/read-all', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### DELETE /api/notifications/:id
Xóa 1 notification
```javascript
await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### DELETE /api/notifications/read/all
Xóa tất cả notifications đã đọc
```javascript
await fetch('http://localhost:3000/api/notifications/read/all', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🎨 UI Components Examples

### Notification Badge
```jsx
function NotificationBadge() {
  const { unreadCount } = useNotifications();
  
  return (
    <div className="relative">
      <BellIcon className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}
```

### Notification List
```jsx
function NotificationList() {
  const { notifications } = useNotifications();
  
  return (
    <div className="notification-list">
      {notifications.map(notif => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </div>
  );
}

function NotificationItem({ notification }) {
  const priorityColors = {
    urgent: 'border-red-500',
    high: 'border-orange-500',
    medium: 'border-blue-500',
    low: 'border-gray-300'
  };

  return (
    <div className={`p-4 border-l-4 ${priorityColors[notification.priority]} ${!notification.read ? 'bg-blue-50' : ''}`}>
      <h4 className="font-bold">{notification.title}</h4>
      <p className="text-sm text-gray-600">{notification.message}</p>
      <span className="text-xs text-gray-400">
        {new Date(notification.createdAt).toLocaleString('vi-VN')}
      </span>
    </div>
  );
}
```

### Toast Notification
```jsx
import { toast } from 'react-toastify';

function showToast(title, message) {
  toast.info(
    <div>
      <strong>{title}</strong>
      <p className="text-sm">{message}</p>
    </div>,
    {
      position: "top-right",
      autoClose: 5000,
    }
  );
}
```

## 🐛 Error Handling

```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication error') {
    // Token không hợp lệ hoặc hết hạn
    console.error('❌ Invalid token, redirecting to login...');
    // Redirect to login page
    window.location.href = '/login';
  } else {
    console.error('❌ Connection error:', error.message);
  }
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});
```

## 🔄 Reconnection Strategy

Socket.IO tự động reconnect, nhưng có thể customize:

```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: { token },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Reconnecting...', attemptNumber);
});

socket.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed');
});
```

## 📦 Notification Payload Structure

Tất cả notifications đều có cấu trúc:

```typescript
interface NotificationPayload {
  id: number;
  userId: number;
  type: NotificationEvent; // Enum: NEW_BOOKING_REQUEST, BOOKING_CONFIRMED, etc.
  title: string;
  message: string;
  data?: any; // Optional additional data (meetingId, studentName, etc.)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
}
```

## 🎯 Best Practices

1. **Kết nối một lần**: Chỉ tạo 1 socket connection duy nhất trong app
2. **Cleanup**: Luôn close socket khi component unmount
3. **Error handling**: Xử lý tất cả error events
4. **Token refresh**: Update token trong socket khi refresh JWT
5. **Offline handling**: Hiển thị trạng thái offline/online cho user
6. **Notification persistence**: Combine WebSocket với REST API để load lịch sử

## 🔗 URLs

- **Development**: `http://localhost:3000/notifications`
- **Production**: `https://api.yourdomain.com/notifications`

Cập nhật URL trong environment variables:
```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000/notifications';
```

## ✅ Testing

Test WebSocket connection bằng browser console:

```javascript
// Mở browser console
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => console.log('Connected'));
socket.on('notification', (data) => console.log('Notification:', data));
```

---

