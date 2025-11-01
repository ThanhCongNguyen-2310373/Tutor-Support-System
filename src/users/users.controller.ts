// src/users/users.controller.ts
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@ApiTags('2. Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt')) // Bảo vệ endpoint này!
  @ApiBearerAuth() // Yêu cầu token trong Swagger
  getMyProfile(@Request() req) {
    // req.user được gán từ JwtStrategy
    return this.usersService.getProfile(req.user.id);
  }
}
