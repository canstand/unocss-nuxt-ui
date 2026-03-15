const styleLikeRequestPattern = /\.(?:vue|css|postcss|scss|sass|less|styl|stylus|md|mdc)(?:$|\?)/

export function isStyleLikeRequest(id: string) {
  return id.includes('?vue&type=style') || styleLikeRequestPattern.test(id)
}

export function rewriteTailwindVarSyntaxInApply(code: string) {
  return code.replace(/@apply\s+([^;{}]+);?/g, (full, rawContent: string) => {
    const raw = rawContent.trim()
    if (!raw.includes('-(--')) {
      return full
    }

    const rewritten = raw.split(/\s+/g).map((token) => {
      const lastVariantSeparator = token.lastIndexOf(':')
      const variant = lastVariantSeparator >= 0 ? token.slice(0, lastVariantSeparator + 1) : ''
      const utility = lastVariantSeparator >= 0 ? token.slice(lastVariantSeparator + 1) : token

      const match = utility.match(/^([!-]?[\w-]+)-\((--[\w-]+)\)(\/\d+)?$/)
      if (!match) {
        return token
      }

      const [, utilityName, cssVar, opacity = ''] = match
      return `${variant}${utilityName}-[var(${cssVar})]${opacity}`
    }).join(' ')

    return rewritten === raw ? full : full.replace(rawContent, rewritten)
  })
}

function isTailwindVitePlugin(item: unknown): item is { name: string } {
  return typeof item === 'object'
    && item !== null
    && 'name' in item
    && typeof item.name === 'string'
    && item.name.startsWith('@tailwindcss/vite')
}

export function stripTailwindVitePlugins<T>(plugins: T[] = []) {
  const next: T[] = []

  for (const item of plugins) {
    if (Array.isArray(item)) {
      const filtered = item.filter(entry => !isTailwindVitePlugin(entry))
      if (filtered.length > 0) {
        next.push(filtered as T)
      }
      continue
    }

    if (!isTailwindVitePlugin(item)) {
      next.push(item)
    }
  }

  return next
}
