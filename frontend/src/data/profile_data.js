// src/data/profile_data.js
import avatar from "../Components/Assets/avatar_profile.jpg";

export const PROFILES = {
  student: {
    name: "Nguyễn Văn A",
    id: "2212345",
    dob: "2004-08-15",
    email: "student@hcmut.edu.vn",
    address: "KTX Khu A, Thủ Đức, TP.HCM",
    gpa: "3.55 / 4.00",
    avatar, // dùng chung avatar
  },
  tutor: {
    name: "Trần Thị B",
    id: "TUT-102",
    dob: "1999-02-20",
    email: "tutor@hcmut.edu.vn",
    address: "268 Lý Thường Kiệt, Q.10, TP.HCM",
    gpa: "N/A",
    avatar,
  },
  truongkhoa: {
    name: "PGS.TS. Lê Văn C",
    id: "TK-EE-01",
    dob: "1975-11-12",
    email: "truongkhoa@hcmut.edu.vn",
    address: "Phòng làm việc: Văn phòng Khoa",
    gpa: "N/A",
    avatar,
  },
  admin: {
    name: "Quản trị hệ thống",
    id: "SYS-ADMIN",
    dob: "1990-01-01",
    email: "admin@hcmut.edu.vn",
    address: "Trung tâm CNTT HCMUT",
    gpa: "N/A",
    avatar,
  },
  oaa: {
    name: "Phòng Đào tạo (OAA)",
    id: "OAA-TEAM",
    dob: "1990-01-01",
    email: "oaa@hcmut.edu.vn",
    address: "Phòng OAA, 268 Lý Thường Kiệt",
    gpa: "N/A",
    avatar,
  },
  osa: {
    name: "Phòng CTSV (OSA)",
    id: "OSA-TEAM",
    dob: "1990-01-01",
    email: "osa@hcmut.edu.vn",
    address: "Phòng OSA, 268 Lý Thường Kiệt",
    gpa: "N/A",
    avatar,
  },
};
