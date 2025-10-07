import React from 'react';
import { TouchableOpacity, Alert, Linking } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { ShieldCheck, Phone } from '@tamagui/lucide-icons';

interface ReportListHeaderProps {
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  onFilterPress: () => void;
  filterStatus: string[];
  filterPriority: string[];
}

export function ReportListHeader({
  viewMode,
  onViewModeChange,
  onFilterPress,
  filterStatus,
  filterPriority,
}: ReportListHeaderProps) {
  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'Call BFP Emergency Hotline?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:911') },
      ]
    );
  };

  const handleBulkVerify = () => {
    Alert.alert(
      'Bulk Verification',
      'Mark all pending reports as verified?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => Alert.alert('Success', 'Bulk verification completed') },
      ]
    );
  };

  return (
    <YStack
      backgroundColor="$background"
      paddingTop="$md"
      paddingBottom="$md"
      paddingHorizontal="$md"
      borderBottomWidth={1}
      borderBottomColor="$border"
    >
      {/* Quick Actions Bar */}
      <XStack space={12} marginBottom="$md">
        <TouchableOpacity
          onPress={handleBulkVerify}
          style={{
            flex: 1,
            backgroundColor: '#388E3C',
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <XStack alignItems="center" space={6}>
            <ShieldCheck size={16} color="white" />
            <Text fontSize={14} fontWeight="600" color="white">
              Verify Reports
            </Text>
          </XStack>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEmergencyCall}
          style={{
            flex: 1,
            backgroundColor: '#B71C1C',
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <XStack alignItems="center" space={6}>
            <Phone size={16} color="white" />
            <Text fontSize={14} fontWeight="600" color="white">
              Emergency
            </Text>
          </XStack>
        </TouchableOpacity>
      </XStack>

      <XStack justifyContent="space-between" alignItems="center" width="100%">
        <YStack>
          <Text fontSize={20} fontWeight="700" color="$text">
            BFP Reports
          </Text>
        </YStack>
        <TouchableOpacity onPress={onFilterPress}>
          <Text fontSize={20} color="$text">
            ☰
          </Text>
        </TouchableOpacity>
      </XStack>
      <XStack
        backgroundColor="$backgroundSoft"
        borderRadius="$xl"
        padding={2}
        marginTop="$sm"
      >
        <TouchableOpacity
          onPress={() => onViewModeChange('list')}
          style={{
            flex: 1,
            paddingVertical: 8,
            backgroundColor: viewMode === 'list' ? '$background' : 'transparent',
            borderRadius: 20,
            alignItems: 'center',
          }}
        >
          <Text
            fontSize={15}
            color={viewMode === 'list' ? '$primary' : '$textSecondary'}
          >
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onViewModeChange('map')}
          style={{
            flex: 1,
            paddingVertical: 8,
            backgroundColor: viewMode === 'map' ? '$background' : 'transparent',
            borderRadius: 20,
            alignItems: 'center',
          }}
        >
          <Text
            fontSize={15}
            color={viewMode === 'map' ? '$primary' : '$textSecondary'}
          >
            Map
          </Text>
        </TouchableOpacity>
      </XStack>
      {/* Active Filters Display */}
      {(filterStatus.length > 0 || filterPriority.length > 0) && (
        <XStack space="$2" marginTop="$sm" flexWrap="wrap">
          {filterStatus.filter(s => s !== 'all').map(status => (
            <YStack
              key={status}
              backgroundColor="$primary"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$md"
            >
              <Text fontSize={12} color="white" textTransform="capitalize">
                {status.replace('_', ' ')}
              </Text>
            </YStack>
          ))}
          {filterPriority.filter(p => p !== 'all').map(priority => (
            <YStack
              key={priority}
              backgroundColor={priority === 'high' ? '$red10' : priority === 'medium' ? '$orange10' : '$blue10'}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$md"
            >
              <Text fontSize={12} color="white" textTransform="capitalize">
                {priority}
              </Text>
            </YStack>
          ))}
        </XStack>
      )}
    </YStack>
  );
}
