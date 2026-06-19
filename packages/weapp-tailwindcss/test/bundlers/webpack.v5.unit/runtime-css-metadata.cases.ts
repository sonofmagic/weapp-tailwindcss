import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createCompilerWithLoaderTracking, createContext, getWebpackLoaderRuntime, path, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / runtime css metadata', () => {
  setupWebpackV5UnitTest()
  it('skips webpack hooks when the plugin is disabled', () => {
    testState.currentContext = createContext({ disabled: true })
    const { compiler } = createCompilerWithLoaderTracking()

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    expect(testState.currentContext.onLoad).not.toHaveBeenCalled()
    expect(compiler.webpack.NormalModule.getCompilationHooks).not.toHaveBeenCalled()
  })

  it('adds content token report entries and sources to runtime watch dependencies', async () => {
    testState.currentContext.tailwindRuntime.options = {
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
    testState.currentContext.tailwindRuntime.collectContentTokens = vi.fn(async () => ({
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

    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === testState.currentContext.runtimeLoaderPath)
    const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
    await loaderRuntime?.classSet?.getClassSet?.()

    expect(testState.currentContext.tailwindRuntime.collectContentTokens).toHaveBeenCalledTimes(1)
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
    testState.currentContext.tailwindRuntime.majorVersion = 4
    testState.currentContext.tailwindRuntime.getClassSet = vi.fn(async () => new Set(['w-[2px]']))
    testState.currentContext.tailwindRuntime.getClassSetSync = vi.fn(() => new Set(['w-[2px]']))
    testState.currentContext.tailwindRuntime.collectContentTokens = vi.fn(async () => ({
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

    expect(testState.currentContext.tailwindRuntime.collectContentTokens).toHaveBeenCalledTimes(1)
  })

  it('reuses css handler override objects for repeated asset updates', async () => {
    testState.currentContext = createContext({
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

    expect(testState.currentContext.styleHandler).toHaveBeenCalledTimes(2)
    expect(testState.currentContext.styleHandler.mock.calls[0]?.[1]).toBe(testState.currentContext.styleHandler.mock.calls[1]?.[1])
  })

})
