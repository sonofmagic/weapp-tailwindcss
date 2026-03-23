import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UnifiedWebpackPluginV5 } from '@/bundlers/webpack/BaseUnifiedPlugin/v5'
import { createCache } from '@/cache'
import { createJsHandler } from '@/js'
import { replaceWxml } from '@/wxml'

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
  loaders: Array<{ loader: string, options?: Record<string, any> }>
  resource?: string
}

interface TestContext {
  disabled: boolean
  onLoad: ReturnType<typeof vi.fn>
  onStart: ReturnType<typeof vi.fn>
  onEnd: ReturnType<typeof vi.fn>
  onUpdate: ReturnType<typeof vi.fn>
  refreshTailwindcssPatcher: ReturnType<typeof vi.fn>
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
  staleClassNameFallback?: boolean
  appType?: string
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
    refreshTailwindcssPatcher: vi.fn(async () => currentContext.twPatcher),
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
    staleClassNameFallback: undefined,
    appType: overrides.appType,
    ...overrides,
  }
}

function createCompilerWithLoaderTracking() {
  let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
  const compilation = {
    compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
    chunks: [],
    hooks: {
      processAssets: {
        tapPromise: vi.fn(),
      },
    },
    updateAsset: vi.fn(),
    getAsset: vi.fn(),
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
            tap: (_name: string, handler: (loaderContext: any, module: LoaderModule) => void) => {
              loaderHandler = handler
            },
          },
        })),
      },
    },
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
    },
  }

  return {
    compiler,
    compilation,
    getLoaderHandler: () => loaderHandler,
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
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    expect(classSetLoaderEntry?.options?.rewriteCssImports).toBeUndefined()
    expect(classSetLoaderEntry?.options?.getClassSet).toEqual(expect.any(Function))
    const rewriteLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeCssImportRewriteLoaderPath)
    expect(rewriteLoaderEntry).toBeUndefined()

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
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)
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
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)
  })

  it('refreshes runtime patcher on watch invalidation even without modifiedFiles', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const invalidHandlers: Array<() => void> = []
    const thisCompilationHandlers: Array<(_compilation: any) => void> = []
    let currentAssetStore: Record<string, string> = {}
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
      updateAsset: vi.fn((file: string, source: FakeConcatSource) => {
        currentAssetStore[file] = source.toString()
      }),
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
        invalid: {
          tap: vi.fn((_name: string, handler: () => void) => {
            invalidHandlers.push(handler)
          }),
        },
        thisCompilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            thisCompilationHandlers.push(handler)
            handler(compilation)
          }),
        },
        normalModuleFactory: {
          tap: vi.fn(() => {}),
        },
        compilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          }),
        },
        watchRun: {
          tap: vi.fn(),
        },
      },
    }

    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'index.css': '.foo { color: red; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.refreshTailwindcssPatcher).not.toHaveBeenCalled()

    invalidHandlers[0]?.()
    thisCompilationHandlers[0]?.(compilation)

    currentAssetStore = {
      'index.css': '.foo { color: blue; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
  })

  it('reuses css handler override objects for repeated asset updates', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {}
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
      updateAsset: vi.fn((file: string, source: FakeConcatSource) => {
        currentAssetStore[file] = source.toString()
      }),
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
          tap: vi.fn(() => {}),
        },
        compilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          }),
        },
      },
    }

    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'index.css': '.foo { color: red; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    currentAssetStore = {
      'index.css': '.foo { color: blue; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
    expect(currentContext.styleHandler.mock.calls[0]?.[1]).toBe(currentContext.styleHandler.mock.calls[1]?.[1])
  })

  it('does not prune non-main css chunks during v4 runtime processing', async () => {
    currentContext = createContext({
      mainCssChunkMatcher: vi.fn(() => false),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      twPatcher: {
        ...createContext().twPatcher,
        majorVersion: 4,
        options: {
          tailwindcss: {
            v4: {
              cssEntries: ['/virtual/app.css'],
            },
          },
        },
      } as any,
    })

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'index.css': '.tw-watch-style-case { color: red; }',
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'page', hash: 'hash-1', files: ['index.css'] }],
      hooks: {
        processAssets: {
          tapPromise: (_options: unknown, handler: (assets: Record<string, any>) => Promise<void>) => {
            processAssetsCallbacks.push(handler)
          },
        },
      },
      updateAsset: vi.fn((file: string, source: FakeConcatSource) => {
        currentAssetStore[file] = source.toString()
      }),
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
          tap: vi.fn(() => {}),
        },
        compilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          }),
        },
      },
    }

    new UnifiedWebpackPluginV5().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['index.css']).toContain('.tw-watch-style-case')
  })

  it('keeps authored css rules and stale runtime selectors in main chunks', async () => {
    const runtimeSet = new Set(['bg-red-500'])
    const authoredCss = [
      '.tw-page-style-watch-anchor { color: red; }',
      'page,.tw-root,wx-root-portal-content,:host { --test-root: 1; }',
    ].join('\n')
    const staleRuntimeCss = '._b_hstale_B { color: blue; }'
    currentContext = createContext({
      mainCssChunkMatcher: vi.fn(() => true),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      twPatcher: {
        ...createContext().twPatcher,
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
        options: {
          tailwindcss: {
            v4: {
              cssEntries: ['/virtual/app.css'],
            },
          },
        },
      } as any,
    })

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'app.wxss': `${authoredCss}\n${staleRuntimeCss}`,
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'app', hash: 'hash-authored', files: ['app.wxss'] }],
      hooks: {
        processAssets: {
          tapPromise: (_options: unknown, handler: (assets: Record<string, any>) => Promise<void>) => {
            processAssetsCallbacks.push(handler)
          },
        },
      },
      updateAsset: vi.fn((file: string, source: FakeConcatSource) => {
        currentAssetStore[file] = source.toString()
      }),
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
          tap: vi.fn(() => {}),
        },
        compilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          }),
        },
      },
    }

    new UnifiedWebpackPluginV5().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['app.wxss']).toContain('.tw-page-style-watch-anchor')
    expect(currentAssetStore['app.wxss']).toContain('.tw-root')
    expect(currentAssetStore['app.wxss']).toContain('wx-root-portal-content')
    expect(currentAssetStore['app.wxss']).toContain(staleRuntimeCss)
  })

  it('reuses template handler options for multiple html assets in one compilation', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {}
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
      updateAsset: vi.fn((file: string, source: FakeConcatSource) => {
        currentAssetStore[file] = source.toString()
      }),
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
          tap: vi.fn(() => {}),
        },
        compilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          }),
        },
      },
    }

    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'pages/index/index.wxml': '<view class="foo"></view>',
      'pages/home/index.wxml': '<view class="bar"></view>',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(2)
    expect(currentContext.templateHandler.mock.calls[0]?.[1]).toBe(currentContext.templateHandler.mock.calls[1]?.[1])
  })

  it('keeps precise matching by default and still escapes classes when runtime set is fresh', async () => {
    const runtimeSet = new Set(['bg-[#f50505]', 'text-[100rpx]', 'text-white'])
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })
    currentContext = createContext({
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    })
    getCompilerContextMock.mockReturnValue(currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: FakeConcatSource) => {
      currentAssetStore[file] = source.toString()
    })
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: ['index.js'] }],
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
      watching: {},
      options: {
        watch: false,
      },
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

    const js = 'const cls = "bg-[#f50505] text-[100rpx] text-white"'
    const assetStore = {
      'index.js': js,
    }
    currentAssetStore = assetStore
    await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

    const transformed = currentAssetStore['index.js']
    expect(transformed).toContain(replaceWxml('bg-[#f50505]'))
    expect(transformed).not.toContain('bg-[#f50505]')
    expect(transformed).toContain(replaceWxml('text-[100rpx]'))

    const lastCall = currentContext.jsHandler.mock.calls.at(-1) as [string, Set<string> | undefined, { staleClassNameFallback?: boolean }]
    expect(lastCall?.[2]?.staleClassNameFallback).toBe(false)
  })

  it('respects explicit stale fallback option when set to false', async () => {
    const runtimeSet = new Set(['text-[100rpx]', 'text-white'])
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })
    currentContext = createContext({
      staleClassNameFallback: false,
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    })
    getCompilerContextMock.mockImplementation(() => currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: any) => {
      const value = source.source()
      currentAssetStore[file] = typeof value === 'string' ? value : value.toString()
    })
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: ['index.js'] }],
      hooks: {
        processAssets: {
          tapPromise: (_options: any, handler: (assets: Record<string, any>) => Promise<void>) => {
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
      watching: {},
      options: {
        watch: false,
      },
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

    const js = 'const cls = "bg-[#f50505] text-[100rpx] text-white"'
    const assetStore = {
      'index.js': js,
    }
    currentAssetStore = assetStore
    await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

    const transformed = currentAssetStore['index.js']
    expect(transformed).toContain('bg-[#f50505]')
    expect(transformed).not.toContain(replaceWxml('bg-[#f50505]'))
    expect(transformed).toContain(replaceWxml('text-[100rpx]'))

    const lastCall = currentContext.jsHandler.mock.calls.at(-1) as [string, Set<string> | undefined, { staleClassNameFallback?: boolean }]
    expect(lastCall?.[2]?.staleClassNameFallback).toBe(false)
  })

  it('refreshes runtime class set on each processAssets so script-only updates stay precisely escaped', async () => {
    let runtimeSet = new Set(['bg-[#f40404]', 'text-[100rpx]', 'text-white'])
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })
    currentContext = createContext({
      staleClassNameFallback: false,
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 4,
      },
    })
    getCompilerContextMock.mockImplementation(() => currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: any) => {
      const value = source.source()
      currentAssetStore[file] = typeof value === 'string' ? value : value.toString()
    })
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: ['index.js'] }],
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

    currentAssetStore = {
      'index.js': 'const cls = "bg-[#f40404] text-[100rpx] text-white"',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))
    const firstPass = currentAssetStore['index.js']
    expect(firstPass).toContain(replaceWxml('bg-[#f40404]'))
    expect(firstPass).not.toContain('bg-[#f40404]')

    runtimeSet = new Set(['bg-[#f0a0a0]', 'text-[100rpx]', 'text-white'])
    compilation.chunks = [{ id: 'main', hash: 'hash-2' }]
    currentAssetStore = {
      'index.js': 'const cls = "bg-[#f0a0a0] text-[100rpx] text-white"',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))
    const secondPass = currentAssetStore['index.js']
    expect(secondPass).toContain(replaceWxml('bg-[#f0a0a0]'))
    expect(secondPass).not.toContain('bg-[#f0a0a0]')
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(2)

    const lastCall = currentContext.jsHandler.mock.calls.at(-1) as [string, Set<string> | undefined, { staleClassNameFallback?: boolean }]
    expect(lastCall?.[2]?.staleClassNameFallback).toBe(false)
  })

  it('forwards rewriteCssImports options when tailwindcss v4 detected', () => {
    let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [],
      hooks: {
        processAssets: {
          tapPromise: vi.fn(),
        },
      },
      updateAsset: vi.fn(),
      getAsset: vi.fn(),
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
              tap: (_name: string, handler: (loaderContext: any, module: LoaderModule) => void) => {
                loaderHandler = handler
              },
            },
          })),
        },
      },
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
      },
    }
    currentContext.twPatcher.majorVersion = 4
    const plugin = new UnifiedWebpackPluginV5()
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
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [{ loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/index.js??ruleSet[1]' }],
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
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader.js??ruleSet[1]' },
        { loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/index.js??ruleSet[1]' },
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
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader.js??ruleSet[1]' },
      ],
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

  it('reorders an existing rewrite loader so it runs before the mpx style compiler', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: currentContext.runtimeCssImportRewriteLoaderPath },
        { loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/index.js??ruleSet[0]' },
      ],
    }

    handler?.({}, module)

    const styleIndex = module.loaders.findIndex(entry => entry.loader?.includes('@mpxjs/webpack-plugin/lib/style-compiler/index'))
    const rewriteIndex = module.loaders.findIndex(entry => entry.loader === currentContext.runtimeCssImportRewriteLoaderPath)
    expect(styleIndex).toBeGreaterThanOrEqual(0)
    expect(rewriteIndex).toBeGreaterThan(styleIndex)
    expect(module.loaders.filter(entry => entry.loader === currentContext.runtimeCssImportRewriteLoaderPath)).toHaveLength(1)
  })

  it('falls back to css matcher when anchor is missing', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
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
    // rewrite should execute before class-set (right-to-left), so rewrite is appended, class-set unshifted.
    const lastIndex = module.loaders.length - 1
    expect(module.loaders[lastIndex]).toBe(rewriteLoaderEntry)
    expect(module.loaders[0]).toBe(classSetLoaderEntry)
  })

  it('treats resources with queries as css modules', () => {
    currentContext = createContext()
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
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

  it('detects mpx style modules via resource query', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [],
      resource: '/abs/src/page.mpx?type=styles&lang=css',
    }

    handler?.({}, module)
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader.includes(currentContext.runtimeLoaderPath))
    expect(classSetLoaderEntry).toBeDefined()
  })

  it('avoids inserting duplicate rewrite loaders when already present', () => {
    currentContext = createContext()
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: `${currentContext.runtimeCssImportRewriteLoaderPath}??ruleSet[0].rules[0]` },
      ],
      resource: '/abs/app.css',
    }

    handler?.({}, module)
    const rewriteLoaders = module.loaders.filter(entry => entry.loader.includes(currentContext.runtimeCssImportRewriteLoaderPath))
    expect(rewriteLoaders).toHaveLength(1)
  })

  it('does not attach runtime loader when postcss loader is missing', () => {
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new UnifiedWebpackPluginV5()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [{ loader: '/path/css-loader.js' }],
    }
    handler?.({}, module)

    expect(module.loaders).toHaveLength(1)
    expect(module.loaders[0].loader).toBe('/path/css-loader.js')
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
