import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsService } from '../../api';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchNotificationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false;
      state.notifications = action.payload.notifications;
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
    },
    fetchNotificationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    appendNotifications: (state, action) => {
      state.notifications = [...state.notifications, ...action.payload.notifications];
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload.notifications;
      state.page = action.payload.page;
      state.hasMore = action.payload.hasMore;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch unread count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
    
    // Mark as read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
    
    // Mark all as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
    });
  },
});

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  appendNotifications,
  setUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  addNotification,
  incrementUnreadCount,
  clearError,
} = notificationsSlice.actions;

// Thunks for async actions using createAsyncThunk
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await notificationsService.getAll(page, limit);
      return {
        notifications: response.data || response,
        page,
        hasMore: response.data ? response.hasMore : false,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsService.getUnreadCount();
      return response.count || 0;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationsService.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark all as read');
    }
  }
);

export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.loading;

export default notificationsSlice.reducer;
