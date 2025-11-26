import React from "react";
import "./AdminDashboard.css";
import Card from "../../../Components/Card/Card";
import pencilIcon from "../../../Components/Assets/check-solid-full.svg";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="td">
      {/* Tiêu đề */}
      <div className="td-title-wrap">
        <h1 className="td-title">Bảng điều khiển</h1>
      </div>

      {/* Panel nội dung */}
      <div className="td-panel">
        <div className="td-grid">
          <Link to="/dashboard/admin/tutor-approval" className="td-card-link">
            <Card
              title="Duyệt giảng viên"
              icon={pencilIcon}
              iconColor="#01D63A"
              iconSize={120}
            />
          </Link>

          <Link to="/dashboard/oaa/report" className="td-card-link">
            <Card
              title="Báo cáo OAA"
              icon={pencilIcon}
              iconColor="#667eea"
              iconSize={120}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
