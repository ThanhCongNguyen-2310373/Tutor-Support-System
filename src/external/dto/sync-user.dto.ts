// src/external/dto/sync-user.dto.ts
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

/**
 * DTO for user data synced from HCMUT_DATACORE
 */
export class SyncUserDto {
  @IsString()
  userId: string; // MSSV hoặc Mã cán bộ

  @IsEmail()
  email: string; // Email học vụ (@hcmut.edu.vn)

  @IsString()
  fullName: string; // Họ tên đầy đủ

  @IsString()
  @IsOptional()
  department?: string; // Khoa/Chuyên ngành

  @IsEnum(Role)
  role: Role; // STUDENT, TUTOR, COORDINATOR, etc.

  @IsString()
  @IsOptional()
  status?: string; // Trạng thái học tập/giảng dạy

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  studentClass?: string; // Lớp sinh viên (nếu là STUDENT)
}

/**
 * Response từ HCMUT_SSO sau khi xác thực
 */
export class SSOAuthResponse {
  success: boolean;
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  message?: string;
}

/**
 * Request để sync user từ DATACORE
 */
export class SyncUserRequest {
  @IsString()
  userId: string; // MSSV hoặc Mã cán bộ
}
