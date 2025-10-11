// Resident Report Details Screen - Read-only view for residents
import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  View as RNView,
  Linking,
  RefreshControl,
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { YStack, XStack, View, Separator } from 'tamagui'
import { Text } from '../(bfp)/ui/text'
import { Button } from '../(bfp)/ui/button'
import { Card } from '../(bfp)/ui/card'
import { Badge, BadgeText } from '../(bfp)/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Camera,
  Phone,
  MessageSquare,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { apiGetReports } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { API_URL } from '../../lib/config'

/**
 * Visual design / color tokens (kept near top so it's easy to tweak)
 */
const COLORS = {
  primary: '#E53935', // red accent
  subtlePrimary: '#FEEDEE',
  cardBg: '#FFFFFF',
  pageBg: '#F6F7F8',
  mutedText: '#6B7280',
  heading: '#111827',
  border: '#E8E8E8',
  softBlue: '#E8F0FF',
  verifiedBlue: '#3B82F6',
  pillBlueBg: '#EEF6FF',
  pillBlueBorder: '#D5E9FF',
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
  if (s === "rejected") return "Rejected"
  if (s === "closed") return "Closed"
  if (s === "verified_valid" || s === "valid" || s === "verified") return "Resolved"
  if (s === "verified_false" || s === "invalid") return "Rejected"
  return "Pending"
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

const getRelativeTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin === 1) return '1 min ago'
  if (diffMin < 60) return `${diffMin} mins ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH === 1) return '1 hour ago'
  if (diffH < 24) return `${diffH} hours ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD} day${diffD > 1 ? 's' : ''} ago`
}

const getProgressSteps = (status?: string) => {
  const currentStatus = (status || '').toLowerCase()
  return [
    {
      id: 1,
      title: 'Report Submitted',
      description: 'Report received and queued for review',
      completed: true, // Always completed if report exists
      active: currentStatus === 'pending'
    },
    {
      id: 2,
      title: 'Under Review',
      description: 'BFP personnel are reviewing the report',
      completed: ['verified_valid', 'verified_false', 'in_progress', 'resolved', 'rejected', 'closed'].includes(currentStatus),
      active: ['verified_valid', 'verified_false'].includes(currentStatus)
    },
    {
      id: 3,
      title: 'In Progress',
      description: 'BFP is actively working to resolve the issue',
      completed: ['resolved', 'rejected', 'closed'].includes(currentStatus),
      active: currentStatus === 'in_progress'
    },
    {
      id: 4,
      title: 'Completed',
      description: 'Issue has been resolved or closed',
      completed: ['resolved', 'rejected', 'closed'].includes(currentStatus),
      active: ['resolved', 'rejected', 'closed'].includes(currentStatus)
    }
  ]
}

export default function ResidentReportDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const id = params.id as string
  const { token } = useAuth()

  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapRegion, setMapRegion] = useState<Region | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchReport = async () => {
    try {
      if (!token) {
        setReport(null)
        return
      }
      const res = await apiGetReports(token)
      if (res?.status === 'success') {
        const found = res.reports.find((r: any) => String(r.id) === String(id))
        if (found) {
          setReport(found)
          if (found.latitude && found.longitude) {
            setMapRegion({
              latitude: Number(found.latitude),
              longitude: Number(found.longitude),
              latitudeDelta: 0.0015,
              longitudeDelta: 0.0015,
            })
          }
        }
      }
    } catch (err) {
      console.warn('fetchReport error', err)
    }
  }

  useEffect(() => {
    let mounted = true
    const loadReport = async () => {
      setLoading(true)
      await fetchReport()
      if (mounted) setLoading(false)
    }
    if (id && token) loadReport()
    return () => {
      mounted = false
    }
  }, [id, token])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchReport()
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <YStack flex={1} backgroundColor={COLORS.pageBg} padding="$4" justifyContent="center" alignItems="center">
        <Text fontSize={16} color={COLORS.mutedText}>
          Loading...
        </Text>
      </YStack>
    )
  }

  if (!report) {
    return (
      <YStack flex={1} backgroundColor={COLORS.pageBg} padding="$4" justifyContent="center" alignItems="center">
        <Text fontSize={16} color={COLORS.mutedText}>
          Report not found.
        </Text>
      </YStack>
    )
  }

  const images =
    Array.isArray(report.images) && report.images.length > 0
      ? report.images
      : report.image
      ? [report.image]
      : []

  const priorityColor = getPriorityColor(report.priority)
  const normalizedStatus = getNormalizedStatus(report.status)
  const statusColor = STATUS_META[normalizedStatus] || { bg: "#EEEEEE", text: "#555" }

  return (
    <YStack flex={1} backgroundColor={COLORS.pageBg}>
      {/* Top bar */}
      <YStack backgroundColor={COLORS.cardBg} paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderBottomColor={COLORS.border}>
        <XStack alignItems="center" gap={12} marginTop={35}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={20} color={COLORS.heading} />
          </TouchableOpacity>
          <YStack>
            <Text fontSize={18} fontWeight="700" color={COLORS.primary}>Report Details</Text>
          </YStack>
        </XStack>
      </YStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <YStack padding="$4" gap="$4" paddingBottom={160}>
          {/* Hazard type + status badge inline */}
          <Card
            backgroundColor={COLORS.cardBg}
            borderRadius={12}
            padding={12}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16} fontWeight="700" color={COLORS.heading} flex={1} numberOfLines={1} ellipsizeMode="tail">
                {report.hazard_type || report.category_name || 'Hazard'}
              </Text>
              <Badge backgroundColor={statusColor.bg} borderRadius={8} paddingHorizontal={8} paddingVertical={6}>
                <BadgeText color={statusColor.text} fontSize={12} fontWeight="700">
                  {normalizedStatus}
                </BadgeText>
              </Badge>
            </XStack>
            {report.summary ? (
              <Text fontSize={13} color={COLORS.mutedText}>{report.summary}</Text>
            ) : null}
          </Card>

          {/* Progress Tracker */}
          <Card
            backgroundColor={COLORS.cardBg}
            borderRadius={12}
            padding={12}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text fontSize={16} fontWeight="700" marginBottom={8}>Progress Tracker</Text>

            <YStack gap={12}>
              {getProgressSteps(report.status).map((step) => (
                <XStack key={step.id} gap={10} alignItems="flex-start">
                  <XStack
                    width={28}
                    height={28}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius={14}
                    backgroundColor={step.completed ? "#FEEFEF" : step.active ? "#FFF4E6" : "#FFFFFF"}
                    borderWidth={1}
                    borderColor={step.completed ? "#F2D5D5" : step.active ? "#FFE0B2" : COLORS.border}
                  >
                    {step.completed ? (
                      <Text fontSize={12} color={COLORS.primary} fontWeight="700">✓</Text>
                    ) : (
                      <Text fontSize={12} color={step.active ? COLORS.primary : COLORS.mutedText}>
                        {step.id}
                      </Text>
                    )}
                  </XStack>
                  <YStack>
                    <Text fontWeight="700" color={step.active ? COLORS.primary : COLORS.heading}>
                      {step.title}
                    </Text>
                    <Text fontSize={13} color={COLORS.mutedText}>{step.description}</Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </Card>

          {/* Report Information */}
          <Card
            backgroundColor={COLORS.cardBg}
            borderRadius={12}
            padding={12}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text fontSize={16} fontWeight="700" marginBottom={8}>Report Information</Text>

            <YStack gap={10}>
              <XStack gap={8} alignItems="center">
                <MapPin size={16} color={COLORS.mutedText} />
                <Text color={COLORS.mutedText}>{report.location_address || report.location || 'Location not set'}</Text>
              </XStack>

              <XStack gap={8} alignItems="center">
                <Clock size={16} color={COLORS.mutedText} />
                <Text color={COLORS.mutedText}>Reported {getRelativeTime(report.created_at || report.timestamp)}</Text>
              </XStack>

              <XStack gap={8} alignItems="center">
                <AlertTriangle size={16} color={getPriorityColor(report.priority)} />
                <Text color={COLORS.mutedText}>Priority: <Text fontWeight="700" color={getPriorityColor(report.priority)}>{report.priority || 'Medium'}</Text></Text>
              </XStack>

            </YStack>

            <Separator marginVertical={12} />

            <XStack justifyContent="space-between" alignItems="center">
              {/* <View backgroundColor={statusColor.bg} borderRadius={8} paddingHorizontal={16} paddingVertical={10}>
                <Text fontSize={12} fontWeight="600" color={statusColor.text}>
                  {normalizedStatus}
                </Text>
              </View> */}
              {(report.latitude || report.longitude) && (
                <XStack alignItems="center" gap={6}>
                  <MapPin size={12} color={COLORS.mutedText} />
                  <Text fontSize={11} color={COLORS.mutedText}>
                    {report.latitude ? Number(report.latitude).toFixed(3) : '?'}°, {report.longitude ? Number(report.longitude).toFixed(3) : '?'}°
                  </Text>
                </XStack>
              )}
            </XStack>
          </Card>

          {/* Description */}
          <Card
            backgroundColor={COLORS.cardBg}
            borderRadius={12}
            padding={12}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text fontSize={16} fontWeight="700" marginBottom={8}>Description</Text>
            <Text fontSize={14} color={COLORS.mutedText}>{report.description || 'No description provided.'}</Text>
          </Card>

          {/* Photo Evidence */}
          <Card
            backgroundColor={COLORS.cardBg}
            borderRadius={12}
            padding={12}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text fontSize={16} fontWeight="700" marginBottom={10}>Photo Evidence</Text>

            <YStack>
              {images.length === 0 ? (
                <View height={120} borderRadius={8} backgroundColor="#F3F4F6" alignItems="center" justifyContent="center">
                  <Text color={COLORS.mutedText}>No photos available</Text>
                </View>
              ) : (
                images.map((img: string, idx: number) => {
                  const uri = img.startsWith('http') ? img : `${API_URL.replace('/api', '')}/uploads/${img}`
                  return (
                    <RNView key={idx} style={{ marginBottom: 12 }}>
                      <Image source={{ uri }} style={{ width: '100%', height: 160, borderRadius: 8 }} resizeMode="cover" />
                    </RNView>
                  )
                })
              )}
            </YStack>
          </Card>

          {/* BFP Notes (if any) */}
          {report.bfp_notes || report.admin_notes ? (
            <Card
              backgroundColor={COLORS.cardBg}
              borderRadius={12}
              padding={12}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <Text fontSize={16} fontWeight="700" marginBottom={8}>BFP Notes</Text>

              <View style={{ backgroundColor: COLORS.pillBlueBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: COLORS.pillBlueBorder }}>
                <Text color={COLORS.verifiedBlue}>{report.bfp_notes || report.admin_notes}</Text>
              </View>
            </Card>
          ) : null}

          {/* GPS Location (visual) */}
          {mapRegion ? (
            <Card
              backgroundColor={COLORS.cardBg}
              borderRadius={12}
              padding={12}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <Text fontSize={16} fontWeight="700" marginBottom={8}>GPS Location</Text>

              <View style={{ backgroundColor: '#EFEFF1', height: 120, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{ width: '100%', height: '100%' }}
                  initialRegion={mapRegion}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: Number(report.latitude) || mapRegion.latitude,
                      longitude: Number(report.longitude) || mapRegion.longitude,
                    }}
                  />
                </MapView>
              </View>

              <Text fontSize={12} color={COLORS.mutedText} marginTop={8}>
                {report.latitude && report.longitude
                  ? `${Number(report.latitude).toFixed(3)}°N, ${Number(report.longitude).toFixed(3)}°E`
                  : 'No coordinates'}
              </Text>
            </Card>
          ) : null}

          {/* Contact & Emergency */}
          <Card
            backgroundColor={COLORS.cardBg}
            borderRadius={12}
            padding={12}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text fontSize={16} fontWeight="700" marginBottom={10}>Need Help?</Text>
            <Text fontSize={13} color={COLORS.mutedText} marginBottom={12}>
              If this is an emergency or you need to contact BFP for updates, access emergency contacts and services.
            </Text>

            <Button
              onPress={() => router.push('/EmergencyScreen')}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 14,
                alignItems: 'center',
              }}
            >
              <XStack alignItems="center" gap={8}>
                <Phone size={18} color="#fff" />
                <Text color="#fff" fontWeight="700" fontSize={14}>Emergency Contacts</Text>
              </XStack>
            </Button>
          </Card>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
