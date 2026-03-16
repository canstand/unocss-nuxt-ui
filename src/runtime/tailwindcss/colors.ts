import { theme as wind4Theme } from 'unocss/preset-wind4'

const baseColors = wind4Theme.colors as Record<string, string | Record<string, string>>

const colors = {
  inherit: 'inherit',
  current: 'currentColor',
  transparent: 'transparent',
  black: '#000',
  white: '#fff',
  ...baseColors,
}

export default colors
