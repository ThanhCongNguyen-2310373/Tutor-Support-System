import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetail.css";
import { tutorsAPI, meetingsAPI } from "../../api";

export default function CourseDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // 1. Fetch Tutor Detail & Availability
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calls GET /tutors/{id}
        const data = await tutorsAPI.getTutorById(id); 
        
        setTutor(data);
        
        // FIX: Extract the array from the response object
        // If availabilitySlots is undefined, default to empty array []
        setSlots(data.availabilitySlots || []); 
        
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Handle Booking Action
  const handleBook = async (slotId) => {
    if (!window.confirm("Bạn có chắc muốn đặt lịch vào khung giờ này?")) return;
    
    setBooking(true);
    try {
      await meetingsAPI.book({
        tutorId: parseInt(id),
        slotId: slotId,
        topic: "Đặt lịch qua hệ thống" 
      });
      alert("Đặt lịch thành công! Vui lòng chờ Tutor xác nhận.");
      navigate("/dashboard/student");
    } catch (error) {
      alert("Đặt lịch thất bại: " + (error.message || "Lỗi server"));
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading">Đang tải thông tin...</div>;
  if (!tutor) return <div className="error">Không tìm thấy Tutor</div>;

  return (
    <div className="cd-container">
      <div className="cd-header">
        <h1>{tutor.user?.fullName}</h1>
        <div className="cd-bio">
          <h3>Giới thiệu</h3>
          <p>{tutor.bio}</p>
        </div>
        <div className="cd-expertise">
          <h3>Chuyên môn:</h3>
          {tutor.expertise?.map((ex, i) => <span key={i} className="badge">{ex}</span>)}
        </div>
      </div>

      <div className="cd-slots">
        <h2>📅 Lịch Rảnh (Availability)</h2>
        <div className="slots-grid">
          {/* FIX: Now 'slots' is definitely an array, so .filter works */}
          {slots.filter(s => !s.isBooked).map((slot) => (
            <div key={slot.id} className="slot-card">
              <div className="slot-time">
                {new Date(slot.startTime).toLocaleDateString('vi-VN')} <br/>
                <strong>
                  {new Date(slot.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
                  {" - "} 
                  {new Date(slot.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                </strong>
              </div>
              <button 
                className="btn-book"
                disabled={booking}
                onClick={() => handleBook(slot.id)}
              >
                {booking ? "Đang xử lý..." : "Đặt Lịch Ngay"}
              </button>
            </div>
          ))}
          
          {slots.filter(s => !s.isBooked).length === 0 && (
            <div className="no-slots">
              Tutor này hiện chưa có lịch rảnh. 
            </div>
          )}
        </div>
      </div>
    </div>
  );
}