import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Login.css";
import logo from "../../Components/Assets/logo.png";
import { loginUser } from "../../store/slices/authSlice";
import { showError, showSuccess } from "../../utils/errorHandler";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [step, setStep] = useState("intro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGlobalClick = () => {
    if (error) setError("");
    if (step !== "form") setStep("form");
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
      <div className="login-container" onClick={(e) => e.stopPropagation()}>
        <h1 className="login-title">TUTOR SUPPORT SYSTEM AT HCMUT LOGIN</h1>

        <div className="login-hero">
          <img src={logo} alt="BK HCMUT" className="login-hero-logo" />
        </div>

        {step === "intro" ? (
          <button
            type="button"
            className="login-primary-btn"
            onClick={(e) => {
              e.stopPropagation();
              setStep("form");
            }}
            disabled={loading}
          >
            ĐĂNG NHẬP
          </button>
        ) : (
          <form
            className="login-form"
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={handleFormKeyDown}
            noValidate
          >
            <label className="login-label">
              Email:
              <input
                type="text"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="login-label">
              Mật khẩu:
              <input
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            <button
              type="button"
              onClick={doLogin}
              className="login-primary-btn-SSO"
              disabled={loading}
            >
              {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
            </button>
          </form>
        )}
      </div>

      {/* Dòng đăng ký – nằm ngoài khung xám */}
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

      {error && (
        <div className="login-error-banner" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
