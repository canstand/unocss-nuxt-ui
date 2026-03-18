import { describe, expect, it } from 'vitest'
import { getRequiredNuxtUiPipelineInclude } from '../../src/unocss/logic/defaults'

describe('nuxt UI pipeline include selection', () => {
  it('returns required includes', () => {
    const include = getRequiredNuxtUiPipelineInclude()

    const paths = [
      'virtual:nuxt:/path/to/.nuxt/ui/button.ts',
      'virtual:nuxt:%2Fpath%2Fto%2F.nuxt%2Fui%2Fbutton.ts',
      'app.config.ts',
      '/path/to/.nuxt/app.config.ts',
    ]

    for (const path of paths) {
      expect(include.some((pattern) => {
        if (pattern instanceof RegExp) {
          return pattern.test(path)
        }
        return false
      }), `Pattern should match ${path}`).toBe(true)
    }
  })
})
