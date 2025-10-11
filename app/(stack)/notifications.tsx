// app/(resident)/NotificationsScreen.tsx
import React, { useState, useEffect } from "react"
import { ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { YStack, XStack, Text, View, Card } from "tamagui"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useRouter } from "expo-router"
import { apiGetNotifications, apiMarkNotificationRead } from "../../lib/api"
import { useAuth } from '../../context/AuthContext'

const { width } = Dimensions.get("window")
const HEADER_RED = "#D62828"

export default function NotificationsScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (token) {
        const res = await apiGetNotifications(token)
        if (res?.status === "success") {
          setNotifications(res.notifications)
        }
      }
      setLoading(false)
    }
    if (token) {
      fetchNotifications()
    }
  }, [token])

  const markAsRead = async (notificationId: number) => {
    if (!token) return
    try {
      const res = await apiMarkNotificationRead(token, notificationId)
      if (res?.status === "success") {
        // Update local state to mark as read
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n)
        )
      } else {
        Alert.alert("Error", "Failed to mark notification as read")
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      Alert.alert("Error", "Failed to mark notification as read")
    }
  }

  if (loading) {
    return (
      <View flex={1} alignItems="center" justifyContent="center" backgroundColor="#fff">
        <ActivityIndicator size="large" color={HEADER_RED} />
      </View>
    )
  }

  return (
    <View flex={1} backgroundColor="#fff">
      {/* Header */}
      <View backgroundColor={HEADER_RED} paddingTop={16} paddingBottom={14} paddingHorizontal={18}>
        <SafeAreaView>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap={12}>
              <TouchableOpacity onPress={() => router.back()}>
                <FontAwesome name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <Text color="#fff" fontSize={22} fontWeight="800">
                Notifications
              </Text>
            </XStack>

            <FontAwesome name="bell" size={22} color="#fff" />
          </XStack>
        </SafeAreaView>
      </View>

      {/* Content */}
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }} showsVerticalScrollIndicator={false}>
          <YStack gap={12}>
          {notifications.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" flex={1} paddingVertical={80}>
              <FontAwesome name="inbox" size={50} color="#ccc" />
              <Text fontSize={18} fontWeight="700" marginTop={12}>
                No Notifications Yet
              </Text>
              <Text textAlign="center" color="#666" marginTop={4}>
                You’ll receive alerts when BFP updates your reports.
              </Text>
            </YStack>
          ) : (
            notifications.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => markAsRead(item.id)}
                activeOpacity={0.7}
              >
                <Card
                  borderRadius={12}
                  padding={14}
                  borderWidth={1}
                  borderColor="rgba(0,0,0,0.06)"
                  backgroundColor={item.is_read ? "#f9f9f9" : "#fff"}
                  style={styles.cardShadow}
                >
                  <YStack gap={6}>
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize={16} fontWeight="700" color="#1C1C1E">
                        {item.title}
                      </Text>
                      {!item.is_read && (
                        <View width={8} height={8} borderRadius={4} backgroundColor="#D62828" />
                      )}
                    </XStack>
                    <Text fontSize={14} color="#333" lineHeight={20}>
                      {item.body}
                    </Text>
                    <Text fontSize={12} color="#888" marginTop={4}>
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString()}
                    </Text>
                  </YStack>
                </Card>
              </TouchableOpacity>
            ))
          )}
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
})
