import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ManagementService } from './management.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { Role } from '@prisma/client';
import { ManualPairDto } from './dto/manual-pair.dto';
import { CreateComplaintDto, ResolveComplaintDto } from './dto/complaint.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}




//######################
//## manual pair api ###
//######################
  @Post('manual-pair')
  @Roles(Role.COORDINATOR)
  @ApiOperation({ summary: 'Ghép cặp thủ công student với tutor' })
  @ApiResponse({ status: 201, description: 'Ghép cặp thành công' })
  @ApiResponse({ status: 400, description: 'Slot không hợp lệ hoặc đã được đặt' })
  @ApiResponse({ status: 404, description: 'Student hoặc Tutor không tồn tại' })
  async manualPair(@Body() dto: ManualPairDto) {
    return this.managementService.manualPair(dto);
  }




//###########################
//## create complaint api ###
//###########################
  @Post('complaints')
  @Roles(Role.STUDENT, Role.TUTOR)
  @ApiOperation({ summary: 'Tạo khiếu nại' })
  @ApiResponse({ status: 201, description: 'Khiếu nại đã được tạo' })
  async createComplaint(@Request() req,  @Body() dto: CreateComplaintDto){
    return this.managementService.createComplaint(req.user.id, req.user.role, dto);
  }




//########################
//## get complaint api ###
//########################
  @Get('complaints')
  @Roles(Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Xem tất cả khiếu nại' })
  @ApiResponse({ status: 200, description: 'Danh sách khiếu nại' })
  async getAllComplaints() {
    return this.managementService.getAllComplaints();
  }




//############################
//## resolve complaint api ###
//############################
  @Patch('complaints/:id/resolve')
  @Roles(Role.COORDINATOR)
  @ApiOperation({ summary: 'Giải quyết khiếu nại' })
  @ApiResponse({ status: 200, description: 'Khiếu nại đã được giải quyết' })
  @ApiResponse({ status: 404, description: 'Khiếu nại không tồn tại' })
  @ApiResponse({ status: 400, description: 'Khiếu nại đã được giải quyết trước đó' })
  async resolveComplaint(@GetUser('userId') coordinatorId: number,  @Param('id', ParseIntPipe) complaintId: number,  @Body() dto: ResolveComplaintDto) {
    return this.managementService.resolveComplaint(coordinatorId, complaintId, dto);
  }




//#######################
//## get all user api ###
//#######################
  @Get('users')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Xem tất cả users' })
  @ApiResponse({ status: 200, description: 'Danh sách users' })
  async getAllUsers(@Query('page') page: string = '1',  @Query('limit') limit: string = '20'){
    return this.managementService.getAllUsers(parseInt(page), parseInt(limit));
  }




//#########################
//## get user by id api ###
//#########################
  @Get('users/:id')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Xem chi tiết user' })
  @ApiResponse({ status: 200, description: 'Chi tiết user' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async getUserById(@Param('id', ParseIntPipe) id: number){
    return this.managementService.getUserById(id);
  }




//######################
//## create user api ###
//######################
  @Post('users')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiResponse({ status: 201, description: 'User đã được tạo' })
  @ApiResponse({ status: 400, description: 'Email đã tồn tại' })
  async createUser(@Body() dto: CreateUserDto){
    return this.managementService.createUser(dto);
  }




//######################
//## update user api ###
//######################
  @Patch('users/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  @ApiResponse({ status: 200, description: 'User đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.managementService.updateUser(id, dto);
  }




//######################
//## delete user api ###
//######################
  @Delete('users/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa user' })
  @ApiResponse({ status: 200, description: 'User đã được xóa' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.deleteUser(id);
  }




//#############################
//## reset user password api ###
//#############################
  @Post('users/:id/reset-password')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reset mật khẩu user' })
  @ApiResponse({ status: 200, description: 'Email reset đã được gửi' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.resetPassword(id);
  }




//######################################
//## get all tutors applications api ###
//######################################
  @Get('tutor-applications')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Xem tất cả đơn xin làm tutor' })
  @ApiResponse({ status: 200, description: 'Danh sách tutor applications' })
  async getTutorApplications() {
    return this.managementService.getTutorApplications();
  }




//####################################
//## approve tutor application api ###
//####################################
  @Patch('tutor-applications/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Duyệt đơn xin làm tutor' })
  @ApiResponse({ status: 200, description: 'Application đã được duyệt' })
  @ApiResponse({ status: 404, description: 'Application không tồn tại' })
  @ApiResponse({ status: 400, description: 'Application đã được xử lý' })
  async approveTutorApplication(@GetUser('userId') adminId: number,  @Param('id', ParseIntPipe) applicationId: number){
    return this.managementService.approveTutorApplication(adminId, applicationId);
  }




//###################################
//## reject tutor application api ###
//###################################
  @Patch('tutor-applications/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Từ chối đơn xin làm tutor' })
  @ApiResponse({ status: 200, description: 'Application đã bị từ chối' })
  @ApiResponse({ status: 404, description: 'Application không tồn tại' })
  @ApiResponse({ status: 400, description: 'Application đã được xử lý' })
  async rejectTutorApplication(@GetUser('userId') adminId: number,  @Param('id', ParseIntPipe) applicationId: number,  @Body('reason') reason?: string){
    return this.managementService.rejectTutorApplication(adminId, applicationId, reason);
  }


  @Get('potential-tutors')
  @Roles(Role.COORDINATOR, Role.TBM, Role.ADMIN) // chỉ TBM/Coord mới được xem
  async getPotentialTutors(
    @Query('gpaMin') gpaMin = 3.0,
    @Query('department') department?: string,
  ) {
    return this.managementService.getPotentialTutors({ gpaMin: +gpaMin, department });
  }

  @Post('tutor-applications/propose')
  @Roles(Role.TBM, Role.COORDINATOR)
  @ApiOperation({ summary: 'Đề xuất sinh viên làm tutor (bởi TBM/Coordinator)' })
  @ApiResponse({ status: 201, description: 'Đề xuất đã được tạo' })
  @ApiResponse({ status: 400, description: 'Sinh viên không hợp lệ hoặc đã là tutor' })
  async proposeTutorApplication(
    @GetUser('userId') proposedById: number,
    @Body() body: {
      studentId: number;
      expertise: string[];
      bio: string;
      gpa: number;
    }
  ) {
    return this.managementService.proposeTutorApplication({
      ...body,
      proposedById, 
    });
  }
}
