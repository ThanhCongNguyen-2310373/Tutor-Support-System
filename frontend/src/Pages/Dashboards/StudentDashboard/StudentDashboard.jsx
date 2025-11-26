import React, { useState, useEffect } from "react";
import "./StudentDashboard.css";
import Card from "../../../Components/Card/Card";
import bookIcon from "../../../Components/Assets/book-solid-full.svg";
import tutorIcon from "../../../Components/Assets/user-graduate-solid-full.svg";
import pencil from "../../../Components/Assets/pencil-solid-full.svg";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api";

export default function StudentDashboard() {
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch upcoming meetings
      const upcoming = await meetingsService.getUpcoming();
      setUpcomingMeetings(upcoming.slice(0, 5)); // Show max 5

      // Fetch history to calculate stats
      const history = await meetingsService.getHistory();
      const completed = history.filter((m) => m.status === "COMPLETED");

      setStats({
        total: upcoming.length + history.length,
        upcoming: upcoming.length,
        completed: completed.length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sd">
      <div className="sd-title-wrap">
        <h1 className="sd-title">Bảng điều khiển</h1>
      </div>

      {/* Stats Cards */}
      <div className="sd-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Tổng buổi học</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Sắp diễn ra</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Đã hoàn thành</div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="sd-section">
        <h2 className="sd-section-title">Buổi học sắp tới</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : upcomingMeetings.length === 0 ? (
          <p className="sd-empty">Bạn chưa có buổi học nào sắp tới</p>
        ) : (
          <div className="sd-meetings-list">
            {upcomingMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                to={`/sessions/${meeting.id}`}
                className="sd-meeting-card"
              >
                <div className="sd-meeting-time">
                  {new Date(meeting.startTime).toLocaleString("vi-VN")}
                </div>
                <div className="sd-meeting-topic">{meeting.topic || "Không có chủ đề"}</div>
                <div className="sd-meeting-tutor">
                  Giảng viên: {meeting.tutor?.user?.fullName || "—"}
                </div>
                <span className={`sd-meeting-status status-${meeting.status.toLowerCase()}`}>
                  {meeting.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="sd-panel">
        <h2 className="sd-section-title">Hành động nhanh</h2>
        <div className="sd-grid">
          <Link to="/library" className="sd-card-link">
            <Card title="Thư viện HCMUT" icon={bookIcon} iconColor="#FF7051" />
          </Link>

          <Link to="/register" className="sd-card-link">
            <Card title="Tìm giảng viên" icon={tutorIcon} iconColor="#2F8E70" />
          </Link>

          <div className="sd-card-center">
            <Link to="/feedback" className="sd-card-link">
              <Card title="Đánh giá khóa học" icon={pencil} iconColor="#FFC940" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
