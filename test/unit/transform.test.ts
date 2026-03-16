import { describe, expect, it } from 'vitest'
import { normalizeTailwindVarSyntaxTokens } from '../../src/vite/transform'

describe('normalizeTailwindVarSyntaxTokens', () => {
  it('should rewrite tailwind variable syntax', () => {
    const input = `
.btn {
  @apply bg-(--primary) text-(--white) hover:bg-(--secondary)/80;
}
`
    const output = normalizeTailwindVarSyntaxTokens(input)
    expect(output).toContain('bg-[var(--primary)]')
    expect(output).toContain('text-[var(--white)]')
    expect(output).toContain('hover:bg-[var(--secondary)]/80')
  })

  it('should handle multiple occurrences in one code block', () => {
    const input = `
.btn {
  @apply bg-(--primary);
  @apply text-(--white);
}
`
    const output = normalizeTailwindVarSyntaxTokens(input)
    expect(output).toContain('bg-[var(--primary)]')
    expect(output).toContain('text-[var(--white)]')
  })

  it('should not rewrite if syntax doesn\'t match', () => {
    const input = `
.btn {
  @apply bg-blue-500;
}
`
    const output = normalizeTailwindVarSyntaxTokens(input)
    expect(output).toBe(input)
  })

  it('should handle ! prefix for important', () => {
    const input = `
.btn {
  @apply !bg-(--primary);
}
`
    const output = normalizeTailwindVarSyntaxTokens(input)
    expect(output).toContain('!bg-[var(--primary)]')
  })

  it('should handle variants and multiple tokens', () => {
    const input = '<div class="dark:bg-(--dark-bg) hover:text-(--hover-text)/50 !focus:ring-(--ring)"></div>'
    const output = normalizeTailwindVarSyntaxTokens(input)
    expect(output).toBe('<div class="dark:bg-[var(--dark-bg)] hover:text-[var(--hover-text)]/50 !focus:ring-[var(--ring)]"></div>')
  })
})
