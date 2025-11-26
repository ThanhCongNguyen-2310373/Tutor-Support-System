// src/api/reports.service.js
import apiClient from './client';

export const reportsService = {
  // Get OSA scholarship report for tutors
  getScholarshipTutors: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/reports/osa/scholarship/tutors${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch scholarship tutors' };
    }
  },

  // Get OSA scholarship report for learners
  getScholarshipLearners: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/reports/osa/scholarship/learners${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch scholarship learners' };
    }
  },

  // Get OAA department metrics
  getDepartmentMetrics: async () => {
    try {
      const response = await apiClient.get('/reports/oaa/department-metrics');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch department metrics' };
    }
  },
};

export default reportsService;
