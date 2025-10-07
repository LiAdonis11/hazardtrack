import React from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, Input } from 'tamagui';
import { ArrowLeft, Filter } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

interface ProximityHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onFilterPress: () => void;
}

export function ProximityHeader({
  searchQuery,
  onSearchQueryChange,
  onFilterPress,
}: ProximityHeaderProps) {
  const router = useRouter();

  return (
    <XStack
      backgroundColor="$background"
      paddingTop={60}
      paddingBottom="$md"
      paddingHorizontal="$md"
      borderBottomWidth={1}
      borderBottomColor="$border"
      space="$sm"
      alignItems="center"
    >
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeft size={24} color="$text" />
      </TouchableOpacity>
      <Input
        flex={1}
        placeholder="Search reports..."
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        backgroundColor="$backgroundSoft"
        borderRadius="$sm"
        paddingHorizontal="$sm"
        paddingVertical="$xs"
        fontSize={16}
        borderWidth={1}
        borderColor="$border"
      />
      <TouchableOpacity onPress={onFilterPress}>
        <Filter size={24} color="$text" />
      </TouchableOpacity>
    </XStack>
  );
}
