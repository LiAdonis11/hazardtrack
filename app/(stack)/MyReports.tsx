// app/(resident)/MyReports.tsx
// Pixel-focused Tamagui + Moti implementation that preserves your backend calls/navigation.
// Replace the existing file with this. It keeps apiGetAllReports/getUserToken unchanged.
import React, { useEffect, useState, useCallback } from "react"
import { ScrollView, RefreshControl, Platform, TouchableOpacity } from "react-native"
import { YStack, XStack, Text, Input, Button, View, Card, Theme } from "tamagui"
import { Pressable } from "react-native"
import { MotiView } from "moti"
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Clock,
  Flame,
  Zap,
  Home,
  AlertTriangle,
  User,
} from "@tamagui/lucide-icons"
import { useRouter } from "expo-router"
import { apiGetReports } from "../../lib/api"
import { useAuth } from '../../context/AuthContext'

type ReportItem = {
  id: string | number
  category_name?: string | null
  title?: string
  location_address?: string
  latitude?: string | number | null
  longitude?: string | number | null
  status?: string | null
  priority?: string
  created_at?: string
  assigned_to?: string
}

const COLORS = {
  fireRed: "#D32F2F",
  darkGray: "#212121",
  muted: "#f5f5f5",
  mutedFg: "#757575",
  border: "rgba(33,33,33,0.12)",
  successGreen: "#2E7D32",
  warningOrange: "#F57C00",
  infoBlue: "#1976D2",
  warningYellow: "#FBC02D",
}

const STATUS_META: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#FFF8E1", text: "#F57C00" },
  "In-Progress": { bg: "#FFE0B2", text: "#E65100" },
  Resolved: { bg: "#E8F5E9", text: "#2E7D32" },
  Rejected: { bg: "#FFEBEE", text: "#D32F2F" },
  Closed: { bg: "#F3E5F5", text: "#7B1FA2" },
}

const getIcon = (category?: string | null) => {
  const c = (category || "").toLowerCase()
  if (c.includes("fire")) return Flame
  if (c.includes("electrical")) return Zap
  if (c.includes("building")) return Home
  return AlertTriangle
}

const getPriorityColor = (priority?: string) => {
  if (!priority) return "#BDBDBD"
  if (priority === "High") return COLORS.fireRed
  if (priority === "Medium") return COLORS.warningOrange
  return COLORS.successGreen
}

const getNormalizedStatus = (status?: string | null) => {
  if (!status) return "Pending"
  const s = status.toLowerCase()
  if (s === "pending" || s === "new" || s === "submitted") return "Pending"
  if (s === "in_progress" || s === "in-progress") return "In-Progress"
  if (s === "resolved") return "Resolved"
  if (s === "rejected") return "Rejected"
  if (s === "closed") return "Closed"
  if (s === "verified_valid" || s === "valid" || s === "verified") return "Resolved"
  if (s === "verified_false" || s === "invalid") return "Rejected"
  return "Pending"
}

const getInfoForStatus = (status?: string | null) => {
  const normalized = getNormalizedStatus(status)
  switch (normalized) {
    case "In-Progress":
      return { bg: "#FFF4E6", border: "#FFE0B2", text: "🚨 BFP is actively working on this report" }
    case "Resolved":
      return { bg: "#E8F5E9", border: "#C8E6C9", text: "✅ Hazard has been resolved and verified safe" }
    case "Rejected":
      return { bg: "#FFEBEE", border: "#FFCDD2", text: "❌ Report was rejected - please check details" }
    case "Closed":
      return { bg: "#F3E5F5", border: "#E1BEE7", text: "🔒 Report has been closed" }
    default:
      return { bg: "#FFF8E1", border: "#FFECB3", text: "🕓 Awaiting BFP review" }
  }
}

