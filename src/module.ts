import { dirname, join } from 'node:path'
import {
  addTemplate,
  createResolver,
  defineNuxtModule,
  findPath,
  logger,
} from 'nuxt/kit'
import { buildCompatibilityCss, prependCssEntry } from './logic/css'
import { applyNuxtUiUnoDefaults } from './unocss/logic/defaults'
import { getNuxtUiUnoConfigTemplate, resolveUnoLayerConfigPaths } from './unocss/logic/template'
import { stripTailwindVitePlugins } from './vite/transform'

export * from './preset'

export interface ModuleOptions {
  tailwindColorsAlias?: boolean
}

export const defaultModuleOptions: Required<ModuleOptions> = {
  tailwindColorsAlias: true,
}

export function addTailwindColorAliases(aliases: Record<string, string>, replacement: string) {
  aliases['tailwindcss/colors'] = replacement
  aliases['tailwindcss/colors.js'] = replacement
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'unocss-nuxt-ui',
    configKey: 'unocss-nuxt-ui',
  },
  defaults: defaultModuleOptions,
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
    const tailwindColorsCompatPath = resolve('./runtime/tailwindcss/colors')

    if (options.tailwindColorsAlias) {
      nuxt.options.alias ||= {}
      addTailwindColorAliases(nuxt.options.alias as Record<string, string>, tailwindColorsCompatPath)

      nuxt.options.nitro ||= {}
      nuxt.options.nitro.alias ||= {}
      addTailwindColorAliases(nuxt.options.nitro.alias as Record<string, string>, tailwindColorsCompatPath)
    }

    addTemplate({
      filename: 'uno.config.mjs',
      write: true,
      async getContents() {
        const optionsWithUno = nuxt.options as typeof nuxt.options & { unocss?: unknown }
        const userUnoOptions = typeof optionsWithUno.unocss === 'object'
          ? (optionsWithUno.unocss as { nuxtLayers?: boolean, configFile?: string | string[] })
          : undefined

        const layerConfigPaths = userUnoOptions?.nuxtLayers
          ? await resolveUnoLayerConfigPaths(nuxt, userUnoOptions.configFile)
          : []

        return getNuxtUiUnoConfigTemplate(
          layerConfigPaths.reverse(),
          {
            buildDir: nuxt.options.buildDir,
          },
        )
      },
    })

    nuxt.hook('unocss:config' as any, (config: Record<string, any>) => {
      applyNuxtUiUnoDefaults(config, {})
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

    nuxt.hook('vite:extend', async ({ config }) => {
      if (options.tailwindColorsAlias) {
        config.resolve ||= {}
        config.resolve.alias ||= {}
        if (!Array.isArray(config.resolve.alias)) {
          addTailwindColorAliases(config.resolve.alias as Record<string, string>, tailwindColorsCompatPath)
        }
      }

      config.plugins = stripTailwindVitePlugins(config.plugins)
    })
  },
})
