import { createTamagui } from 'tamagui'
import { config as tamaguiBaseConfig } from '@tamagui/config'

const tamaguiConfig = createTamagui({
  ...tamaguiBaseConfig,
  outputCSS: 'auto',
  optimize: true,
  tokens: {
    ...tamaguiBaseConfig.tokens,
    color: {
      ...tamaguiBaseConfig.tokens.color,
      border: '#F1F1F1',
      backgroundSoft: '#F8FAFB',
      text: '#111827',
      primary: '#E53935',
    },
    radius: {
      ...tamaguiBaseConfig.tokens.radius,
      sm: 8,
    },
  },
})

export const config = tamaguiConfig

export default config

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
