import { useState } from 'react'
import { Button, Text, View, styled } from 'tamagui'
import { ChevronDown } from '@tamagui/lucide-icons'

const SelectContainer = styled(View, {
  name: 'SelectContainer',
  position: 'relative',
})

const SelectTrigger = styled(Button, {
  name: 'SelectTrigger',
  backgroundColor: '$background',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
})

const SelectContent = styled(View, {
  name: 'SelectContent',
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '$background',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: 8,
  marginTop: 4,
  zIndex: 1000,
  shadowColor: '$black',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,

})

const SelectItem = styled(Button, {
  name: 'SelectItem',
  backgroundColor: 'transparent',
  paddingHorizontal: 16,
  paddingVertical: 12,
  justifyContent: 'flex-start',
  borderBottomWidth: 1,
  borderBottomColor: '$borderLight',
  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },
})

const SelectValue = styled(Text, {
  name: 'SelectValue',
  color: '$text',
  fontSize: 16,
})

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
}

export function Select({ value, onValueChange, placeholder, children }: SelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <SelectContainer>
      <SelectTrigger onPress={() => setOpen(!open)}>
        <SelectValue>{value || placeholder}</SelectValue>
        <ChevronDown size={16} />
      </SelectTrigger>
      {open && (
        <SelectContent>
          {children}
        </SelectContent>
      )}
    </SelectContainer>
  )
}

export { SelectTrigger, SelectContent, SelectItem, SelectValue }
export default Select
