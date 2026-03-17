import type { NuxtUiPipelineContext } from './pipeline'
import { findPath } from 'nuxt/kit'
import {
  defaultPipelineInclude,
  getRequiredNuxtUiFilesystemContent,
  getRequiredNuxtUiPipelineInclude,
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
  options: NuxtUiUnoConfigTemplateOptions = {},
) {
  const pipelineIncludes = getRequiredNuxtUiPipelineInclude(options)
    .map(pattern => `      ${pattern.toString()},`)
    .join('\n')
  const filesystemEntries = getRequiredNuxtUiFilesystemContent(options)
  const filesystemLines = filesystemEntries.length > 0
    ? `    filesystem: [\n${filesystemEntries.map(entry => `      ${JSON.stringify(entry)},`).join('\n')}\n    ],\n`
    : ''

  const imports = [
    `import { defineConfig, mergeConfigs, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'`,
    `import { presetNuxtUI, presetNuxtUIExtra } from 'unocss-nuxt-ui'`,
    ...layerConfigPaths.map((path, index) => `import layerConfig${index} from ${JSON.stringify(path)}`),
  ]

  const configNames = [...layerConfigPaths.map((_, index) => `layerConfig${index}`), 'config']
  const defaultIncludes = defaultPipelineInclude
    .map(pattern => `      ${pattern.toString()},`)
    .join('\n')

  return [
    ...imports,
    '',
    `const config = defineConfig({
  presets: [
    presetNuxtUI(),
    presetWind4(),
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
${pipelineIncludes}
      ],
    },
${filesystemLines}  },
  outputToCssLayers: true,
})`,
    `export default mergeConfigs([${configNames.join(', ')}])`,
    '',
  ].join('\n')
}
