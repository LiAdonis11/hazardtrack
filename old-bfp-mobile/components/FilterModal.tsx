import React from 'react';
import { View, TouchableOpacity, Modal as RNModal } from 'react-native';
import { YStack, XStack, Text, Checkbox } from 'tamagui';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  tempSort: 'priority' | 'status' | 'time';
  onTempSortChange: (sort: 'priority' | 'status' | 'time') => void;
  tempStatus: string[];
  onTempStatusChange: (status: string[]) => void;
  tempPriority: string[];
  onTempPriorityChange: (priority: string[]) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterModal({
  visible,
  onClose,
  tempSort,
  onTempSortChange,
  tempStatus,
  onTempStatusChange,
  tempPriority,
  onTempPriorityChange,
  onApply,
  onClear,
}: FilterModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            padding: 24,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80%',
          }}
        >
          <YStack space="$md">
            <Text fontSize={20} fontWeight="600" color="#111827">
              Sort & Filter
            </Text>
            <YStack space="$2">
              <Text fontSize={16} fontWeight="600" color="#374151">
                SORT BY
              </Text>
              <XStack space="$2">
                {['priority', 'status', 'time'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      onTempSortChange(option as 'priority' | 'status' | 'time')
                    }
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor:
                        tempSort === option ? '#0F4C81' : '#F3F4F6',
                    }}
                  >
                    <Text
                      fontSize={14}
                      color={tempSort === option ? 'white' : '#374151'}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </XStack>
            </YStack>
            <YStack space="$2">
              <Text fontSize={16} fontWeight="600" color="#374151">
                STATUS
              </Text>
              <YStack space="$2">
                <XStack alignItems="center" space="$2">
                  <Checkbox
                    checked={tempStatus.includes('all')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onTempStatusChange(['all']);
                      } else {
                        onTempStatusChange([]);
                      }
                    }}
                  />
                  <Text fontSize={14} color="#374151">
                    All
                  </Text>
                </XStack>
                {['pending', 'in_progress', 'resolved', 'verified'].map(
                  (status) => (
                    <XStack key={status} alignItems="center" space="$2">
                      <Checkbox
                        checked={tempStatus.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onTempStatusChange([
                              ...tempStatus.filter((s) => s !== 'all'),
                              status,
                            ]);
                          } else {
                            onTempStatusChange(
                              tempStatus.filter((s) => s !== status)
                            );
                          }
                        }}
                      />
                      <Text fontSize={14} color="#374151">
                        {status.replace('_', ' ').charAt(0).toUpperCase() +
                          status.replace('_', ' ').slice(1)}
                      </Text>
                    </XStack>
                  )
                )}
              </YStack>
            </YStack>
            <YStack space="$2">
              <Text fontSize={16} fontWeight="600" color="#374151">
                PRIORITY
              </Text>
              <YStack space="$2">
                <XStack alignItems="center" space="$2">
                  <Checkbox
                    checked={tempPriority.includes('all')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onTempPriorityChange(['all']);
                      } else {
                        onTempPriorityChange([]);
                      }
                    }}
                  />
                  <Text fontSize={14} color="#374151">
                    All
                  </Text>
                </XStack>
                {['emergency', 'high', 'medium', 'low'].map((priority) => (
                  <XStack key={priority} alignItems="center" space="$2">
                    <Checkbox
                      checked={tempPriority.includes(priority)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onTempPriorityChange([
                            ...tempPriority.filter((p) => p !== 'all'),
                            priority,
                          ]);
                        } else {
                          onTempPriorityChange(
                            tempPriority.filter((p) => p !== priority)
                          );
                        }
                      }}
                    />
                    <Text fontSize={14} color="#374151">
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
            <XStack space="$2">
              <TouchableOpacity
                onPress={onApply}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: '#0F4C81',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text fontSize={16} color="white">
                  Apply
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClear}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: '#9CA3AF',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text fontSize={16} color="white">
                  Clear All
                </Text>
              </TouchableOpacity>
            </XStack>
          </YStack>
        </View>
      </View>
    </RNModal>
  );
}
