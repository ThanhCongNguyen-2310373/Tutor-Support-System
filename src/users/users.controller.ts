// src/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApplyTutorDto } from './dto/tutor-application.dto';

@ApiTags('2. Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt')) // Bảo vệ endpoint này!
  @ApiBearerAuth() // Yêu cầu token trong Swagger
  @ApiOperation({ summary: 'Xem profile cá nhân' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  getMyProfile(@Request() req) {
    // req.user được gán từ JwtStrategy
    return this.usersService.getProfile(req.user.id);
  }

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật profile cá nhân' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async updateMyProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateDto);
  }

  @Post('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPG, PNG, WEBP, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Upload thành công' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const avatarUrl = await this.usersService.uploadAvatar(req.user.id, file);
    return {
      message: 'Avatar uploaded successfully',
      avatarUrl,
    };
  }

  @Delete('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa avatar' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async deleteAvatar(@Request() req) {
    await this.usersService.deleteAvatar(req.user.id);
    return {
      message: 'Avatar deleted successfully',
    };
  }

  @Get('me/progress')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.STUDENT) // Chỉ sinh viên mới được xem tiến độ của mình
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem tiến độ học tập của bản thân (Dành cho Student)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không phải là Student' })
  async getMyProgress(@Request() req) {
    return this.usersService.getMyProgress(req.user.id);
  }

  @Post('apply-tutor')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nộp đơn đăng ký trở thành Tutor' })
  @ApiResponse({ status: 201, description: 'Nộp đơn thành công' })
  @ApiResponse({ status: 400, description: 'Bạn đã là Tutor hoặc đã có đơn đang chờ duyệt' })
  async applyTutor(@Request() req, @Body() dto: ApplyTutorDto) {
    return this.usersService.applyToBecomeTutor(req.user.id, dto);
  }
}
