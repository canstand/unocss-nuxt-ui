import process from 'node:process'

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/content', 'unocss-nuxt-ui'],
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },
  css: ['~/assets/styles/main.css'],
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },
  compatibilityDate: 'latest',
  icon: {
    clientBundle: {
      icons: [
        'lucide:sun',
        'lucide:moon',
      ],
      scan: true,
    },
    serverBundle: false,
  },
})
