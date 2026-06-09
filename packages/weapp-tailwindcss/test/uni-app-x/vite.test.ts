import type { OutputAsset } from 'rollup'
import type { HmrContext, Plugin, ResolvedConfig, TransformResult } from 'vite'
import type { CreateJsHandlerOptions } from '@/types'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { createCache } from '@/cache'
import { collectUniAppXHarmonyApplyStyleSources, createUniAppXHarmonyApplyGeneratorSource, injectUniAppXHarmonyBundleStyles, injectUniAppXStylePlaceholder } from '@/uni-app-x/style-asset'
import { createUniAppXAssetTask, createUniAppXPlugins } from '@/uni-app-x/vite'
import { clearUniAppXStyleIsolationCache } from '@/uni-app-x/style-isolation'

/** 将平台路径转为 posix 格式，与源码 normalizePath 行为一致 */
function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

type TransformUVueMock = (
  code: string,
  id: string,
  jsHandler: unknown,
  runtimeSet?: Set<string>,
  options?: unknown,
) => TransformResult | undefined

const transformUVueMock = vi.hoisted(() => vi.fn<Parameters<TransformUVueMock>, TransformResult | undefined>())
vi.mock('@/uni-app-x/transform', () => ({
  transformUVue: transformUVueMock,
}))

function createAsset(source: string): OutputAsset {
  return {
    type: 'asset',
    fileName: 'entry.js',
    name: undefined,
    source,
  } as unknown as OutputAsset
}

function createChunk(code: string, extra: Record<string, unknown> = {}) {
  return {
    type: 'chunk',
    fileName: 'entry.js',
    name: 'entry',
    code,
    ...extra,
  }
}

function getGenerateBundleHandler(plugin: Plugin | undefined) {
  const hook = plugin?.generateBundle as any
  return typeof hook === 'object' ? hook.handler : hook
}

