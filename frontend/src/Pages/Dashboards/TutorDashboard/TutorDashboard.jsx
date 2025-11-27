import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api.js";
import "./TutorDashboard.css";

export default function TutorDashboard() {
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, averageRating: 0 });
  const [confirmedMeetingsFull, setConfirmedMeetingsFull] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showListModal, setShowListModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [allMeetings, setAllMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  const [visibleCount, setVisibleCount] = useState(5);

  const calcVisibleCount = useCallback(() => {
    const reserved = 300;
    const card = 92;
    const raw = Math.floor((window.innerHeight - reserved) / card);
    const count = Math.max(3, Math.min(12, raw));
    setVisibleCount(count);
  }, []);

  useEffect(() => {
    calcVisibleCount();
    window.addEventListener("resize", calcVisibleCount);
    return () => window.removeEventListener("resize", calcVisibleCount);
  }, [calcVisibleCount]);

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

      const completed = (history || []).filter((m) => m.status === "COMPLETED");
      const ratingsData = completed.flatMap((m) => m.ratings || []).filter((r) => r && typeof r.score === "number");
      const avgRating = ratingsData.length > 0 ? (ratingsData.reduce((sum, r) => sum + r.score, 0) / ratingsData.length).toFixed(1) : 0;

      setStats({ pending: (pending || []).length, confirmed: (confirmed || []).length, completed: completed.length, averageRating: avgRating });

      const sorted = [...(confirmed || [])].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setConfirmedMeetingsFull(sorted);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmedMeetings = confirmedMeetingsFull.slice(0, visibleCount);

  const openListModal = async () => {
    try {
      const all = await meetingsService.getMyMeetings();
      setAllMeetings(all || []);
      setActiveTab("all");
      setShowListModal(true);
    } catch (error) {
      console.error("Failed to fetch all meetings:", error);
    }
  };

  const openDetailModal = async (meetingId) => {
    try {
      const meeting = await meetingsService.getMeetingById(meetingId);
      setSelectedMeeting(meeting);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to fetch meeting details:", error);
    }
  };

  const handleConfirmMeeting = async () => {
    if (!selectedMeeting || selectedMeeting.status !== "PENDING") return;
    if (!window.confirm("Bạn có chắc muốn xác nhận buổi học này?")) return;
    try {
      setActionLoading(true);
      await meetingsService.confirm(selectedMeeting.id);
      alert("Đã xác nhận buổi học thành công");
      setShowDetailModal(false);
      await fetchDashboardData();
      if (showListModal) {
        const all = await meetingsService.getMyMeetings();
        setAllMeetings(all || []);
      }
    } catch (error) {
      alert("Lỗi: " + (error?.message || "Không thể xác nhận buổi học"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMeeting = async () => {
    if (!selectedMeeting || selectedMeeting.status === "COMPLETED") return;
    if (!window.confirm("Bạn có chắc muốn hủy buổi học này?")) return;
    try {
      setActionLoading(true);
      await meetingsService.cancel(selectedMeeting.id);
      alert("Đã hủy buổi học thành công");
      setShowDetailModal(false);
      await fetchDashboardData();
      if (showListModal) {
        const all = await meetingsService.getMyMeetings();
        setAllMeetings(all || []);
      }
    } catch (error) {
      alert("Lỗi: " + (error?.message || "Không thể hủy buổi học"));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMeetings = (allMeetings || []).filter((m) => {
    if (activeTab === "all") return true;
    return m.status === activeTab.toUpperCase();
  });

  const MeetingCard = ({ meeting, onClick }) => {
    const students = meeting.students || [];
    const mainStudent = students[0];
    return (
      <div onClick={onClick} className="td-meeting-card" role="button" tabIndex={0}>
        <div className="td-meeting-time">{new Date(meeting.startTime).toLocaleString("vi-VN")}</div>
        <div className="td-meeting-student">
          Sinh viên: {mainStudent?.fullName || "—"}
          {students.length > 1 && ` +${students.length - 1} người`}
        </div>
        <div className="td-meeting-topic">{meeting.topic || "Không có chủ đề"}</div>
        <span className={`td-meeting-status status-${(meeting.status || "").toLowerCase()}`}>{meeting.status}</span>
      </div>
    );
  };

  return (
    <div className="td">
      <div className="td-title-wrap">
        <h1 className="td-title">Bảng điều khiển</h1>
      </div>

      <div className="td-stats" aria-live="polite">
        {[
          { value: stats.pending, label: "Chờ xử lý", className: "td-stat-pending" },
          { value: stats.confirmed, label: "Đã xác nhận", className: "td-stat-confirmed" },
          { value: stats.completed, label: "Hoàn thành", className: "td-stat-completed" },
          { value: stats.averageRating > 0 ? `${stats.averageRating} ⭐` : "—", label: "Đánh giá TB", className: "td-stat-rating" }
        ].map((stat, i) => (
          <div key={i} className={`td-stat-card ${stat.className}`}>
            <div className="td-stat-value">{stat.value}</div>
            <div className="td-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="td-panel">
        <div className="td-panel-header">
          <h2 className="td-section-title">Buổi học đã xác nhận</h2>
          <button onClick={openListModal} className="td-view-all-btn">Xem tất cả</button>
        </div>

        {loading ? <p>Đang tải...</p> : confirmedMeetings.length === 0 ? (
          <p className="td-empty">Chưa có buổi học nào được xác nhận</p>
        ) : (
          <div className="td-meetings-grid">
            {confirmedMeetings.map((m) => {
              const students = m.students || [];
              const mainStudent = students[0];
              return (
                <div
                  key={m.id}
                  onClick={() => openDetailModal(m.id)}
                  className="td-meeting-box"
                  role="button"
                  tabIndex={0}
                >
                  <div className="td-box-time">{new Date(m.startTime).toLocaleString("vi-VN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  <div className="td-box-student">{mainStudent?.fullName || "—"}</div>
                  <div className="td-box-topic">{m.topic || "Không có chủ đề"}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="td-panel" style={{ marginTop: 24 }}>
        <h2 className="td-section-title">Hành động nhanh</h2>
        <div className="td-grid">
          <Link to="/dashboard/tutor/availability" className="td-card-link">
            <div className="td-quick-card" style={{ borderColor: "#667eea" }}>
              <div className="td-quick-icon" style={{ color: "#667eea" }}>📅</div>
              <div className="td-quick-title">Quản lý lịch trống</div>
            </div>
          </Link>

          <Link to="/dashboard/tutor/students" className="td-card-link">
            <div className="td-quick-card" style={{ borderColor: "#48bb78" }}>
              <div className="td-quick-icon" style={{ color: "#48bb78" }}>👥</div>
              <div className="td-quick-title">Học sinh của tôi</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Meeting List Modal */}
      {showListModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowListModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tất cả buổi học</h2>
              <button className="modal-close" onClick={() => setShowListModal(false)}>✕</button>
            </div>

            <div className="modal-tabs">
              {[
                { key: "all", label: "Tất cả" },
                { key: "pending", label: "Chờ xác nhận" },
                { key: "confirmed", label: "Đã xác nhận" },
                { key: "completed", label: "Hoàn thành" },
                { key: "canceled", label: "Đã hủy" }
              ].map((tab) => (
                <button key={tab.key} className={activeTab === tab.key ? "tab-active" : ""} onClick={() => setActiveTab(tab.key)}>
                  {tab.label} ({tab.key === "all" ? (allMeetings || []).length : (allMeetings || []).filter(m => m.status === tab.key.toUpperCase()).length})
                </button>
              ))}
            </div>

            <div className="modal-body">
              {filteredMeetings.length === 0 ? <p className="td-empty">Không có buổi học nào</p> : (
                <div className="td-meetings-list">
                  {filteredMeetings.map((m) => (
                    <MeetingCard key={m.id} meeting={m} onClick={() => openDetailModal(m.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {showDetailModal && selectedMeeting && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}>
          <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết buổi học</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {[
                { label: "Chủ đề", value: selectedMeeting.topic || "Không có chủ đề" },
                { label: "Sinh viên", value: (selectedMeeting.students || []).map(s => s.fullName).join(", ") || "—" },
                { label: "Thời gian bắt đầu", value: new Date(selectedMeeting.startTime).toLocaleString("vi-VN", { dateStyle: "full", timeStyle: "short" }) },
                { label: "Thời gian kết thúc", value: new Date(selectedMeeting.endTime).toLocaleString("vi-VN", { dateStyle: "full", timeStyle: "short" }) }
              ].map((field, i) => (
                <div key={i} className="detail-section">
                  <div className="detail-label">{field.label}</div>
                  <div className="detail-value">{field.value}</div>
                </div>
              ))}

              <div className="detail-section">
                <div className="detail-label">Trạng thái</div>
                <span className={`td-meeting-status status-${selectedMeeting.status.toLowerCase()}`}>{selectedMeeting.status}</span>
              </div>

              {selectedMeeting.meetingLink && (
                <div className="detail-section">
                  <div className="detail-label">Link buổi học</div>
                  <a href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer" className="detail-link">{selectedMeeting.meetingLink}</a>
                </div>
              )}

              {selectedMeeting.notes && (
                <div className="detail-section">
                  <div className="detail-label">Ghi chú</div>
                  <div className="detail-value">{selectedMeeting.notes}</div>
                </div>
              )}

              {selectedMeeting.status === "PENDING" && (
                <div className="detail-actions">
                  <button onClick={handleConfirmMeeting} disabled={actionLoading} className="td-btn-confirm">
                    {actionLoading ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                  <button onClick={handleCancelMeeting} disabled={actionLoading} className="td-btn-cancel">
                    {actionLoading ? "Đang xử lý..." : "Từ chối"}
                  </button>
                </div>
              )}

              {selectedMeeting.status === "CONFIRMED" && (
                <div className="detail-actions">
                  <button onClick={handleCancelMeeting} disabled={actionLoading} className="td-btn-cancel">
                    {actionLoading ? "Đang xử lý..." : "Hủy buổi học"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

