import { Input as TamaguiInput, styled } from 'tamagui'

export const Input = styled(TamaguiInput, {
  name: 'Input',
  variants: {
    size: {
      sm: {
        height: 32,
        fontSize: 14,
        paddingHorizontal: 12,
      },
      md: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 16,
      },
      lg: {
        height: 48,
        fontSize: 18,
        paddingHorizontal: 20,
      },
    },
    variant: {
      default: {
        backgroundColor: '$background',
        borderColor: '$border',
        borderWidth: 1,
        borderRadius: 8,
        color: '$text',
        placeholderTextColor: '$textMuted',
        focusStyle: {
          borderColor: '$primary',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$border',
        borderWidth: 1,
        borderRadius: 8,
        color: '$text',
        placeholderTextColor: '$textMuted',
        focusStyle: {
          borderColor: '$primary',
        },
      },
    },
  } as const,
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

export default Input
