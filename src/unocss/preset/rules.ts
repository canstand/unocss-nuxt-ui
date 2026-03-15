import type { Rule, RuleContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-wind4'
import type { resolveTheme } from './theme'
import { notLastChildSelectorVariant } from '@unocss/preset-wind4/rules'
import { colorCSSGenerator, defineProperty } from '@unocss/preset-wind4/utils'

export function getRules(theme: ReturnType<typeof resolveTheme>, colorSpace: string): Rule<Theme>[] {
  return [
    // text-dimmed, text-dimmed/50, ...
    [
      /^text-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity]) => {
        if (!(theme.textColors && color in theme.textColors)) {
          return
        }

        const colorKey = color as keyof typeof theme.textColors
        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-text-opacity, 100%)'

        return [
          defineProperty('--un-text-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            color: `color-mix(in ${colorSpace}, ${theme.textColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `text-(${Object.keys(theme.textColors).join('|')})` },
    ],
    // bg-default, bg-default/50, ...
    [
      /^bg-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity]) => {
        if (!(theme.backgroundColors && Object.keys(theme.backgroundColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.backgroundColors
        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-bg-opacity, 100%)'

        return [
          defineProperty('--un-bg-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            'background-color': `color-mix(in ${colorSpace}, ${theme.backgroundColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `bg-(${Object.keys(theme.backgroundColors).join('|')})` },
    ],
    // from-default, from-default/50, to-default, to-default/50, ...
    [
      /^(from|to)-([a-z-]+)(?:\/(\d{1,3}))?$/,
      ([, position, color, opacity]) => {
        if (!(theme.backgroundColors && Object.keys(theme.backgroundColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.backgroundColors
        const outputOpacity = opacity ? `${opacity}%` : `var(--un-${position}-opacity, 100%)`

        return [
          defineProperty(`--un-${position}-opacity`, { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            [`--un-gradient-${position}`]: `color-mix(in ${colorSpace}, ${theme.backgroundColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: [
        `from-(${Object.keys(theme.backgroundColors).join('|')})`,
        `to-(${Object.keys(theme.backgroundColors).join('|')})`,
      ] },
    ],
    // border-muted, border-muted/50, b-muted, b-muted/50, b-t-muted, b-t-muted/50, b-r-muted, b-r-muted, b-b-muted, b-b-muted/50, b-l-muted, b-t-muted/50 ...
    [
      /^(?:b|border|(?:b|border)-([trbl]))-(\w+)(?:\/(\d+))?$/,
      ([, direction, color, opacity]) => {
        if (!(theme.borderColors && Object.keys(theme.borderColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.borderColors
        const outputDirection = direction ? direction.replace('t', 'top').replace('r', 'right').replace('b', 'bottom').replace('l', 'left') : ''
        const outputOpacity = typeof opacity === 'string'
          ? `${opacity}%`
          : `var(--un-border${outputDirection ? `-${outputDirection}` : ''}-opacity, 100%)`

        return [
          defineProperty(`--un-border${outputDirection ? `-${outputDirection}` : ''}-opacity`, { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            [`border${outputDirection ? `-${outputDirection}` : ''}-color`]: `color-mix(in ${colorSpace}, ${theme.borderColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: [
        `border-(${Object.keys(theme.borderColors).join('|')})`,
        `b-(${Object.keys(theme.borderColors).join('|')})`,
        `b-t-(${Object.keys(theme.borderColors).join('|')})`,
        `b-r-(${Object.keys(theme.borderColors).join('|')})`,
        `b-b-(${Object.keys(theme.borderColors).join('|')})`,
        `b-l-(${Object.keys(theme.borderColors).join('|')})`,
      ] },
    ],
    // ring-default, ring-default/50, ...
    [
      /^ring-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity]) => {
        if (!(theme.ringColors && Object.keys(theme.ringColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.ringColors
        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-ring-opacity, 100%)'

        return [
          defineProperty('--un-ring-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            '--un-ring-color': `color-mix(in ${colorSpace}, ${theme.ringColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `ring-(${Object.keys(theme.ringColors).join('|')})` },
    ],
    // ring-offset-default, ring-offset-default/50, ...
    [
      /^ring-offset-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity]) => {
        if (!(theme.ringOffsetColors && Object.keys(theme.ringOffsetColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.ringOffsetColors
        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-ring-offset-opacity, 100%)'

        return [
          defineProperty('--un-ring-offset-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            '--un-ring-offset-color': `color-mix(in ${colorSpace}, ${theme.ringOffsetColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `ring-offset-(${Object.keys(theme.ringOffsetColors).join('|')})` },
    ],
    // divide-default, divide-default/50, ...
    [
      /^divide-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity], configs) => {
        if (!(theme.divideColors && Object.keys(theme.divideColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.divideColors
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
            'border-color': `color-mix(in ${colorSpace}, ${theme.divideColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `divide-(${Object.keys(theme.divideColors).join('|')})` },
    ],
    // outline-default, outline-default/50, ...
    [
      /^outline-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity]) => {
        if (!(theme.outlineColors && Object.keys(theme.outlineColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.outlineColors
        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-outline-opacity, 100%)'

        return [
          defineProperty('--un-outline-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            'outline-color': `color-mix(in ${colorSpace}, ${theme.outlineColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `outline-(${Object.keys(theme.outlineColors).join('|')})` },
    ],
    // stroke-default, stroke-default/50, ...
    [
      /^stroke-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity]) => {
        if (!(theme.strokeColors && Object.keys(theme.strokeColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.strokeColors
        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-stroke-opacity, 100%)'

        return [
          defineProperty('--un-stroke-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            stroke: `color-mix(in ${colorSpace}, ${theme.strokeColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `stroke-(${Object.keys(theme.strokeColors).join('|')})` },
    ],
    // fill-default, fill-default/50, ...
    [
      /^fill-(\w+)(?:\/(\d+))?$/,
      ([, color, opacity]) => {
        if (!(theme.fillColors && Object.keys(theme.fillColors).includes(color))) {
          return
        }

        const colorKey = color as keyof typeof theme.fillColors
        const outputOpacity = opacity ? `${opacity}%` : 'var(--un-fill-opacity, 100%)'

        return [
          defineProperty('--un-fill-opacity', { syntax: '<percentage>', inherits: false, initialValue: '100%' }),
          {
            fill: `color-mix(in ${colorSpace}, ${theme.fillColors[colorKey]} ${outputOpacity}, transparent)`,
          },
        ]
      },
      { autocomplete: `fill-(${Object.keys(theme.fillColors).join('|')})` },
    ],
    // text-(--xxx), text-(--xxx)/yyy and bg-(--xxx), bg-(--xxx)/yyy
    [
      /^(text|bg|ring|caret|fill)-\((--[\w-]+)\)(?:\/(\d+))?$/,
      ([, prefix, color, opacity], configs) => {
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
      ([, prefix, value]) => {
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
      ([, props]) => {
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
