import unocssNuxtUI from '../../../src/module'

export default defineNuxtConfig({
  extends: ['./layers/theme-base'],
  modules: [
    '@nuxt/ui',
    unocssNuxtUI,
  ],
  ui: {
    experimental: {
      componentDetection: true,
    },
  },
  unocss: {
    configFile: false, // test required, prevent load uno.config.ts in repo root
  },
})
