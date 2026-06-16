import { describe, expect, it, vi } from 'vitest'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createBundlerGeneratedCssMarker, createContext, path, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / generated css cleanup', () => {
  setupWebpackV5UnitTest()
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

    testState.currentContext.twPatcher.majorVersion = 4
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
    testState.currentContext = createContext()
    testState.currentContext.twPatcher.majorVersion = 4

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

})
