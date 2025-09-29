import type { OutputAsset, OutputChunk } from 'rollup'
import type { Plugin, ResolvedConfig, TransformResult } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UnifiedViteWeappTailwindcssPlugin } from '@/bundlers/vite'
import { createCache } from '@/cache'

const postcssHtmlTransformMock = vi.hoisted(() => vi.fn(() => ({ postcssPlugin: 'mocked-html-transform' }))) as ReturnType<typeof vi.fn>
vi.mock('@weapp-tailwindcss/postcss/html-transform', () => ({
  default: postcssHtmlTransformMock,
}))

const transformUVueMock = vi.hoisted(() => vi.fn((code: string, id: string) => ({ code: `uvue:${id}:${code}` }))) as ReturnType<typeof vi.fn>
vi.mock('@/uni-app-x', () => ({
  transformUVue: transformUVueMock,
}))

const getCompilerContextMock = vi.fn(() => currentContext)
vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

type InternalContext = ReturnType<typeof createContext>

let currentContext: InternalContext

function createContext(overrides: Partial<InternalContext> = {}) {
  const cache = createCache()
  const runtimeSet = new Set(['alpha'])

  return {
    disabled: false,
    onLoad: vi.fn(),
    onStart: vi.fn(),
    onEnd: vi.fn(),
    onUpdate: vi.fn(),
    templateHandler: vi.fn(async (code: string) => `tpl:${code}`),
    styleHandler: vi.fn(async (code: string) => ({
      css: `css:${code}`,
      map: {
        toJSON: () => ({
          version: 3,
          file: 'style.css',
          sources: ['style.css'],
          names: [],
          mappings: 'AAAA',
          sourcesContent: [code],
        }),
      },
    })),
    jsHandler: vi.fn(async (code: string) => ({ code: `js:${code}` })),
    mainCssChunkMatcher: vi.fn(() => true),
    appType: 'uni-app',
    setMangleRuntimeSet: vi.fn(),
    cache,
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
    twPatcher: {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      majorVersion: 3,
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
    },
    uniAppX: undefined as any,
    runtimeLoaderPath: undefined,
    mainChunkRegex: undefined,
    cssEntries: undefined,
    customReplaceDictionary: undefined,
    ...overrides,
  }
}

function createRollupAsset(source: string): OutputAsset {
  return {
    type: 'asset',
    fileName: 'index.wxml',
    name: undefined,
    source,
    needsCodeReference: false,
  }
}

function createRollupChunk(code: string): OutputChunk {
  return {
    type: 'chunk',
    fileName: 'index.js',
    name: 'index',
    code,
    map: null,
    facadeModuleId: null,
    moduleIds: [],
    modules: {},
    imports: [],
    exports: [],
    dynamicImports: [],
    implicitlyLoadedBefore: [],
    importedBindings: {},
    isEntry: true,
    isDynamicEntry: false,
    referencedFiles: [],
  }
}

