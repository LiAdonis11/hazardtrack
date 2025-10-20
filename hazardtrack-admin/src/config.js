// Configuration for HazardTrack Admin Dashboard
export const API_CONFIG = {
  // Change this only if needed
  BASE_URL: 'http://localhost/hazardTrackV2/api', // For local XAMPP
  DEV_BASE_URL: 'http://localhost/hazardTrackV2/api', // Same for dev
  PROD_BASE_URL: '/api', // Use relative path for production on server
};

// Determine API URL based on environment
const getApiUrl = () => {
  console.log('Environment mode:', import.meta.env.MODE);
  console.log('Current host:', window.location.host);
  
  if (window.location.host.includes('localhost')) {
    return API_CONFIG.DEV_BASE_URL;
  } else {
    return API_CONFIG.PROD_BASE_URL;
  }
};

// Current active API URL
export const API_URL = getApiUrl();

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  URL: window.location.host.includes('localhost') ? 'ws://localhost:3001' : 'wss://your-production-websocket-url',
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5
};

// Add this for debugging
console.log('API_URL:', API_URL);
console.log('WebSocket URL:', WEBSOCKET_CONFIG.URL);

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/login_admin.php',
  VALIDATE_TOKEN: '/validate_token.php',
  GET_REPORTS: '/get_all_reports.php',
  GET_ALL_REPORTS: '/get_all_reports.php',
  UPDATE_REPORT_STATUS: '/update_report_status.php',
  UPDATE_REPORT_DETAILS: '/update_report_details.php',
  EXPORT_REPORTS: '/export_reports.php',
  ASSIGN_INSPECTOR: '/assign_inspector.php',
  GET_INSPECTORS: '/assign_inspector.php',
  GET_INSPECTOR_ASSIGNMENTS: '/get_inspector_assignments.php',
  GET_NOTIFICATIONS: '/get_notifications.php',
  MARK_NOTIFICATION_READ: '/mark_notification_read.php',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCESS_DENIED: 'Access denied. Admin privileges required.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_TOKEN: 'Invalid authentication token. Please login again.',
};

// Role definitions (must match database enum values)
export const ROLES = {
  ADMIN: 'admin',
  BFP: 'bfp_personnel',
  RESIDENT: 'resident',
  INSPECTOR: 'inspector',
};

// LocalStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
};
