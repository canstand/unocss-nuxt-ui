import { describe, expect, it } from 'vitest'
import { rewriteTailwindVarSyntaxInApply } from '../../src/vite/transform'

describe('rewriteTailwindVarSyntaxInApply', () => {
  it('should rewrite tailwind variable syntax in @apply', () => {
    const input = `
.btn {
  @apply bg-(--primary) text-(--white) hover:bg-(--secondary)/80;
}
`
    const output = rewriteTailwindVarSyntaxInApply(input)
    expect(output).toContain('bg-[var(--primary)]')
    expect(output).toContain('text-[var(--white)]')
    expect(output).toContain('hover:bg-[var(--secondary)]/80')
  })

  it('should handle multiple @apply in one code block', () => {
    const input = `
.btn {
  @apply bg-(--primary);
  @apply text-(--white);
}
`
    const output = rewriteTailwindVarSyntaxInApply(input)
    expect(output).toContain('bg-[var(--primary)]')
    expect(output).toContain('text-[var(--white)]')
  })

  it('should not rewrite if syntax doesn\'t match', () => {
    const input = `
.btn {
  @apply bg-blue-500;
}
`
    const output = rewriteTailwindVarSyntaxInApply(input)
    expect(output).toBe(input)
  })

  it('should handle ! prefix for important', () => {
    const input = `
.btn {
  @apply !bg-(--primary);
}
`
    const output = rewriteTailwindVarSyntaxInApply(input)
    expect(output).toContain('!bg-[var(--primary)]')
  })
})
