// HazardDetailsScreen.tsx — Part 1/2
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, Image, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { YStack, XStack, View, Separator } from 'tamagui';
import { MotiView } from 'moti';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge, BadgeText } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  ArrowLeft, MapPin, Clock, User, Camera, Phone,
  MessageSquare, XCircle, AlertTriangle,
} from '@tamagui/lucide-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  apiGetAllReports,
  apiUpdateReportStatus,
  apiUpdateReportDetails,
  apiUpdateReportPriority,
} from '../../lib/api'
import { getUserToken } from '../../lib/storage';
import { API_URL } from '../../lib/config';

const COLORS = {
  primary: '#E53935',
  background: '#F4F4F4',
  card: '#FFFFFF',
  mutedText: '#6B7280',
  heading: '#111827',
  border: '#E5E7EB',
};

const STATUS_META: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#FFF8E1", text: "#F57C00" },
  "In-Progress": { bg: "#FFE0B2", text: "#E65100" },
  Resolved: { bg: "#E8F5E9", text: "#2E7D32" },
  Rejected: { bg: "#FFEBEE", text: "#D32F2F" },
  Closed: { bg: "#F3E5F5", text: "#7B1FA2" },
};

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
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'emergency':
      return '#DC2626';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const getRelativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} mins ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH === 1) return '1 hour ago';
  if (diffH < 24) return `${diffH} hours ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
};

export default function HazardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    let mounted = true;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const token = await getUserToken();
        if (!token) {
          setReport(null);
          setLoading(false);
          return;
        }
        const res = await apiGetAllReports(token, { id });
        if (res?.status === 'success' && res.reports.length > 0) {
          const found = res.reports[0];
          if (found && mounted) {
            setReport(found);
            setSelectedStatus(found.status || '');
            setSelectedPriority(found.priority || '');
            setNotes(found.admin_notes || '');
            if (found.latitude && found.longitude) {
              setMapRegion({
                latitude: Number(found.latitude),
                longitude: Number(found.longitude),
                latitudeDelta: 0.0045,
                longitudeDelta: 0.0045,
              });
            }
          }
        }
      } catch (err) {
        console.warn('fetchReport error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchReport();
    return () => { mounted = false; };
  }, [id]);

  const getServerStatus = (status: string) => {
    const map: Record<string, string> = {
      Valid: 'verified_valid',
      Invalid: 'verified_false',
      New: 'pending',
      'In-Progress': 'in_progress',
      'In Progress': 'in_progress',
      Resolved: 'resolved',
      Verified: 'verified',
      Rejected: 'rejected',
      Closed: 'closed',
      Pending: 'pending',
    };
    return map[status] || status.toLowerCase().replace('-', '_');
  };

  const handleUpdateStatus = useCallback(async (statusValue: string) => {
    if (!report) return;
    try {
      const token = await getUserToken();
      if (!token) return;
      const serverStatus = getServerStatus(statusValue);
      const res = await apiUpdateReportStatus({ token, report_id: report.id, status: serverStatus });
      if (res?.status === 'success') {
        setReport((prev: any) => prev ? { ...prev, status: statusValue } : prev);
        setSuccessMessage(`✅ Status updated to ${statusValue} successfully.`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4500);
      } else {
        Alert.alert('Update failed', 'Could not update status.');
      }
    } catch (err) {
      console.warn('handleUpdateStatus', err);
      Alert.alert('Error', 'Failed to update status.');
    }
  }, [report]);
  const handleUpdatePriority = useCallback(async (priority: string) => {
    if (!report) return;
    try {
      const token = await getUserToken();
      if (!token) return;
      const payloadPriority = (priority || '').toLowerCase() as 'low' | 'medium' | 'high' | 'emergency';
      const res = await apiUpdateReportPriority({ token, report_id: report.id, priority: payloadPriority });
      if (res?.status === 'success') {
        setSelectedPriority(priority);
        setReport((prev: any) => prev ? { ...prev, priority } : prev);
        setSuccessMessage(`✅ Priority updated to ${priority} successfully.`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4500);
      } else {
        Alert.alert('Update failed', 'Could not update priority.');
      }
    } catch (err) {
      console.warn('handleUpdatePriority', err);
      Alert.alert('Error', 'Failed to update priority.');
    }
  }, [report]);

  const handleSaveNotes = useCallback(() => {
    setReport((prev: any) => prev ? { ...prev, admin_notes: notes } : prev);
    Alert.alert('Notes saved', 'Inspector notes saved.');
  }, [notes]);



  if (loading) {
    return (
      <YStack flex={1} backgroundColor={COLORS.background} padding="$4" justifyContent="center" alignItems="center">
        <Text fontSize={16} color={COLORS.mutedText}>Loading...</Text>
      </YStack>
    );
  }

  if (!report) {
    return (
      <YStack flex={1} backgroundColor={COLORS.background} padding="$4" justifyContent="center" alignItems="center">
        <Text fontSize={16} color={COLORS.mutedText}>Report not found.</Text>
      </YStack>
    );
  }

  const images = report.image_path ? [report.image_path] : [];

  const priorityColor = getPriorityColor(report.priority || selectedPriority);
  const normalizedStatus = getNormalizedStatus(report.status || selectedStatus);
  const statusColor = STATUS_META[normalizedStatus] || { bg: "#F3F4F6", text: "#374151" };

  return (
    <YStack flex={1} backgroundColor={COLORS.background}>
      <YStack
        backgroundColor={COLORS.card}
        paddingHorizontal={16}
        paddingVertical={14}
        borderBottomWidth={1}
        borderBottomColor={COLORS.border}
      >
        <XStack alignItems="center" gap="$3" paddingTop={30}>
          <Button
            variant="outlined"
            size="icon"
            onPress={() => router.back()}
            backgroundColor="transparent"
            borderColor={COLORS.border}
            borderRadius="$3"
          >
            <ArrowLeft size={20} color={COLORS.heading} />
          </Button>

          <YStack flex={1}>
            <Text fontSize={20} fontWeight="700" color={COLORS.heading}>Hazard Details</Text>
          </YStack>
        </XStack>
      </YStack>

      {/* Success Banner */}
      {showSuccess && (
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          transition={{ type: 'timing', duration: 300 }}
          style={{
            backgroundColor: '#D62828',
            padding: 16,
            marginHorizontal: 18,
            marginTop: 10,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text color="#fff" fontSize={16} fontWeight="600" textAlign="center">
            {successMessage}
          </Text>
        </MotiView>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4" paddingBottom={140}>

          {/* Overview Card */}
          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={14}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              elevation: 4,
              borderWidth: 1,
              borderColor: '#F1F1F1',
            }}
          >
            <XStack justifyContent="space-between" alignItems="center" marginBottom={8}>
              <Text fontSize={18} fontWeight="700" color={COLORS.heading}>{report.hazard_type || 'Hazard'}</Text>
              <Badge backgroundColor={statusColor.bg} borderRadius="$2" paddingHorizontal="$2" paddingVertical="$1">
                <BadgeText color={statusColor.text} fontSize={12} fontWeight="600">
                  {normalizedStatus}
                </BadgeText>
              </Badge>
            </XStack>

            <XStack alignItems="center" gap="$2" marginBottom={6}>
              <MapPin size={14} color="#6B7280" />
              <Text fontSize={12} color={COLORS.mutedText}>{report.location_address || report.location}</Text>
            </XStack>

            <XStack alignItems="center" gap="$2" marginBottom={6}>
              <Clock size={14} color="#6B7280" />
              <Text fontSize={12} color={COLORS.mutedText}>Reported {getRelativeTime(report.created_at || report.timestamp)}</Text>
            </XStack>

            <XStack alignItems="center" gap="$2" marginBottom={6}>
              <User size={14} color="#6B7280" />
              <Text fontSize={12} color={COLORS.mutedText}>{report.user_fullname || 'Resident'} (Resident)</Text>
            </XStack>

            {/* <XStack alignItems="center" gap="$2">
              <AlertTriangle size={16} color={priorityColor} />
              <Text fontSize={14} color={COLORS.mutedText}>
                Priority:
                <Text fontWeight="700" color={priorityColor}> {report.priority || selectedPriority || 'N/A'}</Text>
              </Text>
            </XStack> */}
          </Card>

          {/* Photo Evidence */}
          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={14}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              elevation: 3,
              borderWidth: 1,
              borderColor: '#F1F1F1',
            }}
          >
            <Text fontSize={14} fontWeight="600" color={COLORS.heading} marginBottom="$2">Photo Evidence</Text>

            <YStack>
              {images.length === 0 ? (
                <View height={120} borderRadius={8} backgroundColor="#F3F4F6" alignItems="center" justifyContent="center">
                  <Text color={COLORS.mutedText}>No photos available</Text>
                </View>
              ) : (
                images.map((img: string, idx: number) => {
                  const uri = img.startsWith('http') ? img : `${API_URL.replace('/api', '')}/uploads/${img}`
                  return (
                    <View key={idx} style={{ marginBottom: 12 }}>
                      <Image source={{ uri }} style={{ width: '100%', height: 160, borderRadius: 8 }} resizeMode="cover" />
                    </View>
                  )
                })
              )}
            </YStack>
          </Card>

          {/* Description */}
          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={14}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              elevation: 3,
              borderWidth: 1,
              borderColor: '#F1F1F1',
            }}
          >
            <Text fontSize={14} fontWeight="600" color={COLORS.heading} marginBottom="$2">Description</Text>
            <Text fontSize={12} color={COLORS.mutedText} lineHeight={20}>
              {report.description || 'No description provided.'}
            </Text>
          </Card>

          {/* Map */}
          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={12}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              elevation: 3,
              borderWidth: 1,
              borderColor: '#F1F1F1',
            }}
          >
            <Text fontSize={14} fontWeight="600" color={COLORS.heading} marginBottom="$2">Location Map</Text>

            <View width="100%" height={180} borderRadius={8} overflow="hidden" backgroundColor="#F9FAFB">
              {mapRegion ? (
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{ flex: 1 }}
                  initialRegion={mapRegion}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  onRegionChangeComplete={(reg: Region) => setMapRegion(reg)}
                >
                  <Marker
                    coordinate={{
                      latitude: Number(report.latitude),
                      longitude: Number(report.longitude),
                    }}
                    title={report.hazard_type || 'Hazard'}
                    description={report.location_address || ''}
                  />
                </MapView>
              ) : (
                <YStack flex={1} alignItems="center" justifyContent="center">
                  <Text color={COLORS.mutedText}>Location unavailable</Text>
                </YStack>
              )}
            </View>

            <Text fontSize={10} color={COLORS.mutedText} marginTop="$2">{report.location_address}</Text>
          </Card>

          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={18}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 10,
              elevation: 3,
              borderWidth: 1,
              borderColor: '#EEE',
            }}
          >
            <Text fontSize={16} fontWeight="700" color={COLORS.heading} marginBottom="$3">
              Update Status
            </Text>

            <YStack gap="$4">
              {/* Status selection */}
              <YStack gap="$2">
                {/* <Text fontSize={12} fontWeight="600" color={COLORS.heading}>
                  Update Status
                </Text> */}
                <XStack flexWrap="wrap" gap="$2">
                  {[
                    { label: 'Pending', value: 'pending', color: '#F59E0B' },
                    { label: 'In Progress', value: 'in_progress', color: '#3B82F6' },
                    { label: 'Verified', value: 'verified', color: '#10B981' },
                    { label: 'Resolved', value: 'resolved', color: '#6B7280' },
                    { label: 'Rejected', value: 'rejected', color: '#EF4444' },
                    { label: 'Closed', value: 'closed', color: '#8B5CF6' },
                  ].map((status) => {
                    const isSelected = selectedStatus === status.value || report.status === status.value;
                    return (
                      <Button
                        key={status.value}
                        backgroundColor={isSelected ? status.color : '#F9FAFB'}
                        borderWidth={isSelected ? 0 : 1}
                        borderColor="#E5E7EB"
                        borderRadius={20}
                        paddingHorizontal={14}
                        paddingVertical={8}
                        onPress={() => setSelectedStatus(status.value)}
                      >
                        <Text color={isSelected ? 'white' : COLORS.mutedText} fontWeight="600">
                          {status.label}
                        </Text>
                      </Button>
                    );
                  })}
                </XStack>
              </YStack>

              <Separator borderColor={COLORS.border} />

              {/* Notes */}
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600" color={COLORS.heading}>
                  Inspector Notes
                </Text>
                <Textarea
                  placeholder="Add inspection notes..."
                  minHeight={80}
                  value={notes}
                  onChangeText={setNotes}
                  borderWidth={1}
                  borderColor="#E5E7EB"
                  borderRadius={10}
                  padding="$3"
                  backgroundColor="#FAFAFA"
                  placeholderTextColor="#9CA3AF"
                  color={COLORS.heading}
                />
              </YStack>

              {/* Update Button */}
              <Button
                onPress={async () => {
                  if (!report) return;
                  try {
                    const token = await getUserToken();
                    if (!token) return;

                    if (selectedStatus && selectedStatus !== report.status) {
                      const serverStatus = getServerStatus(selectedStatus);
                      const statusRes = await apiUpdateReportStatus({
                        token,
                        report_id: report.id,
                        status: serverStatus,
                        admin_notes: notes,
                      });
                      if (statusRes?.status !== 'success') {
                        Alert.alert('Update failed', 'Could not update status.');
                        return;
                      }
                    }

                    const detailsRes = await apiUpdateReportDetails({
                      token,
                      report_id: report.id,
                      admin_notes: notes,
                    });

                    if (detailsRes?.status === 'success') {
                      setReport((prev: any) =>
                        prev ? { ...prev, status: selectedStatus || prev.status, admin_notes: notes } : prev
                      );
                      setSuccessMessage('🎉 Report updated successfully! Changes have been saved.');
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 4500);
                    } else {
                      Alert.alert('Update failed', 'Could not update report details.');
                    }
                  } catch (err) {
                    console.warn('Update report error', err);
                    Alert.alert('Error', 'Failed to update report.');
                  }
                }}
                backgroundColor={COLORS.primary}
                paddingVertical={10}
                borderRadius={10}
              >
                <Text color="white" fontWeight="700">Save Changes</Text>
              </Button>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>



      {/* Bottom Actions */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor={COLORS.card}
        borderTopWidth={1}
        borderTopColor={COLORS.border}
        paddingHorizontal={16}
        paddingVertical={12}
      >
        <Button
          onPress={() => {
            router.push(`/(bfp)/communication?id=${report.id}`);
          }}
          backgroundColor={COLORS.primary}
          paddingHorizontal="$3"
          paddingVertical="$3"
          borderRadius={10}
          marginBottom={25}
        >
          <Phone size={16} color="white" />
          <Text marginLeft="$2" color="white">Contact Resident</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
