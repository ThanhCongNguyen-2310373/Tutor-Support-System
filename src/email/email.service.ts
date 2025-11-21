// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface WelcomeEmailData {
  fullName: string;
  email: string;
  role: string;
  mssv: string;
}

export interface MeetingConfirmationData {
  studentName: string;
  tutorName: string;
  meetingDate: string;
  meetingTime: string;
  topic: string;
  meetingLink: string;
  location?: string;
}

export interface MeetingReminderData {
  recipientName: string;
  role: 'student' | 'tutor';
  meetingDate: string;
  meetingTime: string;
  topic: string;
  location?: string;
  withWhom: string; // Tên người còn lại
}

export interface RatingRequestData {
  studentName: string;
  tutorName: string;
  meetingDate: string;
  meetingTime: string;
  topic: string;
  ratingLink: string;
}

export interface ComplaintNotificationData {
  coordinatorName: string;
  studentName: string;
  studentEmail: string;
  description: string;
  complaintId: string;
  createdAt: string;
  dashboardLink: string;
  meetingInfo: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}




//############################################################
//## 1. Welcome Email - Gửi khi user đăng ký hoặc được tạo ###
//############################################################
	async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<void> {
	  try {
		await this.mailerService.sendMail({
		  to,
		  subject: '🎓 Chào mừng đến với HCMUT Tutor Support System',
		  html: `
		    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
		      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
		        <h1 style="color: #667eea;">Chào mừng ${data.fullName}!</h1>
		        <p>Email: <strong>${data.email}</strong></p>
		        <p>Vai trò: <strong>${data.role}</strong></p>
		        <p>MSSV: <strong>${data.mssv}</strong></p>
		        <p style="margin-top: 20px; color: #666;">Cảm ơn bạn đã tham gia hệ thống!</p>
		      </div>
		    </div>
		  `,
		});
		this.logger.log(`Welcome email sent to ${to}`);
	  } catch (error) {
		this.logger.error(`Failed to send welcome email to ${to}:`, error.message);
	  }
	}



  
//##############################################################
//## 2. Meeting Confirmation - Gửi khi Tutor confirm booking ###
//##############################################################
  async sendMeetingConfirmation(
    to: string,
    data: MeetingConfirmationData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '✅ Buổi hẹn của bạn đã được xác nhận',
        template: 'meeting-confirmation',
        context: data,
      });
      this.logger.log(`Meeting confirmation sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send meeting confirmation to ${to}:`, error.message);
      // Don't throw - email is non-critical
    }
  }


  

//####################################################
//##  3. Meeting Reminder - Gửi 24h trước buổi hẹn ###
//####################################################
  async sendMeetingReminder(
    to: string,
    data: MeetingReminderData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '⏰ Nhắc nhở: Buổi hẹn của bạn vào ngày mai',
        template: 'meeting-reminder',
        context: data,
      });
      this.logger.log(`Meeting reminder sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send meeting reminder to ${to}:`, error.message);
      // Don't throw - email is non-critical
    }
  }




//########################################################
//## 4. Rating Request - Gửi sau khi meeting completed ###
//########################################################
  async sendRatingRequest(to: string, data: RatingRequestData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '⭐ Đánh giá buổi học của bạn',
        template: 'rating-request',
        context: data,
      });
      this.logger.log(`Rating request sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send rating request to ${to}:`, error.message);
      // Don't throw - email is non-critical
    }
  }




//###########################################################################
//## 5. Complaint Notification - Gửi cho Coordinator khi có khiếu nại mới ###
//###########################################################################
  async sendComplaintNotification(
    to: string,
    data: ComplaintNotificationData,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '🚨 Khiếu nại mới cần xử lý',
        template: 'complaint-notification',
        context: data,
      });
      this.logger.log(`Complaint notification sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send complaint notification to ${to}:`,
        error.message,
      );
      // Don't throw - email is non-critical
    }
  }




//#############################
//## Test email connection ###
//#############################
  async testConnection(): Promise<boolean> {
    try {
      const testEmail = this.configService.get<string>('SMTP_USER');
      await this.mailerService.sendMail({
        to: testEmail,
        subject: '✅ Test Email - HCMUT Tutor System',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #667eea; text-align: center;">✅ SMTP Test Successful!</h1>
              <p style="font-size: 16px; color: #333;">Congratulations! If you receive this email, your email service is working correctly.</p>
              <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>📧 SMTP Host:</strong> ${this.configService.get<string>('SMTP_HOST')}</p>
                <p style="margin: 5px 0 0 0;"><strong>🔌 Port:</strong> ${this.configService.get<number>('SMTP_PORT')}</p>
              </div>
              <p style="color: #28a745; font-weight: bold; text-align: center;">🎉 Email Service Ready!</p>
            </div>
          </div>
        `,
      });
      this.logger.log('Test email sent successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to send test email:', error);
      return false;
    }
  }
}