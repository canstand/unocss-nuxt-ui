import { presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetNuxtUI } from '../../preset'

type FilterPattern = RegExp | string | ((id: string) => boolean)

export interface NuxtUiPipelineContext {}

export const defaultPipelineInclude = [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/]

export function getRequiredNuxtUiPipelineInclude(): FilterPattern[] {
  return [
    /[\\/]\.nuxt[\\/](?:ui[\\/].+\.ts|app\.config\.(?:m?js|m?ts))($|\?)/,
    /%2F\.nuxt%2F(?:ui%2F.+\.ts|app\.config\.(?:m?js|m?ts))($|\?)/,
    /[\\/]app\.config\.(?:m?js|m?ts)($|\?)/,
  ]
}

const wind4PresetName = '@unocss/preset-wind4'
const directivesTransformerName = '@unocss/transformer-directives'
const variantGroupTransformerName = '@unocss/transformer-variant-group'
const presetNuxtUiName = 'unocss-nuxt-ui'

function ensurePreset(config: Record<string, any>, name: string, factory: () => Record<string, any>, position: 'start' | 'end' = 'end') {
  config.presets ||= []
  if (!config.presets.some((preset: Record<string, any>) => preset?.name === name)) {
    if (position === 'start') {
      config.presets.unshift(factory())
    }
    else {
      config.presets.push(factory())
    }
  }
}

function ensureTransformer(config: Record<string, any>, name: string, factory: () => Record<string, any>) {
  config.transformers ||= []
  if (!config.transformers.some((transformer: Record<string, any>) => transformer?.name === name)) {
    config.transformers.push(factory())
  }
}

function replaceTransformer(config: Record<string, any>, name: string, factory: () => Record<string, any>) {
  config.transformers ||= []

  const index = config.transformers.findIndex((transformer: Record<string, any>) => transformer?.name === name)
  if (index === -1) {
    config.transformers.push(factory())
    return
  }

  config.transformers.splice(index, 1, factory())
}

function toArray<T>(value?: T | T[]) {
  if (value === undefined) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function serializePattern(pattern: FilterPattern) {
  if (pattern instanceof RegExp) {
    return `re:${pattern.source}/${pattern.flags}`
  }

  if (typeof pattern === 'string') {
    return `str:${pattern}`
  }

  return `fn:${pattern.toString()}`
}

function dedupePatterns(patterns: FilterPattern[]) {
  const seen = new Set<string>()
  const output: FilterPattern[] = []

  for (const pattern of patterns) {
    const key = serializePattern(pattern)
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    output.push(pattern)
  }

  return output
}

function ensurePipelineInclude(config: Record<string, any>) {
  config.content ||= {}

  if (config.content.pipeline === false) {
    return
  }

  config.content.pipeline ||= {}

  const requiredNuxtUiPipelineInclude = getRequiredNuxtUiPipelineInclude()
  const hasUserInclude = config.content.pipeline.include !== undefined
  const include = hasUserInclude
    ? toArray<FilterPattern>(config.content.pipeline.include as FilterPattern | FilterPattern[])
    : [...defaultPipelineInclude]

  config.content.pipeline.include = dedupePatterns([
    ...include,
    ...requiredNuxtUiPipelineInclude,
  ])
}

export function applyNuxtUiUnoDefaults(config: Record<string, any>, _context: NuxtUiPipelineContext = {}) {
  config.outputToCssLayers ??= true

  ensurePreset(config, presetNuxtUiName, () => presetNuxtUI(), 'start')
  ensurePreset(config, wind4PresetName, () => presetWind4({
    preflights: { reset: true, theme: 'on-demand' },
    dark: { dark: '.dark', light: '.light' },
  }))

  ensureTransformer(config, directivesTransformerName, () => transformerDirectives())
  replaceTransformer(config, variantGroupTransformerName, () => transformerVariantGroup({ separators: [':'] }))

  ensurePipelineInclude(config)
}
