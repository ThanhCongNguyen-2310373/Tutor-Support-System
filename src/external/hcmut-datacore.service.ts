import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class HcmutDatacoreService {
  private readonly logger = new Logger(HcmutDatacoreService.name);

  constructor(private prisma: PrismaService) {}

  // =================================================================
  // 1. REAL DB OPERATIONS (Used for Login & Controller Sync)
  // =================================================================

  /**
   * Fetch user details from Local DB
   */
  async syncUserData(identifier: string): Promise<SyncUserDto> {
    this.logger.log(`[HCMUT_DATACORE] Fetching profile for: ${identifier}`);

    const user = await this.findUserByIdentifier(identifier);

    if (!user) {
      throw new NotFoundException('User profile not found in system');
    }

    return this.mapUserToDto(user);
  }

  async bulkSyncUsers(userIds: string[]): Promise<SyncUserDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [{ mssv: { in: userIds } }, { email: { in: userIds } }],
      },
    });
    return users.map((user) => this.mapUserToDto(user));
  }

  async getStudentsByDepartment(department: string): Promise<SyncUserDto[]> {
    const students = await this.prisma.user.findMany({
      where: { role: Role.STUDENT, department: { contains: department, mode: 'insensitive' } },
    });
    return students.map((user) => this.mapUserToDto(user));
  }

  async getTutorsByDepartment(department: string): Promise<SyncUserDto[]> {
    const tutors = await this.prisma.user.findMany({
      where: { role: Role.TUTOR, department: { contains: department, mode: 'insensitive' } },
    });
    return tutors.map((user) => this.mapUserToDto(user));
  }

  async checkUserStatus(userId: string): Promise<string> {
    const user = await this.findUserByIdentifier(userId);
    return user ? 'Active' : 'Unknown';
  }

  async healthCheck() {
    return { status: 'healthy', mode: 'local-db-backed' };
  }

  // =================================================================
  // 2. MOCK GENERATION (Used for Registration Simulation)
  // =================================================================

  /**
   * Generate profile from "Existing External System"
   */
  getMockProfile(email: string): SyncUserDto {
    this.logger.log(`🎲 [HCMUT_DATACORE] Generating mock profile for: ${email}`);

    const namePart = email.split('@')[0];
    const role = this.inferRoleFromEmail(email);
    
    return {
      userId: this.generateMockMSSV(role),
      email: email,
      fullName: this.generateMockName(namePart),
      role: role,
      department: this.getRandomDepartment(),
      status: 'Active',
      phoneNumber: this.generateMockPhone(),
      studentClass: role === Role.STUDENT ? this.generateMockClass() : null,
    };
  }

  // --- Helpers ---

  private async findUserByIdentifier(identifier: string) {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ mssv: identifier }, { email: identifier }] },
    });
    if (!user && !isNaN(Number(identifier))) {
      user = await this.prisma.user.findUnique({ where: { id: Number(identifier) } });
    }
    return user;
  }

  private mapUserToDto(user: any): SyncUserDto {
    return {
      userId: user.mssv || user.id.toString(),
      email: user.email,
      fullName: user.fullName,
      department: user.department || 'N/A',
      role: user.role,
      status: 'Active',
      phoneNumber: user.phoneNumber || '',
      studentClass: user.studentClass || '',
    };
  }

  private inferRoleFromEmail(email: string): Role {
    const prefix = email.split('@')[0].toLowerCase();
    if (prefix.startsWith('gv') || prefix.includes('tutor')) return Role.TUTOR;
    if (prefix.startsWith('admin')) return Role.ADMIN;
    if (prefix.startsWith('coord')) return Role.COORDINATOR;
    if (prefix.startsWith('tbm')) return Role.TBM;
    return Role.STUDENT;
  }

  private generateMockMSSV(role: Role): string {
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const prefix = role === Role.STUDENT ? '21' : role === Role.TUTOR ? 'GV' : 'NV';
    return `${prefix}${randomNum}`;
  }

  private generateMockName(seed: string): string {
    const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
    const middles = ['Văn', 'Thị', 'Hữu', 'Minh', 'Gia', 'Thanh', 'Quốc', 'Duy'];
    const names = ['An', 'Bình', 'Cường', 'Dũng', 'Giang', 'Hà', 'Khánh', 'Linh', 'Minh', 'Nam', 'Thảo'];
    const r = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return `${r(surnames)} ${r(middles)} ${r(names)}`;
  }

  private getRandomDepartment(): string {
    const depts = ['KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH', 'KHOA ĐIỆN - ĐIỆN TỬ', 'KHOA CƠ KHÍ', 'KHOA KỸ THUẬT HÓA HỌC'];
    return depts[Math.floor(Math.random() * depts.length)];
  }

  private generateMockPhone(): string {
    const prefixes = ['090', '091', '098', '097', '089'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
  }

  private generateMockClass(): string {
    const prefixes = ['CC', 'CK', 'DD', 'MT'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${20 + Math.floor(Math.random() * 4)}MB`;
  }
}