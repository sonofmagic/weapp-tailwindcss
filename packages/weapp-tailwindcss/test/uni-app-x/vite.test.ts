import type { OutputAsset } from 'rollup'
import type { HmrContext, Plugin, ResolvedConfig, TransformResult } from 'vite'
import type { CreateJsHandlerOptions } from '@/types'
import { describe, expect, it, vi } from 'vitest'
import { createCache } from '@/cache'
import { createUniAppXAssetTask, createUniAppXPlugins } from '@/uni-app-x/vite'

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
      appType: 'uni-app',
      customAttributesEntities: [],
      disabledDefaultTemplateHandler: false,
      isIosPlatform: true,
      mainCssChunkMatcher: vi.fn(() => true),
      runtimeState: { patchPromise: Promise.resolve() },
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
        postcssOptions: expect.objectContaining({
          options: expect.objectContaining({
            from: '/foo.css',
            map: expect.objectContaining({ sourcesContent: true }),
          }),
        }),
      }),
    )
    expect(result?.code).toBe('css:body { color: red; }')
    expect((result?.map as any)?.sources).toContain('/foo.css')
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
        appType: 'uni-app',
        customAttributesEntities: [],
        disabledDefaultTemplateHandler: false,
        isIosPlatform: true,
        mainCssChunkMatcher: vi.fn(() => true),
        runtimeState: { patchPromise: Promise.resolve() },
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
      expect(result?.code).toBe('css:body { color: red; }')
      expect((result?.map as any)?.sources).toContain('/pages/index/index.uvue')
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
      appType: 'uni-app',
      customAttributesEntities: [],
      disabledDefaultTemplateHandler: false,
      isIosPlatform: false,
      mainCssChunkMatcher: vi.fn(() => true),
      runtimeState: { patchPromise: Promise.resolve() },
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
  })

  it('runs nvue transform with runtime set and custom options', async () => {
    const runtimeSet = new Set(['alpha'])
    const ensureRuntimeClassSet = vi.fn(async () => runtimeSet)
    const jsHandler = vi.fn()
    const customAttributesEntities = [['*', ['foo']]]
    let currentConfig: ResolvedConfig = { command: 'serve', build: { watch: false } } as ResolvedConfig
    const plugins = createUniAppXPlugins({
      appType: 'uni-app',
      customAttributesEntities,
      disabledDefaultTemplateHandler: true,
      mainCssChunkMatcher: vi.fn(() => true),
      runtimeState: { patchPromise: Promise.resolve() },
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
        filename: '/project/dist/assets/app.js',
        uniAppX: true,
      }),
    )
    expect(asset.source).toBe('processed')
    expect(applyLinkedResults).toHaveBeenCalledWith(
      expect.objectContaining({
        '/project/dist/linked.js': { code: 'linked' },
      }),
    )
    expect(onUpdate).toHaveBeenCalledWith('assets/app.js', 'const a = 1', 'processed')
  })
})
