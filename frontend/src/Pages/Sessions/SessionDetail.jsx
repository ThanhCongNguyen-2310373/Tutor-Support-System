// src/Pages/Sessions/SessionDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { meetingsService } from "../../api";
import { showSuccess, showError } from "../../utils/errorHandler";
import RatingModal from "../../Components/RatingModal";
import "./SessionDetail.css";

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchMeetingDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const data = await meetingsService.getMeetingById(id);
      setItem(data);
    } catch (error) {
      showError("Không thể tải chi tiết buổi học");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      await meetingsService.cancel(id);
      showSuccess("Đã từ chối yêu cầu");
      navigate("/sessions");
    } catch (error) {
      showError("Lỗi khi từ chối");
    }
  };

  const handleAccept = async () => {
    try {
      await meetingsService.confirm(id);
      showSuccess("Đã chấp nhận yêu cầu");
      navigate("/sessions");
    } catch (error) {
      showError("Lỗi khi chấp nhận");
    }
  };

  const handleComplete = async () => {
    try {
      await meetingsService.complete(id);
      showSuccess("Đã đánh dấu hoàn thành");
      fetchMeetingDetail(); // Reload
    } catch (error) {
      showError("Lỗi khi hoàn thành");
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Xác nhận hủy buổi học này?")) return;
    try {
      await meetingsService.cancel(id);
      showSuccess("Đã hủy buổi học");
      navigate("/sessions");
    } catch (error) {
      showError("Lỗi khi hủy");
    }
  };

  if (loading) {
    return <div className="sess-detail">Đang tải...</div>;
  }

  if (!item) {
    return (
      <div className="sess-detail">
        <div className="sess-detail-box">
          <p>Không tìm thấy buổi học với mã: {id}</p>
          <div className="sess-detail-back">
            <Link to="/sessions" className="linklike">
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from new schema
  const students = item.students || [];
  const mainStudent = students[0];
  const studentName = mainStudent?.fullName || "—";
  const studentCode = mainStudent?.mssv || "—";
  const email = mainStudent?.email || "—";
  const topic = item.topic || "Không có chủ đề";
  const startTime = item.startTime
    ? new Date(item.startTime).toLocaleString("vi-VN")
    : "—";
  const endTime = item.endTime
    ? new Date(item.endTime).toLocaleString("vi-VN")
    : "—";
  const status = item.status || "PENDING";

  return (
    <div className="sess-detail">
      <h1 className="sess-detail-title">Chi tiết buổi học</h1>

      <div className="sess-detail-box">
        {/* Thông tin sinh viên */}
        <section className="sess-section">
          <h2>📘 Thông tin sinh viên</h2>
          <p>
            <strong>Họ và tên:</strong> {studentName}
          </p>
          <p>
            <strong>Mã số sinh viên:</strong> {studentCode}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          {students.length > 1 && (
            <p>
              <strong>Số sinh viên:</strong> {students.length}
            </p>
          )}
        </section>

        {/* Chi tiết buổi học */}
        <section className="sess-section">
          <h2>📄 Chi tiết buổi học</h2>
          <p>
            <strong>Chủ đề:</strong> {topic}
          </p>
          <p>
            <strong>Thời gian bắt đầu:</strong> {startTime}
          </p>
          <p>
            <strong>Thời gian kết thúc:</strong> {endTime}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span className={`status-badge status-${status.toLowerCase()}`}>
              {status}
            </span>
          </p>
        </section>

        {/* Tin nhắn tùy chọn */}
        {status === "PENDING" && (
          <section className="sess-section">
            <h2>📩 Tin nhắn cho sinh viên (tùy chọn)</h2>
            <label className="sess-label">
              <textarea
                className="sess-detail-textarea"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
          </section>
        )}

        {/* Nút hành động động dựa trên status */}
        <div className="sess-detail-actions">
          {status === "PENDING" && (
            <>
              <button className="btn btn_reject" onClick={handleReject}>
                TỪ CHỐI
              </button>
              <button className="btn btn_accept" onClick={handleAccept}>
                CHẤP NHẬN
              </button>
            </>
          )}
          {status === "CONFIRMED" && (
            <>
              <button className="btn btn_cancel" onClick={handleCancel}>
                HỦY BUỔI HỌC
              </button>
              <button className="btn btn_complete" onClick={handleComplete}>
                HOÀN THÀNH
              </button>
            </>
          )}
          {status === "COMPLETED" && (
            <div className="sess-completed-section">
              <p className="sess-completed-msg">✅ Buổi học đã hoàn thành</p>
              <button
                className="btn btn-rate"
                onClick={() => setShowRatingModal(true)}
              >
                ⭐ Đánh giá buổi học
              </button>
            </div>
          )}
        </div>

        {/* Link quay lại danh sách */}
        <div className="sess-detail-back">
          <Link to="/sessions" className="linklike">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          meetingId={id}
          onClose={() => setShowRatingModal(false)}
          onSuccess={fetchMeetingDetail}
        />
      )}
    </div>
  );
}
