import './firebaseInit';
import { requestUserPermission, getFCMToken, onMessageListener, onBackgroundMessageListener } from './firebaseMessaging';
import { Platform } from 'react-native';

// Setup Firebase messaging
export const setupFirebaseMessaging = async () => {
  try {
    // Request permission
    const permissionGranted = await requestUserPermission();
    if (!permissionGranted) {
      console.log('Firebase messaging permission not granted');
      return null;
    }

    // Get FCM token
    const fcmToken = await getFCMToken();
    if (fcmToken) {
      console.log('Firebase FCM token obtained:', fcmToken);
      return fcmToken;
    }

    return null;
  } catch (error) {
    console.error('Error setting up Firebase messaging:', error);
    return null;
  }
};

// Setup message listeners
export const setupMessageListeners = () => {
  // Foreground messages (works on both web and mobile)
  onMessageListener();

  // Background messages
  onBackgroundMessageListener();
};