export default function MyReports() {
  const router = useRouter()
  const { token } = useAuth()
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("All")

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      if (token) {
        const res = await apiGetReports(token)
        if (res?.status === "success" && Array.isArray(res.reports)) {
          setReports(res.reports)
        } else {
          setReports([])
        }
      } else {
        setReports([])
      }
    } catch (e) {
      console.warn("Fetch reports failed", e)
      setReports([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const onRefresh = () => {
    setRefreshing(true)
    fetchReports()
  }

  const stats = {
    Pending: reports.filter((r) => getNormalizedStatus(r.status) === "Pending").length,
    "In-Progress": reports.filter((r) => getNormalizedStatus(r.status) === "In-Progress").length,
    Resolved: reports.filter((r) => getNormalizedStatus(r.status) === "Resolved").length,
    Rejected: reports.filter((r) => getNormalizedStatus(r.status) === "Rejected").length,
    Closed: reports.filter((r) => getNormalizedStatus(r.status) === "Closed").length,
  }

  const filtered = reports.filter((r) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      (r.title || "").toLowerCase().includes(q)
    const matchesStatus = selectedStatus === "All" || getNormalizedStatus(r.status) === selectedStatus
    return matchesQuery && matchesStatus
  })

  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="#fafafa">
        {/* header: back + title + subtitle */}
        <YStack backgroundColor="#fff" paddingHorizontal={16} paddingTop={Platform.OS === "ios" ? 18 : 12} paddingBottom={12} borderBottomWidth={1} borderBottomColor={COLORS.border}>
          <XStack alignItems="center" gap={12}  marginTop={35} marginBottom={10}>
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={20} color={COLORS.darkGray} />
            </Pressable>
            <YStack>
              <Text fontSize={18} fontWeight="700" color={COLORS.fireRed}>My Reports</Text>
              <Text fontSize={12} color={COLORS.mutedFg}>{reports.length} total reports</Text>
            </YStack>
          </XStack>

          {/* Search and Filter */}
          <XStack gap="$2">
            <XStack flex={1} alignItems="center" borderWidth={1} borderColor="#E5E7EB" borderRadius={8} paddingHorizontal="$3" backgroundColor="white">
              <Search size={16} color="#9E9E9E" />
              <Input
                flex={1}
                placeholder="Search reports..."
                value={query}
                onChangeText={setQuery}
                borderWidth={0}
                backgroundColor="transparent"
                paddingLeft="$2"
              />
            </XStack>
            <TouchableOpacity style={{
              width: 40,
              height: 40,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white"
            }} onPress={() => setQuery("")}>
              <Filter size={16} color="#9E9E9E" />
            </TouchableOpacity>
          </XStack>
        </YStack>

        {/* status summary row (cards) */}
        <YStack paddingHorizontal={12} paddingTop={12} paddingBottom={10} backgroundColor="#fff" borderBottomWidth={1} borderBottomColor={COLORS.border}>
          <XStack justifyContent="space-between" gap={8}>
            {[
              { key: "Pending", count: stats.Pending, color: COLORS.warningYellow },
              { key: "In-Progress", count: stats["In-Progress"], color: COLORS.warningOrange },
              { key: "Resolved", count: stats.Resolved, color: COLORS.successGreen },
              { key: "Rejected", count: stats.Rejected, color: COLORS.fireRed },
              
            ].map((s) => {
              const active = selectedStatus === s.key || (selectedStatus === "All" && s.key === "Pending" && false)
              return (
                <Pressable key={s.key} onPress={() => setSelectedStatus(selectedStatus === s.key ? "All" : s.key)} style={{ flex: 1 }}>
                  <View style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    paddingVertical: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: active ? s.color : COLORS.border,
                    minHeight: 64,
                    justifyContent: "center",
                  }}>
                    <Text fontSize={18} fontWeight="700" color={s.color}>{s.count}</Text>
                    <Text fontSize={12} color={COLORS.mutedFg} marginTop={6}>{s.key}</Text>
                  </View>
                </Pressable>
              )
            })}
          </XStack>
        </YStack>

        {/* list */}
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <YStack alignItems="center" marginTop={40}>
              <Text color={COLORS.mutedFg}>Loading reports...</Text>
            </YStack>
          ) : filtered.length === 0 ? (
            <YStack alignItems="center" marginTop={40}>
              <Text color={COLORS.mutedFg}>No reports found.</Text>
            </YStack>
          ) : (
            filtered.map((r, i) => {
              const Icon = getIcon(r.category_name)
              const priorityDot = getPriorityColor(r.priority)
              const normalizedStatus = getNormalizedStatus(r.status)
              const info = getInfoForStatus(r.status)
              const badgeMeta = STATUS_META[normalizedStatus] || { bg: "#eeeeee", text: "#757575" }

              return (
                <MotiView
                  key={r.id}
                  from={{ opacity: 0, translateY: 18 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: i * 60, type: "timing", duration: 280 }}
                >
                  <Card
                    backgroundColor="#fff"
                    borderRadius={14}
                    padding={14}
                    marginBottom={14}
                    style={{
                      shadowColor: "rgba(0,0,0,0.06)",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: "rgba(0,0,0,0.03)",
                    }}
                    onPress={() => router.push(`/(stack)/ReportDetails?id=${r.id}`)}
                  >
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <XStack alignItems="center" gap={12} flex={1}>
                        <View width={44} height={44} borderRadius={12} backgroundColor="rgba(211,47,47,0.06)" alignItems="center" justifyContent="center">
                          <Icon size={20} color={COLORS.fireRed} />
                        </View>

                        <YStack flex={1} gap={6}>
                          <XStack alignItems="center" justifyContent="space-between">
                            <Text fontSize={15} fontWeight="700" color={COLORS.darkGray} numberOfLines={1} flex={1}>
                              {r.category_name || r.title || "Unknown"}
                            </Text>
                            <View width={10} height={10} borderRadius={999} backgroundColor={priorityDot} marginLeft={8} />
                          </XStack>

                          <YStack gap={4}>
                            <XStack alignItems="center" gap={6}>
                              <MapPin size={14} color={COLORS.mutedFg} />
                              <Text fontSize={13} color={COLORS.mutedFg} numberOfLines={1} flex={1}>
                                {r.location_address || "Unknown location"}
                              </Text>
                            </XStack>
                            <XStack alignItems="center" gap={6}>
                              <Clock size={14} color={COLORS.mutedFg} />
                              <Text fontSize={13} color={COLORS.mutedFg} numberOfLines={1}>
                                {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                              </Text>
                            </XStack>
                          </YStack>

                          {r.title && r.title !== r.category_name ? (
                            <Text fontSize={13} color={COLORS.mutedFg} marginTop={4} numberOfLines={2}>
                              {r.title}
                            </Text>
                          ) : null}
                        </YStack>
                      </XStack>
                    </XStack>

                    {/* Status Information Box */}
                    <View backgroundColor={info.bg} borderRadius={10} padding={12} marginTop={14} style={{ borderWidth: 1, borderColor: info.border }}>
                      <Text fontSize={13} color={COLORS.darkGray} lineHeight={18}>
                        {info.text}
                      </Text>
                    </View>

                    {/* Footer: Status Badge and GPS Coordinates */}
                    <YStack gap={8} marginTop={14}>
                      <XStack justifyContent="space-between" alignItems="center">
                        <View backgroundColor={badgeMeta.bg} borderRadius={8} paddingHorizontal={24} paddingVertical={12}>
                          <Text fontSize={12} fontWeight="600" color={badgeMeta.text}>
                            {normalizedStatus}
                          </Text>
                        </View>
                        {(r.latitude || r.longitude) && (
                          <XStack alignItems="center" gap={6}>
                            <MapPin size={12} color={COLORS.mutedFg} />
                            <Text fontSize={11} color={COLORS.mutedFg}>
                              {r.latitude ? parseFloat(String(r.latitude)).toFixed(4) : '?'}°, {r.longitude ? parseFloat(String(r.longitude)).toFixed(4) : '?'}°
                            </Text>
                          </XStack>
                        )}
                      </XStack>
                    </YStack>
                  </Card>
                </MotiView>
              )
            })
          )}
        </ScrollView>
      </YStack>
    </Theme>
  )
}
