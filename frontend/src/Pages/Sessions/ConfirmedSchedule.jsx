// src/Pages/Sessions/ConfirmedSchedule.jsx
import React from "react";
import { Link } from "react-router-dom";
import { getSessions } from "../../data/sessions";
import "./ConfirmedSchedule.css";

// 4 khung giờ cố định (2 giờ mỗi slot)
const TIME_SLOTS = [
  { id: "7-9", label: "7:00–9:00", start: "07:00", end: "09:00" },
  { id: "9-11", label: "9:00–11:00", start: "09:00", end: "11:00" },
  { id: "13-15", label: "13:00–15:00", start: "13:00", end: "15:00" },
  { id: "15-17", label: "15:00–17:00", start: "15:00", end: "17:00" },
];

// Cột thứ trong tuần
const WEEK_DAYS = [
  { key: "Thứ Hai", label: "Thứ hai" },
  { key: "Thứ Ba", label: "Thứ ba" },
  { key: "Thứ Tư", label: "Thứ tư" },
  { key: "Thứ Năm", label: "Thứ năm" },
  { key: "Thứ Sáu", label: "Thứ sáu" },
  { key: "Thứ Bảy", label: "Thứ bảy" },
  { key: "Chủ Nhật", label: "Chủ nhật" },
];

export default function ConfirmedSchedule() {
  // Luôn đọc snapshot mới nhất → schedule tự cập nhật sau khi accept
  const { confirmed } = getSessions();

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // So sánh theo yyyy-mm-dd
  const isSameDate = (iso, d) => {
    const [y, m, dd] = iso.split("-").map(Number);
    return d.getFullYear() === y && d.getMonth() + 1 === m && d.getDate() === dd;
  };

  // Tách "07:00–09:00" từ "07:00–09:00 sáng" (nếu có chữ "sáng")
  const getTimePart = (timeRange) => timeRange.split(" ")[0];

  // Xác định slot id từ timeRange
const getSlotId = (timeRange) => {
  const timePart = getTimePart(timeRange);     
  const [start] = timePart.split("–");        
  const slot = TIME_SLOTS.find((t) => t.start === start);
  return slot ? slot.id : null;
};

  /**
   * Trạng thái của 1 buổi học:
   * - "upcoming": hôm nay, chưa tới giờ
   * - "ongoing" : hôm nay, đang trong khung giờ
   * - "finished": hôm nay, đã qua giờ
   * - "other"   : không phải hôm nay
   */
  const getStatus = (session) => {
    const isToday = isSameDate(session.date, now);
    if (!isToday) return "other";

    const timePart = getTimePart(session.timeRange);
    const [startStr, endStr] = timePart.split("–");
    const [sh, sm] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    if (nowMinutes < startMin) return "upcoming";
    if (nowMinutes >= startMin && nowMinutes < endMin) return "ongoing";
    return "finished";
  };

  // Màu dot theo status
  // - upcoming (hôm nay, chưa học): vàng
  // - ongoing / finished (hôm nay, đang học hoặc đã học xong): xanh
  // - other (ngày khác): đỏ
  const getColor = (session) => {
    const status = getStatus(session);
    if (status === "upcoming") return "yellow";
    if (status === "other") return "red";
    // ongoing hoặc finished
    return "green";
  };

  // Tạo ma trận [slot][weekday] → danh sách buổi học
  const table = TIME_SLOTS.map((slot) => ({
    slotId: slot.id,
    label: slot.label,
    cells: WEEK_DAYS.map(() => []),
  }));

  confirmed.forEach((s) => {
    const slotId = getSlotId(s.timeRange);
    const dayIndex = WEEK_DAYS.findIndex((d) => d.key === s.weekday);
    const slotIndex = TIME_SLOTS.findIndex((t) => t.id === slotId);
    if (dayIndex === -1 || slotIndex === -1) return;
    table[slotIndex].cells[dayIndex].push(s);
  });

  // Các buổi học trong "hôm nay"
  const todaySessions = confirmed.filter((s) => isSameDate(s.date, now));

  return (
    <div className="sch">
      <h1 className="sch-title">Buổi học đã xác nhận</h1>

      {/* ===== Lịch dạy theo tuần ===== */}
      <section className="sch-week-section">
        <div className="sch-week-header">
          <span className="sch-week-icon" aria-hidden>
            📅
          </span>
          <span className="sch-week-title">Lịch dạy theo tuần</span>
        </div>

        <div className="sch-week-box">
          <table className="sch-week-table">
            <thead>
              <tr>
                <th></th>
                {WEEK_DAYS.map((d) => (
                  <th key={d.key}>{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.slotId}>
                  <th>{row.label}</th>
                  {row.cells.map((cellSessions, idx) => {
                    if (cellSessions.length === 0) {
                      return (
                        <td key={idx} className="sch-slot">
                          –
                        </td>
                      );
                    }
                    return (
                      <td key={idx} className="sch-slot">
                        {cellSessions.map((s) => {
                          const color = getColor(s);
                          const dotClass =
                            color === "green"
                              ? "sch-dot--green"
                              : color === "yellow"
                              ? "sch-dot--yellow"
                              : "sch-dot--red";
                          return (
                            <div key={s.id} className="sch-slot-item">
                              <span
                                className={`sch-dot ${dotClass}`}
                                aria-hidden
                              />
                              <span>{s.studentId}</span>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Buổi học hôm nay ===== */}
      <section className="sch-today-section">
        <div className="sch-today-title">📋 Buổi học hôm nay:</div>

        {todaySessions.length === 0 && (
          <div className="sch-today-empty">
            Hôm nay không có buổi học nào đã xác nhận.
          </div>
        )}

        {todaySessions.map((s) => {
          const status = getStatus(s);
          const color = getColor(s);
          const dotClass =
            color === "green"
              ? "sch-dot--green"
              : color === "yellow"
              ? "sch-dot--yellow"
              : "sch-dot--red";

          let statusText = "Đã xác nhận";
          if (status === "ongoing") statusText = "Đang diễn ra";
          if (status === "finished") statusText = "Đã học xong";

          return (
            <article key={s.id} className="sch-today-card">
              <div className="sch-today-row">
                <span className={`sch-dot ${dotClass}`} aria-hidden />
                <span className="sch-today-main">
                  {getTimePart(s.timeRange).replace("–", "-")} |{" "}
                  {s.studentName} | {s.studentId}
                </span>
              </div>

              <div className="sch-status-row">
                <span className="sch-status-text">
                  Trạng thái: {statusText}
                </span>
              </div>
            </article>
          );
        })}

        <div className="sch-back-wrapper">
          <Link to="/sessions" className="linklike">
            ← Quay lại quản lý buổi học
          </Link>
        </div>
      </section>
    </div>
  );
}
