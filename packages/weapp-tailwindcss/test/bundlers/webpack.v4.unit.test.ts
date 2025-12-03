import fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnifiedWebpackPluginV4 } from '@/bundlers/webpack/BaseUnifiedPlugin/v4'
import { createCache } from '@/cache'

interface LoaderModule {
  loaders: Array<{ loader: string, options?: Record<string, any> }>
  resource?: string
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
  cache: ReturnType<typeof createCache>
  twPatcher: {
    patch: ReturnType<typeof vi.fn>
    getClassSet: ReturnType<typeof vi.fn>
    getClassSetSync: ReturnType<typeof vi.fn>
    extract: ReturnType<typeof vi.fn>
    majorVersion: number
  }
  mainCssChunkMatcher: ReturnType<typeof vi.fn>
  cssMatcher: (file: string) => boolean
  htmlMatcher: (file: string) => boolean
  jsMatcher: (file: string) => boolean
  wxsMatcher: (file: string) => boolean
  runtimeLoaderPath: string
  runtimeCssImportRewriteLoaderPath: string
  appType?: string
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
    cache,
    twPatcher: {
      patch: vi.fn(),
      getClassSet: vi.fn(async () => runtimeSet),
      getClassSetSync: vi.fn(() => runtimeSet),
      extract: vi.fn(async () => ({ classSet: runtimeSet })),
      majorVersion: 3,
    },
    mainCssChunkMatcher: vi.fn(() => true),
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: (_file: string) => false,
    runtimeLoaderPath: '/virtual/weapp-tw-runtime-classset-loader.js',
    runtimeCssImportRewriteLoaderPath: '/virtual/weapp-tw-css-import-rewrite-loader.js',
    appType: overrides.appType,
    ...overrides,
  }
}

function createCompilerWithLoaderTracking() {
  let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
  const compilation = {
    chunks: [],
    hooks: {
      normalModuleLoader: {
        tap: (_name: string, handler: (loaderContext: any, module: LoaderModule) => void) => {
          loaderHandler = handler
        },
      },
    },
    assets: {},
    updateAsset: vi.fn(),
  }

  const compiler = {
    hooks: {
      normalModuleFactory: {
        tap: vi.fn((_name: string, handler: (factory: any) => void) => {
          handler({
            hooks: {
              beforeResolve: {
                tap: vi.fn(),
              },
            },
          })
        }),
      },
      compilation: {
        tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
          handler(compilation)
        }),
      },
      emit: {
        tapPromise: vi.fn(),
      },
    },
  }

  return {
    compiler,
    getLoaderHandler: () => loaderHandler,
  }
}

