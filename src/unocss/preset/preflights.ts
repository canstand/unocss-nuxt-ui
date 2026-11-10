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

  --ui-chart-1: var(--ui-primary);
  --ui-chart-2: var(--color-blue-500, oklch(62.3% 0.214 259.815));
  --ui-chart-3: var(--color-violet-500, oklch(60.6% 0.25 292.717));
  --ui-chart-4: var(--color-amber-500, oklch(76.9% 0.188 70.08));
  --ui-chart-5: var(--color-rose-500, oklch(64.5% 0.246 16.439));
  --ui-chart-6: var(--color-cyan-500, oklch(71.5% 0.143 215.221));

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

  --ui-chart-1: var(--ui-primary);
  --ui-chart-2: var(--color-blue-400, oklch(70.7% 0.165 254.624));
  --ui-chart-3: var(--color-violet-400, oklch(70.2% 0.183 293.541));
  --ui-chart-4: var(--color-amber-400, oklch(82.8% 0.189 84.429));
  --ui-chart-5: var(--color-rose-400, oklch(71.2% 0.194 13.428));
  --ui-chart-6: var(--color-cyan-400, oklch(78.9% 0.154 211.53));
}
/* unocss-nuxt-ui preflight end */`
      },
    },
  ]
}
