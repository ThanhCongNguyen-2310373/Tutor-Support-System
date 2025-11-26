# 🧪 COMPREHENSIVE TESTING GUIDE
## Tutor Support System - All Phases

---

## 📋 Mục Lục

1. [Chuẩn Bị Testing](#chuẩn-bị-testing)
2. [Phase 1: Meetings Lifecycle](#phase-1-meetings-lifecycle)
3. [Phase 2: Dashboards & Notifications](#phase-2-dashboards--notifications)
4. [Phase 3: Tutor Features](#phase-3-tutor-features)
5. [Phase 4: Library Integration](#phase-4-library-integration)
6. [Phase 5: Management & Reporting](#phase-5-management--reporting)
7. [Phase 6: AI Chatbot](#phase-6-ai-chatbot)
8. [WebSocket Notifications](#websocket-notifications)
9. [Troubleshooting](#troubleshooting)

---

## Chuẩn Bị Testing

### 1. **Cài đặt Dependencies**

```bash
cd frontend
npm install socket.io-client
```

### 2. **Khởi động Backend**

```bash
# Terminal 1
cd D:\HK251\CNPM\BTL\Sub3\TutorSupportSystem
npm run start:dev
```

✅ Kiểm tra: Backend chạy tại `http://localhost:3000`

### 3. **Khởi động Frontend**

```bash
# Terminal 2
cd D:\HK251\CNPM\BTL\Sub3\TutorSupportSystem\frontend
npm start
```

✅ Kiểm tra: Frontend chạy tại `http://localhost:3000` (hoặc port khác nếu 3000 đã dùng)

### 4. **Chuẩn bị Test Data**

- Tạo ít nhất 2 accounts: 1 Student, 1 Tutor
- Login và lấy JWT token từ localStorage
- Mở Browser DevTools (F12) để xem Console và Network

---

## Phase 1: Meetings Lifecycle

### **Objective**: Test booking workflow and rating system

### Test Case 1: View Sessions
**Steps:**
1. Login as Student
2. Navigate to `/sessions`
3. Verify session list loads

**Expected:**
- ✅ Sessions displayed in card layout
- ✅ Each card shows: subject, tutor name, date, time, status, location
- ✅ Status badges with colors (PENDING=yellow, CONFIRMED=green, COMPLETED=blue, CANCELLED=red)

---

### Test Case 2: View Session Detail
**Steps:**
1. Click on any session card
2. Redirected to `/sessions/:id`

**Expected:**
- ✅ Session details page loads
- ✅ Shows full information: tutor, date, time, location, notes, status
- ✅ Action buttons visible based on status:
  - PENDING: Cancel button
  - CONFIRMED: Complete button
  - COMPLETED: Rate button (if not rated)

---

### Test Case 3: Cancel Session
**Steps:**
1. Go to session detail with PENDING status
2. Click "Hủy buổi học"
3. Confirm cancellation

**Expected:**
- ✅ Confirmation modal appears
- ✅ After confirm: success toast
- ✅ Status changes to CANCELLED
- ✅ Page reloads or updates

**API Call:** `PATCH /meetings/:id/status` with `{ status: 'CANCELLED' }`

---

### Test Case 4: Complete Session
**Steps:**
1. Go to session detail with CONFIRMED status
2. Click "Hoàn thành"
3. Confirm completion

**Expected:**
- ✅ Success toast
- ✅ Status changes to COMPLETED
- ✅ "Đánh giá" button appears

**API Call:** `PATCH /meetings/:id/status` with `{ status: 'COMPLETED' }`

---

### Test Case 5: Rate Tutor
**Steps:**
1. Go to completed session (not yet rated)
2. Click "Đánh giá"
3. Rating modal opens
4. Select star rating (1-5)
5. Enter comment (optional)
6. Click "Gửi đánh giá"

**Expected:**
- ✅ Modal opens with star selector
- ✅ Stars are clickable and highlight on hover
- ✅ Comment textarea available
- ✅ Submit button disabled if no rating selected
- ✅ After submit: success toast
- ✅ Modal closes
- ✅ Rating button disappears (already rated)

**API Call:** `POST /ratings` with `{ meetingId, tutorId, rating, comment }`

**Validation:**
- ❌ Cannot rate without selecting stars
- ✅ Can rate without comment
- ✅ Cannot rate same session twice

---

### Test Case 6: View Confirmed Schedule
**Steps:**
1. Navigate to `/sessions/schedule`
2. View confirmed sessions calendar

**Expected:**
- ✅ Calendar view with confirmed sessions
- ✅ Sessions grouped by date
- ✅ Shows time, subject, tutor

---

## Phase 2: Dashboards & Notifications

### **Objective**: Test dashboard cards and notification badge

### Test Case 1: Student Dashboard
**Steps:**
1. Login as Student
2. Navigate to `/dashboard/student`

**Expected:**
- ✅ 3 cards displayed:
  1. "Đặt lịch học" → /register
  2. "Lịch học của tôi" → /sessions
  3. "Thư viện" → /library
- ✅ Cards have hover effect
- ✅ Icons displayed correctly

---

### Test Case 2: Tutor Dashboard
**Steps:**
1. Login as Tutor
2. Navigate to `/dashboard/tutor`

**Expected:**
- ✅ 3 cards displayed:
  1. "Quản lý lịch trống" → /dashboard/tutor/availability
  2. "Học sinh của tôi" → /dashboard/tutor/students
  3. "Lịch học" → /sessions
- ✅ Cards styled with different colors

---

### Test Case 3: Admin Dashboard
**Steps:**
1. Login as Admin
2. Navigate to `/dashboard/admin`

**Expected:**
- ✅ 2 cards displayed:
  1. "Duyệt giảng viên" → /dashboard/admin/tutor-approval
  2. "Báo cáo OAA" → /dashboard/oaa/report

---

### Test Case 4: Notification Badge
**Steps:**
1. Open Navbar component
2. Check notification bell icon

**Expected:**
- ✅ Bell icon visible in navbar
- ✅ Red badge shows unread count (if any)
- ✅ Click bell → redirects to `/noti`

**API Call:** `GET /notifications` (loads unread count on mount)

---

### Test Case 5: Mark Notification as Read
**Steps:**
1. Go to `/noti`
2. Click on unread notification (blue background)

**Expected:**
- ✅ Background changes to white (read state)
- ✅ Unread count decreases
- ✅ Toast: "Đánh dấu đã đọc"

**API Call:** `PATCH /notifications/:id/read`

---

## Phase 3: Tutor Features

### **Objective**: Test availability management and student tracking

### Test Case 1: View Availability
**Steps:**
1. Login as Tutor
2. Navigate to `/dashboard/tutor/availability`

**Expected:**
- ✅ Weekly calendar displayed (7 columns: Mon-Sun)
- ✅ Existing time slots shown as cards
- ✅ Each slot shows: day, time range, delete button
- ✅ "Thêm lịch trống" button visible

**API Call:** `GET /tutors/me/availability`

---

### Test Case 2: Add Availability Slot
**Steps:**
1. Click "Thêm lịch trống"
2. Modal opens
3. Select day of week (dropdown)
4. Enter start time (input time)
5. Enter end time (input time)
6. Click "Thêm"

**Expected:**
- ✅ Modal opens with form
- ✅ Day dropdown has 7 options (Mon-Sun in Vietnamese)
- ✅ Time inputs work correctly
- ✅ After submit: success toast
- ✅ New slot appears in calendar
- ✅ Modal closes

**API Call:** `POST /tutors/me/availability` with `{ dayOfWeek, startTime, endTime }`

**Validation:**
- ❌ End time must be after start time
- ❌ Cannot overlap existing slots

---

### Test Case 3: Delete Availability Slot
**Steps:**
1. Click delete icon (trash) on any slot
2. Confirm deletion

**Expected:**
- ✅ Confirmation alert
- ✅ After confirm: slot removed from calendar
- ✅ Success toast

**API Call:** `DELETE /tutors/me/availability/:id`

---

### Test Case 4: View My Students
**Steps:**
1. Login as Tutor
2. Navigate to `/dashboard/tutor/students`

**Expected:**
- ✅ Student cards displayed in grid
- ✅ Each card shows:
  - Avatar (first letter of name)
  - Student name
  - Major badge
  - 3 stats: total meetings, total hours, completed sessions
- ✅ "Ghi nhận tiến độ" button on each card

**API Call:** `GET /tutors/me/students`

---

### Test Case 5: Record Student Progress
**Steps:**
1. Click "Ghi nhận tiến độ" on any student card
2. Modal opens
3. Enter achievements (textarea - required)
4. Enter difficulties (textarea - optional)
5. Enter suggestions (textarea - optional)
6. Click "Lưu"

**Expected:**
- ✅ Modal opens with form
- ✅ Achievements field required (red border if empty)
- ✅ After submit: success toast
- ✅ Modal closes
- ✅ Student data reloads

**API Call:** `POST /tutors/students/:id/progress` with `{ achievements, difficulties, suggestions }`

**Validation:**
- ❌ Cannot submit without achievements
- ✅ Can submit without difficulties/suggestions

---

## Phase 4: Library Integration

### **Objective**: Test HCMUT Library API integration

### Test Case 1: View Library Page
**Steps:**
1. Navigate to `/library`

**Expected:**
- ✅ 3 tabs displayed: "Tìm kiếm", "Phổ biến", "Đề xuất"
- ✅ "Tìm kiếm" tab active by default
- ✅ Search bar visible

---

### Test Case 2: Search Documents
**Steps:**
1. Enter search query in search bar (e.g., "Calculus")
2. Click search button (magnifying glass)

**Expected:**
- ✅ Loading state appears
- ✅ Search results displayed as cards
- ✅ Each card shows: title, author, year, status badge
- ✅ Status badges: Green (Available), Red (Unavailable)
- ✅ Click card → opens document URL in new tab

**API Call:** `GET /external/library/search?query=Calculus&page=1&limit=20`

**Edge Cases:**
- ✅ No results → "Không tìm thấy tài liệu"
- ✅ API error → Error toast

---

### Test Case 3: View Popular Documents
**Steps:**
1. Click "Phổ biến" tab

**Expected:**
- ✅ Tab becomes active (underline)
- ✅ Popular documents displayed
- ✅ Documents sorted by popularity

**API Call:** `GET /external/library/popular?limit=20`

---

### Test Case 4: View Recommendations
**Steps:**
1. Click "Đề xuất" tab

**Expected:**
- ✅ Tab active
- ✅ Recommended documents based on user profile
- ✅ Documents clickable

**API Call:** `GET /external/library/recommendations`

---

### Test Case 5: Open Document
**Steps:**
1. Click any document card

**Expected:**
- ✅ New tab opens with document URL
- ✅ If URL invalid → stays on same page

**API Call:** `GET /external/library/document-url/:id`

---

## Phase 5: Management & Reporting

### **Objective**: Test admin approval workflow and reports

### Test Case 1: View Tutor Applications
**Steps:**
1. Login as Admin
2. Navigate to `/dashboard/admin/tutor-approval`

**Expected:**
- ✅ Loading state: "Đang tải..."
- ✅ Application cards displayed
- ✅ Each card shows: name, MSSV, faculty, subject, GPA, proposer, status
- ✅ Checkboxes for each application
- ✅ "Duyệt Tutor" and "Từ chối" buttons at bottom

**API Call:** `GET /management/applications?status=PENDING`

---

### Test Case 2: Approve Applications (Single)
**Steps:**
1. Check 1 application checkbox
2. Click "Duyệt Tutor"
3. Confirm approval

**Expected:**
- ✅ Confirmation modal
- ✅ After confirm: success toast "Đã duyệt 1 ứng viên!"
- ✅ Application removed from list
- ✅ Data reloads

**API Call:** `POST /management/applications/:id/approve`

---

### Test Case 3: Approve Applications (Multiple)
**Steps:**
1. Check 3 applications
2. Click "Duyệt Tutor"
3. Confirm

**Expected:**
- ✅ Toast: "Đã duyệt 3 ứng viên!"
- ✅ All 3 applications approved
- ✅ Removed from list

**API Call:** `Promise.all` with 3 approve calls

---

### Test Case 4: Reject Applications
**Steps:**
1. Select 1 or more applications
2. Click "Từ chối"
3. Confirm rejection

**Expected:**
- ✅ Confirmation alert
- ✅ After confirm: success toast
- ✅ Applications removed
- ✅ Reason sent: "Không đủ điều kiện"

**API Call:** `POST /management/applications/:id/reject` with `{ reason: "Không đủ điều kiện" }`

---

### Test Case 5: Filter Applications
**Steps:**
1. Use faculty dropdown
2. Use semester dropdown
3. Use class input

**Expected:**
- ✅ Applications filtered client-side
- ✅ Filters work correctly
- ✅ Multiple filters can be combined

---

### Test Case 6: Search Applications
**Steps:**
1. Enter search term (name or MSSV)
2. Results filter in real-time

**Expected:**
- ✅ Search works instantly (no API call)
- ✅ Matches name or MSSV
- ✅ Case-insensitive

---

### Test Case 7: OSA Scholarship Report
**Steps:**
1. Login as OSA role
2. Navigate to `/dashboard/osa`

**Expected:**
- ✅ Loading state shown
- ✅ 2 tables displayed:
  1. Eligible Tutors (GPA ≥ 3.0, Hours ≥ 20)
  2. Eligible Learners (GPA ≥ 3.5)
- ✅ Tables show: MSSV, name, GPA, hours/sessions
- ✅ Empty state if no data: "Không có tutor/học sinh nào đủ điều kiện"

**API Calls:**
- `GET /reports/osa/scholarship/tutors?minGpa=3.0&minHours=20`
- `GET /reports/osa/scholarship/learners?minGpa=3.5`

---

## Phase 6: AI Chatbot

### **Objective**: Test chatbot functionality

### Test Case 1: Open Chatbot
**Steps:**
1. Look for floating purple button at bottom-right
2. Click button

**Expected:**
- ✅ Floating button visible (purple gradient circle)
- ✅ Button has message icon
- ✅ After click: chatbot window opens
- ✅ Floating button disappears

---

### Test Case 2: View Chat History
**Steps:**
1. Open chatbot
2. Wait for history to load

**Expected:**
- ✅ Previous messages displayed (if any)
- ✅ If no history: welcome message
  - "Xin chào! Tôi là trợ lý AI của hệ thống Tutor Support. Tôi có thể giúp gì cho bạn?"
- ✅ Messages grouped by sender (user=right, bot=left)
- ✅ Each message shows timestamp

**API Call:** `GET /ai/chatbot/history`

---

### Test Case 3: Send Message
**Steps:**
1. Type message in input box (e.g., "Làm thế nào để đặt lịch?")
2. Click send button (paper plane icon)

**Expected:**
- ✅ Message appears in chat (right side, purple gradient)
- ✅ Input clears
- ✅ Loading indicator: "Đang trả lời..." with spinner
- ✅ Bot response appears (left side, white background)
- ✅ Timestamps shown
- ✅ Auto-scroll to bottom

**API Call:** `POST /ai/chat` with `{ message: "..." }`

**Validation:**
- ❌ Cannot send empty message
- ❌ Send button disabled while loading

---

### Test Case 4: Clear Chat History
**Steps:**
1. Click trash icon in header
2. Confirm deletion

**Expected:**
- ✅ Confirmation alert
- ✅ After confirm: all messages cleared
- ✅ New welcome message appears
- ✅ Success toast (optional)

**API Call:** `DELETE /ai/chatbot/history`

---

### Test Case 5: Close Chatbot
**Steps:**
1. Click X icon in header

**Expected:**
- ✅ Chatbot window closes
- ✅ Floating button reappears
- ✅ Chat history preserved (will reload on reopen)

---

### Test Case 6: Chatbot Responsiveness
**Steps:**
1. Resize browser to mobile size
2. Open chatbot

**Expected:**
- ✅ Chatbot fills screen (minus small margins)
- ✅ All features still work
- ✅ Messages wrap correctly
- ✅ Input and send button responsive

---

## WebSocket Notifications

### **Objective**: Test real-time notifications

### Test Case 1: WebSocket Connection
**Steps:**
1. Login
2. Open Browser DevTools → Console
3. Check for connection logs

**Expected:**
- ✅ Console: "✅ WebSocket connected: [socket-id]"
- ✅ Console: "✅ Connection success: { userId: ... }"
- ❌ No connection errors

**Connection URL:** `http://localhost:3000/notifications`

---

### Test Case 2: Receive Notification
**Steps:**
1. Keep browser open and logged in
2. Trigger notification event from another client (e.g., create booking)
3. Watch for toast notification

**Expected:**
- ✅ Toast appears automatically (no refresh needed)
- ✅ Toast shows notification message
- ✅ Unread count in navbar increases
- ✅ Console: "🔔 New notification received: ..."

**Event:** `notification` from WebSocket

---

### Test Case 3: Notification Priority Levels
**Steps:**
1. Trigger notifications with different priorities
2. Check toast colors

**Expected:**
- ✅ `urgent` → Red toast (error)
- ✅ `high` → Orange toast (warning)
- ✅ `medium` / `low` → Blue toast (info)

---

### Test Case 4: Disconnect & Reconnect
**Steps:**
1. Stop backend server (Ctrl+C)
2. Check console logs
3. Restart backend
4. Wait 5 seconds

**Expected:**
- ✅ Console: "❌ WebSocket disconnected: ..."
- ✅ After restart: "✅ WebSocket connected: ..."
- ✅ Auto-reconnect works (Socket.IO default)

---

### Test Case 5: Multiple Tabs
**Steps:**
1. Open 2 browser tabs with same user
2. Trigger notification in backend

**Expected:**
- ✅ Both tabs receive notification
- ✅ Both show toast
- ✅ Unread count syncs (may need refresh for badge sync)

---

## Troubleshooting

### Issue 1: Frontend không compile
**Symptoms:**
- Webpack errors
- "Module not found"

**Solutions:**
```bash
# Clear cache
cd frontend
Remove-Item -Recurse -Force node_modules\.cache

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

# Restart
npm start
```

---

### Issue 2: Backend API không hoạt động
**Symptoms:**
- 404 errors
- Network failed

**Solutions:**
1. Check backend is running: `http://localhost:3000/api`
2. Check Prisma migrations:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
3. Check database connection in `.env`

---

### Issue 3: WebSocket không kết nối
**Symptoms:**
- Console: "Connection error"
- No real-time notifications

**Solutions:**
1. Check backend has WebSocket gateway running
2. Verify JWT token in localStorage:
   ```javascript
   console.log(localStorage.getItem('accessToken'))
   ```
3. Check CORS settings in backend `notifications.gateway.ts`
4. Try manual connection in console:
   ```javascript
   const { io } = require('socket.io-client');
   const socket = io('http://localhost:3000/notifications', {
     auth: { token: 'YOUR_TOKEN' }
   });
   socket.on('connect', () => console.log('Connected!'));
   ```

---

### Issue 4: Chatbot không trả lời
**Symptoms:**
- Loading forever
- Error toast

**Solutions:**
1. Check backend AI module exists at `/ai/chat`
2. Check if AI service is properly initialized
3. Fallback: Mock response in `ai.service.js`:
   ```javascript
   chat: async (message) => {
     return { data: { message: "Tôi đã nhận được: " + message } };
   }
   ```

---

### Issue 5: Library search không có kết quả
**Symptoms:**
- "Không tìm thấy tài liệu" mặc dù có data

**Solutions:**
1. Check if external library API is accessible
2. Test endpoint directly:
   ```bash
   curl http://localhost:3000/external/library/search?query=Calculus
   ```
3. Check HCMUT Library service status
4. Mock data for testing:
   ```javascript
   // In external.service.js
   searchLibrary: async (query) => {
     return { data: [
       { id: 1, title: 'Test Book', author: 'Author', year: 2024 }
     ]};
   }
   ```

---

### Issue 6: Notifications badge không cập nhật
**Symptoms:**
- Badge shows wrong count
- Doesn't update after marking read

**Solutions:**
1. Force reload: `window.location.reload()`
2. Check Redux store:
   ```javascript
   // In browser console
   console.log(store.getState().notifications)
   ```
3. Verify API call returns updated count:
   ```javascript
   // Check Network tab → /notifications
   ```

---

## Testing Checklist Summary

### Phase 1: Meetings ✅
- [ ] View sessions list
- [ ] View session detail
- [ ] Cancel session
- [ ] Complete session
- [ ] Rate tutor (modal)
- [ ] View confirmed schedule

### Phase 2: Dashboards ✅
- [ ] Student dashboard (3 cards)
- [ ] Tutor dashboard (3 cards)
- [ ] Admin dashboard (2 cards)
- [ ] Notification badge
- [ ] Mark notification read

### Phase 3: Tutor Features ✅
- [ ] View availability calendar
- [ ] Add time slot
- [ ] Delete time slot
- [ ] View my students
- [ ] Record student progress

### Phase 4: Library ✅
- [ ] Search documents
- [ ] View popular documents
- [ ] View recommendations
- [ ] Open document URL

### Phase 5: Management ✅
- [ ] View applications
- [ ] Approve single
- [ ] Approve multiple
- [ ] Reject applications
- [ ] Filter applications
- [ ] OSA scholarship reports

### Phase 6: AI Chatbot ✅
- [ ] Open chatbot
- [ ] View history
- [ ] Send message
- [ ] Receive response
- [ ] Clear history
- [ ] Close chatbot

### WebSocket ✅
- [ ] Connect on login
- [ ] Receive real-time notification
- [ ] Toast notification
- [ ] Auto-reconnect
- [ ] Multi-tab support

---

**Status:** Production-ready testing guide
