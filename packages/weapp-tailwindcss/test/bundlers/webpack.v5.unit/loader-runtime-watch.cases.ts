import { describe, expect, it, vi } from 'vitest'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, path, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / loader runtime watch invalidation', () => {
  setupWebpackV5UnitTest()
  it('does not refresh runtime for watch invalidation without runtime dependency changes', async () => {
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

    expect(testState.currentContext.refreshTailwindcssRuntime).not.toHaveBeenCalled()

    invalidHandlers[0]?.('/workspace/src/pages/index.ts')
    thisCompilationHandlers[0]?.(compilation)

    currentAssetStore = {
      'index.css': '.foo { color: blue; }',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(testState.currentContext.refreshTailwindcssRuntime).not.toHaveBeenCalled()
  })

  it('refreshes runtime when webpack watch invalidates runtime dependencies', async () => {
    testState.currentContext.tailwindRuntime.options = {
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

    expect(testState.currentContext.refreshTailwindcssRuntime).toHaveBeenCalledTimes(1)
  })

})
