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
import { buildRuntimeCss, prependCssEntry } from './logic/css'
import { applyNuxtUiUnoDefaults } from './unocss/logic/defaults'
import { getNuxtUiUnoConfigTemplate, resolveUnoLayerConfigPaths } from './unocss/logic/template'
import { isStyleLikeRequest, rewriteTailwindVarSyntaxInApply, stripTailwindVitePlugins } from './vite/transform'

export interface ModuleOptions {
  runtimeCss?: boolean
  runtimeColors?: 'manual' | 'app-config'
}

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

// Export ModuleOptions for consumers
export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'unocss-nuxt-ui',
    configKey: 'unocss-nuxt-ui',
  },
  defaults: {
    runtimeCss: true,
    runtimeColors: 'manual',
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
  async setup(options, nuxt) {
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
        const uiCssContent = await resolveNuxtUiCssContent(nuxt as unknown as { options: Record<string, any> })

        const layerConfigPaths = userUnoOptions?.nuxtLayers
          ? await resolveUnoLayerConfigPaths(nuxt, userUnoOptions.configFile)
          : []

        return getNuxtUiUnoConfigTemplate(
          layerConfigPaths.reverse(),
          resolvedPresetPath,
          {
            buildDir: nuxt.options.buildDir,
            componentDetection,
            uiCssContent,
          },
        )
      },
    })

    nuxt.hook('unocss:config' as any, (config: Record<string, any>) => {
      applyNuxtUiUnoDefaults(config, {
        buildDir: nuxt.options.buildDir,
        componentDetection: isComponentDetectionEnabled(nuxt as unknown as { options: Record<string, any> }),
      })
    })

    if (options.runtimeCss) {
      const runtimeCssTemplate = addTemplate({
        filename: 'unocss-nuxt-ui/runtime.css',
        write: true,
        getContents: () => buildRuntimeCss(),
      })
      if (runtimeCssTemplate.dst) {
        nuxt.options.css = prependCssEntry(nuxt.options.css || [], runtimeCssTemplate.dst)
      }

      const uiEntryPath = await findPath('@nuxt/ui')
      if (!uiEntryPath) {
        logger.warn('[unocss-nuxt-ui] Cannot resolve `@nuxt/ui` entry; skip keyframes.css injection.')
      }
      else {
        const keyframesPath = join(dirname(uiEntryPath), 'runtime/keyframes.css')
        nuxt.options.css = prependCssEntry(nuxt.options.css || [], keyframesPath)
      }
    }

    if (options.runtimeColors === 'app-config') {
      addPlugin({
        src: resolve('./runtime/colors'),
      })
    }

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
