// src/notifications/notifications.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { NotificationsGateway, NotificationEvent, NotificationPayload } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create notification in database and emit via WebSocket
   */
  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationEvent = NotificationEvent.NEW_NOTIFICATION,
    data?: any,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  ) {
    // Create in database
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: userId,
        title,
        message,
      },
    });

    // Prepare payload
    const payload: NotificationPayload = {
      id: notification.id,
      userId: notification.recipientId,
      type,
      title: notification.title,
      message: notification.message,
      data,
      priority,
      read: false,
      createdAt: notification.createdAt,
    };

    // Emit real-time notification
    this.notificationsGateway.emitNewNotification(userId, payload);

    this.logger.log(`📝 Created notification ${notification.id} for user ${userId}`);
    return notification;
  }

  /**
   * Get all notifications for a user
   */
  async getNotifications(userId: number, limit: number = 20) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });

    if (!notification) {
      throw new BadRequestException('Không có quyền xem thông báo này hoặc không tìm thấy thông báo');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    this.logger.log(`✅ Notification ${notificationId} marked as read by user ${userId}`);
    return updated;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    this.logger.log(`✅ ${result.count} notifications marked as read for user ${userId}`);
    return { markedCount: result.count };
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    this.logger.log(`🗑️ Notification ${notificationId} deleted by user ${userId}`);
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: number) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        recipientId: userId,
        isRead: true,
      },
    });

    this.logger.log(`🗑️ ${result.count} read notifications deleted for user ${userId}`);
    return { deletedCount: result.count };
  }

  // ==========================================
  // HELPER METHODS for emitting notifications
  // ==========================================

  /**
   * Emit new booking request (called by MeetingsService)
   */
  async notifyNewBookingRequest(tutorUserId: number, bookingData: any) {
    const payload: NotificationPayload = {
      id: 0, // Temporary, will be replaced by DB ID
      userId: tutorUserId,
      type: NotificationEvent.NEW_BOOKING_REQUEST,
      title: '📩 Yêu cầu đặt lịch mới',
      message: `Bạn có một yêu cầu đặt lịch mới từ ${bookingData.studentName}`,
      data: bookingData,
      priority: 'high',
      read: false,
      createdAt: new Date(),
    };

    await this.createNotification(
      tutorUserId,
      payload.title,
      payload.message,
      payload.type,
      payload.data,
      payload.priority,
    );
  }

  /**
   * Emit booking confirmed (called by MeetingsService)
   */
  async notifyBookingConfirmed(studentUserId: number, bookingData: any) {
    const payload: NotificationPayload = {
      id: 0,
      userId: studentUserId,
      type: NotificationEvent.BOOKING_CONFIRMED,
      title: '✅ Buổi hẹn đã được xác nhận',
      message: `Tutor ${bookingData.tutorName} đã xác nhận buổi hẹn của bạn`,
      data: bookingData,
      priority: 'high',
      read: false,
      createdAt: new Date(),
    };

    await this.createNotification(
      studentUserId,
      payload.title,
      payload.message,
      payload.type,
      payload.data,
      payload.priority,
    );
  }

  /**
   * Emit booking rejected
   */
  async notifyBookingRejected(studentUserId: number, bookingData: any) {
    const payload: NotificationPayload = {
      id: 0,
      userId: studentUserId,
      type: NotificationEvent.BOOKING_REJECTED,
      title: '❌ Buổi hẹn đã bị từ chối',
      message: `Tutor ${bookingData.tutorName} đã từ chối buổi hẹn của bạn`,
      data: bookingData,
      priority: 'medium',
      read: false,
      createdAt: new Date(),
    };

    await this.createNotification(
      studentUserId,
      payload.title,
      payload.message,
      payload.type,
      payload.data,
      payload.priority,
    );
  }

  /**
   * Emit meeting reminder (24h before)
   */
  async notifyMeetingReminder24h(userId: number, meetingData: any) {
    const payload: NotificationPayload = {
      id: 0,
      userId,
      type: NotificationEvent.MEETING_REMINDER_24H,
      title: '⏰ Nhắc nhở: Buổi hẹn vào ngày mai',
      message: `Bạn có buổi hẹn vào ngày mai lúc ${meetingData.time}`,
      data: meetingData,
      priority: 'medium',
      read: false,
      createdAt: new Date(),
    };

    await this.createNotification(
      userId,
      payload.title,
      payload.message,
      payload.type,
      payload.data,
      payload.priority,
    );
  }

  /**
   * Emit meeting completed
   */
  async notifyMeetingCompleted(studentUserId: number, meetingData: any) {
    const payload: NotificationPayload = {
      id: 0,
      userId: studentUserId,
      type: NotificationEvent.MEETING_COMPLETED,
      title: '🎯 Buổi học đã hoàn thành',
      message: 'Hãy đánh giá buổi học để giúp cải thiện chất lượng!',
      data: meetingData,
      priority: 'low',
      read: false,
      createdAt: new Date(),
    };

    await this.createNotification(
      studentUserId,
      payload.title,
      payload.message,
      payload.type,
      payload.data,
      payload.priority,
    );
  }
}
