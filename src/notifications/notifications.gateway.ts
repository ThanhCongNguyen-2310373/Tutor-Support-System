// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Notification Event Types
export enum NotificationEvent {
  // 1. New booking request (Tutor receives)
  NEW_BOOKING_REQUEST = 'notification:new_booking_request',
  
  // 2. Booking status change
  BOOKING_CONFIRMED = 'notification:booking_confirmed',
  BOOKING_REJECTED = 'notification:booking_rejected',
  BOOKING_CANCELLED = 'notification:booking_cancelled',
  
  // 3. Meeting reminders
  MEETING_REMINDER_24H = 'notification:meeting_reminder_24h',
  MEETING_REMINDER_1H = 'notification:meeting_reminder_1h',
  MEETING_STARTED = 'notification:meeting_started',
  MEETING_COMPLETED = 'notification:meeting_completed',
  
  // 4. Messages/Notifications
  NEW_MESSAGE = 'notification:new_message',
  NEW_NOTIFICATION = 'notification:new_notification',
  
  // 5. System alerts
  SYSTEM_ALERT = 'notification:system_alert',
  MAINTENANCE_MODE = 'notification:maintenance_mode',
  EMERGENCY_ALERT = 'notification:emergency_alert',
}

// Notification Payload Interface
export interface NotificationPayload {
  id: number;
  userId: number;
  type: NotificationEvent;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
}

