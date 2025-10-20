// Real-time server configuration
const config = {
  // Server settings
  PORT: process.env.PORT || 3001,

  // Database settings
  DATABASE: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hazardtrack_dbv2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // JWT settings (should match PHP backend)
  JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',

  // CORS settings
  CORS_ORIGINS: [
    "http://localhost:3000",    // React web app
    "http://localhost:5173",    // Vite admin dashboard
    "http://localhost:8080",    // Admin dashboard
    "http://localhost:8081",    // React Native web/Expo web
    "http://localhost:19006",   // Expo/React Native
    "exp://localhost:8081"      // Expo development
  ],

  // Socket.IO settings
  SOCKET_IO: {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8081", "http://localhost:19006"],
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  },

  // Room names
  ROOMS: {
    BFP_PERSONNEL: 'bfp_room',
    RESIDENTS: 'residents_room',
    ADMINS: 'admin_room'
  },

  // Event names
  EVENTS: {
    // Authentication
    AUTHENTICATE: 'authenticate',
    AUTHENTICATED: 'authenticated',
    AUTH_ERROR: 'auth_error',

    // Reports
    REPORT_CREATED: 'report_created',
    REPORT_ACKNOWLEDGED: 'report_acknowledged',
    REPORT_ERROR: 'report_error',
    NEW_REPORT: 'new_report',
    REPORT_STATUS_CHANGED: 'report_status_changed',

    // Emergency
    EMERGENCY_ALERT: 'emergency_alert',
    EMERGENCY_NOTIFICATION: 'emergency_notification',
    ALERT_ACKNOWLEDGED: 'alert_acknowledged',

    // Location
    LOCATION_UPDATE: 'location_update',
    BFP_LOCATION_UPDATE: 'bfp_location_update',

    // UI
    TYPING_START: 'typing_start',
    TYPING_STOP: 'typing_stop',
    USER_TYPING: 'user_typing',
    USER_STOPPED_TYPING: 'user_stopped_typing'
  }
};

module.exports = config;
