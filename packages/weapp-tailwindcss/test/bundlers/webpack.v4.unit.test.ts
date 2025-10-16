import fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnifiedWebpackPluginV4 } from '@/bundlers/webpack/BaseUnifiedPlugin/v4'
import { createCache } from '@/cache'

interface LoaderModule {
  loaders: Array<{ loader: string }>
}

interface TestContext {
  disabled: boolean
  onLoad: ReturnType<typeof vi.fn>
  onStart: ReturnType<typeof vi.fn>
  onEnd: ReturnType<typeof vi.fn>
  onUpdate: ReturnType<typeof vi.fn>
  templateHandler: ReturnType<typeof vi.fn>
  styleHandler: ReturnType<typeof vi.fn>
  jsHandler: ReturnType<typeof vi.fn>
  setMangleRuntimeSet: ReturnType<typeof vi.fn>
  cache: ReturnType<typeof createCache>
  twPatcher: {
    patch: ReturnType<typeof vi.fn>
    getClassSet: ReturnType<typeof vi.fn>
    majorVersion: number
  }
  mainCssChunkMatcher: ReturnType<typeof vi.fn>
  cssMatcher: (file: string) => boolean
  htmlMatcher: (file: string) => boolean
  jsMatcher: (file: string) => boolean
  wxsMatcher: (file: string) => boolean
  runtimeLoaderPath: string
}

let currentContext: TestContext
const getCompilerContextMock = vi.fn<(options?: unknown) => TestContext>(() => currentContext)
vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

let existsSyncSpy: ReturnType<typeof vi.spyOn>

function createContext(overrides: Partial<TestContext> = {}): TestContext {
  const cache = createCache()
  const runtimeSet = new Set(['gamma'])

  return {
    disabled: false,
    onLoad: vi.fn(),
    onStart: vi.fn(),
    onEnd: vi.fn(),
    onUpdate: vi.fn(),
    templateHandler: vi.fn(async (code: string) => `tpl:${code}`),
    styleHandler: vi.fn(async (code: string) => ({ css: `css:${code}` })),
    jsHandler: vi.fn(async (code: string) => ({ code: `js:${code}` })),
    setMangleRuntimeSet: vi.fn(),
    cache,
    twPatcher: {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      majorVersion: 3,
    },
    mainCssChunkMatcher: vi.fn(() => true),
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
    runtimeLoaderPath: '/virtual/weapp-tw-runtime-loader.js',
    ...overrides,
  }
}