describe('uni-app-x vite plugins', () => {
  it('processes css requests and forwards map options', async () => {
    const styleHandler = vi.fn(async (code: string, options?: Record<string, unknown>) => ({
      css: `css:${code}`,
      map: {
        toJSON: () => ({
          version: 3,
          file: options?.postcssOptions?.options?.from ?? '',
          sources: [options?.postcssOptions?.options?.from ?? ''],
          names: [],
          mappings: '',
          sourcesContent: [code],
        }),
      },
    }))
    const plugins = createUniAppXPlugins({
      appType: 'uni-app-x',
      customAttributesEntities: [],
      disabledDefaultTemplateHandler: false,
      isIosPlatform: true,
      mainCssChunkMatcher: vi.fn(() => true),
      runtimeState: { readyPromise: Promise.resolve() },
      styleHandler,
      jsHandler: vi.fn(),
      ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
      getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
    })
    const cssPlugin = plugins.find((p): p is Plugin => Boolean(p.name?.includes(':css')))
    expect(cssPlugin).toBeDefined()

    const result = await cssPlugin!.transform?.('body { color: red; }', '/foo.css')

    expect(styleHandler).toHaveBeenCalledWith(
      'body { color: red; }',
      expect.objectContaining({
        isMainChunk: true,
        uniAppXUnsupported: 'warn',
        postcssOptions: expect.objectContaining({
          options: expect.objectContaining({
            from: '/foo.css',
            map: expect.objectContaining({ sourcesContent: true }),
          }),
        }),
      }),
    )
    expect(result?.code).toBe('css:body { color: red; }')
    // formatPostcssSourceMap 使用 path.resolve 后转 posix，Windows 下会带盘符
    const expectedFooCss = toPosix(path.resolve(path.dirname('/foo.css'), '/foo.css'))
    expect((result?.map as any)?.sources).toContain(expectedFooCss)
  })

  it('skips pre hook for preprocessor styles and runs after preprocess', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-ios'
    try {
      const styleHandler = vi.fn(async (code: string, options?: Record<string, unknown>) => ({
        css: `css:${code}`,
        map: {
          toJSON: () => ({
            version: 3,
            file: options?.postcssOptions?.options?.from ?? '',
            sources: [options?.postcssOptions?.options?.from ?? ''],
            names: [],
            mappings: '',
            sourcesContent: [code],
          }),
        },
      }))
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        isIosPlatform: true,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler,
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
      })
      const cssPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:css')
      const preCssPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:css:pre')
      expect(cssPlugin).toBeDefined()
      expect(preCssPlugin).toBeDefined()

      const scssId = '/pages/index/index.uvue?vue&type=style&index=0&lang.scss'

      const preResult = await preCssPlugin!.transform?.('$color: red;', scssId)
      expect(preResult).toBeUndefined()
      expect(styleHandler).not.toHaveBeenCalled()

      const result = await cssPlugin!.transform?.('body { color: red; }', scssId)
      expect(styleHandler).toHaveBeenCalledTimes(1)
      expect(styleHandler).toHaveBeenCalledWith(
        'body { color: red; }',
        expect.objectContaining({
          uniAppXCssTarget: 'uvue',
          uniAppXUnsupported: 'warn',
        }),
      )
      expect(result?.code).toBe('css:body { color: red; }')
      // cleanUrl 去除 query 后为 /pages/index/index.uvue，sources 经 path.resolve 后转 posix
      const expectedUvue = toPosix(path.resolve(path.dirname('/pages/index/index.uvue'), '/pages/index/index.uvue'))
      expect((result?.map as any)?.sources).toContain(expectedUvue)
    }
    finally {
      process.env.UNI_UTS_PLATFORM = originalPlatform
    }
  })

  it('pre hook continues for preprocessors on non-iOS platforms', async () => {
    const styleHandler = vi.fn(async (code: string, options?: Record<string, unknown>) => ({
      css: `css:${code}`,
      map: {
        toJSON: () => ({
          version: 3,
          file: options?.postcssOptions?.options?.from ?? '',
          sources: [options?.postcssOptions?.options?.from ?? ''],
          names: [],
          mappings: '',
          sourcesContent: [code],
        }),
      },
    }))
    const plugins = createUniAppXPlugins({
      appType: 'uni-app-x',
      customAttributesEntities: [],
      disabledDefaultTemplateHandler: false,
      isIosPlatform: false,
      mainCssChunkMatcher: vi.fn(() => true),
      runtimeState: { readyPromise: Promise.resolve() },
      styleHandler,
      jsHandler: vi.fn(),
      ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
      getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
    })
    const preCssPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:css:pre')
    expect(preCssPlugin).toBeDefined()

    const scssId = '/pages/index/index.uvue?vue&type=style&index=0&lang.scss'
    await preCssPlugin!.transform?.('$color: red;', scssId)
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(styleHandler).toHaveBeenCalledWith(
      '$color: red;',
      expect.objectContaining({
        uniAppXCssTarget: 'uvue',
        uniAppXUnsupported: 'warn',
      }),
    )
  })

  it('records uni-app-x style @apply for generator css without short-circuiting style handling', async () => {
    const styleHandler = vi.fn(async (code: string, options?: Record<string, unknown>) => ({
      css: `css:${code}`,
      map: {
        toJSON: () => ({
          version: 3,
          file: options?.postcssOptions?.options?.from ?? '',
          sources: [options?.postcssOptions?.options?.from ?? ''],
          names: [],
          mappings: '',
          sourcesContent: [code],
        }),
      },
    }))
    const generateCss = vi.fn(async () => '.content{display:flex}')
    const plugins = createUniAppXPlugins({
      appType: 'uni-app-x',
      customAttributesEntities: [],
      disabledDefaultTemplateHandler: false,
      isIosPlatform: false,
      mainCssChunkMatcher: vi.fn(() => false),
      runtimeState: { readyPromise: Promise.resolve() },
      styleHandler,
      generateCss,
      jsHandler: vi.fn(),
      ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
      getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
    })
    const cssPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:css')
    expect(cssPlugin).toBeDefined()

    const id = '/pages/index/index.uvue?vue&type=style&index=0&lang.scss&scoped=true'
    const result = await cssPlugin!.transform?.('.content { @apply flex; }', id)

    expect(generateCss).toHaveBeenCalledWith(id, '.content { @apply flex; }', expect.any(Object))
    expect(styleHandler).toHaveBeenCalledTimes(1)
    expect(styleHandler).toHaveBeenCalledWith('.content{display:flex}', expect.any(Object))
    expect(result?.code).toBe('css:.content{display:flex}')
  })

  it('runs nvue transform with runtime set and custom options', async () => {
    const runtimeSet = new Set(['alpha'])
    const ensureRuntimeClassSet = vi.fn(async () => runtimeSet)
    const jsHandler = vi.fn()
    const customAttributesEntities = [['*', ['foo']]]
    let currentConfig: ResolvedConfig = { command: 'serve', build: { watch: false } } as ResolvedConfig
    const plugins = createUniAppXPlugins({
      appType: 'uni-app-x',
      customAttributesEntities,
      disabledDefaultTemplateHandler: true,
      mainCssChunkMatcher: vi.fn(() => true),
      runtimeState: { readyPromise: Promise.resolve() },
      styleHandler: vi.fn(),
      jsHandler,
      ensureRuntimeClassSet,
      getResolvedConfig: () => currentConfig,
    })
    const nvuePlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:nvue')
    expect(nvuePlugin).toBeDefined()
    transformUVueMock.mockReturnValue({ code: 'transformed', map: null } as TransformResult)

    await nvuePlugin!.buildStart?.()
    expect(ensureRuntimeClassSet).toHaveBeenCalledWith(true)

    const transformResult = await nvuePlugin!.transform?.('<template/>', '/foo.uvue')
    expect(transformUVueMock).toHaveBeenCalledWith(
      '<template/>',
      '/foo.uvue',
      jsHandler,
      runtimeSet,
      {
        customAttributesEntities,
        disabledDefaultTemplateHandler: true,
      },
    )
    expect(transformResult).toEqual({ code: 'transformed', map: null })

    await nvuePlugin!.handleHotUpdate?.({ file: '/foo.uvue' } as HmrContext)
    expect(ensureRuntimeClassSet).toHaveBeenCalledWith(true)

    currentConfig = { command: 'build', build: { watch: true } } as ResolvedConfig
    await nvuePlugin!.watchChange?.('/foo.uvue?vue&type=template')
    expect(ensureRuntimeClassSet).toHaveBeenCalledWith(true)
  })

  it('enables component local style transform when manifest.json sets styleIsolationVersion=2', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tw-issue-822-'))
    try {
      await fs.writeFile(path.join(root, 'manifest.json'), `{
  // HBuilderX manifest.json allows comments
  "uni-app-x": {
    /* issue 822 regression */
    "styleIsolationVersion": "2"
  }
}
`, 'utf8')
      clearUniAppXStyleIsolationCache()
      const runtimeSet = new Set(['alpha'])
      const ensureRuntimeClassSet = vi.fn(async () => runtimeSet)
      const jsHandler = vi.fn()
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler,
        ensureRuntimeClassSet,
        getResolvedConfig: () => ({ command: 'build', build: { watch: false }, root } as ResolvedConfig),
        uniAppX: {
          enabled: true,
          componentLocalStyles: true,
        },
      })
      const nvuePlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:nvue')
      expect(nvuePlugin).toBeDefined()
      transformUVueMock.mockClear()
      transformUVueMock.mockReturnValue({ code: 'transformed', map: null } as TransformResult)

      await nvuePlugin!.transform?.('<template/>', '/src/components/foo.uvue')

      expect(transformUVueMock).toHaveBeenLastCalledWith(
        '<template/>',
        '/src/components/foo.uvue',
        jsHandler,
        runtimeSet,
        {
          enableComponentLocalStyle: true,
        },
      )
    }
    finally {
      clearUniAppXStyleIsolationCache()
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('enables page local style transform on app-harmony without styleIsolationVersion=2', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-harmony'
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tw-harmony-page-local-style-'))
    try {
      await fs.writeFile(path.join(root, 'manifest.json'), `{
  "uni-app-x": {}
}
`, 'utf8')
      clearUniAppXStyleIsolationCache()
      const runtimeSet = new Set(['alpha'])
      const ensureRuntimeClassSet = vi.fn(async () => runtimeSet)
      const jsHandler = vi.fn()
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler,
        ensureRuntimeClassSet,
        getResolvedConfig: () => ({ command: 'build', build: { watch: false }, root } as ResolvedConfig),
        uniAppX: {
          enabled: true,
          componentLocalStyles: true,
        },
      })
      const nvuePlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:nvue')
      expect(nvuePlugin).toBeDefined()
      transformUVueMock.mockClear()
      transformUVueMock.mockReturnValue({ code: 'transformed', map: null } as TransformResult)

      await nvuePlugin!.transform?.('<template/>', '/src/pages/index/index.uvue')

      expect(transformUVueMock).toHaveBeenLastCalledWith(
        '<template/>',
        '/src/pages/index/index.uvue',
        jsHandler,
        runtimeSet,
        {
          enablePageLocalStyle: true,
        },
      )
    }
    finally {
      clearUniAppXStyleIsolationCache()
      await fs.rm(root, { recursive: true, force: true })
      process.env.UNI_UTS_PLATFORM = originalPlatform
    }
  })

  it('allows disabling component local style transform from uniAppX options', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tw-issue-822-disabled-'))
    try {
      await fs.writeFile(path.join(root, 'manifest.json'), `{
  "uni-app-x": {
    "styleIsolationVersion": "2"
  }
}
`, 'utf8')
      clearUniAppXStyleIsolationCache()
      const runtimeSet = new Set(['alpha'])
      const ensureRuntimeClassSet = vi.fn(async () => runtimeSet)
      const jsHandler = vi.fn()
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler,
        ensureRuntimeClassSet,
        getResolvedConfig: () => ({ command: 'build', build: { watch: false }, root } as ResolvedConfig),
        uniAppX: {
          enabled: true,
          componentLocalStyles: false,
        },
      })
      const nvuePlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:nvue')
      expect(nvuePlugin).toBeDefined()
      transformUVueMock.mockClear()
      transformUVueMock.mockReturnValue({ code: 'transformed', map: null } as TransformResult)

      await nvuePlugin!.transform?.('<template/>', '/src/components/foo.uvue')

      expect(transformUVueMock).toHaveBeenLastCalledWith(
        '<template/>',
        '/src/components/foo.uvue',
        jsHandler,
        runtimeSet,
      )
    }
    finally {
      clearUniAppXStyleIsolationCache()
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('injects uni-app-x style placeholders in the post bundle hook', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-harmony'
    try {
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
      })
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')
      expect(placeholderPlugin).toBeDefined()
      const bundle = {
        'App.uvue.ts': createAsset('const GenAppStyles = [_uM([["bg-_b_h102938_B", _pS(_uM([["backgroundColor", "rgba(16,41,56,1)"]]))]])]'),
        'pages/index/index.uvue.ts': createAsset('_cE("view", _uM({ class: "bg-_b_h102938_B" }))\nconst GenPagesIndexIndexStyles = []'),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(bundle['pages/index/index.uvue.ts'].source).toContain('const GenPagesIndexIndexStyles = [_uM([["bg-_b_h102938_B"')
    }
    finally {
      process.env.UNI_UTS_PLATFORM = originalPlatform
    }
  })

  it('merges app global styles into harmony page chunks in the post bundle hook', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-harmony'
    try {
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
      })
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')
      expect(placeholderPlugin).toBeDefined()
      const bundle = {
        'assets/App.js': createChunk('const _style_0 = {"flex":{"":{"display":"flex"}},"text-white":{"":{"color":"#FFFFFF"}}};'),
        'assets/pages/index/index.js': createChunk('const _style_0 = {"wtu-a":{"":{"height":100}}};\nfunction render(){return createElementVNode("view", { class: "flex wtu-a text-white" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"height":100}}')
      expect(bundle['assets/pages/index/index.js'].code).toContain('"flex":{"":{"display":"flex"}}')
      expect(bundle['assets/pages/index/index.js'].code).toContain('"text-white":{"":{"color":"#FFFFFF"}}')
    }
    finally {
      process.env.UNI_UTS_PLATFORM = originalPlatform
    }
  })

  it('adds harmony styles option for component chunks without local styles', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-harmony'
    try {
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
      })
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')
      expect(placeholderPlugin).toBeDefined()
      const bundle = {
        'assets/App.js': createChunk('const _style_0 = {"px-4":{"":{"paddingLeft":"32rpx","paddingRight":"32rpx"}}};'),
        'assets/components/Logo.js': createChunk('function render(){return createElementVNode("view", { class: "px-4" })}\nconst Logo = _export_sfc(_sfc_main, [["render", render], ["__file", "components/Logo.uvue"]]);'),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(bundle['assets/components/Logo.js'].code).toContain('const _style_wt = {"px-4":{"":{"paddingLeft":"32rpx","paddingRight":"32rpx"}}};')
      expect(bundle['assets/components/Logo.js'].code).toContain('["styles", [_style_wt]], ["__file"')
    }
    finally {
      process.env.UNI_UTS_PLATFORM = originalPlatform
    }
  })

  it('hydrates harmony chunk styles from css assets and source map apply rules', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_UTS_PLATFORM = 'app-harmony'
    try {
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
      })
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')
      expect(placeholderPlugin).toBeDefined()
      const bundle = {
        'assets/App.js': createChunk('const _style_0 = {};'),
        'main.wxss': createAsset('.flex { display: flex; } .bg-_b_h102938_B { background-color: #102938; } .text-_b_hf7fbff_B { color: #f7fbff; }'),
        'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "flex wtu-a wtu-b" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
        'assets/pages/index/index.js.map': createAsset(JSON.stringify({
          sourcesContent: [
            '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n.wtu-b {\n  @apply text-[#f7fbff];\n}\n</style>',
          ],
        })),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(bundle['assets/pages/index/index.js'].code).toContain('"flex":{"":{"display":"flex"}}')
      expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"#102938"}}')
      expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-b":{"":{"color":"#f7fbff"}}')
    }
    finally {
      process.env.UNI_UTS_PLATFORM = originalPlatform
    }
  })

  it('hydrates harmony chunk styles when platform env is absent but bundle is harmony', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    delete process.env.UNI_UTS_PLATFORM
    try {
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
      })
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')
      expect(placeholderPlugin).toBeDefined()
      const bundle = {
        'assets/App.js': createChunk('const _style_0 = {"bg-_b_h102938_B":{"":{"backgroundColor":"#102938"}}};'),
        'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "bg-_b_h102938_B" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
        'import/app-service.ets': createAsset(''),
        'uni_modules/oh-package.json5': createAsset('{}'),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(bundle['assets/pages/index/index.js'].code).toContain('"bg-_b_h102938_B":{"":{"backgroundColor":"#102938"}}')
    }
    finally {
      if (originalPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = originalPlatform
      }
    }
  })

  it('generates harmony apply css in the post bundle hook before hydrating chunks', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    delete process.env.UNI_UTS_PLATFORM
    try {
      const generateCss = vi.fn(async () => [
        '.wtu-a { background-color: rgba(16,41,56,1); }',
        '.wtu-b { color: rgba(247,251,255,1); }',
        '.wtu-c { width: 173px; }',
      ].join('\n'))
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        generateCss,
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { watch: false } } as ResolvedConfig),
      })
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')
      expect(placeholderPlugin).toBeDefined()
      const bundle = {
        'assets/App.js': createChunk('const _style_0 = {};'),
        'assets/pages/index/index.js': createChunk('const _style_0 = {};\nconst _style_1 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a wtu-b wtu-c" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0, _style_1]], ["__file", "pages/index/index.uvue"]]);'),
        'assets/pages/index/index.js.map': createAsset(JSON.stringify({
          sourcesContent: [
            '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n.wtu-b {\n  @apply text-[#f7fbff];\n}\n.wtu-c {\n  @apply w-[173px];\n}\n</style>',
          ],
        })),
        'import/app-service.ets': createAsset(''),
        'uni_modules/oh-package.json5': createAsset('{}'),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(generateCss).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'uni-app-x-harmony-apply.css'),
        [
          '.wtu-a {\n  @apply bg-[#102938];\n}',
          '.wtu-b {\n  @apply text-[#f7fbff];\n}',
          '.wtu-c {\n  @apply w-[173px];\n}',
        ].join('\n'),
        undefined,
      )
      expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
      expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-b":{"":{"color":"rgba(247,251,255,1)"}}')
      expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-c":{"":{"width":173}}')
    }
    finally {
      if (originalPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = originalPlatform
      }
    }
  })

  it('records uvue apply sources before harmony target is known and hydrates in bundle hook', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    delete process.env.UNI_UTS_PLATFORM
    try {
      const generateCss = vi.fn(async () => '.wtu-a { background-color: rgba(16,41,56,1); }')
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => false),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        generateCss,
        jsHandler: vi.fn(async (code: string) => ({ code })),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { outDir: 'unpackage/dist/dev/.app-harmony', watch: false } } as ResolvedConfig),
      })
      const nvuePlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:nvue')
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')

      await nvuePlugin?.transform?.call({} as any, '<template><view class="wtu-a" /></template>\n<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n</style>', '/project/pages/index/index.uvue')

      const bundle = {
        'assets/App.js': createChunk('const _style_0 = {};'),
        'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(generateCss).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'uni-app-x-harmony-apply.css'),
        '.wtu-a {\n  @apply bg-[#102938];\n}',
        undefined,
      )
      expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
    }
    finally {
      if (originalPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = originalPlatform
      }
    }
  })

  it('detects harmony target from build outDir before harmony marker assets exist', async () => {
    const originalPlatform = process.env.UNI_UTS_PLATFORM
    delete process.env.UNI_UTS_PLATFORM
    try {
      const plugins = createUniAppXPlugins({
        appType: 'uni-app-x',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { readyPromise: Promise.resolve() },
        styleHandler: vi.fn(),
        generateCss: vi.fn(),
        jsHandler: vi.fn(),
        ensureRuntimeClassSet: vi.fn(async () => new Set<string>()),
        getResolvedConfig: () => ({ command: 'build', build: { outDir: 'unpackage/dist/dev/.app-harmony', watch: false } } as ResolvedConfig),
      })
      const placeholderPlugin = plugins.find((p): p is Plugin => p.name === 'weapp-tailwindcss:uni-app-x:style-placeholder')
      expect(placeholderPlugin).toBeDefined()
      const bundle = {
        'assets/App.js': createChunk('const _style_0 = {"flex":{"":{"display":"flex"}}};'),
        'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "flex" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      }

      await getGenerateBundleHandler(placeholderPlugin)?.({} as any, bundle as any, false)

      expect(bundle['assets/pages/index/index.js'].code).toContain('"flex":{"":{"display":"flex"}}')
    }
    finally {
      if (originalPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = originalPlatform
      }
    }
  })

  it('hydrates harmony chunk styles from recorded css sources when css assets are absent', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a wtu-b wtu-c" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n.wtu-b {\n  @apply text-[#f7fbff];\n}\n.wtu-c {\n  @apply w-[173px];\n}\n</style>',
        ],
      })),
    }

    const changed = injectUniAppXHarmonyBundleStyles(bundle, {
      cssSources: [
        '.bg-_b_h102938_B { background-color: rgba(16,41,56,1); } .text-_b_hf7fbff_B { color: rgba(247,251,255,1); } .w-_b173px_B { width: 173px; }',
      ],
    })

    expect(changed).toBe(true)
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-b":{"":{"color":"rgba(247,251,255,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-c":{"":{"width":173}}')
  })

  it('hydrates harmony local styles even when App style is empty', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};\nconst _style_1 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a wtu-b wtu-c" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0, _style_1]], ["__file", "pages/index/index.uvue"]]);'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n.wtu-b {\n  @apply text-[#f7fbff];\n}\n.wtu-c {\n  @apply w-[173px];\n}\n</style>',
        ],
      })),
    }

    const changed = injectUniAppXHarmonyBundleStyles(bundle, {
      cssSources: [
        '.bg-_b_h102938_B { background-color: rgba(16,41,56,1); } .text-_b_hf7fbff_B { color: rgba(247,251,255,1); } .w-_b173px_B { width: 173px; }',
      ],
    })

    expect(changed).toBe(true)
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-b":{"":{"color":"rgba(247,251,255,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-c":{"":{"width":173}}')
  })

  it('collects harmony apply style sources from sourcemaps and uvue assets', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n</style>',
        ],
      })),
      'pages/index/index.uvue': createAsset('<template />\n<style scoped>\n.wtu-b {\n  @apply text-[#f7fbff];\n}\n</style>'),
    }

    const sources = collectUniAppXHarmonyApplyStyleSources(bundle)

    expect(sources).toContain('.wtu-a {\n  @apply bg-[#102938];\n}')
    expect(sources).toContain('.wtu-b {\n  @apply text-[#f7fbff];\n}')
  })

  it('collects harmony apply style sources from chunk maps before sourcemap assets are emitted', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};', {
        map: {
          sourcesContent: [
            '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n</style>',
          ],
        },
      }),
    }

    const sources = collectUniAppXHarmonyApplyStyleSources(bundle)

    expect(sources).toContain('.wtu-a {\n  @apply bg-[#102938];\n}')
  })

  it('collects harmony apply style sources from assets sourcemaps for non-assets chunks', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'pages/index/index.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n</style>',
        ],
      })),
    }

    const sources = collectUniAppXHarmonyApplyStyleSources(bundle)

    expect(sources).toContain('.wtu-a {\n  @apply bg-[#102938];\n}')
  })

  it('creates Tailwind v4 generator source for harmony apply styles', () => {
    const source = createUniAppXHarmonyApplyGeneratorSource([
      '.wtu-a {\n  @apply bg-[#102938];\n}',
    ], ['w-[173px]', 'bg-[#102938]', 'bg-[#102938]'])

    expect(source).toBe('.wtu-a {\n  @apply bg-[#102938];\n}')
  })

  it('injects uni-app-x style placeholder from sibling wxss fallback', () => {
    const code = 'const GenPagesIndexIndexStyles = []'
    const next = injectUniAppXStylePlaceholder(
      'pages/index/index.uvue.ts',
      code,
      file => file === 'pages/index/index.wxss'
        ? '.content { display: flex; width: 173px; }'
        : undefined,
    )

    expect(next).toContain('const GenPagesIndexIndexStyles = [_uM([')
    expect(next).toContain('"content"')
    expect(next).toContain('"display", "flex"')
    expect(next).toContain('"width", 173')
  })

  it('hydrates harmony chunk styles from escaped arbitrary utility selectors', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a wtu-b wtu-c" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n.wtu-b {\n  @apply text-[#f7fbff];\n}\n.wtu-c {\n  @apply w-[173px];\n}\n</style>',
        ],
      })),
    }

    const changed = injectUniAppXHarmonyBundleStyles(bundle, {
      cssSources: [
        '.bg-\\[\\#102938\\] { background-color: rgba(16,41,56,1); } .text-\\[\\#f7fbff\\] { color: rgba(247,251,255,1); } .w-\\[173px\\] { width: 173px; }',
      ],
    })

    expect(changed).toBe(true)
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-b":{"":{"color":"rgba(247,251,255,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-c":{"":{"width":173}}')
  })

  it('hydrates harmony chunk styles from uni-app-x style export css sources', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a wtu-b wtu-c" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n.wtu-b {\n  @apply text-[#f7fbff];\n}\n.wtu-c {\n  @apply w-[173px];\n}\n</style>',
        ],
      })),
    }

    const changed = injectUniAppXHarmonyBundleStyles(bundle, {
      cssSources: [
        'export default {"bg-_b_h102938_B":{"":{"backgroundColor":"rgba(16,41,56,1)"}},"text-_b_hf7fbff_B":{"":{"color":"rgba(247,251,255,1)"}},"w-_b173px_B":{"":{"width":173}}}',
      ],
    })

    expect(changed).toBe(true)
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-b":{"":{"color":"rgba(247,251,255,1)"}}')
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-c":{"":{"width":173}}')
  })

  it('hydrates harmony chunk styles from scoped apply css selectors', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<template><view class="wtu-a" /></template>\n<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n</style>',
        ],
      })),
    }

    const changed = injectUniAppXHarmonyBundleStyles(bundle, {
      cssSources: [
        '.bg-\\[\\#102938\\] { background-color: rgba(16,41,56,1); } .wtu-a.data-v-abc { background-color: rgba(16,41,56,1); }',
      ],
    })

    expect(changed).toBe(true)
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
  })

  it('hydrates harmony chunk styles from chunk maps before sourcemap assets are emitted', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'assets/pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);', {
        map: {
          sourcesContent: [
            '<template><view class="wtu-a" /></template>\n<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n</style>',
          ],
        },
      }),
    }

    const changed = injectUniAppXHarmonyBundleStyles(bundle, {
      cssSources: [
        '.bg-\\[\\#102938\\] { background-color: rgba(16,41,56,1); }',
      ],
    })

    expect(changed).toBe(true)
    expect(bundle['assets/pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
  })

  it('hydrates harmony chunk styles from assets sourcemaps for non-assets chunks', () => {
    const bundle = {
      'assets/App.js': createChunk('const _style_0 = {};'),
      'pages/index/index.js': createChunk('const _style_0 = {};\nfunction render(){return createElementVNode("view", { class: "wtu-a" })}\nconst index = _export_sfc(_sfc_main, [["render", render], ["styles", [_style_0]], ["__file", "pages/index/index.uvue"]]);'),
      'assets/pages/index/index.js.map': createAsset(JSON.stringify({
        sourcesContent: [
          '<template><view class="wtu-a" /></template>\n<style scoped>\n.wtu-a {\n  @apply bg-[#102938];\n}\n</style>',
        ],
      })),
    }

    const changed = injectUniAppXHarmonyBundleStyles(bundle, {
      cssSources: [
        '.bg-\\[\\#102938\\] { background-color: rgba(16,41,56,1); }',
      ],
    })

    expect(changed).toBe(true)
    expect(bundle['pages/index/index.js'].code).toContain('"wtu-a":{"":{"backgroundColor":"rgba(16,41,56,1)"}}')
  })
})

