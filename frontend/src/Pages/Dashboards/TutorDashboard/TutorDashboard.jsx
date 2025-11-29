import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { meetingsService, tutorsService, authService } from "../../../api.js";

import ManageAvailability from "./ManageAvailability"; 
import MyStudents from "./MyStudents";
import "./TutorDashboard.css";

export default function TutorDashboard() {
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, averageRating: 0 });
  const [confirmedMeetingsFull, setConfirmedMeetingsFull] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showListModal, setShowListModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressNote, setProgressNote] = useState("");
  const [progressHistory, setProgressHistory] = useState([]);

  const [currentTutorId, setCurrentTutorId] = useState(null);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [allMeetings, setAllMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showMyStudents, setShowMyStudents] = useState(false);

  const currentUser = authService.getCurrentUser();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData =  async () => {
    try {
      setLoading(true);
      const [pending, confirmed, history] = await Promise.all([
        meetingsService.getMyMeetings("PENDING"),
        meetingsService.getMyMeetings("CONFIRMED"),
        meetingsService.getHistory(),
      ]);

      try {
        const allTutors = await tutorsService.getAll();
        if (Array.isArray(allTutors) && currentUser) {
          const myProfile = allTutors.find(t => t.userId === currentUser.id);
          if (myProfile) setCurrentTutorId(myProfile.id);
        }
      } catch (err) {
        console.error("Failed to resolve tutor ID:", err);
      }

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

  const handleCompleteMeeting = async () => {
    if (!selectedMeeting) return;
    if (!window.confirm("Xác nhận buổi học đã hoàn thành?")) return;
    try {
      setActionLoading(true);
      await meetingsService.complete(selectedMeeting.id);
      alert("Đã hoàn thành buổi học!");
      setShowDetailModal(false);
      await fetchDashboardData();
    } catch (error) {
      alert("Lỗi: " + (error?.message || "Không thể hoàn thành buổi học"));
    } finally {
      setActionLoading(false);
    }
  };

  const openStudentModal = async (student) => {
    setSelectedStudent(student);
    setProgressNote("");
    setProgressHistory([]); 
    setShowStudentModal(true);

    if (selectedMeeting?.status !== 'PENDING') {
      try {
        const history = await tutorsService.getStudentProgress(student.id);
        if (Array.isArray(history)) {
           const myHistory = history.filter(item => {
             if (currentTutorId) return item.tutorId === currentTutorId;
             return item.tutorId === currentUser?.id;
           });
           myHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
           setProgressHistory(myHistory);
        }
      } catch (err) {
        console.error("Failed to load progress history", err);
      }
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedStudent || !progressNote.trim()) {
        alert("Vui lòng nhập ghi chú");
        return;
    }
    try {
        setActionLoading(true);
        await tutorsService.postProgress({
            studentId: selectedStudent.id,
            note: progressNote
        });
        alert(`Đã lưu tiến độ cho ${selectedStudent.fullName}`);
        setProgressNote("");
        const history = await tutorsService.getStudentProgress(selectedStudent.id);
        if (Array.isArray(history)) {
           const myHistory = history.filter(item => 
             currentTutorId ? item.tutorId === currentTutorId : item.tutorId === currentUser?.id
           );
           myHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
           setProgressHistory(myHistory);
        }
    } catch (error) {
        alert("Lỗi: " + (error?.message || "Không thể lưu tiến độ"));
    } finally {
        setActionLoading(false);
    }
  };

  const filteredMeetings = (allMeetings || []).filter((m) => {
    if (activeTab === "all") return true;
    return m.status === activeTab.toUpperCase();
  });

  const MeetingCard = ({ meeting, onClick }) => {
    const studentCount = (meeting.students || []).length;
    return (
      <div onClick={onClick} className="tutordash-meeting-card" role="button" tabIndex={0}>
        <div className="tutordash-meeting-time">{new Date(meeting.startTime).toLocaleString("vi-VN")}</div>
        <div className="tutordash-meeting-topic-list">{meeting.topic || "Không có chủ đề"}</div>
        <div className="tutordash-meeting-student-count">{studentCount} Sinh viên</div>
        <span className={`tutordash-meeting-status status-${(meeting.status || "").toLowerCase()}`}>{meeting.status}</span>
      </div>
    );
  };

  return (
    <div className="tutordash">
      <div className="tutordash-title-wrap">
        <h1 className="tutordash-title">Bảng điều khiển</h1>
      </div>

      <div className="tutordash-stats" aria-live="polite">
        {[
          { value: stats.pending, label: "Chờ xử lý", className: "tutordash-stat-pending" },
          { value: stats.confirmed, label: "Đã xác nhận", className: "tutordash-stat-confirmed" },
          { value: stats.completed, label: "Hoàn thành", className: "tutordash-stat-completed" },
          { value: stats.averageRating > 0 ? `${stats.averageRating} ⭐` : "—", label: "Đánh giá TB", className: "tutordash-stat-rating" }
        ].map((stat, i) => (
          <div key={i} className={`tutordash-stat-card ${stat.className}`}>
            <div className="tutordash-stat-value">{stat.value}</div>
            <div className="tutordash-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="tutordash-panel">
        <div className="tutordash-panel-header">
          <h2 className="tutordash-section-title">Buổi học đã xác nhận</h2>
          <button onClick={openListModal} className="tutordash-view-all-btn">Xem tất cả</button>
        </div>

        {loading ? <p>Đang tải...</p> : confirmedMeetings.length === 0 ? (
          <p className="tutordash-empty">Chưa có buổi học nào được xác nhận</p>
        ) : (
          <div className="tutordash-meetings-grid">
            {confirmedMeetings.map((m) => {
              const studentCount = (m.students || []).length;
              return (
                <div key={m.id} onClick={() => openDetailModal(m.id)} className="tutordash-meeting-box" role="button" tabIndex={0}>
                  <div className="tutordash-box-time">
                    {new Date(m.startTime).toLocaleString("vi-VN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="tutordash-topic-big">{m.topic || "Không có chủ đề"}</div>
                  <div className="tutordash-student-count">{studentCount} Sinh viên</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="tutordash-panel" style={{ marginTop: 24 }}>
        <h2 className="tutordash-section-title">Hành động nhanh</h2>
        <div className="tutordash-grid">

        {/* NEW WAY: Direct Link */}
        <Link to="/dashboard/tutor/library" className="tutordash-card-link" style={{cursor: 'pointer'}}>
            <div className="tutordash-quick-card" style={{ borderColor: "#FF7051" }}>
              <div className="tutordash-quick-icon" style={{ color: "#FF7051" }}>📚</div>
              <div className="tutordash-quick-title">Thư viện HCMUT</div>
          </div>
        </Link>       

          <div onClick={() => setShowAvailabilityModal(true)} className="tutordash-card-link" style={{cursor: 'pointer'}}>
            <div className="tutordash-quick-card" style={{ borderColor: "#667eea" }}>
              <div className="tutordash-quick-icon" style={{ color: "#667eea" }}>📅</div>
              <div className="tutordash-quick-title">Quản lý lịch trống</div>
            </div>
          </div>

          <div onClick={() => setShowMyStudents(true)} className="tutordash-card-link" style={{cursor: 'pointer'}}>
            <div className="tutordash-quick-card" style={{ borderColor: "#48bb78" }}>
              <div className="tutordash-quick-icon" style={{ color: "#48bb78" }}>👥</div>
              <div className="tutordash-quick-title">Học sinh của tôi</div>
            </div>
          </div>
        </div>
      </div>

      {showListModal && (
        <div className="tutordash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowListModal(false); }}>
          <div className="tutordash-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tutordash-modal-header">
              <h2>Tất cả buổi học</h2>
              <button className="tutordash-modal-close" onClick={() => setShowListModal(false)}>✕</button>
            </div>

            <div className="tutordash-modal-tabs">
              {[
                { key: "all", label: "Tất cả" },
                { key: "pending", label: "Chờ xác nhận" },
                { key: "confirmed", label: "Đã xác nhận" },
                { key: "completed", label: "Hoàn thành" },
                { key: "canceled", label: "Đã hủy" }
              ].map((tab) => (
                <button key={tab.key} className={activeTab === tab.key ? "tutordash-tab-active" : ""} onClick={() => setActiveTab(tab.key)}>
                  {tab.label} ({tab.key === "all" ? (allMeetings || []).length : (allMeetings || []).filter(m => m.status === tab.key.toUpperCase()).length})
                </button>
              ))}
            </div>

            <div className="tutordash-modal-body">
              {filteredMeetings.length === 0 ? <p className="tutordash-empty">Không có buổi học nào</p> : (
                <div className="tutordash-meetings-list">
                  {filteredMeetings.map((m) => (
                    <MeetingCard key={m.id} meeting={m} onClick={() => openDetailModal(m.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedMeeting && (
        <div className="tutordash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}>
          <div className="tutordash-modal-content tutordash-modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="tutordash-modal-header">
              <h2>Chi tiết buổi học</h2>
              <button className="tutordash-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="tutordash-modal-body">
              <div className="detail-section">
                <div className="detail-label">
                    {selectedMeeting.status === "PENDING" ? "Sinh viên (Nhấn để xem info)" : "Sinh viên (Nhấn để ghi chú)"}
                </div>
                <div className="tutordash-student-chips">
                  {(selectedMeeting.students || []).map((s) => (
                    <button key={s.id} className="tutordash-student-chip" onClick={() => openStudentModal(s)}>
                      {s.fullName} {selectedMeeting.status !== "PENDING" && "✏️"}
                    </button>
                  ))}
                  {(selectedMeeting.students || []).length === 0 && <span>—</span>}
                </div>
              </div>

              {[
                { label: "Chủ đề", value: selectedMeeting.topic || "Không có chủ đề" },
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
                <span className={`tutordash-meeting-status status-${selectedMeeting.status.toLowerCase()}`}>{selectedMeeting.status}</span>
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
                  <button onClick={handleConfirmMeeting} disabled={actionLoading} className="tutordash-btn-confirm">
                    {actionLoading ? "..." : "Xác nhận"}
                  </button>
                  <button onClick={handleCancelMeeting} disabled={actionLoading} className="tutordash-btn-cancel">
                    {actionLoading ? "..." : "Từ chối"}
                  </button>
                </div>
              )}

              {selectedMeeting.status === "CONFIRMED" && (
                <div className="detail-actions">
                  <button onClick={handleCompleteMeeting} disabled={actionLoading} className="tutordash-btn-complete">
                    {actionLoading ? "..." : "Hoàn thành"}
                  </button>
                  <button onClick={handleCancelMeeting} disabled={actionLoading} className="tutordash-btn-cancel">
                    {actionLoading ? "..." : "Hủy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showStudentModal && selectedStudent && (
        <div className="tutordash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowStudentModal(false); }}>
            <div className="tutordash-modal-content tutordash-modal-detail" onClick={(e) => e.stopPropagation()}>
                <div className="tutordash-modal-header">
                    <h2>Thông tin sinh viên</h2>
                    <button className="tutordash-modal-close" onClick={() => setShowStudentModal(false)}>✕</button>
                </div>
                <div className="tutordash-modal-body">
                    <div className="detail-section">
                        <div className="detail-label">Họ tên</div>
                        <div className="detail-value">{selectedStudent.fullName}</div>
                    </div>
                    <div className="detail-section">
                        <div className="detail-label">Email</div>
                        <div className="detail-value">{selectedStudent.email}</div>
                    </div>

                    {selectedMeeting?.status !== "PENDING" && (
                        <>
                            <div className="detail-section" style={{border: 'none'}}>
                                <div className="detail-label">Thêm nhận xét / Tiến độ</div>
                                <textarea 
                                    className="tutordash-note-input"
                                    rows="3"
                                    placeholder="Nhập ghi chú mới..."
                                    value={progressNote}
                                    onChange={(e) => setProgressNote(e.target.value)}
                                />
                            </div>
                            <div className="detail-actions">
                                <button onClick={handleSaveProgress} disabled={actionLoading} className="tutordash-btn-confirm" style={{width:'100%'}}>
                                    {actionLoading ? "Đang lưu..." : "Lưu tiến độ"}
                                </button>
                            </div>

                            <div className="detail-section" style={{marginTop: '24px', borderTop: '2px solid #d4d8e6', paddingTop: '16px'}}>
                                <div className="detail-label">Lịch sử tiến độ</div>
                                {progressHistory.length === 0 ? (
                                    <p style={{color: '#6b7280', fontStyle: 'italic', marginTop: '8px'}}>Chưa có ghi chú nào.</p>
                                ) : (
                                    <div className="tutordash-history-list">
                                        {progressHistory.map((item) => (
                                            <div key={item.id} className="tutordash-history-item">
                                                <div className="tutordash-history-date">
                                                    {new Date(item.createdAt).toLocaleString("vi-VN", {
                                                        year: 'numeric', month: 'numeric', day: 'numeric', 
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="tutordash-history-note">{item.note}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {showAvailabilityModal && (
        <ManageAvailability onClose={() => setShowAvailabilityModal(false)} />
      )}

      {showMyStudents && (
        <MyStudents onClose={() => setShowMyStudents(false)} />
      )}

    </div>
  );
}
