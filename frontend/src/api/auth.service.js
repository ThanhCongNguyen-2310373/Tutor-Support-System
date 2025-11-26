import apiClient from './client';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Save token and user to localStorage
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Change password failed' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
