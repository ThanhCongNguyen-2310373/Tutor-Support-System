// src/Pages/TutorRequestPage/TutorRequestPage.jsx
import React, { useState, useEffect } from 'react';
import { managementService } from '../../api'; // Đảm bảo import đúng
import { showSuccess, showError } from '../../utils/errorHandler';
import './TutorRequestPage.css';

export default function TutorRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [searchTerm] = useState('');
  // const [filters, setFilters] = useState({
  //   faculty: '',
  //   semester: '',
  //   class: '',
  // });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Danh sách môn học (có thể lấy từ backend sau)
  const availableSubjects = [
    'Vật lý 1',
    'Vật lý 2',
    'Giải tích 1',
    'Giải tích 2',
    'Đại số tuyến tính',
    'DSA',
    'Mạng máy tính',
    'Cơ sở dữ liệu',
    'Lập trình hướng đối tượng',
    'Hệ điều hành',
  ];

  useEffect(() => {
    fetchPotentialTutors();
  }, []);

  const fetchPotentialTutors = async () => {
    try {
      setLoading(true);
      const data = await managementService.getPotentialTutors();
      // Backend trả về mảng sinh viên tiềm năng
      setRequests(
        data.map((s) => ({
          id: s.id,
          studentId: s.id,
          name: s.fullName,
          mssv: s.mssv,
          faculty: s.department,
          class: s.studentClass,
          gpa: s.gpa,
          subject: 'Chọn môn', // mặc định
        })),
      );
    } catch (error) {
      showError('Không thể tải danh sách ứng viên tiềm năng');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (id, subject) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, subject } : r)),
    );
    setOpenDropdown(null);
  };

  const handleSendRequest = async () => {
    const validRequests = requests
      .filter((r) => selectedRequests.includes(r.id))
      .filter((r) => r.subject !== 'Chọn môn');

    if (validRequests.length === 0) {
      showError('Vui lòng chọn ít nhất 1 sinh viên và chọn môn học!');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSendRequest = async () => {
    setShowConfirmModal(false);

    const toSend = requests.filter(r => 
      selectedRequests.includes(r.id) && r.subject !== 'Chọn môn'
    );

    if (toSend.length === 0) {
      showError('Vui lòng chọn môn học cho sinh viên!');
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const proposedById = currentUser.id || currentUser.userId;

      await Promise.all(
        toSend.map(r =>
          managementService.proposeTutorApplication({
            studentId: r.studentId,
            expertise: [r.subject],
            bio: `Đề xuất từ Trưởng bộ môn / Coordinator. Sinh viên xuất sắc môn "${r.subject}". GPA: ${r.gpa.toFixed(2)}`,
            gpa: r.gpa,
            proposedById: proposedById,
          })
        )
      );

      showSuccess(`ĐÃ GỬI THÀNH CÔNG ${toSend.length} YÊU CẦU TẠO TUTOR!`);
      setRequests(prev => prev.filter(r => !toSend.some(sent => sent.id === r.id)));
      setSelectedRequests([]);
      // fetchPotentialTutors(); // reload danh sách
    } catch (error) {
      console.error("Lỗi gửi đề xuất:", error);
      showError(error.message || 'Gửi thất bại! Có thể sinh viên đã có đơn rồi.');
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mssv.includes(searchTerm) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="tutor-request-container">
        Đang tải danh sách ứng viên...
      </div>
    );

  return (
    <div className="tutor-request-container">
      <div className="tutor-request-header">
        <h1>Gửi yêu cầu tạo Tutor mới</h1>
        <p>Chọn sinh viên xuất sắc và đề xuất môn học để Admin xét duyệt</p>
      </div>

      <div className="tutor-request-card">
        {/* Toolbar giống cũ */}
        <div className="tutor-request-toolbar">
          {/* Giữ nguyên filter + search */}
          {/* ... (giữ nguyên phần filter bạn đã có) */}
        </div>

        <div className="tutor-request-table-container">
          <table className="tutor-request-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedRequests(requests.map((r) => r.id))
                        : setSelectedRequests([])
                    }
                  />
                </th>
                <th>Họ tên</th>
                <th>MSSV</th>
                <th>Khoa</th>
                <th>Lớp</th>
                <th>GPA</th>
                <th>Môn đề xuất</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr
                  key={r.id}
                  className={selectedRequests.includes(r.id) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(r.id)}
                      onChange={() =>
                        setSelectedRequests((prev) =>
                          prev.includes(r.id)
                            ? prev.filter((x) => x !== r.id)
                            : [...prev, r.id],
                        )
                      }
                    />
                  </td>
                  <td>{r.name}</td>
                  <td>{r.mssv}</td>
                  <td>{r.faculty}</td>
                  <td>{r.class}</td>
                  <td>
                    <strong
                      style={{ color: r.gpa >= 3.2 ? 'green' : 'orange' }}
                    >
                      {r.gpa}
                    </strong>
                  </td>
                  <td>
                    <div className="subject-dropdown">
                      <button
                        className="subject-btn"
                        onClick={() =>
                          setOpenDropdown(openDropdown === r.id ? null : r.id)
                        }
                      >
                        {r.subject} ▼
                      </button>
                      {openDropdown === r.id && (
                        <div className="dropdown-menu">
                          {availableSubjects.map((s) => (
                            <div
                              key={s}
                              className="dropdown-item"
                              onClick={() => handleSubjectSelect(r.id, s)}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tutor-request-actions">
          <button
            className="btn-send-request"
            onClick={handleSendRequest}
            disabled={selectedRequests.length === 0}
          >
            Gửi yêu cầu tạo tutor ({selectedRequests.length})
          </button>
        </div>
      </div>

      {/* Modal & Toast giữ nguyên như cũ */}
      {showConfirmModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận gửi yêu cầu</h3>
            <p>
              Bạn có chắc muốn gửi yêu cầu tạo Tutor cho{' '}
              <strong>{selectedRequests.length}</strong> sinh viên?
            </p>
            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Hủy
              </button>
              <button className="btn-confirm" onClick={confirmSendRequest}>
                Gửi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
