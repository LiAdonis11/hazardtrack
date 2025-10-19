import { useEffect } from 'react';
import { Platform, DeviceEventEmitter } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getUserData } from '../lib/storage';

export default function NotificationHandler() {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    // Skip on web
    if (Platform.OS === 'web') return;

    const setupNotifications = async () => {
      // Set up notification handler for when app is in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'HazardTrack Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#D62828',
          showBadge: true,
        });
      }
    };

    setupNotifications();

    // Handle notification received while app is in foreground
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received while app is in foreground:', notification);
      // Emit event to refresh notifications in the context
      DeviceEventEmitter.emit('notificationReceived');
    });

    // Handle notification tapped (when app is in background or closed)
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(async response => {
      console.log('Notification tapped:', response);

      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data?.report_id) {
        // Get user data to determine role
        const userData = await getUserData();
        const userRole = userData?.role;

        // For BFP personnel and inspectors, navigate to BFP report details
        if (userRole === 'inspector') {
          router.push(`/(bfp)/ReportDetails?id=${data.report_id}`);
        } else {
          // For residents, navigate to resident report details
          router.push(`/(stack)/ReportDetails?id=${data.report_id}`);
        }
      } else {
        // Get user data to determine role for non-report notifications
        const userData = await getUserData();
        const userRole = userData?.role;

        // For BFP personnel and inspectors, navigate to BFP notifications screen
        if (userRole === 'inspector') {
          router.push('/(bfp)/notifications');
        } else {
          // For residents, navigate to resident notifications screen
          router.push('/(stack)/notifications');
        }
      }
    });

    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, [router, token]);

  return null;
}
