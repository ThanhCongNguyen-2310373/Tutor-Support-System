import React, { useState } from "react";
import "./DRLAssessment.css";
import {
  studentData,
  overviewStats,
  faculties,
  majors,
  classes,
  gpaRanges,
  scoringRules,
  studentDetail
} from "../../data/mockData";

export default function DRLAssessment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("Tất cả khoa");
  const [selectedMajor, setSelectedMajor] = useState("Tất cả ngành");
  const [selectedClass, setSelectedClass] = useState("Tất cả lớp");
  const [selectedGpa, setSelectedGpa] = useState("Tất cả");
  const [expandedStudent, setExpandedStudent] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [currentPage] = useState(1);

  const filteredStudents = studentData.filter(student => {
    const matchesSearch =
      student.mssv.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleStudentClick = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="drl-assessment-container">
      <div className="drl-content">
        {/* Breadcrumb */}
        <div className="drl-breadcrumb">
          <span>OSA Dashboard</span>
          <span>/</span>
          <span className="breadcrumb-active">Xét điểm rèn luyện</span>
        </div>

        {/* Header */}
        <div className="drl-header">
          <div className="drl-header-top">
            <button className="drl-btn-outline" onClick={handleGoBack}>
              ← Quay lại
            </button>
            <h1 className="drl-title">XÉT ĐIỂM RÈN LUYỆN - CHƯƠNG TRÌNH TUTOR</h1>
            <div className="drl-header-actions">
              <button className="drl-btn-outline" title="Chỉnh sửa">✏️</button>
              <button className="drl-btn-outline" title="Lưu kết quả">💾</button>
              <button className="drl-btn-outline" title="Sao chép">📋</button>
            </div>
          </div>

          <div className="drl-header-meta">
            <span className="drl-meta-item">
              📚 Học kỳ 1 - Năm học 2024-2025
            </span>
            <span className="drl-meta-item">
              👤 Người xét: Trần Thị B (OSA Staff)
            </span>
            <span className="drl-meta-item">
              🕐 Ngày: 18/10/2025 15:45
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="drl-search-section">
          <div className="drl-section-title">
            🔍 Tìm kiếm và lọc
          </div>

          <div className="drl-search-bar">
            <input
              type="text"
              placeholder="Tìm theo MSSV hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="drl-search-input"
            />
            <button className="drl-btn-primary">Tìm kiếm</button>
          </div>

          <div className="drl-filters">
            <div className="drl-filter-row">
              <div className="drl-filter-group">
                <label>Khoa:</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="drl-select"
                >
                  {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="drl-filter-group">
                <label>Ngành:</label>
                <select
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                  className="drl-select"
                >
                  {majors.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="drl-filter-row">
              <div className="drl-filter-group">
                <label>Lớp:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="drl-select"
                >
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="drl-filter-group">
                <label>GPA:</label>
                <select
                  value={selectedGpa}
                  onChange={(e) => setSelectedGpa(e.target.value)}
                  className="drl-select"
                >
                  {gpaRanges.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="drl-refresh-section">
            <button className="drl-btn-outline">
              🔄 Làm mới
            </button>
            <span className="drl-selected-info">Đã chọn: 0</span>
          </div>
        </div>

        {/* Overview Statistics */}
        <div className="drl-overview">
          <div className="drl-section-title">Tổng quan</div>
          <div className="drl-stats-grid">
            <div className="drl-stat-card stat-primary">
              <div className="stat-icon">🎓</div>
              <div className="stat-content">
                <p className="stat-label">Tổng SV</p>
                <p className="stat-value">{overviewStats.totalStudents.toLocaleString()}</p>
              </div>
            </div>

            <div className="drl-stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <p className="stat-label">Tham gia</p>
                <p className="stat-value">
                  {overviewStats.participationCount.toLocaleString()}
                  <span className="stat-percent">({overviewStats.participationRate}%)</span>
                </p>
              </div>
            </div>

            <div className="drl-stat-card stat-warning">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <p className="stat-label">GPA TB</p>
                <p className="stat-value">{overviewStats.averageGpa}</p>
              </div>
            </div>

            <div className="drl-stat-card stat-info">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <p className="stat-label">ĐRL TB</p>
                <p className="stat-value">+{overviewStats.averageDrlBonus} điểm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="drl-student-list">
          <div className="drl-list-header">
            <div className="drl-section-title">Danh sách sinh viên</div>
            <label className="drl-checkbox-label">
              <input type="checkbox" className="mr-2" />
              Chọn tất cả
            </label>
          </div>

          <div className="drl-table-container">
            <table className="drl-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>MSSV</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>GPA</th>
                  <th>Buổi</th>
                  <th>ĐRL +</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map(student => (
                  <React.Fragment key={student.id}>
                    <tr
                      className={`drl-table-row ${expandedStudent === student.id ? 'expanded' : ''}`}
                      onClick={() => handleStudentClick(student.id)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="font-mono">{student.mssv}</td>
                      <td className="font-medium">{student.name}</td>
                      <td>{student.class}</td>
                      <td>{student.gpa}</td>
                      <td>{student.sessions}</td>
                      <td className="font-semibold text-primary">+{student.drlBonus}</td>
                      <td>
                        {student.status === 'completed' && (
                          <span className="drl-badge badge-success">
                            ✅ Hoàn thành
                          </span>
                        )}
                        {student.status === 'incomplete' && (
                          <span className="drl-badge badge-warning">
                            ⚠️ Chưa đủ
                          </span>
                        )}
                        {student.status === 'warning' && (
                          <span className="drl-badge badge-danger">
                            ❌ Cảnh báo
                          </span>
                        )}
                      </td>
                    </tr>

                    {expandedStudent === student.id && (
                      <tr className="drl-detail-row">
                        <td colSpan={8}>
                          <StudentDetailPanel student={studentDetail} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="drl-pagination">
            <span>Trang {currentPage} / {totalPages}</span>
            <span>Hiển thị: {startIndex + 1} - {Math.min(endIndex, filteredStudents.length)} / {filteredStudents.length} sinh viên</span>
          </div>
        </div>

        {/* Scoring Rules */}
        <div className="drl-rules">
          <div className="drl-section-title">Quy tắc tính điểm</div>
          <ul className="drl-rules-list">
            {scoringRules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="drl-actions">
          <button className="drl-btn-outline" onClick={handleGoBack}>
            ← Quay lại
          </button>
          <button className="drl-btn-primary">
            💾 Lưu kết quả
          </button>
          <button className="drl-btn-secondary">
            📥 Xuất Excel
          </button>
          <button className="drl-btn-secondary">
            📄 Xuất báo cáo PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Student Detail Panel Component
function StudentDetailPanel({ student }) {
  return (
    <div className="drl-detail-panel">
      <div className="drl-detail-header">
        <span>MSSV: {student.mssv}</span>
        <span>Họ tên: {student.name}</span>
        <span>Lớp: {student.class}</span>
        <span>Khoa: {student.faculty}</span>
      </div>

      <div className="drl-detail-section">
        <div className="drl-section-icon">📊</div>
        <div className="drl-section-subtitle">Thành tích học tập</div>
        <ul>
          <li>GPA hiện tại: {student.academicRecord.currentGpa}</li>
          <li>GPA trước khi tham gia: {student.academicRecord.previousGpa}</li>
          <li className="drl-highlight">
            ✅ Tăng: +{student.academicRecord.improvement.toFixed(2)} (+{student.academicRecord.improvement}%)
          </li>
        </ul>
      </div>

      <div className="drl-detail-section">
        <div className="drl-section-icon">🎓</div>
        <div className="drl-section-subtitle">Tham gia chương trình Tutor</div>
        <ul>
          <li>Số buổi tham gia: {student.tutorParticipation.attended}/{student.tutorParticipation.totalSessions} ({student.tutorParticipation.attendanceRate}%)</li>
          <li>Môn học: {student.tutorParticipation.subject}</li>
          <li>Tutors: {student.tutorParticipation.tutors}</li>
          <li>
            Đánh giá từ tutor: {"⭐".repeat(Math.floor(student.tutorParticipation.rating))} ({student.tutorParticipation.rating}/5.0) - "{student.tutorParticipation.ratingComment}"
          </li>
          <li className="drl-highlight">
            ✅ Hoàn thành xuất sắc
          </li>
        </ul>
      </div>

      <div className="drl-detail-section drl-calculation">
        <div className="drl-section-icon">⭐</div>
        <div className="drl-section-subtitle">Tính điểm rèn luyện</div>
        <ul>
          <li>
            Tham gia 100% buổi học: <span className="drl-bonus">+{student.drlCalculation.attendanceBonus} điểm</span>
          </li>
          <li>
            GPA tăng {student.academicRecord.improvement}% (≥10%): <span className="drl-bonus">+{student.drlCalculation.gpaImprovementBonus} điểm</span>
          </li>
          <li>
            Đánh giá xuất sắc từ tutor: <span className="drl-bonus">+{student.drlCalculation.ratingBonus} điểm (Bonus)</span>
          </li>
        </ul>
        <div className="drl-total">
          🎉 Tổng điểm rèn luyện được cộng: <span className="drl-total-value">+{student.drlCalculation.totalBonus} điểm</span>
        </div>
      </div>

      <div className="drl-detail-actions">
        <button className="drl-btn-outline">Chỉnh sửa thủ công</button>
        <button className="drl-btn-primary">Lưu</button>
        <button className="drl-btn-secondary">Hủy</button>
      </div>
    </div>
  );
}