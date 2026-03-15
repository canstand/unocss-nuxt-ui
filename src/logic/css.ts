function hasCssEntry(entries: string[], source: string) {
  return entries.includes(source)
}

export function prependCssEntry(entries: string[], source: string) {
  if (hasCssEntry(entries, source)) {
    return entries
  }

  return [source, ...entries]
}

export function buildCompatibilityCss() {
  return `@layer components, base, properties, theme, preflights, shortcuts, default;

body {
  color: var(--ui-text);
  background-color: var(--ui-bg);
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}

/* preflight nuxt-ui gap classes */
.\\[--gap\\:--spacing\\(4\\)\\] {
  --gap: calc(var(--spacing) * 4);
}
.\\[--gap\\:--spacing\\(16\\)\\] {
  --gap: calc(var(--spacing) * 16);
}
`
}
