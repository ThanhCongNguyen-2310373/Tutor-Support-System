// src/Pages/Tutors/ManageAvailability.jsx
import React, { useState, useEffect } from "react";
import { tutorsService } from "../../api";
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
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "10:00",
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await tutorsService.getMyAvailability();
      setSlots(response.data || []);
    } catch (error) {
      showError("Không thể tải lịch trống");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.startTime >= formData.endTime) {
      showError("Thời gian bắt đầu phải trước thời gian kết thúc");
      return;
    }

    try {
      await tutorsService.postAvailability(formData);
      showSuccess("Đã thêm lịch trống thành công!");
      setShowModal(false);
      setFormData({ dayOfWeek: 1, startTime: "08:00", endTime: "10:00" });
      fetchAvailability();
    } catch (error) {
      showError(error.message || "Không thể thêm lịch trống");
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
      if (grouped[slot.dayOfWeek] !== undefined) {
        grouped[slot.dayOfWeek].push(slot);
      }
    });

    return grouped;
  };

  const formatTime = (time) => {
    // If time is in HH:mm:ss format, extract HH:mm
    if (time && time.length >= 5) {
      return time.substring(0, 5);
    }
    return time;
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
                    <div className="ma-slot-time">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
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
