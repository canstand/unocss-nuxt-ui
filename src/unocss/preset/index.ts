import type { Preset, UtilObject } from '@unocss/core'
import { definePreset } from '@unocss/core'
import { getPreflights } from './preflights'
import { getRules } from './rules'
import { resolveTheme } from './theme'
import { getVariants } from './variants'

export * from './theme'

export interface PresetOptions {
  colorSpace?: string
  preflights?: boolean | Preset['preflights']
  safelist?: boolean
  theme?: NonNullable<Parameters<typeof resolveTheme>[0]>['theme']
}

export const presetNuxtUI = definePreset((options: PresetOptions = {}) => {
  const colorSpace = options.colorSpace || 'oklab'
  const theme = resolveTheme({ theme: options.theme })

  const preflights = options.preflights === false
    ? undefined
    : typeof options.preflights === 'object'
      ? options.preflights
      : getPreflights()

  const safelist = options.safelist === false
    ? undefined
    : [
        `before:content-['']`,
        `after:content-['']`,
        `translate-none`,
      ]

  return {
    name: 'unocss-nuxt-ui',
    theme: {
      colors: theme.colors,
      borderRadius: theme.radius,
    },
    preflights,
    shortcuts: [
      ['text-md', 'text-base'],
      ['column-1', 'columns-1'],
      ['align-center', 'align-middle'],
    ],
    rules: getRules(theme, colorSpace),
    variants: getVariants(),
    safelist,
    postprocess: [postProcessFn],
  }
})

function postProcessFn(util: UtilObject) {
  if (util.layer === 'properties') {
    return
  }

  if (
    (util.selector.includes('before\\:') || util.selector.includes('after\\:'))
    && !(util.entries.some(i => i[0] === 'content') || util.entries.some(i => i[0] === '--un-content'))
  ) {
    util.entries.push(['content', 'var(--un-content)'])
  }
}
