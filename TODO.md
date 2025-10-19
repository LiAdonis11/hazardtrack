# Firebase Integration for Push Notifications

## Current Status
- App uses Expo Notifications (already configured)
- Backend saves push tokens via `apiSavePushToken`
- Notification handling in `NotificationHandler.tsx`

## Tasks
- [ ] Install Firebase SDK dependencies
- [ ] Add Firebase configuration to config.ts
- [ ] Initialize Firebase in App.tsx
- [ ] Replace Expo push token with FCM token
- [ ] Update notification handling for FCM
- [ ] Test FCM notifications
- [ ] Update backend to send FCM notifications (if needed)

## Dependencies to Install
- @react-native-firebase/app
- @react-native-firebase/messaging

## Firebase Config
Project ID: hazardtrack-86db8
API Key: AIzaSyChHvGGjswR48futD9vsa2x5OExR9QIE-E
Messaging Sender ID: 876406657397
App ID: 1:876406657397:android:4f9da01046e610e8d3433c
