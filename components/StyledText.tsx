import React from 'react';
import { Text as DefaultText, TextProps as DefaultTextProps } from 'react-native';

export function MonoText(props: DefaultTextProps) {
  return <DefaultText {...props} style={[props.style, { fontFamily: 'space-mono' }]} />;
}
