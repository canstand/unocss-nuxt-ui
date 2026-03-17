import type { NuxtUiPipelineContext } from './defaults'
import { relative } from 'node:path'
import { findPath } from 'nuxt/kit'
import { defaultPipelineInclude, getRequiredNuxtUiPipelineInclude } from './defaults'

export interface NuxtUiUnoConfigTemplateOptions extends NuxtUiPipelineContext {
  buildDir?: string
}

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

function toTemplateImportPath(path: string, buildDir?: string) {
  if (!buildDir) {
    return path
  }

  const relativePath = relative(buildDir, path).replace(/\\/g, '/')
  if (relativePath.startsWith('../') || relativePath.startsWith('./')) {
    return relativePath
  }

  return `./${relativePath}`
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
  const pipelineIncludes = getRequiredNuxtUiPipelineInclude()
    .map(pattern => `      ${pattern.toString()},`)
    .join('\n')

  const imports = [
    `import { defineConfig, mergeConfigs, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'`,
    `import { presetNuxtUI } from 'unocss-nuxt-ui'`,
    ...layerConfigPaths.map((path, index) => `import layerConfig${index} from ${JSON.stringify(toTemplateImportPath(path, options.buildDir))}`),
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
  },
  outputToCssLayers: true,
})`,
    `export default mergeConfigs([${configNames.join(', ')}])`,
    '',
  ].join('\n')
}
