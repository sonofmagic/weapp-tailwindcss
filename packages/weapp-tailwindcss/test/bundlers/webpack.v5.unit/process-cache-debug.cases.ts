import { describe, expect, it, vi } from 'vitest'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createContext, path, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / process cache debug and unchanged assets', () => {
  setupWebpackV5UnitTest()
  it('emits webpack memory debug stats for watch regression guards', async () => {
    process.env.WEAPP_TW_WATCH_REGRESSION = '1'
    process.env.WEAPP_TW_HMR_MEMORY_DEBUG = '1'
    testState.currentContext = createContext()
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'index.wxml': '<view class="foo"></view>',
      'index.js': 'const cls = "foo"',
      'index.css': '.foo { color: red; }',
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: Object.keys(currentAssetStore) }],
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

    try {
      new WeappTailwindcss().apply(compiler as any)
      await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

      const payloadLine = write.mock.calls
        .map(([chunk]) => String(chunk))
        .find(line => line.startsWith('[weapp-tailwindcss:hmr] '))
      expect(payloadLine).toBeTruthy()
      const payload = JSON.parse(payloadLine!.replace('[weapp-tailwindcss:hmr] ', ''))
      expect(payload.memoryDebug).toMatchObject({
        phase: 'processAssets',
        assets: {
          active: 3,
          activeCss: 1,
        },
        processCache: {
          activeCacheKeys: 3,
          activeHashKeys: 4,
        },
        webpackCss: {
          handlerOptions: 1,
          userHandlerOptions: 1,
          maxHandlerOptions: 128,
        },
      })
      expect(payload.memoryDebug.process.heapUsedMb).toEqual(expect.any(Number))
    }
    finally {
      write.mockRestore()
    }
  })

  it('skips webpack asset updates when processAssets output is unchanged', async () => {
    testState.currentContext = createContext({
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

    expect(testState.currentContext.templateHandler).toHaveBeenCalledTimes(1)
    expect(testState.currentContext.jsHandler).not.toHaveBeenCalled()
    expect(testState.currentContext.styleHandler).toHaveBeenCalledTimes(1)
    expect(updateAsset).not.toHaveBeenCalled()
    expect(testState.currentContext.onUpdate).not.toHaveBeenCalled()
  })

})
