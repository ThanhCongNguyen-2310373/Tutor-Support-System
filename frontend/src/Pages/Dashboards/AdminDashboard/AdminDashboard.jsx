import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  }, []);

  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Quản trị hệ thống</h2>
        <div className="sidebar-actions">
          <Link to="/dashboard/admin/tutor-approval" className="sidebar-item">
            <span className>Duyệt giảng viên</span>
          </Link>
          <Link to="/dashboard/oaa/report" className="sidebar-item">
            <span className>Báo cáo OAA</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT - SLIDE FADE */}
      <main className="admin-main-content">
        <div className="logo-wrapper">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index + 1}`}
              className={`admin-big-logo ${index === currentIndex ? "active" : ""}`}
            />
          ))}
          <h1 className="welcome-text">Chào mừng Quản trị viên</h1>
          <p className="subtitle">Hệ thống hỗ trợ Tutor - Đại học Bách Khoa TP.HCM</p>
        </div>
      </main>

      <style jsx>{`
        .admin-dashboard-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', sans-serif;
        }

        .admin-sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 40px 20px;
          position: sticky;
          top: 0;
          height: 100vh;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
        }

        .sidebar-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e40af;
          margin-bottom: 40px;
          text-align: center;
        }

        .sidebar-actions {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border-radius: 14px;
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          background: #f8fafc;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .sidebar-item:hover:not(.disabled) {
          background: #e0e7ff;
          border-color: #6366f1;
          color: #4f46e5;
          transform: translateX(10px);
        }

        .sidebar-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sidebar-item .icon {
          font-size: 2.2rem;
        }

        .sidebar-item .label {
          font-size: 1.1rem;
        }

        .admin-main-content {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          position: relative;
        }

        .logo-wrapper {
          text-align: center;
          position: relative;
        }

        /* SLIDE FADE IMAGES */
        .admin-big-logo {
          width: 600px;
          max-width: 90vw;
          height: auto;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 1s ease-in-out, transform 1s ease-in-out;
          filter: drop-shadow(0 15px 40px rgba(0,0,0,0.15));
          border-radius: 20px;
        }

        .admin-big-logo.active {
          opacity: 1;
          transform: translateX(-50%) scale(1.02);
        }

        .welcome-text {
          font-size: 2.8rem;
          font-weight: 900;
          color: #1e40af;
          margin-top: 500px; /* đẩy text xuống dưới ảnh lớn */
        }

        .subtitle {
          font-size: 1.3rem;
          color: #64748b;
          font-weight: 500;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .admin-dashboard-container {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            height: auto;
            padding: 24px;
            position: static;
          }
          .sidebar-actions {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
          }
          .sidebar-item {
            flex: 1;
            min-width: 200px;
          }
        }

        @media (max-width: 640px) {
          .welcome-text {
            font-size: 2.2rem;
            margin-top: 500px;
          }
          .admin-big-logo {
            width: 90vw;
          }
        }
      `}</style>
    </div>
  );
}
