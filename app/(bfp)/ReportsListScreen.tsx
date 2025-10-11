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
import { apiGetAllReports, apiGetNotifications } from "../../lib/api"
import { getUserToken } from "../../lib/storage"

type ReportItem = {
  id: string | number
  category_name?: string | null
  title?: string
  location_address?: string
  status?: string | null
  priority?: string
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

const getPriorityColor = (priority?: string) => {
  if (!priority) return '#6B7280'
  switch (priority.toLowerCase()) {
    case 'high':
    case 'emergency':
      return '#DC2626'
    case 'medium':
      return '#F59E0B'
    case 'low':
      return '#10B981'
    default:
      return '#6B7280'
  }
}

const STATUS_META: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#FFF8E1", text: "#F57C00" },
  "In-Progress": { bg: "#FFE0B2", text: "#E65100" },
  Resolved: { bg: "#E8F5E9", text: "#2E7D32" },
  Rejected: { bg: "#FFEBEE", text: "#D32F2F" },
  Closed: { bg: "#F3E5F5", text: "#7B1FA2" },
}

const getNormalizedStatus = (status?: string | null) => {
  if (!status) return "Pending"
  const s = status.toLowerCase()
  if (s === "pending" || s === "new" || s === "submitted") return "Pending"
  if (s === "in_progress" || s === "in-progress") return "In-Progress"
  if (s === "resolved") return "Resolved"
  if (s === "verified_valid" || s === "valid" || s === "verified") return "Resolved"
  if (s === "verified_false" || s === "invalid") return "Rejected"
  if (s === "rejected") return "Rejected"
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
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 60) return `${mins} mins ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs} hour${hrs > 1 ? "s" : ""} ago`
}

export default function ReportsListScreen() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportItem[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState("")

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

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await getUserToken()
      if (token) {
        const res = await apiGetNotifications(token)
        if (res?.status === "success") {
          setNotifications(res.notifications || [])
        }
      }
    } catch (err) {
      console.error("fetchNotifications:", err)
      setNotifications([])
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useFocusEffect(
    useCallback(() => {
      fetchReports()
      fetchNotifications()
    }, [fetchReports, fetchNotifications])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchReports()
    fetchNotifications()
  }, [fetchReports, fetchNotifications])

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
                  {notifications.length > 0 && (
                    <View style={styles.bellCount}>
                      <Text fontSize={11} color="#fff">{notifications.length}</Text>
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

              <Button
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
                <Filter size={18} color="$mutedFg" />
              </Button>
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
                const priorityColor = getPriorityColor(r.priority)
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
                        <View
                          width={12}
                          height={12}
                          borderRadius={999}
                          backgroundColor={priorityColor}
                          marginTop={4}
                        />
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

                        <Text fontSize={11} color={priorityColor} fontWeight="500">
                          Priority: {r.priority}
                        </Text>
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

            <Button unstyled flexDirection="column" alignItems="center" onPress={() => router.push("/(bfp)/nearby")}>
              <MapPin size={20} color="#9E9E9E" />
              <Text fontSize={11} color="#9E9E9E">
                Nearby
              </Text>
            </Button>

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
