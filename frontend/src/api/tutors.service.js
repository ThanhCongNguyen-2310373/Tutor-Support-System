import apiClient from './client';

export const tutorsService = {
  // Get all tutors (supports filtering)
  getAll: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/tutors${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tutors' };
    }
  },

  // Get tutor by ID
  getTutorById: async (id) => {
    try {
      const response = await apiClient.get(`/tutors/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tutor details' };
    }
  },

  // Get tutor availability
  getAvailability: async (tutorId) => {
    try {
      const response = await apiClient.get(`/tutors/${tutorId}/availability`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch availability' };
    }
  },

  // Post tutor availability (for tutor)
  postAvailability: async (availabilityData) => {
    try {
      const response = await apiClient.post('/tutors/availability', availabilityData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create availability' };
    }
  },

  // Delete tutor availability
  deleteAvailability: async (availabilityId) => {
    try {
      const response = await apiClient.delete(`/tutors/availability/${availabilityId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete availability' };
    }
  },

  // Get my availability (for logged-in tutor)
  getMyAvailability: async () => {
    try {
      const response = await apiClient.get('/tutors/me/availability');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my availability' };
    }
  },

  // Get my students (for logged-in tutor)
  getMyStudents: async () => {
    try {
      const response = await apiClient.get('/tutors/me/students');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch my students' };
    }
  },

  // Post student progress
  postProgress: async (progressData) => {
    try {
      const response = await apiClient.post('/tutors/progress', progressData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to record progress' };
    }
  },
};

export default tutorsService;
