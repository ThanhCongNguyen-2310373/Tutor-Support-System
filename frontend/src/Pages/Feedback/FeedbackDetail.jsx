import React, { useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./FeedbackDetail.css";
import { FEEDBACK_COURSES } from "../../data/feedbackData";

function Star({ filled, onClick, label }) {
  return (
    <button
      type="button"
      className={`fd-star ${filled ? "is-filled" : ""}`}
      onClick={onClick}
      aria-label={label}
    >
      ★
    </button>
  );
}

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const course = useMemo(
    () => FEEDBACK_COURSES.find((c) => c.id === id),
    [id]
  );

  const displayWeek = useMemo(() => {
    if (!course) return null;
    if (typeof course.currentWeek === "number") return course.currentWeek;
    const weeks = course.weeks || [];
    if (!weeks.length) return null;
    const inProgress = weeks.filter((w) => /tiến hành/i.test(w.status || ""));
    if (inProgress.length) return Math.min(...inProgress.map((w) => w.week));
    const done = weeks.filter((w) => /hoàn thành/i.test(w.status || ""));
    if (done.length) return Math.max(...done.map((w) => w.week));
    return Math.min(...weeks.map((w) => w.week));
  }, [course]);

  // ======= GHÉP "Lớp X: lịch" & format giờ "13h - 15h" =======
  const classScheduleLine = useMemo(() => {
    if (!course) return "";
    const classNames = Array.isArray(course.classes)
      ? course.classes.map((s) => {
          const m = s.match(/^\s*(Lớp\s*[A-Z0-9]+)/i);
          return (m ? m[1] : s).trim();
        })
      : [];
    const scheduleParts = (course.schedule || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    const prettifyTime = (seg) =>
      seg
        .replace(/(\d{1,2}):00/g, "$1h")
        .replace(/\s*-\s*/g, " - ")
        .replace(/\s{2,}/g, " ")
        .replace(/\b0?(\d)h\b/g, "$1h");
    let pieces = [];
    if (classNames.length && scheduleParts.length) {
      const n = Math.max(classNames.length, scheduleParts.length);
      for (let i = 0; i < n; i++) {
        const cls = classNames[i] || classNames[classNames.length - 1];
        const seg = scheduleParts[i] || scheduleParts[scheduleParts.length - 1];
        pieces.push(`${cls}: ${prettifyTime(seg)}`);
      }
    } else if (classNames.length) {
      const seg = prettifyTime(course.schedule || "");
      pieces = seg ? classNames.map((c) => `${c}: ${seg}`) : classNames;
    } else if (scheduleParts.length) {
      pieces = [scheduleParts.map(prettifyTime).join(" / ")];
    }
    return pieces.join(" / ");
  }, [course]);

  const initialPrev = useMemo(() => {
    if (!course) return [];
    if (Array.isArray(course.prevReviews)) {
      return [...course.prevReviews].sort((a, b) => a.week - b.week);
    }
    const weeks = course.weeks || [];
    return weeks
      .filter((w) => w.sampleReview && w.sampleReview.trim())
      .map((w) => ({
        id: `${course.id}_w${w.week}`,
        week: w.week,
        text: `“${w.sampleReview}”`,
        stars: w.stars || 0,
      }))
      .sort((a, b) => a.week - b.week);
  }, [course]);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [prevReviews, setPrevReviews] = useState(initialPrev);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // ESC để đóng modal
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    if (showModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  if (!course) {
    return (
      <div className="fd">
        <h1 className="fd-title">Không tìm thấy khóa học</h1>
        <Link to="/feedback" className="fd-back">← Quay lại danh sách</Link>
      </div>
    );
  }

  const charCount = content.length;

  const handleDelete = (rid) => {
    setPrevReviews((s) => s.filter((r) => r.id !== rid));
  };

  const handleEdit = (rid) => {
    const r = prevReviews.find((x) => x.id === rid);
    if (!r) return;
    setContent(r.text.replace(/^“|”$/g, ""));
    setRating(r.stars);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating && !content.trim()) return;

    const newReview = {
      id: `rv_${Date.now()}`,
      week:
        displayWeek ??
        (prevReviews.length ? prevReviews[prevReviews.length - 1].week + 1 : 1),
      text: `“${content.trim() || "Không có nội dung"}”`,
      stars: rating || 0,
    };

    setPrevReviews((s) => [...s, newReview].sort((a, b) => a.week - b.week));
    setContent("");
    setRating(0);

    // Hiện modal thông báo
    setShowModal(true);
  };

  const goBackMain = () => navigate("/feedback");

  return (
    <div className="fd">
      <h1 className="fd-title">
        {course.id} - {course.name}
      </h1>

      <div className="fd-panel" aria-live="polite">
        {/* Giảng viên */}
        <div className="fd-rowline">
          <span className="fd-emoji" aria-hidden>👨‍🏫</span>
          <span><b>Giảng viên:</b>&nbsp;{course.teacher}</span>
        </div>

        {/* Buổi học */}
        <div className="fd-rowline">
          <span className="fd-emoji" aria-hidden>📅</span>
          <span>
            <b>Buổi học:</b>&nbsp;
            {classScheduleLine || course.schedule}
            {displayWeek != null && <> - <b>Tuần {displayWeek}</b></>}
          </span>
        </div>

        {/* Đánh giá tổng thể */}
        <div className="fd-section-title">
          <span className="fd-emoji" aria-hidden>⭐</span>
          <span>Đánh giá tổng thể:</span>
        </div>

        <div className="fd-stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              filled={i <= rating}
              onClick={() => setRating(i)}
              label={`Chọn ${i} sao`}
            />
          ))}
          <span className="fd-hint">(Ấn vào sao để đánh giá)</span>
        </div>

        {/* Form góp ý */}
        <form onSubmit={handleSubmit}>
          <div className="fd-textbox-wrap">
            <textarea
              className="fd-textarea"
              placeholder="[Khung nhập nội dung đánh giá]"
              value={content}
              maxLength={500}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="fd-count">Số ký tự: {charCount}/500</div>
          </div>

          {/* Danh sách đánh giá trước */}
          <div className="fd-prev">
            <div className="fd-prev-header">
              <b>Đánh giá trước ({prevReviews.length}):</b>
            </div>

            <ul className="fd-prev-list">
              {prevReviews.map((r) => (
                <li key={r.id} className="fd-prev-item">
                  <div className="fd-prev-text">
                    Tuần {r.week}: {r.text}{" "}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`fd-sample-star ${i < r.stars ? "is-on" : ""}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="fd-prev-actions">
                    <button
                      type="button"
                      className="fd-linklike"
                      onClick={() => handleEdit(r.id)}
                    >
                      [Chỉnh sửa]
                    </button>
                    <button
                      type="button"
                      className="fd-linklike"
                      onClick={() => handleDelete(r.id)}
                    >
                      [Xóa]
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Hành động */}
          <div className="fd-actions">
            <Link to="/feedback" className="fd-cancel">Hủy</Link>
            <button type="submit" className="fd-submit">Gửi đánh giá</button>
          </div>
        </form>
      </div>

      {/* ===== Modal THÔNG BÁO ===== */}
      {showModal && (
        <>
          <div className="fd-modal-backdrop" onClick={() => setShowModal(false)} />
          <div
            className="fd-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fd-modal-title"
          >
            <div className="fd-modal-header">
              <h2 id="fd-modal-title">THÔNG BÁO</h2>
            </div>
            <div className="fd-modal-body">
              <p>✅ Đánh giá của bạn đã được lưu thành công</p>
              <p>✉️ Giảng viên: <b>{course.teacher}</b> đã được thông báo</p>
              <p>🔎 Đánh giá của bạn đã được lưu thêm vào mục “Đánh giá trước”</p>
            </div>
            <div className="fd-modal-footer">
              <button
                type="button"
                className="fd-modal-primary"
                onClick={goBackMain}
              >
                Quay lại bảng điều khiển chính
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
