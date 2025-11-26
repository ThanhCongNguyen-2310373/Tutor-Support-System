import React from "react";
import "./Footer.css";
import logo from "../Assets/logo.png"; 

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-row">
        {/* Left */}
        <div className="footer-left">
          <div className="bk-badge">
            <img src={logo} alt="BK HCMUT" />
          </div>
          <div className="footer-left-text">
            <div className="footer-title">Về chúng tôi</div>
            <div className="footer-sub">
              King CNPM <br /> Semester 251
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="footer-right">
          <div className="footer-title">Thông tin liên lạc</div>
          <div className="footer-sub">
            king_cnpm@hcmut.edu.vn <br /> 0123456789
          </div>
        </div>
      </div>
    </footer>
  );
}
