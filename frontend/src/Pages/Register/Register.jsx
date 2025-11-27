import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
// Assuming tutorsService calls the getAll function you described
import { tutorsService, aiService } from "../../api"; 
import { showError, showSuccess } from "../../utils/errorHandler"; 

export default function Register() {
  // 'allTutors' stores the full list from DB (source of truth)
  const [allTutors, setAllTutors] = useState([]);
  // 'displayedTutors' is what is currently shown on screen (after filter)
  const [displayedTutors, setDisplayedTutors] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  
  // AI Search State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCriteria, setAiCriteria] = useState({
    subjects: "",
    minRating: 4,
    preferredExperience: 0
  });

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    setLoading(true);
    try {
      // 1. Fetch ALL tutors
      const data = await tutorsService.getAll();
      const tutorList = Array.isArray(data) ? data : [];

      setAllTutors(tutorList);
      setDisplayedTutors(tutorList); // Initially show all

      // 2. Extract unique subjects from expertise
      const allExpertise = tutorList.flatMap(t => t.expertise || []);
      const uniqueSubjects = [...new Set(allExpertise)]; // Remove duplicates
      
      // 3. Save to Local Storage & State
      localStorage.setItem('availableSubjects', JSON.stringify(uniqueSubjects));
      setAvailableSubjects(uniqueSubjects);

    } catch (error) {
      console.error("Failed to load tutors", error);
      showError(error);
      setAllTutors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      // If empty, show all
      setDisplayedTutors(allTutors);
      return;
    }

    // 4. Client-side Filtering Logic
    const filtered = allTutors.filter(tutor => {
      // Check Name
      const nameMatch = tutor.user?.fullName?.toLowerCase().includes(term);
      
      // Check Expertise (Subject)
      // Returns true if ANY of the expertise strings include the search term
      const subjectMatch = tutor.expertise?.some(subject => 
        subject.toLowerCase().includes(term)
      );

      return nameMatch || subjectMatch;
    });

    setDisplayedTutors(filtered);
  };

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
      
      if (res.data && Array.isArray(res.data)) {
        const formattedTutors = res.data.map(item => ({
          id: item.tutorId,
          user: { 
            fullName: item.tutorName, 
            email: item.tutorEmail 
          },
          bio: item.explanation.reasons ? item.explanation.reasons.join(". ") : "AI Gợi ý",
          expertise: item.profile.specialization 
            ? item.profile.specialization.split(',').map(s => s.trim()) 
            : [],
          rating: item.profile.rating
        }));

        // For AI match, we override the display list directly
        setDisplayedTutors(formattedTutors);
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
            list="subject-suggestions" // Connect to datalist
            placeholder="Tìm theo tên hoặc môn học (VD: Đại số)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="reg-search-input"
          />
          {/* 5. Suggestions Dropdown from Local Data */}
          <datalist id="subject-suggestions">
            {availableSubjects.map((sub, index) => (
              <option key={index} value={sub} />
            ))}
          </datalist>

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
          {Array.isArray(displayedTutors) && displayedTutors.length > 0 ? (
            displayedTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          ) : (
            <p>Không tìm thấy tutor phù hợp.</p>
          )}
        </div>
      )}

      {/* AI Modal (Unchanged) */}
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
                <label>Đánh giá tối thiểu (Sao):</label>
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

function TutorCard({ tutor }) {
  return (
    <div className="course-card">
      <div className="course-card-body">
        <h3 className="course-card-title">{tutor.user?.fullName}</h3>
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