// src/users/users.controller.ts
import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
}
