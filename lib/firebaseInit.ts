import { initializeApp } from 'firebase/app';
import { FIREBASE_CONFIG } from './firebaseConfig';
import { Platform } from 'react-native';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Analytics for web (optional)
if (Platform.OS === 'web') {
  try {
    // Note: Analytics is not available in React Native Firebase SDK
    // This would be for web-only analytics
    console.log('Firebase initialized for web');
  } catch (error) {
    console.log('Firebase analytics not available on web');
  }
}

export default app;
