import { defineConfig, mergeConfigs } from 'unocss'

const uiUnoConfig = await import('./.nuxt/uno.config.mjs')
  .then(mod => mod.default)
  .catch(() => undefined)

export default mergeConfigs([
  ...(uiUnoConfig ? [uiUnoConfig] : []),
  defineConfig({}),
])
