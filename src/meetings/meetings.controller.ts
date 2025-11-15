import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

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




//###############################################
//## UC_STU_05: Student đánh giá buổi học api ###
//###############################################
  @Post(':id/rating')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Student đánh giá buổi học đã hoàn thành' })
  @ApiResponse({ status: 201, description: 'Đánh giá thành công' })
  @ApiResponse({ status: 400, description: 'Meeting chưa hoàn thành hoặc đã được đánh giá' })
  @ApiResponse({ status: 403, description: 'Không có quyền đánh giá meeting này' })
  @ApiResponse({ status: 404, description: 'Meeting không tồn tại' })
  async submitRating(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRatingDto,
  ) {
    return this.meetingsService.submitRating(req.user.id, id, dto);
  }




//#############################################
//## Get my meetings (Student or Tutor) api ###
//#############################################
  @Get('my-meetings')
  @Roles(Role.STUDENT, Role.TUTOR)
  @ApiOperation({ summary: 'Xem danh sách meetings của mình' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getMyMeetings(@Request() req) {
    return this.meetingsService.getMyMeetings(req.user.id, req.user.role);
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




}
