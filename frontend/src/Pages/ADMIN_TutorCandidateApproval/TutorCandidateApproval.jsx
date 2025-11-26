// // src/Pages/TutorCandidateApproval/TutorCandidateApproval.jsx
// import React, { useState, useEffect } from "react";
// import managementService from "../../api/management.service";
// import { showSuccess, showError } from "../../utils/errorHandler";
// import "./TutorCandidateApproval.css";

// export default function TutorCandidateApproval() {
//   const [candidates, setCandidates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCandidates, setSelectedCandidates] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filters, setFilters] = useState({
//     faculty: "",
//     semester: "",
//     class: "",
//   });
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [notification, setNotification] = useState({
//     show: false,
//     type: "",
//     message: "",
//     list: [],
//   });

//   useEffect(() => {
//     fetchApplications();
//   }, []);

//   const fetchApplications = async () => {
//     try {
//       setLoading(true);
//       const response = await managementService.getApplications({ status: 'PENDING' });
//       console.log(response);
//       setCandidates(response || []);
//     } catch (error) {
//       showError("Không thể tải danh sách ứng viên");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       setSelectedCandidates(candidates.map(c => c.id));
//     } else {
//       setSelectedCandidates([]);
//     }
//   };

//   const handleSelect = (id) => {
//     setSelectedCandidates(prev =>
//       prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
//     );
//   };

//   const handleApprove = () => {
//     const selected = candidates.filter(c => selectedCandidates.includes(c.id));
//     const hasLowGpa = selected.some(c => c.gpa < 2.5);

//     if (hasLowGpa) {
//       setNotification({
//         show: true,
//         type: "warning",
//         message: "",
//         list: selected.filter(c => c.gpa < 2.5),
//       });
//     } else {
//       setShowConfirmModal(true);
//     }
//   };

//   const confirmApprove = async () => {
//     setShowConfirmModal(false);
//     try {
//       await Promise.all(
//         selectedCandidates.map(id => managementService.approveApplication(id))
//       );
//       showSuccess(`Đã duyệt ${selectedCandidates.length} ứng viên!`);
//       setSelectedCandidates([]);
//       fetchApplications(); // Reload data
//     } catch (error) {
//       showError("Không thể duyệt ứng viên");
//       console.error(error);
//     }
//   };

//   const handleReject = async () => {
//     if (!window.confirm(`Bạn có chắc muốn từ chối ${selectedCandidates.length} ứng viên?`)) {
//       return;
//     }
//     try {
//       await Promise.all(
//         selectedCandidates.map(id => managementService.rejectApplication(id, 'Không đủ điều kiện'))
//       );
//       showSuccess(`Đã từ chối ${selectedCandidates.length} ứng viên!`);
//       setSelectedCandidates([]);
//       fetchApplications(); // Reload data
//     } catch (error) {
//       showError("Không thể từ chối ứng viên");
//       console.error(error);
//     }
//   };

//   const handleRefresh = () => {
//     setSearchTerm("");
//     setFilters({ faculty: "", semester: "", class: "" });
//     setSelectedCandidates([]);
//     fetchApplications();
//   };

//   if (loading) {
//     return (
//       <div className="tutor-approval-container">
//         <div className="tutor-approval-header">
//           <h1>Gửi yêu cầu tạo Tutor mới</h1>
//         </div>
//         <div className="tutor-approval-card">
//           <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
//             Đang tải...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Lọc theo search + filter
//   const filteredCandidates = candidates.filter(c => {
//     const matchesSearch =
//       c.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       c.student.mssv.includes(searchTerm) ||
//       c.student.department.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesFaculty = !filters.faculty || c.department === filters.faculty;
//     const matchesSemester = !filters.semester || c.semester === filters.semester;
//     const matchesClass = !filters.class || c.class === filters.class;

//     return matchesSearch && matchesFaculty && matchesSemester && matchesClass;
//   });

//   return (
//     <div className="tutor-approval-container">
//       <div className="tutor-approval-header">
//         <h1>Gửi yêu cầu tạo Tutor mới</h1>
//       </div>

//       <div className="tutor-approval-card">
//         {/* Toolbar với filter + search + refresh */}
//         <div className="tutor-approval-toolbar">
//           <div className="filter-group">
//             <div className="filter-box">
//               <label className="filter-label">Khoa</label>
//               <select
//                 value={filters.faculty}
//                 onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
//                 className="filter-input"
//               >
//                 <option value="">Tất cả</option>
//                 <option value="Cơ khí">Cơ khí</option>
//                 <option value="CNTT">CNTT</option>
//                 <option value="Điện">Điện</option>
//               </select>
//             </div>

//             <div className="filter-box">
//               <label className="filter-label">Học kỳ</label>
//               <select
//                 value={filters.semester}
//                 onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
//                 className="filter-input"
//               >
//                 <option value="">Tất cả</option>
//                 <option value="2025-1">2025-1</option>
//                 <option value="2024-2">2024-2</option>
//               </select>
//             </div>

//             <div className="filter-box">
//               <label className="filter-label">Lớp</label>
//               <select
//                 value={filters.class}
//                 onChange={(e) => setFilters({ ...filters, class: e.target.value })}
//                 className="filter-input"
//               >
//                 <option value="">Tất cả</option>
//                 <option value="23CNPM">23CNPM</option>
//                 <option value="23CLC">23CLC</option>
//                 <option value="22CLC">22CLC</option>
//               </select>
//             </div>
//           </div>

//           <div className="search-group">
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="search-input"
//               />
//             </div>
//             <button onClick={handleRefresh} className="">
//               ⟳
//             </button>
//           </div>
//         </div>
        
//         {/* Bảng */}
//         <div className="tutor-approval-table-container">
//           <table className="tutor-approval-table">
//             <thead>
//               <tr>
//                 <th>
//                   <input
//                     type="checkbox"
//                     onChange={handleSelectAll}
//                     checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
//                   />
//                 </th>
//                 <th>Họ tên</th>
//                 <th>MSSV</th>
//                 <th>Khoa</th>
//                 <th>Môn</th>
//                 <th>GPA</th>
//                 <th>Người đề xuất</th>
//                 <th>Trạng thái</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCandidates.map((candidate) => (
//                 <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? "selected" : ""}>
//                   <td>
//                     <input
//                       type="checkbox"
//                       checked={selectedCandidates.includes(candidate.id)}
//                       onChange={() => handleSelect(candidate.id)}
//                     />
//                   </td>
//                   <td className="name-cell">{candidate.student.fullName}</td>
//                   <td>{candidate.student.mssv}</td>
//                   <td>{candidate.student.department}</td>
//                   <td>{candidate.student.subject}</td>
//                   <td className={candidate.gpa < 2.5 ? "gpa-low" : ""}>{candidate.gpa}</td>
//                   <td>{candidate.proposer}</td>
//                   <td><span className="status-pending">Pending</span></td>
//                   <td><button className="action-view">Views</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Nút hành động */}
//         <div className="tutor-approval-actions">
//           <button
//             className="btn-reject"
//             onClick={handleReject}
//             disabled={selectedCandidates.length === 0}
//           >
//             Từ chối
//           </button>
//           <button
//             className="btn-approve"
//             onClick={handleApprove}
//             disabled={selectedCandidates.length === 0}
//           >
//             Duyệt Tutor
//           </button>
//         </div>
//       </div>

//       {/* Modal xác nhận */}
//       {showConfirmModal && (
//         <div className="modal-overlay">
//           <div className="confirm-modal">
//             <h3>Notification</h3>
//             <p>
//               Bạn có chắc muốn gửi tạo tutor cho <strong>{selectedCandidates.length}</strong> sinh viên đã chọn không?
//             </p>
//             <div className="modal-buttons">
//               <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
//                 Cancel
//               </button>
//               <button className="btn-confirm" onClick={confirmApprove}>
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toast thông báo */}
//       {notification.show && (
//         <div className={`notification-toast ${notification.type}`}>
//           <div className="toast-header">Notification</div>
//           <div className="toast-body">
//             {notification.type === "warning" ? (
//               <div>
//                 {notification.list.map((c, i) => (
//                   <div key={i}>• {c.mssv} có GPA &lt; 2.5</div>
//                 ))}
//               </div>
//             ) : (
//               <div>
//                 {notification.type === "error" && "Error!"}
//                 {notification.type === "success" && "Successful!"}
//                 {notification.message}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/Pages/TutorCandidateApproval/TutorCandidateApproval.jsx
import React, { useState, useEffect, useMemo } from "react";
import managementService from "../../api/management.service";
import { showSuccess, showError } from "../../utils/errorHandler";
import "./TutorCandidateApproval.css";

export default function TutorCandidateApproval() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for the Detail Modal
  const [viewCandidate, setViewCandidate] = useState(null);

  const [filters, setFilters] = useState({
    faculty: "",
    class: "",
    status: "PENDING",
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
    list: [],
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await managementService.getApplications();
      setCandidates(response || []);
    } catch (error) {
      showError("Không thể tải danh sách ứng viên");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Dynamic Filters ---
  const uniqueDepartments = useMemo(() => {
    const depts = candidates.map(c => c.student?.department).filter(Boolean);
    return [...new Set(depts)].sort();
  }, [candidates]);

  const uniqueClasses = useMemo(() => {
    const classes = candidates.map(c => c.student?.studentClass).filter(Boolean);
    return [...new Set(classes)].sort();
  }, [candidates]);

  // --- Handlers ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Helper to get Admin ID
  const getAdminId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user.userId;
    } catch { return null; }
  };

  // Single Approve (Used in Detail Modal)
  const handleSingleApprove = async (id) => {
    if (!window.confirm("Bạn có chắc muốn duyệt ứng viên này?")) return;
    try {
      await managementService.approveApplication(id);
      showSuccess("Đã duyệt ứng viên!");
      setViewCandidate(null); // Close modal
      fetchApplications();
    } catch (error) {
      showError("Không thể duyệt ứng viên");
    }
  };

  // Single Reject (Used in Detail Modal)
  const handleSingleReject = async (id) => {
    if (!window.confirm("Bạn có chắc muốn từ chối ứng viên này?")) return;
    try {
      await managementService.rejectApplication(id);
      showSuccess("Đã từ chối ứng viên!");
      setViewCandidate(null); // Close modal
      fetchApplications();
    } catch (error) {
      showError("Không thể từ chối ứng viên");
    }
  };

  // Bulk Approve
  const handleBulkApproveTrigger = () => {
    const selected = candidates.filter(c => selectedCandidates.includes(c.id));
    const hasLowGpa = selected.some(c => c.gpa < 2.5);

    if (hasLowGpa) {
      setNotification({
        show: true,
        type: "warning",
        message: "",
        list: selected.filter(c => c.gpa < 2.5),
      });
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmBulkApprove = async () => {
    setShowConfirmModal(false);
    try {
      await Promise.all(
        selectedCandidates.map(id => managementService.approveApplication(id))
      );
      showSuccess(`Đã duyệt ${selectedCandidates.length} ứng viên!`);
      setSelectedCandidates([]);
      fetchApplications();
    } catch (error) {
      showError("Lỗi khi duyệt hàng loạt");
    }
  };

  // Bulk Reject
  const handleBulkReject = async () => {
    if (!window.confirm(`Bạn có chắc muốn từ chối ${selectedCandidates.length} ứng viên?`)) return;
    try {
      await Promise.all(
        selectedCandidates.map(id => managementService.rejectApplication(id))
      );
      showSuccess(`Đã từ chối ${selectedCandidates.length} ứng viên!`);
      setSelectedCandidates([]);
      fetchApplications();
    } catch (error) {
      showError("Lỗi khi từ chối hàng loạt");
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilters({ faculty: "", class: "", status: "PENDING" });
    setSelectedCandidates([]);
    fetchApplications();
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'APPROVED': return <span style={{color: 'green', fontWeight: 'bold', background:'#def7ec', padding:'4px 8px', borderRadius:'4px'}}>Approved</span>;
        case 'REJECTED': return <span style={{color: 'red', fontWeight: 'bold', background:'#fde8e8', padding:'4px 8px', borderRadius:'4px'}}>Rejected</span>;
        default: return <span style={{color: '#d69e2e', fontWeight: 'bold', background:'#feecdc', padding:'4px 8px', borderRadius:'4px'}}>Pending</span>;
    }
  };

  // Filter Logic
  const filteredCandidates = candidates.filter(c => {
    const student = c.student || {};
    const matchesSearch =
      (student.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.mssv || "").includes(searchTerm) ||
      (student.department || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFaculty = !filters.faculty || student.department === filters.faculty;
    const matchesClass = !filters.class || student.studentClass === filters.class;
    const matchesStatus = !filters.status || c.status === filters.status;

    return matchesSearch && matchesFaculty && matchesClass && matchesStatus;
  });

  if (loading) return <div className="tutor-approval-container"><div className="tutor-approval-card"><div style={{padding:'3rem', textAlign:'center'}}>Đang tải...</div></div></div>;

  return (
    <div className="tutor-approval-container">
      <div className="tutor-approval-header">
        <h1>Xét duyệt đơn xin làm Tutor</h1>
      </div>

      <div className="tutor-approval-card">
        {/* Toolbar */}
        <div className="tutor-approval-toolbar">
          <div className="filter-group">
             <div className="filter-box">
              <label className="filter-label">Trạng thái</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="filter-input">
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Đã từ chối</option>
              </select>
            </div>
            <div className="filter-box">
              <label className="filter-label">Khoa</label>
              <select value={filters.faculty} onChange={(e) => setFilters({ ...filters, faculty: e.target.value })} className="filter-input">
                <option value="">Tất cả</option>
                {uniqueDepartments.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="filter-box">
              <label className="filter-label">Lớp</label>
              <select value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })} className="filter-input">
                <option value="">Tất cả</option>
                {uniqueClasses.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="search-group">
            <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
            <button onClick={handleRefresh}>⟳</button>
          </div>
        </div>
        
        {/* Table */}
        <div className="tutor-approval-table-container">
          <table className="tutor-approval-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={handleSelectAll} checked={filteredCandidates.length > 0 && selectedCandidates.length === filteredCandidates.length} /></th>
                <th>Họ tên</th>
                <th>MSSV</th>
                <th>Lớp</th>
                <th>Khoa</th>
                <th>Chuyên môn</th>
                <th>GPA</th>
                <th>Trạng thái</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                 <tr><td colSpan="9" style={{textAlign: "center", padding: "20px"}}>Không tìm thấy dữ liệu</td></tr>
              ) : (
                filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? "selected" : ""}>
                    <td><input type="checkbox" checked={selectedCandidates.includes(candidate.id)} onChange={() => handleSelect(candidate.id)}/></td>
                    <td className="name-cell">{candidate.student?.fullName}</td>
                    <td>{candidate.student?.mssv}</td>
                    <td>{candidate.student?.studentClass}</td> 
                    <td>{candidate.student?.department}</td>
                    <td>
                        <div style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                            {candidate.expertise?.slice(0, 2).map((ex, i) => (
                                <span key={i} style={{fontSize:'0.75rem', background:'#edf2f7', padding:'2px 6px', borderRadius:'4px'}}>{ex}</span>
                            ))}
                            {candidate.expertise?.length > 2 && <span style={{fontSize:'0.75rem', color:'#718096'}}>+{candidate.expertise.length - 2}</span>}
                        </div>
                    </td>
                    <td className={candidate.gpa < 2.5 ? "gpa-low" : ""}>{candidate.gpa}</td>
                    <td>{getStatusBadge(candidate.status)}</td>
                    <td>
                        <button className="action-view" onClick={() => setViewCandidate(candidate)}>
                            Chi tiết
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk Action Buttons */}
        {(filters.status === "PENDING" || filters.status === "") && (
            <div className="tutor-approval-actions">
            <button className="btn-reject" onClick={handleBulkReject} disabled={selectedCandidates.length === 0}>Từ chối ({selectedCandidates.length})</button>
            <button className="btn-approve" onClick={handleBulkApproveTrigger} disabled={selectedCandidates.length === 0}>Duyệt Tutor ({selectedCandidates.length})</button>
            </div>
        )}
      </div>

      {/* --- DETAIL MODAL (NEW) --- */}
      {viewCandidate && (
        <div className="modal-overlay" onClick={() => setViewCandidate(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()} style={{
              background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem'}}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748'}}>Hồ sơ Tutor</h2>
              <button onClick={() => setViewCandidate(null)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>✕</button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
                <div>
                    <p style={{color:'#718096', fontSize:'0.875rem'}}>Họ và tên</p>
                    <p style={{fontWeight:'600', fontSize:'1.1rem'}}>{viewCandidate.student?.fullName}</p>
                </div>
                <div>
                    <p style={{color:'#718096', fontSize:'0.875rem'}}>MSSV</p>
                    <p style={{fontWeight:'600'}}>{viewCandidate.student?.mssv}</p>
                </div>
                <div>
                    <p style={{color:'#718096', fontSize:'0.875rem'}}>Email</p>
                    <p style={{fontWeight:'600'}}>{viewCandidate.student?.email}</p>
                </div>
                <div>
                    <p style={{color:'#718096', fontSize:'0.875rem'}}>GPA</p>
                    <p style={{fontWeight:'bold', color: viewCandidate.gpa >= 3.2 ? '#38a169' : '#d69e2e'}}>{viewCandidate.gpa}</p>
                </div>
                <div>
                    <p style={{color:'#718096', fontSize:'0.875rem'}}>Lớp</p>
                    <p style={{fontWeight:'600'}}>{viewCandidate.student?.studentClass}</p>
                </div>
                <div>
                    <p style={{color:'#718096', fontSize:'0.875rem'}}>Khoa</p>
                    <p style={{fontWeight:'600'}}>{viewCandidate.student?.department}</p>
                </div>
            </div>

            {/* BIO SECTION */}
            <div style={{marginBottom: '1.5rem'}}>
                <p style={{color:'#718096', fontSize:'0.875rem', marginBottom:'0.5rem'}}>Giới thiệu bản thân (Bio)</p>
                <div style={{background: '#f7fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px'}}>
                    {viewCandidate.bio || "Ứng viên chưa cập nhật bio."}
                </div>
            </div>

            {/* EXPERTISE SECTION */}
            <div style={{marginBottom: '2rem'}}>
                <p style={{color:'#718096', fontSize:'0.875rem', marginBottom:'0.5rem'}}>Chuyên môn & Kỹ năng</p>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                    {viewCandidate.expertise && viewCandidate.expertise.length > 0 ? (
                        viewCandidate.expertise.map((skill, index) => (
                            <span key={index} style={{
                                background: '#ebf4ff', color: '#4299e1', padding: '0.5rem 1rem', 
                                borderRadius: '9999px', fontSize: '0.9rem', fontWeight: '500'
                            }}>
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span style={{fontStyle:'italic', color:'#a0aec0'}}>Chưa cập nhật chuyên môn</span>
                    )}
                </div>
            </div>

            {/* MODAL ACTIONS */}
            {viewCandidate.status === 'PENDING' ? (
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem'}}>
                    <button onClick={() => handleSingleReject(viewCandidate.id)} className="btn-reject" style={{padding:'0.75rem 1.5rem'}}>Từ chối</button>
                    <button onClick={() => handleSingleApprove(viewCandidate.id)} className="btn-approve" style={{padding:'0.75rem 1.5rem'}}>Duyệt Tutor</button>
                </div>
            ) : (
                <div style={{textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '1rem'}}>
                    <span style={{color: '#718096', fontStyle: 'italic'}}>Đơn này đã được xử lý: </span>
                    {getStatusBadge(viewCandidate.status)}
                </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Notification</h3>
            <p>Bạn có chắc muốn duyệt <strong>{selectedCandidates.length}</strong> sinh viên đã chọn không?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmBulkApprove}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
           <div className="toast-body">{notification.message || "Cảnh báo GPA thấp"}</div>
        </div>
      )}
    </div>
  );
}