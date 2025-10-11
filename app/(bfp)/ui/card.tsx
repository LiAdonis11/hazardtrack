import { View, styled } from 'tamagui'
import { Text } from './text'

export const Card = styled(View, {
  name: 'Card',
  variants: {
    variant: {
      default: {
        backgroundColor: '$background',
        borderColor: '$border',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
      },
      elevated: {
        backgroundColor: '$background',
        borderColor: '$border',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        shadowColor: '$black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    },
  } as const,
  defaultVariants: {
    variant: 'default',
  },
})

export const CardHeader = styled(View, {
  name: 'CardHeader',
  padding: 0,
  marginBottom: 12,
})

export const CardTitle = styled(Text, {
  name: 'CardTitle',
  fontSize: 18,
  fontWeight: '600',
  color: '$text',
})

export const CardContent = styled(View, {
  name: 'CardContent',
  padding: 0,
})

export default Card
