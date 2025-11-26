// src/Pages/Tutors/MyStudents.jsx
import React, { useState, useEffect } from "react";
import { tutorsService } from "../../api";
import { showSuccess, showError } from "../../utils/errorHandler";
import "./MyStudents.css";

export default function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressData, setProgressData] = useState({
    achievements: "",
    difficulties: "",
    suggestions: "",
  });

  useEffect(() => {
    fetchMyStudents();
  }, []);

  const fetchMyStudents = async () => {
    try {
      setLoading(true);
      const response = await tutorsService.getMyStudents();
      setStudents(response.data || []);
    } catch (error) {
      showError("Không thể tải danh sách học sinh");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setProgressData({
      achievements: "",
      difficulties: "",
      suggestions: "",
    });
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();

    if (!selectedStudent) return;

    // Validation
    if (!progressData.achievements.trim()) {
      showError("Vui lòng nhập thành tích của học sinh");
      return;
    }

    try {
      await tutorsService.postProgress({
        studentId: selectedStudent.id,
        ...progressData,
      });
      showSuccess("Đã ghi nhận tiến độ học tập!");
      setShowModal(false);
      setSelectedStudent(null);
      setProgressData({
        achievements: "",
        difficulties: "",
        suggestions: "",
      });
    } catch (error) {
      showError(error.message || "Không thể ghi nhận tiến độ");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="ms-container">
        <div className="ms-loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="ms-container">
      <div className="ms-header">
        <h1>Học Sinh Của Tôi</h1>
        <div className="ms-stats">
          <div className="ms-stat-badge">
            Tổng: <strong>{students.length}</strong> học sinh
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="ms-empty">
          <p>Bạn chưa có học sinh nào</p>
        </div>
      ) : (
        <div className="ms-list">
          {students.map((student) => (
            <div key={student.id} className="ms-card">
              <div className="ms-card-header">
                <div className="ms-student-info">
                  <div className="ms-student-avatar">
                    {student.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div className="ms-student-details">
                    <h3>{student.name}</h3>
                    <p className="ms-student-email">{student.email}</p>
                  </div>
                </div>
                <button
                  className="ms-btn-progress"
                  onClick={() => handleOpenModal(student)}
                >
                  Ghi Tiến Độ
                </button>
              </div>

              <div className="ms-card-stats">
                <div className="ms-stat-item">
                  <span className="ms-stat-label">Số buổi học</span>
                  <span className="ms-stat-value">
                    {student.totalMeetings || 0}
                  </span>
                </div>
                <div className="ms-stat-item">
                  <span className="ms-stat-label">Tổng giờ học</span>
                  <span className="ms-stat-value">
                    {student.totalHours || 0}h
                  </span>
                </div>
                <div className="ms-stat-item">
                  <span className="ms-stat-label">Buổi hoàn thành</span>
                  <span className="ms-stat-value">
                    {student.completedMeetings || 0}
                  </span>
                </div>
              </div>

              {student.major && (
                <div className="ms-card-footer">
                  <span className="ms-major-badge">{student.major}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && selectedStudent && (
        <div className="ms-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal-header">
              <h2>Ghi Nhận Tiến Độ</h2>
              <button
                className="ms-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="ms-student-summary">
              <div className="ms-student-avatar-large">
                {selectedStudent.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div>
                <h3>{selectedStudent.name}</h3>
                <p>{selectedStudent.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitProgress}>
              <div className="ms-form-group">
                <label>
                  Thành tích <span className="ms-required">*</span>
                </label>
                <textarea
                  value={progressData.achievements}
                  onChange={(e) =>
                    setProgressData({
                      ...progressData,
                      achievements: e.target.value,
                    })
                  }
                  placeholder="Mô tả những thành tích học sinh đạt được..."
                  rows={3}
                  required
                />
              </div>

              <div className="ms-form-group">
                <label>Khó khăn</label>
                <textarea
                  value={progressData.difficulties}
                  onChange={(e) =>
                    setProgressData({
                      ...progressData,
                      difficulties: e.target.value,
                    })
                  }
                  placeholder="Những khó khăn học sinh đang gặp phải..."
                  rows={3}
                />
              </div>

              <div className="ms-form-group">
                <label>Đề xuất</label>
                <textarea
                  value={progressData.suggestions}
                  onChange={(e) =>
                    setProgressData({
                      ...progressData,
                      suggestions: e.target.value,
                    })
                  }
                  placeholder="Đề xuất phương pháp học tập phù hợp..."
                  rows={3}
                />
              </div>

              <div className="ms-modal-actions">
                <button
                  type="button"
                  className="ms-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="ms-btn-submit">
                  Ghi Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
