import { describe, expect, it, vi } from 'vitest'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createContext, getCompilerContextMock, path, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / process assets web target', () => {
  setupWebpackV5UnitTest()
  it('skips html, js and final css transforms for web generator target', async () => {
    testState.currentContext = createContext({
      generator: {
        target: 'web',
      },
      htmlMatcher: (file: string) => file.endsWith('.html'),
      jsMatcher: (file: string) => file.endsWith('.js'),
    })
    getCompilerContextMock.mockReturnValue(testState.currentContext)

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

    const mergedCss = [
      '.navbar__brand { color: var(--ifm-navbar-link-color); }',
      '.home-hero { display: grid; }',
      '.home-v5 .home-facts { gap: 1rem; }',
      '.rounded-full { border-radius: calc(infinity * 1px); }',
    ].join('\n')
    currentAssetStore = {
      'index.html': '<div class="bg-[#07c160]"></div>',
      'index.js': 'const cls = "bg-[#07c160]"',
      'index.css': mergedCss,
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(testState.currentContext.templateHandler).not.toHaveBeenCalled()
    expect(testState.currentContext.jsHandler).not.toHaveBeenCalled()
    expect(testState.currentContext.styleHandler).not.toHaveBeenCalled()
    expect(updateAsset.mock.calls.some(([file]) => file === 'index.html')).toBe(false)
    expect(updateAsset.mock.calls.some(([file]) => file === 'index.js')).toBe(false)
    expect(updateAsset.mock.calls.some(([file]) => file === 'index.css')).toBe(false)
    expect(currentAssetStore['index.css']).toBe(mergedCss)
  })

  it('skips processAssets work when webpack reports no assets', async () => {
    testState.currentContext = createContext({
      generator: {
        target: 'web',
      },
    })
    getCompilerContextMock.mockReturnValue(testState.currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const rootCompiler = {
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
            handler({
              compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
              chunks: [],
              hooks: {
                processAssets: {
                  tapPromise: (_options: unknown, processAssetsHandler: (assets: Record<string, any>) => Promise<void>) => {
                    processAssetsCallbacks.push(processAssetsHandler)
                  },
                },
              },
              updateAsset: vi.fn(),
              getAsset: vi.fn(),
            })
          },
        },
      },
    }

    const plugin = new WeappTailwindcss()
    plugin.apply(rootCompiler as any)

    expect(processAssetsCallbacks).toHaveLength(1)
    await processAssetsCallbacks[0]({})

    expect(testState.currentContext.onStart).not.toHaveBeenCalled()
    expect(testState.currentContext.onEnd).not.toHaveBeenCalled()
    expect(testState.currentContext.templateHandler).not.toHaveBeenCalled()
    expect(testState.currentContext.jsHandler).not.toHaveBeenCalled()
    expect(testState.currentContext.styleHandler).not.toHaveBeenCalled()
  })

  it('skips processAssets work for web generator target without css assets', async () => {
    testState.currentContext = createContext({
      generator: {
        target: 'web',
      },
      htmlMatcher: (file: string) => file.endsWith('.html'),
      jsMatcher: (file: string) => file.endsWith('.js'),
    })
    getCompilerContextMock.mockReturnValue(testState.currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: FakeConcatSource) => {
      currentAssetStore[file] = source.toString()
    })
    const rootCompiler = {
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
            handler({
              compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
              chunks: [{ id: 'main', hash: 'hash-1' }],
              hooks: {
                processAssets: {
                  tapPromise: (_options: unknown, processAssetsHandler: (assets: Record<string, any>) => Promise<void>) => {
                    processAssetsCallbacks.push(processAssetsHandler)
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
            })
          },
        },
      },
    }

    const plugin = new WeappTailwindcss()
    plugin.apply(rootCompiler as any)

    currentAssetStore = {
      'index.html': '<div class="bg-[#07c160]"></div>',
      'index.js': 'const cls = "bg-[#07c160]"',
    }
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(testState.currentContext.onStart).not.toHaveBeenCalled()
    expect(testState.currentContext.onEnd).not.toHaveBeenCalled()
    expect(testState.currentContext.templateHandler).not.toHaveBeenCalled()
    expect(testState.currentContext.jsHandler).not.toHaveBeenCalled()
    expect(testState.currentContext.styleHandler).not.toHaveBeenCalled()
    expect(updateAsset).not.toHaveBeenCalled()
  })

})
