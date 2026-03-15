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
})
