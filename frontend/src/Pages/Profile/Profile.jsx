// src/Pages/Profile/Profile.jsx
import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  }, []);

  if (!user) {
    return (
      <div className="pf">
        <div
          className="pf-panel"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          Đang tải thông tin...
        </div>
      </div>
    );
  }

  // Sinh viên: mssv là toàn số
  const isStudent = user.mssv && /^\d+$/.test(user.mssv);

  // Tutor
  const isTutor = user.role === "TUTOR" && user.tutorProfile;

  const hasAvatar = !!user.avatarUrl;

  return (
    <div className="pf">
      <h1 className="pf-title">Hồ sơ của tôi</h1>

      <div className="pf-panel">
        {/* LEFT COLUMN */}
        <div className="pf-left">
          <div className="pf-avatar">
            {hasAvatar ? (
              <img
                src={user.avatarUrl}
                alt={`Avatar - ${user.fullName}`}
                className="pf-avatar-img"
              />
            ) : (
              <div className="pf-avatar-placeholder">
                <div className="pf-avatar-circle">
                  <div className="pf-avatar-head" />
                  <div className="pf-avatar-body" />
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
<span className="status-badge">
  {user.role}
</span>

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="pf-right">
          <div className="pf-form">
            <Field label="Họ và tên" value={user.fullName} />

            {/* Dynamic Label: MSSV vs MSCB */}
            <Field label={isStudent ? "MSSV" : "MSCB"} value={user.mssv} />

            <Field label="Email" value={user.email} />
            <Field
              label="Số điện thoại"
              value={user.phoneNumber || "Chưa cập nhật"}
            />

            {/* Conditional Display: Class is hidden if not a student */}
            {isStudent ? (
              <div className="pf-row-split">
                <Field label="Khoa" value={user.department} />
                <Field label="Lớp" value={user.studentClass} />
              </div>
            ) : (
              <Field label="Khoa/Phòng ban" value={user.department} />
            )}

            {/* GPA: Only show if student */}
            {isStudent && (
              <Field
                label="GPA"
                value={user.gpa ? parseFloat(user.gpa).toFixed(2) : "N/A"}
              />
            )}

            {/* TUTOR SECTION */}
            {isTutor && (
              <>
                <div className="pf-section-divider"></div>
                <h3 className="pf-section-header">Thông tin Gia sư</h3>

                <Field
                  label="Giới thiệu (Bio)"
                  value={user.tutorProfile.bio}
                />

                <div className="pf-field">
                  <div className="pf-label">Chuyên môn:</div>
                  <div className="pf-tags-wrapper">
                    {user.tutorProfile.expertise?.map((skill, index) => (
                      <span key={index} className="pf-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <Field
                  label="Đánh giá trung bình"
                  value={`${parseFloat(
                    user.tutorProfile.averageRating
                  ).toFixed(2)} / 5.0`}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="pf-field">
      <div className="pf-label">{label}:</div>
      <input
        className="pf-input is-readonly"
        value={value ?? ""}
        readOnly
        disabled
      />
    </div>
  );
}
