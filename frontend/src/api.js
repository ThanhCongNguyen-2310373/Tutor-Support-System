import axios from 'axios';

// ============================================================================
// API CLIENT
// ============================================================================

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      // Only redirect to login if not already on login page
      if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register-account') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('dashRole');
        
        // Redirect to login
        window.location.href = '/';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Permission denied');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - API server is down');
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const authService = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.message || errorData?.error || 'Registration failed';
      throw new Error(message);
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        const getUser = await apiClient.get('/users/me')
        localStorage.setItem('user', JSON.stringify(getUser));
      }
      
      return response;
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.message || errorData?.error || 'Login failed';
      throw new Error(message);
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Change password failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },


  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

// ============================================================================
// TUTORS SERVICE
// ============================================================================

export const tutorsService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/tutors');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tutors' };
    }
  },

  getTutorById: async (id) => {
    try {
      const response = await apiClient.get(`/tutors/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tutor details' };
    }
  },

  getAvailability: async (tutorId) => {
    try {
      const response = await apiClient.get(`/tutors/me/availability`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch availability' };
    }
  },

  postAvailability: async (availabilityData) => {
    try {
      const response = await apiClient.post('/tutors/availability', availabilityData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create availability' };
    }
  },

  deleteAvailability: async (availabilityId) => {
    try {
      const response = await apiClient.delete(`/tutors/availability/${availabilityId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete availability' };
    }
  },

  getMyAvailability: async () => {
    try {
      const response = await apiClient.get('/tutors/me/availability');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my availability' };
    }
  },

  getMyStudents: async () => {
    try {
      const response = await apiClient.get('/tutors/me/students');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my students' };
    }
  },

  postProgress: async (progressData) => {
    try {
      const response = await apiClient.post('/tutors/progress', progressData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to record progress' };
    }
  },

  getStudentProgress: async (studentId) => {
    try {
      const response = await apiClient.get(`/tutors/students/${studentId}/progress`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch student progress' };
    }
  },
};

// ============================================================================
// MEETINGS SERVICE
// ============================================================================

export const meetingsService = {
  book: async (bookingData) => {
    try {
      const response = await apiClient.post('/meetings/book', bookingData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to book meeting' };
    }
  },

  getMyMeetings: async (status = null) => {
    try {
      const url = status ? `/meetings/my-meetings?status=${status}` : '/meetings/my-meetings';
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch meetings' };
    }
  },

  getMeetingById: async (id) => {
    try {
      const response = await apiClient.get(`/meetings/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch meeting details' };
    }
  },

  getUpcoming: async () => {
    try {
      const response = await apiClient.get('/meetings/my-meetings?status=CONFIRMED');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch upcoming meetings' };
    }
  },

  getHistory: async () => {
    try {
      const response = await apiClient.get('/meetings/my-meetings?status=COMPLETED');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch meeting history' };
    }
  },

  confirm: async (meetingId) => {
    try {
      const response = await apiClient.patch(`/tutors/bookings/${meetingId}/confirm`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm meeting' };
    }
  },

  cancel: async (meetingId) => {
    try {
      const response = await apiClient.patch(`/meetings/${meetingId}/cancel`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel meeting' };
    }
  },

  complete: async (meetingId) => {
    try {
      const response = await apiClient.patch(`/meetings/${meetingId}/complete`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to complete meeting' };
    }
  },

  reschedule: async (meetingId, newScheduleData) => {
    try {
      const response = await apiClient.put(`/meetings/${meetingId}/reschedule`, newScheduleData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reschedule meeting' };
    }
  },

  rate: async (meetingId, ratingData) => {
    try {
      const response = await apiClient.post(`/meetings/${meetingId}/rating`, ratingData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to rate meeting' };
    }
  },
};

// ============================================================================
// AI SERVICE
// ============================================================================

export const aiService = {
  matchTutors: async (criteria) => {
    try {
      const response = await apiClient.post('/ai/match-tutors', criteria);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to match tutors' };
    }
  },

  getSimilarTutors: async (tutorId) => {
    try {
      const response = await apiClient.get(`/ai/similar-tutors/${tutorId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get similar tutors' };
    }
  },

  chat: async (message) => {
    try {
      const response = await apiClient.post('/ai/chat', { message });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to chat with AI' };
    }
  },

  getChatHistory: async () => {
    try {
      const response = await apiClient.get('/ai/chatbot/history');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get chat history' };
    }
  },

  clearChatHistory: async () => {
    try {
      const response = await apiClient.delete('/ai/chatbot/history');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear chat history' };
    }
  },

  faqSearch: async (query) => {
    try {
      const response = await apiClient.post('/ai/faq-search', { query });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search FAQ' };
    }
  },

  checkHealth: async () => {
    try {
      const response = await apiClient.get('/ai/chatbot/health');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check chatbot health' };
    }
  },
};

// ============================================================================
// NOTIFICATIONS SERVICE
// ============================================================================

export const notificationsService = {
  getAll: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unread count' };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification as read' };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark all as read' };
    }
  },
};

// ============================================================================
// EXTERNAL SERVICE
// ============================================================================

export const externalService = {
  /**
   * Search Library
   * Matches Swagger Params: query, category, subject, page, limit
   */
  searchLibrary: async ({ query = '', subject = '', category = '', page = 1, limit = 10 }) => {
    try {
      const params = new URLSearchParams();

      // Only append if they have values to keep URL clean
      if (query) params.append('query', query);
      if (subject) params.append('subject', subject);
      if (category) params.append('category', category);
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/external/library/books?${params.toString()}`);
      return response.documents;
    } catch (error) {
      throw error.response || { message: 'Failed to search library' };
    }
  }
};

// ============================================================================
// MANAGEMENT SERVICE
// ============================================================================

export const managementService = {
  getApplications: async (filters = {}) => {
    try {
      const response = await apiClient.get('/management/tutor-applications');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch applications' };
    }
  },
  
  approveApplication: async (id) => {
    try {
      const response = await apiClient.patch(`/management/tutor-applications/${id}/approve`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve application' };
    }
  },
  
  rejectApplication: async (id, reason = '') => {
    try {
      const response = await apiClient.patch(`/management/tutor-applications/${id}/reject`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject application' };
    }
  },

  // Thêm vào managementService
  getPotentialTutors: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/management/potential-tutors${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tải danh sách ứng viên tiềm năng' };
    }
  },

  // THÊM VÀO managementService
  proposeTutorApplication: async (data) => {
    try {
      const response = await apiClient.post('/management/tutor-applications/propose', data);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Gửi đề xuất thất bại' };
    }
  },
};

// ============================================================================
// REPORTS SERVICE
// ============================================================================

export const reportsService = {
  getScholarshipTutors: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/reports/osa/scholarship/tutors${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      throw error.response || { message: 'Failed to fetch scholarship tutors' };
    }
  },

  getScholarshipLearners: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/reports/osa/scholarship/learners${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      throw error.response || { message: 'Failed to fetch scholarship learners' };
    }
  },

  getDepartmentMetrics: async () => {
    try {
      const response = await apiClient.get('/reports/oaa/department-metrics');
      return response;
    } catch (error) {
      throw error.response || { message: 'Failed to fetch department metrics' };
    }
  },
};


// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================
export const notiService = {
  // GET /notifications?limit=50
  getAll: async (limit = 50) => {
    try {
      const response = await apiClient.get(`/notifications?limit=${limit}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  // GET /notifications/unread-count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unread count' };
    }
  },

  // POST /notifications/:id/read
  markAsRead: async (id) => {
    try {
      const response = await apiClient.post(`/notifications/${id}/read`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification as read' };
    }
  },

  // POST /notifications/read-all
  markAllAsRead: async () => {
    try {
      const response = await apiClient.post('/notifications/read-all');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark all as read' };
    }
  },

  // DELETE /notifications/:id
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete notification' };
    }
  },

  // DELETE /notifications/read/all
  deleteAllRead: async () => {
    try {
      const response = await apiClient.delete('/notifications/read/all');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete read notifications' };
    }
  }
};

export const academicService = {
  // Lấy danh sách lộ trình
  getRoadmaps: async () => {
    try {
      const response = await apiClient.get('/academic/roadmaps');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể tải lộ trình học' };
    }
  },

  // TBM tạo mới
  createRoadmap: async (data) => {
    try {
      const response = await apiClient.post('/academic/roadmaps', data);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Tạo lộ trình thất bại' };
    }
  },

  // TBM cập nhật
  updateRoadmap: async (id, data) => {
    try {
      const response = await apiClient.patch(`/academic/roadmaps/${id}`, data);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Cập nhật lộ trình thất bại' };
    }
  },

  // TBM xóa
  deleteRoadmap: async (id) => {
    try {
      const response = await apiClient.delete(`/academic/roadmaps/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Xóa lộ trình thất bại' };
    }
  },
};

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

export const authAPI = authService;
export const tutorsAPI = tutorsService;
export const meetingsAPI = meetingsService;
export const AI_API = aiService;
export const managementAPI = managementService;
export const notiAPI = notiService;
export const reportsAPI = reportsService;
export const academicAPI = academicService;

export default apiClient;
