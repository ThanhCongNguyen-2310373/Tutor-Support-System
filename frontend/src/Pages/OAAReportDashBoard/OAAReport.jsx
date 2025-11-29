import React, { useState } from "react";
import apiClient from "../../api";
import "./OAAReport.css";

export default function OAAReport() {
  //const [activeTab, setActiveTab] = useState("theo-hoc-ki");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [formData, setFormData] = useState({
    semester: "2025-1",
    departments: [],
    tutorStatus: {
      available: false,
      unavailable: false,
      all: false,
    },
  });

  // Danh sách tất cả các khoa – dùng để “Chọn tất cả”
  const allDepartments = [
    "KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH",
    "KHOA ĐIỆN - ĐIỆN TỬ",
    "KHOA CƠ KHÍ",
    "KHOA KỸ THUẬT HÓA HỌC",
    "KHOA KỸ THUẬT XÂY DỰNG",
    "KHOA QUẢN LÝ CÔNG NGHIỆP",
    "KHOA CÔNG NGHỆ VẬT LIỆU",
    "KHOA KỸ THUẬT GIAO THÔNG",
    "KHOA MÔI TRƯỜNG VÀ TÀI NGUYÊN",
    "KHOA TOÁN ỨNG DỤNG",
    "KHOA KHOA HỌC ỨNG DỤNG",
  ];

  const checkDataValidity = () => {
    const hasDepartments = formData.departments.length > 0;
    const hasTutorStatus = Object.values(formData.tutorStatus).some(v => v);
    return hasDepartments && hasTutorStatus;
  };

  const handleApply = async () => {
    if (!checkDataValidity()) {
      setShowNotification(true);
      setNotificationType("error");
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (formData.semester) params.append('semester', formData.semester);
      if (formData.departments.length > 0) {
        params.append('departments', formData.departments.join(','));
      }
      params.append('tutorStatus', getTutorStatusFilter());

      const response = await apiClient.get(`/reports/oaa/dashboard?${params.toString()}`);
      
      console.log('API Response:', response);
      setReportData(response);
      setIsGenerated(true);
      setShowReport(true);
    } catch (error) {
      console.error("Không thể tạo báo cáo:", error);
      setNotificationType("error");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getTutorStatusFilter = () => {
    if (formData.tutorStatus.all) return 'all';
    if (formData.tutorStatus.available && formData.tutorStatus.unavailable) return 'all';
    if (formData.tutorStatus.available) return 'available';
    if (formData.tutorStatus.unavailable) return 'unavailable';
    return 'all';
  };

  const handleDelete = () => {
    setFormData({
      semester: "2025-1",
      departments: [],
      tutorStatus: {
        available: false,
        unavailable: false,
        all: false,
      },
    });
    setIsGenerated(false);
    setShowReport(false);
    setReportData(null);
  };

  const handleSave = () => {
    if (!checkDataValidity()) {
      setShowNotification(true);
      setNotificationType("error");
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    localStorage.setItem('oaa_filter', JSON.stringify(formData));
    setShowNotification(true);
    setNotificationType("success");
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const addDepartment = (e) => {
    const value = e.target.value;
    if (value && !formData.departments.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        departments: [...prev.departments, value],
      }));
    }
  };

  const removeDepartment = (dept) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d !== dept),
    }));
  };

  // THÊM MỚI: Chọn tất cả khoa
  const selectAllDepartments = () => {
    setFormData(prev => ({
      ...prev,
      departments: allDepartments
    }));
  };

  const handleExportExcel = async () => {
    if (!reportData) return;
    console.log("Exporting to Excel...");
    alert("Xuất Excel thành công!");
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
    console.log("Exporting to PDF...");
    alert("Xuất PDF thành công!");
  };

  const isDataValid = checkDataValidity();

  return (
    <div className="oaa-report-container">
      <div className="oaa-content">
        <div className="oaa-breadcrumb">
          <span>OAA Dashboard</span>
          <span>/</span>
          <span className="breadcrumb-active">Tạo báo cáo phân bổ nguồn lực</span>
        </div>

        <div className="oaa-header">
          <div className="oaa-header-top">
            <button className="oaa-btn-outline" onClick={handleGoBack}>
              ← Quay lại
            </button>
            <h1 className="oaa-title">TẠO BÁO CÁO PHÂN BỔ NGUỒN LỰC</h1>
            <div className="oaa-header-actions">
              <button className="oaa-btn-outline" title="Lưu kết quả" onClick={handleSave}>💾</button>
            </div>
          </div>

          <div className="oaa-header-meta">
            <span className="oaa-meta-item">Học kỳ 1 - Năm học 2024-2025</span>
            <span className="oaa-meta-item">Người tạo: OAA Staff</span>
            <span className="oaa-meta-item">Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        <div className="oaa-tabs">
          <div style={{ padding: "24px" }}>
            {/* Học kỳ */}
            <div className="oaa-form-section">
              <div className="oaa-form-row">
                <div className="oaa-form-group">
                </div>
              </div>
            </div>

            {/* === CHỈ THÊM PHẦN NÀY – CÒN LẠI GIỮ NGUYÊN === */}
            <div className="oaa-form-section">
              <h3 className="oaa-section-title">Khoa *</h3>

              {/* NÚT CHỌN TẤT CẢ (mới thêm) */}
              <div style={{ marginBottom: "12px" }}>
                <button
                  type="button"
                  className="oaa-btn-primary"
                  style={{ fontSize: "14px", padding: "8px 20px" }}
                  onClick={selectAllDepartments}
                >
                  Chọn tất cả khoa
                </button>
              </div>

              <div className="oaa-two-column">
                <div className="oaa-column">
                  <select 
                    className="oaa-select" 
                    style={{ width: "100%" }}
                    onChange={addDepartment}
                    value=""
                  >
                    <option value="">Chọn khoa để thêm</option>
                    <option value="KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH">Khoa KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH</option>
                    <option value="KHOA ĐIỆN - ĐIỆN TỬ">Khoa ĐIỆN - ĐIỆN TỬ</option>
                    <option value="KHOA CƠ KHÍ">Khoa CƠ KHÍ</option>
                    <option value="KHOA KỸ THUẬT HÓA HỌC">Khoa KỸ THUẬT HÓA HỌC</option>
                    <option value="KHOA KỸ THUẬT XÂY DỰNG">Khoa KỸ THUẬT XÂY DỰNG</option>
                    <option value="KHOA QUẢN LÝ CÔNG NGHIỆP">Khoa QUẢN LÝ CÔNG NGHIỆP</option>
                    <option value="KHOA CÔNG NGHỆ VẬT LIỆU">Khoa CÔNG NGH VẬT LIỆU</option>
                    <option value="KHOA KỸ THUẬT GIAO THÔNG">Khoa KỸ THUẬT GIAO THÔNG</option>
                    <option value="KHOA MÔI TRƯỜNG VÀ TÀI NGUYÊN">Khoa MÔI TRƯỜNG VÀ TÀI NGUYÊN</option>
                    <option value="KHOA TOÁN ỨNG DỤNG">Khoa TOÁN ỨNG DỤNG</option>
                    <option value="KHOA KHOA HỌC ỨNG DỤNG">Khoa KHOA HỌC ỨNG DỤNG</option>
                  </select>
                </div>
                <div className="oaa-column">
                  <h3 className="oaa-section-title">
                    Các khoa đã chọn ({formData.departments.length})
                  </h3>
                  <div className="oaa-selected-tags">
                    {formData.departments.length === 0 ? (
                      <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                        Chưa chọn khoa nào
                      </span>
                    ) : (
                      formData.departments.map((dept) => (
                        <span key={dept} className="oaa-tag">
                          {dept.replace('KHOA ', '')}
                          <span className="oaa-tag-close" onClick={() => removeDepartment(dept)}>
                            ×
                          </span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* === KẾT THÚC PHẦN CHỈNH SỬA – CÒN LẠI GIỮ NGUYÊN */}

            {/* Trạng thái Tutor */}
            <div className="oaa-form-section">
              <h3 className="oaa-section-title">Trạng thái Tutor *</h3>
              <div className="oaa-checkbox-group">
                <label className="oaa-checkbox-label">
                  <input
                    type="checkbox"
                    className="oaa-checkbox"
                    checked={formData.tutorStatus.available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tutorStatus: { ...formData.tutorStatus, available: e.target.checked },
                      })
                    }
                  />
                  <span>Đang hoạt động (Available)</span>
                </label>
                <label className="oaa-checkbox-label">
                  <input
                    type="checkbox"
                    className="oaa-checkbox"
                    checked={formData.tutorStatus.unavailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tutorStatus: {
                          ...formData.tutorStatus,
                          unavailable: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Không hoạt động (Unavailable)</span>
                </label>
                <label className="oaa-checkbox-label">
                  <input
                    type="checkbox"
                    className="oaa-checkbox"
                    checked={formData.tutorStatus.all}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tutorStatus: { ...formData.tutorStatus, all: e.target.checked },
                      })
                    }
                  />
                  <span>Tất cả</span>
                </label>
              </div>
            </div>

            {/* Thống kê tổng quan */}
            {isGenerated && reportData && (
              <div className="oaa-stats-grid">
                <div className="oaa-stat-card cyan">
                  <div className="oaa-stat-label">Số sinh viên</div>
                  <div className="oaa-stat-value">{reportData.totalStudents || 0}</div>
                </div>
                <div className="oaa-stat-card indigo">
                  <div className="oaa-stat-label">Số Tutor</div>
                  <div className="oaa-stat-value">{reportData.totalTutors || 0}</div>
                </div>
                <div className="oaa-stat-card black">
                  <div className="oaa-stat-label">Số buổi học</div>
                  <div className="oaa-stat-value">{reportData.totalMeetings || 0}</div>
                </div>
                <div className="oaa-stat-card red">
                  <div className="oaa-stat-label">Đánh giá TB</div>
                  <div className="oaa-stat-value">{reportData.averageRating || 0}/5.0</div>
                </div>
              </div>
            )}

            {/* Thông báo trạng thái */}
            {!isGenerated && !isLoading && (
              <div className={`oaa-status-message ${isDataValid ? 'success' : 'error'}`}>
                <span style={{ fontSize: "24px" }}>{isDataValid ? '✅' : '❌'}</span>
                <span>{isDataValid ? 'Đủ dữ liệu để tạo báo cáo' : 'Vui lòng điền đầy đủ các trường bắt buộc (*)'}</span>
              </div>
            )}

            {isGenerated && !isLoading && (
              <div className="oaa-status-message success">
                <span style={{ fontSize: "24px" }}>✅</span>
                <span>Đã tạo báo cáo thành công</span>
              </div>
            )}

            {/* Các nút action */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button className="oaa-btn-danger" onClick={handleDelete}>
                Xóa bộ lọc
              </button>
              <button 
                className="oaa-btn-secondary" 
                onClick={handleSave}
                disabled={!isDataValid}
              >
                Lưu bộ lọc
              </button>
              <button 
                className="oaa-btn-primary" 
                onClick={handleApply} 
                disabled={isLoading || !isDataValid}
              >
                {isLoading ? "Đang tạo..." : "Áp dụng"}
              </button>
            </div>

            {/* Loading spinner */}
            {isLoading && (
              <div className="oaa-loading">
                <div className="oaa-spinner"></div>
              </div>
            )}
          </div>
        </div>

        {/* Report Preview */}
        {showReport && reportData && <ReportPreview data={reportData} />}

        {/* Bottom actions */}
        <div className="oaa-actions">
          <button className="oaa-btn-outline" onClick={handleGoBack}>
            ← Quay lại
          </button>
          <button className="oaa-btn-primary" disabled={!isGenerated} onClick={handleSave}>
            💾 Lưu kết quả
          </button>
          <button className="oaa-btn-secondary" disabled={!isGenerated} onClick={handleExportExcel}>
            Xuất Excel
          </button>
          <button className="oaa-btn-secondary" disabled={!isGenerated} onClick={handleExportPDF}>
            Xuất báo cáo PDF
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <div className="oaa-modal-overlay">
          <div className="oaa-modal">
            <div className="oaa-modal-content">
              <div className={`oaa-modal-icon ${notificationType}`}>
                {notificationType === "error" ? "Cross" : "Check"}
              </div>
              <h3 className="oaa-modal-title">Thông báo</h3>
              <p className="oaa-modal-message">
                {notificationType === "error" 
                  ? "Vui lòng điền đầy đủ thông tin bắt buộc!" 
                  : "Lưu bộ lọc thành công!"}
              </p>
              <div className="oaa-modal-actions">
                <button className="oaa-modal-btn close" onClick={() => setShowNotification(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportPreview({ data }) {
  const departments = data?.departmentStats || [];
  const expertiseData = data?.expertiseStats || [];

  return (
    <div className="oaa-report">
      <div className="oaa-report-header">
        <h2 className="oaa-report-title">Báo Cáo Phân Bổ Nguồn Lực</h2>
      </div>

      <div className="oaa-report-meta">
        <p>Báo cáo học kì 1 - Năm học 2024 - 2025</p>
        <div className="oaa-report-meta-row">
          <p>Người tạo: OAA Staff</p>
          <p>Ngày tạo: {new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>

      <h2 className="oaa-section-title" style={{fontSize: "24px", fontWeight: "700", textAlign: "center", marginTop: "32px"}}>
        Tổng quan
      </h2>
      <div className="oaa-stats-grid">
        <div className="oaa-stat-card cyan">
          <div className="oaa-stat-label">Số sinh viên</div>
          <div className="oaa-stat-value">{data?.totalStudents || 0}</div>
        </div>
        <div className="oaa-stat-card indigo">
          <div className="oaa-stat-label">Số Tutor</div>
          <div className="oaa-stat-value">{data?.totalTutors || 0}</div>
        </div>
        <div className="oaa-stat-card red">
          <div className="oaa-stat-label">Đánh giá TB</div>
          <div className="oaa-stat-value">{data?.averageRating || 0}/5.0</div>
        </div>
        <div className="oaa-stat-card black">
          <div className="oaa-stat-label">Số buổi học</div>
          <div className="oaa-stat-value">{data?.totalMeetings || 0}</div>
        </div>
      </div>

      <h2 className="oaa-section-title" style={{fontSize: "24px", fontWeight: "700", textAlign: "center", marginTop: "32px"}}>
        Phân bổ theo khoa
      </h2>
      <div className="oaa-progress-section">
        {departments.map((dept, idx) => (
          <div key={idx} className="oaa-progress-item">
            <div className="oaa-progress-label">{dept.name}</div>
            <div className="oaa-progress-bar">
              <div className="oaa-progress-fill" style={{ width: `${dept.percent}%` }}>
                {dept.percent}%
              </div>
            </div>
            <div className="oaa-progress-info">({dept.tutorCount} tutors)</div>
          </div>
        ))}
      </div>

      <h3 className="oaa-section-title">Chi tiết theo chuyên môn</h3>
      <div className="oaa-table-container">
        <table className="oaa-table">
          <thead>
            <tr>
              <th>Chuyên môn</th>
              <th className="center">Tutors</th>
              <th className="center">Buổi học</th>
              <th className="center">Sinh viên</th>
              <th>Tỉ lệ</th>
            </tr>
          </thead>
          <tbody>
            {expertiseData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.expertise}</td>
                <td className="center">{item.tutorCount}</td>
                <td className="center">{item.meetingCount}</td>
                <td className="center">{item.studentCount}</td>
                <td>
                  <div className="oaa-table-progress">
                    <div className="oaa-table-progress-bar">
                      <div
                        className="oaa-table-progress-fill"
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                    <span className="oaa-table-progress-text">{item.percent}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="oaa-section-title">Đề xuất phân bổ</h3>
      <div className="oaa-recommendations">
        {data?.recommendations?.map((rec, idx) => (
          <p key={idx}>• {rec}</p>
        )) || (
          <>
            <p>• Chưa có đề xuất từ hệ thống</p>
            <p>• Vui lòng cập nhật thêm dữ liệu để có phân tích chi tiết</p>
          </>
        )}
      </div>
    </div>
  );
}
