import { mergeConfigs } from 'unocss'
import uiUnoConfig from './.nuxt/uno.config.mjs'

export default mergeConfigs([
  uiUnoConfig,
  {
    content: {
      pipeline: {
        include: [
          /\.ts$/,
        ],
      },
    },
  },
])