describe('bundlers/webpack UnifiedWebpackPluginV4', () => {
  beforeEach(() => {
    currentContext = createContext()
    getCompilerContextMock.mockReset()
    getCompilerContextMock.mockImplementation(() => currentContext)
    existsSyncSpy = vi.spyOn(fs as any, 'existsSync')
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
        normalModuleFactory: {
          tap: (_name: string, handler: (factory: any) => void) => {
            handler({
              hooks: {
                beforeResolve: {
                  tap: vi.fn(),
                },
              },
            })
          },
        },
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
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    expect(classSetLoaderEntry?.options?.rewriteCssImports).toBeUndefined()
    const rewriteLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeCssImportRewriteLoaderPath)
    expect(rewriteLoaderEntry).toBeUndefined()

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
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
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
    expect(currentContext.onStart).toHaveBeenCalledTimes(2)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(2)
    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
  })

  it('forwards rewriteCssImports options when tailwindcss v4 detected', () => {
    let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
    const compilation = {
      chunks: [],
      hooks: {
        normalModuleLoader: {
          tap: (_name: string, handler: (loaderContext: any, module: LoaderModule) => void) => {
            loaderHandler = handler
          },
        },
      },
      assets: {},
      updateAsset: vi.fn(),
    }
    const compiler = {
      hooks: {
        normalModuleFactory: {
          tap: (_name: string, handler: (factory: any) => void) => {
            handler({
              hooks: {
                beforeResolve: {
                  tap: vi.fn(),
                },
              },
            })
          },
        },
        compilation: {
          tap: (_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          },
        },
        emit: {
          tapPromise: vi.fn(),
        },
      },
    }

    currentContext.twPatcher.majorVersion = 4
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    loaderHandler?.({}, module)
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    const rewriteLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeCssImportRewriteLoaderPath)
    expect(classSetLoaderEntry).toBeDefined()
    expect(rewriteLoaderEntry).toBeDefined()
    expect(rewriteLoaderEntry?.options?.rewriteCssImports?.pkgDir).toEqual(expect.any(String))
    const classSetIndex = module.loaders.indexOf(classSetLoaderEntry!)
    const postcssIndex = module.loaders.findIndex(entry => entry.loader.includes('postcss-loader'))
    const rewriteIndex = module.loaders.indexOf(rewriteLoaderEntry!)
    expect(classSetIndex).toBeLessThan(postcssIndex)
    expect(rewriteIndex).toBeGreaterThan(postcssIndex)
  })

  it('uses mpx style compiler loader as anchor when appType is mpx', () => {
    currentContext = createContext({ appType: 'mpx' })
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [{ loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/index.js??ruleSet[0]' }],
    }

    handler?.({}, module)

    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    expect(classSetLoaderEntry).toBeDefined()
    const anchorIndex = module.loaders.findIndex(entry =>
      entry.loader.includes('@mpxjs/webpack-plugin/lib/style-compiler/index'),
    )
    expect(anchorIndex).toBeGreaterThanOrEqual(0)
    const classSetIndex = module.loaders.indexOf(classSetLoaderEntry!)
    expect(classSetIndex).toBeLessThan(anchorIndex)
  })

  it('inserts rewrite loader after style compiler for mpx modules', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader.js??ruleSet[0]' },
        { loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/index.js??ruleSet[0]' },
      ],
    }

    handler?.({}, module)

    const styleIndex = module.loaders.findIndex(entry =>
      entry.loader.includes('@mpxjs/webpack-plugin/lib/style-compiler/index'),
    )
    const rewriteIndex = module.loaders.findIndex(entry =>
      entry.loader === currentContext.runtimeCssImportRewriteLoaderPath,
    )
    expect(styleIndex).toBeGreaterThanOrEqual(0)
    expect(rewriteIndex).toBeGreaterThan(styleIndex)
  })

  it('falls back to strip-conditional loader when style compiler anchor is missing', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [{ loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader.js??ruleSet[0]' }],
    }

    handler?.({}, module)

    const stripIndex = module.loaders.findIndex(entry =>
      entry.loader.includes('@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader'),
    )
    const rewriteIndex = module.loaders.findIndex(entry =>
      entry.loader === currentContext.runtimeCssImportRewriteLoaderPath,
    )
    expect(stripIndex).toBeGreaterThanOrEqual(0)
    expect(rewriteIndex).toBeGreaterThan(stripIndex)
  })

  it('falls back to css matcher when anchor is missing', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [],
      resource: '/abs/src/app.css',
    } as any

    handler?.({}, module)

    const rewriteLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeCssImportRewriteLoaderPath)
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    expect(rewriteLoaderEntry).toBeDefined()
    expect(classSetLoaderEntry).toBeDefined()
    const lastIndex = module.loaders.length - 1
    expect(module.loaders[lastIndex]).toBe(rewriteLoaderEntry)
    expect(module.loaders[0]).toBe(classSetLoaderEntry)
  })

  it('treats css resources with query parameters as css modules', () => {
    currentContext = createContext()
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [],
      resource: '/abs/app.css?type=styles',
    }

    handler?.({}, module)

    const rewriteLoaderEntry = module.loaders.find(entry => entry.loader.includes(currentContext.runtimeCssImportRewriteLoaderPath))
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader.includes(currentContext.runtimeLoaderPath))
    expect(rewriteLoaderEntry).toBeDefined()
    expect(classSetLoaderEntry).toBeDefined()
  })

  it('detects mpx style blocks via resource query when anchors missing', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [],
      resource: '/abs/pages/index.mpx?type=styles&lang=css',
    }

    handler?.({}, module)
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader.includes(currentContext.runtimeLoaderPath))
    expect(classSetLoaderEntry).toBeDefined()
  })

  it('skips inserting duplicate rewrite loaders when already present', () => {
    currentContext = createContext()
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: `${currentContext.runtimeCssImportRewriteLoaderPath}??ruleSet[0]` },
      ],
      resource: '/abs/app.css',
    }

    handler?.({}, module)
    const rewriteLoaders = module.loaders.filter(entry => entry.loader.includes(currentContext.runtimeCssImportRewriteLoaderPath))
    expect(rewriteLoaders).toHaveLength(1)
  })

  it('does not attach runtime loader when postcss loader is missing', () => {
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [{ loader: '/path/css-loader.js' }],
    }

    handler?.({}, module)

    expect(module.loaders).toHaveLength(1)
    expect(module.loaders[0].loader).toBe('/path/css-loader.js')
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
        normalModuleFactory: {
          tap: (_name: string, handler: (factory: any) => void) => {
            handler({
              hooks: {
                beforeResolve: {
                  tap: vi.fn(),
                },
              },
            })
          },
        },
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

  it('only applies css import rewrite for tailwindcss v4 projects', () => {
    const normalModuleFactoryTap = vi.fn()
    const compiler = {
      hooks: {
        normalModuleFactory: { tap: normalModuleFactoryTap },
        compilation: { tap: vi.fn() },
        emit: { tapPromise: vi.fn() },
      },
    }

    currentContext.twPatcher.majorVersion = 4
    let plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)
    expect(normalModuleFactoryTap).toHaveBeenCalledTimes(1)

    normalModuleFactoryTap.mockClear()
    currentContext = createContext()
    currentContext.twPatcher.majorVersion = 3
    getCompilerContextMock.mockImplementation(() => currentContext)
    plugin = new UnifiedWebpackPluginV4()
    plugin.apply(compiler as any)
    expect(normalModuleFactoryTap).not.toHaveBeenCalled()
  })
})
