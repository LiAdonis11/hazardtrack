import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import { useColorScheme } from 'react-native';
import { getUserToken, getUserData } from '../lib/storage';
import { apiSavePushToken } from '../lib/api';
import { AuthProvider } from '../context/AuthContext';
import SplashScreen from './SplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Polyfill Buffer for web compatibility
if (Platform.OS === 'web') {
  import('buffer').then(({ Buffer }) => {
    global.Buffer = Buffer;
  });
}

// Global function to trigger authentication check
declare global {
  var triggerAuthCheck: (() => void) | undefined;
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      ExpoSplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'light'}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authCheckTrigger, setAuthCheckTrigger] = useState(0);

  async function registerForPushNotificationsAsync(Notifications: any) {
    // Skip push notifications in Expo Go as they are not supported since SDK 53
    if (Constants.executionEnvironment === 'storeClient') {
      console.log('Skipping push notifications in Expo Go');
      return;
    }

    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

    // Save the token to your backend
    const userToken = await getUserToken();
    if (userToken && token) {
      await apiSavePushToken(userToken, token);
    }

    return token;
  }

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('visible');
      const backgroundColor = colorScheme === 'dark' ? '#000' : '#FFF';
      NavigationBar.setBackgroundColorAsync(backgroundColor);
      NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
    }
  }, [colorScheme]);

  useEffect(() => {
    console.log('🔄 Authentication check useEffect triggered, trigger:', authCheckTrigger);
    const checkAuth = async () => {
      console.log('Checking authentication status...');
      const token = await getUserToken();
      if (token) {
        const userData = await getUserData();
        console.log('User data retrieved:', userData);
        setUserRole(userData?.role || null);
        setIsAuthenticated(true);
        // Register for push notifications after user is authenticated (skip on web)
        if (Platform.OS !== 'web') {
          (async () => {
            try {
              const { default: Notifications } = await import('expo-notifications');
              if (Notifications && Notifications.setNotificationHandler) {
                Notifications.setNotificationHandler({
                  handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                    shouldShowBanner: true,
                    shouldShowList: true,
                  }),
                });
                await registerForPushNotificationsAsync(Notifications);
              } else {
                console.log('Notifications API not available');
              }
            } catch (error) {
              console.log('Failed to setup notifications:', error);
            }
          })();
        }
      } else {
        console.log('User not logged in, setting role to null');
        setUserRole(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [authCheckTrigger]);

  // Set up global function to trigger auth check
  useEffect(() => {
    global.triggerAuthCheck = () => {
      console.log('Global triggerAuthCheck called');
      setAuthCheckTrigger(prev => prev + 1);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) {
      console.log('Authentication state is null, skipping navigation check');
      return;
    }

    const inStackGroup = segments[0] === '(stack)';
    const inBfpGroup = segments[0] === '(bfp)';
    const isLoginPage = segments[0] === 'login';
    const isRegisterPage = segments[0] === 'register';
    const isReportDetailsPage = segments[0] === 'ReportDetails';

    console.log('Navigation check:', {
      isAuthenticated,
      userRole,
      segments: segments[0],
      inStackGroup,
      inBfpGroup,
      isLoginPage,
      isRegisterPage,
      isReportDetailsPage
    });

    if (isAuthenticated && !inStackGroup && !inBfpGroup && !isReportDetailsPage) {
      // Route based on user role
      if (userRole === 'bfp_personnel' || userRole === 'inspector') {
        console.log('Redirecting BFP personnel to (bfp)');
        router.replace('/(bfp)');
      } else {
        console.log('Redirecting resident to (stack)');
        router.replace('/(stack)');
      }
    } else if (!isAuthenticated && (inStackGroup || inBfpGroup)) {
      // Redirect unauthenticated users away from protected groups to login
      console.log('Redirecting unauthenticated user to login');
      router.replace('/login');
    } else {
      console.log('No navigation action needed');
    }
  }, [isAuthenticated, segments, userRole]);

  if (isAuthenticated === null) {
    return null; // Show loading state while checking auth
  }

  return <Slot />;
}
