import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Login.css";
import logo from "../../Components/Assets/logo.png";
import { loginUser } from "../../store/slices/authSlice";
import { showError, showSuccess } from "../../utils/errorHandler";
import A5 from "../../Components/Assets/A5.jpg";
import { FiEye, FiEyeOff } from "react-icons/fi";   // 👈 thêm

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);    // 👈 thêm

  const handleGlobalClick = () => {
    if (error) setError("");
  };

  const doLogin = async () => {
    if (!email.trim() || !password.trim()) {
      const msg = "Vui lòng nhập đầy đủ thông tin";
      setError(msg);
      showError(msg);
      return;
    }

    setError("");

    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();

      showSuccess("Đăng nhập thành công!");

      const role = response.user.role;
      localStorage.setItem("dashRole", role);

      if (role === "TUTOR") navigate("/dashboard/tutor");
      else if (role === "ADMIN") navigate("/dashboard/admin");
      else if (role === "OAA") navigate("/dashboard/oaa");
      else if (role === "OSA") navigate("/dashboard/osa");
      else if (role === "TBM") navigate("/dashboard/truongkhoa");
      else navigate("/dashboard/student");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Đăng nhập thất bại";
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doLogin();
    }
  };

  return (
    <div className="login" onClick={handleGlobalClick}>
      <div
        className="login-container"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Cột bên trái: form */}
        <div className="login-left">
          <div className="login-left-header">
            <div className="login-logo-row">
              <img src={logo} alt="BK HCMUT" className="login-logo-small" />
              <div className="login-logo-text">
                <div className="login-logo-title">HỆ THỐNG HỖ TRỢ TUTOR</div>
                <div className="login-logo-sub">TRƯỜNG ĐH BÁCH KHOA - HCMUT</div>
              </div>
            </div>

            <h1 className="login-heading">Chào mừng quay trở lại!</h1>
            <p className="login-subtitle">
              Vui lòng đăng nhập để tiếp tục sử dụng hệ thống.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={handleFormKeyDown}
            noValidate
          >
            <label className="login-label">
              Email
              <input
                type="text"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Nhập email của bạn"
              />
            </label>

            <label className="login-label">
              Mật khẩu
              {/* 👇 thêm wrapper + icon con mắt */}
              <div className="login-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input login-input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </button>
              </div>
            </label>

            <button
              type="button"
              onClick={doLogin}
              className="login-primary-btn-SSO"
              disabled={loading}
            >
              {loading ? "ĐANG XỬ LÝ..." : "Đăng nhập"}
            </button>
          </form>

          <div className="login-register-hint">
            <span>Chưa có tài khoản?</span>
            <button
              type="button"
              className="login-register-link"
              onClick={() => navigate("/register-account")}
            >
              Đăng ký ngay
            </button>
          </div>
        </div>

        {/* Cột bên phải: ảnh A5 full chiều cao */}
        <div className="login-right">
          <img src={A5} alt="Khuôn viên HCMUT" className="login-photo" />
          <div className="login-right-overlay" />
          <div className="login-right-caption">
            Trường Đại học Bách Khoa - ĐHQG TP.HCM
          </div>
        </div>
      </div>

      {error && (
        <div className="login-error-banner" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
