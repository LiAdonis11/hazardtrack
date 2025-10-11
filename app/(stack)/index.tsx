// app/(resident)/ResidentDashboard.tsx
import React, { useCallback, useEffect, useState } from "react"
import { Image, ScrollView, Platform, Alert, StyleSheet, TouchableOpacity, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { YStack, XStack, Text, Card, Button as TamButton, View, Sheet } from "tamagui"
import { MotiView } from "moti"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"

import { apiGetReports, apiGetNotifications, apiGetUserProfile } from "../../lib/api"
import { getUserData, removeUserToken } from "../../lib/storage"
import { useAuth } from '../../context/AuthContext'
import { showEmergencyOptions } from "../../lib/communications"

const HEADER_RED = "#D62828"

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
  if (s === "rejected") return "Rejected"
  if (s === "closed") return "Closed"
  if (s === "verified_valid" || s === "valid" || s === "verified") return "Resolved"
  if (s === "verified_false" || s === "invalid") return "Rejected"
  return "Pending"
}

const getStatusBg = (status?: string) => {
  const normalized = getNormalizedStatus(status)
  return { backgroundColor: STATUS_META[normalized]?.bg || '#EEEEEE' }
}

const getStatusTextColor = (status?: string) => {
  const normalized = getNormalizedStatus(status)
  return STATUS_META[normalized]?.text || '#555'
}

const getSafetyScoreColor = (score: number) => {
  if (score >= 4) return '#D32F2F' // destructive red for high (unsafe)
  if (score >= 3) return '#F57C00' // warning orange
  return '#2E7D32' // success green for low (safe)
}

