import React, { useState, useEffect } from "react";
import { academicAPI } from "../../api";
import { showSuccess, showError } from "../../utils/errorHandler";
import "./RoadmapManage.css";

const subjects = [
  { maMon: "MA1005", tenMon: "Giải tích 1" },
  { maMon: "PH1001", tenMon: "Vật lý đại cương 1" },
  { maMon: "CH1001", tenMon: "Hóa học đại cương" },
  { maMon: "CS1101", tenMon: "Lập trình cơ bản" },
  { maMon: "EN1001", tenMon: "Tiếng Anh 1" },
  { maMon: "CS1123", tenMon: "Cấu trúc dữ liệu và giải thuật" },
  { maMon: "CS1624", tenMon: "Lập trình hướng đối tượng" },
];

export default function RoadmapManage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state - ĐÃ ĐỔI ĐỂ PHÙ HỢP VỚI SCHEMA
  const [title, setTitle] = useState("");           // ← maMon + tenMon
  const [description, setDescription] = useState(""); // ← loTrinh
  const [documentUrl, setDocumentUrl] = useState(""); // ← taiLieu

  const [searchMaMon, setSearchMaMon] = useState("");
  const [searchTenMon, setSearchTenMon] = useState("");
  //const [setSelectedSubject] = useState(null);
  const [, setSelectedSubject] = useState(null);

  const [showMaMonDropdown, setShowMaMonDropdown] = useState(false);
  const [showTenMonDropdown, setShowTenMonDropdown] = useState(false);

  const filteredByMaMon = subjects.filter((s) =>
    s.maMon.toLowerCase().includes(searchMaMon.toLowerCase())
  );
  const filteredByTenMon = subjects.filter((s) =>
    s.tenMon.toLowerCase().includes(searchTenMon.toLowerCase())
  );

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await academicAPI.getRoadmaps();
      setRoadmaps(response.data || []);
    } catch (err) {
      showError("Không thể tải được danh sách lộ trình");
      console.error(err);
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSearchMaMon(subject.maMon);
    setSearchTenMon(subject.tenMon);
    setTitle(`${subject.maMon} - ${subject.tenMon}`); // Tự động điền title
    setShowMaMonDropdown(false);
    setShowTenMonDropdown(false);
  };

  const handleOpenPopup = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setTitle(item.title || "");
      setDescription(item.description || "");
      setDocumentUrl(item.documentUrl || "");

      // Tự động tách mã môn + tên môn từ title (nếu có)
      const match = item.title.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
      if (match) {
        setSearchMaMon(match[1]);
        setSearchTenMon(match[2]);
        setSelectedSubject({ maMon: match[1], tenMon: match[2] });
      }
    } else {
      setEditingId(null);
      setTitle("");
      setDescription("");
      setDocumentUrl("");
      setSearchMaMon("");
      setSearchTenMon("");
      setSelectedSubject(null);
    }
    setIsPopupOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Vui lòng chọn môn học!");
      return;
    }

    const payload = {
      title: title.trim(),                    // VD: "EN1001 - Tiếng Anh 1"
      description: description.trim(),        // Nội dung lộ trình
      documentUrl: documentUrl.trim() || null, // Tài liệu (có thể null)
    };

    try {
      if (editingId) {
        await academicAPI.updateRoadmap(editingId, payload);
        showSuccess("Cập nhật lộ trình thành công!");
      } else {
        await academicAPI.createRoadmap(payload);
        showSuccess("Tạo lộ trình thành công!");
      }
      setIsPopupOpen(false);
      fetchRoadmaps();
    } catch (err) {
      console.error(err);
      showError(editingId ? "Cập nhật thất bại" : "Tạo lộ trình thất bại");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Xóa lộ trình này vĩnh viễn?")) return;

    try {
      await academicAPI.deleteRoadmap(editingId);
      showSuccess("Đã xóa lộ trình!");
      setIsPopupOpen(false);
      fetchRoadmaps();
    } catch (err) {
      showError("Xóa thất bại");
    }
  };

  if (loading) {
    return (
      <div className="roadmap-page">
        <h1 className="page-title">Lộ trình môn học</h1>
        <div style={{ textAlign: "center", padding: "4rem" }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      <h1 className="page-title">Quản lý lộ trình môn học (TBM)</h1>

      <div className="table-container">
        <table className="roadmap-table">
          <thead>
            <tr>
              <th style={{ width: "180px" }}>Môn học</th>
              <th>Lộ trình học tập</th>
              <th style={{ width: "200px" }}>Tài liệu tham khảo</th>
            </tr>
          </thead>
          <tbody>
            {roadmaps.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
                  Chưa có lộ trình nào
                </td>
              </tr>
            ) : (
              roadmaps.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleOpenPopup(item)}
                  className="clickable"
                  style={{ cursor: "pointer" }}
                >
                  <td><strong>{item.title}</strong></td>
                  <td className="lo-trinh-cell">
                    <pre>{item.description || "—"}</pre>
                  </td>
                  <td>
                    {item.documentUrl ? (
                      <a href={item.documentUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                        Xem tài liệu
                      </a>
                    ) : (
                      <span style={{ color: "#999" }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="add-btn-container">
        <button className="add-btn" onClick={() => handleOpenPopup()}>
          Thêm lộ trình mới
        </button>
      </div>

      {/* POPUP */}
      {isPopupOpen && (
        <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Chỉnh sửa lộ trình" : "Tạo lộ trình mới"}</h3>

            <hr />

            <div className="form-row">
              <div className="input-group">
                <label>Mã môn</label>
                <input
                  type="text"
                  value={searchMaMon}
                  onChange={(e) => setSearchMaMon(e.target.value)}
                  onFocus={() => setShowMaMonDropdown(true)}
                  placeholder="Tìm mã môn..."
                />
                {showMaMonDropdown && filteredByMaMon.length > 0 && (
                  <div className="dropdown">
                    {filteredByMaMon.map((s) => (
                      <div
                        key={s.maMon}
                        className="dropdown-item"
                        onClick={() => handleSelectSubject(s)}
                      >
                        {s.maMon} - {s.tenMon}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label>Tên môn</label>
                <input
                  type="text"
                  value={searchTenMon}
                  onChange={(e) => setSearchTenMon(e.target.value)}
                  onFocus={() => setShowTenMonDropdown(true)}
                  placeholder="Tìm tên môn..."
                />
                {showTenMonDropdown && filteredByTenMon.length > 0 && (
                  <div className="dropdown">
                    {filteredByTenMon.map((s) => (
                      <div
                        key={s.maMon}
                        className="dropdown-item"
                        onClick={() => handleSelectSubject(s)}
                      >
                        {s.tenMon} ({s.maMon})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="input-group full">
              <label>Lộ trình học tập (mỗi dòng 1 chương)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chương 1: Present Perfect&#10;Chương 2: Inversion&#10;Chương 3: Conditional clauses..."
                rows="10"
              />
            </div>

            <div className="input-group full">
              <label>Link tài liệu tham khảo (tùy chọn)</label>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="popup-actions">
              {editingId && (
                <button className="btn-delete" onClick={handleDelete}>
                  Xóa lộ trình
                </button>
              )}
              <div>
                <button className="btn-cancel" onClick={() => setIsPopupOpen(false)}>
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleSave}>
                  {editingId ? "Lưu thay đổi" : "Tạo lộ trình"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