describe('bundlers/vite UnifiedViteWeappTailwindcssPlugin', () => {
  beforeEach(() => {
    currentContext = createContext()
    getCompilerContextMock.mockClear()
    postcssHtmlTransformMock.mockClear()
    transformUVueMock.mockClear()
  })

  it('generates bundle assets and leverages cache', async () => {
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins).toBeDefined()
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin
    expect(postPlugin).toBeTruthy()
    expect(currentContext.onLoad).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.patch).toHaveBeenCalledTimes(1)

    const config = {
      css: {
        postcss: {
          plugins: [
            { postcssPlugin: 'postcss-html-transform' },
            { postcssPlugin: 'other' },
          ],
        },
      },
    } as unknown as ResolvedConfig

    postPlugin.configResolved?.(config)
    expect(postcssHtmlTransformMock).toHaveBeenCalledTimes(1)
    expect(config.css?.postcss?.plugins?.[0]).toEqual({ postcssPlugin: 'mocked-html-transform' })

    const html = '<view class="foo">bar</view>'
    const js = 'const demo = 1'
    const css = '.foo { color: red; }'

    const bundle = {
      'index.wxml': createRollupAsset(html),
      'index.js': createRollupChunk(js),
      'index.css': {
        ...createRollupAsset(css),
        fileName: 'index.css',
      },
    }

    await postPlugin.generateBundle?.({} as any, bundle)

    expect(currentContext.onStart).toHaveBeenCalledTimes(1)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(1)
    expect(currentContext.setMangleRuntimeSet).toHaveBeenCalledTimes(1)
    expect([...currentContext.setMangleRuntimeSet.mock.calls[0][0]]).toEqual(['alpha'])

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect((bundle['index.wxml'] as OutputAsset).source).toBe(`tpl:${html}`)

    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect((bundle['index.js'] as OutputChunk).code).toBe(`js:${js}`)

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect((bundle['index.css'] as OutputAsset).source).toBe(`css:${css}`)

    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)

    const bundleSecondRun = {
      'index.wxml': createRollupAsset(html),
      'index.js': createRollupChunk(js),
      'index.css': {
        ...createRollupAsset(css),
        fileName: 'index.css',
      },
    }

    await postPlugin.generateBundle?.({} as any, bundleSecondRun)

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.setMangleRuntimeSet).toHaveBeenCalledTimes(2)
    expect(currentContext.onStart).toHaveBeenCalledTimes(2)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(2)
    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)
  })

  it('returns undefined when disabled', () => {
    currentContext = createContext({ disabled: true })
    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins).toBeUndefined()
    expect(currentContext.twPatcher.patch).not.toHaveBeenCalled()
  })

  it('provides uni-app-x specific transforms', async () => {
    const runtimeSet = new Set(['uvue'])
    currentContext = createContext()
    currentContext.uniAppX = { enabled: true }
    currentContext.twPatcher = {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 4,
    }
    currentContext.setMangleRuntimeSet = vi.fn()
    currentContext.onStart = vi.fn()
    currentContext.onEnd = vi.fn()

    const plugins = UnifiedViteWeappTailwindcssPlugin()
    expect(plugins).toBeDefined()
    const cssPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:css') as Plugin
    const cssPrePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:css:pre') as Plugin
    const nvuePlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin
    const postPlugin = plugins?.find(plugin => plugin.name === 'weapp-tailwindcss:adaptor:post') as Plugin

    expect(cssPlugin?.transform).toBeTypeOf('function')
    expect(cssPrePlugin?.transform).toBeTypeOf('function')
    expect(nvuePlugin?.transform).toBeTypeOf('function')

    const cssResult = await cssPlugin.transform?.('.foo { color: red; }', 'App.uvue?vue&type=style&index=0') as TransformResult
    expect(cssResult?.code).toBe('css:.foo { color: red; }')
    expect(cssResult?.map).toBeTruthy()

    await nvuePlugin.buildStart?.()
    const nvueResult = nvuePlugin.transform?.('console.log("x")', 'App.nvue')
    expect(transformUVueMock).toHaveBeenCalledWith('console.log("x")', 'App.nvue', currentContext.jsHandler, runtimeSet)
    expect(nvueResult).toEqual({ code: 'uvue:App.nvue:console.log("x")' })

    const bundle = {
      'index.js': createRollupChunk('const answer = 42'),
      'index.asset.js': {
        type: 'asset',
        fileName: 'index.js',
        source: 'console.log("asset")',
        name: undefined,
        needsCodeReference: false,
      } satisfies OutputAsset,
    }

    await postPlugin.generateBundle?.({} as any, bundle)

    expect(currentContext.jsHandler).toHaveBeenCalledWith('const answer = 42', runtimeSet)
    expect((bundle['index.js'] as OutputChunk).code).toBe('js:const answer = 42')
    expect(currentContext.jsHandler).toHaveBeenCalledWith('console.log("asset")', runtimeSet, {
      babelParserOptions: {
        plugins: ['typescript'],
        sourceType: 'unambiguous',
      },
      uniAppX: currentContext.uniAppX,
    })
    expect((bundle['index.asset.js'] as OutputAsset).source).toBe('js:console.log("asset")')
  })
})
