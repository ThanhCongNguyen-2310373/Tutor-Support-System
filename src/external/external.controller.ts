// src/external/external.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HcmutSsoService } from './hcmut-sso.service';
import { HcmutDatacoreService } from './hcmut-datacore.service';
import { HcmutLibraryService } from './hcmut-library.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  LibrarySearchDto,
  GetDocumentUrlRequest,
} from './dto/library-search.dto';
import { SyncUserRequest } from './dto/sync-user.dto';

/**
 * Controller để test và quản lý các External APIs
 * 
 * Endpoints này cho phép:
 * - Admin trigger sync data manually
 * - Test kết nối với external services
 * - Tutor/Student tìm kiếm tài liệu từ thư viện
 * 
 * Hầu hết endpoints đều yêu cầu authentication
 */
@ApiTags('external')
@Controller('external')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExternalController {
  constructor(
    private readonly ssoService: HcmutSsoService,
    private readonly datacoreService: HcmutDatacoreService,
    private readonly libraryService: HcmutLibraryService,
  ) {}

  // ==================== SSO Endpoints ====================

  @Get('sso/health')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Check HCMUT_SSO service health (Admin only)' })
  @ApiResponse({ status: 200, description: 'Health status' })
  async checkSsoHealth() {
    return this.ssoService.healthCheck();
  }

  // ==================== DATACORE Endpoints ====================

  @Get('datacore/health')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Check HCMUT_DATACORE service health (Admin only)' })
  @ApiResponse({ status: 200, description: 'Health status' })
  async checkDatacoreHealth() {
    return this.datacoreService.healthCheck();
  }

  @Post('datacore/sync-user')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Manually sync user data from DATACORE' })
  @ApiResponse({ status: 200, description: 'User data synced successfully' })
  async syncUser(@Body() request: SyncUserRequest) {
    return this.datacoreService.syncUserData(request.userId);
  }

  @Post('datacore/bulk-sync')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk sync multiple users from DATACORE (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bulk sync completed' })
  async bulkSyncUsers(@Body() body: { userIds: string[] }) {
    return this.datacoreService.bulkSyncUsers(body.userIds);
  }

  @Get('datacore/students/:department')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TBM)
  @ApiOperation({ summary: 'Get students by department from DATACORE' })
  @ApiResponse({ status: 200, description: 'List of students' })
  async getStudentsByDepartment(@Param('department') department: string) {
    return this.datacoreService.getStudentsByDepartment(department);
  }

  @Get('datacore/tutors/:department')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TBM)
  @ApiOperation({ summary: 'Get tutors by department from DATACORE' })
  @ApiResponse({ status: 200, description: 'List of tutors' })
  async getTutorsByDepartment(@Param('department') department: string) {
    return this.datacoreService.getTutorsByDepartment(department);
  }

  @Get('datacore/user-status/:userId')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({ summary: 'Check user status from DATACORE' })
  @ApiResponse({ status: 200, description: 'User status' })
  async checkUserStatus(@Param('userId') userId: string) {
    const status = await this.datacoreService.checkUserStatus(userId);
    return { userId, status };
  }

  // ==================== LIBRARY Endpoints ====================

  @Get('library/health')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Check HCMUT_LIBRARY service health (Admin only)' })
  @ApiResponse({ status: 200, description: 'Health status' })
  async checkLibraryHealth() {
    return this.libraryService.healthCheck();
  }

  @Get('library/search')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Search documents in HCMUT_LIBRARY' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchDocuments(@Query() searchDto: LibrarySearchDto) {
    return this.libraryService.searchDocuments(searchDto);
  }

  @Post('library/document-url')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get download URL for a document' })
  @ApiResponse({ status: 200, description: 'Document download URL' })
  async getDocumentUrl(@Body() request: GetDocumentUrlRequest) {
    const url = await this.libraryService.getDocumentUrl(request);
    return { documentId: request.documentId, url };
  }

  @Get('library/document/:id')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get document details by ID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  async getDocumentById(@Param('id') id: string) {
    return this.libraryService.getDocumentById(id);
  }

  @Get('library/recommendations')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get document recommendations for a topic' })
  @ApiResponse({ status: 200, description: 'Recommended documents' })
  async getRecommendations(
    @Query('topic') topic: string,
    @Query('limit') limit?: number,
  ) {
    return this.libraryService.recommendForTopic(topic, limit || 10);
  }

  @Get('library/popular')
  @Roles(Role.STUDENT, Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get popular documents from library' })
  @ApiResponse({ status: 200, description: 'Popular documents' })
  async getPopularDocuments(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
  ) {
    return this.libraryService.getPopularDocuments(category, limit || 20);
  }

  // ==================== Health Check All Services ====================

  @Get('health-all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Check health of all external services (Admin only)' })
  @ApiResponse({ status: 200, description: 'Health status of all services' })
  async checkAllHealth() {
    const [sso, datacore, library] = await Promise.all([
      this.ssoService.healthCheck(),
      this.datacoreService.healthCheck(),
      this.libraryService.healthCheck(),
    ]);

    return {
      services: {
        HCMUT_SSO: sso,
        HCMUT_DATACORE: datacore,
        HCMUT_LIBRARY: library,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
