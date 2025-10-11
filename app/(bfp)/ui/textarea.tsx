import { TextArea as TamaguiTextArea, styled } from 'tamagui'

export const Textarea = styled(TamaguiTextArea, {
  name: 'Textarea',
  variants: {
    size: {
      sm: {
        minHeight: 80,
        fontSize: 14,
        padding: 12,
      },
      md: {
        minHeight: 100,
        fontSize: 16,
        padding: 16,
      },
      lg: {
        minHeight: 120,
        fontSize: 18,
        padding: 20,
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
    },
  } as const,
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

export default Textarea
