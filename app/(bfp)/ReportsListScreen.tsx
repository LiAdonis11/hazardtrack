// app/(bfp)/ReportsListScreen.tsx
import React, { useEffect, useState, useCallback } from "react"
import { ScrollView, RefreshControl, TouchableOpacity, StyleSheet, Alert } from "react-native"
import {
  YStack,
  XStack,
  Text,
  View,
  Input,
  Button,
  Card,
  Theme,
} from "tamagui"
import {
  Search,
  Filter,
  MapPin,
  Flame,
  Zap,
  Home,
  Factory,
  AlertTriangle,
  User,
} from "@tamagui/lucide-icons"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { MotiView } from "moti"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { apiGetAllReports } from "../../lib/api"
import { useNotifications } from "../../context/NotificationsContext"
import { getUserToken } from "../../lib/storage"

type ReportItem = {
  id: string | number
  category_name?: string | null
  title?: string
  location_address?: string
  status?: string | null
  created_at?: string
}

const getIcon = (category: string | null | undefined = "") => {
  const c = (category || "").toLowerCase()
  if (c.includes("fire")) return Flame
  if (c.includes("electrical")) return Zap
  if (c.includes("building")) return Home
  if (c.includes("industrial")) return Factory
  return AlertTriangle
}



const STATUS_META: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#9CA3AF", text: "#FFFFFF" },
  "In-Progress": { bg: "#F59E0B", text: "#FFFFFF" },
  Verified: { bg: "#1D4ED8", text: "#FFFFFF" },
  Invalid: { bg: "#EF4444", text: "#FFFFFF" },
  Resolved: { bg: "#16A34A", text: "#FFFFFF" },
  Closed: { bg: "#B91C1C", text: "#FFFFFF" },
}

const getNormalizedStatus = (status?: string | null) => {
  if (!status) return "Pending"
  const s = status.toLowerCase()
  if (s === "pending" || s === "new" || s === "submitted") return "Pending"
  if (s === "in_progress" || s === "in-progress") return "In-Progress"
  if (s === "resolved") return "Resolved"
  if (s === "verified_valid" || s === "valid" || s === "verified") return "Verified"
  if (s === "verified_false" || s === "invalid") return "Invalid"
  if (s === "closed") return "Closed"
  return "Pending"
}

