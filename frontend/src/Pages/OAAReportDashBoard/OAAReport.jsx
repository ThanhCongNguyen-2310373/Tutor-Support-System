import React, { useState } from "react";
import "./OAAReport.css";

export default function OAAReport() {
  const [activeTab, setActiveTab] = useState("theo-hoc-ki");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [formData, setFormData] = useState({
    dateFrom: "",
    dateTo: "",
    semester: "2025 - 251",
    departments: [],
    courses: [],
    programType: {
      daiTra: false,
      chatLuongCao: false,
      tienTien: false,
      oisp: false,
    },
    tutorStatus: {
      hoatDong: false,
      ngungHoatDong: false,
      tatCa: false,
    },
    programStatus: {
      thamGia: false,
      ngungThamGia: false,
      daHuy: false,
    },
  });

  const checkDataValidity = () => {
    const hasDateRange = formData.dateFrom && formData.dateTo;
    const hasDepartments = formData.departments.length > 0;
    const hasProgramType = Object.values(formData.programType).some(v => v);
    const hasTutorStatus = Object.values(formData.tutorStatus).some(v => v);
    const hasProgramStatus = Object.values(formData.programStatus).some(v => v);

    return hasDateRange && hasDepartments && hasProgramType && hasTutorStatus && hasProgramStatus;
  };

  const handleApply = () => {
    if (!checkDataValidity()) {
      setShowNotification(true);
      setNotificationType("error");
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsGenerated(true);
      setShowReport(true);
    }, 2000);
  };

  const handleDelete = () => {
    setFormData({
      dateFrom: "",
      dateTo: "",
      semester: "2025 - 251",
      departments: [],
      courses: [],
      programType: {
        daiTra: false,
        chatLuongCao: false,
        tienTien: false,
        oisp: false,
      },
      tutorStatus: {
        hoatDong: false,
        ngungHoatDong: false,
        tatCa: false,
      },
      programStatus: {
        thamGia: false,
        ngungThamGia: false,
        daHuy: false,
      },
    });
    setIsGenerated(false);
    setShowReport(false);
  };

  const handleSave = () => {
    if (!checkDataValidity()) {
      setShowNotification(true);
      setNotificationType("error");
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    console.log("Lưu bộ lọc:", formData);
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

  const addCourse = (e) => {
    const value = e.target.value;
    if (value && !formData.courses.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        courses: [...prev.courses, value],
      }));
    }
  };

  const removeCourse = (course) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c !== course),
    }));
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
              <button className="oaa-btn-outline" title="Chỉnh sửa">✏️</button>
              <button className="oaa-btn-outline" title="Lưu kết quả">💾</button>
              <button className="oaa-btn-outline" title="Sao chép">📋</button>
            </div>
          </div>

          <div className="oaa-header-meta">
            <span className="oaa-meta-item">📚 Học kỳ 1 - Năm học 2024-2025</span>
            <span className="oaa-meta-item">👤 Người tạo: Nguyễn Văn A (OAA Staff)</span>
            <span className="oaa-meta-item">🕐 Ngày: 18/10/2025 14:30</span>
          </div>
        </div>

        <div className="oaa-tabs">
          <div className="oaa-tabs-header">
            <button
              className={`oaa-tab-button ${activeTab === "theo-hoc-ki" ? "active" : ""}`}
              onClick={() => setActiveTab("theo-hoc-ki")}
            >
              Theo học kì
            </button>
            <button
              className={`oaa-tab-button ${activeTab === "theo-khoa" ? "active" : ""}`}
              onClick={() => setActiveTab("theo-khoa")}
            >
              Theo khoa
            </button>
            <button
              className={`oaa-tab-button ${activeTab === "toan-truong" ? "active" : ""}`}
              onClick={() => setActiveTab("toan-truong")}
            >
              Toàn trường
            </button>
          </div>

          <div style={{ padding: "24px" }}>
            <div className="oaa-form-section">
              <h3 className="oaa-section-title">Khoảng thời gian *</h3>
              <div className="oaa-form-row">
                <div className="oaa-form-group">
                  <label className="oaa-form-label">From</label>
                  <input
                    type="date"
                    className="oaa-input"
                    value={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                  />
                </div>
                <div className="oaa-form-group">
                  <label className="oaa-form-label">To</label>
                  <input
                    type="date"
                    className="oaa-input"
                    value={formData.dateTo}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                  />
                </div>
                <div className="oaa-form-group">
                  <label className="oaa-form-label">Học kì</label>
                  <select
                    className="oaa-select"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    <option>2025 - 251</option>
                    <option>2025 - 252</option>
                    <option>2024 - 241</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="oaa-form-section">
              <div className="oaa-two-column">
                <div className="oaa-column">
                  <h3 className="oaa-section-title">Khoa *</h3>
                  <select 
                    className="oaa-select" 
                    style={{ width: "100%" }}
                    onChange={addDepartment}
                    value=""
                  >
                    <option value="">Chọn khoa để thêm</option>
                    <option value="CSE">Khoa CNTT (CSE)</option>
                    <option value="CHE">Khoa Hóa (CHE)</option>
                    <option value="MEC">Khoa Cơ Khí (MEC)</option>
                    <option value="BIO">Khoa Sinh học (BIO)</option>
                    <option value="EE">Khoa Điện (EE)</option>
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
                          {dept}
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

            <div className="oaa-form-section">
              <h3 className="oaa-section-title">Loại chương trình *</h3>
              <div className="oaa-checkbox-group">
                <label className="oaa-checkbox-label">
                  <input
                    type="checkbox"
                    className="oaa-checkbox"
                    checked={formData.programType.daiTra}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programType: { ...formData.programType, daiTra: e.target.checked },
                      })
                    }
                  />
                  <span>Đại trà</span>
                </label>
                <label className="oaa-checkbox-label">
                  <input
                    type="checkbox"
                    className="oaa-checkbox"
                    checked={formData.programType.chatLuongCao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programType: { ...formData.programType, chatLuongCao: e.target.checked },
                      })
                    }
                  />
                  <span>Chất lượng cao</span>
                </label>
                <label className="oaa-checkbox-label">
                  <input
                    type="checkbox"
                    className="oaa-checkbox"
                    checked={formData.programType.tienTien}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programType: { ...formData.programType, tienTien: e.target.checked },
                      })
                    }
                  />
                  <span>Tiên tiến</span>
                </label>
                <label className="oaa-checkbox-label">
                  <input
                    type="checkbox"
                    className="oaa-checkbox"
                    checked={formData.programType.oisp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programType: { ...formData.programType, oisp: e.target.checked },
                      })
                    }
                  />
                  <span>OISP</span>
                </label>
              </div>
            </div>

            <div className="oaa-form-section">
              <div className="oaa-two-column">
                <div className="oaa-column">
                  <h3 className="oaa-section-title">Môn học (tùy chọn)</h3>
                  <select 
                    className="oaa-select" 
                    style={{ width: "100%" }}
                    onChange={addCourse}
                    value=""
                  >
                    <option value="">Chọn môn học để thêm</option>
                    <option value="CO2001">CO2001 - Kỹ thuật phần mềm</option>
                    <option value="CO2003">CO2003 - Cấu trúc dữ liệu</option>
                    <option value="MT1005">MT1005 - Giải tích 1</option>
                    <option value="PH1007">PH1007 - Vật lý đại cương</option>
                    <option value="CH1001">CH1001 - Hóa đại cương</option>
                  </select>
                </div>
                <div className="oaa-column">
                  <h3 className="oaa-section-title">
                    Các môn đã chọn ({formData.courses.length})
                  </h3>
                  <div className="oaa-selected-tags">
                    {formData.courses.length === 0 ? (
                      <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                        Chưa chọn môn nào (có thể bỏ qua)
                      </span>
                    ) : (
                      formData.courses.map((course) => (
                        <span key={course} className="oaa-tag">
                          {course}
                          <span className="oaa-tag-close" onClick={() => removeCourse(course)}>
                            ×
                          </span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="oaa-form-section">
              <div className="oaa-two-column">
                <div className="oaa-column">
                  <h3 className="oaa-section-title">Trạng thái Tutor *</h3>
                  <div className="oaa-checkbox-group">
                    <label className="oaa-checkbox-label">
                      <input
                        type="checkbox"
                        className="oaa-checkbox"
                        checked={formData.tutorStatus.hoatDong}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tutorStatus: { ...formData.tutorStatus, hoatDong: e.target.checked },
                          })
                        }
                      />
                      <span>Hoạt động</span>
                    </label>
                    <label className="oaa-checkbox-label">
                      <input
                        type="checkbox"
                        className="oaa-checkbox"
                        checked={formData.tutorStatus.ngungHoatDong}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tutorStatus: {
                              ...formData.tutorStatus,
                              ngungHoatDong: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Ngừng hoạt động</span>
                    </label>
                    <label className="oaa-checkbox-label">
                      <input
                        type="checkbox"
                        className="oaa-checkbox"
                        checked={formData.tutorStatus.tatCa}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tutorStatus: { ...formData.tutorStatus, tatCa: e.target.checked },
                          })
                        }
                      />
                      <span>Tất cả</span>
                    </label>
                  </div>
                </div>
                <div className="oaa-column">
                  <h3 className="oaa-section-title">Trạng thái chương trình *</h3>
                  <div className="oaa-checkbox-group">
                    <label className="oaa-checkbox-label">
                      <input
                        type="checkbox"
                        className="oaa-checkbox"
                        checked={formData.programStatus.thamGia}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            programStatus: {
                              ...formData.programStatus,
                              thamGia: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Tham gia</span>
                    </label>
                    <label className="oaa-checkbox-label">
                      <input
                        type="checkbox"
                        className="oaa-checkbox"
                        checked={formData.programStatus.ngungThamGia}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            programStatus: {
                              ...formData.programStatus,
                              ngungThamGia: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Ngừng tham gia</span>
                    </label>
                    <label className="oaa-checkbox-label">
                      <input
                        type="checkbox"
                        className="oaa-checkbox"
                        checked={formData.programStatus.daHuy}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            programStatus: { ...formData.programStatus, daHuy: e.target.checked },
                          })
                        }
                      />
                      <span>Đã hủy</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {isGenerated && (
              <div className="oaa-stats-grid">
                <div className="oaa-stat-card cyan">
                  <div className="oaa-stat-label">Số sinh viên</div>
                  <div className="oaa-stat-value">320</div>
                </div>
                <div className="oaa-stat-card indigo">
                  <div className="oaa-stat-label">Số Tutor</div>
                  <div className="oaa-stat-value">45</div>
                </div>
                <div className="oaa-stat-card black">
                  <div className="oaa-stat-label">Số phiên tư vấn</div>
                  <div className="oaa-stat-value">1240</div>
                </div>
              </div>
            )}

            {!isGenerated && !isLoading && (
              <div className={`oaa-status-message ${isDataValid ? 'success' : 'error'}`}>
                <span style={{ fontSize: "24px" }}>{isDataValid ? '✅' : '❌'}</span>
                <span>{isDataValid ? 'Đủ dữ liệu xuất báo cáo' : 'Dữ liệu không đủ - Vui lòng điền đầy đủ các trường bắt buộc (*)'}</span>
              </div>
            )}

            {isGenerated && !isLoading && (
              <div className="oaa-status-message success">
                <span style={{ fontSize: "24px" }}>✅</span>
                <span>Đã tạo báo cáo thành công</span>
              </div>
            )}

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

            {isLoading && (
              <div className="oaa-loading">
                <div className="oaa-spinner"></div>
              </div>
            )}
          </div>
        </div>

        {showReport && <ReportPreview />}

        <div className="oaa-actions">
          <button className="oaa-btn-outline" onClick={handleGoBack}>
            ← Quay lại
          </button>
          <button className="oaa-btn-primary" disabled={!isGenerated}>
            💾 Lưu kết quả
          </button>
          <button className="oaa-btn-secondary" disabled={!isGenerated}>
            📥 Xuất Excel
          </button>
          <button className="oaa-btn-secondary" disabled={!isGenerated}>
            📄 Xuất báo cáo PDF
          </button>
        </div>
      </div>

      {showNotification && (
        <div className="oaa-modal-overlay">
          <div className="oaa-modal">
            <div className="oaa-modal-content">
              <div className={`oaa-modal-icon ${notificationType}`}>
                {notificationType === "error" ? "❌" : "✅"}
              </div>
              <h3 className="oaa-modal-title">Thông báo</h3>
              <p className="oaa-modal-message">
                {notificationType === "error" 
                  ? "Vui lòng điền đầy đủ thông tin bắt buộc!" 
                  : "Lưu bộ lọc thành công!"}
              </p>
              <div className="oaa-modal-actions">
                <button className="oaa-modal-btn close" onClick={() => setShowNotification(false)}>
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportPreview() {
  const departments = [
    { name: "Khoa CNTT", percent: 82, tutors: 38 },
    { name: "Khoa Cơ Khí", percent: 62, tutors: 28 },
    { name: "Khoa Điện", percent: 72, tutors: 34 },
    { name: "Khoa Hóa", percent: 52, tutors: 24 },
  ];

  const courses = [
    { name: "Toán Ứng Dụng", tutors: 24, sessions: 342, capacity: 1240, percent: 76 },
    { name: "Lập Trình", tutors: 18, sessions: 456, capacity: 1680, percent: 89 },
    { name: "Vật lý", tutors: 16, sessions: 289, capacity: 892, percent: 58 },
    { name: "Hóa đại cương", tutors: 12, sessions: 178, capacity: 543, percent: 62 },
    { name: "Cơ học Kĩ thuật", tutors: 14, sessions: 234, capacity: 721, percent: 71 },
  ];

  const chartData = [100, 200, 300, 350, 420, 480, 520, 580, 600];

  return (
    <div className="oaa-report">
      <div className="oaa-report-header">
        <h2 className="oaa-report-title">Mẫu Báo Cáo</h2>
      </div>

      <div className="oaa-report-meta">
        <p>Báo cáo học kì 1 - Năm học 2024 - 2025</p>
        <p>Thời gian: 01/09/2024-31/01/2025</p>
        <div className="oaa-report-meta-row">
          <p>Người tạo: Nguyễn Văn A (OAA Staff)</p>
          <p>Ngày tạo: 18/10/2025 14:30 AM</p>
        </div>
      </div>

      <h2 className="oaa-section-title" style={{fontSize: "24px", fontWeight: "700", textAlign: "center", marginTop: "32px"}}>Tổng quan</h2>
        <div className="oaa-stats-grid">
        <div className="oaa-stat-card cyan">
          <div className="oaa-stat-label">Số sinh viên</div>
          <div className="oaa-stat-value">320</div>
        </div>
        <div className="oaa-stat-card indigo">
          <div className="oaa-stat-label">Số Tutor</div>
          <div className="oaa-stat-value">45</div>
        </div>
        <div className="oaa-stat-card red">
          <div className="oaa-stat-label">Đánh giá</div>
          <div className="oaa-stat-value">4.8/5.0</div>
        </div>
        <div className="oaa-stat-card black">
          <div className="oaa-stat-label">Số phiên tư vấn</div>
          <div className="oaa-stat-value">1240</div>
        </div>
      </div>

      <h2 className="oaa-section-title" style={{fontSize: "24px", fontWeight: "700", textAlign: "center", marginTop: "32px"}}>Phân bổ theo khoa</h2>
      <div className="oaa-progress-section">
        {departments.map((dept, idx) => (
          <div key={idx} className="oaa-progress-item">
            <div className="oaa-progress-label">{dept.name}</div>
            <div className="oaa-progress-bar">
              <div className="oaa-progress-fill" style={{ width: `${dept.percent}%` }}>
                {dept.percent}%
              </div>
            </div>
            <div className="oaa-progress-info">({dept.tutors} tutors)</div>
          </div>
        ))}
      </div>

      <h2 className="oaa-section-title" style={{fontSize: "24px", fontWeight: "700", textAlign: "center", marginTop: "32px"}}>Tỉ lệ tham gia theo tháng</h2>

      <div className="oaa-chart">
        <div className="oaa-chart-wrapper">
          <div className="oaa-chart-container">
            {chartData.map((value, idx) => (
              <div key={idx} className="oaa-chart-bar">
                <div
                  className="oaa-chart-bar-fill"
                  style={{ height: `${(value / 600) * 100}%` }}
                >
                  {/* Điểm tròn trên đỉnh */}
                  <div className="oaa-chart-dot"></div>
                </div>
                <div className="oaa-chart-label">{idx < 4 ? `T${idx + 9}` : `T${idx - 3}`}</div>
              </div>
            ))}
          </div>

          {/* Đường line nối các điểm */}
          <svg className="oaa-chart-line-svg">
            <polyline
              fill="none"
              stroke="#007AD2"
              strokeWidth="3"
              points={chartData.map((value, idx) => {
                const x = (idx * 100) / (chartData.length - 1); // chia đều theo %
                const y = 100 - (value / 600) * 100;
                return `${x},${y}`;
              }).join(" ")}
            />
            {/* Vòng tròn tại các điểm */}
            {chartData.map((value, idx) => {
              const x = (idx * 100) / (chartData.length - 1);
              const y = 100 - (value / 600) * 100;
              return (
                <circle
                  key={idx}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="5"
                  fill="#007AD2"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        <div className="oaa-chart-title">Biểu đồ tham gia theo tháng</div>
      </div>

      <h3 className="oaa-section-title">Chi tiết theo bộ môn</h3>
      <div className="oaa-table-container">
        <table className="oaa-table">
          <thead>
            <tr>
              <th>Bộ môn</th>
              <th className="center">Tutors</th>
              <th className="center">Sessions</th>
              <th className="center">Capacity</th>
              <th>Tỉ lệ</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, idx) => (
              <tr key={idx}>
                <td>{course.name}</td>
                <td className="center">{course.tutors}</td>
                <td className="center">{course.sessions}</td>
                <td className="center">{course.capacity}</td>
                <td>
                  <div className="oaa-table-progress">
                    <div className="oaa-table-progress-bar">
                      <div
                        className="oaa-table-progress-fill"
                        style={{ width: `${course.percent}%` }}
                      ></div>
                    </div>
                    <span className="oaa-table-progress-text">{course.percent}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="oaa-section-title">Đề xuất phân bổ</h3>
      <div className="oaa-recommendations">
        <p>• Bộ môn Lập trình cần thêm 3-4 tutors (capacity đạt 89%)</p>
        <p>• Khoa Hóa thiếu hụt trung bình, cần tuyển thêm ngay</p>
        <p>• Phân bổ lai 2 tutors từ Toán Ứng Dụng sang Vật lý</p>
        <p>• Dự báo học kì tới cần tăng 15-20% số lượng tutor tổng thể</p>
      </div>

      <div className="oaa-report-actions">
        <div className="oaa-report-actions-left">
          <button className="oaa-btn-outline">↻ Xem chi tiết</button>
        </div>
        <div className="oaa-report-actions-right">
          <button className="oaa-btn-secondary">📊 Biểu đồ nâng cao</button>
          <button className="oaa-btn-danger">📄 Xuất PDF</button>
          <button className="oaa-btn-success">📥 Xuất Excel</button>
        </div>
      </div>
    </div>
  );
}