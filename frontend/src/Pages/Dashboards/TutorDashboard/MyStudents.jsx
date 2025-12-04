import React, { useState, useEffect } from "react";
import { meetingsService, tutorsService, authService } from "../../../api.js";
import "./MyStudents.css";

export default function MyStudents({ onClose }) {
  // ... (State logic same as before) ...
  const [view, setView] = useState("list");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTutorId, setCurrentTutorId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressNote, setProgressNote] = useState("");
  const [progressHistory, setProgressHistory] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const currentUser = authService.getCurrentUser();

  // ... (useEffect and Handlers same as before) ...
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [confirmed, history] = await Promise.all([
          meetingsService.getMyMeetings("CONFIRMED"),
          meetingsService.getHistory(),
        ]);
        const completed = (history || []).filter(m => m.status === "COMPLETED");
        const allClasses = [...(confirmed || []), ...completed];
        allClasses.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setClasses(allClasses);
        const allTutors = await tutorsService.getAll();
        if (Array.isArray(allTutors) && currentUser) {
          const myProfile = allTutors.find((t) => t.userId === currentUser.id);
          if (myProfile) setCurrentTutorId(myProfile.id);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  // this line to suppress currentuser warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setProgressNote("");
    setProgressHistory([]);
    setView("detail");
    try {
      const history = await tutorsService.getStudentProgress(student.id);
      if (Array.isArray(history)) {
        const myHistory = history.filter((item) => {
          if (currentTutorId) return item.tutorId === currentTutorId;
          return item.tutorId === currentUser?.id;
        });
        myHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProgressHistory(myHistory);
      }
    } catch (err) { console.error("Error loading history:", err); }
  };

  const handleSave = async () => {
    if (!progressNote.trim()) return alert("Vui lòng nhập nội dung.");
    try {
      setActionLoading(true);
      await tutorsService.postProgress({ studentId: selectedStudent.id, note: progressNote });
      alert("Đã lưu thành công!");
      setProgressNote("");
      const history = await tutorsService.getStudentProgress(selectedStudent.id);
      if (Array.isArray(history)) {
        const myHistory = history.filter((item) => 
           currentTutorId ? item.tutorId === currentTutorId : item.tutorId === currentUser?.id
        );
        myHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProgressHistory(myHistory);
      }
    } catch (error) { alert("Lỗi: " + (error.message || "Không thể lưu")); } finally { setActionLoading(false); }
  };

  return (
    <div className="tutordash-modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose() }}>
      <div className="tutordash-modal-content ms-modal-size" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="tutordash-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {view === 'detail' && (
              <button className="ms-back-btn-icon" onClick={() => setView('list')}>←</button>
            )}
            <h2>{view === 'list' ? "Lớp học & Học sinh" : "Chi tiết tiến độ"}</h2>
          </div>
          <button className="tutordash-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="tutordash-modal-body">
          
          {/* VIEW: CLASS LIST */}
          {view === 'list' && (
            loading ? <p className="tutordash-empty">Đang tải...</p> : 
            classes.length === 0 ? <p className="tutordash-empty">Chưa có lớp học nào (Confirmed/Completed).</p> :
            <div className="ms-class-grid">
              {classes.map(cls => (
                <div key={cls.id} className="ms-class-box">
                  <div className="ms-class-header">
                    <div className="ms-class-topic">{cls.topic || "Không có chủ đề"}</div>
                    <span className={`tutordash-meeting-status status-${(cls.status || "").toLowerCase()}`}>
                      {cls.status}
                    </span>
                  </div>
                  <div className="ms-class-time">
                    {new Date(cls.startTime).toLocaleString("vi-VN", {
                      weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="ms-divider"></div>

                  <div className="ms-student-list-group">
                    {(cls.students || []).length === 0 ? (
                       <div className="ms-no-student">Không có sinh viên</div>
                    ) : (
                       (cls.students || []).map(s => (
                         <div key={s.id} className="ms-student-row" onClick={() => handleSelectStudent(s)}>
                           <div className="ms-student-avatar-small">{s.fullName.charAt(0)}</div>
                           <div className="ms-student-name-row">{s.fullName}</div>
                           <div className="ms-student-arrow">›</div>
                         </div>
                       ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW: DETAIL */}
          {view === 'detail' && selectedStudent && (
            <div className="ms-detail-view">
              <div className="detail-section">
                <div className="detail-label">Học sinh</div>
                <div className="detail-value">{selectedStudent.fullName}</div>
                <div style={{color:'#666'}}>{selectedStudent.email}</div>
              </div>

              <div className="detail-section" style={{border:'none'}}>
                <div className="detail-label">Thêm ghi chú</div>
                <textarea
                  className="tutordash-note-input"
                  rows="4"
                  placeholder="Nhập nhận xét..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                />
              </div>

              <div className="detail-actions">
                <button 
                  className="tutordash-btn-confirm" 
                  style={{width:'100%'}} 
                  disabled={actionLoading}
                  onClick={handleSave}
                >
                  {actionLoading ? "Đang lưu..." : "Lưu tiến độ"}
                </button>
              </div>

              <div className="detail-section" style={{marginTop:'24px', borderTop:'2px solid #d4d8e6', paddingTop:'16px'}}>
                <div className="detail-label">Lịch sử ({progressHistory.length})</div>
                <div className="tutordash-history-list">
                  {progressHistory.length === 0 ? <p style={{fontStyle:'italic', color:'#888'}}>Trống</p> : 
                    progressHistory.map(item => (
                      <div key={item.id} className="tutordash-history-item">
                        <div className="tutordash-history-date">
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </div>
                        <div className="tutordash-history-note">{item.note}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
