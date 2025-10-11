import React from 'react';
import { TouchableOpacity, Text, View, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  paddingHorizontal = 20,
  paddingVertical = 10,
  backgroundColor = '#B71C1C',
  borderWidth,
  borderColor,
  borderRadius = 25,
  color = 'white',
  fontSize = 16,
  fontWeight = '500',
  icon,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal,
    paddingVertical,
    backgroundColor,
    borderRadius,
    opacity: disabled ? 0.6 : 1,
    shadowColor: backgroundColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...style,
  };

  if (borderWidth) {
    buttonStyle.borderWidth = borderWidth;
    buttonStyle.borderColor = borderColor;
  }

  const textStyleObj: TextStyle = {
    color,
    fontSize,
    fontWeight: fontWeight as any,
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
    >
      {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
      <Text style={textStyleObj}>{title}</Text>
    </TouchableOpacity>
  );
}
