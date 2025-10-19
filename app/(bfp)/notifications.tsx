// app/(bfp)/NotificationsScreen.tsx
import React from "react"
import { ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { YStack, XStack, Text, View, Card } from "tamagui"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useRouter } from "expo-router"
import { useNotifications } from "../../context/NotificationsContext"

const { width } = Dimensions.get("window")
const HEADER_RED = "#D62828"

export default function NotificationsScreen() {
  const router = useRouter()
  const { notifications, loading, refreshing, onRefresh, markAsRead } = useNotifications()

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
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 18 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <YStack gap={12}>
          {notifications.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" flex={1} paddingVertical={80}>
              <FontAwesome name="inbox" size={50} color="#ccc" />
              <Text fontSize={18} fontWeight="700">
                No Notifications Yet
              </Text>
              <Text textAlign="center" color="#666" marginTop={4}>
                You’ll receive alerts when reports are updated or new inspections are assigned.
              </Text>
            </YStack>
          ) : (
            notifications.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  // Check if notification has report_id and navigate to report details
                  if (item.report_id) {
                    router.push(`/(bfp)/ReportDetails?id=${item.report_id}`);
                  } else {
                    markAsRead(item.id);
                  }
                }}
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
