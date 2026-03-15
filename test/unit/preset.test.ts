import * as core from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { beforeAll, describe, expect, it } from 'vitest'
import { presetNuxtUI } from '../../src/preset'

describe('presetNuxtUI', () => {
  let uno: core.UnoGenerator

  beforeAll(async () => {
    uno = await core.createGenerator({
      presets: [
        presetNuxtUI(),
        presetWind4(),
      ],
    })
  })

  it('should generate text-dimmed color', async () => {
    const { css } = await uno.generate('text-dimmed', { preflights: false })
    expect(css).toContain('color:color-mix(in oklab, var(--ui-text-dimmed) var(--un-text-opacity, 100%), transparent)')
  })

  it('should generate bg-default color', async () => {
    const { css } = await uno.generate('bg-default', { preflights: false })
    expect(css).toContain('background-color:color-mix(in oklab, var(--ui-bg) var(--un-bg-opacity, 100%), transparent)')
  })

  it('should generate text-(--primary) color', async () => {
    const { css } = await uno.generate('text-(--primary)', { preflights: false })
    expect(css).toContain('color:color-mix(in oklab, var(--primary) var(--un-text-opacity), transparent)')
  })

  it('should generate text-(--primary)/80 color', async () => {
    const { css } = await uno.generate('text-(--primary)/80', { preflights: false })
    expect(css).toContain('color:color-mix(in oklab, var(--primary) 80%, transparent)')
  })

  it('should generate group-data-active:text-md variant', async () => {
    const { css } = await uno.generate('group-data-active:text-md', { preflights: false })
    expect(css).toContain('&:is(:where(.group)[data-active] *)')
    expect(css).toContain('font-size:var(--text-base-fontSize)')
  })

  it('should generate peer-data-active:text-md variant', async () => {
    const { css } = await uno.generate('peer-data-active:text-md', { preflights: false })
    expect(css).toContain('&:is(:where(.peer)[data-active] ~ *)')
  })

  it('should generate radius utilities', async () => {
    const { css } = await uno.generate('rounded-sm', { preflights: false })
    expect(css).toContain('border-radius:var(--radius-sm)')
  })
})
