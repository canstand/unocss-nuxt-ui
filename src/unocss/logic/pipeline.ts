import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type FilterPattern = RegExp | string | ((id: string) => boolean)

interface ParsedUiSources {
  allowAll: boolean
  directories: string[]
  files: string[]
}

export interface NuxtUiPipelineContext {
  buildDir?: string
  componentDetection?: boolean
  includeAppConfigSource?: boolean
  uiCssContent?: string
}

export const defaultPipelineInclude = [/\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/]

export const fallbackNuxtUiBuildInclude = /[\\/]\.nuxt[\\/](?:ui[\\/].+\.ts|app\.config\.(?:[cm]?js|[cm]?ts))($|\?)/

export const appConfigSourceInclude = /[\\/]app\.config\.(?:[cm]?ts|[cm]?js)($|\?)/

const virtualNuxtUiTemplatesInclude = /virtual:nuxt-ui-templates\/.+\.ts($|\?)/
const nuxtBuildUiAliasInclude = /#build\/ui\/.+($|\?)/
const nuxtBuildAppConfigAliasInclude = /#build\/app\.config($|\?)/
const sourcePattern = /@source\s+"\.\/ui(?:\/([^"]+))?";/g

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toRegexPath(value: string) {
  return escapeRegex(value.replace(/\\/g, '/')).replaceAll('/', '[\\\\/]')
}

