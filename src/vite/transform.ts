const styleLikeRequestPattern = /\.(?:vue|css|postcss|scss|sass|less|styl|stylus|md|mdc)(?:$|\?)/

export function isStyleLikeRequest(id: string) {
  return id.includes('?vue&type=style') || styleLikeRequestPattern.test(id)
}

export function normalizeTailwindVarSyntaxTokens(code: string) {
  return code.replace(/(^|[\s"'`])((?:[!\w-]+:)*[!-]?[\w-]+)-\((--[\w-]+)\)(\/\d+)?(?=$|[\s"'`);},])/g, (
    full,
    prefix: string,
    utilityWithVariants: string,
    cssVar: string,
    opacity = '',
  ) => {
    return `${prefix}${utilityWithVariants}-[var(${cssVar})]${opacity}`
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
