import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import t1 from "../../../Components/Assets/h1.jpg";
import t2 from "../../../Components/Assets/h2.jpg";
import t3 from "../../../Components/Assets/h3.jpg";
import t4 from "../../../Components/Assets/h6.jpg";
import "./TruongKhoaDashboard.css";

export default function TruongKhoaDashboard() {
  const images = [t1, t2, t3, t4];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="tk-page">
      <div className="tk-container">
        {/* LEFT BLUE CARD – GIỐNG ADMIN */}
        <section className="tk-left">
          <div className="tk-left-header">
            <h2 className="tk-left-title">Quản lý khoa</h2>
            <p className="tk-left-sub">
              Các tác vụ quan trọng dành cho Trưởng khoa
            </p>
          </div>

          <div className="tk-left-actions">
            <Link
              to="/dashboard/truongkhoa/tutor-requests"
              className="tk-action-btn"
            >
              <span className="tk-action-text">Đề xuất giảng viên</span>
              <span className="tk-action-icon">›</span>
            </Link>

            <Link
              to="/dashboard/truongkhoa/roadmap-manage"
              className="tk-action-btn"
            >
              <span className="tk-action-text">Lộ trình môn học</span>
              <span className="tk-action-icon">›</span>
            </Link>
          </div>
        </section>

        {/* RIGHT BIG CARD – GIỐNG ADMIN */}
        <section className="tk-right">
          <div className="tk-right-card">
            <div className="tk-image-frame">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className={`tk-main-image ${
                    index === currentIndex ? "active" : ""
                  }`}
                />
              ))}
            </div>

            <div className="tk-right-text">
              <h1 className="tk-welcome">
                CHÀO MỪNG TRƯỞNG KHOA
              </h1>
              <p className="tk-subtitle">
                Hệ thống hỗ trợ Tutor - Đại học Bách Khoa TP.HCM
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
