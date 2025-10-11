import { View, styled } from 'tamagui';
import { Text } from './text';

export const Badge = styled(View, {
  name: 'Badge',
  variants: {
    variant: {
      default: {
        backgroundColor: '$backgroundSoft',
        paddingHorizontal: '$2.5',
        paddingVertical: '$1.5',
        borderRadius: '$sm',
      },
    },
  } as const,
  defaultVariants: {
    variant: 'default',
  },
});

export const BadgeText = styled(Text, {
  name: 'BadgeText',
  color: '$text',
  fontSize: 12,
  fontWeight: '600',
});

export default Badge;
