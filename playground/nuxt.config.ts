export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'unocss-nuxt-ui'],
  devtools: { enabled: true },
  css: ['~/assets/styles/main.css'],
  compatibilityDate: 'latest',
  icon: {
    clientBundle: {
      icons: [
        'lucide:sun',
        'lucide:moon',
      ],
    },
  },
})
