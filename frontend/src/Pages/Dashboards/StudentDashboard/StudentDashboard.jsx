import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { meetingsService } from "../../../api.js";
import FindTutorModal from "./FindTutorModal"; // Import the new modal
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [upcomingMeetingsFull, setUpcomingMeetingsFull] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // Existing modals
  const [showListModal, setShowListModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // NEW: State for Find Tutor Modal
  const [showFindTutor, setShowFindTutor] = useState(false);

  const [allMeetings, setAllMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [actionLoading, setActionLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  // const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

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
      // setHoveredRating(0);
      setComment("");
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
      setComment("");
      
      // Refresh meeting detail để hiển thị rating vừa gửi
      const updatedMeeting = await meetingsService.getMeetingById(selectedMeeting.id);
      setSelectedMeeting(updatedMeeting);
      
      // Refresh danh sách meetings nếu modal list đang mở
      if (showListModal) {
        const all = await meetingsService.getMyMeetings();
        setAllMeetings(all || []);
      }
      
      // Refresh dashboard data
      await fetchDashboardData();
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

  // const getRatingText = (score) => {
  //   const texts = ["Chọn số sao", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];
  //   return texts[score] || "";
  // };

  const MeetingCard = ({ meeting, onClick }) => {
    // Lấy user hiện tại để kiểm tra đã rating chưa
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const hasRated = meeting.status === "COMPLETED" && 
                     meeting.ratings?.some(r => r.studentId === currentUser.id);
    
    return (
      <div onClick={onClick} className="studentdash-meeting-card" role="button" tabIndex={0}>
        <div className="studentdash-meeting-time">{new Date(meeting.startTime).toLocaleString("vi-VN")}</div>
        <div className="studentdash-meeting-topic">{meeting.topic || "Không có chủ đề"}</div>
        <div className="studentdash-meeting-tutor">Giảng viên: {meeting.tutor?.user?.fullName || "—"}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`studentdash-meeting-status status-${(meeting.status || "").toLowerCase()}`}>{meeting.status}</span>
          {meeting.status === "COMPLETED" && (
            <span className={`studentdash-rating-badge ${hasRated ? 'rated' : 'not-rated'}`}>
              {hasRated ? '✓ Đã đánh giá' : '⚠ Chưa đánh giá'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="studentdash">
      <div className="studentdash-title-wrap">
        <h1 className="studentdash-title">Bảng điều khiển</h1>
      </div>

      <div className="studentdash-stats">
        {[
          { value: stats.total, label: "Tổng buổi học" },
          { value: stats.upcoming, label: "Sắp diễn ra" },
          { value: stats.completed, label: "Đã hoàn thành" }
        ].map((stat, i) => (
          <div key={i} className="studentdash-stat-card">
            <div className="studentdash-stat-value">{stat.value}</div>
            <div className="studentdash-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="studentdash-panel">
        <div className="studentdash-panel-header">
          <h2 className="studentdash-section-title">Buổi học của tôi</h2>
          <button onClick={openListModal} className="studentdash-view-all-btn">Xem tất cả</button>
        </div>

        {loading ? <p>Đang tải...</p> : upcomingMeetings.length === 0 ? (
          <p className="studentdash-empty">Bạn chưa có buổi học nào sắp tới</p>
        ) : (
          <div className="studentdash-meetings-list">
            {upcomingMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} onClick={() => openDetailModal(m.id)} />
            ))}
          </div>
        )}
      </div>

      <div className="studentdash-panel" style={{ marginTop: 24 }}>
        <h2 className="studentdash-section-title">Hành động nhanh</h2>
        <div className="studentdash-grid">
          {/* Library Link (Still a normal link) */}
          <Link to="/dashboard/student/library" className="studentdash-card-link">
            <div className="studentdash-quick-card" style={{ borderColor: "#FF7051" }}>
              <div className="studentdash-quick-icon" style={{ color: "#FF7051" }}>📚</div>
              <div className="studentdash-quick-title">Thư viện HCMUT</div>
            </div>
          </Link>

          {/* Find Tutor Popup Trigger */}
          <div onClick={() => setShowFindTutor(true)} className="studentdash-card-link" style={{cursor: 'pointer'}}>
            <div className="studentdash-quick-card" style={{ borderColor: "#667eea" }}>
              <div className="studentdash-quick-icon" style={{ color: "#667eea" }}>👨‍🎓</div>
              <div className="studentdash-quick-title">Tìm giảng viên</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Existing Meeting List */}
      {showListModal && (
        <div className="studentdash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowListModal(false); }}>
          <div className="studentdash-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="studentdash-modal-header">
              <h2>Tất cả buổi học</h2>
              <button className="studentdash-modal-close" onClick={() => setShowListModal(false)}>✕</button>
            </div>
            {/* ... Content same as before ... */}
            <div className="studentdash-modal-tabs">
              {[{ key: "all", label: "Tất cả" }, { key: "pending", label: "Chờ xác nhận" }, { key: "confirmed", label: "Đã xác nhận" }, { key: "completed", label: "Hoàn thành" }, { key: "canceled", label: "Đã hủy" }].map((tab) => (
                <button key={tab.key} className={activeTab === tab.key ? "tab-active" : ""} onClick={() => setActiveTab(tab.key)}>
                  {tab.label} ({tab.key === "all" ? allMeetings.length : allMeetings.filter(m => m.status === tab.key.toUpperCase()).length})
                </button>
              ))}
            </div>
            <div className="studentdash-modal-body">
              {filteredMeetings.length === 0 ? <p className="studentdash-empty">Không có buổi học nào</p> : (
                <div className="studentdash-meetings-list">
                  {filteredMeetings.map((m) => (<MeetingCard key={m.id} meeting={m} onClick={() => openDetailModal(m.id, true)} />))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Detail Modal */}
      {showDetailModal && selectedMeeting && (() => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const hasRated = selectedMeeting.ratings?.some(r => r.studentId === currentUser.id);
        const myRating = selectedMeeting.ratings?.find(r => r.studentId === currentUser.id);
        
        return (
          <div className="studentdash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}>
            <div className="studentdash-modal-content studentdash-modal-detail" onClick={(e) => e.stopPropagation()}>
              <div className="studentdash-modal-header">
                <h2>Chi tiết buổi học</h2>
                <button className="studentdash-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
              </div>
              <div className="studentdash-modal-body">
                {/* Detail Fields... (Abbreviated for brevity, logic remains the same) */}
                <div className="detail-section">
                  <div className="detail-label">Chủ đề</div><div className="detail-value">{selectedMeeting.topic || "Không có"}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-label">Giảng viên</div><div className="detail-value">{selectedMeeting.tutor?.user?.fullName || "—"}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-label">Thời gian</div>
                  <div className="detail-value">{new Date(selectedMeeting.startTime).toLocaleString("vi-VN")}</div>
                </div>
                <div className="detail-section">
                  <div className="detail-label">Trạng thái</div>
                  <span className={`studentdash-meeting-status status-${(selectedMeeting.status || "").toLowerCase()}`}>
                    {selectedMeeting.status}
                  </span>
                </div>
                
                {/* Hiển thị rating đã có (nếu có) */}
                {selectedMeeting.status === "COMPLETED" && hasRated && myRating && (
                  <div className="detail-section" style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #86efac' }}>
                    <div className="detail-label" style={{ color: '#15803d', marginBottom: '8px' }}>✓ Đã đánh giá</div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: '20px', color: s <= myRating.score ? '#fbbf24' : '#d1d5db' }}>★</span>
                      ))}
                      <span style={{ marginLeft: '8px', color: '#059669', fontWeight: 'bold' }}>
                        {myRating.score}/5
                      </span>
                    </div>
                    {myRating.comment && (
                      <div style={{ color: '#065f46', fontSize: '14px', fontStyle: 'italic' }}>
                        "{myRating.comment}"
                      </div>
                    )}
                  </div>
                )}
                
                {/* Buttons */}
                {selectedMeeting.status === "PENDING" && (
                  <div className="detail-actions">
                    <button onClick={handleCancelMeeting} disabled={actionLoading} className="studentdash-btn studentdash-btn-cancel">
                      Hủy buổi học
                    </button>
                  </div>
                )}
                
                {/* Chỉ hiển thị nút đánh giá nếu COMPLETED và CHƯA đánh giá */}
                {selectedMeeting.status === "COMPLETED" && !hasRated && (
                  <div className="detail-actions">
                    <button onClick={() => setShowRating(!showRating)} className="studentdash-btn studentdash-btn-rate">
                      {showRating ? "Ẩn đánh giá" : "Đánh giá"}
                    </button>
                  </div>
                )}
                
                {/* Form đánh giá - chỉ hiển thị nếu CHƯA đánh giá */}
                {showRating && selectedMeeting.status === "COMPLETED" && !hasRated && (
                  <form onSubmit={handleSubmitRating} className="rating-box">
                     {/* Rating Form... */}
                     <div className="rating-field">
                      <label>Đánh giá:</label>
                      <div className="star-rating">
                        {[1,2,3,4,5].map(s => (
                          <button 
                            key={s} 
                            type="button" 
                            onClick={()=>setRating(s)} 
                            className={s<=rating?"star-active":"star-inactive"}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                     </div>
                     <textarea 
                       value={comment} 
                       onChange={e=>setComment(e.target.value)} 
                       className="rating-textarea" 
                       placeholder="Nhập nhận xét..." 
                     />
                     <button 
                       type="submit" 
                       disabled={actionLoading || rating === 0} 
                       className="studentdash-btn studentdash-btn-submit-rating"
                     >
                       {actionLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                     </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* NEW: Find Tutor Modal */}
      {showFindTutor && (
        <FindTutorModal onClose={() => setShowFindTutor(false)} />
      )}

    </div>
  );
}