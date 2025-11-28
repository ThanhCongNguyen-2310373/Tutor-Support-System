import React, { useEffect } from "react";
import "./NotificationSystem.css";
import { FiBell, FiCheckCircle, FiClock, FiAlertTriangle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  fetchUnreadCount,
  selectNotifications,
  selectNotificationsLoading,
  selectUnreadCount,
  markAsRead,
  markAllNotificationsAsRead,
} from "../../store/slices/notificationsSlice";

// ==================== DASHBOARD (HIỂN THỊ LIST) ====================

const NotificationDashboard = ({
  notifications,
  loading,
  unreadCount,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const total = notifications.length;
  const readCount = Math.max(0, total - unreadCount);

  const latestCreatedAt =
    total > 0 && notifications[0].createdAt
      ? new Date(notifications[0].createdAt).toLocaleString("vi-VN")
      : "-";

  return (
    <div className="notification-dashboard">
      {/* HỘP LỚN CHỨA HEADER + 4 Ô THỐNG KÊ */}
      <div className="top-section-card">
        <div className="dashboard-header">
          <div>
            <h2>Thông báo của bạn</h2>
            <p className="subtitle">
              Xem và quản lý các thông báo được hệ thống gửi cho tài khoản của bạn
            </p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <FiBell className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Tổng thông báo</p>
              <p className="stat-value">{total}</p>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">
              <FiAlertTriangle className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Chưa đọc</p>
              <p className="stat-value">{unreadCount}</p>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">
              <FiCheckCircle className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Đã đọc</p>
              <p className="stat-value">{readCount}</p>
            </div>
          </div>

          <div className="stat-card stat-danger">
            <div className="stat-icon">
              <FiClock className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <p className="stat-label">Mới nhất</p>
              <p className="stat-value">{latestCreatedAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-alert">
          {typeof error === "string"
            ? error
            : "Không thể tải thông báo. Vui lòng thử lại sau."}
        </div>
      )}

      {/* BẢNG THÔNG BÁO */}
      <div className="notification-list-card">
        <div className="table-container">
          <table className="notification-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Hành động</th>
              </tr>
            </thead>
<tbody>
  {loading ? (
    <tr>
      <td colSpan={5}>Đang tải thông báo...</td>
    </tr>
  ) : notifications.length === 0 ? (
    <tr>
      <td colSpan={5}>Hiện bạn chưa có thông báo nào.</td>
    </tr>
  ) : (
    notifications.map((item) => {
      // ID an toàn: dùng id | notificationId | _id
      const notifId = item.id ?? item.notificationId ?? item._id;
      const isRead = item.read ?? item.isRead;

      return (
        <tr key={notifId}>
          <td>
            <span className="notification-title">{item.title}</span>
          </td>
          <td>
            <span className="recipient-info">{item.message}</span>
          </td>
          <td>
            <span
              className={`badge ${
                isRead ? "badge-sent" : "badge-pending"
              }`}
            >
              {isRead ? "Đã đọc" : "Chưa đọc"}
            </span>
          </td>
          <td>
            <span className="time-info">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString("vi-VN")
                : ""}
            </span>
          </td>
          <td>
            {!isRead && (
              <button
                type="button"
                className="btn btn-link"
                onClick={() => onMarkAsRead(notifId)}
              >
                Đánh dấu đã đọc
              </button>
            )}
          </td>
        </tr>
      );
    })
  )}
</tbody>

          </table>
        </div>

        <div className="table-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onMarkAllAsRead}
            disabled={notifications.length === 0 || unreadCount === 0}
          >
            Đánh dấu tất cả là đã đọc
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENT CHÍNH ====================

const NotificationSystem = () => {
  const dispatch = useDispatch();

  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const unreadCount = useSelector(selectUnreadCount);
  const error = useSelector((state) => state.notifications.error);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 50 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  return (
    <div className="notification-system-container">
      <div className="notification-content">
        <NotificationDashboard
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          error={error}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
    </div>
  );
};

export default NotificationSystem;
