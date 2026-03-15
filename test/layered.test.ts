import { readdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildNuxt, loadNuxt } from '@nuxt/kit'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('layered app config integration', () => {
  const rootDir = fileURLToPath(new URL('./fixtures/layered', import.meta.url))
  const buildDir = join(rootDir, '.nuxt', 'integration-layered')
  const outputDir = join(buildDir, 'output')
  let uiCss = ''
  let clientCss = ''

  beforeAll(async () => {
    await rm(buildDir, { recursive: true, force: true })

    const nuxt = await loadNuxt({
      cwd: rootDir,
      dev: false,
      overrides: {
        buildDir,
        nitro: {
          output: {
            dir: outputDir,
          },
        },
      },
    })

    try {
      await buildNuxt(nuxt)
    }
    finally {
      await nuxt.close()
    }

    uiCss = await readFile(join(buildDir, 'ui.css'), 'utf8')

    const clientDir = join(buildDir, 'dist', 'client', '_nuxt')
    const clientFiles = (await readdir(clientDir))
      .filter(file => file.endsWith('.css'))

    clientCss = (await Promise.all(
      clientFiles.map(file => readFile(join(clientDir, file), 'utf8')),
    )).join('\n')
  }, 120000)

  afterAll(async () => {
    await rm(buildDir, { recursive: true, force: true })
  })

  it('limits build scanning to the used ui component theme files', () => {
    expect(uiCss).toContain('@source "./ui/button.ts";')
    expect(uiCss).toContain('@source "./ui/link.ts";')
    expect(uiCss).not.toContain('@source "./ui";')
  })

  it('extracts theme overrides from root and extended layer app.config files', () => {
    expect(clientCss).toContain('.tracking-\\[0\\.3em\\]{--un-tracking:.3em;letter-spacing:.3em}')
    expect(clientCss).toContain('.tracking-\\[0\\.4em\\]{--un-tracking:.4em;letter-spacing:.4em}')
  })
})