const getStatusBadge = (status?: string | null) => {
  const normalized = getNormalizedStatus(status)
  return STATUS_META[normalized] || { bg: "#EEEEEE", text: "#555" }
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return "Unknown time"
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function ReportsListScreen() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState("")
  const { unreadCount } = useNotifications()

  const fetchReports = useCallback(async () => {
    try {
      const token = await getUserToken()
      if (token) {
        const res = await apiGetAllReports(token)
        if (res?.status === "success" && Array.isArray(res.reports)) {
          setReports(res.reports)
        }
      }
    } catch (e) {
      console.warn("Fetch reports failed", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])



  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useFocusEffect(
    useCallback(() => {
      fetchReports()
    }, [fetchReports])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchReports()
  }, [fetchReports])

  const filtered = reports.filter((r) =>
    (r.category_name || r.title || "")
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$backgroundLight">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <YStack
            backgroundColor="$cardBgLight"
            paddingHorizontal="$4"
            paddingVertical="$5"
            borderBottomWidth={1}
            borderBottomColor="$border"
            shadowColor="rgba(0,0,0,0.05)"
            shadowRadius={2}
          >
            <XStack justifyContent="space-between" alignItems="center" marginTop={30} marginBottom={12}>
              <Text color="$fireRed" fontSize={20} fontWeight="700">
                Incoming Hazard Reports
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(bfp)/notifications")}
                activeOpacity={0.8}
              >
                <View
                  width={36}
                  height={36}
                  borderRadius={18}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="rgba(214,40,40,0.1)"
                >
                  <FontAwesome name="bell" size={16} color="#D62828" />
                  {unreadCount > 0 && (
                    <View style={styles.bellCount}>
                      <Text fontSize={11} color="#fff">{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </XStack>

            <XStack gap="$2" alignItems="center">
              <XStack flex={1} position="relative">
                <View position="absolute" left={12} top={12}>
                  <Search size={18} color="$mutedFg" />
                </View>
                <Input
                  flex={1}
                  height={44}
                  backgroundColor="$muted"
                  borderColor="$border"
                  borderWidth={1}
                  borderRadius={12}
                  paddingLeft={38}
                  placeholder="Search reports..."
                  value={query}
                  onChangeText={setQuery}
                  fontSize={14}
                />
              </XStack>

              {/* <Button
                width={44}
                height={44}
                borderRadius={12}
                backgroundColor="$cardBgLight"
                borderWidth={1}
                borderColor="$border"
                alignItems="center"
                justifyContent="center"
                pressStyle={{ backgroundColor: "$muted" }}
              >
                <Filter size={28} color="$mutedFg" />
              </Button> */}
            </XStack>
          </YStack>

          {/* Reports List */}
          <YStack padding="$4" gap="$4" paddingBottom="$4">
            {loading ? (
              <Text textAlign="center" color="$mutedFg" marginTop="$6">
                Loading reports...
              </Text>
            ) : filtered.length === 0 ? (
              <Text textAlign="center" color="$mutedFg" marginTop="$6">
                No reports found.
              </Text>
            ) : (
              filtered.map((r, i) => {
                const Icon = getIcon(r.category_name)
                const normalized = getNormalizedStatus(r.status)
                const badge = getStatusBadge(r.status)
                return (
                  <MotiView
                    key={r.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 300, delay: i * 60 }}
                  >
                    <Card
                      backgroundColor="$cardBgLight"
                      borderRadius={16}
                      padding={16}
                      shadowColor="rgba(0,0,0,0.1)"
                      shadowOpacity={0.08}
                      shadowRadius={4}
                      pressStyle={{ scale: 0.98 }}
                      onPress={() => router.push(`/(bfp)/details?id=${r.id}`)}
                    >
                      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={12}>
                        <XStack alignItems="center" gap={12} flex={1}>
                          <View
                            width={50}
                            height={50}
                            borderRadius={16}
                            backgroundColor="rgba(211,47,47,0.08)"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon size={22} color="#D32F2F" />
                          </View>
                          <YStack flex={1} gap={4}>
                            <Text fontSize={14} fontWeight="600" color="$darkGray">
                              {r.category_name || r.title || ""}
                            </Text>
                            <Text fontSize={11} color="$mutedFg">
                              {formatTime(r.created_at)}
                            </Text>
                          </YStack>
                        </XStack>

                      </XStack>

                      <XStack alignItems="center" gap={8} marginBottom={12} backgroundColor="$muted" borderRadius={12} paddingHorizontal={12} paddingVertical={8}>
                        <MapPin size={14} color="$mutedFg" />
                        <Text fontSize={12} color="$darkGray" numberOfLines={1}>
                          {r.location_address || "Unknown location"}
                        </Text>
                      </XStack>

                      <XStack justifyContent="space-between" alignItems="center" marginTop={8}>
                        <View
                          backgroundColor={badge.bg}
                          borderRadius={10}
                          paddingHorizontal={20}
                          paddingVertical={10}
                        >
                          <Text fontSize={11} color={badge.text} fontWeight="600">
                            {normalized}
                          </Text>
                        </View>


                      </XStack>
                    </Card>
                  </MotiView>
                )
              })
            )}
          </YStack>

        </ScrollView>

        {/* Bottom Navigation */}
        <YStack
          backgroundColor="#ffffffE6"
          borderTopWidth={1}
          borderTopColor="$border"
          paddingVertical="$4"
          // paddingBottom="$6"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <XStack justifyContent="space-around" alignItems="center">
            <Button unstyled flexDirection="column" alignItems="center">
              <AlertTriangle size={20} color="#D32F2F" />
              <Text fontSize={11} color="#D32F2F">
                Reports
              </Text>
            </Button>

            {/* <Button unstyled flexDirection="column" alignItems="center" onPress={() => router.push("/(bfp)/nearby")}>
              <MapPin size={20} color="#9E9E9E" />
              <Text fontSize={11} color="#9E9E9E">
                Nearby
              </Text>
            </Button> */}

            <Button unstyled flexDirection="column" alignItems="center" onPress={() => router.push("/(bfp)/profile")}>
              <User size={20} color="#9E9E9E" />
              <Text fontSize={11} color="#9E9E9E">
                Profile
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Theme>
  )
}

const styles = StyleSheet.create({
  bellCount: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFD54F",
    alignItems: "center",
    justifyContent: "center",
  },
})
