import React, { useState } from "react";
import {
  Alert,
  TouchableOpacity,
  TextInput,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Text, YStack, XStack, Card, Input } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock } from "@tamagui/lucide-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { setUserData } from "../lib/storage";
import { apiLogin } from "../lib/api";
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await apiLogin({ email: username, password });

      if (res.status === "success") {
        await setToken(res.token);
        await setUserData(res.user);

        const userRole = res.user.role;
        if (userRole === "inspector" || userRole === "bfp_personnel") {
          router.replace("/(bfp)");
        } else {
          router.replace("/(stack)");
        }

        if (global.triggerAuthCheck) global.triggerAuthCheck();
      } else {
        Alert.alert("Login Failed", res.message || "Incorrect username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal={24}
        gap={32}
      >
        {/* Top Section */}
        <YStack alignItems="center" gap={8}>
          <Image
            source={require('../assets/logos/hazartrack-logo.png')}
            style={{
              width: 90,
              height: 90,
              resizeMode: 'contain',
            }}
          />

          <Text
            fontSize={18}
            fontWeight="600"
            color="#E53935"
            textAlign="center"
            marginTop={8}
          >
            Sign In to Your Account
          </Text>
          <Text
            fontSize={14}
            color="#757575"
            textAlign="center"
            maxWidth={260}
            marginTop={2}
          >
            Report fire hazards in your community
          </Text>

          <YStack alignItems="center" gap={4} marginTop={8}>
            <Text fontSize={12} color="#9E9E9E">Powered by:</Text>
            <XStack alignItems="center" gap={8}>
              <Image
                source={require('../assets/logos/tagudin-logo.png')}
                style={{
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                }}
              />
              <Image
                source={require('../assets/logos/bfp-logo.png')}
                style={{
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                }}
              />
            </XStack>
          </YStack>
        </YStack>

        {/* Card */}
        <Card
          width="100%"
          maxWidth={350}
          padding={24}
          borderRadius={16}
          backgroundColor="white"
          shadowColor="#000"
          shadowOpacity={0.1}
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 3 }}
          elevation={5}
        >
          <Text
            fontSize={20}
            fontWeight="700"
            color="#202124"
            textAlign="center"
            marginBottom={20}
          >
            Welcome Back
          </Text>

          <YStack gap={16}>
            {/* Email */}
            <YStack gap={6}>
              <Text fontSize={14} color="#202124" fontWeight="500">
                Email Address
              </Text>
              <XStack
                alignItems="center"
                backgroundColor="#F6F6F6"
                borderRadius={8}
                paddingHorizontal={12}
                paddingVertical={2}
                borderWidth={1}
                borderColor="#E0E0E0"
              >
                <Mail size={18} color="#9E9E9E" />
                <TextInput
                  placeholder="Enter your email"
                  value={username}
                  onChangeText={setUsername}
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    fontSize: 15,
                    color: "#202124",
                  }}
                  placeholderTextColor="#9E9E9E"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </XStack>
            </YStack>

            {/* Password */}
            <YStack gap={6}>
              <Text fontSize={14} color="#202124" fontWeight="500">
                Password
              </Text>
              <XStack
                alignItems="center"
                backgroundColor="#F6F6F6"
                borderRadius={8}
                paddingHorizontal={12}
                paddingVertical={2}
                borderWidth={1}
                borderColor="#E0E0E0"
              >
                <Lock size={18} color="#9E9E9E" />
                <Input
                  flex={1}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  borderWidth={0}
                  backgroundColor="transparent"
                  fontSize={15}
                  color="#202124"
                  placeholderTextColor="#9E9E9E"
                  marginLeft={8}
                />
                <FontAwesome
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={18}
                  color="#9E9E9E"
                  onPress={() => setShowPassword(!showPassword)}
                />
              </XStack>
            </YStack>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: "#E53935",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
                marginTop: 4,
                shadowColor: "#E53935",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text color="white" fontSize={16} fontWeight="600">
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Links */}
            <TouchableOpacity
              style={{ alignSelf: "center" }}
              onPress={() => router.push("/forgot-password")}
            >
              <Text
                color="#E53935"
                fontSize={14}
                style={{ textDecorationLine: "underline", marginTop: 6 }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Text
              fontSize={14}
              color="#444"
              textAlign="center"
              marginTop={8}
            >
              Don't have an account?{" "}
              <Text
                color="#E53935"
                fontWeight="600"
                onPress={() => router.push("/register")}
              >
                Register here
              </Text>
            </Text>
          </YStack>
        </Card>

        {/* Footer */}
        <Text fontSize={12} color="#9E9E9E" textAlign="center">
          Philippine Bureau of Fire Protection
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
