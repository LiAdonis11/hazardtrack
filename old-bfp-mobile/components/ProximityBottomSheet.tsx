import React from 'react';
import { View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { getTimeAgo, calculateDistance } from '../../../lib/utils';

interface Report {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  category_name?: string;
  location_address?: string;
}

const { height } = Dimensions.get('window');

interface ProximityBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  reports: Report[];
  userLocation: any;
  onViewReport: (report: Report) => void;
}

export function ProximityBottomSheet({
  visible,
  onClose,
  reports,
  userLocation,
  onViewReport,
}: ProximityBottomSheetProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: height * 0.3,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <YStack flex={1}>
        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor="$border"
        >
          <Text fontSize={18} fontWeight="700" color="$color">
            {reports.length} reports nearby
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="$color" />
          </TouchableOpacity>
        </XStack>

        {/* Reports List */}
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <YStack
              padding="$4"
              borderBottomWidth={1}
              borderBottomColor="$border"
            >
              <Text fontSize={17} fontWeight="600" color="$text">
                🏢 {item.location_address || 'Location not specified'}
              </Text>
              <Text fontSize={15} color="$textSecondary" marginTop={4}>
                {item.category_name || 'N/A'} ·{' '}
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} ·{' '}
                {getTimeAgo(item.created_at)}
              </Text>
              <Text fontSize={13} color="$textSecondary" marginTop={2}>
                📍{' '}
                {userLocation
                  ? calculateDistance(
                      userLocation.coords.latitude,
                      userLocation.coords.longitude,
                      item.latitude || 0,
                      item.longitude || 0
                    )
                  : 'N/A'}{' '}
                away
              </Text>
              <TouchableOpacity
                onPress={() => {
                  onViewReport(item);
                  onClose();
                }}
                style={{
                  marginTop: 8,
                  backgroundColor: '#0f62fe', // Use actual color code for $primary
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text fontSize={15} color="white" fontWeight="600">
                  View Details
                </Text>
              </TouchableOpacity>
            </YStack>
          )}
          showsVerticalScrollIndicator={false}
        />
      </YStack>
    </View>
  );
}
