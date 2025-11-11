import { useEffect, useCallback } from 'react';
import { Platform, DeviceEventEmitter, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getUserData } from '../lib/storage';
import { apiSavePushToken } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function NotificationHandler() {
  const router = useRouter();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Memoize invalidateQueriesForNotification to avoid recreating it
  const invalidateQueriesForNotification = useCallback((data: any) => {
    if (!data) return;

    try {
      // Invalidate reports queries when report-related notification is received
      if (data.report_id) {
        console.log('🔄 Invalidating queries for report:', data.report_id);
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        queryClient.invalidateQueries({ queryKey: ['report', data.report_id] });
        queryClient.invalidateQueries({ queryKey: ['my-reports'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } else {
        // Invalidate notifications queries for general notifications
        console.log('🔄 Invalidating notifications queries');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }

      // Invalidate user-specific queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['user-data'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

    } catch (error) {
      console.error('❌ Error invalidating queries:', error);
    }
  }, [queryClient]);

  // Memoize handleNotificationNavigation to avoid recreating it
  const handleNotificationNavigation = useCallback(async (data: any) => {
    if (!data) {
      console.log('⚠️ No notification data provided');
      return;
    }

    console.log('📍 Handling notification navigation with data:', data);

    try {
      // Navigate based on notification type
      if (data.report_id) {
        console.log('📋 Report notification detected, report_id:', data.report_id);

        // Get user data to determine role
        const userData = await getUserData();
        const userRole = userData?.role;

        console.log('👤 User role:', userRole);

        // For BFP personnel and inspectors, navigate to BFP report details
        if (userRole === 'inspector') {
          console.log('🔗 Navigating to BFP report details');
          router.push(`/(bfp)/ReportDetails?id=${data.report_id}`);
        } else {
          // For residents, navigate to resident report details
          console.log('🔗 Navigating to resident report details');
          router.push(`/(stack)/ReportDetails?id=${data.report_id}`);
        }
      } else {
        // Get user data to determine role for non-report notifications
        const userData = await getUserData();
        const userRole = userData?.role;

        console.log('👤 User role for general notification:', userRole);

        // For BFP personnel and inspectors, navigate to BFP notifications screen
        if (userRole === 'inspector') {
          console.log('🔗 Navigating to BFP notifications');
          router.push('/(bfp)/notifications');
        } else {
          // For residents, navigate to resident notifications screen
          console.log('🔗 Navigating to resident notifications');
          router.push('/(stack)/notifications');
        }
      }
    } catch (error) {
      console.error('❌ Error handling notification navigation:', error);
    }
  }, [router]);

  useEffect(() => {
    // Setup notification listeners for Expo Notifications
    const setupNotificationListeners = () => {
      try {
        console.log('🔔 Setting up notification listeners...');

        // Handle notification received while app is foregrounded
        const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('📬 Notification received in foreground:', notification);

          // Invalidate and refetch relevant queries when notification is received
          const data = notification.request.content.data;
          if (data) {
            invalidateQueriesForNotification(data);
          }
        });

        // Handle notification opened from background/quit state
        const notificationOpenedSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('👆 Notification opened from background:', response);
          const data = response.notification.request.content.data;

          console.log('📊 Notification data:', data);

          // Invalidate queries and navigate
          if (data) {
            invalidateQueriesForNotification(data);
          }
          handleNotificationNavigation(data);
        });

        // Check if app was opened from a notification (when app was quit)
        Notifications.getLastNotificationResponseAsync().then(response => {
          if (response) {
            console.log('🚀 App opened from quit state:', response);
            const data = response.notification.request.content.data;

            console.log('📊 Last notification data:', data);

            // Invalidate queries for quit state notification
            if (data) {
              invalidateQueriesForNotification(data);
            }
            handleNotificationNavigation(data);
          }
        });

        return () => {
          console.log('🧹 Cleaning up notification listeners');
          notificationReceivedSubscription.remove();
          notificationOpenedSubscription.remove();
        };
      } catch (error) {
        console.error('❌ Error setting up notification listeners:', error);
        return () => {};
      }
    };

    const cleanup = setupNotificationListeners();

    return cleanup;
  }, [router, queryClient, invalidateQueriesForNotification, handleNotificationNavigation]);

  return null;
}
