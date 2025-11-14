// src/external/hcmut-datacore.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncUserDto } from './dto/sync-user.dto';
import { Role } from '@prisma/client';

/**
 * Service tích hợp với HCMUT_DATACORE để đồng bộ dữ liệu người dùng
 * 
 * HCMUT_DATACORE là hệ thống dữ liệu tập trung của trường
 * Chứa thông tin đầy đủ về:
 * - Sinh viên: MSSV, họ tên, khoa, ngành, lớp, trạng thái học tập
 * - Giảng viên: Mã CB, họ tên, khoa, bộ môn, chức danh
 * - Cán bộ: Mã CB, họ tên, phòng ban, chức vụ
 * 
 * Hiện tại: MOCK implementation để development
 * Production: Sẽ gọi API thật của HCMUT_DATACORE
 */
@Injectable()
export class HcmutDatacoreService {
  private readonly logger = new Logger(HcmutDatacoreService.name);
  private readonly datacoreUrl: string;
  private readonly datacoreApiKey: string;

  constructor(private configService: ConfigService) {
    this.datacoreUrl = this.configService.get<string>('HCMUT_DATACORE_URL') || 'https://datacore.hcmut.edu.vn/api';
    this.datacoreApiKey = this.configService.get<string>('HCMUT_DATACORE_API_KEY') || 'mock_api_key';
  }

