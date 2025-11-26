import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
import { tutorsAPI, AI_API } from "../../api"; // Import real APIs

export default function Register() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // AI Search State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // 1. Fetch All Tutors on Load
  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async (filters = {}) => {
    setLoading(true);
    try {
      // Calls GET /tutors?name=...
      const data = await tutorsAPI.getAll(filters);
      setTutors(Array.isArray(data) ? data : []); 
    } catch (error) {
      console.error("Failed to load tutors", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Basic Search
  const handleSearch = (e) => {
    e.preventDefault();
    loadTutors({ name: searchTerm }); // Filter by name/expertise
  };

  // 3. Handle AI Matching
  const handleAiMatch = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      // Calls POST /ai/match-tutors
      const matches = await AI_API.matchTutors({ request: aiPrompt });
      setTutors(matches); // Update list with AI recommendations
      setShowAiModal(false);
    } catch (error) {
      alert("AI Matching failed. Please try again.");
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

      {/* Search Bar & AI Button */}
      <div className="reg-controls">
        <form onSubmit={handleSearch} className="reg-search-form">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc môn học (VD: C++, Đại số)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="reg-search-input"
          />
          <button type="submit" className="btn-search">Tìm kiếm</button>
        </form>
        
        <button 
          className="btn-ai"
          onClick={() => setShowAiModal(true)}
        >
          ✨ AI Gợi ý
        </button>
      </div>

      {/* Tutor Grid */}
      {loading ? (
        <div className="loading">Đang tải danh sách...</div>
      ) : (
        <div className="reg-grid">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
          {tutors.length === 0 && <p>Không tìm thấy tutor phù hợp.</p>}
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>AI Matching 🤖</h3>
            <p>Mô tả nhu cầu học tập của bạn (VD: "Em bị mất gốc Hóa, cần ôn thi gấp")</p>
            <textarea 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows="4"
              placeholder="Nhập nhu cầu của bạn..."
            />
            <div className="modal-actions">
              <button onClick={() => setShowAiModal(false)}>Hủy</button>
              <button 
                onClick={handleAiMatch} 
                disabled={aiLoading}
                className="btn-primary"
              >
                {aiLoading ? "Đang phân tích..." : "Tìm Tutor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for Tutor Card
function TutorCard({ tutor }) {
  // Backend structure: tutor = { id, user: { fullName }, bio, expertise: [] }
  return (
    <div className="course-card">
      <div className="course-card-body">
        <h3 className="course-card-title">{tutor.user?.fullName}</h3>
        <p className="tutor-bio">{tutor.bio || "Chưa có mô tả"}</p>
        <div className="tutor-tags">
          {tutor.expertise?.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
        {/* Link to Detail Page (ID is TutorProfile ID) */}
        <Link to={`/register/${tutor.id}`} className="btn-detail">
          Xem Lịch & Đặt Chỗ
        </Link>
      </div>
    </div>
  );
}