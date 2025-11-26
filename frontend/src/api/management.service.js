// src/api/management.service.js
import apiClient from './client';

export const managementService = {
  // Get tutor applications (pending, approved, rejected)
  getApplications: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/management/applications${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch applications' };
    }
  },

  // Approve tutor application
  approveApplication: async (id) => {
    try {
      const response = await apiClient.post(`/management/applications/${id}/approve`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve application' };
    }
  },

  // Reject tutor application
  rejectApplication: async (id, reason = '') => {
    try {
      const response = await apiClient.post(`/management/applications/${id}/reject`, {
        reason,
      });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject application' };
    }
  },
};

export default managementService;