  /**
   * Đồng bộ thông tin 1 user từ DATACORE
   * 
   * @param userId - MSSV hoặc Mã cán bộ
   * @returns Thông tin user đầy đủ
   */
  async syncUserData(userId: string): Promise<SyncUserDto> {
    this.logger.log(`🔄 [HCMUT_DATACORE] Syncing user data: ${userId}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.datacoreUrl}/users/${userId}`, {
      //   headers: {
      //     'X-API-Key': this.datacoreApiKey
      //   }
      // }).toPromise();
      // return this.transformDatacoreResponse(response.data);

      // MOCK: Giả lập response từ DATACORE
      return this.mockGetUserData(userId);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_DATACORE] Sync failed for ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Đồng bộ hàng loạt users (dùng cho migration hoặc scheduled job)
   * 
   * @param userIds - Danh sách MSSV/Mã CB
   * @returns Danh sách user data
   */
  async bulkSyncUsers(userIds: string[]): Promise<SyncUserDto[]> {
    this.logger.log(`🔄 [HCMUT_DATACORE] Bulk syncing ${userIds.length} users`);

    try {
      // TODO: Production - Gọi API bulk sync
      // const response = await this.httpService.post(`${this.datacoreUrl}/users/bulk`, {
      //   userIds,
      //   apiKey: this.datacoreApiKey
      // }).toPromise();
      // return response.data.map(this.transformDatacoreResponse);

      // MOCK: Sync từng user
      const results = await Promise.all(
        userIds.map(userId => this.mockGetUserData(userId))
      );

      this.logger.log(`✅ [HCMUT_DATACORE] Bulk sync completed: ${results.length} users`);
      return results;
    } catch (error) {
      this.logger.error(`❌ [HCMUT_DATACORE] Bulk sync failed:`, error.message);
      throw error;
    }
  }

  /**
   * Lấy danh sách sinh viên theo khoa
   * 
   * @param department - Mã khoa (CSE, EE, ME, etc.)
   * @returns Danh sách sinh viên
   */
  async getStudentsByDepartment(department: string): Promise<SyncUserDto[]> {
    this.logger.log(`📚 [HCMUT_DATACORE] Getting students from department: ${department}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.datacoreUrl}/students`, {
      //   params: { department },
      //   headers: { 'X-API-Key': this.datacoreApiKey }
      // }).toPromise();
      // return response.data.map(this.transformDatacoreResponse);

      // MOCK: Trả về danh sách mock
      return this.mockGetStudentsByDepartment(department);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_DATACORE] Failed to get students:`, error.message);
      throw error;
    }
  }

  /**
   * Lấy danh sách giảng viên theo bộ môn
   * 
   * @param department - Mã bộ môn
   * @returns Danh sách giảng viên
   */
  async getTutorsByDepartment(department: string): Promise<SyncUserDto[]> {
    this.logger.log(`👨‍🏫 [HCMUT_DATACORE] Getting tutors from department: ${department}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.datacoreUrl}/tutors`, {
      //   params: { department },
      //   headers: { 'X-API-Key': this.datacoreApiKey }
      // }).toPromise();
      // return response.data.map(this.transformDatacoreResponse);

      // MOCK: Trả về danh sách mock
      return this.mockGetTutorsByDepartment(department);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_DATACORE] Failed to get tutors:`, error.message);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái học tập/giảng dạy
   * 
   * @param userId - MSSV/Mã CB
   * @returns Trạng thái (active, suspended, graduated, etc.)
   */
  async checkUserStatus(userId: string): Promise<string> {
    this.logger.log(`🔍 [HCMUT_DATACORE] Checking status for: ${userId}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.datacoreUrl}/users/${userId}/status`, {
      //   headers: { 'X-API-Key': this.datacoreApiKey }
      // }).toPromise();
      // return response.data.status;

      // MOCK: Trả về status
      return 'active';
    } catch (error) {
      this.logger.error(`❌ [HCMUT_DATACORE] Failed to check status:`, error.message);
      throw error;
    }
  }

  // ==================== MOCK METHODS (Development only) ====================

  private mockGetUserData(userId: string): SyncUserDto {
    // Determine role based on userId pattern
    let role: Role = Role.STUDENT;
    let department = 'Computer Science & Engineering';
    let status = 'active';

    if (userId.startsWith('GV') || (userId.startsWith('TUTOR'))) {
      role = Role.TUTOR;
      department = 'Software Engineering Department';
      status = 'teaching';
    } else if (userId.startsWith('ADMIN')) {
      role = Role.ADMIN;
      department = 'IT Administration';
      status = 'working';
    } else if (userId.startsWith('COORD')) {
      role = Role.COORDINATOR;
      department = 'Academic Affairs';
      status = 'working';
    }

    const userData: SyncUserDto = {
      userId,
      email: `${userId.toLowerCase()}@hcmut.edu.vn`,
      fullName: this.generateMockName(userId),
      department,
      role,
      status,
      phoneNumber: this.generateMockPhone(),
      studentClass: role === Role.STUDENT ? 'CC01' : undefined,
    };

    this.logger.log(`✅ [HCMUT_DATACORE MOCK] User data synced for ${userId}`);
    return userData;
  }

  private mockGetStudentsByDepartment(department: string): SyncUserDto[] {
    // MOCK: Trả về 5 sinh viên mẫu
    const students: SyncUserDto[] = [];
    for (let i = 1; i <= 5; i++) {
      const mssv = `2${i.toString().padStart(6, '0')}`;
      students.push({
        userId: mssv,
        email: `${mssv}@hcmut.edu.vn`,
        fullName: this.generateMockName(mssv),
        department,
        role: Role.STUDENT,
        status: 'active',
        studentClass: `CC0${i}`,
      });
    }

    this.logger.log(`✅ [HCMUT_DATACORE MOCK] Found ${students.length} students in ${department}`);
    return students;
  }

  private mockGetTutorsByDepartment(department: string): SyncUserDto[] {
    // MOCK: Trả về 3 giảng viên mẫu
    const tutors: SyncUserDto[] = [];
    for (let i = 1; i <= 3; i++) {
      const maCB = `GV${i.toString().padStart(5, '0')}`;
      tutors.push({
        userId: maCB,
        email: `${maCB.toLowerCase()}@hcmut.edu.vn`,
        fullName: this.generateMockName(maCB),
        department,
        role: Role.TUTOR,
        status: 'teaching',
        phoneNumber: this.generateMockPhone(),
      });
    }

    this.logger.log(`✅ [HCMUT_DATACORE MOCK] Found ${tutors.length} tutors in ${department}`);
    return tutors;
  }

  private generateMockName(userId: string): string {
    const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Võ', 'Đặng', 'Bùi', 'Đỗ'];
    const midNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Anh', 'Hoàng', 'Thanh', 'Thu'];
    const names = ['An', 'Bình', 'Cường', 'Dũng', 'Hải', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân', 'Trang', 'Linh'];

    const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomSurname = surnames[seed % surnames.length];
    const randomMidName = midNames[(seed + 1) % midNames.length];
    const randomName = names[(seed + 2) % names.length];

    return `${randomSurname} ${randomMidName} ${randomName}`;
  }

  private generateMockPhone(): string {
    const prefix = ['090', '091', '093', '094', '096', '097', '098'];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomNumber = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `${randomPrefix}${randomNumber}`;
  }

  /**
   * Health check - Kiểm tra DATACORE service có hoạt động không
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // TODO: Production - Ping DATACORE API
      // await this.httpService.get(`${this.datacoreUrl}/health`).toPromise();

      return {
        status: 'healthy',
        message: 'HCMUT_DATACORE service is available (MOCK)'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'HCMUT_DATACORE service is unavailable'
      };
    }
  }
}
