// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "./CourseDetail.css";
// import { tutorsAPI, meetingsAPI } from "../../api";

// export default function CourseDetail() {
//   const { id } = useParams(); 
//   const navigate = useNavigate();
  
//   const [tutor, setTutor] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [booking, setBooking] = useState(false);

//   // 1. Fetch Tutor Detail & Availability
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Calls GET /tutors/{id}
//         const data = await tutorsAPI.getTutorById(id); 
        
//         setTutor(data);
        
//         // FIX: Extract the array from the response object
//         // If availabilitySlots is undefined, default to empty array []
//         console.log(data.availabilitySlots);
//         setSlots(data.availabilitySlots || []); 
        
//       } catch (error) {
//         console.error("Error fetching details", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [id]);

//   // 2. Handle Booking Action
//   const handleBook = async (slotId) => {
//     if (!window.confirm("Bạn có chắc muốn đặt lịch vào khung giờ này?")) return;
    
//     setBooking(true);
//     try {
//       await meetingsAPI.book({
//         tutorId: parseInt(id),
//         slotId: slotId,
//         topic: "Đặt lịch qua hệ thống" 
//       });
//       alert("Đặt lịch thành công! Vui lòng chờ Tutor xác nhận.");
//       navigate("/dashboard/student");
//     } catch (error) {
//       alert("Đặt lịch thất bại: " + (error.message || "Lỗi server"));
//     } finally {
//       setBooking(false);
//     }
//   };

//   if (loading) return <div className="loading">Đang tải thông tin...</div>;
//   if (!tutor) return <div className="error">Không tìm thấy Tutor</div>;

//   return (
//     <div className="cd-container">
//       <div className="cd-header">
//         <h1>{tutor.user?.fullName}</h1>
//         <div className="cd-bio">
//           <h3>Giới thiệu</h3>
//           <p>{tutor.bio}</p>
//         </div>
//         <div className="cd-expertise">
//           <h3>Chuyên môn:</h3>
//           {tutor.expertise?.map((ex, i) => <span key={i} className="badge">{ex}</span>)}
//         </div>
//       </div>

//       <div className="cd-slots">
//         <h2>📅 Lịch Rảnh (Availability)</h2>
//         <div className="slots-grid">
//           {/* FIX: Now 'slots' is definitely an array, so .filter works */}
//           {slots.filter(s => !s.isBooked).map((slot) => (
//             <div key={slot.id} className="slot-card">
//               <div className="slot-time">
//                 {new Date(slot.startTime).toLocaleDateString('vi-VN')} <br/>
//                 <strong>
//                   {new Date(slot.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
//                   {" - "} 
//                   {new Date(slot.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
//                 </strong>
//               </div>
//               <button 
//                 className="btn-book"
//                 disabled={booking}
//                 onClick={() => handleBook(slot.id)}
//               >
//                 {booking ? "Đang xử lý..." : "Đặt Lịch Ngay"}
//               </button>
//             </div>
//           ))}
          
//           {slots.filter(s => !s.isBooked).length === 0 && (
//             <div className="no-slots">
//               Tutor này hiện chưa có lịch rảnh. 
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// src/Pages/Register/CourseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./CourseDetail.css";
import { tutorsAPI, meetingsAPI } from "../../api";

export default function CourseDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [bookingSlotId, setBookingSlotId] = useState(null); // ID of slot being booked
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await tutorsAPI.getTutorById(id); 
        setTutor(data);
        setSlots(data.availabilitySlots || []); 
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Open Modal
  const openBookingModal = (slotId) => {
    setBookingSlotId(slotId);
    setTopic(""); // Reset topic
  };

  // 3. Submit Booking
  const handleConfirmBooking = async () => {
    if (!topic.trim()) {
      alert("Vui lòng nhập chủ đề buổi học!");
      return;
    }

    setIsSubmitting(true);
    try {
      await meetingsAPI.book({
        tutorId: parseInt(id),
        slotId: bookingSlotId,
        topic: topic 
      });
      alert("Đặt lịch thành công! Vui lòng chờ Tutor xác nhận.");
      navigate("/dashboard/student");
    } catch (error) {
      alert("Đặt lịch thất bại: " + (error.message || "Lỗi server"));
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="cd"><div className="cd-title">Đang tải thông tin...</div></div>;
  if (!tutor) return <div className="cd"><div className="cd-title">Không tìm thấy Tutor</div></div>;

  return (
    <div className="cd">
      {/* --- HEADER SECTION --- */}
      <h1 className="cd-title">
        {tutor.user?.fullName} 
        {/* Rating Badge */}
        <span style={{ fontSize: "0.6em", marginLeft: "10px", color: "#f59e0b", verticalAlign: "middle", background: "#fffbeb", padding: "4px 8px", borderRadius: "8px", border: "1px solid #fcd34d" }}>
          ⭐ {tutor.averageRating ? Number(tutor.averageRating).toFixed(1) : "N/A"}/5.0
        </span>
      </h1>

      <div className="cd-panel">
        {/* --- TUTOR INFO --- */}
        <section className="cd-section">
          <h3 className="cd-section-title">Giới thiệu</h3>
          <p className="cd-desc">{tutor.bio || "Chưa có giới thiệu."}</p>
        </section>

        <section className="cd-section">
          <h3 className="cd-section-title">Chuyên môn</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tutor.expertise?.map((ex, i) => (
              <span key={i} style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "16px", fontSize: "0.9rem", fontWeight: "600" }}>
                {ex}
              </span>
            ))}
          </div>
        </section>

        {/* --- SCHEDULE TABLE --- */}
        <section className="cd-section" style={{ marginTop: '24px' }}>
          <h3 className="cd-section-title">📅 Lịch Rảnh (Availability)</h3>
          
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th style={{ width: '150px' }}>Trạng thái</th>
                  <th className="cd-col-action">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {slots.filter(s => !s.isBooked).length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: "30px", color: "#64748b" }}>
                      Hiện tại Tutor chưa có lịch rảnh nào.
                    </td>
                  </tr>
                ) : (
                  slots.filter(s => !s.isBooked).map((slot) => {
                    const startDate = new Date(slot.startTime);
                    const endDate = new Date(slot.endTime);
                    return (
                      <tr key={slot.id}>
                        <td>
                          <div className="cd-when">
                            <span className="cd-day">
                              {startDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="cd-time">
                              {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} 
                              {" - "} 
                              {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td>
                           <span style={{ color: "#16a34a", fontWeight: "bold" }}>Còn trống</span>
                        </td>
                        <td className="cd-col-action">
                          <button 
                            className="cd-btn"
                            onClick={() => openBookingModal(slot.id)}
                          >
                            Đặt Lịch
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="cd-footer-actions">
          <Link to="/register" className="cd-back">← Quay lại danh sách</Link>
        </div>
      </div>

      {/* --- BOOKING MODAL (Simple Inline Style) --- */}
      {bookingSlotId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#1e3a8a' }}>Xác nhận đặt lịch</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Vui lòng nhập chủ đề bạn muốn học:</p>
            
            <textarea
              style={{
                width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                minHeight: '80px', margin: '10px 0', fontFamily: 'inherit'
              }}
              placeholder="VD: Ôn tập Đại số tuyến tính chương 3..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              autoFocus
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                onClick={() => setBookingSlotId(null)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', 
                  background: 'white', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none', 
                  background: isSubmitting ? '#93c5fd' : '#2563eb', color: 'white', cursor: 'pointer', fontWeight: '600'
                }}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}