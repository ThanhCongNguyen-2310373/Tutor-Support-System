// src/Pages/Login/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Login.css";
import logo from "../../Components/Assets/logo.png";
import A5 from "../../Components/Assets/A5.jpg";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser, registerUser } from "../../store/slices/authSlice";
import { showError, showSuccess } from "../../utils/errorHandler";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // ----- CHẾ ĐỘ: "login" | "register" -----
  const [mode, setMode] = useState("login");

  // ----- STATE ĐĂNG NHẬP -----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // ----- STATE ĐĂNG KÝ -----
  const [regFormData, setRegFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });
  const [regErrors, setRegErrors] = useState({});

  // ==========================
  // Ẩn banner khi bấm phím hoặc click bất kỳ đâu
  // ==========================
  useEffect(() => {
    if (!error) return; // chỉ gắn listener khi đang có lỗi

    const clearError = () => {
      setError("");
    };

    window.addEventListener("keydown", clearError);
    window.addEventListener("mousedown", clearError);

    return () => {
      window.removeEventListener("keydown", clearError);
      window.removeEventListener("mousedown", clearError);
    };
  }, [error]);

  // ==========================
  // ĐĂNG NHẬP
  // ==========================
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
      // unwrap() throws the error payload directly (string), not an object
      let errorMessage = typeof err === 'string' ? err : (err?.message || "Đăng nhập thất bại");
      
      //console.log('[Login error message]:', errorMessage); // Debug log
      
      // Map English error messages to Vietnamese - check exact message from backend
      if (errorMessage.includes('User not found') || errorMessage.includes('Incorrect password') || errorMessage.includes('Password is required')) {
        errorMessage = "Email hoặc mật khẩu không chính xác";
      }
      
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleLoginFormKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doLogin();
    }
  };

  // ==========================
  // ĐĂNG KÝ
  // ==========================
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateRegisterForm = () => {
    const errs = {};

    if (!regFormData.fullName.trim()) {
      errs.fullName = "Vui lòng nhập họ và tên";
    }

    if (!regFormData.studentId.trim()) {
      errs.studentId = "Vui lòng nhập MSSV/ID";
    }

    if (!regFormData.email.trim()) {
      errs.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@hcmut\.edu\.vn$/.test(regFormData.email)) {
      errs.email = "Email phải có định dạng @hcmut.edu.vn";
    }

    if (!regFormData.password) {
      errs.password = "Vui lòng nhập mật khẩu";
    } else if (regFormData.password.length < 6) {
      errs.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!regFormData.confirmPassword) {
      errs.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (regFormData.confirmPassword !== regFormData.password) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return errs;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegisterForm();
    setRegErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const { confirmPassword, ...registerData } = regFormData;
      await dispatch(registerUser(registerData)).unwrap();

      showSuccess(
        "Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục."
      );

      // chuyển về chế độ đăng nhập, điền sẵn email vừa đăng ký
      setEmail(regFormData.email);
      setPassword("");
      setMode("login");

      // reset form đăng ký
      setRegFormData({
        fullName: "",
        studentId: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
      });
      setRegErrors({});
    } catch (err) {
      console.error("Register error:", err);
      // unwrap() throws the error payload directly (string), not an object
      let msg = typeof err === 'string' ? err : (err?.message || "Đăng ký thất bại, vui lòng thử lại.");
      
      console.log('[Register error message]:', msg); // Debug log
      
      // Map English error messages to Vietnamese - check exact message from backend
      if (msg.includes('already registered in the system') || msg.includes('User already registered')) {
        msg = "Email đã được sử dụng";
      } else if (msg.includes('not found in external system')) {
        msg = "Thông tin người dùng không tồn tại trong hệ thống";
      }
      
      showError(msg);
    }
  };

  const switchToRegister = () => {
    setMode("register");
    setError("");
  };

  const switchToLogin = () => {
    setMode("login");
    setRegErrors({});
  };

  return (
    <div className="login">
      <div className="login-container">
        {/* Cột bên trái: form */}
        <div className="login-left">
          {mode === "login" ? (
            <>
              <div className="login-left-header">
                <div className="login-logo-row">
                  <img src={logo} alt="BK HCMUT" className="login-logo-small" />
                  <div className="login-logo-text">
                    <div className="login-logo-title">HỆ THỐNG HỖ TRỢ TUTOR</div>
                    <div className="login-logo-sub">
                      TRƯỜNG ĐH BÁCH KHOA - HCMUT
                    </div>
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
                onKeyDown={handleLoginFormKeyDown}
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
                      {showPassword ? (
                        <FiEye size={18} />
                      ) : (
                        <FiEyeOff size={18} />
                      )}
                    </button>
                  </div>
                </label>

                <button
                  type="button"
                  className="login-primary-btn-SSO"
                  onClick={doLogin}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>

              <div className="login-register-hint">
                Chưa có tài khoản?
                <button
                  type="button"
                  className="login-register-link"
                  onClick={switchToRegister}
                >
                  Đăng ký ngay
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="login-left-header">
                <div className="login-logo-row">
                  <img src={logo} alt="BK HCMUT" className="login-logo-small" />
                  <div className="login-logo-text">
                    <div className="login-logo-title">HỆ THỐNG HỖ TRỢ TUTOR</div>
                    <div className="login-logo-sub">
                      TRƯỜNG ĐH BÁCH KHOA - HCMUT
                    </div>
                  </div>
                </div>

                <h1 className="login-heading">Đăng ký tài khoản</h1>
                <p className="login-subtitle">
                  Vui lòng điền đầy đủ thông tin để tạo tài khoản mới.
                </p>
              </div>

              <form
                className="login-form"
                onSubmit={handleRegisterSubmit}
                noValidate
              >
                <label className="login-label">
                  Họ và tên
                  <input
                    type="text"
                    name="fullName"
                    className="login-input"
                    value={regFormData.fullName}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    placeholder="Nhập họ và tên"
                  />
                  {regErrors.fullName && (
                    <div className="login-field-error">
                      {regErrors.fullName}
                    </div>
                  )}
                </label>

                <label className="login-label">
                  MSSV / ID
                  <input
                    type="text"
                    name="studentId"
                    className="login-input"
                    value={regFormData.studentId}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    placeholder="Nhập MSSV hoặc ID"
                  />
                  {regErrors.studentId && (
                    <div className="login-field-error">
                      {regErrors.studentId}
                    </div>
                  )}
                </label>

                <label className="login-label">
                  Email
                  <input
                    type="email"
                    name="email"
                    className="login-input"
                    value={regFormData.email}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    placeholder="Nhập email của bạn"
                  />
                  {regErrors.email && (
                    <div className="login-field-error">{regErrors.email}</div>
                  )}
                </label>

                <label className="login-label">
                  Mật khẩu
                  <input
                    type="password"
                    name="password"
                    className="login-input"
                    value={regFormData.password}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    placeholder="Nhập mật khẩu"
                  />
                  {regErrors.password && (
                    <div className="login-field-error">
                      {regErrors.password}
                    </div>
                  )}
                </label>

                <label className="login-label">
                  Xác nhận mật khẩu
                  <input
                    type="password"
                    name="confirmPassword"
                    className="login-input"
                    value={regFormData.confirmPassword}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {regErrors.confirmPassword && (
                    <div className="login-field-error">
                      {regErrors.confirmPassword}
                    </div>
                  )}
                </label>

                <label className="login-label">
                  Vai trò
                  <select
                    name="role"
                    className="login-input"
                    value={regFormData.role}
                    onChange={handleRegisterChange}
                    disabled={loading}
                  >
                    <option value="STUDENT">Sinh viên</option>
                    <option value="TUTOR">Tutor</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="login-primary-btn-SSO"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
              </form>

              <div className="login-register-hint">
                Đã có tài khoản?
                <button
                  type="button"
                  className="login-register-link"
                  onClick={switchToLogin}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </>
          )}
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

      {mode === "login" && error && (
        <div className="login-error-banner" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
