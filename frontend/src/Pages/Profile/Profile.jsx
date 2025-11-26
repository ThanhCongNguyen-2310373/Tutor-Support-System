// src/Pages/Profile/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import { PROFILES } from "../../data/profile_data";

/**
 * Profile có thể CHỈNH SỬA:
 * - Mặc định đọc dữ liệu từ localStorage theo key `profile:<role>`; nếu chưa có -> lấy từ PROFILES[role]
 * - Cho phép sửa, LƯU vào localStorage (ghi đè), hoặc HỦY để quay lại
 * - Mỗi role có bản ghi riêng biệt
 */

export default function Profile() {
  const { role } = useParams(); // /dashboard/:role/profile
  const fallbackKey = useMemo(() => (role || "student").toLowerCase(), [role]);

  // helper đọc dữ liệu khởi tạo
  const getInitial = () => {
    const storageKey = `profile:${fallbackKey}`;
    const baseProfile = PROFILES[fallbackKey] ?? PROFILES.student;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // merge để luôn có avatar (và các field mới nếu sau này thêm)
        return { ...baseProfile, ...parsed };
      }
    } catch {}

    return baseProfile;
  };

  const [info, setInfo] = useState(getInitial); // dữ liệu đang hiển thị
  const [draft, setDraft] = useState(getInitial); // dữ liệu đang sửa
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  // Khi role đổi -> nạp lại dữ liệu
  useEffect(() => {
    const initial = getInitial();
    setInfo(initial);
    setDraft(initial);
    setEditing(false);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackKey]);

  // ====== Handlers ======
  const onEdit = () => {
    setDraft(info);
    setEditing(true);
    setError("");
  };

  const onCancel = () => {
    setDraft(info);
    setEditing(false);
    setError("");
  };

  const onSave = () => {
    // validate nhẹ: name, email không trống; dob hợp lệ ISO yyyy-mm-dd
    if (!draft.name?.trim()) {
      setError("Vui lòng nhập Họ và tên.");
      return;
    }
    if (!draft.email?.trim()) {
      setError("Vui lòng nhập Email.");
      return;
    }
    if (draft.dob && !/^\d{4}-\d{2}-\d{2}$/.test(draft.dob)) {
      setError("Ngày sinh phải theo định dạng yyyy-mm-dd.");
      return;
    }

    const cleaned = { ...draft };
    try {
      localStorage.setItem(`profile:${fallbackKey}`, JSON.stringify(cleaned));
    } catch {
      // nếu localStorage lỗi (quota…), vẫn cập nhật state
    }
    setInfo(cleaned);
    setEditing(false);
    setError("");
  };

  // input change
  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="pf">
      <h1 className="pf-title">Hồ sơ của tôi</h1>

      <div className="pf-panel">
        {/* Cột trái: Ảnh chân dung dùng avatar_profile.jpg */}
        <div className="pf-left">
          <div className="pf-avatar">
            <img
              src={info.avatar}
              alt={`Ảnh chân dung - ${info.name || "Người dùng"}`}
              className="pf-avatar-img"
            />
          </div>
          
        </div>

        {/* Cột phải: các trường thông tin */}
        <div className="pf-right">
          <div className="pf-form">
            <Field
              label="Họ và tên"
              value={editing ? draft.name : info.name}
              readOnly={!editing}
              onChange={(v) => updateField("name", v)}
            />
            <Field
              label="MSSV/Mã"
              value={editing ? draft.id : info.id}
              readOnly={!editing}
              onChange={(v) => updateField("id", v)}
            />
            {/* Khi chỉnh sửa, dùng input type="date" (ISO). Khi xem, hiển thị dd/mm/yyyy */}
            <Field
              label="Ngày sinh"
              value={editing ? (draft.dob || "") : formatDate(info.dob)}
              readOnly={!editing}
              onChange={(v) => updateField("dob", v)}
              type={editing ? "date" : "text"}
            />
            <Field
              label="Email"
              value={editing ? draft.email : info.email}
              readOnly={!editing}
              onChange={(v) => updateField("email", v)}
              type="email"
            />
            <Field
              label="Địa chỉ"
              value={editing ? draft.address : info.address}
              readOnly={!editing}
              onChange={(v) => updateField("address", v)}
            />
            <Field
              label="GPA"
              value={editing ? draft.gpa : info.gpa}
              readOnly={!editing}
              onChange={(v) => updateField("gpa", v)}
            />
          </div>

          <div className="pf-actions">
            {!editing ? (
              <button className="pf-edit" type="button" onClick={onEdit}>
                CHỈNH SỬA
              </button>
            ) : (
              <div className="pf-edit-group">
                <button className="pf-save" type="button" onClick={onSave}>
                  LƯU
                </button>
                <button className="pf-cancel" type="button" onClick={onCancel}>
                  HỦY
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="pf-error" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------- Subcomponents / helpers ------- */

function Field({ label, value, readOnly, onChange, type = "text" }) {
  return (
    <div className="pf-field">
      <div className="pf-label">{label}:</div>
      <input
        className={`pf-input ${readOnly ? "is-readonly" : ""}`}
        value={value ?? ""}
        onChange={(e) => !readOnly && onChange?.(e.target.value)}
        readOnly={readOnly}
        type={type}
      />
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