@WebSocketGateway({
  cors: {
    //origin: ['http://localhost:3000', 'http://localhost:5173'], // Frontend URLs
    origin: true, // Allow all origins
    credentials: true,
  },
  namespace: '/notifications', // Socket namespace
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  
  // Map để lưu userId -> socketId
  private userSockets = new Map<number, string>();
  
  // Map để lưu socketId -> userId
  private socketUsers = new Map<string, number>();

  constructor(private jwtService: JwtService) {}

  /**
   * Gateway initialized
   */
  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway initialized');
    this.logger.log(`📡 Listening on namespace: /notifications`);
  }

  /**
   * Client connected
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`❌ Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Store mappings
      this.userSockets.set(userId, client.id);
      this.socketUsers.set(client.id, userId);

      // Join user to their personal room
      client.join(`user:${userId}`);

      this.logger.log(`✅ User ${userId} connected (Socket: ${client.id})`);
      this.logger.log(`👥 Active connections: ${this.userSockets.size}`);

      // Send connection success
      client.emit('connection:success', {
        message: 'Connected to notification service',
        userId,
      });
    } catch (error) {
      this.logger.error(`❌ Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Client disconnected
   */
  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    
    if (userId) {
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);
      this.logger.log(`👋 User ${userId} disconnected (Socket: ${client.id})`);
      this.logger.log(`👥 Active connections: ${this.userSockets.size}`);
    }
  }

  /**
   * Client subscribes to notifications
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    const userId = this.socketUsers.get(client.id);
    this.logger.log(`📬 User ${userId} subscribed to notifications`);
    
    return {
      event: 'subscribed',
      data: { message: 'Successfully subscribed to notifications' },
    };
  }

  /**
   * Client marks notification as read
   */
  @SubscribeMessage('notification:mark_read')
  handleMarkRead(
    @MessageBody() data: { notificationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);
    this.logger.log(`✅ User ${userId} marked notification ${data.notificationId} as read`);
    
    return {
      event: 'notification:marked_read',
      data: { notificationId: data.notificationId },
    };
  }

  // ==========================================
  // EMIT METHODS - Called by services
  // ==========================================

  /**
   * 1. Send new booking request notification to tutor
   */
  emitNewBookingRequest(tutorUserId: number, payload: NotificationPayload) {
    this.logger.log(`📩 Sending new booking request to tutor ${tutorUserId}`);
    this.emitToUser(tutorUserId, NotificationEvent.NEW_BOOKING_REQUEST, payload);
  }

  /**
   * 2. Send booking confirmed notification to student
   */
  emitBookingConfirmed(studentUserId: number, payload: NotificationPayload) {
    this.logger.log(`✅ Sending booking confirmed to student ${studentUserId}`);
    this.emitToUser(studentUserId, NotificationEvent.BOOKING_CONFIRMED, payload);
  }

  /**
   * 2. Send booking rejected notification to student
   */
  emitBookingRejected(studentUserId: number, payload: NotificationPayload) {
    this.logger.log(`❌ Sending booking rejected to student ${studentUserId}`);
    this.emitToUser(studentUserId, NotificationEvent.BOOKING_REJECTED, payload);
  }

  /**
   * 2. Send booking cancelled notification
   */
  emitBookingCancelled(userId: number, payload: NotificationPayload) {
    this.logger.log(`🚫 Sending booking cancelled to user ${userId}`);
    this.emitToUser(userId, NotificationEvent.BOOKING_CANCELLED, payload);
  }

  /**
   * 3. Send meeting reminder (24h before)
   */
  emitMeetingReminder24h(userId: number, payload: NotificationPayload) {
    this.logger.log(`⏰ Sending 24h meeting reminder to user ${userId}`);
    this.emitToUser(userId, NotificationEvent.MEETING_REMINDER_24H, payload);
  }

  /**
   * 3. Send meeting reminder (1h before)
   */
  emitMeetingReminder1h(userId: number, payload: NotificationPayload) {
    this.logger.log(`⏰ Sending 1h meeting reminder to user ${userId}`);
    this.emitToUser(userId, NotificationEvent.MEETING_REMINDER_1H, payload);
  }

  /**
   * 3. Send meeting completed notification
   */
  emitMeetingCompleted(studentUserId: number, payload: NotificationPayload) {
    this.logger.log(`🎯 Sending meeting completed to student ${studentUserId}`);
    this.emitToUser(studentUserId, NotificationEvent.MEETING_COMPLETED, payload);
  }

  /**
   * 4. Send new message notification
   */
  emitNewMessage(userId: number, payload: NotificationPayload) {
    this.logger.log(`💬 Sending new message to user ${userId}`);
    this.emitToUser(userId, NotificationEvent.NEW_MESSAGE, payload);
  }

  /**
   * 4. Send new notification
   */
  emitNewNotification(userId: number, payload: NotificationPayload) {
    this.logger.log(`🔔 Sending new notification to user ${userId}`);
    this.emitToUser(userId, NotificationEvent.NEW_NOTIFICATION, payload);
  }

  /**
   * 5. Send system alert to all users
   */
  emitSystemAlert(payload: NotificationPayload) {
    this.logger.log(`🚨 Broadcasting system alert to all users`);
    this.server.emit(NotificationEvent.SYSTEM_ALERT, payload);
  }

  /**
   * 5. Send system alert to specific role
   */
  emitSystemAlertToRole(role: string, payload: NotificationPayload) {
    this.logger.log(`🚨 Broadcasting system alert to role: ${role}`);
    this.server.to(`role:${role}`).emit(NotificationEvent.SYSTEM_ALERT, payload);
  }

  /**
   * 5. Send maintenance mode notification
   */
  emitMaintenanceMode(payload: NotificationPayload) {
    this.logger.log(`🔧 Broadcasting maintenance mode to all users`);
    this.server.emit(NotificationEvent.MAINTENANCE_MODE, payload);
  }

  /**
   * 5. Send emergency alert
   */
  emitEmergencyAlert(payload: NotificationPayload) {
    this.logger.log(`🚨 Broadcasting EMERGENCY alert to all users`);
    this.server.emit(NotificationEvent.EMERGENCY_ALERT, payload);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Emit to specific user
   */
  private emitToUser(userId: number, event: NotificationEvent, payload: NotificationPayload) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(`user:${userId}`).emit(event, payload);
      this.logger.log(`✅ Notification sent to user ${userId} (Socket: ${socketId})`);
    } else {
      this.logger.warn(`⚠️ User ${userId} is not connected`);
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get all online user IDs
   */
  getOnlineUserIds(): number[] {
    return Array.from(this.userSockets.keys());
  }
}
