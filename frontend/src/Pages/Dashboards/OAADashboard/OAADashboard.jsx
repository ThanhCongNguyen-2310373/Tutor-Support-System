import React from "react";
import "./OAADashboard.css";
import Card from "../../../Components/Card/Card";
import pencilIcon from "../../../Components/Assets/book-open-solid-full.svg";
import { Link } from "react-router-dom";

export default function OAADashboard() {
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
            <Link to="/dashboard/oaa/report" className="td-card-link">
              <Card
                title="Báo cáo phân bổ"
                icon={pencilIcon}
                iconColor="#FF0000"   // màu icon (tuỳ chỉnh)
                iconSize={120}         // kích thước icon (tuỳ chỉnh)
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
