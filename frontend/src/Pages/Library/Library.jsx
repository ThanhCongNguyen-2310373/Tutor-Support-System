import { useState, useEffect, useCallback, useMemo } from "react";
import "./Library.css";
// Ensure correct path to your assets
import bookIcon from "../../Components/Assets/book-solid-full.svg"; 
import { externalService } from "../../api.js";
import { showError } from "../../utils/errorHandler";

export default function Library() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");

  // Dynamic Topics Configuration
  const [popularTopic] = useState("Technology"); 
  
  // "Recommendations" will pick a random topic on mount
  const [recTopic, setRecTopic] = useState("Algorithms");

  // List of technical topics to randomize recommendations
  const techTopics = useMemo(() => [
    "Machine Learning", "Cybersecurity", "Cloud Computing", 
    "Software Architecture", "Data Science", "Blockchain"
  ], []);

  useEffect(() => {
    // Pick a random topic when component mounts
    const randomTopic = techTopics[Math.floor(Math.random() * techTopics.length)];
    setRecTopic(randomTopic);
  }, [techTopics]);

  // Unified fetch function
  const fetchBooks = useCallback(async (currentTab, searchQuery = "") => {
    setLoading(true);
    // Clear current books immediately to show loading state cleanly
    setBooks([]); 

    try {
      let response;

      if (currentTab === "popular") {
        response = await externalService.searchLibrary({
          subject: popularTopic, // Dynamic Topic
          page: 1,
          limit: 12
        });
      } 
      else if (currentTab === "recommendations") {
        response = await externalService.searchLibrary({
          subject: recTopic, // Dynamic Topic
          page: 1,
          limit: 12
        });
      } 
      else if (currentTab === "search") {
        if (!searchQuery.trim()) {
          setLoading(false);
          return;
        }
        response = await externalService.searchLibrary({
          query: searchQuery,
          page: 1,
          limit: 20
        });
      }

      const result = response|| [];
      setBooks(result);

    } catch (error) {
      console.error("Library fetch error:", error);
      showError("Không thể tải dữ liệu thư viện");
    } finally {
      setLoading(false);
    }
  }, [popularTopic, recTopic]);

  // Trigger fetch when Tab changes
  useEffect(() => {
    if (activeTab !== "search") {
      fetchBooks(activeTab);
    }
  }, [activeTab, fetchBooks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      showError("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }
    fetchBooks("search", query);
  };

  const handleReadBook = (book) => {
    if (book.fileUrl) {
      window.open(book.fileUrl, "_blank");
    } else {
      showError("Tài liệu này không có bản xem trước");
    }
  };

  return (
    <div className="lib">
      <div className="lib-header">
        <h1>Thư Viện Số HCMUT</h1>
        <p className="lib-subtitle">Khám phá hàng triệu tài liệu học tập và nghiên cứu</p>
      </div>

      {/* Tabs */}
      <div className="lib-tabs">
        <button
          className={`lib-tab ${activeTab === "popular" ? "active" : ""}`}
          onClick={() => setActiveTab("popular")}
        >
          Phổ biến
        </button>
        <button
          className={`lib-tab ${activeTab === "recommendations" ? "active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          Gợi ý ({recTopic})
        </button>
        <button
          className={`lib-tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Tìm kiếm
        </button>
      </div>

      {/* Search Bar */}
      {activeTab === "search" && (
        <form className="lib-search-bar" onSubmit={handleSearchSubmit}>
          <input
            className="lib-search-input"
            placeholder="Nhập tên sách, tác giả hoặc ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="lib-search-btn" disabled={loading}>
            {loading ? "..." : "Tìm"}
          </button>
        </form>
      )}

      {/* Content */}
      <div className="lib-panel">
        {loading ? (
          <div className="lib-loading">
            <div className="spinner"></div> Đang tải dữ liệu...
          </div>
        ) : books.length === 0 ? (
          <div className="lib-empty">
            {activeTab === "search"
              ? "Hãy nhập từ khóa để tìm kiếm tài liệu"
              : "Không tìm thấy tài liệu nào"}
          </div>
        ) : (
          <div className="lib-grid">
            {books.map((doc) => (
              <div key={doc.id} className="lib-item">
                <div className="lib-doc-card" onClick={() => handleReadBook(doc)}>
                  
                  {/* Badge: Available/Borrowed */}
                  <div className={`status-badge ${doc.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                     {doc.availableCopies > 0 ? 'Có sẵn' : 'Hết sách'}
                  </div>

                  <div className="lib-doc-image-wrapper">
                    {doc.coverImageUrl ? (
                      <img 
                        src={doc.coverImageUrl} 
                        alt={doc.title} 
                        className="lib-doc-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = bookIcon;
                        }}
                      />
                    ) : (
                      <img src={bookIcon} alt="icon" className="lib-doc-icon-img" />
                    )}
                  </div>

                  <div className="lib-doc-info">
                    <h3 className="lib-doc-title" title={doc.title}>{doc.title}</h3>
                    <p className="lib-doc-author">{doc.author || "Unknown Author"}</p>
                    <p className="lib-doc-year">{doc.publishYear || "N/A"}</p>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}