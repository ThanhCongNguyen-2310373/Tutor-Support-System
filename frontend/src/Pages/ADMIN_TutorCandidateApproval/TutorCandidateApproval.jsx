import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../api.js"; 
import { showSuccess, showError } from "../../utils/errorHandler";
import "./TutorCandidateApproval.css";

export default function TutorCandidateApproval() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewCandidate, setViewCandidate] = useState(null);

  const [filters, setFilters] = useState({
    faculty: "",
    class: "",
    status: "PENDING",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [setNotification] = useState({
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
      const data = await apiClient.get('/management/tutor-applications');
      setCandidates(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách đơn:", error);
      showError("Không thể tải danh sách ứng viên");
    } finally {
      setLoading(false);
    }
  };

  const uniqueDepartments = useMemo(() => {
    const depts = candidates.map(c => c.student?.department).filter(Boolean);
    return [...new Set(depts)].sort();
  }, [candidates]);

  const uniqueClasses = useMemo(() => {
    const classes = candidates.map(c => c.student?.studentClass).filter(Boolean);
    return [...new Set(classes)].sort();
  }, [candidates]);

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

  const handleSingleApprove = async (id) => {
    if (!window.confirm("Bạn có chắc muốn duyệt ứng viên này?")) return;
    try {
      await apiClient.patch(`/management/tutor-applications/${id}/approve`);
      showSuccess("Đã duyệt ứng viên!");
      setViewCandidate(null);
      fetchApplications();
    } catch (error) {
      showError("Không thể duyệt ứng viên");
    }
  };

  const handleSingleReject = async (id) => {
    if (!window.confirm("Bạn có chắc muốn từ chối ứng viên này?")) return;
    try {
      await apiClient.patch(`/management/tutor-applications/${id}/reject`);
      showSuccess("Đã từ chối ứng viên!");
      setViewCandidate(null);
      fetchApplications();
    } catch (error) {
      showError("Không thể từ chối ứng viên");
    }
  };

  const confirmBulkApprove = async () => {
    setShowConfirmModal(false);
    try {
      await Promise.all(
        selectedCandidates.map(id =>
          apiClient.patch(`/management/tutor-applications/${id}/approve`)
        )
      );
      showSuccess(`Đã duyệt ${selectedCandidates.length} ứng viên!`);
      setSelectedCandidates([]);
      fetchApplications();
    } catch (error) {
      showError("Lỗi khi duyệt hàng loạt");
    }
  };

  const handleBulkReject = async () => {
    if (!window.confirm(`Bạn có chắc muốn từ chối ${selectedCandidates.length} ứng viên?`)) return;
    try {
      await Promise.all(
        selectedCandidates.map(id =>
          apiClient.patch(`/management/tutor-applications/${id}/reject`)
        )
      );
      showSuccess(`Đã từ chối ${selectedCandidates.length} ứng viên!`);
      setSelectedCandidates([]);
      fetchApplications();
    } catch (error) {
      showError("Lỗi khi từ chối hàng loạt");
    }
  };

  const handleBulkApproveTrigger = () => {
    const selected = candidates.filter(c => selectedCandidates.includes(c.id));
    const hasLowGpa = selected.some(c => c.gpa < 2.5);

    if (hasLowGpa) {
      setNotification({
        show: true,
        type: "warning",
        message: "Một số ứng viên có GPA dưới 2.5!",
        list: selected.filter(c => c.gpa < 2.5),
      });
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilters({ faculty: "", class: "", status: "PENDING" });
    setSelectedCandidates([]);
    fetchApplications();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span style={{color: 'green', fontWeight: 'bold', background:'#def7ec', padding:'4px 8px', borderRadius:'4px'}}>Approved</span>;
      case 'REJECTED': return <span style={{color: 'red', fontWeight: 'bold', background:'#fde8e8', padding:'4px 8px', borderRadius:'4px'}}>Rejected</span>;
      default: return <span style={{color: '#d69e2e', fontWeight: 'bold', background:'#feecdc', padding:'4px 8px', borderRadius:'4px'}}>Pending</span>;
    }
  };

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

  if (loading) return (
    <div className="tutor-approval-container">
      <div className="tutor-approval-card">
        <div style={{padding:'3rem', textAlign:'center'}}>Đang tải...</div>
      </div>
    </div>
  );

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
            <button onClick={handleRefresh}>Refresh</button>
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

        {/* Bulk Actions */}
        {(filters.status === "PENDING" || filters.status === "") && (
          <div className="tutor-approval-actions">
            <button className="btn-reject" onClick={handleBulkReject} disabled={selectedCandidates.length === 0}>
              Từ chối ({selectedCandidates.length})
            </button>
            <button className="btn-approve" onClick={handleBulkApproveTrigger} disabled={selectedCandidates.length === 0}>
              Duyệt Tutor ({selectedCandidates.length})
            </button>
          </div>
        )}
      </div>

      {/* CHI TIẾT MODAL */}
      {viewCandidate && (
        <div className="modal-overlay" onClick={() => setViewCandidate(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            {viewCandidate.status === 'PENDING' ? (
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem'}}>
                <button onClick={() => handleSingleReject(viewCandidate.id)} className="btn-reject">Từ chối</button>
                <button onClick={() => handleSingleApprove(viewCandidate.id)} className="btn-approve">Duyệt Tutor</button>
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

      {/* Confirm Duyệt Nhiều */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Xác nhận</h3>
            <p>Bạn có chắc muốn duyệt <strong>{selectedCandidates.length}</strong> ứng viên?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Hủy</button>
              <button className="btn-confirm" onClick={confirmBulkApprove}>Duyệt ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
