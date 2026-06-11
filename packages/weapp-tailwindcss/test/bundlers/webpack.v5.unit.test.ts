import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBundlerGeneratedCssMarker } from '@/bundlers/shared/generated-css-marker'
import { WeappTailwindcss } from '@/bundlers/webpack/BaseUnifiedPlugin/v5'
import { getWebpackLoaderRuntime } from '@/bundlers/webpack/loaders/runtime-registry'
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

const CSS_IMPORT_REWRITE_LOADER_PATH = path.resolve(
  __dirname,
  '../../src/bundlers/webpack/BaseUnifiedPlugin/weapp-tw-css-import-rewrite-loader.js',
)

function isCssImportRewriteLoader(entry: { loader?: string }) {
  return entry.loader?.includes('weapp-tw-css-import-rewrite-loader.js') ?? false
}

interface TestContext {
  disabled: boolean
  generator?: unknown
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
  appType?: string
  tailwindcss?: any
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

describe('bundlers/webpack WeappTailwindcss', () => {
  beforeEach(() => {
    currentContext = createContext()
    getCompilerContextMock.mockClear()
    existsSyncSpy = vi.spyOn(fs as any, 'existsSync')
    existsSyncSpy.mockReturnValue(true)
  })

  afterEach(() => {
    existsSyncSpy.mockRestore()
    vi.doUnmock('@/generator')
    vi.resetModules()
  })

  it('adds webpack output path to configured watch ignored paths before webpack creates Watching', () => {
    const outputPath = path.resolve(process.cwd(), 'dist')
    const watch = vi.fn()
    const watchRunHandlers: Array<() => void> = []
    const compilation = {
      compiler: { outputPath },
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
      outputPath,
      options: {
        watchOptions: {
          aggregateTimeout: 100,
          ignored: ['**/node_modules/**', '**/.git/**'],
        },
      },
      watch,
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
        watchRun: {
          tap: (_name: string, handler: () => void) => {
            watchRunHandlers.push(handler)
          },
        },
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

    new WeappTailwindcss().apply(compiler as any)
    expect(compiler.watch).toBe(watch)
    expect(watchRunHandlers.length).toBeGreaterThan(0)

    expect(compiler.options.watchOptions.ignored).toEqual([
      '**/node_modules/**',
      '**/.git/**',
      outputPath,
    ])
  })

  it('adds webpack output path to active watch ignored paths without patching compiler.watch', () => {
    const outputPath = path.resolve(process.cwd(), 'dist')
    const watch = vi.fn()
    const watchRunHandlers: Array<() => void> = []
    const compilation = {
      compiler: { outputPath },
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
      outputPath,
      options: {},
      watch,
      watching: {
        watchOptions: {
          aggregateTimeout: 100,
          ignored: ['**/node_modules/**', '**/.git/**'],
        },
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
        watchRun: {
          tap: (_name: string, handler: () => void) => {
            watchRunHandlers.push(handler)
          },
        },
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

    new WeappTailwindcss().apply(compiler as any)
    expect(compiler.watch).toBe(watch)
    for (const handler of watchRunHandlers) {
      handler()
    }

    expect(compiler.watching.watchOptions.ignored).toEqual([
      '**/node_modules/**',
      '**/.git/**',
      outputPath,
    ])
  })

  it('wraps mixed webpack watch ignored rules as a predicate', () => {
    const outputPath = path.resolve(process.cwd(), 'dist')
    const ignoredPredicate = vi.fn((file: string) => file.includes('/custom-cache/'))
    const watch = vi.fn()
    const watchRunHandlers: Array<() => void> = []
    const compilation = {
      compiler: { outputPath },
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
      outputPath,
      options: {
        watchOptions: {
          aggregateTimeout: 100,
          ignored: [/node_modules/, '**/.git/**', ignoredPredicate],
        },
      },
      watch,
      watching: {
        watchOptions: {
          aggregateTimeout: 100,
          ignored: [/node_modules/, '**/.git/**', ignoredPredicate],
        },
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
        watchRun: {
          tap: (_name: string, handler: () => void) => {
            watchRunHandlers.push(handler)
          },
        },
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

    new WeappTailwindcss().apply(compiler as any)
    expect(compiler.watch).toBe(watch)
    expect(typeof compiler.options.watchOptions.ignored).toBe('function')
    for (const handler of watchRunHandlers) {
      handler()
    }

    const ignored = compiler.watching.watchOptions.ignored
    for (const handler of watchRunHandlers) {
      handler()
    }

    expect(compiler.watching.watchOptions.ignored).toBe(ignored)
    expect(typeof ignored).toBe('function')
    expect(ignored(path.join(process.cwd(), 'node_modules/pkg/index.js'))).toBe(true)
    expect(ignored(path.join(process.cwd(), '.git/index'))).toBe(true)
    expect(ignored(path.join(process.cwd(), 'custom-cache/index.js'))).toBe(true)
    expect(ignored(outputPath)).toBe(true)
    expect(ignored(path.join(outputPath, 'client/index.js'))).toBe(true)
    expect(ignored(path.join(process.cwd(), 'src/index.ts'))).toBe(false)
  })

  it('does not patch webpack watch when the plugin is disabled', () => {
    currentContext = createContext({
      disabled: true,
    })
    const watch = vi.fn()
    const compiler = {
      outputPath: path.resolve(process.cwd(), 'dist'),
      options: {},
      watch,
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage'),
        },
        sources: {
          ConcatSource: FakeConcatSource,
        },
        NormalModule: {
          getCompilationHooks: vi.fn(),
        },
      },
      hooks: {},
    }

    new WeappTailwindcss().apply(compiler as any)
    expect(compiler.watch).toBe(watch)
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
            source: () => file === 'same.js'
              ? { toString: () => content }
              : content,
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

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    compiler.hooks.normalModuleFactory = {
      tap: vi.fn(() => {}),
    }

    expect(getCompilerContextMock).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.patch).not.toHaveBeenCalled()
    expect(currentContext.onLoad).toHaveBeenCalledTimes(1)

    const module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    loaderHandler?.({}, module)
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    expect(classSetLoaderEntry?.options?.tailwindcssImportRewrite).toBeUndefined()
    const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
    expect(loaderRuntime?.classSet?.getClassSet).toEqual(expect.any(Function))
    const rewriteLoaderEntry = module.loaders.find(entry => isCssImportRewriteLoader(entry))
    expect(rewriteLoaderEntry).toBeUndefined()

    const html = '<view class="foo"></view>'
    const js = 'import { foo } from "./lib"'
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

  it('skips webpack asset updates when processAssets output is unchanged', async () => {
    currentContext = createContext({
      templateHandler: vi.fn(async (code: string) => code),
      jsHandler: vi.fn(async (code: string) => ({ code })),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
    })

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const assetStore = {
      'index.wxml': '<view class="beta"></view>',
      'index.js': 'const cls = "beta"',
      'index.css': '.beta { color: red; }',
    }
    const updateAsset = vi.fn()
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
        const content = assetStore[file as keyof typeof assetStore]
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

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

    expect(currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(currentContext.jsHandler).not.toHaveBeenCalled()
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(updateAsset).not.toHaveBeenCalled()
    expect(currentContext.onUpdate).not.toHaveBeenCalled()
  })

  it('skips css assets already generated by the webpack loader pipeline', async () => {
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
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const generatedCss = [
      createBundlerGeneratedCssMarker('webpack', '/repo/src/app.css'),
      '.bg-clip-text{-webkit-background-clip:text;background-clip:text}',
    ].join('\n')
    currentAssetStore = {
      'app.css': generatedCss,
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.styleHandler).not.toHaveBeenCalled()
    expect(updateAsset).toHaveBeenCalledWith('app.css', expect.any(FakeConcatSource))
    expect(updateAsset.mock.calls[0]?.[1].toString()).toBe('.bg-clip-text{-webkit-background-clip:text;background-clip:text}')
    expect(currentContext.onUpdate).toHaveBeenCalledWith('app.css', generatedCss, '.bg-clip-text{-webkit-background-clip:text;background-clip:text}')
  })

  it('removes generated Tailwind container rules from webpack loader pipeline css', async () => {
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
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const generatedCss = [
      createBundlerGeneratedCssMarker('webpack', '/repo/src/app.css'),
      '.container{width:100%}',
      '.w-_b100px_B{width:100px}',
    ].join('\n')
    currentAssetStore = {
      'app.css': generatedCss,
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['app.css']).toBe('.w-_b100px_B{width:100px}')
    expect(currentAssetStore['app.css']).not.toContain('.container')
  })

  it('removes leftover Tailwind CSS source directives from webpack css assets', async () => {
    currentContext = createContext()
    currentContext.twPatcher.majorVersion = 4

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

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'pages/index/index.css': [
        createBundlerGeneratedCssMarker('webpack', '/repo/src/pages/index/index.css'),
        '@reference "tailwindcss";',
        '',
        '.tw-page-style-watch-anchor { color: inherit; }',
      ].join('\n'),
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(updateAsset).toHaveBeenCalledWith('pages/index/index.css', expect.any(FakeConcatSource))
    expect(currentAssetStore['pages/index/index.css']).not.toContain('@reference')
    expect(currentAssetStore['pages/index/index.css']).toContain('.tw-page-style-watch-anchor')
  })

  it('does not refresh runtime patcher for watch invalidation without runtime dependency changes', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const invalidHandlers: Array<(fileName?: string) => void> = []
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
          tap: vi.fn((_name: string, handler: (fileName?: string) => void) => {
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

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'index.css': '.foo { color: red; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.refreshTailwindcssPatcher).not.toHaveBeenCalled()

    invalidHandlers[0]?.('/workspace/src/pages/index.ts')
    thisCompilationHandlers[0]?.(compilation)

    currentAssetStore = {
      'index.css': '.foo { color: blue; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.refreshTailwindcssPatcher).not.toHaveBeenCalled()
  })

  it('refreshes runtime patcher when webpack watch invalidates runtime dependencies', async () => {
    currentContext.twPatcher.options = {
      tailwindcss: {
        config: '/workspace/tailwind.config.js',
      },
    } as any
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const invalidHandlers: Array<(fileName?: string) => void> = []
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
          tap: vi.fn((_name: string, handler: (fileName?: string) => void) => {
            invalidHandlers.push(handler)
          }),
        },
        thisCompilation: {
          tap: vi.fn((_name: string, handler: (_compilation: any) => void) => {
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

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'index.css': '.foo { color: red; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    invalidHandlers[0]?.('/workspace/tailwind.config.js')

    currentAssetStore = {
      'index.css': '.foo { color: blue; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
  })

  it('prepares runtime metadata from the injected loader and tolerates token collection failures', async () => {
    currentContext.twPatcher.options = {
      tailwindcss: {
        config: '/workspace/tailwind.config.ts',
        v4: {
          cssEntries: ['/workspace/src/app.css'],
          sources: [
            { base: '/workspace/src' },
            {},
          ],
        },
      },
    } as any
    currentContext.twPatcher.collectContentTokens = vi.fn(async () => {
      throw new Error('collect failed')
    })
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const module: LoaderModule = {
      resource: '/workspace/src/app.css',
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    getLoaderHandler()?.({}, module)

    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
    expect(loaderRuntime?.classSet?.getClassSet).toEqual(expect.any(Function))
    expect(loaderRuntime?.classSet?.getWatchDependencies).toEqual(expect.any(Function))

    await loaderRuntime?.classSet?.getClassSet?.()
    await loaderRuntime?.classSet?.getClassSet?.()

    expect(currentContext.twPatcher.collectContentTokens).toHaveBeenCalledTimes(1)
    expect(currentContext.twPatcher.extract).toHaveBeenCalledTimes(1)

    const dependencies = loaderRuntime?.classSet?.getWatchDependencies?.()
    expect([...dependencies.files]).toEqual([
      '/workspace/tailwind.config.ts',
      '/workspace/src/app.css',
    ])
    expect([...dependencies.contexts]).toEqual(['/workspace/src'])
  })

  it('registers tailwindcss v4 cssSources from the injected css rewrite loader', async () => {
    currentContext.twPatcher.majorVersion = 4
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const module: LoaderModule = {
      resource: '/workspace/src/app.css',
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    getLoaderHandler()?.({}, module)

    const rewriteLoaderEntry = module.loaders.find(isCssImportRewriteLoader)
    const loaderRuntime = getWebpackLoaderRuntime(rewriteLoaderEntry?.options?.tailwindcssImportRewriteRuntimeKey)
    await loaderRuntime?.cssImportRewrite?.registerCssSource?.({
      file: '/workspace/src/app.css',
      css: '@import "tailwindcss";\n@source inline("w-4");',
    })

    expect(currentContext.tailwindcss?.v4?.cssSources).toEqual([
      {
        file: '/workspace/src/app.css',
        css: '@import "tailwindcss";\n@source inline("w-4");',
      },
    ])
    expect(currentContext.refreshTailwindcssPatcher).toHaveBeenCalledTimes(1)
  })

  it('skips webpack hooks when the plugin is disabled', () => {
    currentContext = createContext({ disabled: true })
    const { compiler } = createCompilerWithLoaderTracking()

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    expect(currentContext.twPatcher.patch).not.toHaveBeenCalled()
    expect(currentContext.onLoad).not.toHaveBeenCalled()
    expect(compiler.webpack.NormalModule.getCompilationHooks).not.toHaveBeenCalled()
  })

  it('adds content token report entries and sources to runtime watch dependencies', async () => {
    currentContext.twPatcher.options = {
      tailwindcss: {
        config: '/workspace/tailwind.config.ts',
        v4: {
          cssEntries: ['/workspace/src/app.css'],
          sources: [
            { base: '/workspace/src' },
            {},
          ],
        },
      },
    } as any
    currentContext.twPatcher.collectContentTokens = vi.fn(async () => ({
      entries: [
        { file: '/workspace/src/pages/home.wxml' },
        {},
      ],
      sources: [
        { base: '/workspace/src/components' },
        {},
      ],
    }))
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const module: LoaderModule = {
      resource: '/workspace/src/app.css',
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    getLoaderHandler()?.({}, module)

    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
    await loaderRuntime?.classSet?.getClassSet?.()

    expect(currentContext.twPatcher.collectContentTokens).toHaveBeenCalledTimes(1)
    const dependencies = loaderRuntime?.classSet?.getWatchDependencies?.()
    expect([...dependencies.files]).toEqual([
      '/workspace/tailwind.config.ts',
      '/workspace/src/app.css',
      '/workspace/src/pages/home.wxml',
    ])
    expect([...dependencies.contexts]).toEqual([
      '/workspace/src',
      '/workspace/src/components',
    ])
  })

  it('reuses webpack runtime metadata across unrelated watch compilations', async () => {
    currentContext.twPatcher.majorVersion = 4
    currentContext.twPatcher.getClassSet = vi.fn(async () => new Set(['w-[2px]']))
    currentContext.twPatcher.getClassSetSync = vi.fn(() => new Set(['w-[2px]']))
    currentContext.twPatcher.collectContentTokens = vi.fn(async () => ({
      entries: [
        { file: '/workspace/src/pages/home.wxml' },
      ],
      sources: [],
    }))
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
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
          tap: vi.fn(),
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
      options: {
        watch: true,
      },
    }

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'index.js': 'const cls = "w-[2px]"',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    thisCompilationHandlers[0]?.(compilation)
    currentAssetStore = {
      'index.js': 'const cls = "w-[4px]"',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.twPatcher.collectContentTokens).toHaveBeenCalledTimes(1)
  })

  it('reuses css handler override objects for repeated asset updates', async () => {
    currentContext = createContext({
    })
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

    const plugin = new WeappTailwindcss()
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

    new WeappTailwindcss().apply(compiler as any)
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

    new WeappTailwindcss().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['app.wxss']).toContain('.tw-page-style-watch-anchor')
    expect(currentAssetStore['app.wxss']).toContain('.tw-root')
    expect(currentAssetStore['app.wxss']).toContain('wx-root-portal-content')
    expect(currentAssetStore['app.wxss']).toContain(staleRuntimeCss)
  })

  it('regenerates main css when only runtime classes change', async () => {
    let runtimeSet = new Set(['bg-[#101010]'])
    let transformCount = 0
    const cssInput = '.runtime-anchor { color: red; }'
    currentContext = createContext({
      mainCssChunkMatcher: vi.fn(() => true),
      styleHandler: vi.fn(async () => {
        transformCount += 1
        return { css: `runtime:${transformCount}` }
      }),
      twPatcher: {
        ...createContext().twPatcher,
        getClassSet: vi.fn(async () => runtimeSet),
        getClassSetSync: vi.fn(() => runtimeSet),
        extract: vi.fn(async () => ({ classSet: runtimeSet })),
        majorVersion: 3,
      } as any,
    })

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'app.css': cssInput,
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'app', hash: 'same-css-hash', files: ['app.css'] }],
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

    new WeappTailwindcss().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))
    expect(currentAssetStore['app.css']).toBe('runtime:1')

    runtimeSet = new Set(['bg-[#202020]'])
    currentAssetStore = {
      'app.css': cssInput,
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['app.css']).toBe('runtime:2')
    expect(currentContext.styleHandler).toHaveBeenCalledTimes(2)
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

    const plugin = new WeappTailwindcss()
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

    const plugin = new WeappTailwindcss()
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
  })

  it('respects explicit stale fallback option when set to false', async () => {
    const runtimeSet = new Set(['text-[100rpx]', 'text-white'])
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

    const plugin = new WeappTailwindcss()
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
  })

  it('refreshes runtime class set on non-watch processAssets so script-only updates stay precisely escaped', async () => {
    let runtimeSet = new Set(['bg-[#f40404]', 'text-[100rpx]', 'text-white'])
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

    const plugin = new WeappTailwindcss()
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
  })

  it('uses incremental runtime candidates during webpack watch processAssets updates', async () => {
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })
    const incrementalRuntimeSet = new Set<string>()
    const incrementalRuntimeManager = {
      reset: vi.fn(async () => undefined),
      sync: vi.fn(async (_patcher: unknown, snapshot: { runtimeAffectingChangedByType: { js: Set<string> }, entries: Array<{ file: string, source: string }> }) => {
        for (const file of snapshot.runtimeAffectingChangedByType.js) {
          const entry = snapshot.entries.find(item => item.file === file)
          if (!entry) {
            continue
          }
          const matches = entry.source.match(/[a-z-]+-\[[^\]]+\]/g) ?? []
          for (const match of matches) {
            incrementalRuntimeSet.add(match)
          }
        }
        return new Set(incrementalRuntimeSet)
      }),
    }
    currentContext = createContext({
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      __internalWebpackRuntimeClassSetManager: incrementalRuntimeManager,
      twPatcher: {
        patch: vi.fn(),
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
        packageInfo: {
          name: 'tailwindcss4',
        },
        options: {
          projectRoot: process.cwd(),
          tailwindcss: {
            packageName: 'tailwindcss4',
            v4: {
              css: '@import "tailwindcss";',
              base: process.cwd(),
            },
          },
        },
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
    const watchRunHandlers: Array<() => void> = []
    const compiler = {
      options: { watch: true },
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
        watchRun: {
          tap: (_name: string, handler: () => void) => {
            watchRunHandlers.push(handler)
          },
        },
      },
    }

    new WeappTailwindcss().apply(compiler as any)

    currentAssetStore = {
      'index.js': 'const cls = "bg-[#101010] text-[100rpx]"',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))
    expect(incrementalRuntimeManager.sync).toHaveBeenCalledTimes(1)
    expect(incrementalRuntimeSet.has('bg-[#101010]')).toBe(true)
    expect(currentAssetStore['index.js']).toContain(replaceWxml('bg-[#101010]'))

    currentAssetStore = {
      'index.js': 'const cls = "bg-[#202020] text-[100rpx]"',
    }
    compilation.chunks = [{ id: 'main', hash: 'hash-2', files: ['index.js'] }]
    watchRunHandlers[0]?.()
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['index.js']).toContain(replaceWxml('bg-[#202020]'))
    expect(currentAssetStore['index.js']).not.toContain('bg-[#202020]')
    expect(incrementalRuntimeManager.sync).toHaveBeenCalledTimes(2)
    expect(currentContext.twPatcher.extract).not.toHaveBeenCalled()
  })

  it('forwards tailwindcssImportRewrite options when tailwindcss v4 detected', () => {
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
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    const module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    loaderHandler?.({}, module)
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === currentContext.runtimeLoaderPath)
    const rewriteLoaderEntry = module.loaders.find(entry => isCssImportRewriteLoader(entry))
    expect(classSetLoaderEntry).toBeDefined()
    expect(rewriteLoaderEntry).toBeDefined()
    expect(rewriteLoaderEntry?.options?.tailwindcssImportRewriteRuntimeKey).toEqual(expect.any(String))
    expect(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey).toBe(rewriteLoaderEntry?.options?.tailwindcssImportRewriteRuntimeKey)
    expect(classSetLoaderEntry?.ident).toBeNull()
    expect(rewriteLoaderEntry?.ident).toBeNull()
    const classSetIndex = module.loaders.indexOf(classSetLoaderEntry!)
    const postcssIndex = module.loaders.findIndex(entry => entry.loader.includes('postcss-loader'))
    const rewriteIndex = module.loaders.indexOf(rewriteLoaderEntry!)
    expect(classSetIndex).toBeLessThan(postcssIndex)
    expect(rewriteIndex).toBeGreaterThan(postcssIndex)
  })

  it('uses safe runtime keys so runtime options are not serialized into webpack requests', () => {
    currentContext = createContext({
      ...currentContext,
      customReplaceDictionary: {
        '!': '_e',
        '#': '_h',
        '/': '_f',
      },
    } as any)
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    new WeappTailwindcss().apply(compiler as any)

    const module: LoaderModule = {
      resource: '/workspace/src/app.css',
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    getLoaderHandler()?.({}, module)

    const rewriteLoaderEntry = module.loaders.find(isCssImportRewriteLoader)
    const serializedRequest = `${rewriteLoaderEntry?.loader}?${JSON.stringify(rewriteLoaderEntry?.options)}`
    expect(rewriteLoaderEntry?.options).toEqual({
      tailwindcssImportRewriteRuntimeKey: expect.any(String),
    })
    expect(serializedRequest).not.toContain('customReplaceDictionary')
    expect(serializedRequest).not.toContain('"_e"')
    expect(serializedRequest).not.toContain('!')
  })

  it('uses mpx style compiler loader as anchor when appType is mpx', () => {
    currentContext = createContext({ appType: 'mpx' })
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
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
    const plugin = new WeappTailwindcss()
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
      isCssImportRewriteLoader(entry),
    )
    expect(styleIndex).toBeGreaterThanOrEqual(0)
    expect(rewriteIndex).toBeGreaterThan(styleIndex)
  })

  it('falls back to strip-conditional loader when style compiler anchor is missing', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
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
      isCssImportRewriteLoader(entry),
    )
    expect(stripIndex).toBeGreaterThanOrEqual(0)
    expect(rewriteIndex).toBeGreaterThan(stripIndex)
  })

  it('reorders an existing rewrite loader so it runs before the mpx style compiler', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementation(() => currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: CSS_IMPORT_REWRITE_LOADER_PATH },
        { loader: '/abs/node_modules/@mpxjs/webpack-plugin/lib/style-compiler/index.js??ruleSet[0]' },
      ],
    }

    handler?.({}, module)

    const styleIndex = module.loaders.findIndex(entry => entry.loader?.includes('@mpxjs/webpack-plugin/lib/style-compiler/index'))
    const rewriteIndex = module.loaders.findIndex(entry => isCssImportRewriteLoader(entry))
    expect(styleIndex).toBeGreaterThanOrEqual(0)
    expect(rewriteIndex).toBeGreaterThan(styleIndex)
    expect(module.loaders.filter(entry => isCssImportRewriteLoader(entry))).toHaveLength(1)
  })

