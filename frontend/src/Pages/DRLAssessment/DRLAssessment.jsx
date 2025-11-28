import { useState, useEffect, useMemo } from "react";
import "./DRLAssessment.css";
import { reportsAPI } from "../../api"
import { showError, showSuccess } from "../../utils/errorHandler";

// Icons từ react-icons/fi
import { 
  FiUsers, 
  FiBookOpen, 
  FiAward, 
  FiClock, 
  FiFilter,
  FiRefreshCw,
  FiTrendingUp,
  FiCheckCircle
} from "react-icons/fi";

// Charts từ recharts
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function DRLAssessment() {
  const [eligibleTutors, setEligibleTutors] = useState([]);
  const [eligibleLearners, setEligibleLearners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter parameters
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0], // Today
    tutorMinGpa: 3.0,
    tutorMinHours: 0, 
    learnerMinGpa: 3.5,
    learnerMinHours: 0 
  });
 // eslint-disable-next-line
const getAbbreviation = (name) => {
  if (!name) return "";
  return name
    .trim()                   // Xóa khoảng trắng thừa 2 đầu
    .split(/\s+/)             // Tách chuỗi dựa trên khoảng trắng (handle cả nhiều dấu cách)
    .map(word => word[0])     // Lấy chữ cái đầu tiên của mỗi từ
    .join("")                 // Ghép lại
    .toUpperCase();           // Viết hoa toàn bộ
};
  
  // Auto load data on mount
  useEffect(() => {
    fetchScholarshipData();
  }, []);

  const fetchScholarshipData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching with filters:', filters);
      
      const [tutorsResponse, learnersResponse] = await Promise.all([
        reportsAPI.getScholarshipTutors({
          start: filters.startDate,
          end: filters.endDate,
          minGpa: filters.tutorMinGpa,
          minHours: filters.tutorMinHours
        }),
        reportsAPI.getScholarshipLearners({
          start: filters.startDate,
          end: filters.endDate,
          minGpa: filters.learnerMinGpa,
          minHours: filters.learnerMinHours
        })
      ]);

      console.log('✅ Tutors Response:', tutorsResponse);
      console.log('✅ Learners Response:', learnersResponse);

      // Backend trả về trực tiếp mảng trong response.data
      const tutorsData = tutorsResponse.data || tutorsResponse || [];
      const learnersData = learnersResponse.data || learnersResponse || [];

      console.log('📊 Tutors Data:', tutorsData);
      console.log('📊 Learners Data:', learnersData);

      setEligibleTutors(tutorsData);
      setEligibleLearners(learnersData);
      
      console.log('📊 Eligible Tutors Count:', tutorsData.length);
      console.log('📊 Eligible Learners Count:', learnersData.length);
      
      showSuccess("Đã tải dữ liệu học bổng thành công");
    } catch (error) {
      console.error("❌ Error fetching scholarship data:", error);
      console.error("❌ Error response:", error.response);
      showError(error.response?.data?.message || "Không thể tải dữ liệu học bổng");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name.includes('Gpa') || name.includes('Hours') ? parseFloat(value) : value
    }));
  };

  const handleApplyFilters = () => {
    fetchScholarshipData();
  };

  // === XỬ LÝ DỮ LIỆU CHO BÁO CÁO ===

  // 1. Thống kê tổng quan
  const stats = useMemo(() => {
    const totalTutorHours = eligibleTutors.reduce((acc, curr) => acc + (curr.hours || 0), 0);
    const avgTutorGPA = eligibleTutors.length > 0 
      ? (eligibleTutors.reduce((acc, curr) => acc + (curr.gpa || 0), 0) / eligibleTutors.length).toFixed(2) 
      : 0;
    const avgLearnerGPA = eligibleLearners.length > 0
      ? (eligibleLearners.reduce((acc, curr) => acc + (curr.gpa || 0), 0) / eligibleLearners.length).toFixed(2)
      : 0;
    // const totalLearnerHours = eligibleLearners.reduce((acc, curr) => acc + (curr.hours || 0), 0);

    return [
      { 
        title: "Tutors đạt chuẩn", 
        value: eligibleTutors.length, 
        icon: <FiUsers />, 
        color: "blue",
        description: `GPA ≥ ${filters.tutorMinGpa}, Giờ ≥ ${filters.tutorMinHours}h`
      },
      { 
        title: "Tổng giờ dạy", 
        value: `${totalTutorHours.toFixed(1)}h`, 
        icon: <FiClock />, 
        color: "green",
        description: "Tổng giờ đóng góp của tutors"
      },
      { 
        title: "Learners đạt chuẩn", 
        value: eligibleLearners.length, 
        icon: <FiBookOpen />, 
        color: "orange",
        description: `GPA ≥ ${filters.learnerMinGpa}, Giờ ≥ ${filters.learnerMinHours}h`
      },
      { 
        title: "GPA trung bình", 
        value: avgTutorGPA, 
        icon: <FiAward />, 
        color: "purple",
        description: `Tutors: ${avgTutorGPA} | Learners: ${avgLearnerGPA}`
      },
    ];
  }, [eligibleTutors, eligibleLearners, filters]);

  // 2. Phân bố theo Khoa (Department)
  const departmentDistribution = useMemo(() => {
    const counts = {};
    
    eligibleTutors.forEach(t => {
      const dept = t.department || "Không rõ";
      if (!counts[dept]) counts[dept] = { tutors: 0, learners: 0 };
      counts[dept].tutors++;
    });

    eligibleLearners.forEach(l => {
      const dept = l.department || "Không rõ";
      if (!counts[dept]) counts[dept] = { tutors: 0, learners: 0 };
      counts[dept].learners++;
    });

    return Object.keys(counts).map(key => ({ 
      name: key, 
      tutors: counts[key].tutors,
      learners: counts[key].learners,
      total: counts[key].tutors + counts[key].learners
    }));
  }, [eligibleTutors, eligibleLearners]);

  // 3. Phân tích GPA distribution
  const gpaDistribution = useMemo(() => {
    const ranges = [
      { name: "3.0-3.2", min: 3.0, max: 3.2, tutors: 0, learners: 0 },
      { name: "3.3-3.5", min: 3.3, max: 3.5, tutors: 0, learners: 0 },
      { name: "3.6-3.8", min: 3.6, max: 3.8, tutors: 0, learners: 0 },
      { name: "3.9-4.0", min: 3.9, max: 4.0, tutors: 0, learners: 0 }
    ];
    
    eligibleTutors.forEach(t => {
      const gpa = t.gpa || 0;
      const range = ranges.find(r => gpa >= r.min && gpa <= r.max);
      if (range) range.tutors++;
    });

    eligibleLearners.forEach(l => {
      const gpa = l.gpa || 0;
      const range = ranges.find(r => gpa >= r.min && gpa <= r.max);
      if (range) range.learners++;
    });

    return ranges;
  }, [eligibleTutors, eligibleLearners]);

  // 4. Top performers
  const topTutors = useMemo(() => {
    return [...eligibleTutors]
      .sort((a, b) => (b.hours || 0) - (a.hours || 0))
      .slice(0, 5);
  }, [eligibleTutors]);

  const topLearners = useMemo(() => {
    return [...eligibleLearners]
      .sort((a, b) => (b.gpa || 0) - (a.gpa || 0))
      .slice(0, 5);
  }, [eligibleLearners]);

  return (
    <div className="osa-dashboard-container">
      {/* Header */}
      <div className="osa-header">
        <div>
          <h1 className="osa-title">XÉT HỌC BỔNG TRỢ GIẢNG VÀ SINH VIÊN</h1>
          <p className="osa-subtitle">
            Đánh giá và xét duyệt học bổng dựa trên hoạt động học tập và giảng dạy
          </p>
        </div>
        <div className="osa-date">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter className="filter-icon" />
          <h3>Bộ lọc tìm kiếm</h3>
        </div>
        
        <div className="filter-grid">
          {/* Date Range */}
          <div className="filter-group">
            <label>Từ ngày</label>
            <input 
              type="date" 
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Đến ngày</label>
            <input 
              type="date" 
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          {/* Tutor Filters */}
          <div className="filter-group">
            <label>GPA tối thiểu (Tutor)</label>
            <input 
              type="number" 
              name="tutorMinGpa"
              value={filters.tutorMinGpa}
              onChange={handleFilterChange}
              step="0.1"
              min="0"
              max="4"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Giờ dạy tối thiểu (Tutor)</label>
            <input 
              type="number" 
              name="tutorMinHours"
              value={filters.tutorMinHours}
              onChange={handleFilterChange}
              step="1"
              min="0"
              className="filter-input"
            />
          </div>

          {/* Learner Filters */}
          <div className="filter-group">
            <label>GPA tối thiểu (Learner)</label>
            <input 
              type="number" 
              name="learnerMinGpa"
              value={filters.learnerMinGpa}
              onChange={handleFilterChange}
              step="0.1"
              min="0"
              max="4"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Giờ học tối thiểu (Learner)</label>
            <input 
              type="number" 
              name="learnerMinHours"
              value={filters.learnerMinHours}
              onChange={handleFilterChange}
              step="1"
              min="0"
              className="filter-input"
            />
          </div>
        </div>

        <button 
          className="filter-apply-btn"
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="btn-spinner"></div>
              Đang tải...
            </>
          ) : (
            <>
              <FiRefreshCw />
              Áp dụng bộ lọc
            </>
          )}
        </button>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <FiCheckCircle className="info-icon" />
        <div className="info-content">
          <h4>Tiêu chí xét học bổng hiện tại</h4>
          <p>
            <strong>Tutors:</strong> GPA ≥ {filters.tutorMinGpa} và giờ dạy ≥ {filters.tutorMinHours}h | 
            <strong> Learners:</strong> GPA ≥ {filters.learnerMinGpa} và giờ học ≥ {filters.learnerMinHours}h
            <br />
            <strong>Thời gian:</strong> {new Date(filters.startDate).toLocaleDateString('vi-VN')} - {new Date(filters.endDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tổng hợp dữ liệu học bổng...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards Row */}
          <div className="osa-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className={`osa-stat-card border-${stat.color}`}>
                <div className={`osa-stat-icon bg-${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="osa-stat-info">
                  <h3>{stat.value}</h3>
                  <p>{stat.title}</p>
                  <small className="stat-description">{stat.description}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="osa-charts-grid">
            {/* Chart 1: Department Distribution */}
            <div className="osa-chart-card">
              <div className="osa-card-header">
                <FiUsers className="card-icon" />
                <h3>Phân bố theo Khoa</h3>
              </div>
              <div className="chart-description">
                So sánh số lượng tutors và learners đạt chuẩn theo từng khoa
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentDistribution} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickFormatter={getAbbreviation} angle={-15} textAnchor="end" height={30} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tutors" fill="#2563eb" name="Tutors" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="learners" fill="#10b981" name="Learners" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: GPA Distribution */}
            <div className="osa-chart-card">
              <div className="osa-card-header">
                <FiTrendingUp className="card-icon" />
                <h3>Phân bố GPA</h3>
              </div>
              <div className="chart-description">
                Phân tích phân bố điểm GPA của tutors và learners đạt điều kiện
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gpaDistribution} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tutors" fill="#2563eb" name="Tutors" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="learners" fill="#10b981" name="Learners" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Performers Section */}
          <div className="top-performers-section">
            <h2 className="section-title">
              <FiAward classname = "award-icon"/> Top Performers
            </h2>
            
            <div className="top-performers-grid">
              {/* Top Tutors */}
              <div className="top-card">
                 

                <h3 className="top-card-title">Top 5 Tutors (Giờ dạy cao nhất)</h3>
                <div className="top-list">
                  {topTutors.length > 0 ? topTutors.map((tutor, idx) => (
                    <div key={idx} className="top-item">
                      <span className="rank">#{idx + 1}</span>
                      <div className="top-info">
                        <strong>{tutor.fullName}</strong>
                        <small>{tutor.mssv} - {tutor.department}</small>
                      </div>
                      <div className="top-stats">
                        <span className="hours">{tutor.hours}h</span>
                        <span className="gpa">GPA: {tutor.gpa?.toFixed(2)}</span>
                      </div>
                    </div>
                  )) : <p className="empty-message">Chưa có dữ liệu</p>}
                </div>
              </div>

              {/* Top Learners */}
              <div className="top-card">
                <h3 className="top-card-title">Top 5 Learners (GPA cao nhất)</h3>
                <div className="top-list">
                  {topLearners.length > 0 ? topLearners.map((learner, idx) => (
                    <div key={idx} className="top-item">
                      <span className="rank">#{idx + 1}</span>
                      <div className="top-info">
                        <strong>{learner.fullName}</strong>
                        <small>{learner.mssv} - {learner.department}</small>
                      </div>
                      <div className="top-stats">
                        <span className="gpa highlight">GPA: {learner.gpa?.toFixed(2)}</span>
                        <span className="sessions">{learner.hours}h</span>
                      </div>
                    </div>
                  )) : <p className="empty-message">Chưa có dữ liệu</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Data Tables Section */}
          <div className="osa-tables-section">
            
            {/* Table 1: Tutors */}
            <div className="osa-table-card">
              <div className="osa-card-header-flex">
                <h3>Danh sách Tutor đủ điều kiện ({eligibleTutors.length})</h3>
                <span className="badge">GPA ≥ {filters.tutorMinGpa} & Hours ≥ {filters.tutorMinHours}</span>
              </div>
              <div className="table-responsive">
                <table className="osa-clean-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>Khoa</th>
                      <th className="text-center">GPA</th>
                      <th className="text-center">Giờ dạy</th>
                      <th>Loại</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleTutors.map((tutor, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="font-mono">{tutor.mssv}</td>
                        <td className="font-bold">{tutor.fullName}</td>
                        <td>{tutor.department}</td>
                        <td className="text-center highlight">{tutor.gpa?.toFixed(2)}</td>
                        <td className="text-center">{tutor.hours}h</td>
                        <td><span className="type-badge tutor">{tutor.type}</span></td>
                        <td><span className="status-badge success">{tutor.qualified ? 'Đạt' : 'Chưa đạt'}</span></td>
                      </tr>
                    ))}
                    {eligibleTutors.length === 0 && (
                      <tr><td colSpan="8" className="text-center empty-message">Không có dữ liệu phù hợp với bộ lọc</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Learners */}
            <div className="osa-table-card mt-4">
              <div className="osa-card-header-flex">
                <h3>Danh sách Sinh viên đủ điều kiện ({eligibleLearners.length})</h3>
                <span className="badge">GPA ≥ {filters.learnerMinGpa} & Hours ≥ {filters.learnerMinHours}</span>
              </div>
              <div className="table-responsive">
                <table className="osa-clean-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th>Khoa</th>
                      <th className="text-center">GPA</th>
                      <th className="text-center">Giờ học</th>
                      <th>Loại</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleLearners.map((learner, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="font-mono">{learner.mssv}</td>
                        <td className="font-bold">{learner.fullName}</td>
                        <td>{learner.department}</td>
                        <td className="text-center highlight">{learner.gpa?.toFixed(2)}</td>
                        <td className="text-center">{learner.hours}h</td>
                        <td><span className="type-badge learner">{learner.type}</span></td>
                        <td><span className="status-badge success">{learner.qualified ? 'Đạt' : 'Chưa đạt'}</span></td>
                      </tr>
                    ))}
                    {eligibleLearners.length === 0 && (
                      <tr><td colSpan="8" className="text-center empty-message">Không có dữ liệu phù hợp với bộ lọc</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}