import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('academic')
@ApiBearerAuth()
@Controller('academic')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}




//#########################################
//## UC_TBM_01: TBM tạo lộ trình học ######
//#########################################
  @Post('roadmaps')
  @Roles(Role.COORDINATOR, Role.TBM) // Trưởng Bộ Môn
  @ApiOperation({ 
    summary: 'TBM tạo lộ trình học',
    description: 'Trưởng Bộ Môn tạo lộ trình học mới cho môn học' 
  })
  @ApiResponse({ status: 201, description: 'Tạo lộ trình thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Chỉ TBM mới có quyền tạo lộ trình' })
  async createRoadmap(@Request() req, @Body() dto: CreateRoadmapDto) {
    return this.academicService.createRoadmap(req.user.id, dto);
  }




//###################################################
//## UC_TUT_03 & UC_STU_03: Xem danh sách lộ trình ##
//###################################################
  @Get('roadmaps')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.TBM)
  @ApiOperation({ 
    summary: 'Xem danh sách lộ trình học',
    description: 'Tutor/Student xem tất cả lộ trình học' 
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getRoadmaps() {
    return this.academicService.getRoadmaps();
  }




//##################################
//## UC_TBM_01: Xem chi tiết #######
//##################################
  @Get('roadmaps/:id')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.TBM)
  @ApiOperation({ 
    summary: 'Xem chi tiết lộ trình học',
    description: 'Xem thông tin chi tiết 1 lộ trình' 
  })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @ApiResponse({ status: 404, description: 'Lộ trình không tồn tại' })
  async getRoadmapById(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.getRoadmapById(id);
  }




//###################################
//## UC_TBM_01: TBM cập nhật ########
//###################################
  @Patch('roadmaps/:id')
  @Roles(Role.COORDINATOR, Role.TBM)
  @ApiOperation({ 
    summary: 'TBM cập nhật lộ trình học',
    description: 'Chỉ author có thể cập nhật' 
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa' })
  @ApiResponse({ status: 404, description: 'Lộ trình không tồn tại' })
  async updateRoadmap(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRoadmapDto,
  ) {
    return this.academicService.updateRoadmap(id, req.user.id, dto);
  }




//##############################
//## UC_TBM_01: TBM xóa ########
//##############################
  @Delete('roadmaps/:id')
  @Roles(Role.COORDINATOR, Role.TBM)
  @ApiOperation({ 
    summary: 'TBM xóa lộ trình học',
    description: 'Chỉ author có thể xóa' 
  })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Lộ trình không tồn tại' })
  async deleteRoadmap(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.academicService.deleteRoadmap(id, req.user.id);
  }
}