describe('bundlers/webpack UnifiedWebpackPluginV4', () => {
  beforeEach(() => {
    currentContext = createContext()
    getCompilerContextMock.mockReset()
    getCompilerContextMock.mockImplementation(() => currentContext)
    existsSyncSpy = vi.spyOn(fs as unknown as Record<string, unknown>, 'existsSync')
    existsSyncSpy.mockReturnValue(true)
  })

  afterEach(() => {
    existsSyncSpy.mockRestore()
  })

  it('hooks emit, processes assets and reuses cache', async () => {
    const emitHandlers: Array<(compilation: any) => Promise<void>> = []
    let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined

    const assets: Record<string, any> = {}
    const compilation = {
      chunks: [{ id: 'main', hash: 'hash-1' }],
      hooks: {
        normalModuleLoader: {
          tap: (_name: string, handler: (loaderContext: any, module: LoaderModule) => void) => {
            loaderHandler = handler
          },
        },
      },
      assets,
      updateAsset: vi.fn((file: string, source: any) => {
        assets[file] = source
      }),
    }

    const compiler = {
      hooks: {
        compilation: {
          tap: (_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          },
        },
        emit: {
          tapPromise: (_name: string, handler: (_compilation: any) => Promise<void>) => {
            emitHandlers.push(handler)
          },
        },
      },
    }

    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    expect(getCompilerContextMock).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.patch).toHaveBeenCalledTimes(1)
    expect(currentContext.onLoad).toHaveBeenCalledTimes(1)

    const module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    loaderHandler?.({}, module)
    expect(module.loaders[0].loader).toBe(currentContext.runtimeLoaderPath)

    const html = '<view class="foo"></view>'
    const js = 'const foo = 1'
    const css = '.foo { color: red; }'

    compilation.assets = {
      'index.wxml': { source: () => html },
      'index.js': { source: () => js },
      'index.css': { source: () => css },
    }

    await emitHandlers[0](compilation)

    expect(currentContext.onStart).toHaveBeenCalledTimes(1)
    expect(currentContext.setMangleRuntimeSet).toHaveBeenCalledTimes(1)
    expect([...currentContext.setMangleRuntimeSet.mock.calls[0][0]]).toEqual(['gamma'])
    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)
    expect(currentContext.cache.has('index.wxml')).toBe(true)
    expect(currentContext.cache.has('index.js')).toBe(true)
    expect(currentContext.cache.has('index.css')).toBe(true)

    const updateCalls = compilation.updateAsset.mock.calls
    expect(updateCalls[0][0]).toBe('index.wxml')
    expect(updateCalls[1][0]).toBe('index.js')
    expect(updateCalls[2][0]).toBe('index.css')
    expect(updateCalls[0][1].source()).toBe(`tpl:${html}`)
    expect(updateCalls[1][1].source()).toBe(`js:${js}`)
    expect(updateCalls[2][1].source()).toBe(`css:${css}`)

    expect(currentContext.onEnd).toHaveBeenCalledTimes(1)

    compilation.assets = {
      'index.wxml': { source: () => html },
      'index.js': { source: () => js },
      'index.css': { source: () => css },
    }

    await emitHandlers[0](compilation)

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.setMangleRuntimeSet).toHaveBeenCalledTimes(2)
    expect(currentContext.onStart).toHaveBeenCalledTimes(2)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(2)
    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)
  })

  it('keeps distinct cache entries for js and wxs assets', async () => {
    currentContext = createContext({
      wxsMatcher: (file: string) => file.endsWith('.wxs'),
    })
    getCompilerContextMock.mockImplementation(() => currentContext)

    const emitHandlers: Array<(compilation: any) => Promise<void>> = []
    let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined

    const assets: Record<string, any> = {}
    const compilation: any = {
      chunks: [{ id: 'main', hash: 'hash-1' }],
      hooks: {
        normalModuleLoader: {
          tap: (_name: string, handler: (loaderContext: any, module: LoaderModule) => void) => {
            loaderHandler = handler
          },
        },
      },
      assets,
      updateAsset: vi.fn((file: string, source: any) => {
        assets[file] = source
      }),
    }

    const compiler = {
      hooks: {
        compilation: {
          tap: (_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          },
        },
        emit: {
          tapPromise: (_name: string, handler: (_compilation: any) => Promise<void>) => {
            emitHandlers.push(handler)
          },
        },
      },
    }

    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    loaderHandler?.({}, module)

    const html = '<view class="foo"></view>'
    const js = 'const foo = 1'
    const wxs = 'module.exports = {}'
    const css = '.foo { color: red; }'

    compilation.assets = {
      'index.wxml': { source: () => html },
      'index.js': { source: () => js },
      'index.wxs': { source: () => wxs },
      'index.css': { source: () => css },
    }

    await emitHandlers[0](compilation)

    expect(currentContext.cache.has('index.js')).toBe(true)
    expect(currentContext.cache.has('index.wxs')).toBe(true)

    compilation.assets = {
      'index.wxml': { source: () => html },
      'index.js': { source: () => js },
      'index.wxs': { source: () => wxs },
      'index.css': { source: () => css },
    }

    await emitHandlers[0](compilation)

    const jsUpdates = compilation.updateAsset.mock.calls.filter((call: [string, any]) => call[0] === 'index.js')
    const wxsUpdates = compilation.updateAsset.mock.calls.filter((call: [string, any]) => call[0] === 'index.wxs')

    expect(jsUpdates).toHaveLength(2)
    expect(wxsUpdates).toHaveLength(2)
    expect(jsUpdates[0][1].source()).toBe(`js:${js}`)
    expect(jsUpdates[1][1].source()).toBe(`js:${js}`)
    expect(wxsUpdates[0][1].source()).toBe(`js:${wxs}`)
    expect(wxsUpdates[1][1].source()).toBe(`js:${wxs}`)
  })
})
