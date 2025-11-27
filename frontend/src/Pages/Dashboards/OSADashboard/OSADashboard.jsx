import React from "react";
import "./OSADashboard.css";
import Card from "../../../Components/Card/Card";
import pencilIcon from "../../../Components/Assets/pen-to-square-solid-full.svg";
import { Link } from "react-router-dom";

export default function OSADashboard() {
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
            <Link to="/drl" className="td-card-link">
              <Card
                title="Xét điểm rèn luyện"
                icon={pencilIcon}
                iconColor="#FF0004"   
                iconSize={120}         
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}