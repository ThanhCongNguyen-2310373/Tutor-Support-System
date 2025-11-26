// src/Pages/PairingApproval/PairingApproval.jsx
import React, { useState } from 'react';
import './PairingApproval.css';
import { pairingData, availableTutors, availableStudents, pairingStats } from '../../data/pairingData';
import {
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle,
  FiUsers, 
  FiCalendar,
  // Tôi bổ sung thêm các icon này từ bộ 'fi' để đủ chức năng:
  FiSearch,    // Tìm kiếm
  FiFilter,    // Bộ lọc
  FiEdit,      // Chỉnh sửa
  FiPlus,      // Dấu cộng (Tạo mới)
  FiArrowLeft, // Mũi tên quay lại
  FiX          // Dấu đóng (Close)
} from 'react-icons/fi';
// --- 1. COMPONENT DANH SÁCH (Đã tách ra ngoài) ---
const PairingListScreen = ({ 
  pairingStats, 
  searchQuery, 
  setSearchQuery, 
  pairingData, 
  setSelectedPair, 
  setActiveScreen 
}) => (
  <div className="pairing-list-screen">
    <div className="page-header">
      <div>
        <h1>Quản lý ghép cặp Tutor-Student</h1>
        <p className="subtitle">Chỉnh sửa thủ công các cặp Tutor-Student</p>
      </div>
      <button className="btn btn-primary">
        <span className="icon"><FiPlus /></span>
        Tạo cặp mới
      </button>
    </div>

{/* Stats - Đã thêm class màu nền */}
<div className="stats-grid">
  {/* Thẻ màu Xanh dương */}
  <div className="stat-card card-blue">
<div className="stat-icon primary"><FiUsers /></div>
    <div className="stat-content">
      <p className="stat-label">Tổng cặp</p>
      <p className="stat-value">{pairingStats.total}</p>
    </div>
  </div>

  {/* Thẻ màu Xanh lá */}
  <div className="stat-card card-green">
    <div className="stat-icon success"><FiCheckCircle /></div>
    <div className="stat-content">
      <p className="stat-label">Đang hoạt động</p>
      <p className="stat-value">{pairingStats.active}</p>
    </div>
  </div>

  {/* Thẻ màu Vàng */}
  <div className="stat-card card-yellow">
<div className="stat-icon warning"><FiClock /></div>
    <div className="stat-content">
      <p className="stat-label">Chờ xác nhận</p>
      <p className="stat-value">{pairingStats.pending}</p>
    </div>
  </div>

  {/* Thẻ màu Đỏ */}
  <div className="stat-card card-red">
<div className="stat-icon danger"><FiAlertTriangle /></div>
    <div className="stat-content">
      <p className="stat-label">Cần xem xét</p>
      <p className="stat-value">{pairingStats.needsReview}</p>
    </div>
  </div>
</div>

    {/* Search and Filter */}
    <div className="search-filter-bar">
      <div className="search-box">
        <span className="search-icon"><FiSearch /></span>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên Tutor, Student, hoặc ID cặp..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button className="btn btn-outline">
        <span className="icon"><FiFilter /></span>
        Bộ lọc
      </button>
    </div>

    {/* Pairing List Table */}
    <div className="table-card">
      <div className="table-container">
        <table className="pairing-table">
          <thead>
            <tr>
              <th>ID Cặp</th>
              <th>Tutor</th>
              <th>Student</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pairingData.map((pair) => (
              <tr key={pair.id}>
                <td>
                  <span className="pair-id">{pair.id}</span>
                </td>
                <td>
                  <div className="person-info">
                    <p className="person-name">{pair.tutor.name}</p>
                    <p className="person-details">
                      ID: {pair.tutor.id} • Slots: {pair.tutor.slots}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="person-info">
                    <p className="person-name">{pair.student.name}</p>
                    <p className="person-details">
                      ID: {pair.student.id} • {pair.student.class}
                    </p>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${pair.status}`}>
                    {pair.status === 'active' ? 'Đang hoạt động' : 'Chờ xác nhận'}
                  </span>
                </td>
                <td className="date-col">{pair.createdDate}</td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setSelectedPair(pair);
                      setActiveScreen('edit');
                    }}
                  >
                    <span className="icon" style={{marginRight: '4px'}}><FiEdit /></span>
                    Chỉnh sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- 2. COMPONENT CHỈNH SỬA (Đã tách ra ngoài) ---
const EditPairingScreen = ({ 
  selectedPair, 
  setActiveScreen, 
  availableTutors, 
  setShowModal, 
  availableStudents 
}) => (
  <div className="edit-pairing-screen">
    <div className="page-header">
      <button
        className="btn btn-ghost"
        onClick={() => setActiveScreen('list')}
      >
        <span className="icon"><FiArrowLeft /></span> Quay lại
      </button>
      <div>
        <h1>Chỉnh sửa cặp {selectedPair?.id}</h1>
        <p className="subtitle">Manual Override - Thay đổi Tutor hoặc Student</p>
      </div>
    </div>

    {/* Current Pairing Info */}
    <div className="current-pairing-card">
      <div className="card-header">
<h3><span className="icon" style={{marginRight:'8px'}}><FiUsers/></span> Thông tin cặp hiện tại</h3>
      </div>
      <div className="current-pairing-grid">
        <div className="info-card">
          <p className="info-label">TUTOR</p>
          <p className="info-name">{selectedPair?.tutor.name}</p>
          <div className="info-details">
            <p>ID: {selectedPair?.tutor.id}</p>
            <p>Slots: {selectedPair?.tutor.slots}</p>
            <p>Lịch: {selectedPair?.tutor.schedule}</p>
          </div>
        </div>
        <div className="info-card">
          <p className="info-label">STUDENT</p>
          <p className="info-name">{selectedPair?.student.name}</p>
          <div className="info-details">
            <p>ID: {selectedPair?.student.id}</p>
            <p>Lớp: {selectedPair?.student.class}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Replace Tutor */}
    <div className="selection-card">
      <div className="card-header">
<h3><span className="icon" style={{marginRight:'8px'}}><FiUsers/></span> Thay đổi Tutor</h3>
        <button className="btn btn-link">Tìm Tutor</button>
      </div>
      <div className="selection-list">
        {availableTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="selection-item"
            onClick={() => {
              if (tutor.slots === '5/5') {
                setShowModal('tutor-full');
              } else {
                setShowModal('confirm-change');
              }
            }}
          >
            <div className="selection-info">
              <p className="selection-name">{tutor.name}</p>
              <div className="selection-details">
                <span>ID: {tutor.id}</span>
                <span>Slots: {tutor.slots}</span>
                <span>⭐ {tutor.rating}</span>
              </div>
              <p className="selection-schedule"><span className="icon"><FiCalendar/></span> {tutor.schedule}</p>
            </div>
            {tutor.slots === '5/5' && (
              <span className="badge badge-danger">Đầy slot</span>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Replace Student */}
    <div className="selection-card">
      <div className="card-header">
<h3><span className="icon" style={{marginRight:'8px'}}><FiUsers/></span> Thay đổi Student</h3>
        <button className="btn btn-link">Tìm Student</button>
      </div>
      <div className="selection-list">
        {availableStudents.map((student) => (
          <div
            key={student.id}
            className="selection-item"
            onClick={() => setShowModal('student-conflict')}
          >
            <div className="selection-info">
              <p className="selection-name">{student.name}</p>
              <div className="selection-details">
                <span>ID: {student.id}</span>
                <span>Lớp: {student.class}</span>
              </div>
<p className="selection-schedule"><span className="icon"><FiCalendar/></span> {student.schedule}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Validation Results */}
    <div className="validation-card">
      <div className="card-header">
        <h3>Kết quả kiểm tra tự động</h3>
      </div>
      <div className="validation-list">
        <div className="validation-item success">
          <span className="validation-icon">✓</span>
          <span>Tutor có slot trống</span>
        </div>
        <div className="validation-item success">
          <span className="validation-icon">✓</span>
          <span>Không có xung đột lịch học</span>
        </div>
        <div className="validation-item success">
          <span className="validation-icon">✓</span>
          <span>Số lượng Student hợp lệ</span>
        </div>
      </div>
    </div>
  </div>
);

// --- 3. COMPONENT MODAL (Đã tách ra ngoài) ---
const ValidationModal = ({ 
  showModal, 
  setShowModal, 
  selectedPair, 
  setActiveScreen 
}) => {
  if (!showModal) return null;

  if (showModal === 'tutor-full') {
    return (
      <div className="modal-overlay" onClick={() => setShowModal(null)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-icon danger"><FiX /></div>
            <h3>Tutor đã đầy slot</h3>
          </div>
          <p className="modal-description">
            Tutor này đã đạt số lượng Student tối đa (5/5). Vui lòng chọn Tutor khác có slot trống.
          </p>
          <div className="modal-footer">
            <button onClick={() => setShowModal(null)} className="btn btn-primary flex-1">
              Chọn Tutor khác
            </button>
            <button onClick={() => setShowModal(null)} className="btn btn-outline">
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showModal === 'student-conflict') {
    return (
      <div className="modal-overlay" onClick={() => setShowModal(null)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-icon warning"><FiAlertTriangle /></div>
            <h3>Student đã được ghép cặp</h3>
          </div>
          <div className="modal-description">
            <p>Student này đã được ghép cặp với Tutor khác (Cặp ID: P005).</p>
            <p>Bạn có muốn hủy cặp cũ và tạo cặp mới không?</p>
          </div>
          <div className="modal-footer">
            <button
              onClick={() => setShowModal('confirm-change')}
              className="btn btn-warning flex-1"
            >
              Hủy cặp cũ và ghép mới
            </button>
            <button onClick={() => setShowModal(null)} className="btn btn-outline flex-1">
              Chọn Student khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showModal === 'confirm-change') {
    return (
      <div className="modal-overlay" onClick={() => setShowModal(null)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-icon primary"><FiCheckCircle /></div>
            <h3>Xác nhận thay đổi</h3>
          </div>
          <div className="change-info-card">
            <p className="change-info-title">Thông tin thay đổi:</p>
            <p>• Cặp ID: {selectedPair?.id}</p>
            <p>• Tutor cũ: {selectedPair?.tutor.name}</p>
            <p>• Tutor mới: Ngô Văn I</p>
          </div>
          <div className="modal-notes">
            <p><span className="icon"><FiCheckCircle/></span> Hệ thống sẽ gửi thông báo đến Tutor và Student liên quan</p>
            <p><span className="icon"><FiCheckCircle/></span> Hành động sẽ được ghi log với timestamp</p>
          </div>
          <div className="modal-footer">
            <button
              onClick={() => setShowModal('success')}
              className="btn btn-success flex-1"
            >
              Xác nhận thay đổi
            </button>
            <button onClick={() => setShowModal(null)} className="btn btn-outline">
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showModal === 'success') {
    return (
      <div className="modal-overlay" onClick={() => setShowModal(null)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-icon success"><FiCheckCircle /></div>
            <h3>Thành công!</h3>
          </div>
          <p className="modal-description">
            Cặp Tutor-Student đã được cập nhật thành công.
          </p>
          <div className="success-info-card">
            <p><FiCheckCircle/> Đã lưu vào database</p>
            <p><FiCheckCircle/> Đã cập nhật DATACORE</p>
            <p><FiCheckCircle/> Đã ghi log hành động</p>
            <p><FiCheckCircle/> Đã gửi thông báo đến Tutor và Student</p>
            <p className="process-time">Thời gian xử lý: 2.3 giây</p>
          </div>
          <div className="modal-footer">
            <button
              onClick={() => {
                setShowModal(null);
                setActiveScreen('list');
              }}
              className="btn btn-success full-width"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- 4. COMPONENT CHÍNH (Đã được làm gọn) ---
const PairingApproval = () => {
  const [activeScreen, setActiveScreen] = useState('list');
  const [selectedPair, setSelectedPair] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="pairing-approval-container">
      <div className="pairing-content">
        {/* Breadcrumb
        <div className="breadcrumb-card">
          <span>Coordinator Dashboard</span>
          <span>/</span>
          <span className="breadcrumb-active">
            {activeScreen === 'list' ? 'Danh sách ghép cặp' : 'Chỉnh sửa cặp'}
          </span>
        </div> */}

        {/* Main Content: Truyền các props cần thiết vào */}
        {activeScreen === 'list' && (
          <PairingListScreen 
            pairingStats={pairingStats}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            pairingData={pairingData}
            setSelectedPair={setSelectedPair}
            setActiveScreen={setActiveScreen}
          />
        )}

        {activeScreen === 'edit' && (
          <EditPairingScreen 
            selectedPair={selectedPair}
            setActiveScreen={setActiveScreen}
            availableTutors={availableTutors}
            availableStudents={availableStudents}
            setShowModal={setShowModal}
          />
        )}

        {/* Modals */}
        <ValidationModal 
          showModal={showModal}
          setShowModal={setShowModal}
          selectedPair={selectedPair}
          setActiveScreen={setActiveScreen}
        />
      </div>
    </div>
  );
};

export default PairingApproval;