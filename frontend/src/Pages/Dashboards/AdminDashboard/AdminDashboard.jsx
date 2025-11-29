import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

import h1 from "../../../Components/Assets/h1.jpg";
import h2 from "../../../Components/Assets/h2.jpg";
import h3 from "../../../Components/Assets/h3.jpg";
import h6 from "../../../Components/Assets/h6.jpg";

export default function AdminDashboard() {
  const images = [h1, h2, h3, h6];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 giây
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div>
          <h2 className="sidebar-title">Quản trị hệ thống</h2>
          <p className="sidebar-subtitle">
            Các tác vụ quan trọng dành cho Admin
          </p>
        </div>

        <div className="sidebar-actions">
          <Link
            to="/dashboard/admin/tutor-approval"
            className="sidebar-item"
          >
            <span className="sidebar-text">Duyệt giảng viên</span>
          </Link>

          <Link
            to="/dashboard/admin/report"
            className="sidebar-item"
          >
            <span className="sidebar-text">Báo cáo OAA</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-content">
        <div className="logo-wrapper">
          {/* Khu vực slide ảnh */}
          <div className="admin-slider">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className={`admin-big-logo ${
                  index === currentIndex ? "active" : ""
                }`}
              />
            ))}
          </div>

          <h1 className="welcome-text">Chào mừng Quản trị viên</h1>
          <p className="subtitle">
            Hệ thống hỗ trợ Tutor - Đại học Bách Khoa TP.HCM
          </p>
        </div>
      </main>
    </div>
  );
}
