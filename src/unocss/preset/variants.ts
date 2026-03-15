import type { Variant } from '@unocss/core'

export function getVariants(): Variant[] {
  return [
    // data-xxx:...  -> ....[data-xxx] { ... }
    (matcher) => {
      const match = matcher.match(/^data-([a-zA-Z0-9-]+):(.*)$/)

      if (!match) {
        return matcher
      }

      const attr = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        selector: s => `${s}[data-${attr}]`,
      }
    },
    // not-data-xxx:...  -> ....:not([data-xxx]) { ... }
    (matcher) => {
      const match = matcher.match(/^not-data-([a-zA-Z0-9-]+):(.*)$/)

      if (!match) {
        return matcher
      }

      const attr = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        selector: s => `${s}:not([data-${attr}])`,
      }
    },
    // variant: group-data-xxx:...  -> .group-data-xxx\:... { &:is(:where(.group)[data-xxx] *) { ... } }
    (matcher) => {
      const match = matcher.match(/^group-data-([a-zA-Z0-9-]+):(.*)$/)

      if (!match) {
        return matcher
      }

      const attr = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        handle(input, next) {
          return next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
            selector: `&:is(:where(.group)[data-${attr}] *)`,
          })
        },
      }
    },
    // not-group-data-xxx:...  -> .not-group-data-xxx\:... { &:not(*:is(:where(.group)[data-xxx] *)) { ... } }
    (matcher) => {
      const match = matcher.match(/^not-group-data-([a-zA-Z0-9-]+):(.*)$/)

      if (!match) {
        return matcher
      }

      const attr = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        handle(input, next) {
          return next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
            selector: `&:not(*:is(:where(.group)[data-${attr}] *))`,
          })
        },
      }
    },
    // group-[first|last|only]:...  -> .group-[first|last|only]\:... { &:is(:where(.group):[first|last|only]-child *) { { ... } }
    (matcher) => {
      const match = matcher.match(/^group-(first|last|only):(.*)$/)

      if (!match) {
        return matcher
      }

      const pseudo = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        handle(input, next) {
          return next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
            selector: `&:is(:where(.group):${pseudo}-child *)`,
          })
        },
      }
    },
    // group-not-[first|last|only]:...  -> .group-not-[first|last|only]\:... { &:is(:where(.group):not(*:[first|last|only]-child) *) { ... } }
    (matcher) => {
      const match = matcher.match(/^group-not-(first|last|only):(.*)$/)

      if (!match) {
        return matcher
      }

      const pseudo = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        handle(input, next) {
          return next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
            selector: `&:is(:where(.group):not(*:${pseudo}-child) *)`,
          })
        },
      }
    },
    // not-only:... -> ... { &:not(*:only-child) { ... } }
    (matcher) => {
      const match = matcher.match(/^not-only:(.*)$/)

      if (!match) {
        return matcher
      }

      const rest = match[1]

      return {
        matcher: rest,
        handle(input, next) {
          return next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
            selector: `&:not(*:only-child)`,
          })
        },
      }
    },
    // peer-data-xxx:...  -> .peer-data-xxx\:... { &:is(:where(.peer)[data-xxx] ~ *) { ... } }
    (matcher) => {
      const match = matcher.match(/^peer-data-([a-zA-Z0-9-]+):(.*)$/)

      if (!match) {
        return matcher
      }

      const attr = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        handle(input, next) {
          return next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
            selector: `&:is(:where(.peer)[data-${attr}] ~ *)`,
          })
        },
      }
    },
    // not-peer-data-xxx:...  -> .not-peer-data-active\:text-amber-50 { &:is(:where(.peer):not(*[data-active]) ~ *) { ... } }
    (matcher) => {
      const match = matcher.match(/^not-peer-data-([a-zA-Z0-9-]+):(.*)$/)

      if (!match) {
        return matcher
      }

      const attr = match[1]
      const rest = match[2]

      return {
        matcher: rest,
        handle(input, next) {
          return next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
            selector: `&:is(:where(.peer):not(*[data-${attr}]) ~ *)`,
          })
        },
      }
    },
  ]
}
