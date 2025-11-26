import apiClient from './client';

export const aiService = {
  // Match tutors using AI
  matchTutors: async (criteria) => {
    try {
      const response = await apiClient.post('/ai/match-tutors', criteria);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to match tutors' };
    }
  },

  // Get similar tutors
  getSimilarTutors: async (tutorId) => {
    try {
      const response = await apiClient.get(`/ai/similar-tutors/${tutorId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get similar tutors' };
    }
  },

  // Chat with AI
  chat: async (message) => {
    try {
      const response = await apiClient.post('/ai/chat', { message });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to chat with AI' };
    }
  },

  // Get chat history
  getChatHistory: async () => {
    try {
      const response = await apiClient.get('/ai/chatbot/history');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get chat history' };
    }
  },

  // Clear chat history
  clearChatHistory: async () => {
    try {
      const response = await apiClient.delete('/ai/chatbot/history');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear chat history' };
    }
  },

  // Search FAQ
  faqSearch: async (query) => {
    try {
      const response = await apiClient.post('/ai/faq-search', { query });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search FAQ' };
    }
  },

  // Check chatbot health
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/ai/chatbot/health');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check chatbot health' };
    }
  },
};

export default aiService;
