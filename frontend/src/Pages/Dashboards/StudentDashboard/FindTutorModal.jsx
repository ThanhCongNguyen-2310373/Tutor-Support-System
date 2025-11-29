import React, { useState, useEffect } from "react";
import { tutorsService, aiService, meetingsAPI, tutorsAPI } from "../../../api";
import "./FindTutorModal.css";

export default function FindTutorModal({ onClose }) {
  // View State: 'list' | 'detail' | 'ai'
  const [view, setView] = useState("list");
  
  // Data State
  const [allTutors, setAllTutors] = useState([]);
  const [displayedTutors, setDisplayedTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Detail/Booking State
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [tutorDetail, setTutorDetail] = useState(null);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // --- NEW: Advanced AI Criteria State ---
  const [aiCriteria, setAiCriteria] = useState({
    subjects: "",
    preferredExperience: 3,
    minRating: 4,
    // Default value kept as placeholder for backend logic
    maxHourlyRate: 100000, 
    availability: "weekdays"
  });

  useEffect(() => {
    const loadTutors = async () => {
      try {
        setLoading(true);
        const data = await tutorsService.getAll();
        const list = Array.isArray(data) ? data : [];
        setAllTutors(list);
        setDisplayedTutors(list);
      } catch (error) {
        console.error("Failed to load tutors", error);
      } finally {
        setLoading(false);
      }
    };
    loadTutors();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lowerTerm = term.toLowerCase().trim();
    if (!lowerTerm) {
      setDisplayedTutors(allTutors);
      return;
    }
    const filtered = allTutors.filter(t => 
      t.user?.fullName?.toLowerCase().includes(lowerTerm) ||
      t.expertise?.some(ex => ex.toLowerCase().includes(lowerTerm))
    );
    setDisplayedTutors(filtered);
  };

// --- FIXED: Direct Mapping of AI Response ---
  const handleAiMatch = async () => {
    if (!aiCriteria.subjects.trim()) return alert("Vui lòng nhập ít nhất một môn học.");
    
    setActionLoading(true);
    try {
      const payload = {
        subjects: aiCriteria.subjects.split(',').map(s => s.trim()).filter(s => s),
        preferredExperience: Number(aiCriteria.preferredExperience),
        minRating: Number(aiCriteria.minRating),
        maxHourlyRate: Number(aiCriteria.maxHourlyRate),
        availability: aiCriteria.availability,
        limit: 5
      };

      const res = await aiService.matchTutors(payload);
      
      // Check if we have data. 
      // Note: Based on your interceptor, 'res' is the body { message, data: [...] }
      // So the array is in 'res.data'
      const results = res.data;

      if (Array.isArray(results) && results.length > 0) {
        
        // Map AI format -> UI format directly
        // Don't rely on allTutors.filter(...)
        const formattedTutors = results.map(item => ({
          id: item.tutorId,
          user: { 
            fullName: item.tutorName, 
            email: item.tutorEmail 
          },
          // Use AI reasons as the Bio/Description
          bio: item.explanation?.reasons?.join(" • ") || "Được AI đề xuất dựa trên tiêu chí của bạn.",
          // Convert string specialization to array for tags
          expertise: item.profile?.specialization 
            ? item.profile.specialization.split(',').map(s => s.trim()) 
            : [],
          averageRating: item.profile?.rating
        }));
        
        setDisplayedTutors(formattedTutors);
        setView("list");
        setSearchTerm(`AI Result: ${payload.subjects.join(", ")}`);
      } else {
        alert("AI không tìm thấy kết quả phù hợp với tiêu chí này.");
      }
    } catch (error) {
      console.error("AI Error", error);
      alert("Lỗi kết nối AI server.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    setSelectedTutorId(id);
    setLoading(true);
    setView("detail");
    try {
      const data = await tutorsAPI.getTutorById(id);
      setTutorDetail(data);
    } catch (error) {
      console.error("Error loading detail", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookingTopic.trim()) return alert("Vui lòng nhập chủ đề.");
    setActionLoading(true);
    try {
      await meetingsAPI.book({
        tutorId: selectedTutorId,
        slotId: bookingSlotId,
        topic: bookingTopic
      });
      alert("Đặt lịch thành công! Vui lòng chờ xác nhận.");
      setBookingSlotId(null);
      setBookingTopic("");
      onClose();
    } catch (error) {
      alert("Lỗi đặt lịch: " + (error.message || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="ft-modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose() }}>
      <div className="ft-modal-content ft-size" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="ft-header">
          <div className="ft-header-left">
            {view !== 'list' && (
              <button className="ft-back-btn" onClick={() => setView('list')}>←</button>
            )}
            <h2>
              {view === 'list' && "Tìm Giảng Viên & Tutor"}
              {view === 'ai' && "Bộ Lọc AI Nâng Cao"}
              {view === 'detail' && "Chi Tiết & Đặt Lịch"}
            </h2>
          </div>
          <button className="ft-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="ft-body">
          
          {/* VIEW: LIST (SEARCH) */}
          {view === 'list' && (
            <>
              <div className="ft-controls">
                <input 
                  type="text" 
                  className="ft-search-input"
                  placeholder="Tìm môn học, tên giảng viên..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <button className="ft-ai-btn" onClick={() => setView('ai')}>
                  🤖 AI Filter
                </button>
              </div>

              {loading ? <div className="ft-loading">Đang tải...</div> : (
                <div className="ft-grid">
                  {displayedTutors.length === 0 ? <p className="ft-empty">Không tìm thấy kết quả.</p> :
                    displayedTutors.map(tutor => (
                      <div key={tutor.id} className="ft-card">
                        <div className="ft-card-header">
                          <div className="ft-avatar">{tutor.user?.fullName?.charAt(0)}</div>
                          <div>
                            <div className="ft-name">{tutor.user?.fullName}</div>
                            <div className="ft-rating">⭐ {tutor.averageRating ? Number(tutor.averageRating).toFixed(1) : "New"}</div>
                          </div>
                        </div>
                        <div className="ft-bio">{tutor.bio || "Chưa có giới thiệu."}</div>
                        <div className="ft-tags">
                          {tutor.expertise?.slice(0,3).map((ex,i) => <span key={i} className="ft-tag">{ex}</span>)}
                        </div>
                        <button className="ft-detail-btn" onClick={() => handleViewDetail(tutor.id)}>
                          Xem Lịch
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </>
          )}

          {/* VIEW: AI ADVANCED FORM */}
          {view === 'ai' && (
            <div className="ft-ai-container">
              <p className="ft-ai-desc">Nhập các tiêu chí để AI tìm kiếm Tutor phù hợp nhất cho bạn.</p>
              
              <div className="ft-adv-form">
                
                {/* Subjects */}
                <div className="ft-form-group full-width">
                  <label>Môn học (ngăn cách bởi dấu phẩy)</label>
                  <input 
                    type="text" 
                    className="ft-input" 
                    placeholder="VD: Giải Tích 1, Đại Số Tuyến Tính"
                    value={aiCriteria.subjects}
                    onChange={(e) => setAiCriteria({...aiCriteria, subjects: e.target.value})}
                  />
                </div>

                {/* Row 1: Experience & Rating */}
                <div className="ft-form-row">
                  <div className="ft-form-group">
                    <label>Kinh nghiệm (năm)</label>
                    <input 
                      type="number" 
                      className="ft-input" 
                      min="0"
                      value={aiCriteria.preferredExperience}
                      onChange={(e) => setAiCriteria({...aiCriteria, preferredExperience: e.target.value})}
                    />
                  </div>
                  <div className="ft-form-group">
                    <label>Đánh giá tối thiểu</label>
                    <select 
                      className="ft-input"
                      value={aiCriteria.minRating}
                      onChange={(e) => setAiCriteria({...aiCriteria, minRating: e.target.value})}
                    >
                      <option value="3">3 ⭐ trở lên</option>
                      <option value="4">4 ⭐ trở lên</option>
                      <option value="5">5 ⭐ tuyệt đối</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Availability Only (Price removed) */}
                <div className="ft-form-row">
                  <div className="ft-form-group">
                    <label>Thời gian rảnh</label>
                    <select 
                      className="ft-input"
                      value={aiCriteria.availability}
                      onChange={(e) => setAiCriteria({...aiCriteria, availability: e.target.value})}
                    >
                      <option value="weekdays">Trong tuần (Weekdays)</option>
                      <option value="weekends">Cuối tuần (Weekends)</option>
                      <option value="both">Linh hoạt</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="ft-ai-submit"
                  disabled={actionLoading}
                  onClick={handleAiMatch}
                >
                  {actionLoading ? "Đang phân tích..." : "Tìm Kiếm (AI)"}
                </button>

              </div>
            </div>
          )}

          {/* VIEW: DETAIL & BOOKING (Unchanged) */}
          {view === 'detail' && (
            loading ? <div className="ft-loading">Đang tải chi tiết...</div> :
            !tutorDetail ? <div className="ft-empty">Lỗi tải dữ liệu.</div> :
            <div className="ft-detail-container">
              <div className="ft-profile-section">
                <h1 className="ft-profile-name">{tutorDetail.user?.fullName}</h1>
                <p className="ft-profile-bio">{tutorDetail.bio}</p>
                <div className="ft-tags">
                  {tutorDetail.expertise?.map((ex,i) => <span key={i} className="ft-tag-large">{ex}</span>)}
                </div>
              </div>

              <h3 className="ft-section-title">📅 Lịch Rảnh (Availability)</h3>
              <div className="ft-slots-grid">
                {(tutorDetail.availabilitySlots || []).filter(s => !s.isBooked).length === 0 ? (
                  <p className="ft-empty">Hiện chưa có lịch rảnh.</p>
                ) : (
                  (tutorDetail.availabilitySlots || []).filter(s => !s.isBooked).map(slot => (
                    <div key={slot.id} className="ft-slot-card">
                      <div className="ft-slot-info">
                        <div className="ft-slot-date">
                          {new Date(slot.startTime).toLocaleDateString('vi-VN', {weekday: 'short', day:'2-digit', month:'2-digit'})}
                        </div>
                        <div className="ft-slot-time">
                          {new Date(slot.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} - 
                          {new Date(slot.endTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <button className="ft-book-btn" onClick={() => setBookingSlotId(slot.id)}>Đặt</button>
                    </div>
                  ))
                )}
              </div>

              {bookingSlotId && (
                <div className="ft-booking-form">
                  <h4 className="ft-booking-title">Xác nhận đặt lịch</h4>
                  <input 
                    type="text" 
                    className="ft-topic-input"
                    placeholder="Nhập chủ đề buổi học..."
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    autoFocus
                  />
                  <div className="ft-booking-actions">
                    <button className="ft-cancel-btn" onClick={() => setBookingSlotId(null)}>Hủy</button>
                    <button className="ft-confirm-btn" disabled={actionLoading} onClick={handleBook}>
                      {actionLoading ? "..." : "Xác nhận"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
