import React, { useState, useEffect } from "react";
import "./OSADashboard.css";
import Card from "../../../Components/Card/Card";
import pencilIcon from "../../../Components/Assets/pen-to-square-solid-full.svg";
import { Link } from "react-router-dom";
import reportsService from "../../../api/reports.service";
import { showError } from "../../../utils/errorHandler";

export default function OSADashboard() {
  const [eligibleTutors, setEligibleTutors] = useState([]);
  const [eligibleLearners, setEligibleLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScholarshipData();
  }, []);

  const fetchScholarshipData = async () => {
    try {
      setLoading(true);
      const [tutorsResponse, learnersResponse] = await Promise.all([
        reportsService.getScholarshipTutors({ minGpa: 3.0, minHours: 20 }),
        reportsService.getScholarshipLearners({ minGpa: 3.5 }),
      ]);

      setEligibleTutors(tutorsResponse.data || []);
      setEligibleLearners(learnersResponse.data || []);
    } catch (error) {
      console.error("Error fetching scholarship data:", error);
      showError("Không thể tải dữ liệu học bổng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="td">
        <div className="td-title-wrap">
          <h1 className="td-title">Bảng điều khiển OSA</h1>
        </div>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="td">
      {/* Tiêu đề */}
      <div className="td-title-wrap">
        <h1 className="td-title">Bảng điều khiển OSA</h1>
      </div>

      {/* Panel nội dung */}
      <div className="td-panel">
        <div className="td-grid">
          <div className="td-card-center">
            <Link to="/drl" className="td-card-link">
              <Card
                title="Xét điểm rèn luyện"
                icon={pencilIcon}
                iconColor="#FF0004"
                iconSize={120}
              />
            </Link>
          </div>
        </div>

        {/* Scholarship Reports Section */}
        <div className="osa-scholarship-section">
          <h2 className="osa-section-title">Báo cáo Học bổng</h2>

          {/* Eligible Tutors */}
          <div className="osa-report-card">
            <h3 className="osa-card-title">
              Tutor đủ điều kiện học bổng ({eligibleTutors.length})
            </h3>
            <p className="osa-card-subtitle">
              Điều kiện: GPA ≥ 3.0, Giờ dạy ≥ 20
            </p>

            {eligibleTutors.length > 0 ? (
              <div className="osa-table-container">
                <table className="osa-table">
                  <thead>
                    <tr>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>GPA</th>
                      <th>Giờ dạy</th>
                      <th>Môn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleTutors.map((tutor, index) => (
                      <tr key={index}>
                        <td>{tutor.studentId || tutor.mssv}</td>
                        <td>{tutor.name || tutor.fullName}</td>
                        <td>{tutor.gpa?.toFixed(2) || "N/A"}</td>
                        <td>{tutor.totalHours || tutor.hours}</td>
                        <td>{tutor.subject || tutor.course}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="osa-empty-message">Không có tutor nào đủ điều kiện</p>
            )}
          </div>

          {/* Eligible Learners */}
          <div className="osa-report-card">
            <h3 className="osa-card-title">
              Học sinh đủ điều kiện học bổng ({eligibleLearners.length})
            </h3>
            <p className="osa-card-subtitle">Điều kiện: GPA ≥ 3.5</p>

            {eligibleLearners.length > 0 ? (
              <div className="osa-table-container">
                <table className="osa-table">
                  <thead>
                    <tr>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>GPA</th>
                      <th>Khoa</th>
                      <th>Số buổi học</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleLearners.map((learner, index) => (
                      <tr key={index}>
                        <td>{learner.studentId || learner.mssv}</td>
                        <td>{learner.name || learner.fullName}</td>
                        <td>{learner.gpa?.toFixed(2) || "N/A"}</td>
                        <td>{learner.faculty || learner.department}</td>
                        <td>{learner.totalSessions || learner.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="osa-empty-message">
                Không có học sinh nào đủ điều kiện
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
