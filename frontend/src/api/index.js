// Export all API services
export { default as apiClient } from './client';
export { default as authService } from './auth.service';
export { default as tutorsService } from './tutors.service';
export { default as meetingsService } from './meetings.service';
export { default as aiService } from './ai.service';
export { default as notificationsService } from './notifications.service';
export { default as externalService } from './external.service';
export { default as managementService } from './management.service';
export { default as reportsService } from './reports.service';

// For backward compatibility with old naming
export { default as authAPI } from './auth.service';
export { default as tutorsAPI } from './tutors.service';
export { default as meetingsAPI } from './meetings.service';
export { default as AI_API } from './ai.service';
