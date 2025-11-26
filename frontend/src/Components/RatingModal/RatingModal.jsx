import React, { useState } from "react";
import "./RatingModal.css";
import { meetingsService } from "../../api";
import { showSuccess, showError } from "../../utils/errorHandler";

export default function RatingModal({ meetingId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showError("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setSubmitting(true);
      await meetingsService.rate(meetingId, {
        score: rating,
        comment: comment.trim(),
      });
      showSuccess("Đánh giá thành công!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      showError("Lỗi khi gửi đánh giá");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h2>Đánh giá buổi học</h2>
          <button className="rating-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rating-modal-body">
            {/* Star Rating */}
            <div className="rating-stars-section">
              <label className="rating-label">Đánh giá của bạn:</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`rating-star ${
                      star <= (hoveredRating || rating) ? "active" : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="rating-text">
                {rating === 0 && "Chọn số sao"}
                {rating === 1 && "Rất tệ"}
                {rating === 2 && "Tệ"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Tốt"}
                {rating === 5 && "Xuất sắc"}
              </p>
            </div>

            {/* Comment */}
            <div className="rating-comment-section">
              <label className="rating-label">Nhận xét (tùy chọn):</label>
              <textarea
                className="rating-textarea"
                placeholder="Chia sẻ trải nghiệm của bạn về buổi học..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                maxLength={500}
              />
              <p className="rating-char-count">{comment.length}/500 ký tự</p>
            </div>
          </div>

          <div className="rating-modal-footer">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-submit"
              disabled={submitting || rating === 0}
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
