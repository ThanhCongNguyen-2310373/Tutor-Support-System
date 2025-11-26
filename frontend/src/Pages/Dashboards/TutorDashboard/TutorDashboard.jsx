import React, { useState, useEffect } from "react";
import "./TutorDashboard.css";
import Card from "../../../Components/Card/Card";
import pencilIcon from "../../../Components/Assets/file-pen-solid-full.svg";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api";

export default function TutorDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    averageRating: 0,
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all meetings
      const [pending, confirmed, history] = await Promise.all([
        meetingsService.getMyMeetings("PENDING"),
        meetingsService.getMyMeetings("CONFIRMED"),
        meetingsService.getHistory(),
      ]);

      const completed = history.filter((m) => m.status === "COMPLETED");

      // Calculate average rating from completed meetings with ratings
      const ratingsData = completed
        .flatMap((m) => m.ratings || [])
        .filter((r) => r.score);
      const avgRating =
        ratingsData.length > 0
          ? (ratingsData.reduce((sum, r) => sum + r.score, 0) / ratingsData.length).toFixed(1)
          : 0;

      setStats({
        pending: pending.length,
        confirmed: confirmed.length,
        completed: completed.length,
        averageRating: avgRating,
      });

      // Get recent 5 meetings
      const allMeetings = [...pending, ...confirmed, ...history];
      const sorted = allMeetings.sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime)
      );
      setRecentMeetings(sorted.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="td">
      {/* Tiêu đề */}
      <div className="td-title-wrap">
        <h1 className="td-title">Bảng điều khiển</h1>
      </div>

      {/* Stats Cards */}
      <div className="td-stats">
        <div className="stat-card stat-pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Chờ xử lý</div>
        </div>
        <div className="stat-card stat-confirmed">
          <div className="stat-value">{stats.confirmed}</div>
          <div className="stat-label">Đã xác nhận</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Hoàn thành</div>
        </div>
        <div className="stat-card stat-rating">
          <div className="stat-value">
            {stats.averageRating > 0 ? `${stats.averageRating} ⭐` : "—"}
          </div>
          <div className="stat-label">Đánh giá TB</div>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="td-section">
        <h2 className="td-section-title">Buổi học gần đây</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : recentMeetings.length === 0 ? (
          <p className="td-empty">Chưa có buổi học nào</p>
        ) : (
          <div className="td-meetings-list">
            {recentMeetings.map((meeting) => {
              const students = meeting.students || [];
              const mainStudent = students[0];
              return (
                <Link
                  key={meeting.id}
                  to={`/sessions/${meeting.id}`}
                  className="td-meeting-card"
                >
                  <div className="td-meeting-time">
                    {new Date(meeting.startTime).toLocaleString("vi-VN")}
                  </div>
                  <div className="td-meeting-student">
                    Sinh viên: {mainStudent?.fullName || "—"}
                    {students.length > 1 && ` +${students.length - 1} người`}
                  </div>
                  <div className="td-meeting-topic">
                    {meeting.topic || "Không có chủ đề"}
                  </div>
                  <span
                    className={`td-meeting-status status-${meeting.status.toLowerCase()}`}
                  >
                    {meeting.status}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel nội dung */}
      <div className="td-panel">
        <h2 className="td-section-title">Hành động nhanh</h2>
        <div className="td-grid">
          <div className="td-card-center">
            <Link to="/sessions" className="td-card-link">
              <Card
                title="Quản lý buổi học"
                icon={pencilIcon}
                iconColor="#D4FF00"
                iconSize={120}
              />
            </Link>
          </div>
          <div className="td-card-center">
            <Link to="/dashboard/tutor/availability" className="td-card-link">
              <Card
                title="Quản lý lịch trống"
                icon={pencilIcon}
                iconColor="#667eea"
                iconSize={120}
              />
            </Link>
          </div>
          <div className="td-card-center">
            <Link to="/dashboard/tutor/students" className="td-card-link">
              <Card
                title="Học sinh của tôi"
                icon={pencilIcon}
                iconColor="#48bb78"
                iconSize={120}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
