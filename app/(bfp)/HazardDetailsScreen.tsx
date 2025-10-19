// HazardDetailsScreen.tsx — Part 1/2
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, Image, Alert, TouchableOpacity, Linking, View as RNView } from 'react-native';
import { YStack, XStack, View, Separator } from 'tamagui';
import { MotiView } from 'moti';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge, BadgeText } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  ArrowLeft, MapPin, Clock, User, Camera, Phone,
  MessageSquare, XCircle, AlertTriangle, Navigation,
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
  subtlePrimary: '#FEEDEE',
};

const STATUS_META: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#9CA3AF", text: "#FFFFFF" },
  "In-Progress": { bg: "#F59E0B", text: "#FFFFFF" },
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
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Unknown time'
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function HazardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
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

          {/* Overview Card */}
          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={14}
            borderWidth={1}
            borderColor="#FFFFFF"
            style={{
              shadowColor: 'rgba(0,0,0,0.1)',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <XStack justifyContent="space-between" alignItems="center" marginBottom={8}>
              <Text fontSize={18} fontWeight="700" color={COLORS.heading} flex={1} marginRight={8}>{report.title || report.hazard_type || 'Hazard'}</Text>
              <Badge backgroundColor={statusColor.bg} borderRadius="$2" paddingHorizontal="$1" paddingVertical="$1">
                <BadgeText color={statusColor.text} fontSize={12} fontWeight="600">
                  {normalizedStatus}
                </BadgeText>
              </Badge>
            </XStack>



            <XStack alignItems="center" gap="$2" marginBottom={6}>
              <MapPin size={14} color="#6B7280" />
              <Text fontSize={12} color={COLORS.mutedText}>{report.location_address || report.location}</Text>
              {report.latitude && report.longitude && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    // Simple navigation using external maps
                    const lat = report.latitude;
                    const lng = report.longitude;
                    const label = report.hazard_type || 'Hazard Location';
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                    Linking.openURL(url).catch((err: any) => console.warn('Failed to open maps:', err));
                  }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: COLORS.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Navigation size={14} color="white" />
                </TouchableOpacity>
              )}
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

          {/* Photo Evidence and Description */}
          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={14}
            borderWidth={1}
            borderColor="#FFFFFF"
            style={{
              shadowColor: 'rgba(0,0,0,0.1)',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text fontSize={14} fontWeight="600" color={COLORS.heading} marginBottom="$3">Photo Evidence</Text>

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

            <Separator borderColor={COLORS.border} marginVertical={16} />

            <Text fontSize={14} fontWeight="600" color={COLORS.heading} marginBottom="$2">Description</Text>
            <Text fontSize={12} color={COLORS.mutedText} lineHeight={20}>
              {report.description || 'No description provided.'}
            </Text>
          </Card>



          <Card
            backgroundColor={COLORS.card}
            borderRadius={16}
            padding={18}
            borderWidth={1}
            borderColor="#FFFFFF"
            style={{
              shadowColor: 'rgba(0,0,0,0.1)',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 4,
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
                    { label: 'Pending', value: 'pending', color: '#9CA3AF' },
                    { label: 'In Progress', value: 'in_progress', color: '#F59E0B' },
                    { label: 'Verified', value: 'verified', color: '#1D4ED8' },
                    { label: 'Resolved', value: 'resolved', color: '#16A34A' },
                    { label: 'Closed', value: 'closed', color: '#B91C1C' },
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
