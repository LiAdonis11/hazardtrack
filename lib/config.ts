import { Platform } from 'react-native'

// Use localhost for web testing
const API_URL_WEB = 'http://192.168.254.183/hazardTrackV2/api'

// For mobile device access, use your machine's IP address
// Current IP based on ipconfig: 10.124.198.150 (backup IP)
export const API_URL_MOBILE = 'http://192.168.254.183/hazardTrackV2/api'

// Detect platform and use appropriate URL
export const API_URL = Platform.OS === 'web' ? API_URL_WEB :
  Platform.OS === 'android' ? 'http://192.168.254.183/hazardTrackV2/api' :
  Platform.OS === 'ios' ? 'http://localhost/hazardTrackV2/api' :
  API_URL_MOBILE

// For Android emulator, use:
// export const API_URL = 'http://10.0.2.2/hazardTrackV2/api'

// For iOS simulator, use:
// export const API_URL = 'http://localhost/hazardTrackV2/api'
