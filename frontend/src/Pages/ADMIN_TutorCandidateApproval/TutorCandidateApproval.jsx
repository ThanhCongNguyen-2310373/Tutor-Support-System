// src/Pages/TutorCandidateApproval/TutorCandidateApproval.jsx
import React, { useState, useEffect } from "react";
import managementService from "../../api/management.service";
import { showSuccess, showError } from "../../utils/errorHandler";
import "./TutorCandidateApproval.css";

export default function TutorCandidateApproval() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
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
    list: [],
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await managementService.getApplications({ status: 'PENDING' });
      setCandidates(response.data || []);
    } catch (error) {
      showError("Không thể tải danh sách ứng viên");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCandidates(candidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApprove = () => {
    const selected = candidates.filter(c => selectedCandidates.includes(c.id));
    const hasLowGpa = selected.some(c => c.gpa < 2.5);

    if (hasLowGpa) {
      setNotification({
        show: true,
        type: "warning",
        message: "",
        list: selected.filter(c => c.gpa < 2.5),
      });
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmApprove = async () => {
    setShowConfirmModal(false);
    try {
      await Promise.all(
        selectedCandidates.map(id => managementService.approveApplication(id))
      );
      showSuccess(`Đã duyệt ${selectedCandidates.length} ứng viên!`);
      setSelectedCandidates([]);
      fetchApplications(); // Reload data
    } catch (error) {
      showError("Không thể duyệt ứng viên");
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!window.confirm(`Bạn có chắc muốn từ chối ${selectedCandidates.length} ứng viên?`)) {
      return;
    }
    try {
      await Promise.all(
        selectedCandidates.map(id => managementService.rejectApplication(id, 'Không đủ điều kiện'))
      );
      showSuccess(`Đã từ chối ${selectedCandidates.length} ứng viên!`);
      setSelectedCandidates([]);
      fetchApplications(); // Reload data
    } catch (error) {
      showError("Không thể từ chối ứng viên");
      console.error(error);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilters({ faculty: "", semester: "", class: "" });
    setSelectedCandidates([]);
    fetchApplications();
  };

  if (loading) {
    return (
      <div className="tutor-approval-container">
        <div className="tutor-approval-header">
          <h1>Gửi yêu cầu tạo Tutor mới</h1>
        </div>
        <div className="tutor-approval-card">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            Đang tải...
          </div>
        </div>
      </div>
    );
  }

  // Lọc theo search + filter
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mssv.includes(searchTerm) ||
      c.faculty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFaculty = !filters.faculty || c.faculty === filters.faculty;
    const matchesSemester = !filters.semester || c.semester === filters.semester;
    const matchesClass = !filters.class || c.class === filters.class;

    return matchesSearch && matchesFaculty && matchesSemester && matchesClass;
  });

  return (
    <div className="tutor-approval-container">
      <div className="tutor-approval-header">
        <h1>Gửi yêu cầu tạo Tutor mới</h1>
      </div>

      <div className="tutor-approval-card">
        {/* Toolbar với filter + search + refresh */}
        <div className="tutor-approval-toolbar">
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
              <label className="filter-label">Học kỳ</label>
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
            <button onClick={handleRefresh} className="">
              ⟳
            </button>
          </div>
        </div>
        
        {/* Bảng */}
        <div className="tutor-approval-table-container">
          <table className="tutor-approval-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                  />
                </th>
                <th>Họ tên</th>
                <th>MSSV</th>
                <th>Khoa</th>
                <th>Môn</th>
                <th>GPA</th>
                <th>Người đề xuất</th>
                <th>Trạng thái</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? "selected" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelect(candidate.id)}
                    />
                  </td>
                  <td className="name-cell">{candidate.name}</td>
                  <td>{candidate.mssv}</td>
                  <td>{candidate.faculty}</td>
                  <td>{candidate.subject}</td>
                  <td className={candidate.gpa < 2.5 ? "gpa-low" : ""}>{candidate.gpa}</td>
                  <td>{candidate.proposer}</td>
                  <td><span className="status-pending">Pending</span></td>
                  <td><button className="action-view">Views</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nút hành động */}
        <div className="tutor-approval-actions">
          <button
            className="btn-reject"
            onClick={handleReject}
            disabled={selectedCandidates.length === 0}
          >
            Từ chối
          </button>
          <button
            className="btn-approve"
            onClick={handleApprove}
            disabled={selectedCandidates.length === 0}
          >
            Duyệt Tutor
          </button>
        </div>
      </div>

      {/* Modal xác nhận */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Notification</h3>
            <p>
              Bạn có chắc muốn gửi tạo tutor cho <strong>{selectedCandidates.length}</strong> sinh viên đã chọn không?
            </p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmApprove}>
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
            {notification.type === "warning" ? (
              <div>
                {notification.list.map((c, i) => (
                  <div key={i}>• {c.mssv} có GPA &lt; 2.5</div>
                ))}
              </div>
            ) : (
              <div>
                {notification.type === "error" && "Error!"}
                {notification.type === "success" && "Successful!"}
                {notification.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}