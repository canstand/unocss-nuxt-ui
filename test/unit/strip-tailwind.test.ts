import { describe, expect, it } from 'vitest'
import { stripTailwindVitePlugins } from '../../src/vite/transform'

describe('stripTailwindVitePlugins', () => {
  it('should strip @tailwindcss/vite plugins', () => {
    const plugins = [
      { name: 'vite:css' },
      { name: '@tailwindcss/vite' },
      { name: 'other-plugin' },
    ]
    const result = stripTailwindVitePlugins(plugins) as any[]
    expect(result).toHaveLength(2)
    expect(result.some(p => p.name === '@tailwindcss/vite')).toBe(false)
  })

  it('should handle nested plugin arrays', () => {
    const plugins = [
      { name: 'plugin-1' },
      [
        { name: 'plugin-2' },
        { name: '@tailwindcss/vite' },
      ],
    ]
    const result = stripTailwindVitePlugins(plugins) as any[]
    expect(result).toHaveLength(2)
    expect(result[1]).toHaveLength(1)
    expect(result[1][0].name).toBe('plugin-2')
  })

  it('should handle nested empty plugin arrays after stripping', () => {
    const plugins = [
      { name: 'plugin-1' },
      [
        { name: '@tailwindcss/vite' },
      ],
    ]
    const result = stripTailwindVitePlugins(plugins) as any[]
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('plugin-1')
  })
})
