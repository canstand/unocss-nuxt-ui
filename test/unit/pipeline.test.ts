import { cssIdRE } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import { applyNuxtUiUnoDefaults, getRequiredNuxtUiPipelineInclude } from '../../src/unocss/logic/defaults'
import { getNuxtUiUnoConfigTemplate } from '../../src/unocss/logic/template'

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

describe('pipeline exclude defaults', () => {
  it('restores the default exclude when the config has an empty list', () => {
    const config: Record<string, any> = {
      content: {
        pipeline: {
          include: [/\.vue$/],
          exclude: [],
        },
      },
    }

    applyNuxtUiUnoDefaults(config)

    expect(config.content.pipeline.exclude).toEqual([cssIdRE])
  })

  it('keeps user-provided excludes', () => {
    const exclude = [/\.custom$/]
    const config: Record<string, any> = {
      content: {
        pipeline: {
          include: [/\.vue$/],
          exclude,
        },
      },
    }

    applyNuxtUiUnoDefaults(config)

    expect(config.content.pipeline.exclude).toEqual(exclude)
  })

  it('adds the default exclude to the generated config template', () => {
    expect(getNuxtUiUnoConfigTemplate()).toContain('exclude: [cssIdRE]')
  })
})
