import React from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, Text } from 'tamagui';
import { Plus, Minus, Locate } from '@tamagui/lucide-icons';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnUser: () => void;
  mapRegion: any;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onCenterOnUser,
  mapRegion,
}: MapControlsProps) {
  return (
    <XStack
      position="absolute"
      top={100}
      left="$md"
      right="$md"
      justifyContent="center"
      backgroundColor="$background"
      paddingHorizontal="$sm"
      paddingVertical="$xs"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$border"
    >
      <TouchableOpacity onPress={onZoomOut} style={{ paddingHorizontal: 8 }}>
        <Minus size={16} color="$text" />
      </TouchableOpacity>
      <Text fontSize={14} color="$textSecondary" paddingHorizontal="$xs">
        {mapRegion ? `${(mapRegion.latitudeDelta * 111).toFixed(1)}km` : '2km'}
      </Text>
      <TouchableOpacity onPress={onCenterOnUser} style={{ paddingHorizontal: 8 }}>
        <Locate size={16} color="$text" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onZoomIn} style={{ paddingHorizontal: 8 }}>
        <Plus size={16} color="$text" />
      </TouchableOpacity>
    </XStack>
  );
}
