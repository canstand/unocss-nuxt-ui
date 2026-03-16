import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type FilterPattern = RegExp | string | ((id: string) => boolean)

interface ParsedUiSources {
  allowAll: boolean
  directories: string[]
  files: string[]
}

export interface NuxtUiPipelineContext {
  appConfigFiles?: string[]
  buildDir?: string
  componentDetection?: boolean
  dev?: boolean
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

function toGlobPath(value: string) {
  return value.replace(/\\/g, '/')
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
  dev = false,
): ParsedUiSources {
  if (!componentDetection || dev) {
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
  dev = false,
) {
  const normalizedBuildDir = resolve(buildDir).replace(/\\/g, '/').replace(/\/+$/, '')
  const buildDirPattern = toRegexPath(normalizedBuildDir)
  const selection = getUiSourceSelection(buildDir, componentDetection, uiCssContent, dev)
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

function createNuxtBuildFilesystemEntries(
  buildDir: string,
  componentDetection = false,
  uiCssContent?: string,
  appConfigFiles: string[] = [],
  dev = false,
) {
  const normalizedBuildDir = resolve(buildDir)
  const selection = getUiSourceSelection(buildDir, componentDetection, uiCssContent, dev)
  const entries = [...new Set([
    toGlobPath(resolve(normalizedBuildDir, 'app.config.{js,mjs,cjs,ts,mts,cts}')),
    ...appConfigFiles.map(file => toGlobPath(resolve(file))),
  ])]

  if (selection.allowAll) {
    entries.push(toGlobPath(resolve(normalizedBuildDir, 'ui/**/*.ts')))
    return entries
  }

  for (const directory of selection.directories) {
    entries.push(toGlobPath(resolve(normalizedBuildDir, 'ui', directory, '**/*.ts')))
  }

  for (const file of selection.files) {
    entries.push(toGlobPath(resolve(normalizedBuildDir, 'ui', file)))
  }

  return entries
}

export function getSharedNuxtUiPipelineInclude(
  context: Pick<NuxtUiPipelineContext, 'appConfigFiles' | 'includeAppConfigSource'> = {},
): FilterPattern[] {
  const include: FilterPattern[] = [
    virtualNuxtUiTemplatesInclude,
    nuxtBuildUiAliasInclude,
    nuxtBuildAppConfigAliasInclude,
  ]

  if (context.includeAppConfigSource || Boolean(context.appConfigFiles?.length)) {
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
        Boolean(context.dev),
      )
    : [fallbackNuxtUiBuildInclude]

  return [
    ...buildIncludes,
    ...getSharedNuxtUiPipelineInclude(context),
  ]
}

export function getRequiredNuxtUiFilesystemContent(context: NuxtUiPipelineContext = {}) {
  if (!context.buildDir) {
    return []
  }

  return createNuxtBuildFilesystemEntries(
    context.buildDir,
    Boolean(context.componentDetection),
    context.uiCssContent,
    context.appConfigFiles,
    Boolean(context.dev),
  )
}
