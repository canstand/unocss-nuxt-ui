import type { UseHeadInput } from '@unhead/vue/types'
import { defineNuxtPlugin, useAppConfig, useHead, useNuxtApp } from '#imports'
import { theme as wind4Theme } from 'unocss/preset-wind4'
import { computed } from 'vue'

interface UiColorConfig {
  colors?: Record<string, string>
  prefix?: string
}

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
const colors = wind4Theme.colors

function getColor(color: keyof typeof colors, shade: typeof shades[number]): string {
  if (color in colors && typeof colors[color] === 'object' && shade in colors[color]) {
    return colors[color][shade] as string
  }

  return ''
}

function getPaletteVariable(value: string, shade: typeof shades[number], prefix?: string) {
  const colorName = value === 'neutral' ? 'old-neutral' : value
  const candidates = [
    prefix ? `--${prefix}-color-${colorName}-${shade}` : '',
    `--color-${colorName}-${shade}`,
  ].filter(Boolean)

  return candidates.reduceRight((fallback, variable) => `var(${variable}, ${fallback})`, getColor(value as keyof typeof colors, shade))
}

function generateShades(key: string, value: string, prefix?: string) {
  return shades
    .map(shade => `--ui-color-${key}-${shade}: ${getPaletteVariable(value, shade, prefix)};`)
    .join('\n  ')
}

function generateColor(key: string, shade: 400 | 500) {
  return `--ui-${key}: var(--ui-color-${key}-${shade});`
}

function resolveUiConfig(input: unknown): UiColorConfig {
  if (!input || typeof input !== 'object') {
    return {}
  }

  return input as UiColorConfig
}

export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const nuxtApp = useNuxtApp()

  const compatibilityCss = computed(() => {
    const uiConfig = resolveUiConfig(appConfig.ui)
    const uiColors = uiConfig.colors || {}
    const entries = Object.entries(uiColors)
    if (entries.length === 0) {
      return ''
    }

    const nonNeutralColorKeys = Object.keys(uiColors).filter(key => key !== 'neutral')
    const prefix = uiConfig.prefix

    return `@layer theme {
  :root, :host {
  ${entries.map(([key, value]) => generateShades(key, value, prefix)).join('\n  ')}
  }
  :root, :host, .light {
  ${nonNeutralColorKeys.map(key => generateColor(key, 500)).join('\n  ')}
  }
  .dark {
  ${nonNeutralColorKeys.map(key => generateColor(key, 400)).join('\n  ')}
  }
}`
  })

  if (!compatibilityCss.value) {
    return
  }

  const headData: UseHeadInput = {
    style: [{
      innerHTML: () => compatibilityCss.value,
      tagPriority: -2,
      id: 'nuxt-ui-runtime-colors',
    }],
  }

  if (import.meta.client && nuxtApp.isHydrating && !nuxtApp.payload.serverRendered && compatibilityCss.value) {
    const style = document.createElement('style')
    style.innerHTML = compatibilityCss.value
    style.setAttribute('data-nuxt-ui-runtime-colors', '')
    document.head.appendChild(style)

    headData.script = [{
      innerHTML: 'document.head.removeChild(document.querySelector(\'[data-nuxt-ui-runtime-colors]\'))',
    }]
  }

  useHead(headData)
})
