// This file is kept for backward compatibility
// All imports are redirected to the new api/ folder structure

// Re-export everything from api/index.js
export {
  apiClient,
  authService,
  tutorsService,
  meetingsService,
  aiService,
  notificationsService,
  authAPI,
  tutorsAPI,
  meetingsAPI,
  AI_API
} from './api/index';
