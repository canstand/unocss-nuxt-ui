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

  it.each([
    ['data-active:text-md', '[data-active]'],
    ['not-data-active:text-md', ':not([data-active])'],
    ['group-data-active:text-md', '&:is(:where(.group)[data-active] *)'],
    ['not-group-data-active:text-md', '&:not(*:is(:where(.group)[data-active] *))'],
    ['group-first:text-md', '&:is(:where(.group):first-child *)'],
    ['group-last:text-md', '&:is(:where(.group):last-child *)'],
    ['group-only:text-md', '&:is(:where(.group):only-child *)'],
    ['group-not-first:text-md', '&:is(:where(.group):not(*:first-child) *)'],
    ['group-not-last:text-md', '&:is(:where(.group):not(*:last-child) *)'],
    ['group-not-only:text-md', '&:is(:where(.group):not(*:only-child) *)'],
    ['not-only:text-md', '&:not(*:only-child)'],
    ['peer-data-active:text-md', '&:is(:where(.peer)[data-active] ~ *)'],
    ['not-peer-data-active:text-md', '&:is(:where(.peer):not(*[data-active]) ~ *)'],
  ])('should generate %s variant', async (input, selector) => {
    const { css } = await uno.generate(input, { preflights: false })
    expect(css).toContain(selector)
    expect(css).toContain('font-size:var(--text-base-fontSize)')
  })

  it('should generate radius utilities', async () => {
    const { css } = await uno.generate('rounded-sm', { preflights: false })
    expect(css).toContain('border-radius:var(--radius-sm)')
  })
})
