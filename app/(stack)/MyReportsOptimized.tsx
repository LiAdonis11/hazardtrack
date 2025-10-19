import React, { useState, useCallback, useMemo, memo } from "react"
import { FlatList, RefreshControl, Platform, TouchableOpacity, ActivityIndicator } from "react-native"
import { YStack, XStack, Text, Input, View, Theme } from "tamagui"
import { Pressable } from "react-native"
import { ArrowLeft, Search, Filter } from "@tamagui/lucide-icons"
import { useRouter } from "expo-router"
import { useQuery } from '@tanstack/react-query'
import { apiGetReports } from "../../lib/api"
import { getUserToken } from "../../lib/storage"
import ReportCard from "../../components/ReportCard"
import { flatListProps, colors } from "../../lib/responsive"

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

const MyReportsOptimized = memo(() => {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("All")

  // Use React Query for data fetching
  const { data: reports = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-reports'],
    queryFn: async (): Promise<ReportItem[]> => {
      const token = await getUserToken()
      if (token) {
        const res = await apiGetReports(token)
        return res?.status === "success" && Array.isArray(res.reports) ? res.reports : []
      }
      return []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })

  const onRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Memoized stats calculation
  const stats = useMemo(() => ({
    Pending: reports.filter((r: ReportItem) => getNormalizedStatus(r.status) === "Pending").length,
    "In-Progress": reports.filter((r: ReportItem) => getNormalizedStatus(r.status) === "In-Progress").length,
    Resolved: reports.filter((r: ReportItem) => getNormalizedStatus(r.status) === "Resolved").length,
    Verified: reports.filter((r: ReportItem) => getNormalizedStatus(r.status) === "Verified").length,
    // Rejected: reports.filter((r: ReportItem) => getNormalizedStatus(r.status) === "Rejected").length,
    Closed: reports.filter((r: ReportItem) => getNormalizedStatus(r.status) === "Closed").length,
  }), [reports])

  // Memoized filtered reports
  const filteredReports = useMemo(() => {
    if (selectedStatus === "All") return reports
    return reports.filter((r: ReportItem) => getNormalizedStatus(r.status) === selectedStatus)
  }, [reports, selectedStatus])

  const renderItem = useCallback(({ item, index }: { item: ReportItem; index: number }) => (
    <ReportCard report={item} index={index} />
  ), [])

  const keyExtractor = useCallback((item: ReportItem) => item.id.toString(), [])

  const ListHeader = useMemo(() => (
    <YStack>
      {/* header: back + title + subtitle */}
      <YStack backgroundColor="#fff" paddingHorizontal={16} paddingTop={Platform.OS === "ios" ? 18 : 12} paddingBottom={12} borderBottomWidth={1} borderBottomColor={COLORS.border}>
        <XStack alignItems="center" gap={12} marginTop={35} marginBottom={10}>
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
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white"
            }}
            onPress={() => setQuery("")}
          >
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
            { key: "Verified", count: stats.Verified, color: COLORS.infoBlue },
          ].map((s) => {
            const active = selectedStatus === s.key
            return (
              <Pressable
                key={s.key}
                onPress={() => setSelectedStatus(selectedStatus === s.key ? "All" : s.key)}
                style={{ flex: 1 }}
              >
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
    </YStack>
  ), [router, reports.length, query, selectedStatus, stats])

  const ListEmpty = useMemo(() => (
    <YStack alignItems="center" marginTop={40} paddingHorizontal={16}>
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.fireRed} />
      ) : (
        <Text color={COLORS.mutedFg} textAlign="center">
          No reports found.
        </Text>
      )}
    </YStack>
  ), [isLoading])

  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="#fafafa">
        <FlatList
          data={filteredReports}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{
            paddingBottom: 120,
            flexGrow: 1,
          }}
          {...flatListProps}
        />
      </YStack>
    </Theme>
  )
})

MyReportsOptimized.displayName = 'MyReportsOptimized'

export default MyReportsOptimized
