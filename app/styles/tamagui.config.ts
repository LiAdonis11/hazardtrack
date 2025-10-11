import { createTamagui } from 'tamagui'
import { config as tamaguiConfig } from '@tamagui/config/v3'

const { themes, tokens } = tamaguiConfig

export const config = createTamagui({
  ...tamaguiConfig,
  themes,
  tokens: {
    ...tokens,
    // Font sizes should be added to the size token
    size: {
      ...tokens.size,
      xs: 12, // 12px for Caption
      sm: 15, // 15px for Body
      md: 17, // 17px for H3
      lg: 22, // 22px for H2
      xl: 28, // 28px for H1
    },
  },
  shorthands: {
    br: 'borderRadius',
    p: 'padding',
    m: 'margin',
  },
  media: {
    sm: { maxWidth: 640 },
    md: { maxWidth: 768 },
    lg: { maxWidth: 1024 },
  },
})

export default config
