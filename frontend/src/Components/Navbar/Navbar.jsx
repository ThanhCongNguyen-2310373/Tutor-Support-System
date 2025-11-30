// src/Components/Navbar/Navbar.jsx
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadCount } from "../../store/slices/notificationsSlice";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import avatar from "../Assets/avatar.png";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Fetch unread count on mount and poll every 30s (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  // ===== Ngữ cảnh trang hiện tại =====
  const isDashboardRoot = pathname.startsWith("/dashboard");

  const isRegisterList   = pathname === "/register";
  const isRegisterDetail = pathname.startsWith("/register/");
  const isRegister       =
    isRegisterList || isRegisterDetail || pathname === "/register/success";

  const isFeedbackList   = pathname === "/feedback";
  const isFeedbackDetail = pathname.startsWith("/feedback/");
  const isFeedback       = isFeedbackList || isFeedbackDetail;

  const isProfile        = /^\/dashboard\/[^/]+\/profile$/.test(pathname);

  // === CÁC TRANG ĐẶC BIỆT CẦN ĐỔI LABEL "CHỨC NĂNG" ===
  const isAdminTutorApproval = pathname === "/dashboard/admin/tutor-approval";
  const isTruongKhoaTutorReq =
    pathname === "/dashboard/truongkhoa/tutor-requests";
  const isOaaReport          = pathname === "/dashboard/oaa/report";
  const isAdminReport        = pathname === "/dashboard/admin/report";
  const isDRL                = pathname === "/dashboard/osa/xet_diem_ren_luyen";

  // Lấy role ưu tiên theo URL (nếu đang ở /dashboard)
  let urlRole = "";
  if (isDashboardRoot) {
    const seg = pathname.split("/").filter(Boolean); // ["dashboard","<role>", ...]
    urlRole = seg[1] || "";
  }

  // Fallback role từ localStorage
  const storedRole =
    (typeof window !== "undefined" && localStorage.getItem("dashRole")) || "";
  const role = urlRole || storedRole || "student";

  const base = `/dashboard/${role}`;

  // Các trang phụ thuộc base
  const isLibrary        = pathname === `${base}/library`;
  const isNotification   = pathname === `${base}/notification`;
  const isRoadmapManage  = pathname === `${base}/roadmap-manage`; // /dashboard/truongkhoa/roadmap-manage

  // Nhận diện trang SESSIONS (hỗ trợ cả /sessions và /dashboard/:role/sessions)
  const isSessionsStandalone =
    pathname === "/sessions" || pathname.startsWith("/sessions/");
  const isSessionsUnderRole  = pathname.startsWith(`${base}/sessions`);
  const isSessions           =
    isSessionsStandalone || isSessionsUnderRole;

  // Hiện menu khi ở một trong các trang chính
  const showMenu =
    isDashboardRoot ||
    isLibrary ||
    isRegister ||
    isFeedback ||
    isProfile ||
    isSessions ||
    isNotification ||
    isDRL;

  // ===== Active tab =====
  let active = "";
  if (pathname === base) {
    active = "home";
  } else if (isLibrary) {
    active = "library";
  } else if (isRegister) {
    active = "register";
  } else if (isFeedback) {
    active = "feedback";
  } else if (isSessions) {
    active = "sessions";
  } else if (isProfile) {
    active = "profile";
  } else if (isAdminTutorApproval) {
    active = "tutorApproval";
  } else if (isTruongKhoaTutorReq) {
    active = "tutorRequests";
  } else if (isOaaReport) {
    active = "oaaReport";
  } else if (isAdminReport) {
    active = "oaaReport"; // admin/report dùng chung key
  } else if (isRoadmapManage) {
    active = "roadmapManage";
  } else if (isDRL) {
    active = "drl";
  } else if (pathname.startsWith(`${base}/features`)) {
    active = "features";
  } else if (isNotification) {
    active = "announcements";
  }

  // ===== Tab giữa: đổi nhãn/đích theo trang hiện tại =====
  let middleLabel = "Chức năng";
  let middleTo    = base;       // mặc định = dashboard home
  let middleKey   = "features";

  if (isLibrary) {
    middleLabel = "Thư viện tài nguyên";
    middleTo    = `${base}/library`;
    middleKey   = "library";
  } else if (isRegister) {
    middleLabel = "Đăng ký khóa học";
    middleTo    = "/register";
    middleKey   = "register";
  } else if (isFeedback) {
    middleLabel = "Đánh giá khóa học";
    middleTo    = "/feedback";
    middleKey   = "feedback";
  } else if (isSessions) {
    middleLabel = "Quản lí buổi học";
    middleTo    = isSessionsUnderRole ? `${base}/sessions` : "/sessions";
    middleKey   = "sessions";
  } else if (isProfile) {
    middleLabel = "Hồ sơ người dùng";
    middleTo    = `${base}/profile`;
    middleKey   = "profile";
  } else if (isAdminTutorApproval) {
    middleLabel = "Duyệt giảng viên";
    middleTo    = "/dashboard/admin/tutor-approval";
    middleKey   = "tutorApproval";
  } else if (isTruongKhoaTutorReq) {
    middleLabel = "Đề xuất giảng viên";
    middleTo    = "/dashboard/truongkhoa/tutor-requests";
    middleKey   = "tutorRequests";
  } else if (isOaaReport) {
    middleLabel = "Báo cáo phân bổ";
    middleTo    = "/dashboard/oaa/report";
    middleKey   = "oaaReport";
  } else if (isAdminReport) {
    middleLabel = "Báo cáo phân bổ";
    middleTo    = "/dashboard/admin/report";
    middleKey   = "oaaReport";
  } else if (isRoadmapManage) {
    middleLabel = "Lộ trình học tập";
    middleTo    = `${base}/roadmap-manage`;
    middleKey   = "roadmapManage";
} else if (isDRL) {
  middleLabel = "Xét điểm rèn luyện";
  middleTo    = "/dashboard/osa/xet_diem_ren_luyen";
  middleKey   = "drl";
}


  // Logout: xóa dashRole và về trang login
  const handleLogout = (e) => {
    e.preventDefault();
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dashRole");
      }
    } catch {}
    navigate("/", { replace: true });
  };

  const ROLE_LABEL = {
    student: "Student",
    tutor: "Tutor",
    admin: "Admin",
    truongkhoa: "Trưởng bộ môn",
    oaa: "OAA",
    osa: "OSA"
  };
  const roleLabel = ROLE_LABEL[role] || role;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <img src={logo} alt="HCMUT" className="bk-mini" />

        {showMenu && (
          <>
            <ul className="nav-menu">
              {/* Trang chủ luôn có */}
              <li>
                <Link
                  to={base}
                  className={`nav-link ${active === "home" ? "is-active" : ""}`}
                >
                  Trang chủ
                </Link>
              </li>

              {/* Chỉ hiện tab giữa khi KHÔNG còn là "Chức năng" */}
              {middleLabel !== "Chức năng" && (
                <li>
                  <Link
                    to={middleTo}
                    className={`nav-link ${
                      active === middleKey ? "is-active" : ""
                    }`}
                  >
                    {middleLabel}
                  </Link>
                </li>
              )}

              {/* Thông báo luôn có */}
              <li>
                <Link
                  to={`${base}/notification`}
                  className={`nav-link nav-link-notification ${
                    active === "announcements" ? "is-active" : ""
                  }`}
                >
                  Thông báo
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            </ul>

            <div className="nav-actions">
              <a href="/" className="btn-logout" onClick={handleLogout}>
                Đăng xuất
              </a>

              <div className="nav-avatar">
                <Link to={`${base}/profile`} aria-label="Trang cá nhân">
                  <img src={avatar} alt="Tài khoản" className="avatar-img" />
                </Link>
                <div className="avatar-role">{roleLabel}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
