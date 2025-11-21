// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';
import { MyScheduleModule } from './my-schedule/my-schedule.module';
import { MeetingsModule } from './meetings/meetings.module';
import { ManagementModule } from './management/management.module';
import { AcademicModule } from './academic/academic.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExternalModule } from './external/external.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { AIModule } from './ai/ai.module';
import { ReportingModule } from './reporting/report.module';

@Module({
  imports: [
    // Tải .env
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Module Lõi (Prisma)
    CoreModule,
    
    // External APIs (HCMUT_SSO, DATACORE, LIBRARY)
    ExternalModule,
    
    // Các Module Nghiệp vụ
    AuthModule,
    UsersModule,
    TutorsModule,
    MyScheduleModule,
    MeetingsModule,
    ManagementModule,
    AcademicModule,
    NotificationsModule,
    UploadModule,
    EmailModule,
    ReportingModule,
    
    // AI Features (Matching, Chatbot, Content Gen)
    AIModule,
  ],
})
export class AppModule {}
