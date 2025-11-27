import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api";
import pencilIcon from "../../../Components/Assets/file-pen-solid-full.svg";

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
      const [pending, confirmed, history] = await Promise.all([
        meetingsService.getMyMeetings("PENDING"),
        meetingsService.getMyMeetings("CONFIRMED"),
        meetingsService.getHistory(),
      ]);

      const completed = history.filter((m) => m.status === "COMPLETED");

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

      const allMeetings = [...pending, ...confirmed, ...history];
      const sorted = allMeetings.sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime)
      );
      setRecentMeetings(sorted.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutor-dashboard-container">
      {/* SIDEBAR TRÁI - MENU NHANH */}
      <aside className="td-sidebar">
        <h2 className="sidebar-title">Quản lý nhanh</h2>
        <div className="sidebar-actions">
          <Link to="/sessions" className="sidebar-item">
            <span className>Quản lý buổi học</span>
          </Link>

          <Link to="/dashboard/tutor/availability" className="sidebar-item">
            <span className>Lịch trống của tôi</span>
          </Link>

          <Link to="/dashboard/tutor/students" className="sidebar-item">
            <span className>Học sinh của tôi</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT PHẢI */}
      <main className="td-main-content">
        <h1 className="main-title">Chào mừng Giảng viên trở lại!</h1>

        {/* THỐNG KÊ SIÊU ĐẸP */}
        <div className="stats-grid">
          <div className="stat-box pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-text">Chờ xử lý</div>
          </div>
          <div className="stat-box confirmed">
            <div className="stat-number">{stats.confirmed}</div>
            <div className="stat-text">Đã xác nhận</div>
          </div>
          <div className="stat-box completed">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-text">Đã hoàn thành</div>
          </div>
          <div className="stat-box rating">
            <div className="stat-number">
              {stats.averageRating > 0 ? `${stats.averageRating} ★` : "Chưa có"}
            </div>
            <div className="stat-text">Đánh giá trung bình</div>
          </div>
        </div>

        {/* BUỔI HỌC GẦN ĐÂY */}
        <div className="section-card">
          <div className="section-header">
            <h2>Buổi học gần đây</h2>
          </div>

          {loading ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : recentMeetings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">Chưa có buổi học nào</div>
              <p>Bạn chưa có lịch dạy nào gần đây</p>
            </div>
          ) : (
            <div className="meetings-grid">
              {recentMeetings.map((meeting) => {
                const students = meeting.students || [];
                const mainStudent = students[0];
                return (
                  <Link
                    key={meeting.id}
                    to={`/sessions/${meeting.id}`}
                    className="meeting-card"
                  >
                    <div className="meeting-date">
                      {new Date(meeting.startTime).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="meeting-time">
                      {new Date(meeting.startTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="meeting-student">
                      <strong>{mainStudent?.fullName || "Sinh viên"}</strong>
                      {students.length > 1 && ` +${students.length - 1} học viên`}
                    </div>
                    <div className="meeting-topic">
                      {meeting.topic || "Không có chủ đề"}
                    </div>
                    <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                      {meeting.status === "PENDING" && "Chờ xác nhận"}
                      {meeting.status === "CONFIRMED" && "Đã xác nhận"}
                      {meeting.status === "COMPLETED" && "Hoàn thành"}
                      {meeting.status === "CANCELED" && "Đã hủy"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .tutor-dashboard-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          font-family: 'Segoe UI', sans-serif;
        }

        /* SIDEBAR */
        .td-sidebar {
          width: 300px;
          background: white;
          padding: 40px 24px;
          border-right: 1px solid #cbd5e1;
          position: sticky;
          top: 0;
          height: 100vh;
          box-shadow: 4px 0 20px rgba(0,0,0,0.05);
        }

        .sidebar-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e40af;
          margin-bottom: 40px;
          text-align: center;
        }

        .sidebar-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 20px 20px;
          border-radius: 16px;
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid transparent;
          transition: all 0.4s ease;
        }

        .sidebar-item:hover {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #3b82f6;
          color: #1e40af;
          transform: translateX(12px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
        }

        .sidebar-item .icon {
          font-size: 2.4rem;
        }

        .sidebar-item .label {
          font-size: 1.15rem;
        }

        /* MAIN CONTENT */
        .td-main-content {
          flex: 1;
          padding: 40px;
          max-width: 1300px;
        }

        .main-title {
          font-size: 2.6rem;
          font-weight: 900;
          color: #1e40af;
          margin-bottom: 40px;
          text-align: center;
          background: linear-gradient(to right, #1e40af, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* STATS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .stat-box {
          background: white;
          padding: 32px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.4s;
          border-left: 8px solid;
        }

        .stat-box:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }

        .stat-box.pending { border-color: #f59e0b; }
        .stat-box.confirmed { border-color: #10b981; }
        .stat-box.completed { border-color: #3b82f6; }
        .stat-box.rating { border-color: #8b5cf6; }

        .stat-number {
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .pending .stat-number { color: #f59e0b; }
        .confirmed .stat-number { color: #10b981; }
        .completed .stat-number { color: #3b82f6; }
        .rating .stat-number { color: #8b5cf6; }

        .stat-text {
          font-size: 1.2rem;
          color: #64748b;
          font-weight: 600;
        }

        /* SECTION CARD */
        .section-card {
          background: white;
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }

        .section-header h2 {
          font-size: 2rem;
          color: #1e40af;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .meetings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .meeting-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          padding: 24px;
          text-decoration: none;
          color: inherit;
          transition: all 0.4s;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .meeting-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 8px;
          height: 100%;
          background: #3b82f6;
        }

        .meeting-card:hover {
          transform: translateY(-10px);
          border-color: #3b82f6;
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.25);
        }

        .meeting-date {
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 6px;
        }

        .meeting-time {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .meeting-student {
          font-size: 1.1rem;
          color: #334155;
          margin-bottom: 8px;
        }

        .meeting-topic {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .pending { background: #fffbeb; color: #92400e; }
        .confirmed { background: #ecfdf5; color: #166534; }
        .completed { background: #dbeafe; color: #1e40af; }
        .canceled { background: #fee2e2; color: #991b1b; }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 20px;
        }

        .loading-state {
          text-align: center;
          padding: 60px;
          color: #64748b;
          font-size: 1.2rem;
        }

        @media (max-width: 1024px) {
          .tutor-dashboard-container { flex-direction: column; }
          .td-sidebar { width: 100%; height: auto; padding: 24px; }
          .sidebar-actions { flex-direction: row; justify-content: center; flex-wrap: wrap; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 640px) {
          .stats-grid, .meetings-grid { grid-template-columns: 1fr; }
          .main-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
