import React, { useState, useEffect } from "react";
import { tutorsService } from "../../../api.js";
import "./ManageAvailability.css";

export default function ManageAvailability({ onClose }) {
  // ... (State and Logic same as before) ...
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => { fetchAvailability(); }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await tutorsService.getMyAvailability();
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setSchedules(sorted);
    } catch (error) { console.error("Failed to load availability:", error); } finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!startTime || !endTime) return alert("Vui lòng chọn thời gian bắt đầu và kết thúc");
    if (new Date(startTime) >= new Date(endTime)) return alert("Thời gian kết thúc phải sau thời gian bắt đầu");
    try {
      setActionLoading(true);
      await tutorsService.postAvailability({ startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() });
      alert("Đã thêm lịch trống mới");
      setStartTime(""); setEndTime("");
      await fetchAvailability();
    } catch (error) { alert("Lỗi: " + (error.message || "Không thể thêm lịch")); } finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa lịch này?")) return;
    try {
      setSchedules(prev => prev.filter(s => s.id !== id));
      await tutorsService.deleteAvailability(id);
    } catch (error) { alert("Lỗi xóa lịch: " + error.message); fetchAvailability(); }
  };

  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const dayNames = { 1: "Thứ 2", 2: "Thứ 3", 3: "Thứ 4", 4: "Thứ 5", 5: "Thứ 6", 6: "Thứ 7", 0: "Chủ Nhật" };
  const groupedSchedules = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  schedules.forEach(item => { const d = new Date(item.startTime); const dayIndex = d.getDay(); groupedSchedules[dayIndex].push(item); });

  return (
    <div className="tutordash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tutordash-modal-content ma-modal-size" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="tutordash-modal-header">
          <h2>Quản lý lịch trống</h2>
          <button className="tutordash-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="tutordash-modal-body ma-body-flex">
          
          {/* 1. ADD FORM */}
          <div className="ma-add-section">
            <h3 className="ma-add-title">Thêm lịch mới</h3>
            <div className="ma-add-row">
              <div className="ma-inputs-stack">
                <div className="ma-input-line">
                  <label>Bắt đầu:</label>
                  <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="ma-input-line">
                  <label>Kết thúc:</label>
                  <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
              <button className="ma-btn-add-big" onClick={handleAdd} disabled={actionLoading}>
                {actionLoading ? "Đang lưu..." : "Thêm Lịch +"}
              </button>
            </div>
          </div>

          {/* 2. WEEKLY GRID VIEW */}
          {loading ? ( <div className="ma-loading-state">Đang tải dữ liệu...</div> ) : (
            <div className="ma-week-grid-container">
              <div className="ma-week-grid">
                {dayOrder.map(dayIndex => (
                  <div key={dayIndex} className="ma-day-col">
                    <div className={`ma-day-header ${dayIndex === 0 ? 'ma-sunday' : ''}`}>
                      {dayNames[dayIndex]}
                    </div>
                    <div className="ma-day-content">
                      {groupedSchedules[dayIndex].length === 0 ? (
                        <div className="ma-no-slot">-</div>
                      ) : (
                        groupedSchedules[dayIndex].map(item => (
                          <div key={item.id} className="ma-slot-card">
                            <div className="ma-slot-date">
                              {new Date(item.startTime).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                            </div>
                            <div className="ma-slot-time">
                              {new Date(item.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                              <br/>⬇<br/>
                              {new Date(item.endTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                            </div>
                            <button className="ma-slot-delete" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} title="Xóa">×</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
