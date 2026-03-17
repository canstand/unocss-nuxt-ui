import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'

describe('unocss native space-x support', () => {
  it('should generate space-x-px with presetWind4', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
    })
    const { css } = await uno.generate('space-x-px', { preflights: false })
    // If native supports it, it should contain margin-inline-start or margin-left
    expect(css).toContain('margin-inline-start')
    expect(css).toContain('1px')
  })

  it('should generate space-x-4 with presetWind4', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
    })
    const { css } = await uno.generate('space-x-4', { preflights: false })
    expect(css).toContain('margin-inline-start')
    expect(css).toContain('var(--spacing)')
  })
})
