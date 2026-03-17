import { createGenerator } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'
import { getVariants } from '../../src/unocss/preset/variants'

describe('spacing calc fix variant', () => {
  it('should fix --spacing in calc for width', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
      variants: getVariants(),
    })
    const { css } = await uno.generate('w-[calc(var(--sidebar-width-icon)+--spacing(8)+2px)]', { preflights: false })
    expect(css).toContain('width:calc(var(--sidebar-width-icon) + calc(var(--spacing) * 8) + 2px)')
  })

  it('should fix --spacing in calc for width 2', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
      variants: getVariants(),
    })
    const { css } = await uno.generate('w-[calc(var(--sidebar-width-icon)+--spacing(8))]', { preflights: false })
    expect(css).toContain('width:calc(var(--sidebar-width-icon) + calc(var(--spacing) * 8))')
  })

  it('should fix --spacing in calc for start', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
      variants: getVariants(),
    })
    const { css } = await uno.generate('start-[calc(--spacing(4)-1px)]', { preflights: false })
    expect(css).toContain('inset-inline-start:calc(calc(var(--spacing) * 4) - 1px)')
  })

  it('should fix --spacing in arbitrary value', async () => {
    const uno = await createGenerator({
      presets: [presetWind4()],
      variants: getVariants(),
    })
    const { css } = await uno.generate('w-[--spacing(8)]', { preflights: false })
    expect(css).toContain('width:calc(var(--spacing) * 8)')
  })
})
