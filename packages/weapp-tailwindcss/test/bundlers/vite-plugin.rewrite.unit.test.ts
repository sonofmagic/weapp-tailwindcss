import type { Plugin, TransformResult } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { slash } from '@/bundlers/vite/utils'
import { createRewriteCssImportsPlugins } from '@/bundlers/vite/rewrite-css-imports'
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
  return mod.WeappTailwindcss
}

function getResolveIdHandler(plugin: Plugin) {
  return typeof plugin.resolveId === 'function'
    ? plugin.resolveId.bind(plugin)
    : plugin.resolveId?.handler?.bind(plugin)
}

function getTransformHandler(plugin: Plugin) {
  return typeof plugin.transform === 'function'
    ? plugin.transform.bind(plugin)
    : plugin.transform?.handler?.bind(plugin)
}

describe('bundlers/vite WeappTailwindcss rewrite', () => {
  beforeEach(() => {
    vi.resetModules()
    resetVitePluginTestContext()
  })

  it('rewrites tailwindcss imports for css entry files by default', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 4
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeTruthy()

    const resolveId = getResolveIdHandler(rewritePlugin as Plugin)
    expect(resolveId).toBeTypeOf('function')
    expect((rewritePlugin as Plugin).resolveId).toMatchObject({ order: 'pre' })

    const pkgDir = slash(resolvePackageDir('weapp-tailwindcss'))
    const cssImporter = '/src/app.css'
    const subpathImporter = '/src/global.scss?inline'

    const resolvedRoot = await resolveId?.('tailwindcss', cssImporter)
    expect(resolvedRoot).toBe(`${pkgDir}/generator-placeholder.css`)

    const resolvedBase = await resolveId?.('tailwindcss/base', subpathImporter)
    expect(resolvedBase).toBe(`${pkgDir}/base`)

    const resolvedFromPostcssImport = await resolveId?.('tailwindcss', '/src/*')
    expect(resolvedFromPostcssImport).toBe(`${pkgDir}/generator-placeholder.css`)

    const ignoredJs = await resolveId?.('tailwindcss', '/src/main.ts')
    expect(ignoredJs).toBeNull()

    const ignoredPackage = await resolveId?.('tailwindcss-forms', cssImporter)
    expect(ignoredPackage).toBeNull()
  }, TEST_TIMEOUT_MS)

  it('transforms css source to rewrite tailwindcss @import statements', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 4
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeTruthy()

    const transform = getTransformHandler(rewritePlugin as Plugin)
    expect(transform).toBeTypeOf('function')
    expect((rewritePlugin as Plugin).transform).toMatchObject({ order: 'pre' })

    const pkgDir = slash(resolvePackageDir('weapp-tailwindcss'))
    const source = `
@import 'tailwindcss' layer(base);
@import url("tailwindcss/utilities");
.foo { color: red; }
`
    const result = await transform?.(source, '/src/app.css') as TransformResult
    expect(result?.code).toContain(`@import '${pkgDir}/generator-placeholder.css' layer(base);`)
    expect(result?.code).toContain(`@import url("${pkgDir}/utilities");`)
  }, TEST_TIMEOUT_MS)

  it('rewrites tailwindcss root imports to generator placeholder in force generator mode', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = createContext({
    })
    setCurrentContext(currentContext)
    currentContext.twPatcher.majorVersion = 4
    const plugins = WeappTailwindcss({
    })
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeTruthy()

    const transform = getTransformHandler(rewritePlugin as Plugin)
    const result = await transform?.('@import "tailwindcss";\n@import "tailwindcss/theme.css";', '/src/app.css') as TransformResult
    const pkgDir = slash(resolvePackageDir('weapp-tailwindcss'))
    expect(result?.code).toContain(`@import "${pkgDir}/generator-placeholder.css";`)
    expect(result?.code).toContain(`@import "${pkgDir}/theme.css";`)
  }, TEST_TIMEOUT_MS)

  it('runs rewrite transform ahead of other pre plugins so tailwindcss imports are replaced first', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 4
    const plugins = WeappTailwindcss()
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
      `${vitePluginName}:source-candidates`,
    ])

    let source = '@import "tailwindcss";'
    const id = '/src/app.css'
    const pkgDir = slash(resolvePackageDir('weapp-tailwindcss'))

    for (const { handler } of orderedTransforms) {
      const result = await handler(source, id) as TransformResult
      if (result?.code) {
        source = result.code
      }
    }

    expect(source).toContain(`@import "${pkgDir}/generator-placeholder.css";`)
    expect(source.startsWith('tailwind:')).toBeTruthy()
  }, TEST_TIMEOUT_MS)

  it('keeps tailwindcss imports rewritten when plugin is disabled for tailwind v4 projects', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = createContext({ disabled: true })
    setCurrentContext(currentContext)
    currentContext.twPatcher.majorVersion = 4
    const plugins = WeappTailwindcss()
    expect(plugins?.length).toBe(1)
    const rewritePlugin = plugins?.[0]
    expect(rewritePlugin?.name).toBe(`${vitePluginName}:rewrite-css-imports`)
    expect(currentContext.twPatcher.patch).not.toHaveBeenCalled()

    const transform = getTransformHandler(rewritePlugin as Plugin)
    expect(transform).toBeTypeOf('function')

    const result = await transform?.('@import "tailwindcss";', '/src/app.css') as TransformResult
    expect(result?.code).toContain('@import "weapp-tailwindcss/index.css";')
  }, TEST_TIMEOUT_MS)

  it('supports trailing package directories and importer-less resolution in rewrite factory', async () => {
    const [rewritePlugin] = createRewriteCssImportsPlugins({
      shouldRewrite: true,
      weappTailwindcssDirPosix: '/virtual/weapp-tailwindcss/',
    })
    const resolveId = getResolveIdHandler(rewritePlugin!)
    expect(resolveId).toBeTypeOf('function')

    expect(resolveId?.('tailwindcss/base', undefined)).toBe('/virtual/weapp-tailwindcss/base')
  })

  it('returns null for css transforms without tailwindcss imports', async () => {
    const [rewritePlugin] = createRewriteCssImportsPlugins({
      shouldRewrite: true,
      weappTailwindcssDirPosix: '/virtual/weapp-tailwindcss',
      getAppType: () => 'taro',
    })
    const transform = getTransformHandler(rewritePlugin!)
    expect(transform).toBeTypeOf('function')

    expect(transform?.('.foo { color: red; }', '/src/app.css')).toBeNull()
  })

  it('strips @config directives before Vite CSS handling in generator mode', async () => {
    const [rewritePlugin] = createRewriteCssImportsPlugins({
      shouldOwnTailwindGeneration: true,
      shouldRewrite: true,
      weappTailwindcssDirPosix: '/virtual/weapp-tailwindcss',
    })
    const transform = getTransformHandler(rewritePlugin!)
    expect(transform).toBeTypeOf('function')

    const result = transform?.('@import "tailwindcss";\n@config "../tailwind.config.js";\n.foo { color: red; }', '/src/app.css') as TransformResult
    expect(result?.code).toContain('@import "weapp-tailwindcss/index.css";')
    expect(result?.code).not.toContain('@config')
  })

  it('returns null for non-css transform requests', async () => {
    const [rewritePlugin] = createRewriteCssImportsPlugins({
      shouldRewrite: true,
      weappTailwindcssDirPosix: '/virtual/weapp-tailwindcss',
    })
    const transform = getTransformHandler(rewritePlugin!)
    expect(transform).toBeTypeOf('function')

    expect(transform?.('@import "tailwindcss";', '/src/main.ts')).toBeNull()
  })

  it('keeps css import rewrite plugin when main plugin is disabled for tailwind v4 projects', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    setCurrentContext(createContext({ disabled: { plugin: true } }))
    getCurrentContext().twPatcher.majorVersion = 4
    const plugins = WeappTailwindcss({
      disabled: { plugin: true },
    })
    expect(plugins?.map(plugin => plugin.name)).toEqual([`${vitePluginName}:rewrite-css-imports`])
  }, TEST_TIMEOUT_MS)

  it('skips css import rewrite when tailwindcss major version is below 4', async () => {
    const WeappTailwindcss = await loadUnifiedVitePlugin()
    const currentContext = getCurrentContext()
    currentContext.twPatcher.majorVersion = 3
    const plugins = WeappTailwindcss()
    const rewritePlugin = plugins?.find(plugin => plugin.name === `${vitePluginName}:rewrite-css-imports`)
    expect(rewritePlugin).toBeUndefined()
  }, TEST_TIMEOUT_MS)
})
