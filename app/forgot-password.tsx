import React, { useState } from "react";
import {
  Alert,
  TouchableOpacity,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Text, YStack, XStack, Card } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Shield, Mail, ArrowLeft } from "@tamagui/lucide-icons";
import { apiForgotPassword } from "../lib/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await apiForgotPassword(email);

      if (res.status === "success") {
        Alert.alert(
          "Reset Code Sent",
          `Your reset code is: ${res.reset_code}\n\nUse this code to reset your password.`,
          [
            {
              text: "OK",
              onPress: () => router.push("/reset-password"),
            },
          ]
        );
      } else {
        Alert.alert("Error", res.message || "Failed to send reset code");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
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
        {/* Back Button */}
        <XStack width="100%" justifyContent="flex-start">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <ArrowLeft size={20} color="#E53935" />
          </TouchableOpacity>
        </XStack>

        {/* Top Section */}
        <YStack alignItems="center" gap={8}>
          <View
            style={{
              width: 90,
              height: 90,
              backgroundColor: "#E53935",
              borderRadius: 45,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#E53935",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}
          >
            <Shield size={46} color="white" />
          </View>

          <Text
            fontSize={18}
            fontWeight="600"
            color="#E53935"
            textAlign="center"
          >
            Forgot Password
          </Text>
          <Text
            fontSize={14}
            color="#757575"
            textAlign="center"
            maxWidth={260}
            marginTop={2}
          >
            Enter your email address and we'll send you a reset code
          </Text>
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
            Reset Password
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
                  value={email}
                  onChangeText={setEmail}
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

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleForgotPassword}
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
                  Send Reset Code
                </Text>
              )}
            </TouchableOpacity>
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
