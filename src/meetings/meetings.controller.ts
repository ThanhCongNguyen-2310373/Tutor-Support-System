import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RescheduleMeetingDto } from './dto/reschedule-meeting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { MeetingStatus } from '@prisma/client';

@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}




//######################################
//## UC_STU_01: Student đặt lịch hẹn ###
//######################################
  @Post('book')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Student đặt lịch hẹn với tutor' })
  @ApiResponse({ status: 201, description: 'Đặt lịch thành công' })
  @ApiResponse({ status: 400, description: 'Slot không available hoặc dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Slot hoặc tutor không tồn tại' })
  async createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    return this.meetingsService.createBooking(req.user.id, dto);
  }




//#############################################
//## UC_STU_05: Student rating buổi học api ###
//#############################################
  @Post(':id/rating')
  @Roles(Role.STUDENT, Role.TUTOR)
  @ApiOperation({ summary: 'Student đánh giá buổi học đã Complete' })
  @ApiResponse({ status: 201, description: 'Đánh giá thành công' })
  @ApiResponse({ status: 400, description: 'Meeting chưa Complete hoặc đã được rating' })
  @ApiResponse({ status: 403, description: 'Không có quyền rating meeting này' })
  @ApiResponse({ status: 404, description: 'Meeting không tồn tại' })
  async submitRating(@Request() req,  @Param('id', ParseIntPipe) id: number,  @Body() dto: CreateRatingDto){
    return this.meetingsService.submitRating(req.user.id, req.user.role, id, dto);
  }




//#############################################
//## Get my meetings (Student or Tutor) api ###
//#############################################
  @Get('my-meetings')
  @Roles(Role.STUDENT, Role.TUTOR)
  @ApiOperation({ 
    summary: 'Xem danh sách meetings của mình',
    description: 'Hỗ trợ filter: ?status=PENDING|CONFIRMED|COMPLETED|CANCELED&startDate=2024-01-01&endDate=2024-12-31'
  })
  @ApiQuery({ name: 'status', required: false, enum: MeetingStatus })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-12-31' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getMyMeetings(
    @Request() req, 
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.meetingsService.getMyMeetings(req.user.id, req.user.role, { status, startDate, endDate });
  }




//#############################
//## Get meeting detail api ###
//#############################
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết meeting' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem meeting này' })
  @ApiResponse({ status: 404, description: 'Meeting không tồn tại' })
  async getMeetingById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.meetingsService.getMeetingById(id, req.user.id, req.user.role);
  }




//#########################
//## Cancel meeting api ###
//#########################
  @Patch(':id/cancel')
  @Roles(Role.STUDENT, Role.TUTOR)
  @ApiOperation({ summary: 'Hủy meeting' })
  @ApiResponse({ status: 200, description: 'Hủy thành công' })
  @ApiResponse({ status: 400, description: 'Không thể hủy meeting đã hoàn thành hoặc đã hủy' })
  @ApiResponse({ status: 403, description: 'Không có quyền hủy meeting này' })
  @ApiResponse({ status: 404, description: 'Meeting không tồn tại' })
  async cancelMeeting(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.meetingsService.cancelMeeting(req.user.id, req.user.role, id);
  }




//###########################
//## Complete meeting api ###
//###########################
  @Patch(':id/complete')
  @Roles(Role.STUDENT, Role.TUTOR)
  @ApiOperation({ summary: 'Complete meeting' })
  @ApiResponse({ status: 200, description: 'Complete meeting thành công' })
  @ApiResponse({ status: 400, description: 'Không thể Complete meeting đã Cancel hoặc Pending' })
  @ApiResponse({ status: 403, description: 'Không có quyền Complete meeting này' })
  @ApiResponse({ status: 404, description: 'Meeting không tồn tại' })
  async completeMeeting(@Request() req, @Param('id', ParseIntPipe) id: number){
    return this.meetingsService.completeMeeting(req.user.id, req.user.role, id);
  }

  // ========================================================
  // Student đổi lịch học
  // ========================================================
  @Put(':id/reschedule')
  @Roles(Role.STUDENT) // Chỉ sinh viên mới được tự đổi lịch của mình
  @ApiOperation({ 
    summary: 'Đổi lịch học (Reschedule)', 
    description: 'Chuyển sinh viên từ meeting hiện tại sang một slot mới. Yêu cầu slot mới phải cùng Tutor và chưa đầy.' 
  })
  @ApiResponse({ status: 200, description: 'Đổi lịch thành công' })
  @ApiResponse({ status: 400, description: 'Slot mới đã đầy hoặc không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền đổi lịch meeting này' })
  @ApiResponse({ status: 404, description: 'Meeting hoặc Slot mới không tồn tại' })
  async rescheduleMeeting(
    @Request() req,
    @Param('id', ParseIntPipe) meetingId: number,
    @Body() dto: RescheduleMeetingDto,
  ) {
    return this.meetingsService.rescheduleMeeting(req.user.id, meetingId, dto);
  }

}
