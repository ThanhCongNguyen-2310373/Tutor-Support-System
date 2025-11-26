// src/Pages/TutorRequestPage/TutorRequestPage.jsx
import React, { useState } from "react";
import "./TutorRequestPage.css";

export default function TutorRequestPage() {
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    faculty: "",
    semester: "",
    class: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [openDropdown, setOpenDropdown] = useState(null); // Quản lý dropdown nào đang mở

  // Danh sách môn học có thể chọn
  const availableSubjects = [
    "Vật lý 1",
    "Vật lý 2", 
    "Giải tích 1",
    "Giải tích 2",
    "Đại số tuyến tính",
    "Hệ thống số",
    "DSA",
    "Mạng máy tính",
    "Cơ sở dữ liệu",
    "Lập trình hướng đối tượng",
  ];

  // Dữ liệu mẫu - danh sách yêu cầu tutor
  const [requests, setRequests] = useState([
    { id: 1, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "Vật lý 1", faculty: "Cơ khí", status: "Chưa là tutor", semester: "2025-1", class: "23CNPM" },
    { id: 2, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "Giải tích 1", faculty: "CNTT", status: "Đang xử lý", semester: "2025-1", class: "23CNPM" },
    { id: 3, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "Hệ thống số", faculty: "Cơ khí", status: "Chưa là tutor", semester: "2024-2", class: "22CLC" },
    { id: 4, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "DSA", faculty: "Điện", status: "Chưa là tutor", semester: "2025-1", class: "23CNPM" },
    { id: 5, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "Mạng máy tính", faculty: "Cơ khí", status: "Đang xử lý", semester: "2025-1", class: "23CLC" },
    { id: 6, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "Chọn môn", faculty: "CNTT", status: "Chưa là tutor", semester: "2024-2", class: "22CLC" },
    { id: 7, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "Chọn môn", faculty: "Cơ khí", status: "Chưa là tutor", semester: "2025-1", class: "23CNPM" },
    { id: 8, name: "Nguyễn Nguyễn Nguyễn Nguyễn", mssv: "2311234", year: "2025", subject: "Chọn môn", faculty: "Điện", status: "Chưa là tutor", semester: "2025-1", class: "23CLC" },
  ]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRequests(filteredRequests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSendRequest = () => {
    if (selectedRequests.length === 0) return;
    setShowConfirmModal(true);
  };

  const confirmSendRequest = () => {
    setShowConfirmModal(false);
    setNotification({
      show: true,
      type: "success",
      message: "Yêu cầu đã được gửi thành công!",
    });
    setTimeout(() => setNotification({ show: false }), 3000);
    setSelectedRequests([]);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilters({ faculty: "", semester: "", class: "" });
    setSelectedRequests([]);
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Chọn môn học
  const handleSubjectSelect = (requestId, subject) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId ? { ...r, subject } : r
      )
    );
    setOpenDropdown(null);
  };

  // Lọc theo search + filter
  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mssv.includes(searchTerm) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFaculty = !filters.faculty || r.faculty === filters.faculty;
    const matchesSemester = !filters.semester || r.semester === filters.semester;
    const matchesClass = !filters.class || r.class === filters.class;

    return matchesSearch && matchesFaculty && matchesSemester && matchesClass;
  });

  return (
    <div className="tutor-request-container">
      <div className="tutor-request-header">
        <h1>Gửi yêu cầu tạo Tutor mới</h1>
      </div>

      <div className="tutor-request-card">
        {/* Toolbar với filter + search + refresh */}
        <div className="tutor-request-toolbar">
          <div className="filter-group">
            <div className="filter-box">
              <label className="filter-label">Khoa</label>
              <select
                value={filters.faculty}
                onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
                className="filter-input"
              >
                <option value="">Tất cả</option>
                <option value="Cơ khí">Cơ khí</option>
                <option value="CNTT">CNTT</option>
                <option value="Điện">Điện</option>
              </select>
            </div>

            <div className="filter-box">
              <label className="filter-label">Học kì</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="filter-input"
              >
                <option value="">Tất cả</option>
                <option value="2025-1">2025-1</option>
                <option value="2024-2">2024-2</option>
              </select>
            </div>

            <div className="filter-box">
              <label className="filter-label">Lớp</label>
              <select
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                className="filter-input"
              >
                <option value="">Tất cả</option>
                <option value="23CNPM">23CNPM</option>
                <option value="23CLC">23CLC</option>
                <option value="22CLC">22CLC</option>
              </select>
            </div>
          </div>

          <div className="search-group">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button onClick={handleRefresh} className="refresh-btn">
              ⟳
            </button>
          </div>
        </div>
        
        {/* Bảng */}
        <div className="tutor-request-table-container">
          <table className="tutor-request-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                  />
                </th>
                <th>Họ tên</th>
                <th>MSSV</th>
                <th>Năm học</th>
                <th>Môn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className={selectedRequests.includes(request.id) ? "selected" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleSelect(request.id)}
                    />
                  </td>
                  <td className="name-cell">{request.name}</td>
                  <td>{request.mssv}</td>
                  <td>{request.year}</td>
                  <td>
                    <div className="subject-dropdown">
                      <button 
                        className="subject-btn"
                        onClick={() => toggleDropdown(request.id)}
                      >
                        {request.subject} ▼
                      </button>
                      {openDropdown === request.id && (
                        <div className="dropdown-menu">
                          {availableSubjects.map((subject) => (
                            <div
                              key={subject}
                              className="dropdown-item"
                              onClick={() => handleSubjectSelect(request.id, subject)}
                            >
                              {subject}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${request.status === "Đang xử lý" ? "status-processing" : "status-pending"}`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nút hành động */}
        <div className="tutor-request-actions">
          <button
            className="btn-send-request"
            onClick={handleSendRequest}
            disabled={selectedRequests.length === 0}
          >
            Gửi yêu cầu tạo tutor
          </button>
        </div>
      </div>

      {/* Modal xác nhận */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Notification</h3>
            <p>
              Bạn có chắc muốn gửi yêu cầu tạo tutor cho <strong>{selectedRequests.length}</strong> sinh viên đã chọn không?
            </p>
            <p className="modal-subtext">
              Yêu cầu sẽ được chuyển đến Admin để phê duyệt.
            </p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmSendRequest}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-header">Notification</div>
          <div className="toast-body">
            {notification.type === "success" && (
              <div>
                <div className="success-icon">✓</div>
                <div>Successful!</div>
                <div>{notification.message}</div>
              </div>
            )}
            {notification.type === "error" && (
              <div>
                <div className="error-icon">○</div>
                <div>Error!</div>
                <div>{notification.message}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}