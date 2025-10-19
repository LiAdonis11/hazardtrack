// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCycRsARlYo1skmMfKVAxXcXnFMnvoaLOs",
  authDomain: "hazardtrack-2c10d.firebaseapp.com",
  projectId: "hazardtrack-2c10d",
  storageBucket: "hazardtrack-2c10d.firebasestorage.app",
  messagingSenderId: "508600872047",
  appId: "1:508600872047:android:375a6c058361482312319a"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'HazardTrack Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico', // Add your app icon
    badge: '/favicon.ico',
    data: payload.data || {},
    tag: 'hazardtrack-notification' // Prevents duplicate notifications
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('hazardtrack') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/'); // Open your app's main page
      }
    })
  );
});
