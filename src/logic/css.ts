function hasCssEntry(entries: string[], source: string) {
  return entries.includes(source)
}

export function prependCssEntry(entries: string[], source: string) {
  if (hasCssEntry(entries, source)) {
    return entries
  }

  return [source, ...entries]
}

/*
* body {
*   @apply antialiased text-default bg-default scheme-light dark:scheme-dark;
* }
*/
export function buildCompatibilityCss() {
  return `body {
  color: var(--ui-text);
  background-color: var(--ui-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`
}
