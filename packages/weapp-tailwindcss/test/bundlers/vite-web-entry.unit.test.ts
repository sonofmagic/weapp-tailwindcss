import type { Plugin } from 'vite'
import { describe, expect, it } from 'vitest'
import { vitePluginName } from '@/constants'
import { createContext, resetVitePluginTestContext, setCurrentContext } from './vite-plugin.testkit'

function getPlugin(plugins: Plugin[], name: string) {
  return plugins.find(plugin => plugin.name === `${vitePluginName}:${name}`)
}

describe('vite Generic Web entry', () => {
  async function loadWebEntry() {
    return (await import('@/bundlers/vite/web')).WeappTailwindcssWeb
  }

  it('defaults the generic main entry to the Web generator after Vite resolves', async () => {
    const context = createContext({
      appType: undefined,
      platform: undefined,
      cssOptions: undefined,
      generator: undefined,
      tailwindcssBasedir: '/project',
    })
    setCurrentContext(context)
    const { WeappTailwindcss } = await import('@/bundlers/vite')
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')!

    await postPlugin.configResolved?.call(postPlugin, {
      command: 'build',
      root: '/project',
      plugins: [],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as any)

    expect(context.generator).toMatchObject({ target: 'web' })
    resetVitePluginTestContext()
  })

  it('creates a fixed Generic Web plugin group without framework detection', () => {
    return loadWebEntry().then((WeappTailwindcssWeb) => {
      const plugins = WeappTailwindcssWeb({
      tailwindcssBasedir: '/project',
      })!

      expect(getPlugin(plugins, 'source-candidates')).toBeDefined()
      expect(getPlugin(plugins, 'generate:build')).toMatchObject({
        apply: 'build',
      })
      expect(getPlugin(plugins, 'js:serve')).toBeUndefined()
    })
  })

  it.each([
    ['false', false],
    ['object false', { minify: false }],
  ])('maps optimize %s to Vite cssMinify=false', async (_label, optimize) => {
    const WeappTailwindcssWeb = await loadWebEntry()
    const plugins = WeappTailwindcssWeb({ optimize })!
    const optimizePlugin = getPlugin(plugins, 'generic-web-optimize')!
    const config = typeof optimizePlugin.config === 'function'
      ? optimizePlugin.config({}, {} as any)
      : undefined

    expect(config).toMatchObject({
      build: {
        cssMinify: false,
      },
    })
  })

  it('keeps the default Vite css minifier when optimize is enabled', async () => {
    const WeappTailwindcssWeb = await loadWebEntry()
    const plugins = WeappTailwindcssWeb({ optimize: true })!

    expect(getPlugin(plugins, 'generic-web-optimize')).toBeUndefined()
  })
})
