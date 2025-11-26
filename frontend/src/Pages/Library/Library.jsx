import React, { useState, useEffect } from "react";
import "./Library.css";
import bookIcon from "../../Components/Assets/book-solid-full.svg";
import externalService from "../../api.js";
import { showError } from "../../utils/errorHandler";

export default function Library() {
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
    if (!query.trim()) {
      showError("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    try {
      setLoading(true);
      setActiveTab("search");
      const response = await externalService.searchLibrary(query);
      setSearchResults(response.data || []);
    } catch (error) {
      showError("Không thể tìm kiếm tài liệu");
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
        showError("Không thể mở tài liệu");
      }
    } catch (error) {
      showError("Không thể lấy link tài liệu");
      console.error(error);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "popular":
        return popularBooks;
      case "recommendations":
        return recommendations;
      default:
        return searchResults;
    }
  };

  const data = getCurrentData();

  return (
    <div className="lib">
      <div className="lib-header">
        <h1>Thư Viện HCMUT</h1>
      </div>

      {/* Tab Navigation */}
      <div className="lib-tabs">
        <button
          className={`lib-tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Tìm kiếm
        </button>
        <button
          className={`lib-tab ${activeTab === "popular" ? "active" : ""}`}
          onClick={() => setActiveTab("popular")}
        >
          Phổ biến ({popularBooks.length})
        </button>
        <button
          className={`lib-tab ${activeTab === "recommendations" ? "active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          Đề xuất ({recommendations.length})
        </button>
      </div>

      {/* Search Bar */}
      {activeTab === "search" && (
        <form className="lib-search-bar" onSubmit={handleSearch}>
          <input
            className="lib-search-input"
            placeholder="Tìm kiếm tài liệu, sách, bài báo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="lib-search-btn" disabled={loading}>
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>
      )}

      {/* Content */}
      <div className="lib-panel">
        {loading ? (
          <div className="lib-loading">Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="lib-empty">
            {activeTab === "search"
              ? "Nhập từ khóa và nhấn Tìm kiếm để xem kết quả"
              : `Chưa có tài liệu ${
                  activeTab === "popular" ? "phổ biến" : "đề xuất"
                }`}
          </div>
        ) : (
          <div className="lib-grid">
            {data.map((doc) => (
              <div key={doc.id} className="lib-item">
                <div className="lib-doc-card" onClick={() => handleOpenDocument(doc.id)}>
                  <div className="lib-doc-icon">
                    <img src={bookIcon} alt="book" />
                  </div>
                  <h3 className="lib-doc-title">{doc.title}</h3>
                  {doc.author && <p className="lib-doc-author">{doc.author}</p>}
                  {doc.year && <p className="lib-doc-year">{doc.year}</p>}
                  {doc.availability && (
                    <span
                      className={`lib-doc-status ${
                        doc.availability === "available"
                          ? "available"
                          : "unavailable"
                      }`}
                    >
                      {doc.availability === "available"
                        ? "Có sẵn"
                        : "Đang mượn"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
