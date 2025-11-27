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
  // POST: Tạo lộ trình
  @Post('roadmaps')
  @Roles(Role.TBM)
  async createRoadmap(@Body() dto: CreateRoadmapDto) {
    // XÓA req.user.id ĐI!!!
    return this.academicService.createRoadmap(dto);
  }




//###################################################
//## UC_TUT_03 & UC_STU_03: Xem danh sách lộ trình ##
//###################################################
  @Get('roadmaps')
  @Roles(Role.STUDENT, Role.TUTOR, Role.TBM)
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
  @Roles(Role.STUDENT, Role.TUTOR, Role.TBM)
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
  @Roles(Role.TBM)
  async updateRoadmap(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateRoadmapDto) {
    return this.academicService.updateRoadmap(id, dto); // XÓA req.user.id
  }

//###################################
//## UC_TBM_01: TBM xóa      ########
//###################################
  @Delete('roadmaps/:id')
  @Roles(Role.TBM)
  async deleteRoadmap(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.deleteRoadmap(id); // XÓA req.user.id
  }
}
