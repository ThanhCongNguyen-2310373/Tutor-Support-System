import axios from 'axios';

// Create axios instance
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

export default apiClient;
