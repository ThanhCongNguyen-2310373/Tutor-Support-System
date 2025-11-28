// src/Pages/Tutors/ManageAvailability.jsx
import React, { useState, useEffect } from "react";
import { tutorsService} from "../../api";
import { showSuccess, showError } from "../../utils/errorHandler";
import "./ManageAvailability.css";

const DAYS_OF_WEEK = [
  { value: 0, label: "Chủ Nhật" },
  { value: 1, label: "Thứ Hai" },
  { value: 2, label: "Thứ Ba" },
  { value: 3, label: "Thứ Tư" },
  { value: 4, label: "Thứ Năm" },
  { value: 5, label: "Thứ Sáu" },
  { value: 6, label: "Thứ Bảy" },
];

export default function ManageAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // Updated state to include maxStudents
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "10:00",
    maxStudents: 1, 
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await tutorsService.getAvailability();
      console.log("DEBUG RAW RESPONSE:", response); // Look at this log!
      setSlots(response || []);
      console.log("Processed Slots:", response);
    } catch (error) {
      showError("Không thể tải lịch trống");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate the next occurrence of a specific day of the week
  // This converts generic days (Monday) to specific dates (2025-11-XX) for the backend
  const getNextDateForDay = (dayIndex, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    const currentDay = date.getDay(); 
    
    // Calculate days until target day
    let daysUntilTarget = (dayIndex - currentDay + 7) % 7;
    
    // If it's today but time has passed, move to next week
    if (daysUntilTarget === 0) {
      const now = new Date();
      if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
        daysUntilTarget = 7;
      }
    }

    date.setDate(date.getDate() + daysUntilTarget);
    date.setHours(hours, minutes, 0, 0);
    
    return date.toISOString();
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.startTime >= formData.endTime) {
      showError("Thời gian bắt đầu phải trước thời gian kết thúc");
      return;
    }

    if (formData.maxStudents < 1) {
      showError("Số lượng học viên phải ít nhất là 1");
      return;
    }

    // Convert inputs to format backend expects
    const startTimeISO = getNextDateForDay(formData.dayOfWeek, formData.startTime);
    const endTimeISO = getNextDateForDay(formData.dayOfWeek, formData.endTime);

    const payload = {
      startTime: startTimeISO,
      endTime: endTimeISO,
      maxStudents: parseInt(formData.maxStudents), // Ensure it's a number
    };

    try {
      await tutorsService.postAvailability(payload);
      showSuccess("Đã thêm lịch trống thành công!");
      setShowModal(false);
      // Reset form
      setFormData({ 
        dayOfWeek: 1, 
        startTime: "08:00", 
        endTime: "10:00", 
        maxStudents: 1 
      });
      fetchAvailability();
    } catch (error) {
      const msg = Array.isArray(error.message) 
        ? error.message.join(', ') 
        : (error.message || "Không thể thêm lịch trống");
      showError(msg);
      console.error(error);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch trống này?")) return;

    try {
      await tutorsService.deleteAvailability(slotId);
      showSuccess("Đã xóa lịch trống!");
      fetchAvailability();
    } catch (error) {
      showError(error.message || "Không thể xóa lịch trống");
      console.error(error);
    }
  };

  const groupSlotsByDay = () => {
    const grouped = {};
    DAYS_OF_WEEK.forEach((day) => {
      grouped[day.value] = [];
    });

    slots.forEach((slot) => {
      // Backend returns specific dates, we need to convert back to day of week index (0-6)
      const date = new Date(slot.startTime);
      const dayIndex = date.getDay();
      
      if (grouped[dayIndex] !== undefined) {
        grouped[dayIndex].push(slot);
      }
    });

    return grouped;
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="ma-container">
        <div className="ma-loading">Đang tải...</div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDay();

  return (
    <div className="ma-container">
      <div className="ma-header">
        <h1>Quản Lý Lịch Trống</h1>
        <button className="ma-btn-add" onClick={() => setShowModal(true)}>
          + Thêm Lịch Trống
        </button>
      </div>

      <div className="ma-calendar">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.value} className="ma-day-column">
            <div className="ma-day-header">{day.label}</div>
            <div className="ma-slots-list">
              {groupedSlots[day.value].length === 0 ? (
                <div className="ma-no-slots">Chưa có lịch trống</div>
              ) : (
                groupedSlots[day.value].map((slot) => (
                  <div key={slot.id} className="ma-slot-card">
                    <div>
                      <div className="ma-slot-time">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      {/* Optional: Show max students on the card */}
                      <div style={{fontSize: '0.8rem', color: '#718096'}}>
                        Tối đa: {slot.maxStudents} HV
                      </div>
                    </div>
                    <button
                      className="ma-btn-delete"
                      onClick={() => handleDeleteSlot(slot.id)}
                      title="Xóa lịch trống"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="ma-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal-header">
              <h2>Thêm Lịch Trống</h2>
              <button
                className="ma-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSlot}>
              <div className="ma-form-group">
                <label>Ngày trong tuần</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })
                  }
                  required
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ma-form-group">
                <label>Thời gian bắt đầu</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="ma-form-group">
                <label>Thời gian kết thúc</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>

              {/* NEW INPUT FOR MAX STUDENTS */}
              <div className="ma-form-group">
                <label>Số lượng học viên tối đa</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData({ ...formData, maxStudents: parseInt(e.target.value) })
                  }
                  required
                  placeholder="Ví dụ: 1"
                />
              </div>

              <div className="ma-modal-actions">
                <button
                  type="button"
                  className="ma-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="ma-btn-submit">
                  Thêm Lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}