  it('falls back to css matcher when anchor is missing', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [],
      resource: '/abs/src/app.css',
    } as any

    handler?.({}, module)
    const rewriteLoaderEntry = module.loaders.find(entry => isCssImportRewriteLoader(entry))
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
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [],
      resource: '/abs/app.css?type=styles',
    }

    handler?.({}, module)
    const rewriteLoaderEntry = module.loaders.find(entry => isCssImportRewriteLoader(entry))
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader.includes(currentContext.runtimeLoaderPath))
    expect(rewriteLoaderEntry).toBeDefined()
    expect(classSetLoaderEntry).toBeDefined()
  })

  it('injects rewrite loader for preprocessor and SFC style modules', () => {
    currentContext = createContext()
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const scssModule: LoaderModule = {
      loaders: [{ loader: '/path/sass-loader.js' }],
      resource: '/abs/app.scss?inline',
    }
    const sfcLessModule: LoaderModule = {
      loaders: [{ loader: '/path/less-loader.js' }],
      resource: '/abs/component.vue?vue&type=style&index=0&lang=less',
    }

    handler?.({}, scssModule)
    handler?.({}, sfcLessModule)

    expect(scssModule.loaders.find(entry => isCssImportRewriteLoader(entry))).toBeDefined()
    expect(sfcLessModule.loaders.find(entry => isCssImportRewriteLoader(entry))).toBeDefined()
  })

  it('walks loader debug branches for app and page css modules', () => {
    const previousDebug = process.env.WEAPP_TW_LOADER_DEBUG
    process.env.WEAPP_TW_LOADER_DEBUG = '1'
    try {
      currentContext = createContext()
      getCompilerContextMock.mockReturnValue(currentContext)
      const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
      const plugin = new WeappTailwindcss()
      plugin.apply(compiler as any)

      const handler = getLoaderHandler()
      const appModule: LoaderModule = {
        loaders: [{ loader: '/path/postcss-loader.js' }],
        resource: '/abs/src/app.css',
      }
      const pageModule: LoaderModule = {
        loaders: [{ loader: '/path/postcss-loader.js' }],
        resource: '/abs/src/page.css',
      }

      handler?.({}, appModule)
      handler?.({}, pageModule)

      expect(appModule.loaders.some(entry => entry.loader === currentContext.runtimeLoaderPath)).toBe(true)
      expect(pageModule.loaders.some(entry => entry.loader === currentContext.runtimeLoaderPath)).toBe(true)
    }
    finally {
      if (previousDebug === undefined) {
        delete process.env.WEAPP_TW_LOADER_DEBUG
      }
      else {
        process.env.WEAPP_TW_LOADER_DEBUG = previousDebug
      }
    }
  })

  it('detects mpx style modules via resource query', () => {
    currentContext = createContext({ appType: 'mpx' })
    currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
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
    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const handler = getLoaderHandler()
    const module: LoaderModule = {
      loaders: [
        { loader: `${CSS_IMPORT_REWRITE_LOADER_PATH}??ruleSet[0].rules[0]` },
      ],
      resource: '/abs/app.css',
    }

    handler?.({}, module)
    const rewriteLoaders = module.loaders.filter(entry => isCssImportRewriteLoader(entry))
    expect(rewriteLoaders).toHaveLength(1)
  })

  it('does not attach runtime loader when postcss loader is missing', () => {
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    const plugin = new WeappTailwindcss()
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

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const html = '<view class="foo"></view>'
    const js = 'import { foo } from "./lib"'
    const wxs = 'const x = require("./lib")'
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

  it('skips html and js class transforms for web generator target', async () => {
    currentContext = createContext({
      generator: {
        target: 'web',
      },
      htmlMatcher: (file: string) => file.endsWith('.html'),
      jsMatcher: (file: string) => file.endsWith('.js'),
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

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    currentAssetStore = {
      'index.html': '<div class="bg-[#07c160]"></div>',
      'index.js': 'const cls = "bg-[#07c160]"',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentContext.templateHandler).not.toHaveBeenCalled()
    expect(currentContext.jsHandler).not.toHaveBeenCalled()
    expect(updateAsset.mock.calls.some(([file]) => file === 'index.html')).toBe(false)
    expect(updateAsset.mock.calls.some(([file]) => file === 'index.js')).toBe(false)
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
              [path.resolve(outDir, 'external.js')]: { code: 'linked:external' },
              [path.resolve(outDir, 'missing.js')]: { code: 'linked:missing' },
              [path.resolve(outDir, 'same.js')]: { code: 'const same = "beta";' },
            },
          }
        }
        return { code }
      }),
    })
    getCompilerContextMock.mockReturnValue(currentContext)

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const assetStore = {
      'index.js': 'import "./chunk.js";',
      'chunk.js': 'import { bar } from "./dep"; export const foo = bar;',
      'same.js': 'const same = "beta";',
    }
    currentAssetStore = assetStore
    const assetsRun = createAssetsFromStore({
      ...assetStore,
      'missing.js': 'missing',
      'orphan.js': 'orphan',
    })
    await processAssetsCallbacks[0](assetsRun)

    expect(currentContext.jsHandler).toHaveBeenCalledTimes(2)
    const chunkUpdate = updateAsset.mock.calls.find(([file]) => file === 'chunk.js')
    expect(chunkUpdate?.[1].toString()).toBe('linked:chunk')
    const onUpdateCalls = currentContext.onUpdate.mock.calls.filter(([file]) => file === 'chunk.js')
    expect(onUpdateCalls.some(([, , updated]) => updated === 'linked:chunk')).toBe(true)
    expect(currentContext.onUpdate.mock.calls.some(([file]) => file === 'same.js')).toBe(false)
    expect(updateAsset.mock.calls.some(([file]) => file === 'missing.js')).toBe(false)
    expect(updateAsset.mock.calls.some(([file]) => file === 'orphan.js')).toBe(false)

    const [firstCall] = currentContext.jsHandler.mock.calls
    const options = firstCall?.[2]
    expect(options?.moduleGraph?.resolve?.('./chunk.js', options.filename ?? '')).toBe(path.resolve(outDir, 'chunk.js'))
    expect(options?.moduleGraph?.load?.(path.resolve(outDir, 'chunk.js'))).toContain('bar')
    expect(options?.moduleGraph?.load?.(path.resolve(outDir, 'missing.js'))).toBeUndefined()
    expect(options?.moduleGraph?.filter?.(path.resolve(outDir, 'orphan.js'))).toBe(true)
    expect(options?.moduleGraph?.filter?.(path.resolve(outDir, 'external.js'))).toBe(false)
  })

  it('applies css import rewrite for tailwindcss v4 and web generator projects', () => {
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
        Compilation: { PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage') },
        sources: { ConcatSource: FakeConcatSource },
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
        normalModuleFactory: { tap: vi.fn() },
        compilation: {
          tap: (_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          },
        },
        emit: { tapPromise: vi.fn() },
      },
    }

    const ctxV4 = createContext()
    ctxV4.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementationOnce(() => ctxV4)
    let plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    const v4Module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
      resource: '/abs/app.css',
    }
    loaderHandler?.({}, v4Module)
    expect(v4Module.loaders.some(entry => isCssImportRewriteLoader(entry))).toBe(true)

    const ctxV3 = createContext()
    ctxV3.twPatcher.majorVersion = 3
    getCompilerContextMock.mockImplementationOnce(() => ctxV3)
    loaderHandler = undefined
    plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    const v3Module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
      resource: '/abs/app.css',
    }
    loaderHandler?.({}, v3Module)
    expect(v3Module.loaders.some(entry => isCssImportRewriteLoader(entry))).toBe(false)

    const ctxV3Web = createContext({
      generator: {
        target: 'web',
      },
    })
    ctxV3Web.twPatcher.majorVersion = 3
    getCompilerContextMock.mockImplementationOnce(() => ctxV3Web)
    loaderHandler = undefined
    plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    const v3WebModule: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
      resource: '/abs/app.css',
    }
    loaderHandler?.({}, v3WebModule)
    expect(v3WebModule.loaders.some(entry => isCssImportRewriteLoader(entry))).toBe(true)
  })
})
