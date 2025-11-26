// src/api/external.service.js
import apiClient from './client';

export const externalService = {
  // Search library documents
  searchLibrary: async (query, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await apiClient.get(`/external/library/search?${params}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search library' };
    }
  },

  // Get document URL by ID
  getDocumentUrl: async (id) => {
    try {
      const response = await apiClient.get(`/external/library/document-url/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get document URL' };
    }
  },

  // Get recommended documents based on user's profile
  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/external/library/recommendations');
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recommendations' };
    }
  },

  // Get popular documents
  getPopularDocuments: async (limit = 10) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      const response = await apiClient.get(`/external/library/popular?${params}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch popular documents' };
    }
  },
};

export default externalService;
