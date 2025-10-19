import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCycRsARlYo1skmMfKVAxXcXnFMnvoaLOs",
  authDomain: "hazardtrack-2c10d.firebaseapp.com",
  projectId: "hazardtrack-2c10d",
  storageBucket: "hazardtrack-2c10d.firebasestorage.app",
  messagingSenderId: "508600872047",
  appId: "1:508600872047:android:375a6c058361482312319a"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get Firebase messaging instance
export const firebaseMessaging = messaging();

// Request permission for notifications
export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
  return enabled;
};

// Get FCM token
export const getFCMToken = async () => {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    console.log('FCM Token:', fcmToken);
    return fcmToken;
  } else {
    console.log('Failed to get FCM token');
    return null;
  }
};

// Listen for FCM messages when app is in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
      console.log('FCM message received in foreground:', remoteMessage);
      resolve(remoteMessage);
    });
    return unsubscribe;
  });

// Listen for FCM messages when app is in background/quit
export const onBackgroundMessageListener = () =>
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('FCM message received in background:', remoteMessage);
  });

export default firebase;
