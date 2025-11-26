import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./FeedbackList.css";
import { FEEDBACK_COURSES } from "../../data/feedbackData";
import filterIcon from "../../Components/Assets/filter-solid-full.svg";

export default function FeedbackList() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return FEEDBACK_COURSES;
    return FEEDBACK_COURSES.filter(
      c =>
        c.id.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        (c.teacher || "").toLowerCase().includes(query)
    );
  }, [q]);

  return (
    <div className="fl">
      <div className="fl-toolbar">
        <input
          className="fl-search"
          placeholder="Tìm kiếm khóa học"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="fl-filter">
          Bộ lọc
          <img className="fl-filter-icon" src={filterIcon} alt="" />
        </button>
      </div>

      <div className="fl-list">
        {rows.map((c) => (
          <div key={c.id} className="fl-card">
            {/* Toàn bộ phần trái là Link (vẫn bấm được cả ô) */}
            <Link
              to={`/feedback/${c.id}`}
              className="fl-card-body fl-card-link"
              aria-label={`Xem đánh giá: ${c.id} - ${c.name}`}
            >
              <h3 className="fl-title">
                {c.id} - {c.name}
              </h3>

              <div className="fl-row">
                <span className="fl-emoji" aria-hidden>👨‍🏫</span>
                <span>Giảng viên: {c.teacher}</span>
              </div>

              <div className="fl-row">
                <span className="fl-emoji" aria-hidden>📅</span>
                <span>{c.schedule}</span>
              </div>

              <div className="fl-row">
                <span className="fl-emoji" aria-hidden>📈</span>
                <span>{c.progressText}</span>
              </div>

              <div className="fl-row">
                <span className="fl-muted">Các lớp:</span>&nbsp;
                <span>{c.classes.join(", ")}</span>
              </div>
            </Link>

            {/* Cột nút bên phải */}
            <div className="fl-card-actions">
              <Link className="fl-detail" to={`/feedback/${c.id}`}>
                Xem lại
              </Link>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="fl-empty">Không tìm thấy khóa học phù hợp.</div>
        )}
      </div>
    </div>
  );
}
