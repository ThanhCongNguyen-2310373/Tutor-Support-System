// src/store/slices/notificationsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsService, notiService } from "../../api.js";

const extractData = (res) =>
  res && res.data !== undefined ? res.data : res || [];

// Tìm notification theo nhiều kiểu id khác nhau
const findNotificationIndexById = (list, id) => {
  const idStr = String(id);
  return list.findIndex((n) => {
    const nid = n.id ?? n.notificationId ?? n._id;
    return String(nid) === idStr;
  });
};

/* ================== ASYNC THUNKS ================== */

// Lấy danh sách thông báo
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const res = await notificationsService.getAll(page, limit);
      const data = extractData(res);
      return data;
    } catch (error) {
      console.error("fetchNotifications error", error);
      return rejectWithValue(
        error.response?.data || "Không thể tải thông báo"
      );
    }
  }
);

// Lấy số chưa đọc
export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationsService.getUnreadCount();
      const data = extractData(res);
      if (typeof data === "number") return data;
      return data.unreadCount ?? 0;
    } catch (error) {
      console.error("fetchUnreadCount error", error);
      return rejectWithValue(
        error.response?.data || "Không thể tải số thông báo chưa đọc"
      );
    }
  }
);

// Một notification: thử PATCH, nếu lỗi thì fallback sang POST
export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      try {
        await notificationsService.markAsRead(notificationId); // PATCH
      } catch (err) {
        // nếu server cũ dùng POST thì xài notiService
        await notiService.markAsRead(notificationId);
      }
      return notificationId;
    } catch (error) {
      console.error("markAsRead error", error);
      return rejectWithValue(
        error.response?.data || "Không thể đánh dấu đã đọc"
      );
    }
  }
);

// Tất cả notification
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      try {
        await notificationsService.markAllAsRead(); // PATCH
      } catch (err) {
        await notiService.markAllAsRead(); // POST fallback
      }
      return true;
    } catch (error) {
      console.error("markAllNotificationsAsRead error", error);
      return rejectWithValue(
        error.response?.data || "Không thể đánh dấu tất cả đã đọc"
      );
    }
  }
);

/* ================== SLICE ================== */

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Dùng khi có thông báo realtime từ WebSocket
    addNotification(state, action) {
      const notif = action.payload;
      if (!notif) return;

      state.notifications.unshift(notif);

      const isRead = notif.read ?? notif.isRead;
      if (!isRead) {
        state.unreadCount += 1;
      }
    },

    // Được import ở useWebSocket.js
    incrementUnreadCount(state) {
      state.unreadCount += 1;
    },

    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ------ FETCH LIST ------
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const payload = action.payload;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : [];

        state.notifications = list;

        // Tính lại số chưa đọc
        const unread = list.filter((item) => {
          const isRead = item.read ?? item.isRead;
          return !isRead;
        }).length;
        state.unreadCount = unread;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          "Không thể tải thông báo. Vui lòng thử lại sau.";
      })

      // ------ FETCH UNREAD COUNT ------
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        if (typeof action.payload === "number") {
          state.unreadCount = action.payload;
        }
      })

      // ------ MARK ONE AS READ ------
      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const idx = findNotificationIndexById(state.notifications, id);
        if (idx !== -1) {
          const target = state.notifications[idx];
          target.read = true;
          target.isRead = true;
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload || "Không thể đánh dấu đã đọc";
      })

      // ------ MARK ALL AS READ ------
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
          isRead: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload || "Không thể đánh dấu tất cả đã đọc";
      });
  },
});

/* ================== SELECTORS ================== */

export const selectNotifications = (state) =>
  state.notifications.notifications;

export const selectNotificationsLoading = (state) =>
  state.notifications.loading;

export const selectUnreadCount = (state) =>
  state.notifications.unreadCount;

/* ================== EXPORTS ================== */

export const {
  addNotification,
  clearNotifications,
  incrementUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
