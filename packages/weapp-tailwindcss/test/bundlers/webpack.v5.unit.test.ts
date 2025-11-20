import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnifiedWebpackPluginV5 } from '@/bundlers/webpack/BaseUnifiedPlugin/v5'
import { createCache } from '@/cache'

let currentContext: TestContext
const getCompilerContextMock = vi.fn<(options?: unknown) => TestContext>(() => currentContext)
vi.mock('@/context', () => ({
  getCompilerContext: (options?: unknown) => getCompilerContextMock(options),
}))

class FakeConcatSource {
  constructor(private readonly value: string) {}
  source() {
    return this.value
  }

  toString() {
    return this.value
  }
}

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
}
let existsSyncSpy: ReturnType<typeof vi.spyOn>

function createAssetsFromStore(store: Record<string, string>) {
  return Object.fromEntries(
    Object.keys(store).map(file => [
      file,
      {
        source: () => store[file],
      },
    ]),
  )
}

function createContext(overrides: Partial<TestContext> = {}): TestContext {
  const cache = createCache()
  const runtimeSet = new Set(['beta'])

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
    wxsMatcher: () => false,
    runtimeLoaderPath: '/virtual/weapp-tw-runtime-loader.js',
    ...overrides,
  }
}

describe('bundlers/webpack UnifiedWebpackPluginV5', () => {
  beforeEach(() => {
    currentContext = createContext()
    getCompilerContextMock.mockClear()
    existsSyncSpy = vi.spyOn(fs as any, 'existsSync')
    existsSyncSpy.mockReturnValue(true)
  })

  afterEach(() => {
    existsSyncSpy.mockRestore()
  })

  it('wires runtime loader, processes assets and caches results', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: FakeConcatSource) => {
      currentAssetStore[file] = source.toString()
    })
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1' }],
      hooks: {
        processAssets: {
          tapPromise: (_options: unknown, handler: (assets: Record<string, any>) => Promise<void>) => {
            processAssetsCallbacks.push(handler)
          },
        },
      },
      updateAsset,
      getAsset(file: string) {
        const content = currentAssetStore[file]
        if (content === undefined) {
          return undefined
        }
        return {
          source: {
            source: () => content,
          },
        }
      },
    }
    // const ensureNormalModuleFactory = (compilerHooks: any) => {
    //   compilerHooks.normalModuleFactory = {
    //     tap: vi.fn((_name: string, handler: (factory: any) => void) => {
    //       handler({
    //         hooks: {
    //           beforeResolve: {
    //             tap: vi.fn(),
    //           },
    //         },
    //       })
    //     }),
    //   }
    // }

    const compiler = {
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage'),
        },
        sources: {
          ConcatSource: FakeConcatSource,
        },
        NormalModule: {
          getCompilationHooks: vi.fn(() => ({
            loader: {
              tap: (_name: string, handler: (loaderContext: unknown, module: LoaderModule) => void) => {
                loaderHandler = handler
              },
            },
          })),
        },
      },
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
      },
    }

    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    compiler.hooks.normalModuleFactory = {
      tap: vi.fn(() => {}),
    }

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

    const assetStore = {
      'index.wxml': html,
      'index.js': js,
      'index.css': css,
    }
    currentAssetStore = assetStore
    const assetsRun = createAssetsFromStore(assetStore)
    await processAssetsCallbacks[0](assetsRun)

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

    const updateCalls = updateAsset.mock.calls
    expect(updateCalls[0][0]).toBe('index.wxml')
    expect(updateCalls[1][0]).toBe('index.js')
    expect(updateCalls[2][0]).toBe('index.css')
    expect(updateCalls[0][1].toString()).toBe(`tpl:${html}`)
    expect(updateCalls[1][1].toString()).toBe(`js:${js}`)
    expect(updateCalls[2][1].toString()).toBe(`css:${css}`)

    expect(currentContext.onEnd).toHaveBeenCalledTimes(1)

    const secondAssetStore = {
      'index.wxml': html,
      'index.js': js,
      'index.css': css,
    }
    currentAssetStore = secondAssetStore
    const assetsSecondRun = createAssetsFromStore(secondAssetStore)
    await processAssetsCallbacks[0](assetsSecondRun)

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.jsHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.onStart).toHaveBeenCalledTimes(2)
    expect(currentContext.onEnd).toHaveBeenCalledTimes(2)
    expect(currentContext.onUpdate).toHaveBeenCalledTimes(3)
    expect(currentContext.twPatcher.getClassSetSync).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
  })

  it('keeps separate cache entries for js and wxs assets', async () => {
    currentContext = createContext({
      wxsMatcher: (file: string) => file.endsWith('.wxs'),
    })
    getCompilerContextMock.mockReturnValue(currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: FakeConcatSource) => {
      currentAssetStore[file] = source.toString()
    })
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1' }],
      hooks: {
        processAssets: {
          tapPromise: (_options: unknown, handler: (assets: Record<string, any>) => Promise<void>) => {
            processAssetsCallbacks.push(handler)
          },
        },
      },
      updateAsset,
      getAsset(file: string) {
        const content = currentAssetStore[file]
        if (content === undefined) {
          return undefined
        }
        return {
          source: {
            source: () => content,
          },
        }
      },
    }
    const compiler = {
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage'),
        },
        sources: {
          ConcatSource: FakeConcatSource,
        },
        NormalModule: {
          getCompilationHooks: vi.fn(() => ({
            loader: {
              tap: vi.fn(),
            },
          })),
        },
      },
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
      },
    }

    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const html = '<view class="foo"></view>'
    const js = 'const foo = 1'
    const wxs = 'module.exports = {}'
    const css = '.foo { color: red; }'

    const assetStore = {
      'index.wxml': html,
      'index.js': js,
      'index.wxs': wxs,
      'index.css': css,
    }
    currentAssetStore = assetStore
    const assetsRun = createAssetsFromStore(assetStore)
    await processAssetsCallbacks[0](assetsRun)

    expect(currentContext.cache.has('index.js')).toBe(true)
    expect(currentContext.cache.has('index.wxs')).toBe(true)

    const assetStoreSecond = {
      'index.wxml': html,
      'index.js': js,
      'index.wxs': wxs,
      'index.css': css,
    }
    currentAssetStore = assetStoreSecond
    const assetsSecondRun = createAssetsFromStore(assetStoreSecond)
    await processAssetsCallbacks[0](assetsSecondRun)

    const jsUpdates = updateAsset.mock.calls.filter(call => call[0] === 'index.js')
    const wxsUpdates = updateAsset.mock.calls.filter(call => call[0] === 'index.wxs')

    expect(jsUpdates).toHaveLength(2)
    expect(wxsUpdates).toHaveLength(2)
    expect(jsUpdates[0][1].toString()).toBe(`js:${js}`)
    expect(jsUpdates[1][1].toString()).toBe(`js:${js}`)
    expect(wxsUpdates[0][1].toString()).toBe(`js:${wxs}`)
    expect(wxsUpdates[1][1].toString()).toBe(`js:${wxs}`)
  })

  it('propagates linked js asset updates', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const outDir = path.resolve(process.cwd(), 'dist')
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: FakeConcatSource) => {
      currentAssetStore[file] = source.toString()
    })
    const compilation = {
      compiler: { outputPath: outDir },
      chunks: [{ id: 'main', hash: 'hash-1' }],
      hooks: {
        processAssets: {
          tapPromise: (_options: unknown, handler: (assets: Record<string, any>) => Promise<void>) => {
            processAssetsCallbacks.push(handler)
          },
        },
      },
      updateAsset,
      getAsset(file: string) {
        const content = currentAssetStore[file]
        if (content === undefined) {
          return undefined
        }
        return {
          source: {
            source: () => content,
          },
        }
      },
    }
    const compiler = {
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage'),
        },
        sources: {
          ConcatSource: FakeConcatSource,
        },
        NormalModule: {
          getCompilationHooks: vi.fn(() => ({
            loader: {
              tap: vi.fn(),
            },
          })),
        },
      },
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
          tap: (_name: string, handler: (compilationParam: any) => void) => {
            handler(compilation)
          },
        },
      },
    }

    currentContext = createContext({
      jsHandler: vi.fn(async (code: string, _runtime: Set<string>, options?: { filename?: string }) => {
        if (options?.filename?.endsWith('index.js')) {
          return {
            code: `js:${code}`,
            linked: {
              [path.resolve(outDir, 'chunk.js')]: { code: 'linked:chunk' },
            },
          }
        }
        return { code }
      }),
    })
    getCompilerContextMock.mockReturnValue(currentContext)

    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const assetStore = {
      'index.js': 'import "./chunk.js";',
      'chunk.js': 'export const foo = 1;',
    }
    currentAssetStore = assetStore
    const assetsRun = createAssetsFromStore(assetStore)
    await processAssetsCallbacks[0](assetsRun)

    expect(currentContext.jsHandler).toHaveBeenCalledTimes(2)
    const chunkUpdate = updateAsset.mock.calls.find(([file]) => file === 'chunk.js')
    expect(chunkUpdate?.[1].toString()).toBe('linked:chunk')
    const onUpdateCalls = currentContext.onUpdate.mock.calls.filter(([file]) => file === 'chunk.js')
    expect(onUpdateCalls.some(([, , updated]) => updated === 'linked:chunk')).toBe(true)

    const [firstCall] = currentContext.jsHandler.mock.calls
    const options = firstCall?.[2]
    expect(options?.moduleGraph?.resolve?.('./chunk.js', options.filename ?? '')).toBe(path.resolve(outDir, 'chunk.js'))
  })

  it('only applies css import rewrite for tailwindcss v4 projects', () => {
    const normalModuleFactoryTap = vi.fn()
    const compiler = {
      webpack: {
        Compilation: { PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage') },
        sources: { ConcatSource: FakeConcatSource },
        NormalModule: {
          getCompilationHooks: vi.fn(() => ({
            loader: {
              tap: vi.fn(),
            },
          })),
        },
      },
      hooks: {
        normalModuleFactory: { tap: normalModuleFactoryTap },
        compilation: { tap: vi.fn() },
        emit: { tapPromise: vi.fn() },
      },
    }

    const ctxV4 = createContext()
    ctxV4.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementationOnce(() => ctxV4)
    let plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)
    expect(normalModuleFactoryTap).toHaveBeenCalledTimes(1)

    normalModuleFactoryTap.mockClear()
    const ctxV3 = createContext()
    ctxV3.twPatcher.majorVersion = 3
    getCompilerContextMock.mockImplementationOnce(() => ctxV3)
    plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)
    expect(normalModuleFactoryTap).not.toHaveBeenCalled()
  })
})