export default function ResidentDashboard() {
  const router = useRouter()
  const { success, reportId } = useLocalSearchParams()
  const { token } = useAuth()

  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [latestReportId, setLatestReportId] = useState<number | null>(null)
  const [safetyScore, setSafetyScore] = useState<number>(5.0)
  const [showSafetyModal, setShowSafetyModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadUser = useCallback(async () => {
    try {
      const u = await getUserData()
      setUser(u)
    } catch (e) {
      console.warn("loadUser:", e)
    }
  }, [])

  const checkOnline = useCallback(async () => {
    try {
      const res = await fetch("https://www.google.com/favicon.ico", { method: "HEAD" })
      setIsOnline(res.ok)
    } catch {
      setIsOnline(false)
    }
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      if (!token) {
        setReports([])
        setLoading(false)
        return
      }
      const res = await apiGetReports(token)
      if (res?.status === "success") {
        setReports(res.reports || [])
      } else {
        setReports(res?.reports || [])
      }
    } catch (err) {
      console.error("fetchReports:", err)
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const fetchNotifications = useCallback(async () => {
    try {
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
  }, [token])

  const fetchUserProfile = useCallback(async () => {
    try {
      if (token) {
        const res = await apiGetUserProfile(token)
        if (res?.status === "success") {
          const profile = res.profile
          setSafetyScore(profile.safetyScore || 5.0)
        }
      }
    } catch (err) {
      console.error("fetchUserProfile:", err)
      setSafetyScore(5.0) // Default to perfect score on error
    }
  }, [token])

  useEffect(() => {
    loadUser()
    checkOnline()

    if (success === "true") {
      setSuccessMessage("🎉 Report submitted successfully! Emergency responders have been notified.")
      setShowSuccess(true)
      setLatestReportId(reportId ? Number(reportId) : null)
      setTimeout(() => setShowSuccess(false), 4500)
    }
  }, [loadUser, checkOnline, success, reportId])

  useFocusEffect(
    React.useCallback(() => {
      fetchReports()
      fetchNotifications()
      fetchUserProfile()
    }, [fetchReports, fetchNotifications, fetchUserProfile])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchReports()
      await fetchNotifications()
      await fetchUserProfile()
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }, [fetchReports, fetchNotifications, fetchUserProfile])

  const handleLogout = async () => {
    await removeUserToken()
    if ((global as any).triggerAuthCheck) (global as any).triggerAuthCheck()
    router.push("/login")
  }

  const openReportForm = () => router.push("/(stack)/report-hazard")
  const openMyReports = () => router.push("/(stack)/MyReports")

  const pendingCount = reports.filter((r) => (r.status || "").toLowerCase() === "pending").length
  const resolvedCount = reports.filter((r) => (r.status || "").toLowerCase() === "resolved").length

  const shortDate = (iso?: string) => {
    if (!iso) return ""
    try {
      return new Date(iso).toLocaleDateString()
    } catch {
      return iso
    }
  }

  // Safety score is now fetched from API

  return (
    <View flex={1} backgroundColor="#fff">
      {/* Header — solid red */}
      <View backgroundColor={HEADER_RED} paddingTop={18} paddingBottom={16}  paddingHorizontal={8} borderBottomLeftRadius={14} borderBottomRightRadius={14}>
        <SafeAreaView>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap={12}>
              <Image source={require("../../assets/images/logo.png")} style={{ width: 46, height: 46 }} resizeMode="contain" />
              <View>
                <Text color="#fff" fontSize={22} fontWeight="800">Welcome, {user?.fullname || "Juan"}!</Text>
                <Text color="#fff" fontSize={13} opacity={0.9}>Keep your community safe</Text>
              </View>
            </XStack>

            <XStack alignItems="center" gap={10}>
              {/* small bell with count */}
              <TouchableOpacity
                onPress={() => router.push("/(stack)/notifications")}
                activeOpacity={0.8}
              >
                <View
                  width={36}
                  height={36}
                  borderRadius={18}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="rgba(255,255,255,0.06)"
                >
                  <FontAwesome name="bell" size={16} color="#fff" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <View style={styles.bellCount}>
                      <Text fontSize={11} color="#fff">{notifications.filter(n => !n.is_read).length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* <TamButton onPress={handleLogout} backgroundColor="transparent">
                <FontAwesome name="sign-out" size={18} color="#fff" />
              </TamButton> */}
            </XStack>
          </XStack>

          {/* small stat row cards */}
          <XStack gap={12} marginTop={16} justifyContent="center">
            <Card backgroundColor="#fff" borderRadius={10} padding={10} width={100} alignItems="center" elevation={0} style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }}>
              <Text fontSize={22} fontWeight="800" color="#2B7BE4">{reports.length}</Text>
              <Text fontSize={12} color="#2B7BE4">Active Reports</Text>
            </Card>

            <Card backgroundColor="#fff" borderRadius={10} padding={10} width={100} alignItems="center" elevation={0} style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }}>
              <Text fontSize={22} fontWeight="800" color="#43A047">{resolvedCount}</Text>
              <Text fontSize={12} color="#43A047">Resolved</Text>
            </Card>

            <Card backgroundColor="#fff" borderRadius={10} padding={10} width={110} alignItems="center" elevation={0} style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }}>
              <XStack alignItems="center" gap={4}>
                <Text fontSize={22} fontWeight="800" color={getSafetyScoreColor(safetyScore)}>{safetyScore}</Text>
                <TouchableOpacity onPress={() => setShowSafetyModal(true)} activeOpacity={0.8}>
                  <FontAwesome name="info-circle" size={14} color={getSafetyScoreColor(safetyScore)} />
                </TouchableOpacity>
              </XStack>
              <Text fontSize={12} color={getSafetyScoreColor(safetyScore)}>Safety Score</Text>
            </Card>
          </XStack>


        </SafeAreaView>
      </View>

      {/* Content area: scroll */}
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <YStack gap={14}>
          {/* Action buttons row */}
          <XStack gap={12}>
            <TamButton onPress={openReportForm} borderRadius={12} flex={1} height={96} backgroundColor={HEADER_RED} padding={12}>
              <YStack alignItems="center" justifyContent="center" gap={8}>
                <View width={40} height={40} borderRadius={10} backgroundColor="rgba(255,255,255,0.08)" alignItems="center" justifyContent="center">
                  <FontAwesome name="plus" size={20} color="#fff" />
                </View>
                <Text color="#fff" fontWeight="700">Report Hazard</Text>
              </YStack>
            </TamButton>

            <Card borderRadius={12} flex={1} height={96} padding={12} borderWidth={1} borderColor="rgba(0,0,0,0.04)">
              <TouchableOpacity onPress={() => router.push("/EmergencyScreen")} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <View width={40} height={40} borderRadius={10} backgroundColor="#FDF2F2" alignItems="center" justifyContent="center">
                  <FontAwesome name="phone" size={20} color="#D9534F" />
                </View>
                <Text color="#333" fontWeight="700">Emergency Call</Text>
              </TouchableOpacity>
            </Card>
          </XStack>

          {/* My Reports section */}
          <Card borderRadius={12} padding={12} borderWidth={1} borderColor="rgba(0,0,0,0.04)">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16} fontWeight="700">My Reports</Text>
              <TamButton onPress={openMyReports} backgroundColor="transparent">
                <Text color="#666" fontSize={13}>View All</Text>
              </TamButton>
            </XStack>

            <YStack gap={10} marginTop={12}>
              {reports.slice(0, 3).map((r) => (
                <TouchableOpacity key={r.id} onPress={() => router.push(`/(stack)/ReportDetails?id=${r.id}`)}>
                  <Card borderRadius={10} padding={10} borderWidth={1} borderColor="rgba(0,0,0,0.04)">
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" gap={10} flex={1}>
                        <View width={44} height={44} borderRadius={10} backgroundColor="#FFF3F3" alignItems="center" justifyContent="center">
                          <FontAwesome name="exclamation-triangle" size={18} color="#D9534F" />
                        </View>
                        <YStack flex={1}>
                          <Text fontWeight="700" numberOfLines={1} ellipsizeMode="tail">
                            {r.title || r.category_name}
                          </Text>
                          <Text fontSize={12} color="#888">{shortDate(r.created_at)}</Text>
                        </YStack>
                      </XStack>

                      <View style={[styles.smallStatus, getStatusBg(r.status)]}>
                        <Text fontSize={12} style={{ color: getStatusTextColor(r.status) }} numberOfLines={1}>
  {getNormalizedStatus(r.status)}
</Text>

                      </View>
                    </XStack>
                  </Card>
                </TouchableOpacity>
              ))}
            </YStack>
          </Card>

          {/* Recent Updates */}
          <Card borderRadius={12} padding={12} borderWidth={1} borderColor="rgba(0,0,0,0.04)">
            <Text fontSize={16} fontWeight="700" marginBottom={10}>Recent Updates</Text>

            <YStack gap={10}>
              {(reports || []).slice(0, 2).map((u, i) => (
                <Card key={`upd-${i}`} borderRadius={10} padding={10} borderWidth={1} borderColor="rgba(0,0,0,0.04)">
                  <XStack gap={10} alignItems="center">
                    <View width={10} height={10} borderRadius={6} backgroundColor="#D9534F" />
                    <YStack flex={1}>
                      <Text numberOfLines={2} ellipsizeMode="tail">
                        {u.status ? `Your report ${u.title || 'Unknown'} is ${u.status}` : `Update on report ${u.title || 'Unknown'}`}
                      </Text>
                      <Text fontSize={12} color="#888">{u.created_at ? new Date(u.created_at).toLocaleTimeString() : ""}</Text>
                    </YStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          </Card>

          {/* Fire Safety Tip */}
          <Card borderRadius={12} padding={12} borderWidth={1} borderColor="#FFE9B8" backgroundColor="#FFF9F0">
            <Text fontSize={16} fontWeight="700" marginBottom={8}>Fire Safety Tip</Text>
            <Card borderRadius={8} padding={10} backgroundColor="#FFF8E1" borderWidth={1} borderColor="#FFECB3">
              <Text>
                <Text fontWeight="700">Check your electrical outlets: </Text>
                Avoid overloading extension cords and unplug appliances when not in use to prevent electrical fires.
              </Text>
            </Card>
          </Card>
        </YStack>
      </ScrollView>

      {/* Bottom navigation (fixed) */}
      <View position="absolute" bottom={10} left={12} right={12}>
        <Card borderRadius={14} padding={8} bottom={0} backgroundColor="#fff" borderWidth={1} borderColor="rgba(0,0,0,0.04)">
          <XStack justifyContent="space-around" alignItems="center">
            <TamButton onPress={() => router.push("/")} backgroundColor="transparent">
              <YStack alignItems="center" gap={4}>
                <FontAwesome name="home" size={18} color={HEADER_RED} />
                <Text fontSize={11} color={HEADER_RED}>Home</Text>
              </YStack>
            </TamButton>

            <TamButton onPress={() => router.push("/(stack)/MyReports")} backgroundColor="transparent">
              <YStack alignItems="center" gap={4}>
                <FontAwesome name="list" size={18} color="#777" />
                <Text fontSize={11} color="#777">Reports</Text>
              </YStack>
            </TamButton>

            <TamButton onPress={() => router.push("/EmergencyScreen")} backgroundColor="transparent">
              <YStack alignItems="center" gap={4}>
                <FontAwesome name="phone" size={18} color="#777" />
                <Text fontSize={11} color="#777">Emergency</Text>
              </YStack>
            </TamButton>

            <TamButton onPress={() => router.push("/ProfileScreen")} backgroundColor="transparent">
              <YStack alignItems="center" gap={4}>
                <FontAwesome name="user" size={18} color="#777" />
                <Text fontSize={11} color="#777">Profile</Text>
              </YStack>
            </TamButton>
          </XStack>
        </Card>
      </View>

      {/* Safety Score Info Modal */}
      <Sheet
        modal
        open={showSafetyModal}
        onOpenChange={setShowSafetyModal}
        snapPoints={[50]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$5" gap="$5" backgroundColor="$background">
          <Sheet.Handle backgroundColor="$gray8" />
          <YStack gap="$4">
            <Text fontSize="$6" fontWeight="bold" textAlign="center">
              What is the Safety Score?
            </Text>
            <Text fontSize="$4" color="$gray11" textAlign="center">
              The Safety Score indicates the overall safety level of your area based on recent hazard reports and community activity. A lower score means safer conditions, while a higher score suggests potential risks that need attention.
            </Text>
            <Text fontSize="$4" color="$gray11" textAlign="center">
              Scores range from 0 (safest) to 5 (highest risk). The color coding helps you quickly understand the current safety status.
            </Text>
            <TamButton onPress={() => setShowSafetyModal(false)} backgroundColor={HEADER_RED} color="#fff" marginTop="$4" width="100%">
              OK
            </TamButton>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </View>
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
  smallStatus: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    maxWidth: 80,
  },
  
})
