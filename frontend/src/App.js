import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import store from "./store/store";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Chatbot from "./Components/Chatbot/Chatbot";
import { useWebSocket } from "./hooks/useWebSocket";

import Login from "./Pages/Login/Login";


//Notification
import NotificationSystem from "./Pages/NotificationSystem/NotificationSystem";

// Dashboards
import StudentDashboard from "./Pages/Dashboards/StudentDashboard/StudentDashboard";
import TutorDashboard from "./Pages/Dashboards/TutorDashboard/TutorDashboard";
import TruongKhoaDashboard from "./Pages/Dashboards/TruongKhoaDashboard/TruongKhoaDashboard";
import AdminDashboard from "./Pages/Dashboards/AdminDashboard/AdminDashboard";
import OAADashboard from "./Pages/Dashboards/OAADashboard/OAADashboard";
import OSADashboard from "./Pages/Dashboards/OSADashboard/OSADashboard";

// Library
import Library  from "./Pages/Library/Library";


// Profile 
import Profile from "./Pages/Profile/Profile";





//OAA Report
import OAAReport from "./Pages/OAAReportDashBoard/OAAReport";
// Admin Approval
import TutorCandidateApproval from "./Pages/ADMIN_TutorCandidateApproval/TutorCandidateApproval";
// TBM Tutor Request
import TutorRequestPage from "./Pages/TBM_TutorRequestPage/TutorRequestPage";

//DRLAssesment
import DRLAssessment from "./Pages/DRLAssessment/DRLAssessment";
//Roadmap manage
import RoadmapManage from "./Pages/RoadmapManage/RoadmapManage";

//AdminReportOAA
import AdminReportOAA from "./Pages/Admin_Report_OAA/AdminReport";

// Component to initialize WebSocket
function AppContent() {
  // Initialize WebSocket connection (will only connect if token exists)
  useWebSocket();
  const location = useLocation();
  const hideChrome = ["/"].includes(location.pathname);

  return (
    <>
      <div className="app-shell">
        {/* Toast Container */}
        <ToastContainer />
        
        {/* Navbar luôn ở trên */}
        {!hideChrome && <Navbar />}

        {/* Nội dung chính */}
        <main className="app-main">
          <Routes>
            {/* Trang mặc định: Login */}
            <Route path="/" element={<Login />} />
            

            {/* Dashboards cố định cho từng role */}
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/tutor" element={<TutorDashboard />} />
            <Route path="/dashboard/truongkhoa" element={<TruongKhoaDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/oaa" element={<OAADashboard />} />
            <Route path="/dashboard/osa" element={<OSADashboard />} />

            {/* Library */}
            <Route path="/dashboard/student/library" element={<Library />} />
            <Route path="/dashboard/tutor/library" element={<Library />} />





            {/* Profile động theo role (QUAN TRỌNG) */}
            <Route path="/dashboard/:role/profile" element={<Profile />} />

            

            
  

            {/* Notification */}
            <Route path="/dashboard/:role/notification" element={<NotificationSystem />} />
            {/* OSA */}
            <Route path="/dashboard/osa/xet_diem_ren_luyen" element={<DRLAssessment/>}/>


            {/*Trí*/}
            {/* OAA Report*/}
            <Route path="/dashboard/oaa/report" element={<OAAReport />} />
            <Route path="/dashboard/admin/report" element={<AdminReportOAA />} />
            {/* Admin Approval */}
            <Route path="/dashboard/admin/tutor-approval" element={<TutorCandidateApproval />} />
            {/* TBM Tutor Request */}
            <Route path="/dashboard/truongkhoa/tutor-requests" element={<TutorRequestPage />} />
            {/* Roadmap manage */}
            <Route path="/dashboard/truongkhoa/roadmap-manage" element={<RoadmapManage />} />





            {/* Bắt mọi route lạ */}
            <Route path="*" element={<Navigate to="/" replace />} />

            
          </Routes>
        </main>

        {/* Footer dính đáy */}
        {!hideChrome && <Footer />}
      </div>

      {/* AI Chatbot - floating button */}
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
