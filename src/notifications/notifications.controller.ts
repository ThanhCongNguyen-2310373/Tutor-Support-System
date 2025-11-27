// src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all notifications for current user',
    description: 'Retrieve notifications list with pagination',
  })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @GetUser('userId') userId: number,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.notificationsService.getNotifications(userId, limit);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notifications count',
    description: 'Get the number of unread notifications for current user',
  })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount(@GetUser('userId') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read',
  })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Post('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for current user',
  })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@GetUser('userId') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete a specific notification',
  })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationsService.deleteNotification(userId, notificationId);
  }

  @Delete('read/all')
  @ApiOperation({
    summary: 'Delete all read notifications',
    description: 'Delete all read notifications for current user',
  })
  @ApiResponse({ status: 200, description: 'Read notifications deleted' })
  async deleteAllRead(@GetUser('userId') userId: number) {
    return this.notificationsService.deleteAllRead(userId);
  }
}
