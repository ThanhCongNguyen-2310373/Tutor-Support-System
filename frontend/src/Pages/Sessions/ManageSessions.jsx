import React, { useEffect, useState } from "react";
import "./ManageSessions.css";
import { meetingsAPI } from "../../api.js"; // Import real API

export default function ManageSessions() {
  const [pending, setPending] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data from Backend on Mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Pending
      const pendingData = await meetingsAPI.getMyMeetings('PENDING');
      // Fetch Confirmed
      const confirmedData = await meetingsAPI.getMyMeetings('CONFIRMED');
      
      // Ensure data is array (handle potential API errors)
      setPending(Array.isArray(pendingData) ? pendingData : []);
      setConfirmed(Array.isArray(confirmedData) ? confirmedData : []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Actions using Real APIs
  const onAccept = async (meetingId) => {
    try {
      await meetingsAPI.confirm(meetingId);
      alert("Đã chấp nhận yêu cầu!");
      fetchData(); // Reload data to update UI
    } catch (error) {
      alert("Lỗi khi chấp nhận");
    }
  };

  const onReject = async (meetingId) => {
    try {
      await meetingsAPI.reject(meetingId);
      alert("Đã từ chối yêu cầu!");
      fetchData(); // Reload data
    } catch (error) {
      alert("Lỗi khi từ chối");
    }
  };

  if (loading) return <div className="sess">Loading data...</div>;

  return (
    <div className="sess">
      <div className="sess-topnote">
        <span className="sess-linklike">Yêu cầu đang chờ xử lý</span>
        <span className="sess-right-title">Buổi học đã xác nhận</span>
      </div>

      <div className="sess-cols">
        {/* Pending Column */}
        <section className="sess-col">
          <div className="sess-col-title">
            📋 Yêu cầu ({pending.length})
          </div>
          {pending.map((meeting) => (
            <CardPending
              key={meeting.id}
              item={meeting} // We pass the backend object here
              onAccept={() => onAccept(meeting.id)}
              onReject={() => onReject(meeting.id)}
            />
          ))}
        </section>

        {/* Confirmed Column */}
        <section className="sess-col">
          <div className="sess-col-title">✅ Đã xác nhận</div>
          {confirmed.map((meeting) => (
            <CardConfirmed key={meeting.id} item={meeting} />
          ))}
        </section>
      </div>
    </div>
  );
}

// --- Updated Subcomponents to map Backend Data Structure ---

function CardPending({ item, onAccept, onReject }) {
  // Backend returns 'startTime' as ISO string. 
  // Schema change: Meeting has students[] (many-to-many)
  const students = item.students || [];
  const mainStudent = students[0];
  const studentName = mainStudent?.fullName || "Sinh viên";
  const studentCount = students.length;

  return (
    <article className="sess-card">
      <div className="sess-card-link">
        <header className="sess-card-head">
          <span className="i i-person">👤</span>
          <span className="sess-name">
            {studentName}
            {studentCount > 1 && ` +${studentCount - 1} người`}
          </span>
        </header>

        <ul className="sess-list">
          <li>
            <strong>Thời gian:</strong>{" "}
            {new Date(item.startTime).toLocaleString('vi-VN')}
          </li>
          <li>
            <strong>Chủ đề:</strong> {item.topic || "Không có"}
          </li>
        </ul>
      </div>

      <div className="sess-actions">
        <button className="btn btn_reject" onClick={onReject}>TỪ CHỐI</button>
        <button className="btn btn_accept" onClick={onAccept}>CHẤP NHẬN</button>
      </div>
    </article>
  );
}

function CardConfirmed({ item }) {
  const students = item.students || [];
  const mainStudent = students[0];
  const studentName = mainStudent?.fullName || "Sinh viên";
  const studentCount = students.length;

  return (
    <article className="sess-card sess-card--confirmed">
      <div className="sess-card-link">
        <header className="sess-card-head">
          <span className="i i-person">👤</span>
          <span className="sess-name">
            {studentName}
            {studentCount > 1 && ` +${studentCount - 1} người`}
          </span>
        </header>
        <ul className="sess-list">
          <li>
            <strong>Thời gian:</strong> {new Date(item.startTime).toLocaleString('vi-VN')}
          </li>
          <li>
             <strong>Chủ đề:</strong> {item.topic || "Không có"}
          </li>
        </ul>
      </div>
    </article>
  );
}