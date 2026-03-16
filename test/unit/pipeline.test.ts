import { describe, expect, it } from 'vitest'
import { getRequiredNuxtUiFilesystemContent, getRequiredNuxtUiPipelineInclude } from '../../src/unocss/logic/pipeline'
import { getNuxtUiUnoConfigTemplate } from '../../src/unocss/logic/template'

describe('nuxt UI pipeline include selection', () => {
  const buildDir = '/tmp/project/.nuxt'
  const detectedUiCss = [
    '@source "./ui/button.ts";',
    '@source "./ui/content/blog-post.ts";',
  ].join('\n')

  it('scans all generated ui theme files during dev even with component detection enabled', () => {
    const include = getRequiredNuxtUiPipelineInclude({
      buildDir,
      componentDetection: true,
      dev: true,
      uiCssContent: detectedUiCss,
    }).map(pattern => pattern.toString())

    expect(include).toContain('/#build\\/ui\\/.+($|\\?)/')
    expect(include.some(pattern => pattern.includes('ui[\\\\/].+\\.ts'))).toBe(true)
    expect(include.some(pattern => pattern.includes('button\\.ts'))).toBe(false)
  })

  it('limits build scanning to detected theme files when component detection is enabled', () => {
    const include = getRequiredNuxtUiPipelineInclude({
      buildDir,
      componentDetection: true,
      uiCssContent: detectedUiCss,
    }).map(pattern => pattern.toString())

    expect(include.some(pattern => pattern.includes('ui[\\\\/]button\\.ts'))).toBe(true)
    expect(include.some(pattern => pattern.includes('ui[\\\\/]content[\\\\/]blog-post\\.ts'))).toBe(true)
    expect(include.some(pattern => pattern.includes('ui[\\\\/].+\\.ts'))).toBe(false)
  })
})

describe('generated uno config template', () => {
  const buildDir = '/tmp/project/.nuxt'
  const presetImportPath = '/tmp/project/preset.mjs'
  const appConfigFile = '/tmp/project/app.config.ts'

  it('keeps dev config on full ui scanning', () => {
    const template = getNuxtUiUnoConfigTemplate([], presetImportPath, {
      appConfigFiles: [appConfigFile],
      buildDir,
      componentDetection: true,
      dev: true,
    })

    expect(template).toContain('/#build\\/ui\\/.+($|\\?)/')
    expect(template).toContain('ui[\\\\/].+\\.ts')
    expect(template).toContain(`${buildDir}/ui/**/*.ts`)
    expect(template).toContain(`${buildDir}/app.config.{js,mjs,cjs,ts,mts,cts}`)
    expect(template).toContain(appConfigFile)
  })

  it('adds filesystem entries for build-time tree shaking', () => {
    const template = getNuxtUiUnoConfigTemplate([], presetImportPath, {
      appConfigFiles: [appConfigFile],
      buildDir,
      componentDetection: true,
      uiCssContent: [
        '@source "./ui/button.ts";',
        '@source "./ui/content/blog-post.ts";',
      ].join('\n'),
    })

    expect(template).toContain(`${buildDir}/ui/button.ts`)
    expect(template).toContain(`${buildDir}/ui/content/blog-post.ts`)
    expect(template).toContain(`${buildDir}/app.config.{js,mjs,cjs,ts,mts,cts}`)
    expect(template).toContain(appConfigFile)
  })
})

describe('nuxt app config extraction', () => {
  it('includes source app config files in filesystem scanning', () => {
    expect(getRequiredNuxtUiFilesystemContent({
      appConfigFiles: ['/tmp/project/app.config.ts'],
      buildDir: '/tmp/project/.nuxt',
    })).toContain('/tmp/project/app.config.ts')
  })
})
