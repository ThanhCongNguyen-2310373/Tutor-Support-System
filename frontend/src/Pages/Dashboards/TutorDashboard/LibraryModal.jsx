import React, { useState, useEffect } from "react";
import { externalService } from "../../../api.js";
import "./LibraryModal.css";
// You might need to adjust this path or use a generic icon if the SVG is missing
// defaulting to a simple text icon if image fails to load
const BookIcon = () => <span style={{fontSize: '2.5rem'}}>📖</span>; 

export default function LibraryModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // search | popular | recommendations

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [popular, recommended] = await Promise.all([
        externalService.getPopularDocuments(10),
        externalService.getRecommendations(),
      ]);
      setPopularBooks(popular.data || []);
      setRecommendations(recommended.data || []);
    } catch (error) {
      console.error("Failed to fetch library data:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return alert("Vui lòng nhập từ khóa tìm kiếm");

    try {
      setLoading(true);
      setActiveTab("search");
      const response = await externalService.searchLibrary(query);
      setSearchResults(response.data || []);
    } catch (error) {
      alert("Không thể tìm kiếm tài liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async (docId) => {
    try {
      const response = await externalService.getDocumentUrl(docId);
      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        alert("Không thể mở tài liệu");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lấy link tài liệu");
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "popular": return popularBooks;
      case "recommendations": return recommendations;
      default: return searchResults;
    }
  };

  const data = getCurrentData();

  return (
    <div className="lib-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lib-modal-content lib-size" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="lib-modal-header">
          <div className="lib-header-left">
            <h2>Thư Viện Số HCMUT</h2>
          </div>
          <button className="lib-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="lib-modal-body">
          
          {/* TABS */}
          <div className="lib-tabs">
            <button
              className={`lib-tab ${activeTab === "search" ? "active" : ""}`}
              onClick={() => setActiveTab("search")}
            >
              🔍 Tìm kiếm
            </button>
            <button
              className={`lib-tab ${activeTab === "popular" ? "active" : ""}`}
              onClick={() => setActiveTab("popular")}
            >
              🔥 Phổ biến ({popularBooks.length})
            </button>
            <button
              className={`lib-tab ${activeTab === "recommendations" ? "active" : ""}`}
              onClick={() => setActiveTab("recommendations")}
            >
              ✨ Đề xuất ({recommendations.length})
            </button>
          </div>

          {/* SEARCH BAR (Only visible in search tab) */}
          {activeTab === "search" && (
            <form className="lib-search-bar" onSubmit={handleSearch}>
              <input
                className="lib-search-input"
                placeholder="Tìm kiếm sách, giáo trình, bài báo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="lib-search-btn" disabled={loading}>
                {loading ? "..." : "Tìm"}
              </button>
            </form>
          )}

          {/* GRID CONTENT */}
          {loading ? (
            <div className="lib-loading">Đang tải dữ liệu thư viện...</div>
          ) : data.length === 0 ? (
            <div className="lib-empty">
              {activeTab === "search"
                ? "Nhập từ khóa để tìm kiếm tài liệu."
                : `Chưa có tài liệu ${activeTab === "popular" ? "phổ biến" : "đề xuất"}.`}
            </div>
          ) : (
            <div className="lib-grid">
              {data.map((doc) => (
                <div key={doc.id} className="lib-doc-card" onClick={() => handleOpenDocument(doc.id)}>
                  <div className="lib-doc-icon">
                    <BookIcon />
                  </div>
                  <div className="lib-doc-info">
                    <h3 className="lib-doc-title">{doc.title}</h3>
                    {doc.author && <p className="lib-doc-author">TG: {doc.author}</p>}
                    {doc.year && <p className="lib-doc-year">Năm: {doc.year}</p>}
                  </div>
                  {doc.availability && (
                    <span className={`lib-doc-status ${doc.availability === "available" ? "available" : "unavailable"}`}>
                      {doc.availability === "available" ? "Có sẵn" : "Đang mượn"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
