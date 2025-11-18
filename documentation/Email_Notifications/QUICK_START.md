# 🚀 Phase 2: Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Gmail App Password Setup (2 minutes)
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and generate password
3. Copy the 16-character password

### 2. Configure Environment (1 minute)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@hcmut.edu.vn
SMTP_PASS=your_app_password
EMAIL_FROM="HCMUT Tutor System <your_email@hcmut.edu.vn>"
FRONTEND_URL=http://localhost:3000
```

### 3. Start Server & Test (2 minutes)
```bash
npm run start:dev
```

Open Swagger: `http://localhost:3000/api`

Test endpoints in **Email** section:
- ✅ `/email/test-connection` - Verify SMTP
- ✅ `/email/test-welcome` - Test welcome email
- ✅ `/email/test-confirmation` - Test confirmation
- ✅ `/email/test-rating` - Test rating request
- ✅ `/email/test-complaint` - Test complaint alert

---

## 📧 Email Triggers

| Email Type | Trigger | Code Location |
|------------|---------|---------------|
| Welcome | New user login | `auth.service.ts:67` |
| Confirmation | Tutor confirms booking | `meetings.service.ts:329` |
| Rating Request | Meeting completed | `meetings.service.ts:401` |
| Complaint | Complaint created | `management.service.ts:167` |

---

## 🔧 Common Commands

```bash
# Start development server
npm run start:dev

# Clean rebuild
rm -rf dist && npm run start:dev

# Check logs
# Watch terminal for email logs:
# ✅ Welcome email sent to user@hcmut.edu.vn
```

---

## 🎯 Testing Workflow

### End-to-End Test Scenario

1. **Register New User** → Welcome Email
   ```bash
   POST /auth/login
   Body: { "email": "newuser@hcmut.edu.vn" }
   ```

2. **Create Booking** → No email yet
   ```bash
   POST /meetings/bookings
   ```

3. **Confirm Booking** → Confirmation Email
   ```bash
   POST /meetings/{id}/confirm
   ```

4. **Complete Meeting** → Rating Request Email
   ```bash
   POST /meetings/{id}/complete
   ```

5. **Create Complaint** → Complaint Notification
   ```bash
   POST /management/complaints
   ```

---

## 🐛 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| SMTP timeout | Check firewall, try different network |
| Auth failed | Use App Password, not account password |
| Template not found | Check `templates/emails/` folder exists |
| Variables not replaced | Verify interface property names match |

---

## 📁 Project Structure

```
src/email/
├── email.module.ts       # ✅ Mailer configuration
├── email.service.ts      # ✅ 5 email methods + interfaces
└── email.controller.ts   # ✅ Test endpoints

templates/emails/
├── welcome.hbs           # ✅ Welcome email
├── meeting-confirmation.hbs  # ✅ Confirmation
├── meeting-reminder.hbs  # ✅ Reminder
├── rating-request.hbs    # ✅ Rating request
└── complaint-notification.hbs # ✅ Complaint alert

documentation/Email_Notifications/
├── PHASE2_EMAIL_NOTIFICATIONS.md  # ✅ Full guide
└── QUICK_START.md        # ✅ This file
```

---

## 🎨 Email Template Variables

### Welcome Email
```typescript
{
  fullName: "Nguyễn Văn A",
  email: "user@hcmut.edu.vn",
  role: "STUDENT",
  mssv: "2212345"
}
```

### Meeting Confirmation
```typescript
{
  studentName: "Nguyễn Văn A",
  tutorName: "Trần Thị B",
  meetingDate: "Thứ Hai, 15 tháng 1, 2024",
  meetingTime: "14:00 - 15:00",
  topic: "Hỗ trợ Toán Cao Cấp",
  meetingLink: "http://localhost:3000/meetings/123"
}
```

### Rating Request
```typescript
{
  studentName: "Nguyễn Văn A",
  tutorName: "Trần Thị B",
  meetingDate: "Thứ Hai, 15 tháng 1, 2024",
  meetingTime: "14:00 - 15:00",
  topic: "Hỗ trợ Toán Cao Cấp",
  ratingLink: "http://localhost:3000/meetings/123/rating"
}
```

### Complaint Notification
```typescript
{
  coordinatorName: "Phạm Văn C",
  studentName: "Nguyễn Văn A",
  studentEmail: "student@hcmut.edu.vn",
  description: "Complaint description...",
  complaintId: "42",
  createdAt: "15 tháng 1, 2024, 10:30",
  dashboardLink: "http://localhost:3000/management/complaints/42",
  meetingInfo: "Meeting ID 123 với tutor Trần Thị B"
}
```

---

## 📊 Success Indicators

### How to know emails are working?

1. **Server logs show**:
   ```
   ✅ Welcome email sent to user@hcmut.edu.vn
   ✅ Meeting confirmation sent to student@hcmut.edu.vn
   ```

2. **Test endpoint returns**:
   ```json
   {
     "status": "success",
     "message": "Test welcome email sent! Check your inbox."
   }
   ```

3. **Email received in inbox**:
   - Check Primary, Social, Promotions tabs
   - Professional HTML layout with gradients
   - Dynamic content populated correctly
   - Links work and redirect to frontend

---

## 🎓 Next Steps

After Phase 2 is tested and working:

1. **Phase 2.5** (Optional): Scheduled meeting reminders
   - Install `@nestjs/schedule`
   - Create cron job to check upcoming meetings
   - Send reminders 24h before

2. **Phase 3** (Future): Email queue system
   - Install Bull/BullMQ
   - Queue emails for reliable delivery
   - Retry failed emails automatically

3. **Production Deployment**:
   - Update SMTP credentials for production Gmail account
   - Configure proper FRONTEND_URL
   - Enable email logging/monitoring
   - Set up email delivery tracking

---

**Status**: ✅ Ready for Testing
