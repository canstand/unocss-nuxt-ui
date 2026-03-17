# unocss-nuxt-ui

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Use UnoCSS in place of the Tailwind CSS dependency expected by `@nuxt/ui`.

This module is built for compatibility first. It does not only swap presets. It also handles Nuxt UI runtime CSS, keyframes, generated theme files, and `app.config.ts`-driven theme overrides so that `@nuxt/ui` keeps behaving as expected.

This project is inspired by [lehuuphuc/unocss-preset-nuxt-ui](https://github.com/lehuuphuc/unocss-preset-nuxt-ui) and brought together through vibe coding.

- [✨ Release Notes](./CHANGELOG.md)

## What It Does

- Registers `@unocss/nuxt` with `wind3: false`, `wind4: false`, and `nuxtLayers: false` defaults
- Ensures the UnoCSS config includes:
  - `presetNuxtUI()`
  - `presetWind4(...)`
  - `transformerDirectives()`
  - `transformerVariantGroup({ separators: [':'] })`
- Removes the Tailwind Vite plugin that `@nuxt/ui` would otherwise inject
- Rewrites Tailwind-style `bg-(--ui-bg-accented)/50` syntax into UnoCSS-compatible `bg-[var(--ui-bg-accented)]/50` utilities
- Injects the compatibility CSS and `@nuxt/ui` runtime keyframes needed by the UI package
- Injects runtime color variables derived from `app.config.ts`
- Automatically scans generated `.nuxt/ui/*.ts` theme files and `app.config.*` files across all Nuxt layers via optimized regex patterns

## Requirements

- `nuxt >= 4.0.0`
- `@nuxt/ui >= 4.0.0`
- `unocss >= 0.66.0`
- `@unocss/nuxt >= 0.66.0`

## Install

```bash
npx nuxt module add unocss-nuxt-ui
```

Or install manually:

```bash
pnpm add unocss-nuxt-ui unocss @unocss/nuxt
```

Then enable the module:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['unocss-nuxt-ui'],
})
```

`@nuxt/ui` and `@unocss/nuxt` are declared as module dependencies, so you do not need to list them manually unless you want to be explicit.

Change `assets/styles/main.css` from

```css
@import 'tailwindcss';
@import '@nuxt/ui';

@theme static {
  --font-sans: 'Public Sans', sans-serif;
}
```

to

```css
:root {
  --font-sans: 'Public Sans', sans-serif;
}
```

## Nuxt UI Component Detection

You can enable Nuxt UI component detection to reduce the generated CSS size:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['unocss-nuxt-ui'],
  ui: {
    experimental: {
      componentDetection: true,
    },
  },
})
```

The module automatically handles the scanning of the relevant generated files in both development and production. You do not need to add custom scan globs in `uno.config.ts` for Nuxt UI theme files.

## Working With `uno.config.ts`

If your app already has a `uno.config.ts`, keep it. Import the generated module config from `./.nuxt/uno.config.mjs` and merge your local config on top of it.

This is the recommended setup for the UnoCSS VS Code extension as well, because the extension can load your project-level `uno.config.ts` directly and still see the generated Nuxt UI config.

Example:

```ts
// uno.config.ts
import { defineConfig, mergeConfigs } from 'unocss'
import uiUnoConfig from './.nuxt/uno.config.mjs'

export default mergeConfigs([
  uiUnoConfig,
  defineConfig({
    shortcuts: {
      'btn-soft': 'px-3 py-2 rounded-md',
    },
  }),
])
```

## `app.config.ts` Support

Nuxt UI stores a large part of its theme outside Vue SFCs, and user overrides are merged through `app.config.ts`. This module automatically scans:

- Generated `.nuxt/ui/*.ts` theme files
- Generated `.nuxt/app.config.*` virtual files
- Source `app.config.*` files from all Nuxt layers

This allows utilities referenced in theme overrides to be correctly processed by UnoCSS:

```ts
// app.config.ts
export default defineAppConfig({
  ui: {
    button: {
      slots: {
        base: 'tracking-[0.3em]',
      },
    },
  },
})
```

## Compatibility Notes

- [#5151](https://github.com/unocss/unocss/issues/5151) : `calc(var(--some)+--space(16))` do not work.
- The module currently exposes no module options. Compatibility behavior is enabled by default.

## Exported Presets

The package also exports the core preset for non-module usage:

```ts
import { defineConfig, presetWind4 } from 'unocss'
import { presetNuxtUI } from 'unocss-nuxt-ui/preset'

export default defineConfig({
  presets: [
    presetNuxtUI(),
    presetWind4(),
  ],
})
```

## Local Development

```bash
pnpm install
pnpm run dev:prepare
pnpm run dev
pnpm run dev:build
pnpm run test
pnpm run test:types
pnpm run lint
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/unocss-nuxt-ui/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/unocss-nuxt-ui
[npm-downloads-src]: https://img.shields.io/npm/dm/unocss-nuxt-ui.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/unocss-nuxt-ui
[license-src]: https://img.shields.io/npm/l/unocss-nuxt-ui.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/unocss-nuxt-ui
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
