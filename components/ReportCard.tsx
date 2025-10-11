import React, { memo } from 'react';
import { Card, XStack, YStack, Text, View } from 'tamagui';
import { MapPin, Clock, Flame, Zap, Home, AlertTriangle } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { colors, touchTargetSize } from '../lib/responsive';

type ReportItem = {
  id: string | number;
  category_name?: string | null;
  title?: string;
  location_address?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  status?: string | null;
  priority?: string;
  created_at?: string;
  assigned_to?: string;
};

interface ReportCardProps {
  report: ReportItem;
  index?: number;
}

const getIcon = (category?: string | null) => {
  const c = (category || '').toLowerCase();
  if (c.includes('fire')) return Flame;
  if (c.includes('electrical')) return Zap;
  if (c.includes('building')) return Home;
  return AlertTriangle;
};

const getPriorityColor = (priority?: string) => {
  if (!priority) return '#BDBDBD';
  if (priority === 'High') return colors.fireRed;
  if (priority === 'Medium') return colors.warningOrange;
  return colors.successGreen;
};

const getNormalizedStatus = (status?: string | null) => {
  if (!status) return 'Pending';
  const s = status.toLowerCase();
  if (s === 'pending' || s === 'new' || s === 'submitted') return 'Pending';
  if (s === 'in_progress' || s === 'in-progress') return 'In-Progress';
  if (s === 'resolved') return 'Resolved';
  if (s === 'rejected') return 'Rejected';
  if (s === 'closed') return 'Closed';
  if (s === 'verified_valid' || s === 'valid' || s === 'verified') return 'Resolved';
  if (s === 'verified_false' || s === 'invalid') return 'Rejected';
  return 'Pending';
};

const getStatusInfo = (status?: string | null) => {
  const normalized = getNormalizedStatus(status);
  switch (normalized) {
    case 'In-Progress':
      return {
        bg: '#FFF4E6',
        border: '#FFE0B2',
        text: '🚨 BFP is actively working on this report'
      };
    case 'Resolved':
      return {
        bg: '#E8F5E9',
        border: '#C8E6C9',
        text: '✅ Hazard has been resolved and verified safe'
      };
    case 'Rejected':
      return {
        bg: '#FFEBEE',
        border: '#FFCDD2',
        text: '❌ Report was rejected - please check details'
      };
    case 'Closed':
      return {
        bg: '#F3E5F5',
        border: '#E1BEE7',
        text: '🔒 Report has been closed'
      };
    default:
      return {
        bg: '#FFF8E1',
        border: '#FFECB3',
        text: '🕓 Awaiting BFP review'
      };
  }
};

const ReportCard: React.FC<ReportCardProps> = memo(({ report, index = 0 }) => {
  const router = useRouter();
  const Icon = getIcon(report.category_name);
  const priorityDot = getPriorityColor(report.priority);
  const normalizedStatus = getNormalizedStatus(report.status);
  const statusInfo = getStatusInfo(report.status);

  const handlePress = () => {
    router.push(`/(stack)/ReportDetails?id=${report.id}`);
  };

  return (
    <Card
      backgroundColor="#fff"
      borderRadius={14}
      padding="$4"
      marginBottom="$3"
      style={{
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        minHeight: touchTargetSize * 3, // Ensure touch target
      }}
      onPress={handlePress}
      pressStyle={{ scale: 0.98 }}
      animation="quick"
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <XStack alignItems="center" gap="$3" flex={1}>
          <View
            width={44}
            height={44}
            borderRadius={12}
            backgroundColor="rgba(211,47,47,0.06)"
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={20} color={colors.fireRed} />
          </View>

          <YStack flex={1} gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text
                fontSize={15}
                fontWeight="700"
                color={colors.darkGray}
                numberOfLines={1}
                flex={1}
              >
                {report.category_name || report.title || 'Unknown'}
              </Text>
              <View
                width={10}
                height={10}
                borderRadius={999}
                backgroundColor={priorityDot}
                marginLeft={8}
              />
            </XStack>

            <YStack gap="$3">
              <XStack alignItems="center" gap="$3">
                <MapPin size={14} color={colors.mutedFg} />
                <Text
                  fontSize={13}
                  color={colors.mutedFg}
                  numberOfLines={1}
                  flex={1}
                >
                  {report.location_address || 'Unknown location'}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$3">
                <Clock size={14} color={colors.mutedFg} />
                <Text fontSize={13} color={colors.mutedFg} numberOfLines={1}>
                  {report.created_at ? new Date(report.created_at).toLocaleString() : ''}
                </Text>
              </XStack>
            </YStack>

            {report.title && report.title !== report.category_name && (
              <Text
                fontSize={13}
                color={colors.mutedFg}
                marginTop="$3"
                numberOfLines={2}
              >
                {report.title}
              </Text>
            )}
          </YStack>
        </XStack>
      </XStack>

      {/* Status Information Box */}
      <View
        backgroundColor={statusInfo.bg}
        borderRadius={10}
        padding="$4"
        marginTop="$3"
        style={{ borderWidth: 1, borderColor: statusInfo.border }}
      >
        <Text fontSize={13} color={colors.darkGray} lineHeight={18}>
          {statusInfo.text}
        </Text>
      </View>

      {/* Footer: Status Badge and GPS Coordinates */}
      <YStack gap="$3" marginTop="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <View
            backgroundColor="#eeeeee"
            borderRadius={8}
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <Text fontSize={12} fontWeight="600" color="#757575">
              {normalizedStatus}
            </Text>
          </View>
          {(report.latitude || report.longitude) && (
            <XStack alignItems="center" gap="$3">
              <MapPin size={12} color={colors.mutedFg} />
              <Text fontSize={11} color={colors.mutedFg}>
                {report.latitude ? parseFloat(String(report.latitude)).toFixed(4) : '?'}°,
                {report.longitude ? parseFloat(String(report.longitude)).toFixed(4) : '?'}°
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>
    </Card>
  );
});

ReportCard.displayName = 'ReportCard';

export default ReportCard;
