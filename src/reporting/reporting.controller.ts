import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Reporting & Analytics')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  // ==========================================
  // OSA: Scholarship for Student Tutors
  // ==========================================
  @Get('osa/scholarship/tutors')
  @Roles(Role.OSA, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Học bổng cho Tutor (Sinh viên)',
    description: 'Lọc sinh viên làm Tutor có GPA cao và đủ giờ dạy.'
  })
  @ApiQuery({ name: 'minGpa', example: '3.2' })
  @ApiQuery({ name: 'minHours', example: '10' })
  @ApiQuery({ name: 'start', example: '2024-01-01' })
  @ApiQuery({ name: 'end', example: '2024-06-30' })
  async getTutorScholarship(
    @Query('start') start: string, 
    @Query('end') end: string,
    @Query('minHours') minHours: string,
    @Query('minGpa') minGpa: string,
  ) {
    return this.reportingService.getStudentTutorScholarshipReport(
      new Date(start), 
      new Date(end), 
      parseFloat(minHours || '0'),
      parseFloat(minGpa || '0')
    );
  }

  // ==========================================
  // OSA: Scholarship for Regular Learners
  // ==========================================
  @Get('osa/scholarship/learners')
  @Roles(Role.OSA, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Học bổng cho Sinh viên chăm học',
    description: 'Lọc sinh viên có GPA cao và đủ giờ tham gia học.'
  })
  @ApiQuery({ name: 'minGpa', example: '3.6' })
  @ApiQuery({ name: 'minHours', example: '5' })
  @ApiQuery({ name: 'start', example: '2024-01-01' })
  @ApiQuery({ name: 'end', example: '2024-06-30' })
  async getLearnerScholarship(
    @Query('start') start: string, 
    @Query('end') end: string,
    @Query('minHours') minHours: string,
    @Query('minGpa') minGpa: string,
  ) {
    return this.reportingService.getStudentLearnerScholarshipReport(
      new Date(start), 
      new Date(end), 
      parseFloat(minHours || '0'),
      parseFloat(minGpa || '0')
    );
  }

  // ==========================================
  // OAA: Department Metrics
  // ==========================================
  @Get('oaa/department-metrics')
  @Roles(Role.OAA, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Thống kê tổng quan theo Khoa',
    description: 'Bao gồm: Số lượng Tutor/Student, Tỷ lệ đáp ứng, Tổng số buổi đã dạy.'
  })
  async getDepartmentMetrics() {
    return this.reportingService.getDepartmentOverviewReport();
  }
}