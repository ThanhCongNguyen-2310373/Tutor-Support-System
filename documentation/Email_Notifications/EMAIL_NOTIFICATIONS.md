# 📧 Phase 2: Email Notifications with Gmail SMTP

## 📚 Table of Contents
1. [Overview](#overview)
2. [Email Types](#email-types)
3. [Setup Instructions](#setup-instructions)
4. [Architecture](#architecture)
5. [Gmail SMTP Configuration](#gmail-smtp-configuration)
6. [Email Templates](#email-templates)
7. [Integration Points](#integration-points)

---

## Overview

Phase 2 implements a comprehensive email notification system using **Gmail SMTP** and **Handlebars templates**. The system automatically sends emails for key events in the tutoring workflow.

### Key Features
- ✅ 5 email types with professional HTML templates
- ✅ Gmail SMTP integration (port 587, STARTTLS)
- ✅ Handlebars template engine for dynamic content
- ✅ Role-based email content (Student vs Tutor)
- ✅ Responsive email design
- ✅ Automatic trigger on business events
- ✅ Error handling with logging

---

## Email Types

### 1. **Welcome Email** 🎓
- **Trigger**: New user registration/creation
- **Recipient**: New user
- **Content**: Welcome message, role-specific introduction, platform features
- **Template**: `templates/emails/welcome.hbs`
- **Service Method**: `EmailService.sendWelcomeEmail()`

### 2. **Meeting Confirmation** ✅
- **Trigger**: Tutor confirms student booking
- **Recipient**: Student
- **Content**: Meeting details, tutor info, preparation checklist
- **Template**: `templates/emails/meeting-confirmation.hbs`
- **Service Method**: `EmailService.sendMeetingConfirmation()`

### 3. **Meeting Reminder** ⏰
- **Trigger**: 24 hours before meeting (scheduled job - future implementation)
- **Recipient**: Both student and tutor
- **Content**: Urgent reminder, meeting details, role-specific tips
- **Template**: `templates/emails/meeting-reminder.hbs`
- **Service Method**: `EmailService.sendMeetingReminder()`

### 4. **Rating Request** ⭐
- **Trigger**: Tutor marks meeting as completed
- **Recipient**: Student
- **Content**: Request for feedback, rating link, meeting summary
- **Template**: `templates/emails/rating-request.hbs`
- **Service Method**: `EmailService.sendRatingRequest()`

### 5. **Complaint Notification** 🚨
- **Trigger**: Student creates complaint
- **Recipient**: All coordinators
- **Content**: Complaint details, student info, action dashboard link
- **Template**: `templates/emails/complaint-notification.hbs`
- **Service Method**: `EmailService.sendComplaintNotification()`

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install @nestjs-modules/mailer nodemailer handlebars
npm install -D @types/nodemailer
```

**Packages installed:**
- `@nestjs-modules/mailer@1.x` - NestJS email integration
- `nodemailer@6.x` - SMTP client for Node.js
- `handlebars@4.x` - Template engine
- `@types/nodemailer` - TypeScript definitions

### Step 2: Configure Gmail SMTP

Add to `.env` file:

```env
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail@hcmut.edu.vn
SMTP_PASS=your_app_password
EMAIL_FROM="HCMUT Tutor System <your_gmail@hcmut.edu.vn>"

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Generate Gmail App Password

1. Go to Google Account settings
2. Enable 2-Step Verification
3. Go to **Security** > **App passwords**
4. Generate password for "Mail" app
5. Copy the 16-character password to `SMTP_PASS`

**Example**: `abcd efgh ijkl mnop` (spaces are ignored)

### Step 4: Import EmailModule

In `app.module.ts`:

```typescript
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // ... other modules
    EmailModule,
  ],
})
export class AppModule {}
```

---

## Architecture

### File Structure

```
src/
├── email/
│   ├── email.module.ts          # Email module configuration
│   ├── email.service.ts         # Email sending logic + interfaces
│   └── email.controller.ts      # Test endpoints
templates/
├── emails/
│   ├── welcome.hbs              # Welcome email template
│   ├── meeting-confirmation.hbs # Confirmation template
│   ├── meeting-reminder.hbs     # Reminder template
│   ├── rating-request.hbs       # Rating request template
│   └── complaint-notification.hbs # Complaint alert template
```

### EmailModule Configuration

```typescript
MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    transport: {
      host: configService.get<string>('SMTP_HOST'),
      port: configService.get<number>('SMTP_PORT'),
      secure: false, // STARTTLS
      auth: {
        user: configService.get<string>('SMTP_USER'),
        pass: configService.get<string>('SMTP_PASS'),
      },
    },
    defaults: {
      from: configService.get<string>('EMAIL_FROM'),
    },
    template: {
      dir: join(__dirname, '..', '..', 'templates', 'emails'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
})
```

---

## 🔐 Gmail SMTP Configuration

### Connection Details
- **Host**: `smtp.gmail.com`
- **Port**: `587` (STARTTLS)
- **Security**: TLS/STARTTLS (not SSL)
- **Authentication**: OAuth2 or App Password

### Why Port 587?
- **Port 587**: STARTTLS (recommended, more reliable)
- Port 465: SSL/TLS (legacy, some ISPs block)
- Port 25: Plain (not recommended, blocked by Gmail)

### Security Best Practices
1. ✅ Use **App Passwords** (not account password)
2. ✅ Enable 2-Factor Authentication
3. ✅ Store credentials in `.env` (not in code)
4. ✅ Add `.env` to `.gitignore`
5. ✅ Use different accounts for dev/prod

### Testing SMTP Connection

```bash
# Via Swagger UI
GET http://localhost:3000/email/test-connection

# Or via code
await emailService.testConnection();
```

---

## Email Templates

### Template Design Features

All templates share these design elements:

1. **Professional Layout**
   - Gradient header with emojis
   - Clean white content area
   - Consistent branding (HCMUT colors)
   - Responsive design

2. **Dynamic Content**
   - Handlebars variables: `{{fullName}}`, `{{meetingDate}}`, etc.
   - Conditional sections: `{{#if role}}...{{/if}}`
   - Role-based content (Student vs Tutor)

3. **Visual Elements**
   - Emoji icons for visual appeal
   - Colored badges/boxes for important info
   - Call-to-action buttons
   - Consistent footer with school info

### Template Variables

#### Welcome Email
```typescript
{
  fullName: string;
  email: string;
  role: 'STUDENT' | 'TUTOR' | 'COORDINATOR' | 'ADMIN';
  mssv: string;
}
```

#### Meeting Confirmation
```typescript
{
  studentName: string;
  tutorName: string;
  meetingDate: string;
  meetingTime: string;
  topic: string;
  meetingLink: string;
}
```

#### Rating Request
```typescript
{
  studentName: string;
  tutorName: string;
  meetingDate: string;
  meetingTime: string;
  topic: string;
  ratingLink: string;
}
```

#### Complaint Notification
```typescript
{
  coordinatorName: string;
  studentName: string;
  studentEmail: string;
  description: string;
  complaintId: string;
  createdAt: string;
  dashboardLink: string;
  meetingInfo: string;
}
```

---

## Integration Points

### 1. Auth Service (Welcome Email)

**File**: `src/auth/auth.service.ts`

```typescript
import { EmailService } from '../email/email.service';

constructor(
  private emailService: EmailService,
) {}

async login(loginDto: LoginDto) {
  // ... SSO authentication logic ...

  if (!user) {
    // Create new user
    user = await this.prisma.user.create({...});

    // Send welcome email (non-blocking)
    this.emailService.sendWelcomeEmail(user.email, {
      fullName: user.fullName || 'User',
      email: user.email,
      role: user.role,
      mssv: user.mssv || 'N/A',
    }).catch(err => {
      this.logger.error(`Failed to send welcome email:`, err.message);
    });
  }
}
```

### 2. Meetings Service (Confirmation & Rating)

**File**: `src/meetings/meetings.service.ts`

```typescript
import { EmailService } from '../email/email.service';

constructor(
  private prisma: PrismaService,
  private emailService: EmailService,
) {}

// Meeting Confirmation
async confirmBooking(tutorUserId: number, meetingId: number) {
  const updatedMeeting = await this.prisma.meeting.update({
    data: { status: MeetingStatus.CONFIRMED },
  });

  // Send confirmation email
  this.emailService.sendMeetingConfirmation(meeting.student.email, {
    studentName: meeting.student.fullName,
    tutorName: meeting.tutor.user.fullName,
    meetingDate: meeting.startTime.toLocaleDateString('vi-VN'),
    meetingTime: `${meeting.startTime.toLocaleTimeString('vi-VN')} - ${meeting.endTime.toLocaleTimeString('vi-VN')}`,
    topic: meeting.topic || 'Không có chủ đề cụ thể',
    meetingLink: `${process.env.FRONTEND_URL}/meetings/${meetingId}`,
  }).catch(err => console.error(err));

  return updatedMeeting;
}

// Rating Request
async completeMeeting(userId: number, role: Role, meetingId: number) {
  const updatedMeeting = await this.prisma.meeting.update({
    data: { status: MeetingStatus.COMPLETED },
  });

  // Send rating request
  this.emailService.sendRatingRequest(meeting.student.email, {
    studentName: meeting.student.fullName,
    tutorName: meeting.tutor.user.fullName,
    meetingDate: meeting.startTime.toLocaleDateString('vi-VN'),
    meetingTime: `${meeting.startTime.toLocaleTimeString('vi-VN')}`,
    topic: meeting.topic || 'Không có chủ đề cụ thể',
    ratingLink: `${process.env.FRONTEND_URL}/meetings/${meetingId}/rating`,
  }).catch(err => console.error(err));

  return updatedMeeting;
}
```

### 3. Management Service (Complaint Notification)

**File**: `src/management/management.service.ts`

```typescript
import { EmailService } from '../email/email.service';

constructor(
  private prisma: PrismaService,
  private emailService: EmailService,
) {}

async createComplaint(userId: number, role: Role, dto: CreateComplaintDto) {
  const complaint = await this.prisma.complaint.create({...});

  // Send notification to all coordinators
  this.notifyCoordinatorsOfComplaint(complaint).catch(err => {
    console.error('Failed to send complaint notification emails:', err.message);
  });

  return complaint;
}

private async notifyCoordinatorsOfComplaint(complaint: any) {
  const coordinators = await this.prisma.user.findMany({
    where: { role: Role.COORDINATOR },
  });

  const emailPromises = coordinators.map(coordinator =>
    this.emailService.sendComplaintNotification(coordinator.email, {
      coordinatorName: coordinator.fullName,
      studentName: complaint.student.fullName,
      studentEmail: complaint.student.email,
      description: complaint.description,
      complaintId: complaint.id.toString(),
      createdAt: complaint.createdAt.toLocaleString('vi-VN'),
      dashboardLink: `${process.env.FRONTEND_URL}/management/complaints/${complaint.id}`,
      meetingInfo: complaint.meeting ? `Meeting ID ${complaint.meeting.id}` : 'N/A',
    })
  );

  await Promise.allSettled(emailPromises);
}
```

---

**Status**: ✅ Complete
