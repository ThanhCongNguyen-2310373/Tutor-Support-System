import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { MeetingsService } from '../meetings/meetings.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CreateProgressRecordDto } from './dto/create-progress-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('tutors')
@ApiBearerAuth()
@Controller('tutors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TutorsController {
  constructor(
    private readonly tutorsService: TutorsService,
    private readonly meetingsService: MeetingsService,
  ) {}

  /**
   * Get all available tutors (public for students)
   */
  @Get()
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Xem danh sách tất cả tutors' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getAllTutors() {
    return this.tutorsService.getAllTutors();
  }

  /**
   * Get tutor detail by ID
   */
  @Get(':id')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Xem chi tiết tutor' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Tutor không tồn tại' })
  async getTutorById(@Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.getTutorById(id);
  }

  /**
   * UC_TUT_01: Create availability slot
   */
  @Post('availability')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Tutor tạo lịch rảnh' })
  @ApiResponse({ status: 201, description: 'Tạo slot thành công' })
  @ApiResponse({ status: 400, description: 'Thời gian không hợp lệ hoặc bị trùng' })
  @ApiResponse({ status: 404, description: 'Tutor profile không tồn tại' })
  async createAvailability(@Request() req, @Body() dto: CreateAvailabilityDto) {
    return this.tutorsService.createAvailability(req.user.id, dto);
  }

  /**
   * UC_TUT_01: Delete availability slot
   */
  @Delete('availability/:id')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Tutor xóa lịch rảnh' })
  @ApiResponse({ status: 200, description: 'Xóa slot thành công' })
  @ApiResponse({ status: 400, description: 'Không thể xóa slot đã được đặt' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa slot này' })
  @ApiResponse({ status: 404, description: 'Slot không tồn tại' })
  async deleteAvailability(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.deleteAvailability(req.user.id, id);
  }

  /**
   * UC_TUT_01: Get my availability slots
   */
  @Get('me/availability')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Xem lịch rảnh của tôi' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 404, description: 'Tutor profile không tồn tại' })
  async getMyAvailability(@Request() req) {
    return this.tutorsService.getAvailability(req.user.id);
  }

  /**
   * UC_TUT_02: Get booking requests
   */
  @Get('booking-requests')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Xem danh sách yêu cầu đặt lịch' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 404, description: 'Tutor profile không tồn tại' })
  async getBookingRequests(@Request() req) {
    return this.meetingsService.getBookingRequests(req.user.userId);
  }

  /**
   * UC_TUT_02: Confirm booking
   */
  @Patch('bookings/:id/confirm')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Tutor xác nhận booking' })
  @ApiResponse({ status: 200, description: 'Xác nhận thành công' })
  @ApiResponse({ status: 400, description: 'Chỉ có thể confirm booking PENDING' })
  @ApiResponse({ status: 403, description: 'Không có quyền confirm booking này' })
  @ApiResponse({ status: 404, description: 'Booking không tồn tại' })
  async confirmBooking(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.meetingsService.confirmBooking(req.user.id, id);
  }

  /**
   * UC_TUT_02: Reject booking
   */
  @Patch('bookings/:id/reject')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Tutor từ chối booking' })
  @ApiResponse({ status: 200, description: 'Từ chối thành công' })
  @ApiResponse({ status: 400, description: 'Chỉ có thể reject booking PENDING' })
  @ApiResponse({ status: 403, description: 'Không có quyền reject booking này' })
  @ApiResponse({ status: 404, description: 'Booking không tồn tại' })
  async rejectBooking(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.meetingsService.rejectBooking(req.user.id, id, reason);
  }

  /**
   * UC_TUT_03: Create progress record
   */
  @Post('progress')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Tutor ghi nhận tiến độ sinh viên' })
  @ApiResponse({ status: 201, description: 'Ghi nhận thành công' })
  @ApiResponse({ status: 404, description: 'Student hoặc tutor profile không tồn tại' })
  async createProgressRecord(@Request() req, @Body() dto: CreateProgressRecordDto) {
    return this.tutorsService.createProgressRecord(req.user.id, dto);
  }

  /**
   * UC_TUT_03: Get student progress
   */
  @Get('students/:studentId/progress')
  @Roles(Role.TUTOR, Role.TBM, Role.COORDINATOR)
  @ApiOperation({ summary: 'Xem tiến độ của sinh viên' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @ApiResponse({ status: 404, description: 'Student hoặc tutor profile không tồn tại' })
  async getStudentProgress(
    @Request() req,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.tutorsService.getStudentProgress(req.user.id, studentId);
  }

  /**
   * Get my students
   */
  @Get('me/students')
  @Roles(Role.TUTOR)
  @ApiOperation({ summary: 'Xem danh sách sinh viên của tôi' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 404, description: 'Tutor profile không tồn tại' })
  async getMyStudents(@Request() req) {
    return this.tutorsService.getMyStudents(req.user.id);
  }
}
