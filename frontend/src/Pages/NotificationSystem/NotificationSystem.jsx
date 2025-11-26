// src/Pages/NotificationSystem/NotificationSystem.jsx
import React, { useState } from 'react';
import './NotificationSystem.css';
import {
  notificationStats,
  notificationList,
  notificationLogs,
  scheduledNotifications,
  recipientGroups
} from '../../data/notificationData';
import {
  FiBell, FiCheckCircle, FiClock, FiAlertTriangle,
  FiUsers, FiBarChart2, FiClipboard, FiCalendar
} from 'react-icons/fi';

// ==================== COMPONENT CON - ĐẶT BÊN NGOÀI ====================

// Dashboard Component
const NotificationDashboard = ({ setActiveTab }) => (
  <div className="notification-dashboard">
    <div className="dashboard-header">
      <div>
        <h2>Quản lý thông báo</h2>
        <p className="subtitle">Theo dõi và quản lý tất cả thông báo trong hệ thống</p>
      </div>
      {/* <button className="btn btn-primary" onClick={() => setActiveTab('create')}>
        <span className="icon">✉️</span>
        Tạo thông báo mới
      </button> */}
    </div>

    <div className="stats-grid">
      <div className="stat-card stat-primary">
          <FiBell className="stat-icon-svg" />
        <div className="stat-content">
          <p className="stat-label">Tổng thông báo</p>
          <p className="stat-value">{notificationStats.total}</p>
        </div>
      </div>
      <div className="stat-card stat-success">
          <FiCheckCircle className="stat-icon-svg" />
        <div className="stat-content">
          <p className="stat-label">Đã gửi</p>
          <p className="stat-value">{notificationStats.sent}</p>
        </div>
      </div>
      <div className="stat-card stat-warning">
          <FiClock className="stat-icon-svg" />
        <div className="stat-content">
          <p className="stat-label">Đang chờ</p>
          <p className="stat-value">{notificationStats.pending}</p>
        </div>
      </div>
      <div className="stat-card stat-danger">
          <FiAlertTriangle className="stat-icon-svg" />
        <div className="stat-content">
          <p className="stat-label">Thất bại</p>
          <p className="stat-value">{notificationStats.failed}</p>
        </div>
      </div>
    </div>

    <div className="notification-list-card">
      <div className="table-container">
        <table className="notification-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Tiêu đề</th>
              <th>Người nhận</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {notificationList.map((notif) => (
              <tr key={notif.id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>
                  <span className="notification-title">{notif.title}</span>
                </td>
                <td>
                  <span className="recipient-info">{notif.recipient}</span>
                </td>
                <td>
                  <span className={`badge badge-${notif.status}`}>
                    {notif.status === 'sent' ? 'Đã gửi' : 
                     notif.status === 'pending' ? 'Đang chờ' : 'Thất bại'}
                  </span>
                </td>
                <td>
                  <span className="time-info">{notif.time}</span>
                </td>
                <td>
                  <button className="btn btn-link">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Create Notification Component
const CreateNotification = ({ 
  notificationForm, 
  setNotificationForm, 
  selectedRecipients, 
  setSelectedRecipients,
  setActiveTab
}) => {
  const handleInputChange = (field, value) => {
    setNotificationForm(prev => ({ ...prev, [field]: value }));
  };

  const addRecipientGroup = (group) => {
    if (!selectedRecipients.find(r => r.id === group.id)) {
      setSelectedRecipients([...selectedRecipients, group]);
    }
  };

  const removeRecipient = (groupId) => {
    setSelectedRecipients(selectedRecipients.filter(r => r.id !== groupId));
  };

  return (
    <div className="create-notification">
      <div className="create-header">
        <h2>Tạo thông báo mới</h2>
        <p className="subtitle">Soạn và gửi thông báo đến người dùng trong hệ thống</p>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label className="form-label">Loại thông báo</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="general"
                checked={notificationForm.type === 'general'}
                onChange={(e) => handleInputChange('type', e.target.value)}
              />
              <span>Thông báo chung</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="personal"
                checked={notificationForm.type === 'personal'}
                onChange={(e) => handleInputChange('type', e.target.value)}
              />
              <span>Thông báo cá nhân</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="recurring"
                checked={notificationForm.type === 'recurring'}
                onChange={(e) => handleInputChange('type', e.target.value)}
              />
              <span>Thông báo định kỳ</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Độ ưu tiên</label>
          <select
            className="form-select"
            value={notificationForm.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
          >
            <option value="normal">Bình thường</option>
            <option value="important">Quan trọng</option>
            <option value="urgent">Khẩn cấp (gửi kèm Email)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
              <FiUsers className="icon" />
            Người nhận
          </label>
          <div className="recipient-selector">
            <div className="recipient-search">
              <input
                type="text"
                placeholder="Chọn nhóm người nhận..."
                className="form-input"
              />
            </div>
            <div className="recipient-groups">
              <p className="group-title">Nhóm người dùng:</p>
              <div className="group-buttons">
                {recipientGroups.map((group) => (
                  <button
                    key={group.id}
                    className="btn btn-outline btn-sm"
                    onClick={() => addRecipientGroup(group)}
                  >
                    {group.name} ({group.count})
                  </button>
                ))}
              </div>
            </div>
            {selectedRecipients.length > 0 && (
              <div className="selected-recipients">
                <p className="selected-title">Đã chọn:</p>
                <div className="recipient-tags">
                  {selectedRecipients.map((recipient) => (
                    <span key={recipient.id} className="recipient-tag">
                      {recipient.name} ({recipient.count})
                      <button
                        className="remove-tag"
                        onClick={() => removeRecipient(recipient.id)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tiêu đề</label>
          <input
            type="text"
            className="form-input"
            placeholder="VD: Nhắc nhở nộp bài tập tuần 5"
            value={notificationForm.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nội dung</label>
          <textarea
            className="form-textarea"
            rows="4"
            placeholder="Nhập nội dung thông báo..."
            value={notificationForm.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Link đính kèm (tùy chọn)</label>
          <input
            type="text"
            className="form-input"
            placeholder="/tasks/101"
            value={notificationForm.link}
            onChange={(e) => handleInputChange('link', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notificationForm.scheduled}
              onChange={(e) => handleInputChange('scheduled', e.target.checked)}
            />
            <span>Lên lịch gửi</span>
          </label>
          {notificationForm.scheduled && (
            <input
              type="datetime-local"
              className="form-input"
              value={notificationForm.scheduleTime}
              onChange={(e) => handleInputChange('scheduleTime', e.target.value)}
            />
          )}
        </div>

        <div className="notification-preview">
          <p className="preview-label">Xem trước thông báo:</p>
          <div className="preview-box">
            <div className="preview-notification">
            <FiBell className="icon" />
              <div className="preview-content">
                <h4>{notificationForm.title || 'Tiêu đề thông báo'}</h4>
                <p>{notificationForm.content || 'Nội dung thông báo sẽ hiển thị ở đây...'}</p>
                <span className="preview-time">Vừa xong</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary btn-large">
            <span className="icon">✉️</span>
            Gửi ngay
          </button>
          <button className="btn btn-secondary">Lưu nháp</button>
          <button className="btn btn-outline" onClick={() => setActiveTab('dashboard')}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Log Component
const NotificationLog = () => (
  <div className="notification-log">
    <div className="log-header">
      <div>
        <h2>Nhật ký gửi thông báo</h2>
        <p className="subtitle">Theo dõi chi tiết quá trình gửi thông báo</p>
      </div>
      <div className="log-filters">
        <input type="date" className="form-input" />
        <select className="form-select">
          <option>Tất cả trạng thái</option>
          <option>Thành công</option>
          <option>Thất bại</option>
          <option>Đang xử lý</option>
        </select>
      </div>
    </div>

    <div className="log-table-card">
      <div className="table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>Message ID</th>
              <th>Người nhận</th>
              <th>Trạng thái</th>
              <th>Kênh gửi</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {notificationLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span className="message-id">{log.messageId}</span>
                </td>
                <td>
                  <div className="recipient-cell">
                    <span className="recipient-name">{log.recipientName}</span>
                    <span className="recipient-id">{log.recipient}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${log.status === 'success' ? 'sent' : log.status === 'retry' ? 'pending' : 'failed'}`}>
                    {log.status === 'success' ? 'Thành công' :
                     log.status === 'retry' ? 'Đang retry' : 'Thất bại'}
                  </span>
                </td>
                <td>
                  <span className="channel-info">
                    {log.channel.includes('Email') && '📧 '}
                    {log.channel}
                  </span>
                </td>
                <td>
                  <span className="timestamp">{log.timestamp}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination-info">Hiển thị 1-5 trong 234 bản ghi</span>
        <div className="pagination-buttons">
          <button className="btn btn-outline btn-sm">Trước</button>
          <button className="btn btn-primary btn-sm">1</button>
          <button className="btn btn-outline btn-sm">2</button>
          <button className="btn btn-outline btn-sm">3</button>
          <button className="btn btn-outline btn-sm">Sau</button>
        </div>
      </div>
    </div>
  </div>
);

// Scheduled Notifications Component
const ScheduledNotifications = () => (
  <div className="scheduled-notifications">
    <div className="scheduled-header">
      <div>
        <h2>Thông báo định kỳ</h2>
        <p className="subtitle">Quản lý các thông báo gửi tự động theo lịch</p>
      </div>
      <button className="btn btn-primary">
        <FiClock className="icon" />
        Tạo lịch mới
      </button>
    </div>

    <div className="scheduled-list">
      {scheduledNotifications.map((schedule) => (
        <div key={schedule.id} className="schedule-card">
          <div className="schedule-info">
            <div className="schedule-header-row">
              <h3>{schedule.name}</h3>
              <span className={`badge badge-${schedule.active ? 'sent' : 'pending'}`}>
                {schedule.active ? 'Đang chạy' : 'Tạm dừng'}
              </span>
            </div>
            <div className="schedule-details">
              <p>
                <FiClock className="icon" />
                {schedule.schedule}
              </p>
              <p>
                  <FiUsers className="icon" />
                {schedule.recipients}
              </p>
              {schedule.nextRun && (
                <p className="next-run">
                  Lần chạy tiếp theo: {schedule.nextRun}
                </p>
              )}
            </div>
          </div>
          <div className="schedule-actions">
            <button className="btn btn-link">Chỉnh sửa</button>
            <button className="btn btn-link btn-danger">Xóa</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ==================== COMPONENT CHÍNH ====================

const NotificationSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [notificationForm, setNotificationForm] = useState({
    type: 'general',
    priority: 'normal',
    title: '',
    content: '',
    link: '',
    scheduled: false,
    scheduleTime: ''
  });

  return (
    <div className="notification-system-container">
      <div className="notification-content">
        {/* <div className="breadcrumb-card">
          <span>Admin Dashboard</span>
          <span>/</span>
          <span className="breadcrumb-active">Hệ thống thông báo</span>
        </div> */}

        <div className="tabs-card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FiBarChart2 className="icon" />
              Dashboard
            </button>
            <button
              className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <FiClipboard className="icon" />
              Tạo thông báo
            </button>
            <button
              className={`tab ${activeTab === 'scheduled' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('scheduled')}
            >
              <FiCalendar className="icon" />
              Định kỳ
            </button>
            <button
              className={`tab ${activeTab === 'log' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('log')}
            >
              <FiUsers className="icon" />
              Nhật ký
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && <NotificationDashboard setActiveTab={setActiveTab} />}
        {activeTab === 'create' && (
          <CreateNotification 
            notificationForm={notificationForm}
            setNotificationForm={setNotificationForm}
            selectedRecipients={selectedRecipients}
            setSelectedRecipients={setSelectedRecipients}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'log' && <NotificationLog />}
        {activeTab === 'scheduled' && <ScheduledNotifications />}
      </div>
    </div>
  );
};

export default NotificationSystem;