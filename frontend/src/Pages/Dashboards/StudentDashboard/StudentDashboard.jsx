import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api.js";

export default function StudentDashboard() {
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
  });
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
      setUpcomingMeetings(upcoming.slice(0, 5));

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
    <div className="sd">
      <div className="sd-title-wrap">
        <h1 className="sd-title">Bảng điều khiển</h1>
      </div>

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

      <div className="sd-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 className="sd-section-title" style={{ marginBottom: 0 }}>Buổi học sắp tới</h2>
          <button onClick={openMeetingsModal} className="sd-view-all-btn">
            Xem tất cả
          </button>
        </div>
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

      <div className="sd-panel">
        <h2 className="sd-section-title">Hành động nhanh</h2>
        <div className="sd-grid">
          <Link to="/library" className="sd-card-link">
            <div className="sd-quick-card" style={{ borderColor: "#FF7051" }}>
              <div className="sd-quick-icon" style={{ color: "#FF7051" }}>📚</div>
              <div className="sd-quick-title">Thư viện HCMUT</div>
            </div>
          </Link>

          <Link to="/register" className="sd-card-link">
            <div className="sd-quick-card" style={{ borderColor: "#2F8E70" }}>
              <div className="sd-quick-icon" style={{ color: "#2F8E70" }}>👨‍🎓</div>
              <div className="sd-quick-title">Tìm giảng viên</div>
            </div>
          </Link>

          <div className="sd-card-center">
            <Link to="/feedback" className="sd-card-link">
              <div className="sd-quick-card" style={{ borderColor: "#FFC940" }}>
                <div className="sd-quick-icon" style={{ color: "#FFC940" }}>✏️</div>
                <div className="sd-quick-title">Đánh giá khóa học</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tất cả buổi học</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-tabs">
              <button
                className={activeTab === "all" ? "tab-active" : ""}
                onClick={() => setActiveTab("all")}
              >
                Tất cả ({allMeetings.length})
              </button>
              <button
                className={activeTab === "pending" ? "tab-active" : ""}
                onClick={() => setActiveTab("pending")}
              >
                Chờ xác nhận ({allMeetings.filter(m => m.status === "PENDING").length})
              </button>
              <button
                className={activeTab === "confirmed" ? "tab-active" : ""}
                onClick={() => setActiveTab("confirmed")}
              >
                Đã xác nhận ({allMeetings.filter(m => m.status === "CONFIRMED").length})
              </button>
              <button
                className={activeTab === "completed" ? "tab-active" : ""}
                onClick={() => setActiveTab("completed")}
              >
                Hoàn thành ({allMeetings.filter(m => m.status === "COMPLETED").length})
              </button>
              <button
                className={activeTab === "canceled" ? "tab-active" : ""}
                onClick={() => setActiveTab("canceled")}
              >
                Đã hủy ({allMeetings.filter(m => m.status === "CANCELED").length})
              </button>
            </div>

            <div className="modal-body">
              {filteredMeetings.length === 0 ? (
                <p className="sd-empty">Không có buổi học nào</p>
              ) : (
                <div className="sd-meetings-list">
                  {filteredMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      to={`/sessions/${meeting.id}`}
                      className="sd-meeting-card"
                      onClick={() => setShowModal(false)}
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
          </div>
        </div>
      )}

      <style>{`
        .sd {
          padding: 16px 0 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .sd-title-wrap {
          width: min(820px, 92vw);
          background: #fff;
          margin-bottom: 8px;
        }
        .sd-title {
          margin: 8px 0;
          text-align: center;
          color: #1c3e9c;
          font-weight: 800;
          font-size: clamp(22px, 3vw, 36px);
          letter-spacing: 1px;
        }
        .sd-panel {
          width: min(820px, 92vw);
          border: 6px solid #0a66d1;
          border-radius: 4px;
          background: #fff;
          padding: 18px 12px 24px;
        }
        .sd-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          column-gap: 40px;
          row-gap: 28px;
        }
        .sd-card-link {
          text-decoration: none;
          display: block;
          flex: 0 1 320px;
        }
        .sd-card-center {
          flex-basis: 100%;
          display: flex;
          justify-content: center;
        }
        .sd-quick-card {
          background: white;
          border: 3px solid;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }
        .sd-quick-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .sd-quick-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }
        .sd-quick-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }
        .sd-stats {
          width: min(820px, 92vw);
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .stat-card {
          flex: 1;
          min-width: 150px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .stat-label {
          font-size: 0.95rem;
          opacity: 0.9;
        }
        .sd-section {
          width: min(820px, 92vw);
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .sd-section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1c3e9c;
          margin-bottom: 16px;
        }
        .sd-view-all-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sd-view-all-btn:hover {
          background: #5568d3;
          transform: translateY(-1px);
        }
        .sd-empty {
          text-align: center;
          color: #6b7280;
          padding: 32px;
        }
        .sd-meetings-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sd-meeting-card {
          display: block;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        .sd-meeting-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
        .sd-meeting-time {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .sd-meeting-topic {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }
        .sd-meeting-tutor {
          font-size: 0.95rem;
          color: #4b5563;
          margin-bottom: 8px;
        }
        .sd-meeting-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }
        .status-completed {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-canceled {
          background: #fee2e2;
          color: #991b1b;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          width: min(900px, 92vw);
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 2px solid #e5e7eb;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1c3e9c;
          font-weight: 700;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #6b7280;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        .modal-tabs {
          display: flex;
          gap: 8px;
          padding: 12px 24px;
          border-bottom: 2px solid #e5e7eb;
          overflow-x: auto;
        }
        .modal-tabs button {
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .modal-tabs button:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        .modal-tabs button.tab-active {
          background: #667eea;
          color: white;
        }
        .modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          flex: 1;
        }
        @media (max-width: 760px) {
          .sd-grid {
            column-gap: 20px;
            row-gap: 20px;
          }
          .sd-card-link {
            flex: 1 1 280px;
          }
          .sd-card-center {
            flex-basis: 100%;
          }
          .sd-stats {
            flex-direction: column;
          }
          .stat-card {
            min-width: 100%;
          }
          .modal-tabs {
            gap: 4px;
            padding: 8px 16px;
          }
          .modal-tabs button {
            padding: 6px 12px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
