import apiClient from './client';

export const meetingsService = {
  // Student: Book a meeting
  book: async (bookingData) => {
    try {
      const response = await apiClient.post('/meetings/book', bookingData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to book meeting' };
    }
  },

  // Get My Meetings (Used by both Student and Tutor)
  getMyMeetings: async (status = null) => {
    try {
      const url = status ? `/meetings/my-meetings?status=${status}` : '/meetings/my-meetings';
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch meetings' };
    }
  },

  // Get meeting by ID
  getMeetingById: async (id) => {
    try {
      const response = await apiClient.get(`/meetings/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch meeting details' };
    }
  },

  // Get upcoming meetings
  getUpcoming: async () => {
    try {
      const response = await apiClient.get('/meetings/my-meetings?status=CONFIRMED');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch upcoming meetings' };
    }
  },

  // Get meeting history
  getHistory: async () => {
    try {
      const response = await apiClient.get('/meetings/my-meetings?status=COMPLETED');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch meeting history' };
    }
  },

  // Tutor: Confirm meeting
  confirm: async (meetingId) => {
    try {
      const response = await apiClient.patch(`/tutors/bookings/${meetingId}/confirm`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm meeting' };
    }
  },

  // Cancel meeting
  cancel: async (meetingId) => {
    try {
      const response = await apiClient.patch(`/meetings/${meetingId}/cancel`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel meeting' };
    }
  },

  // Complete meeting (mark as done)
  complete: async (meetingId) => {
    try {
      const response = await apiClient.patch(`/meetings/${meetingId}/complete`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to complete meeting' };
    }
  },

  // Reschedule meeting
  reschedule: async (meetingId, newScheduleData) => {
    try {
      const response = await apiClient.put(`/meetings/${meetingId}/reschedule`, newScheduleData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reschedule meeting' };
    }
  },

  // Rate meeting
  rate: async (meetingId, ratingData) => {
    try {
      const response = await apiClient.post(`/meetings/${meetingId}/rate`, ratingData);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to rate meeting' };
    }
  },
};

export default meetingsService;
