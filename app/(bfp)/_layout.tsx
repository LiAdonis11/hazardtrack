import { Stack } from 'expo-router'

export default function BFPLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="communication" />
      <Stack.Screen name="details" />
      <Stack.Screen name="nearby" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
    </Stack>
  )
}
