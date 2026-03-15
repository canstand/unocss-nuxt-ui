import type { NuxtUiPipelineContext } from './pipeline'
import { resolve } from 'node:path'
import { findPath } from 'nuxt/kit'
import {
  defaultPipelineInclude,
  getNuxtUiBuildIncludeRuntimeTemplateSource,
  getRequiredNuxtUiPipelineInclude,
  getSharedNuxtUiPipelineInclude,
} from './pipeline'

export interface UnoConfigLayerOptions {
  configFile?: string | string[]
  nuxtLayers?: boolean
}

export interface NuxtUiUnoConfigTemplateOptions extends NuxtUiPipelineContext {}

interface NuxtLayerRoot {
  config: {
    rootDir: string
  }
}

interface NuxtLike {
  options: {
    _layers: readonly NuxtLayerRoot[]
  }
}

export async function resolveUnoLayerConfigPaths(nuxt: NuxtLike, configFile?: string | string[]) {
  const candidates = configFile || ['uno.config', 'unocss.config']

  return (await Promise.all(
    nuxt.options._layers
      .slice(1)
      .map(layer => findPath(candidates, { cwd: layer.config.rootDir })),
  )).filter(Boolean) as string[]
}

export function getNuxtUiUnoConfigTemplate(
  layerConfigPaths: string[] = [],
  presetImportPath: string,
  options: NuxtUiUnoConfigTemplateOptions = {},
) {
  const useRuntimeBuildIncludes = Boolean(options.buildDir && options.componentDetection)
  const includePatterns = useRuntimeBuildIncludes
    ? getSharedNuxtUiPipelineInclude(options)
    : getRequiredNuxtUiPipelineInclude(options)
  const pipelineIncludes = includePatterns
    .map(pattern => `      ${pattern.toString()},`)
    .join('\n')
  const runtimeBuildIncludeTemplate = useRuntimeBuildIncludes && options.buildDir
    ? getNuxtUiBuildIncludeRuntimeTemplateSource(options.buildDir)
    : ''
  const configDepsLine = useRuntimeBuildIncludes && options.buildDir
    ? `  configDeps: [${JSON.stringify(resolve(options.buildDir, 'ui.css'))}],`
    : ''

  const imports = [
    `import presetWind4 from '@unocss/preset-wind4'`,
    ...(useRuntimeBuildIncludes ? [`import { readFileSync } from 'node:fs'`] : []),
    `import { defineConfig, mergeConfigs, transformerDirectives, transformerVariantGroup } from 'unocss'`,
    `import { presetNuxtUI, presetNuxtUIExtra } from ${JSON.stringify(presetImportPath)}`,
    ...layerConfigPaths.map((path, index) => `import layerConfig${index} from ${JSON.stringify(path)}`),
  ]

  const configNames = [...layerConfigPaths.map((_, index) => `layerConfig${index}`), 'config']
  const defaultIncludes = defaultPipelineInclude
    .map(pattern => `      ${pattern.toString()},`)
    .join('\n')

  return [
    ...imports,
    '',
    ...(runtimeBuildIncludeTemplate ? [runtimeBuildIncludeTemplate, ''] : []),
    `const config = defineConfig({
  presets: [
    presetNuxtUI(),
    presetWind4({
      preflights: { reset: true, theme: 'on-demand' },
      dark: { dark: '.dark', light: '.light' },
    }),
    presetNuxtUIExtra(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup({ separators: [':'] }),
  ],
  content: {
    pipeline: {
      include: [
${defaultIncludes}
${useRuntimeBuildIncludes ? '      ...__nuxtUiBuildIncludes,' : ''}
${pipelineIncludes}
      ],
    },
  },
${configDepsLine}
  outputToCssLayers: true,
})`,
    `export default mergeConfigs([${configNames.join(', ')}])`,
    '',
  ].join('\n')
}
