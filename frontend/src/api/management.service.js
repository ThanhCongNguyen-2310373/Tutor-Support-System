// src/api/management.service.js
import apiClient from './client';

const userStr = localStorage.getItem('user');
const user = JSON.parse(userStr);
const admin_id = user.id;

export const managementService = {
  // Get tutor applications (pending, approved, rejected)
  getApplications: async (filters = {}) => {
    try {
      const response = await apiClient.get(`/management/tutor-applications`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch applications' };
    }
  },

  // Approve tutor application
  approveApplication: async (id) => {
    try {
      const response = await apiClient.patch(`/management/tutor-applications/${id}/approve`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve application' };
    }
  },

  // Reject tutor application
  rejectApplication: async (id, reason = '') => {
    try {
      const response = await apiClient.patch(`/management/tutor-applications/${id}/reject`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject application' };
    }
  },
};

export default managementService;
