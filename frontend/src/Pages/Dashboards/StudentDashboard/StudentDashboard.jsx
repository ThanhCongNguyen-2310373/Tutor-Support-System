import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api.js";

export default function StudentDashboard() {
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allMeetings, setAllMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const upcoming = await meetingsService.getUpcoming();
      setUpcomingMeetings(upcoming.slice(0, 6));

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

  const openMeetingsModal = async () => {
    try {
      const all = await meetingsService.getMyMeetings();
      setAllMeetings(all);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch all meetings:", error);
    }
  };

  const filteredMeetings = allMeetings.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return m.status === "PENDING";
    if (activeTab === "confirmed") return m.status === "CONFIRMED";
    if (activeTab === "completed") return m.status === "COMPLETED";
    if (activeTab === "canceled") return m.status === "CANCELED";
    return true;
  });

  return (
    <div className="student-dashboard-container">
      {/* SIDEBAR TRÁI */}
      <aside className="sd-sidebar">
        <h2 className="sidebar-title">Menu nhanh</h2>
        <div className="sidebar-actions">
          <Link to="/library" className="sidebar-item">
            <div className>Thư viện HCMUT</div>
          </Link>

          <Link to="/register" className="sidebar-item">
            <div className>Tìm giảng viên</div>
          </Link>

          <Link to="/feedback" className="sidebar-item">
            <div className>Đánh giá khóa học</div>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT PHẢI */}
      <main className="sd-main-content">
        <h1 className="main-title">Bảng điều khiển của bạn</h1>

        {/* THỐNG KÊ */}
        <div className="stats-grid">
          <div className="stat-box total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-text">Tổng buổi học</div>
          </div>
          <div className="stat-box upcoming">
            <div className="stat-number">{stats.upcoming}</div>
            <div className="stat-text">Sắp diễn ra</div>
          </div>
          <div className="stat-box completed">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-text">Đã hoàn thành</div>
          </div>
        </div>

        {/* BUỔI HỌC SẮP TỚI */}
        <div className="section-card">
          <div className="section-header">
            <h2>Buổi học sắp tới</h2>
            <button onClick={openMeetingsModal} className="view-all-btn">
              Xem tất cả →
            </button>
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">Không có buổi học nào</div>
              <p>Bạn chưa có buổi học nào sắp tới</p>
            </div>
          ) : (
            <div className="meetings-grid">
              {upcomingMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  to={`/sessions/${meeting.id}`}
                  className="meeting-card"
                >
                  <div className="meeting-date">
                    {new Date(meeting.startTime).toLocaleDateString("vi-VN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                  <div className="meeting-time">
                    {new Date(meeting.startTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="meeting-topic">
                    {meeting.topic || "Không có chủ đề"}
                  </div>
                  <div className="meeting-tutor">
                    Với: <strong>{meeting.tutor?.user?.fullName || "Chưa có"}</strong>
                  </div>
                  <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                    {meeting.status === "CONFIRMED" && "Đã xác nhận"}
                    {meeting.status === "PENDING" && "Chờ duyệt"}
                    {meeting.status === "COMPLETED" && "Hoàn thành"}
                    {meeting.status === "CANCELED" && "Đã hủy"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL XEM TẤT CẢ BUỔI HỌC */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tất cả buổi học</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {/* Tabs + List giữ nguyên như cũ hoặc đẹp hơn nếu bạn muốn */}
            {/* ... */}
          </div>
        </div>
      )}

      <style jsx>{`
        .student-dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', sans-serif;
        }

        /* SIDEBAR */
        .sd-sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 32px 20px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 32px;
          padding-left: 12px;
        }

        .sidebar-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 16px;
          border-radius: 12px;
          text-decoration: none;
          color: #475569;
          font-weight: 500;
          transition: all 0.3s;
          background: #f1f5f9;
          border: 2px solid transparent;
        }

        .sidebar-item:hover {
          background: #e0e7ff;
          border-color: #818cf8;
          color: #4f46e5;
          transform: translateX(8px);
        }

        .sidebar-item .icon {
          font-size: 2rem;
        }

        .sidebar-item .label {
          font-size: 1.05rem;
        }

        /* MAIN CONTENT */
        .sd-main-content {
          flex: 1;
          padding: 40px 32px;
          max-width: 1200px;
        }

        .main-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 32px;
          text-align: center;
        }

        /* STATS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-box {
          background: white;
          padding: 28px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s;
        }

        .stat-box:hover {
          transform: translateY(-8px);
        }

        .stat-box.total { border-left: 6px solid #8b5cf6; }
        .stat-box.upcoming { border-left: 6px solid #3b82f6; }
        .stat-box.completed { border-left: 6px solid #10b981; }

        .stat-number {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .total .stat-number { color: #8b5cf6; }
        .upcoming .stat-number { color: #3b82f6; }
        .completed .stat-number { color: #10b981; }

        .stat-text {
          font-size: 1.1rem;
          color: #64748b;
          font-weight: 500;
        }

        /* SECTION CARD */
        .section-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 1.8rem;
          color: #1e293b;
          font-weight: 700;
        }

        .view-all-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-all-btn:hover {
          background: #4f46e5;
          transform: translateY(-2px);
        }

        .meetings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .meeting-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .meeting-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
          border-color: #6366f1;
        }

        .meeting-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 6px;
          height: 100%;
          background: #6366f1;
        }

        .meeting-date {
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 4px;
        }

        .meeting-time {
          font-size: 1.4rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .meeting-topic {
          font-size: 1.1rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meeting-tutor {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 12px;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .confirmed { background: #dcfce7; color: #166534; }
        .pending { background: #fef3c7; color: #92400e; }
        .completed { background: #dbeafe; color: #1e40af; }
        .canceled { background: #fee2e2; color: #991b1b; }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #64748b;
          font-size: 1.1rem;
        }

        /* RESPONSIVE */
        @media (max-width: 968px) {
          .student-dashboard-container {
            flex-direction: column;
          }
          .sd-sidebar {
            width: 100%;
            height: auto;
            position: static;
            padding: 20px;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
          }
          .sidebar-actions {
            flex-direction: row;
            justify-content: center;
            flex-wrap: wrap;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .meetings-grid {
            grid-template-columns: 1fr;
          }
          .main-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}
