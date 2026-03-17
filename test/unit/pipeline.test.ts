import { describe, expect, it } from 'vitest'
import { getRequiredNuxtUiPipelineInclude } from '../../src/unocss/logic/defaults'

describe('nuxt UI pipeline include selection', () => {
  it('returns required includes', () => {
    const include = getRequiredNuxtUiPipelineInclude().map(pattern => pattern.toString())

    expect(include.some(i => i.includes('[\\\\/]\\.nuxt[\\\\/](?:ui[\\\\/].+\\.ts|app\\.config\\.(?:m?js|m?ts))'))).toBe(true)
    expect(include.some(i => i.includes('%2F\\.nuxt%2F(?:ui%2F.+\\.ts|app\\.config\\.(?:m?js|m?ts))'))).toBe(true)
    expect(include).toContain('/[\\\\/]app\\.config\\.(?:m?js|m?ts)($|\\?)/')
  })
})
