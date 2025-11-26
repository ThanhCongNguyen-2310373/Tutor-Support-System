import apiClient from './client';

export const notificationsService = {
  // Get all notifications
  getAll: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unread count' };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification as read' };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark all as read' };
    }
  },
};

export default notificationsService;
