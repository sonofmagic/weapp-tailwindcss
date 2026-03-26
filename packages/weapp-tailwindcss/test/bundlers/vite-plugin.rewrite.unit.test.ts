import type { Plugin, TransformResult } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { slash } from '@/bundlers/vite/utils'
import { vitePluginName } from '@/constants'
import { resolvePackageDir } from '@/utils/resolve-package'
import {
  createContext,
  getCurrentContext,
  resetVitePluginTestContext,
  setCurrentContext,
} from './vite-plugin.testkit'

const TEST_TIMEOUT_MS = 30000

async function loadUnifiedVitePlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.UnifiedViteWeappTailwindcssPlugin
}

describe('bundlers/vite UnifiedViteWeappTailwindcssPlugin rewrite', () => {
  beforeEach(() => {
    vi.resetModules()
    resetVitePluginTestContext()
  })

  it('rewrites tailwindcss imports for css entry files by default', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 4
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeTruthy()

    const resolveId = typeof rewritePlugin?.resolveId === 'function'
      ? rewritePlugin.resolveId.bind(rewritePlugin)
      : rewritePlugin?.resolveId?.handler?.bind(rewritePlugin)
    expect(resolveId).toBeTypeOf('function')
    expect((rewritePlugin as Plugin).resolveId).toMatchObject({ order: 'pre' })

    const pkgDir = slash(resolvePackageDir('weapp-tailwindcss'))
    const cssImporter = '/src/app.css'
    const subpathImporter = '/src/global.scss?inline'

    const resolvedRoot = await resolveId?.('tailwindcss', cssImporter)
    expect(resolvedRoot).toBe('weapp-tailwindcss/index.css')

    const resolvedBase = await resolveId?.('tailwindcss/base', subpathImporter)
    expect(resolvedBase).toBe(`${pkgDir}/base`)

    const ignoredJs = await resolveId?.('tailwindcss', '/src/main.ts')
    expect(ignoredJs).toBeNull()

    const ignoredPackage = await resolveId?.('tailwindcss-forms', cssImporter)
    expect(ignoredPackage).toBeNull()
  }, TEST_TIMEOUT_MS)

  it('transforms css source to rewrite tailwindcss @import statements', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 4
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeTruthy()

    const transform = typeof rewritePlugin?.transform === 'function'
      ? rewritePlugin.transform.bind(rewritePlugin)
      : rewritePlugin?.transform?.handler?.bind(rewritePlugin)
    expect(transform).toBeTypeOf('function')
    expect((rewritePlugin as Plugin).transform).toMatchObject({ order: 'pre' })

    const pkgDir = slash(resolvePackageDir('weapp-tailwindcss'))
    const source = `
@import 'tailwindcss' layer(base);
@import url("tailwindcss/utilities");
.foo { color: red; }
`
    const result = await transform?.(source, '/src/app.css') as TransformResult
    expect(result?.code).toContain(`@import 'weapp-tailwindcss/index.css' layer(base);`)
    expect(result?.code).toContain(`@import url("${pkgDir}/utilities");`)
  }, TEST_TIMEOUT_MS)

  it('runs rewrite transform ahead of other pre plugins so tailwindcss imports are replaced first', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 4
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeTruthy()

    const tailwindLikePlugin: Plugin = {
      name: '@tailwindcss/vite:generate',
      enforce: 'pre',
      transform(code) {
        return { code: `tailwind:${code}`, map: null }
      },
    }

    function collectOrderedTransforms(pluginList: Plugin[]) {
      const pre: Array<{ name: string, handler: NonNullable<Plugin['transform']> }> = []
      const normal: typeof pre = []
      const post: typeof pre = []
      for (const plugin of pluginList) {
        const hook = plugin.transform
        if (!hook) {
          continue
        }
        const target = typeof hook === 'object'
          ? hook.order === 'post'
            ? post
            : hook.order === 'pre'
              ? pre
              : normal
          : normal
        target.push({
          name: plugin.name,
          handler: typeof hook === 'object' ? hook.handler!.bind(plugin) : hook.bind(plugin),
        })
      }
      return [...pre, ...normal, ...post]
    }

    const orderedTransforms = collectOrderedTransforms([tailwindLikePlugin, ...(plugins ?? [])])
    expect(orderedTransforms.map(item => item.name)).toEqual([
      `${vitePluginName}:rewrite-css-imports`,
      '@tailwindcss/vite:generate',
    ])

    let source = '@import "tailwindcss";'
    const id = '/src/app.css'
    slash(resolvePackageDir('weapp-tailwindcss'))

    for (const { handler } of orderedTransforms) {
      const result = await handler(source, id) as TransformResult
      if (result?.code) {
        source = result.code
      }
    }

    expect(source).toContain(`@import "weapp-tailwindcss/index.css";`)
    expect(source.startsWith('tailwind:')).toBeTruthy()
  }, TEST_TIMEOUT_MS)

  it('can disable only css import rewriting through disabled.rewriteCssImports', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = createContext({ disabled: { rewriteCssImports: true } as any })
    setCurrentContext(currentContext)
    currentContext.twPatcher.majorVersion = 4
    const plugins = UnifiedViteWeappTailwindcssPlugin({
      disabled: { rewriteCssImports: true },
    })
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post')
    expect(rewritePlugin).toBeUndefined()
    expect(postPlugin).toBeTruthy()
  }, TEST_TIMEOUT_MS)

  it('keeps tailwindcss imports rewritten when plugin is disabled for tailwind v4 projects', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = createContext({ disabled: true })
    setCurrentContext(currentContext)
    currentContext.twPatcher.majorVersion = 4
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins?.length).toBe(1)
    const rewritePlugin = plugins?.[0]
    expect(rewritePlugin?.name).toBe(`${vitePluginName}:rewrite-css-imports`)
    expect(currentContext.twPatcher.patch).not.toHaveBeenCalled()

    const transform = typeof rewritePlugin?.transform === 'function'
      ? rewritePlugin.transform.bind(rewritePlugin)
      : rewritePlugin?.transform?.handler?.bind(rewritePlugin)
    expect(transform).toBeTypeOf('function')

    const result = await transform?.('@import "tailwindcss";', '/src/app.css') as TransformResult
    expect(result?.code).toContain('@import "weapp-tailwindcss/index.css";')
  }, TEST_TIMEOUT_MS)

  it('can disable css import rewriting through options', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    ;(currentContext as any).rewriteCssImports = false
    currentContext.twPatcher.majorVersion = 4
    const plugins = UnifiedViteWeappTailwindcssPlugin({ rewriteCssImports: false })
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeUndefined()
  }, TEST_TIMEOUT_MS)

  it('returns undefined when disabled plugin and css rewrite are both turned off', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({ disabled: { plugin: true, rewriteCssImports: true } as any }))
    const plugins = UnifiedViteWeappTailwindcssPlugin({
      disabled: { plugin: true, rewriteCssImports: true },
    })
    expect(plugins).toBeUndefined()
  }, TEST_TIMEOUT_MS)

  it('skips css import rewrite when tailwindcss major version is below 4', async () => {
    const UnifiedViteWeappTailwindcssPlugin = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 3
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeUndefined()
  }, TEST_TIMEOUT_MS)
})
