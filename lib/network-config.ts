// Network Configuration for React Native
// IMPORTANT: Update this with your machine's IP address
// Find your IP: Windows - run 'ipconfig', Mac - run 'ifconfig'

// Configuration for different environments
export const NETWORK_CONFIG = {
  // Development - Replace with your machine's IP address
  DEV_BASE_URL: 'http:/192.168.254.183/hazardTrackV2/api',
  
  // Local testing
  LOCAL_BASE_URL: 'http://localhost:80/api',
  
  // Android emulator
  ANDROID_EMULATOR_URL: 'http://192.168.254.183/api',
  
  // Production (update when deploying)
  PROD_BASE_URL: 'https://dailyph.com/api',
};

// Current active URL - Change this based on your testing environment
export const API_URL = NETWORK_CONFIG.DEV_BASE_URL;

// Helper to detect environment
export const getEnvironment = () => {
  // You can add platform detection logic here
  const isEmulator = false; // Set to true for Android emulator
  const isLocal = false; // Set to true for local web testing
  
  if (isEmulator) return NETWORK_CONFIG.ANDROID_EMULATOR_URL;
  if (isLocal) return NETWORK_CONFIG.LOCAL_BASE_URL;
  
  return NETWORK_CONFIG.DEV_BASE_URL;
};

// Error handling for network issues
export const handleNetworkError = (error: any) => {
  console.error('Network Error:', error);
  
  if (error.message?.includes('Network request failed')) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      details: [
        'Make sure your phone and computer are on the same WiFi network',
        'Check if your IP address is correct (run ipconfig)',
        'Ensure Apache is running on XAMPP',
        'Verify firewall settings allow connections on port 80'
      ]
    };
  }
  
  if (error.message?.includes('timeout')) {
    return {
      success: false,
      message: 'Request timeout. Please try again.',
    };
  }
  
  return {
    success: false,
    message: error.message || 'An error occurred',
  };
};
