import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api.js";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [upcomingMeetingsFull, setUpcomingMeetingsFull] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  const [showListModal, setShowListModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [allMeetings, setAllMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [actionLoading, setActionLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  // visible count depends on window size
  const [visibleCount, setVisibleCount] = useState(5);

  const calcVisibleCount = useCallback(() => {
    // card estimated height (including gap): ~92px, reserve header/footers ~300px
    const reserved = 300;
    const card = 92;
    const raw = Math.floor((window.innerHeight - reserved) / card);
    const count = Math.max(3, Math.min(12, raw)); // clamp 3..12
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
      const upcoming = await meetingsService.getUpcoming();
      setUpcomingMeetingsFull(upcoming || []);
      const history = await meetingsService.getHistory();
      const completed = (history || []).filter((m) => m.status === "COMPLETED");
      setStats({ total: (upcoming?.length || 0) + (history?.length || 0), upcoming: upcoming?.length || 0, completed: completed.length });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // displayed (sliced) list uses live visibleCount
  const upcomingMeetings = upcomingMeetingsFull.slice(0, visibleCount);

  const openListModal = async () => {
    try {
      const all = await meetingsService.getMyMeetings();
      setAllMeetings(all || []);
      setShowListModal(true);
    } catch (error) {
      console.error("Failed to fetch all meetings:", error);
    }
  };

  const openDetailModal = async (meetingId, keepListOpen = false) => {
    try {
      const meeting = await meetingsService.getMeetingById(meetingId);
      setSelectedMeeting(meeting);
      setShowDetailModal(true);
      setShowRating(false);
      setRating(0);
      setHoveredRating(0);
      setComment("");
      // optionally close list modal when opening detail (default previous behavior)
      if (!keepListOpen) setShowListModal(false);
    } catch (error) {
      console.error("Failed to fetch meeting details:", error);
    }
  };

  const handleCancelMeeting = async () => {
    if (!selectedMeeting || selectedMeeting.status !== "PENDING") return;
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
      alert("Lỗi: " + (error.message || "Không thể hủy buổi học"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedMeeting || rating === 0) return;
    try {
      setActionLoading(true);
      await meetingsService.rate(selectedMeeting.id, { score: rating, comment: comment.trim() });
      alert("Đã gửi đánh giá thành công");
      setShowRating(false);
      setRating(0);
      setHoveredRating(0);
      setComment("");
    } catch (error) {
      alert("Lỗi: " + (error.message || "Không thể gửi đánh giá"));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMeetings = allMeetings.filter((m) => {
    if (activeTab === "all") return true;
    return m.status === activeTab.toUpperCase();
  });

  const getRatingText = (score) => {
    const texts = ["Chọn số sao", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];
    return texts[score] || "";
  };

  const MeetingCard = ({ meeting, onClick }) => (
    <div onClick={onClick} className="sd-meeting-card" role="button" tabIndex={0}>
      <div className="sd-meeting-time">{new Date(meeting.startTime).toLocaleString("vi-VN")}</div>
      <div className="sd-meeting-topic">{meeting.topic || "Không có chủ đề"}</div>
      <div className="sd-meeting-tutor">Giảng viên: {meeting.tutor?.user?.fullName || "—"}</div>
      <span className={`sd-meeting-status status-${(meeting.status || "").toLowerCase()}`}>{meeting.status}</span>
    </div>
  );

  return (
    <div className="sd">
      <div className="sd-title-wrap">
        <h1 className="sd-title">Bảng điều khiển</h1>
      </div>

      <div className="sd-stats">
        {[
          { value: stats.total, label: "Tổng buổi học" },
          { value: stats.upcoming, label: "Sắp diễn ra" },
          { value: stats.completed, label: "Đã hoàn thành" }
        ].map((stat, i) => (
		<div key={i} className="sd-stat-card">
		  <div className="sd-stat-value">{stat.value}</div>
		  <div className="sd-stat-label">{stat.label}</div>
		</div>
        ))}
      </div>

      <div className="sd-panel">
        <div className="sd-panel-header">
          <h2 className="sd-section-title">Buổi học của tôi</h2>
          <button onClick={openListModal} className="sd-view-all-btn">Xem tất cả</button>
        </div>

        {loading ? <p>Đang tải...</p> : upcomingMeetings.length === 0 ? (
          <p className="sd-empty">Bạn chưa có buổi học nào sắp tới</p>
        ) : (
          <div className="sd-meetings-list">
            {upcomingMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} onClick={() => openDetailModal(m.id)} />
            ))}
          </div>
        )}
      </div>

      <div className="sd-panel" style={{ marginTop: 24 }}>
        <h2 className="sd-section-title">Hành động nhanh</h2>
        <div className="sd-grid">
          {[
            { to: "/dashboard/student/library", icon: "📚", title: "Thư viện HCMUT", color: "#FF7051" },
            { to: "/register", icon: "👨‍🎓", title: "Tìm giảng viên", color: "#2F8E70" }
          ].map((card, i) => (
            <Link key={i} to={card.to} className="sd-card-link">
              <div className="sd-quick-card" style={{ borderColor: card.color }}>
                <div className="sd-quick-icon" style={{ color: card.color }}>{card.icon}</div>
                <div className="sd-quick-title">{card.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Meeting List Modal */}
      {showListModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowListModal(false); }}
        >
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
                <button
                  key={tab.key}
                  className={activeTab === tab.key ? "tab-active" : ""}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} ({tab.key === "all" ? allMeetings.length : allMeetings.filter(m => m.status === tab.key.toUpperCase()).length})
                </button>
              ))}
            </div>

            <div className="modal-body">
              {filteredMeetings.length === 0 ? <p className="sd-empty">Không có buổi học nào</p> : (
                <div className="sd-meetings-list">
                  {filteredMeetings.map((m) => (
                    // keepListOpen = true if you open detail from list and still want list open
                    <MeetingCard key={m.id} meeting={m} onClick={() => openDetailModal(m.id, true)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {showDetailModal && selectedMeeting && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}
        >
          <div className="modal-content modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết buổi học</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {[
                { label: "Chủ đề", value: selectedMeeting.topic || "Không có chủ đề" },
                { label: "Giảng viên", value: selectedMeeting.tutor?.user?.fullName || "—" },
                { label: "Email giảng viên", value: selectedMeeting.tutor?.user?.email || "—" },
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
                <span className={`sd-meeting-status status-${selectedMeeting.status.toLowerCase()}`}>{selectedMeeting.status}</span>
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
                  <button onClick={handleCancelMeeting} disabled={actionLoading} className="sd-btn-cancel">
                    {actionLoading ? "Đang xử lý..." : "Hủy buổi học"}
                  </button>
                </div>
              )}

              {selectedMeeting.status === "COMPLETED" && (
                <div className="detail-actions">
                  <button onClick={() => setShowRating(!showRating)} className="sd-btn-rate">
                    {showRating ? "Ẩn đánh giá" : "Đánh giá buổi học"}
                  </button>
                </div>
              )}

              {showRating && selectedMeeting.status === "COMPLETED" && (
                <form onSubmit={handleSubmitRating} className="rating-box">
                  <h3 className="rating-title">Đánh giá buổi học</h3>

                  <div className="rating-field">
                    <label>Đánh giá của bạn:</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className={star <= (hoveredRating || rating) ? "star-active" : "star-inactive"}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="rating-text">{getRatingText(hoveredRating || rating)}</p>
                  </div>

                  <div className="rating-field">
                    <label>Nhận xét (tùy chọn):</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Chia sẻ trải nghiệm của bạn về buổi học..." rows="5" maxLength="500" className="rating-textarea" />
                    <p className="rating-char-count">{comment.length}/500 ký tự</p>
                  </div>

                  <button type="submit" disabled={actionLoading || rating === 0} className="sd-btn-submit-rating">
                    {actionLoading ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

