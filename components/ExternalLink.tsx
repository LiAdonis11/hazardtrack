import React from 'react';
import { Linking, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './Themed';

export function ExternalLink({ href, children, ...props }: TouchableOpacityProps & { href: string }) {
  const handlePress = () => {
    Linking.openURL(href);
  };

  return (
    <TouchableOpacity {...props} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
}
