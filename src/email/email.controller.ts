import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Get('test-connection')
  @ApiOperation({ 
    summary: 'Test SMTP connection',
    description: 'Verify Gmail SMTP configuration is working correctly'
  })
  @ApiResponse({ status: 200, description: 'SMTP connection successful' })
  @ApiResponse({ status: 500, description: 'SMTP connection failed' })
  async testConnection() {
    const isConnected = await this.emailService.testConnection();
    
    if (isConnected) {
      return {
        status: 'success',
        message: 'SMTP connection successful! Email service is ready.',
      };
    } else {
      return {
        status: 'error',
        message: 'SMTP connection failed. Check your email configuration.',
      };
    }
  }

  @Post('test-welcome')
  @ApiOperation({ 
    summary: 'Send test welcome email',
    description: 'Send a sample welcome email to test the template'
  })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  async testWelcomeEmail() {
    await this.emailService.sendWelcomeEmail('cong.nguyen10082005@hcmut.edu.vn', {
      fullName: 'Nguyễn Văn Test',
      email: 'cong.nguyen10082005@hcmut.edu.vn',
      role: 'STUDENT',
      mssv: '2212345',
    });

    return {
      status: 'success',
      message: 'Test welcome email sent! Check your inbox.',
    };
  }

  @Post('test-confirmation')
  @ApiOperation({ 
    summary: 'Send test meeting confirmation email',
    description: 'Send a sample meeting confirmation email'
  })
  @ApiResponse({ status: 200, description: 'Confirmation email sent successfully' })
  async testConfirmationEmail() {
    await this.emailService.sendMeetingConfirmation('cong.nguyen10082005@hcmut.edu.vn', {
      studentName: 'Nguyễn Văn Test',
      tutorName: 'Trần Thị Tutor',
      meetingDate: 'Thứ Hai, 15 tháng 1, 2024',
      meetingTime: '14:00 - 15:00',
      topic: 'Hỗ trợ làm bài tập Toán Cao Cấp',
      meetingLink: 'http://localhost:3000/meetings/123',
    });

    return {
      status: 'success',
      message: 'Test confirmation email sent! Check your inbox.',
    };
  }

  @Post('test-rating')
  @ApiOperation({ 
    summary: 'Send test rating request email',
    description: 'Send a sample rating request email'
  })
  @ApiResponse({ status: 200, description: 'Rating request email sent successfully' })
  async testRatingEmail() {
    await this.emailService.sendRatingRequest('cong.nguyen10082005@hcmut.edu.vn', {
      studentName: 'Nguyễn Văn Test',
      tutorName: 'Trần Thị Tutor',
      meetingDate: 'Thứ Hai, 15 tháng 1, 2024',
      meetingTime: '14:00 - 15:00',
      topic: 'Hỗ trợ làm bài tập Toán Cao Cấp',
      ratingLink: 'http://localhost:3000/meetings/123/rating',
    });

    return {
      status: 'success',
      message: 'Test rating request email sent! Check your inbox.',
    };
  }

  @Post('test-complaint')
  @ApiOperation({ 
    summary: 'Send test complaint notification email',
    description: 'Send a sample complaint notification to coordinators'
  })
  @ApiResponse({ status: 200, description: 'Complaint notification sent successfully' })
  async testComplaintEmail() {
    await this.emailService.sendComplaintNotification('cong.nguyen10082005@hcmut.edu.vn', {
      coordinatorName: 'Phạm Văn Coordinator',
      studentName: 'Nguyễn Văn Test',
      studentEmail: 'test.student@hcmut.edu.vn',
      description: 'Tutor đến muộn 30 phút và không thông báo trước. Tôi đã đợi rất lâu nhưng không nhận được phản hồi.',
      complaintId: '42',
      createdAt: '15 tháng 1, 2024, 10:30',
      dashboardLink: 'http://localhost:3000/management/complaints/42',
      meetingInfo: 'Meeting ID 123 với tutor Trần Thị Tutor',
    });

    return {
      status: 'success',
      message: 'Test complaint notification sent! Check your inbox.',
    };
  }
}
