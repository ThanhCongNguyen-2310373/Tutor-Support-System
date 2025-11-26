import React from "react";
import "./TruongKhoaDashboard.css";
import Card from "../../../Components/Card/Card";
import pencilIcon from "../../../Components/Assets/user-tag-solid-full.svg";
import { Link } from "react-router-dom";

export default function TruongKhoaDashboard() {
  return (
    <div className="td">
      {/* Tiêu đề */}
      <div className="td-title-wrap">
        <h1 className="td-title">Bảng điều khiển</h1>
      </div>

      {/* Panel nội dung */}
      <div className="td-panel">
        <div className="td-grid">
          <div className="td-card-center">
            <Link to="/dashboard/truongkhoa/tutor-requests" className="td-card-link">
              <Card
                title="Đề xuất giảng viên"
                icon={pencilIcon}
                iconColor="#FF7051"   // màu icon (tuỳ chỉnh)
                iconSize={120}         // kích thước icon (tuỳ chỉnh)
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
