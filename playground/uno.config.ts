import { defineConfig, mergeConfigs } from 'unocss'
import uiUnoConfig from './.nuxt/uno.config.mjs'

export default mergeConfigs([
  uiUnoConfig,
  defineConfig({}),
])
