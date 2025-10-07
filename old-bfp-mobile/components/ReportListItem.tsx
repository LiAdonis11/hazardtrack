import React from 'react';
import { TouchableOpacity, Linking } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { getTimeAgo, calculateDistance } from '../../../lib/utils';
import { Phone, Navigation, CheckCircle } from '@tamagui/lucide-icons';

interface Report {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  inspector_fullname?: string;
  category_name?: string;
  location_address?: string;
  reporter_phone?: string;
}

interface ReportListItemProps {
  item: Report;
  userLocation: any;
  onPress: () => void;
  onVerify: () => void;
}

export function ReportListItem({ item, userLocation, onPress, onVerify }: ReportListItemProps) {
  const handleCall = () => {
    if (item.reporter_phone) {
      Linking.openURL(`tel:${item.reporter_phone}`);
    }
  };

  const handleNavigate = () => {
    if (item.latitude && item.longitude) {
      const url = `https://maps.google.com/?q=${item.latitude},${item.longitude}`;
      Linking.openURL(url);
    }
  };

  return (
    <YStack
      marginBottom={16}
      backgroundColor="white"
      borderRadius={16}
      shadowColor="#000"
      shadowOpacity={0.08}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 2 }}
      elevation={2}
      overflow="hidden"
    >
      {/* Priority Color Border */}
      <YStack
        height={6}
        backgroundColor={getPriorityColor(item.priority)}
      />

      <TouchableOpacity onPress={onPress} style={{ padding: 16 }}>
        <YStack space={12}>
          {/* Header with Title and Status */}
          <XStack alignItems="center" justifyContent="space-between">
            <Text
              fontSize={18}
              fontWeight="700"
              color="$text"
              flexShrink={1}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <StatusBadge status={item.status} />
          </XStack>

          {/* Category */}
          <Text fontSize={14} color="$textSecondary" fontWeight="500">
            {item.category_name || 'Uncategorized Hazard'}
          </Text>

          {/* At-a-glance Info */}
          <YStack space={6}>
            <XStack alignItems="center" space={4}>
              <Text fontSize={14} color="$textSecondary">📍</Text>
              <Text fontSize={14} color="$textSecondary" flex={1} numberOfLines={1}>
                {item.location_address || 'Location not specified'}
              </Text>
            </XStack>

            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" space={4}>
                <Text fontSize={14} color="$textSecondary">⏱</Text>
                <Text fontSize={14} color="$textSecondary">
                  {getTimeAgo(item.created_at)}
                </Text>
              </XStack>

              <XStack alignItems="center" space={4}>
                <Text fontSize={14} color="$textSecondary">📏</Text>
                <Text fontSize={14} color="$textSecondary">
                  {userLocation
                    ? calculateDistance(
                        userLocation.coords.latitude,
                        userLocation.coords.longitude,
                        item.latitude || 0,
                        item.longitude || 0
                      )
                    : 'N/A'}
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </YStack>
      </TouchableOpacity>

      {/* One-tap Action Buttons */}
      <XStack
        backgroundColor="$backgroundSoft"
        paddingHorizontal={16}
        paddingVertical={12}
        justifyContent="space-between"
        space={8}
      >
        <TouchableOpacity
          onPress={handleCall}
          disabled={!item.reporter_phone}
          style={{
            flex: 1,
            backgroundColor: item.reporter_phone ? '#B71C1C' : '#E5E7EB',
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Phone size={16} color={item.reporter_phone ? 'white' : '#9CA3AF'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNavigate}
          disabled={!item.latitude || !item.longitude}
          style={{
            flex: 1,
            backgroundColor: (item.latitude && item.longitude) ? '#0D47A1' : '#E5E7EB',
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Navigation size={16} color={(item.latitude && item.longitude) ? 'white' : '#9CA3AF'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onVerify}
          style={{
            flex: 1,
            backgroundColor: '#388E3C',
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={16} color="white" />
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: { [key: string]: { color: string; text: string } } = {
    pending: { color: '#FFA000', text: 'PENDING' },
    verified: { color: '#388E3C', text: 'VERIFIED' },
    in_progress: { color: '#0D47A1', text: 'IN PROGRESS' },
    resolved: { color: '#388E3C', text: 'RESOLVED' },
    rejected: { color: '#B71C1C', text: 'REJECTED' },
  };

  const config = statusConfig[status.toLowerCase()] || { color: '#6B7D99', text: status.toUpperCase().replace('_', ' ') };

  return (
    <YStack
      backgroundColor={config.color}
      paddingHorizontal={10}
      paddingVertical={4}
      borderRadius={12}
      alignItems="center"
      justifyContent="center"
      minWidth={90}
    >
      <Text fontSize={12} fontWeight="600" color="white" textAlign="center">
        {config.text}
      </Text>
    </YStack>
  );
}

function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return '$red10';
    case 'medium':
      return '$orange10';
    case 'low':
      return '$blue10';
    case 'emergency':
      return '$red10';
    default:
      return '$gray10';
  }
}
