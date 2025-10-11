import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="report-hazard" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="EmergencyScreen" options={{ headerShown: false }} />
      <Stack.Screen name="MyReports" options={{ headerShown: false }} />
      <Stack.Screen name="ReportDetails" options={{ headerShown: false }} />
    </Stack>
  );
}
