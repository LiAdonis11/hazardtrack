import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import firebase from './firebaseInit';
import { Platform } from 'react-native';

let messaging: any = null;

// Initialize messaging for both web and mobile
const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(firebase);
      console.log('Firebase messaging initialized for', Platform.OS === 'web' ? 'web' : 'mobile');
    } else {
      console.log('Firebase messaging not supported on this device');
    }
  } catch (error) {
    console.log('Firebase messaging not supported:', error);
  }
};

// Initialize messaging
initializeMessaging();

// Request permission for notifications
export const requestUserPermission = async () => {
  try {
    if (Platform.OS === 'web') {
      const permission = await Notification.requestPermission();
      const enabled = permission === 'granted';
      if (enabled) {
        console.log('Web notification permission granted');
      } else {
        console.log('Web notification permission denied');
      }
      return enabled;
    } else {
      // For mobile, permissions are handled by Expo Notifications
      console.log('Mobile notification permissions handled by Expo');
      return true;
    }
  } catch (error) {
    console.log('Error requesting notification permission:', error);
    return false;
  }
};

// Get FCM token
export const getFCMToken = async () => {
  try {
    if (!messaging) {
      console.log('Firebase messaging not initialized');
      return null;
    }

    const fcmToken = await getToken(messaging, {
      vapidKey: 'BPqnFGV6PeBDH05qvgEVeJluwOjRUCZU-I62rPWLVhQDHHI_fhCAi_rayI4o7mi_Ohll_I1Qt1kCxASFNcl7pRs'
    });
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    } else {
      console.log('Failed to get FCM token');
      return null;
    }
  } catch (error) {
    console.log('Error getting FCM token:', error);
    return null;
  }
};

// Listen for FCM messages when app is in foreground
export const onMessageListener = () => {
  if (!messaging) {
    console.log('Firebase messaging not available for message listener');
    return null;
  }

  return onMessage(messaging, (payload: any) => {
    console.log('FCM message received in foreground:', payload);
    return payload;
  });
};

// Listen for FCM messages when app is in background/quit
export const onBackgroundMessageListener = () => {
  if (Platform.OS === 'web') {
    // Register service worker for web background messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered for background messages:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  } else {
    // Note: onBackgroundMessage is not available in React Native Firebase SDK
    // Background messages are handled by the native Android/iOS push notification systems
    console.log('Background message handling setup for mobile');
  }
};