function parseUiSources(css: string): ParsedUiSources {
  const files: string[] = []
  const directories: string[] = []
  let allowAll = false
  let hasSource = false

  sourcePattern.lastIndex = 0
  while (true) {
    const match = sourcePattern.exec(css)
    if (!match) {
      break
    }

    hasSource = true
    const rawEntry = match[1]
    if (!rawEntry) {
      allowAll = true
      continue
    }

    const entry = rawEntry.replace(/\\/g, '/').replace(/^\.\//, '')
    if (!entry) {
      allowAll = true
      continue
    }

    if (entry.endsWith('.ts')) {
      files.push(entry)
      continue
    }

    directories.push(entry.endsWith('/') ? entry : `${entry}/`)
  }

  if (!hasSource) {
    allowAll = true
  }

  return { allowAll, directories, files }
}

function getUiSourceSelection(
  buildDir: string,
  componentDetection = false,
  uiCssContent?: string,
): ParsedUiSources {
  if (!componentDetection) {
    return { allowAll: true, directories: [], files: [] }
  }

  if (typeof uiCssContent === 'string') {
    return parseUiSources(uiCssContent)
  }

  try {
    const css = readFileSync(resolve(buildDir, 'ui.css'), 'utf8')
    return parseUiSources(css)
  }
  catch {
    return { allowAll: true, directories: [], files: [] }
  }
}

function createNuxtBuildIncludeRegexes(
  buildDir: string,
  componentDetection = false,
  uiCssContent?: string,
) {
  const normalizedBuildDir = resolve(buildDir).replace(/\\/g, '/').replace(/\/+$/, '')
  const buildDirPattern = toRegexPath(normalizedBuildDir)
  const selection = getUiSourceSelection(buildDir, componentDetection, uiCssContent)
  const include: RegExp[] = []

  include.push(new RegExp(`${buildDirPattern}[\\\\/]app\\.config\\.(?:[cm]?js|[cm]?ts)($|\\?)`))

  if (selection.allowAll) {
    include.push(new RegExp(`${buildDirPattern}[\\\\/]ui[\\\\/].+\\.ts($|\\?)`))
    return include
  }

  for (const directory of selection.directories) {
    const directoryPattern = toRegexPath(`ui/${directory}`)
    include.push(new RegExp(`${buildDirPattern}[\\\\/]${directoryPattern}.+\\.ts($|\\?)`))
  }

  for (const file of selection.files) {
    const filePattern = toRegexPath(`ui/${file}`)
    include.push(new RegExp(`${buildDirPattern}[\\\\/]${filePattern}($|\\?)`))
  }

  return include
}

export function getSharedNuxtUiPipelineInclude(context: Pick<NuxtUiPipelineContext, 'includeAppConfigSource'> = {}): FilterPattern[] {
  const include: FilterPattern[] = [
    virtualNuxtUiTemplatesInclude,
    nuxtBuildUiAliasInclude,
    nuxtBuildAppConfigAliasInclude,
  ]

  if (context.includeAppConfigSource) {
    include.push(appConfigSourceInclude)
  }

  return include
}

export function getRequiredNuxtUiPipelineInclude(context: NuxtUiPipelineContext = {}): FilterPattern[] {
  const buildIncludes = context.buildDir
    ? createNuxtBuildIncludeRegexes(
        context.buildDir,
        Boolean(context.componentDetection),
        context.uiCssContent,
      )
    : [fallbackNuxtUiBuildInclude]

  return [
    ...buildIncludes,
    ...getSharedNuxtUiPipelineInclude(context),
  ]
}

export function getNuxtUiBuildIncludeRuntimeTemplateSource(buildDir: string) {
  const normalizedBuildDir = resolve(buildDir).replace(/\\/g, '/').replace(/\/+$/, '')
  const uiCssPath = resolve(buildDir, 'ui.css')

  return [
    `const __nuxtUiBuildIncludes = (() => {`,
    `  const buildDir = ${JSON.stringify(normalizedBuildDir)};`,
    `  const uiCssPath = ${JSON.stringify(uiCssPath)};`,
    `  const sourcePattern = /@source\\s+"\\.\\/ui(?:\\/([^"]+))?";/g;`,
    ``,
    `  const escapeRegex = value => value.replace(/[.*+?^$(){}|[\\]\\\\]/g, '\\\\$&');`,
    `  const toRegexPath = value => escapeRegex(value.replace(/\\\\/g, '/')).replaceAll('/', '[\\\\\\\\/]');`,
    `  const buildDirPattern = toRegexPath(buildDir);`,
    ``,
    `  const includes = [`,
    `    new RegExp(\`\${buildDirPattern}[\\\\\\\\/]app\\\\.config\\\\.(?:[cm]?js|[cm]?ts)($|\\\\?)\`),`,
    `  ];`,
    ``,
    `  try {`,
    `    const css = readFileSync(uiCssPath, 'utf8');`,
    `    let allowAll = false;`,
    `    let hasSource = false;`,
    `    const directories = [];`,
    `    const files = [];`,
    ``,
    `    sourcePattern.lastIndex = 0;`,
    `    while (true) {`,
    `      const match = sourcePattern.exec(css);`,
    `      if (!match) {`,
    `        break;`,
    `      }`,
    ``,
    `      hasSource = true;`,
    `      const rawEntry = match[1];`,
    `      if (!rawEntry) {`,
    `        allowAll = true;`,
    `        continue;`,
    `      }`,
    ``,
    `      const entry = rawEntry.replace(/\\\\/g, '/').replace(/^\\.\\//, '');`,
    `      if (!entry) {`,
    `        allowAll = true;`,
    `        continue;`,
    `      }`,
    ``,
    `      if (entry.endsWith('.ts')) {`,
    `        files.push(entry);`,
    `      }`,
    `      else {`,
    `        directories.push(entry.endsWith('/') ? entry : \`\${entry}/\`);`,
    `      }`,
    `    }`,
    ``,
    `    if (!hasSource || allowAll) {`,
    `      includes.push(new RegExp(\`\${buildDirPattern}[\\\\\\\\/]ui[\\\\\\\\/].+\\\\.ts($|\\\\?)\`));`,
    `    }`,
    `    else {`,
    `      for (const directory of directories) {`,
    `        const directoryPattern = toRegexPath(\`ui/\${directory}\`);`,
    `        includes.push(new RegExp(\`\${buildDirPattern}[\\\\\\\\/]\${directoryPattern}.+\\\\.ts($|\\\\?)\`));`,
    `      }`,
    ``,
    `      for (const file of files) {`,
    `        const filePattern = toRegexPath(\`ui/\${file}\`);`,
    `        includes.push(new RegExp(\`\${buildDirPattern}[\\\\\\\\/]\${filePattern}($|\\\\?)\`));`,
    `      }`,
    `    }`,
    `  }`,
    `  catch {`,
    `    includes.push(new RegExp(\`\${buildDirPattern}[\\\\\\\\/]ui[\\\\\\\\/].+\\\\.ts($|\\\\?)\`));`,
    `  }`,
    ``,
    `  return includes;`,
    `})()`,
  ].join('\n')
}
