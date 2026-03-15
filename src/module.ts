import type { UnoConfigLayerOptions } from './unocss/logic/template'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  addPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  findPath,
  logger,
} from 'nuxt/kit'
import { buildCompatibilityCss, prependCssEntry } from './logic/css'
import { applyNuxtUiUnoDefaults } from './unocss/logic/defaults'
import { getNuxtUiUnoConfigTemplate, resolveUnoLayerConfigPaths } from './unocss/logic/template'
import { isStyleLikeRequest, rewriteTailwindVarSyntaxInApply, stripTailwindVitePlugins } from './vite/transform'

export interface ModuleOptions {}

function isComponentDetectionEnabled(nuxt: { options: Record<string, any> }) {
  const ui = nuxt.options.ui
  return Boolean(ui && ui.experimental && ui.experimental.componentDetection)
}

async function resolveNuxtUiCssContent(nuxt: { options: Record<string, any> }) {
  const buildTemplates = nuxt.options.build?.templates
  if (Array.isArray(buildTemplates)) {
    const uiCssTemplate = buildTemplates.find((template: any) => template?.filename === 'ui.css')
    if (uiCssTemplate && typeof uiCssTemplate.getContents === 'function') {
      const content = await uiCssTemplate.getContents({})
      if (typeof content === 'string' && content.length > 0) {
        return content
      }
    }
  }

  try {
    return await readFile(join(nuxt.options.buildDir, 'ui.css'), 'utf8')
  }
  catch {
    return undefined
  }
}

async function resolveNuxtAppConfigPaths(nuxt: { options: Record<string, any> }) {
  const layers = Array.isArray(nuxt.options._layers)
    ? nuxt.options._layers
    : []

  const paths = await Promise.all(layers.map(async (layer: any) => {
    const srcDir = layer?.config?.srcDir || layer?.config?.rootDir
    if (!srcDir || typeof srcDir !== 'string') {
      return undefined
    }

    return await findPath(join(srcDir, 'app.config'))
  }))

  return Array.from(new Set(paths.filter((path): path is string => typeof path === 'string')))
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'unocss-nuxt-ui',
    configKey: 'unocss-nuxt-ui',
  },
  moduleDependencies: {
    '@unocss/nuxt': {
      defaults: {
        wind3: false,
        wind4: false,
        nuxtLayers: false,
      },
    },
    '@nuxt/ui': {
      version: '>=4.0.1',
    },
  },
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolvedPresetPath = await findPath(resolve('./preset')) || resolve('./preset')

    addTemplate({
      filename: 'uno.config.mjs',
      write: true,
      async getContents() {
        const optionsWithUno = nuxt.options as typeof nuxt.options & { unocss?: unknown }
        const userUnoOptions = typeof optionsWithUno.unocss === 'object'
          ? optionsWithUno.unocss as UnoConfigLayerOptions
          : undefined
        const componentDetection = isComponentDetectionEnabled(nuxt as unknown as { options: Record<string, any> })
        const [uiCssContent, appConfigFiles] = await Promise.all([
          resolveNuxtUiCssContent(nuxt as unknown as { options: Record<string, any> }),
          resolveNuxtAppConfigPaths(nuxt as unknown as { options: Record<string, any> }),
        ])

        const layerConfigPaths = userUnoOptions?.nuxtLayers
          ? await resolveUnoLayerConfigPaths(nuxt, userUnoOptions.configFile)
          : []

        return getNuxtUiUnoConfigTemplate(
          layerConfigPaths.reverse(),
          resolvedPresetPath,
          {
            buildDir: nuxt.options.buildDir,
            appConfigFiles,
            componentDetection,
            dev: nuxt.options.dev,
            uiCssContent,
          },
        )
      },
    })

    nuxt.hook('unocss:config' as any, async (config: Record<string, any>) => {
      const [uiCssContent, appConfigFiles] = await Promise.all([
        resolveNuxtUiCssContent(nuxt as unknown as { options: Record<string, any> }),
        resolveNuxtAppConfigPaths(nuxt as unknown as { options: Record<string, any> }),
      ])

      applyNuxtUiUnoDefaults(config, {
        buildDir: nuxt.options.buildDir,
        appConfigFiles,
        componentDetection: isComponentDetectionEnabled(nuxt as unknown as { options: Record<string, any> }),
        dev: nuxt.options.dev,
        uiCssContent,
      })
    })

    const compatibilityCssTemplate = addTemplate({
      filename: 'unocss-nuxt-ui/compatibility.css',
      write: true,
      getContents: () => buildCompatibilityCss(),
    })
    if (compatibilityCssTemplate.dst) {
      nuxt.options.css = prependCssEntry(nuxt.options.css || [], compatibilityCssTemplate.dst)
    }

    const uiEntryPath = await findPath('@nuxt/ui')
    if (!uiEntryPath) {
      logger.warn('[unocss-nuxt-ui] Cannot resolve `@nuxt/ui` entry; skip keyframes.css injection.')
    }
    else {
      const keyframesPath = join(dirname(uiEntryPath), 'runtime/keyframes.css')
      nuxt.options.css = prependCssEntry(nuxt.options.css || [], keyframesPath)
    }

    addPlugin({
      src: resolve('./runtime/colors'),
    })

    nuxt.hook('vite:extend', async ({ config }) => {
      config.plugins ||= []
      config.plugins.push({
        name: 'unocss-nuxt-ui:rewrite-apply-var-syntax',
        enforce: 'pre',
        transform(code, id) {
          if (!isStyleLikeRequest(id) || !code.includes('@apply') || !code.includes('-(--')) {
            return null
          }

          const patched = rewriteTailwindVarSyntaxInApply(code)
          if (patched === code) {
            return null
          }

          return {
            code: patched,
            map: {
              version: 3,
              file: id,
              sources: [id],
              sourcesContent: [code],
              names: [],
              mappings: '',
            },
          }
        },
      })

      config.plugins = stripTailwindVitePlugins(config.plugins)
    })
  },
})