describe('createUniAppXAssetTask', () => {
  it('processes js assets with uni-app-x options', async () => {
    const asset = createAsset('const a = 1')
    const runtimeSet = new Set(['alpha'])
    const jsHandler = vi.fn(() => ({
      code: 'processed',
      linked: {
        '/project/dist/linked.js': {
          code: 'linked',
        },
      },
    }))
    const applyLinkedResults = vi.fn()
    const createHandlerOptions = vi.fn((filename: string, extra?: CreateJsHandlerOptions) => ({
      filename,
      ...extra,
    }))
    const onUpdate = vi.fn()
    const task = createUniAppXAssetTask(
      'assets/app.js',
      asset,
      '/project/dist',
      {
        cache: createCache(),
        createHandlerOptions,
        debug: vi.fn(),
        jsHandler,
        onUpdate,
        runtimeSet,
        applyLinkedResults,
      },
    )

    await task()

    expect(jsHandler).toHaveBeenCalledWith(
      'const a = 1',
      runtimeSet,
      expect.objectContaining({
        // toAbsoluteOutputPath 使用 path.resolve，Windows 下会带盘符
        filename: path.resolve('/project/dist', 'assets/app.js'),
        uniAppX: true,
      }),
    )
    expect(asset.source).toBe('processed')
    expect(applyLinkedResults).toHaveBeenCalledWith(
      expect.objectContaining({
        // linked 结果中的路径由 jsHandler mock 直接返回，保持原样
        '/project/dist/linked.js': { code: 'linked' },
      }),
    )
    expect(onUpdate).toHaveBeenCalledWith('assets/app.js', 'const a = 1', 'processed')
  })

  it('forwards disabled uni-app-x object options as a boolean to js handler', async () => {
    const asset = createAsset('const a = 1')
    const runtimeSet = new Set(['alpha'])
    const jsHandler = vi.fn(() => ({
      code: 'processed',
    }))
    const createHandlerOptions = vi.fn((filename: string, extra?: CreateJsHandlerOptions) => ({
      filename,
      ...extra,
    }))
    const task = createUniAppXAssetTask(
      'assets/app.js',
      asset,
      '/project/dist',
      {
        cache: createCache(),
        createHandlerOptions,
        debug: vi.fn(),
        jsHandler,
        onUpdate: vi.fn(),
        runtimeSet,
        applyLinkedResults: vi.fn(),
        uniAppX: {
          enabled: false,
        },
      },
    )

    await task()

    expect(jsHandler).toHaveBeenCalledWith(
      'const a = 1',
      runtimeSet,
      expect.objectContaining({
        uniAppX: false,
      }),
    )
  })

  it('injects uni-app-x generated style placeholders from style assets', async () => {
    const asset = createAsset('_cE("view", _uM({ class: "bg-_b_h102938_B w-_b173px_B" }))\n/*GenPagesIndexIndexStyles*/')
    const runtimeSet = new Set(['alpha'])
    const jsHandler = vi.fn((source: string) => ({
      code: source,
    }))
    const task = createUniAppXAssetTask(
      'pages/index/index.uvue.ts',
      asset,
      '/project/dist',
      {
        cache: createCache(),
        createHandlerOptions: vi.fn((filename: string, extra?: CreateJsHandlerOptions) => ({
          filename,
          ...extra,
        })),
        debug: vi.fn(),
        getAssetSource: vi.fn((file: string) => {
          if (file === 'App.uvue.ts') {
            return 'const GenAppStyles = [_uM([["bg-_b_h102938_B", _pS(_uM([["backgroundColor", "rgba(16,41,56,1)"]]))], ["w-_b173px_B", _pS(_uM([["width", 173]]))]])]'
          }
          if (file === 'pages/index/index.uvue') {
            return 'export default {"wtu-a":{"":{"background-color":"rgba(16, 41, 56, 1)"}}}'
          }
        }),
        jsHandler,
        onUpdate: vi.fn(),
        runtimeSet,
        applyLinkedResults: vi.fn(),
      },
    )

    await task()

    expect(asset.source).toContain('const GenPagesIndexIndexStyles = [_uM([["bg-_b_h102938_B", _pS(_uM([["backgroundColor", "rgba(16,41,56,1)"]]))], ["w-_b173px_B", _pS(_uM([["width", 173]]))]])]')
    expect(asset.source).not.toContain('/*GenPagesIndexIndexStyles*/')
  })
})
