import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./RegisterAccount.css";
import { registerUser } from "../../store/slices/authSlice";
import { showError, showSuccess } from "../../utils/errorHandler";

export default function RegisterAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    studentId: "",
    role: "STUDENT",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = "MSSV/ID là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      
      await dispatch(registerUser(registerData)).unwrap();
      
      showSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      showError(error.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="register-account-container">
      <div className="register-account-card">
        <h1 className="register-account-title">Đăng Ký Tài Khoản</h1>
        <p className="register-account-subtitle">
          Tạo tài khoản mới để sử dụng hệ thống Tutor Support
        </p>

        <form onSubmit={handleSubmit} className="register-account-form">
          <div className="form-group">
            <label htmlFor="fullName">Họ và Tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? "error" : ""}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="studentId">MSSV/ID</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={errors.studentId ? "error" : ""}
              placeholder="2211234"
            />
            {errors.studentId && <span className="error-text">{errors.studentId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="example@hcmut.edu.vn"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error" : ""}
              placeholder="Nhập lại mật khẩu"
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Vai trò</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="STUDENT">Sinh viên</option>
              <option value="TUTOR">Tutor</option>
            </select>
          </div>

          <button
            type="submit"
            className="register-account-btn"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>
        </form>

        <div className="register-account-footer">
          <p>
            Đã có tài khoản?{" "}
            <Link to="/" className="login-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
