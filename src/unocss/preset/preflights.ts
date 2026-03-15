import type { Preset } from '@unocss/core'

export function getPreflights(): Preset['preflights'] {
  return [
    {
      getCSS: () => {
        return `/* unocss-nuxt-ui preflight start */
:host, :root {
  --color-black: #000;
  --color-white: #fff;
  --ui-header-height: calc(var(--spacing, 0.25rem) * 16);
}

.light, :host, :root {
  --ui-text-dimmed: var(--ui-color-neutral-400);
  --ui-text-muted: var(--ui-color-neutral-500);
  --ui-text-toned: var(--ui-color-neutral-600);
  --ui-text: var(--ui-color-neutral-700);
  --ui-text-highlighted: var(--ui-color-neutral-900);
  --ui-text-inverted: var(--color-white);

  --ui-bg: var(--color-white);
  --ui-bg-muted: var(--ui-color-neutral-50);
  --ui-bg-elevated: var(--ui-color-neutral-100);
  --ui-bg-accented: var(--ui-color-neutral-200);
  --ui-bg-inverted: var(--ui-color-neutral-900);

  --ui-border: var(--ui-color-neutral-200);
  --ui-border-muted: var(--ui-color-neutral-200);
  --ui-border-accented: var(--ui-color-neutral-300);
  --ui-border-inverted: var(--ui-color-neutral-900);

  --ui-radius: 0.25rem;
  --ui-container: var(--container-7xl, 80rem);
}

.dark {
  --ui-text-dimmed: var(--ui-color-neutral-500);
  --ui-text-muted: var(--ui-color-neutral-400);
  --ui-text-toned: var(--ui-color-neutral-300);
  --ui-text: var(--ui-color-neutral-200);
  --ui-text-highlighted: var(--color-white);
  --ui-text-inverted: var(--ui-color-neutral-900);

  --ui-bg: var(--ui-color-neutral-900);
  --ui-bg-muted: var(--ui-color-neutral-800);
  --ui-bg-elevated: var(--ui-color-neutral-800);
  --ui-bg-accented: var(--ui-color-neutral-700);
  --ui-bg-inverted: var(--color-white);

  --ui-border: var(--ui-color-neutral-800);
  --ui-border-muted: var(--ui-color-neutral-700);
  --ui-border-accented: var(--ui-color-neutral-700);
  --ui-border-inverted: var(--color-white);
}
/* unocss-nuxt-ui preflight end */`
      },
    },
  ]
}
