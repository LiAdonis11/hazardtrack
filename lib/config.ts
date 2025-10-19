import { Platform } from 'react-native'

// Set to true for online deployment, false for local development
const IS_ONLINE = true

// Online API URL
const API_URL_ONLINE = 'https://dailyph.com/api'

// Local API URLs
const API_URL_LOCAL_WEB = 'http://192.168.1.39/api'
const API_URL_LOCAL_MOBILE = 'http://192.168.1.39/api'

// Detect platform and use appropriate URL
export const API_URL = IS_ONLINE ? API_URL_ONLINE :
  Platform.OS === 'web' ? API_URL_LOCAL_WEB :
  Platform.OS === 'android' ? API_URL_LOCAL_MOBILE :
  Platform.OS === 'ios' ? 'https://dailyph.com/api' :
  API_URL_LOCAL_MOBILE

// For Android emulator, use:
// export const API_URL = 'http://10.0.2.2/hazardTrackV2/api'

// For iOS simulator, use:
// export const API_URL = 'http://localhost/hazardTrackV2/api'
