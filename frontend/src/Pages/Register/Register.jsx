import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
import { tutorsService, aiService } from "../../api";
import { showError, showSuccess } from "../../utils/errorHandler"; 

export default function Register() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // AI Search State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCriteria, setAiCriteria] = useState({
    subjects: "",
    minRating: 4,
    preferredExperience: 0 // Default based on your data
  });

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await tutorsService.getAll(filters);
      // Standard API returns array directly
      setTutors(Array.isArray(data) ? data : []); 
    } catch (error) {
      console.error("Failed to load tutors", error);
      showError(error);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTutors({ name: searchTerm });
  };

  // --- FIXED AI MATCH FUNCTION ---
  const handleAiMatch = async () => {
    if (!aiCriteria.subjects.trim()) {
      showError("Vui lòng nhập môn học");
      return;
    }
    setAiLoading(true);

    try {
      const payload = {
        subjects: aiCriteria.subjects.split(',').map(s => s.trim()),
        minRating: Number(aiCriteria.minRating),
        preferredExperience: Number(aiCriteria.preferredExperience),
        maxHourlyRate: 1000000, 
        limit: 5
      };

      const res = await aiService.matchTutors(payload);
      
      // 1. Check if 'res.data' exists (based on your JSON structure)
      if (res.data && Array.isArray(res.data)) {
        
        // 2. Transform AI Data -> Standard Tutor Data for UI
        const formattedTutors = res.data.map(item => ({
          id: item.tutorId, // Map tutorId -> id
          user: { 
            fullName: item.tutorName, // Map tutorName -> user.fullName
            email: item.tutorEmail 
          },
          // Map AI "reasons" to "bio" so user sees why they matched
          bio: item.explanation.reasons ? item.explanation.reasons.join(". ") : "AI Gợi ý",
          
          // Map "specialization" string ("Toán, Lý") -> Array ["Toán", "Lý"]
          expertise: item.profile.specialization 
            ? item.profile.specialization.split(',').map(s => s.trim()) 
            : [],
            
          rating: item.profile.rating
        }));

        setTutors(formattedTutors);
        setShowAiModal(false);
        showSuccess(`Tìm thấy ${formattedTutors.length} tutor phù hợp!`);
      } else {
        showError("AI không tìm thấy kết quả phù hợp.");
      }
    } catch (error) {
      console.error("AI Match Error:", error);
      showError("Lỗi khi kết nối AI.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="reg-container">
      <header className="reg-header">
        <h1 className="reg-title">Tìm Giảng Viên & Tutor</h1>
        <p>Tìm kiếm theo môn học, tên hoặc sử dụng AI để được gợi ý.</p>
      </header>

      <div className="reg-controls">
        <form onSubmit={handleSearch} className="reg-search-form">
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="reg-search-input"
          />
          <button type="submit" className="btn-search">Tìm kiếm</button>
        </form>
        
        <button className="btn-ai" onClick={() => setShowAiModal(true)}>
          ✨ AI Filter
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải danh sách...</div>
      ) : (
        <div className="reg-grid">
          {/* Safety check before mapping */}
          {Array.isArray(tutors) && tutors.length > 0 ? (
            tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          ) : (
            <p>Không tìm thấy tutor phù hợp.</p>
          )}
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>AI Matching 🤖</h3>
            <p>Nhập môn học bạn cần hỗ trợ:</p>
            
            <label>Môn học (cách nhau dấu phẩy):</label>
            <input 
              type="text"
              className="modal-input"
              placeholder="VD: Giải tích 1, Đại số tuyến tính..."
              value={aiCriteria.subjects}
              onChange={(e) => setAiCriteria({...aiCriteria, subjects: e.target.value})}
            />

            <div className="modal-row">
              <div>
                <label>Đánh giá (Sao):</label>
                <input 
                  type="number"
                  className="modal-input"
                  min="1" max="5"
                  value={aiCriteria.minRating}
                  onChange={(e) => setAiCriteria({...aiCriteria, minRating: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowAiModal(false)}>Hủy</button>
              <button 
                onClick={handleAiMatch} 
                disabled={aiLoading}
                className="btn-primary"
              >
                {aiLoading ? "Đang phân tích..." : "Tìm Kiếm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component remains standard, as we transformed the data to fit it
function TutorCard({ tutor }) {
  return (
    <div className="course-card">
      <div className="course-card-body">
        <h3 className="course-card-title">{tutor.user?.fullName}</h3>
        {/* If it's an AI match, the 'bio' will contain the AI reasons */}
        <p className="tutor-bio">{tutor.bio || "Chưa có mô tả"}</p>
        <div className="tutor-tags">
          {tutor.expertise?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
        <Link to={`/register/${tutor.id}`} className="btn-detail">
          Xem Lịch & Đặt Chỗ
        </Link>
      </div>
    </div>
  );
}