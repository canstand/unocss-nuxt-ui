import type { Rule, RuleContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-wind4'
import type { resolveTheme } from './theme'
import { notLastChildSelectorVariant } from '@unocss/preset-wind4/rules'
import { colorCSSGenerator, defineProperty } from '@unocss/preset-wind4/utils'

type ThemeStringMap = Record<string, string>
type ThemeScaleMap = Record<string, string> & { DEFAULT?: string }
type ThemeColorMap = Record<string, string | ThemeScaleMap>

function getThemeScaleColor(colors: ThemeColorMap, color: string) {
  const value = colors[color]
  if (typeof value === 'string') {
    return value
  }

  return value?.DEFAULT
}

export function getRules(theme: ReturnType<typeof resolveTheme>, colorSpace: string): Rule<Theme>[] {
  const textColors = (theme.textColors ?? {}) as ThemeStringMap
  const backgroundColors = (theme.backgroundColors ?? {}) as ThemeStringMap
  const borderColors = (theme.borderColors ?? {}) as ThemeStringMap
  const ringColors = (theme.ringColors ?? {}) as ThemeStringMap
  const ringOffsetColors = (theme.ringOffsetColors ?? {}) as ThemeStringMap
  const divideColors = (theme.divideColors ?? {}) as ThemeStringMap
  const outlineColors = (theme.outlineColors ?? {}) as ThemeStringMap
  const strokeColors = (theme.strokeColors ?? {}) as ThemeStringMap
  const fillColors = (theme.fillColors ?? {}) as ThemeStringMap
  const colors = (theme.colors ?? {}) as ThemeColorMap
  const autocompleteColors: Record<string, unknown> = { ...backgroundColors, ...colors }

  return [
    // text-dimmed, text-dimmed/50, ...
    [
      /^text-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity]) => {
        if (!(color in textColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-text-opacity, 100%)'

        return [
          defineProperty('--un-text-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            color: `color-mix(in ${colorSpace}, ${textColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `text-(${Object.keys(textColors).join('|')})` },
    ],
    // bg-default, bg-default/50, ...
    [
      /^bg-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity]) => {
        if (!(color in backgroundColors || color in colors)) {
          return
        }

        const colorValue = backgroundColors[color] || getThemeScaleColor(colors, color)
        if (!colorValue) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-bg-opacity, 100%)'

        return [
          defineProperty('--un-bg-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            'background-color': `color-mix(in ${colorSpace}, ${colorValue} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `bg-(${Object.keys(autocompleteColors).join('|')})` },
    ],
    // from-default, from-default/50, to-default, to-default/50, ...
    [
      /^(from|to)-([a-z-]+)(?:\/(\d{1,3}))?$/,
      ([, position = '', color = '', opacity]) => {
        if (!(position === 'from' || position === 'to') || !(color in backgroundColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : `var(--un-${position}-opacity, 100%)`

        return [
          defineProperty(`--un-${position}-opacity`, { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            [`--un-gradient-${position}`]: `color-mix(in ${colorSpace}, ${backgroundColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: [
        `from-(${Object.keys(backgroundColors).join('|')})`,
        `to-(${Object.keys(backgroundColors).join('|')})`,
      ] },
    ],
    // border-muted, border-muted/50, b-muted, b-muted/50, b-t-muted, b-t-muted/50, b-r-muted, b-r-muted, b-b-muted, b-b-muted/50, b-l-muted, b-t-muted/50 ...
    [
      /^(?:b|border|(?:b|border)-([trbl]))-(\w+)(?:\/(\d+))?$/,
      ([, direction = '', color = '', opacity]) => {
        if (!(color in borderColors)) {
          return
        }

        const outputDirection = direction ? direction.replace('t', 'top').replace('r', 'right').replace('b', 'bottom').replace('l', 'left') : ''
        const outputOpacity = typeof opacity === 'string'
          ? `${opacity}%`
          : `var(--un-border${outputDirection ? `-${outputDirection}` : ''}-opacity, 100%)`

        return [
          defineProperty(`--un-border${outputDirection ? `-${outputDirection}` : ''}-opacity`, { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            [`border${outputDirection ? `-${outputDirection}` : ''}-color`]: `color-mix(in ${colorSpace}, ${borderColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: [
        `border-(${Object.keys(borderColors).join('|')})`,
        `b-(${Object.keys(borderColors).join('|')})`,
        `b-t-(${Object.keys(borderColors).join('|')})`,
        `b-r-(${Object.keys(borderColors).join('|')})`,
        `b-b-(${Object.keys(borderColors).join('|')})`,
        `b-l-(${Object.keys(borderColors).join('|')})`,
      ] },
    ],
    // ring-default, ring-default/50, ...
    [
      /^ring-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity]) => {
        if (!(color in ringColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-ring-opacity, 100%)'

        return [
          defineProperty('--un-ring-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            '--un-ring-color': `color-mix(in ${colorSpace}, ${ringColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `ring-(${Object.keys(ringColors).join('|')})` },
    ],
    // ring-offset-default, ring-offset-default/50, ...
    [
      /^ring-offset-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity]) => {
        if (!(color in ringOffsetColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-ring-offset-opacity, 100%)'

        return [
          defineProperty('--un-ring-offset-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            '--un-ring-offset-color': `color-mix(in ${colorSpace}, ${ringOffsetColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `ring-offset-(${Object.keys(ringOffsetColors).join('|')})` },
    ],
    // divide-default, divide-default/50, ...
    [
      /^divide-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity], configs) => {
        if (!(color in divideColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-divide-opacity, 100%)'

        return [
          defineProperty('--un-divide-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            [configs.symbols.variants]: [{
              handle: (input, next) => next({
                ...input,
                parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
                selector: ':where(&>:not(:last-child))',
              }),
            }],
            'border-color': `color-mix(in ${colorSpace}, ${divideColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `divide-(${Object.keys(divideColors).join('|')})` },
    ],
    // outline-default, outline-default/50, ...
    [
      /^outline-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity]) => {
        if (!(color in outlineColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-outline-opacity, 100%)'

        return [
          defineProperty('--un-outline-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            'outline-color': `color-mix(in ${colorSpace}, ${outlineColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `outline-(${Object.keys(outlineColors).join('|')})` },
    ],
    // stroke-default, stroke-default/50, ...
    [
      /^stroke-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity]) => {
        if (!(color in strokeColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-stroke-opacity, 100%)'

        return [
          defineProperty('--un-stroke-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            stroke: `color-mix(in ${colorSpace}, ${strokeColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `stroke-(${Object.keys(strokeColors).join('|')})` },
    ],
    // fill-default, fill-default/50, ...
    [
      /^fill-(\w+)(?:\/(\d+))?$/,
      ([, color = '', opacity]) => {
        if (!(color in fillColors)) {
          return
        }

        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-fill-opacity, 100%)'

        return [
          defineProperty('--un-fill-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            fill: `color-mix(in ${colorSpace}, ${fillColors[color]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `fill-(${Object.keys(fillColors).join('|')})` },
    ],
    // text-(--xxx), text-(--xxx)/yyy and bg-(--xxx), bg-(--xxx)/yyy
    [
      /^(text|bg|ring|caret|fill)-\((--[\w-]+)\)(?:\/(\d+))?$/,
      ([, prefix = '', color = '', opacity], configs) => {
        if (!prefix || !color) {
          return
        }

        const alpha = typeof opacity === 'string' ? `${opacity}%` : opacity
        const cssProperty = prefix === 'text'
          ? 'color'
          : prefix === 'bg'
            ? 'background-color'
            : prefix === 'ring'
              ? '--un-ring-color'
              : prefix === 'caret'
                ? 'caret-color'
                : prefix

        return colorCSSGenerator(
          {
            name: color,
            color: `var(${color})`,
            alpha,
            keys: undefined,
            opacity: undefined,
            modifier: undefined,
            no: undefined,
            cssColor: undefined,
          },
          cssProperty,
          prefix,
          configs as any as RuleContext<Theme>,
        )
      },
    ],
    // transform-(--xxx), translate-x-(--xxx), translate-y-(--xxx), top-(--xxx), left-(--xxx), w-(--xxx), h-(--xxx), min-w-(--xxx), min-h-(--xxx), max-w-(--xxx), max-h-(--xxx), z-(--xxx), origin-(--xxx), gap-(--xxx), scroll-mt-(--xxx)
    [
      /^(translate-x|translate-y|transform|top|left|right|bottom|[whz]|min-w|min-h|max-w|max-h|origin|gap|scroll-mt)-\((--[\w-]+)\)$/,
      ([, prefix = '', value = '']) => {
        if (!prefix || !value) {
          return
        }

        let property: string
        if (prefix === 'translate-x') {
          return {
            '--un-translate-x': `var(${value})`,
            'translate': `var(--un-translate-x) var(--un-translate-y)`,
          }
        }
        else if (prefix === 'translate-y') {
          return {
            '--un-translate-y': `var(${value})`,
            'translate': `var(--un-translate-x) var(--un-translate-y)`,
          }
        }
        else if (prefix === 'w') {
          property = 'width'
        }
        else if (prefix === 'h') {
          property = 'height'
        }
        else if (prefix === 'z') {
          property = 'z-index'
        }
        else if (prefix === 'min-w') {
          property = 'min-width'
        }
        else if (prefix === 'min-h') {
          property = 'min-height'
        }
        else if (prefix === 'max-w') {
          property = 'max-width'
        }
        else if (prefix === 'max-h') {
          property = 'max-height'
        }
        else if (prefix === 'origin') {
          property = 'transform-origin'
        }
        else if (prefix === 'scroll-mt') {
          property = 'scroll-margin-top'
        }
        else {
          property = prefix
        }

        return {
          [property]: `var(${value})`,
        }
      },
      { autocomplete: [
        'translate-x-(--xxx)',
        'translate-y-(--xxx)',
        'transform-(--xxx)',
        'top-(--xxx)',
        'left-(--xxx)',
        'right-(--xxx)',
        'bottom-(--xxx)',
        'w-(--xxx)',
        'h-(--xxx)',
        'z-(--xxx)',
        'min-w-(--xxx)',
        'min-h-(--xxx)',
        'max-w-(--xxx)',
        'max-h-(--xxx)',
        'origin-(--xxx)',
        'gap-(--xxx)',
        'scroll-mt-(--xxx)',
      ] },
    ],
    // transition-[background], transition-[color,translate], ...
    [
      /^transition-\[([a-z-]+(?:,[a-z-]+)*)\]$/,
      ([, props = '']) => {
        if (!props) {
          return
        }

        return {
          'transition-property': props,
          'transition-timing-function': 'var(--un-ease, var(--default-transition-timingFunction))',
          'transition-duration': 'var(--un-duration, var(--default-transition-duration))',
        }
      },
      { autocomplete: 'transition-[prop1,prop2]' },
    ],
  ]
}

export function getExtraRules(): Rule<Theme>[] {
  return [
    // space-x-px, space-y-px (-space-x-px, -space-y-px)
    [
      /^space-([xy])-px$/,
      ([matcher, direction], configs) => {
        const inlineOrBlock = direction === 'x' ? 'inline' : 'block'
        return [
          defineProperty(`--un-space-${direction}-reverse`, { syntax: '*', inherits: false, initialValue: '0' }),
          {
            [configs.symbols.variants]: [notLastChildSelectorVariant(matcher)],
            [`--un-space-${direction}-reverse`]: '0',
            [`margin-${inlineOrBlock}-start`]: `calc(1px * var(--un-space-${direction}-reverse))`,
            [`margin-${inlineOrBlock}-end`]: `calc(1px * calc(1 - var(--un-space-${direction}-reverse)))`,
          },
        ]
      },
      { autocomplete: ['space-(x|y)-px', '-space-(x|y)-px'] },
    ],
    // space-x-<number>px, space-y-<number>px (-space-x-<number>px, -space-y-<number>px)
    [
      /^space-([xy])-(\d+)px$/,
      ([matcher, direction, size], configs) => {
        const inlineOrBlock = direction === 'x' ? 'inline' : 'block'
        return [
          defineProperty(`--un-space-${direction}-reverse`, { syntax: '*', inherits: false, initialValue: '0' }),
          {
            [configs.symbols.variants]: [notLastChildSelectorVariant(matcher)],
            [`--un-space-${direction}-reverse`]: '0',
            [`margin-${inlineOrBlock}-start`]: `calc(${size}px * var(--un-space-${direction}-reverse))`,
            [`margin-${inlineOrBlock}-end`]: `calc(${size}px * calc(1 - var(--un-space-${direction}-reverse)))`,
          },
        ]
      },
    ],
    // space-x-<number>, space-y-<number> (-space-x-<number>, -space-y-<number>)
    [
      /^space-([xy])-(\d+)$/,
      ([matcher, direction, size], configs) => {
        const inlineOrBlock = direction === 'x' ? 'inline' : 'block'
        return [
          defineProperty(`--un-space-${direction}-reverse`, { syntax: '*', inherits: false, initialValue: '0' }),
          {
            [configs.symbols.variants]: [notLastChildSelectorVariant(matcher)],
            [`--un-space-${direction}-reverse`]: '0',
            [`margin-${inlineOrBlock}-start`]: `calc(calc(var(--spacing) * ${size}) * var(--un-space-${direction}-reverse))`,
            [`margin-${inlineOrBlock}-end`]: `calc(calc(var(--spacing) * ${size}) * calc(1 - var(--un-space-${direction}-reverse)))`,
          },
        ]
      },
    ],
  ]
}
