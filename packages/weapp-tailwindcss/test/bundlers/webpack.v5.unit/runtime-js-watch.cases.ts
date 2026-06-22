import { describe, expect, it, vi } from 'vitest'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createContext, createJsHandler, getCompilerContextMock, path, replaceWxml, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / runtime js watch candidates', () => {
  setupWebpackV5UnitTest()
  it.each([3, 4])('uses incremental runtime candidates during webpack watch processAssets updates for Tailwind v%s', async (majorVersion) => {
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })
    const incrementalRuntimeSet = new Set<string>()
    const incrementalRuntimeManager = {
      reset: vi.fn(async () => undefined),
      sync: vi.fn(async (_runtime: unknown, snapshot: { runtimeAffectingChangedByType: { js: Set<string> }, entries: Array<{ file: string, source: string }> }) => {
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
    testState.currentContext = createContext({
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      __internalWebpackRuntimeClassSetManager: incrementalRuntimeManager,
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion,
        packageInfo: {
          name: majorVersion === 4 ? 'tailwindcss4' : 'tailwindcss',
        },
        options: {
          projectRoot: process.cwd(),
          tailwindcss: {
            packageName: majorVersion === 4 ? 'tailwindcss4' : 'tailwindcss',
            v4: {
              css: '@import "tailwindcss";',
              base: process.cwd(),
            },
          },
        },
      },
    })
    getCompilerContextMock.mockImplementation(() => testState.currentContext)

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
    expect(incrementalRuntimeManager.sync).toHaveBeenCalledTimes(majorVersion === 4 ? 1 : 0)
    expect(incrementalRuntimeSet.has('bg-[#101010]')).toBe(majorVersion === 4)
    if (majorVersion === 4) {
      expect(currentAssetStore['index.js']).toContain(replaceWxml('bg-[#101010]'))
    }
    else {
      expect(currentAssetStore['index.js']).toContain('bg-[#101010]')
    }

    currentAssetStore = {
      'index.js': 'const cls = "bg-[#202020] text-[100rpx]"',
    }
    compilation.chunks = [{ id: 'main', hash: 'hash-2', files: ['index.js'] }]
    watchRunHandlers[0]?.()
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    if (majorVersion === 4) {
      expect(currentAssetStore['index.js']).toContain(replaceWxml('bg-[#202020]'))
      expect(currentAssetStore['index.js']).not.toContain('bg-[#202020]')
    }
    else {
      expect(currentAssetStore['index.js']).toContain('bg-[#202020]')
    }
    expect(incrementalRuntimeManager.sync).toHaveBeenCalledTimes(majorVersion === 4 ? 2 : 0)
    if (majorVersion === 3) {
      expect(testState.currentContext.tailwindRuntime.extract).toHaveBeenCalled()
    }
    else {
      expect(testState.currentContext.tailwindRuntime.extract).not.toHaveBeenCalled()
    }
  })

  it('feeds escaped v3 webpack js candidates into main css generation during watch', async () => {
    const generateMock = vi.fn(async (options: { candidates?: Set<string> } = {}) => ({
      css: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      rawCss: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates ?? []),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))

    vi.resetModules()
    vi.doMock('@/bundlers/vite/source-scan', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-scan')>()
      return {
        ...actual,
        resolveViteSourceScanEntries: vi.fn(async () => ({
          entries: [],
          explicit: true,
        })),
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        importFallback: true,
        styleOptions: {},
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        dependencies: [],
      })),
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        baseFallbacks: [],
      })),
    }))

    const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
    testState.currentContext = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn(file => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
        options: {},
      },
    } as any)
    getCompilerContextMock.mockImplementation(() => testState.currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'app.wxss': '@tailwind utilities;',
      'pages/index/index.js': 'const cls = "text-_b23_d000015px_B bg-_b_h000015_B after_cml-_b0_d000015px_B";',
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: ['app.wxss', 'pages/index/index.js'] }],
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
          tap: vi.fn(),
        },
      },
    }

    new MockedWeappTailwindcss().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['app.wxss']).toContain('bg-[#000015]')
    expect(currentAssetStore['app.wxss']).toContain('text-[23.000015px]')
    expect(currentAssetStore['app.wxss']).toContain('after:ml-[0.000015px]')
  })

  it('uses transformed v3 source candidates for webpack watch css generation', async () => {
    const generateMock = vi.fn(async (options: { candidates?: Set<string> } = {}) => ({
      css: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      rawCss: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates ?? []),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))

    vi.resetModules()
    vi.doMock('@/bundlers/vite/source-scan', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-scan')>()
      return {
        ...actual,
        resolveViteSourceScanEntries: vi.fn(async () => ({
          entries: [],
          explicit: true,
          inlineCandidates: {
            excluded: [],
            included: ['bg-[#000015]', 'text-[23.000015px]'],
          },
        })),
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        importFallback: true,
        styleOptions: {},
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        dependencies: [],
      })),
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        baseFallbacks: [],
      })),
    }))

    const incrementalRuntimeManager = {
      reset: vi.fn(async () => undefined),
      sync: vi.fn(async () => new Set(['text-[100rpx]'])),
    }
    const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
    testState.currentContext = createContext({
      __internalWebpackRuntimeClassSetManager: incrementalRuntimeManager,
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn(file => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
        options: {},
      },
    } as any)
    getCompilerContextMock.mockImplementation(() => testState.currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'app.wxss': '@tailwind utilities;',
      'pages/index/index.js': 'const cls = "bg-[#000015] text-[23.000015px]";',
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: ['app.wxss', 'pages/index/index.js'] }],
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
          tap: vi.fn(),
        },
      },
    }

    new MockedWeappTailwindcss().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(generateMock).toHaveBeenCalledTimes(1)
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates
    expect(candidates).toEqual(expect.any(Set))
    expect(candidates?.has('text-[100rpx]')).toBe(true)
    expect(candidates?.has('bg-[#000015]')).toBe(true)
    expect(candidates?.has('text-[23.000015px]')).toBe(true)
    expect(currentAssetStore['app.wxss']).toContain('bg-[#000015]')
    expect(currentAssetStore['app.wxss']).toContain('text-[23.000015px]')
  })

  it('feeds same-pass transformed v3 webpack js candidates into css generation during watch', async () => {
    const generateMock = vi.fn(async (options: { candidates?: Set<string> } = {}) => ({
      css: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      rawCss: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates ?? []),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })

    vi.resetModules()
    vi.doMock('@/bundlers/vite/source-scan', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-scan')>()
      return {
        ...actual,
        resolveViteSourceScanEntries: vi.fn(async () => ({
          entries: [],
          explicit: true,
        })),
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        importFallback: true,
        styleOptions: {},
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        dependencies: [],
      })),
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        baseFallbacks: [],
      })),
    }))

    const incrementalRuntimeManager = {
      reset: vi.fn(async () => undefined),
      sync: vi.fn(async () => new Set([
        'bg-[#000090]',
        'text-[23.000090px]',
      ])),
    }
    const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
    testState.currentContext = createContext({
      __internalWebpackRuntimeClassSetManager: incrementalRuntimeManager,
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      mainCssChunkMatcher: vi.fn(file => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
        options: {},
      },
    } as any)
    getCompilerContextMock.mockImplementation(() => testState.currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'app.wxss': '@tailwind utilities;',
      'pages/index/index.js': 'const cls = "bg-[#000090] text-[23.000090px]";',
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'main', hash: 'hash-1', files: ['app.wxss', 'pages/index/index.js'] }],
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
          tap: vi.fn(),
        },
      },
    }

    new MockedWeappTailwindcss().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['pages/index/index.js']).toContain('bg-_b_h000090_B')
    const candidates = generateMock.mock.calls[0]?.[0]?.candidates
    expect(candidates?.has('bg-[#000090]')).toBe(true)
    expect(candidates?.has('text-[23.000090px]')).toBe(true)
  })

  it('generates same-pass v3 webpack js candidates into the main css chunk when processed css assets include subpackages', async () => {
    const generateMock = vi.fn(async (options: { candidates?: Set<string> } = {}) => ({
      css: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      rawCss: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates ?? []),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })

    vi.resetModules()
    vi.doMock('@/bundlers/vite/source-scan', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-scan')>()
      return {
        ...actual,
        resolveViteSourceScanEntries: vi.fn(async () => ({
          entries: [],
          explicit: true,
        })),
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        importFallback: true,
        styleOptions: {},
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        dependencies: [],
      })),
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        baseFallbacks: [],
      })),
    }))

    const incrementalRuntimeManager = {
      reset: vi.fn(async () => undefined),
      sync: vi.fn(async () => new Set([
        'bg-[#000091]',
        'text-[23.000091px]',
      ])),
    }
    const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
    testState.currentContext = createContext({
      __internalWebpackRuntimeClassSetManager: incrementalRuntimeManager,
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      mainCssChunkMatcher: vi.fn(file => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
        options: {},
      },
    } as any)
    getCompilerContextMock.mockImplementation(() => testState.currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'app.wxss': '/*! css-loader */.user-entry{color:red}',
      'sub-normal/pages/index.wxss': '/*! css-loader */.sub-entry{color:blue}',
      'pages/index/index.js': 'const cls = "bg-[#000091] text-[23.000091px]";',
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [
        { id: 'main', hash: 'hash-1', files: ['app.wxss', 'pages/index/index.js'] },
        { id: 'sub-normal/pages/index', hash: 'hash-2', files: ['sub-normal/pages/index.wxss'] },
      ],
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
          tap: vi.fn(),
        },
      },
    }

    new MockedWeappTailwindcss().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(currentAssetStore['pages/index/index.js']).toContain('bg-_b_h000091_B')
    expect(currentAssetStore['app.wxss']).toContain('bg-[#000091]')
    expect(currentAssetStore['app.wxss']).toContain('text-[23.000091px]')
    expect(currentAssetStore['app.wxss']).toContain('.user-entry')
    expect(currentAssetStore['sub-normal/pages/index.wxss']).toBe('/*! css-loader */.sub-entry{color:blue}')
  })

  it('infers webpack entry css as the main css chunk for v3 watch generation when no public matcher is configured', async () => {
    const generateMock = vi.fn(async (options: { candidates?: Set<string> } = {}) => ({
      css: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      rawCss: [...(options.candidates ?? new Set<string>())].sort().join('\n'),
      target: 'weapp',
      classSet: new Set(options.candidates ?? []),
      dependencies: [],
      sources: [],
      root: null,
      version: 3,
    }))
    const realJsHandler = createJsHandler({
      escapeMap: undefined,
    })

    vi.resetModules()
    vi.doMock('@/bundlers/vite/source-scan', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/bundlers/vite/source-scan')>()
      return {
        ...actual,
        resolveViteSourceScanEntries: vi.fn(async () => ({
          entries: [],
          explicit: true,
        })),
      }
    })
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        importFallback: true,
        styleOptions: {},
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        dependencies: [],
      })),
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: process.cwd(),
        base: process.cwd(),
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: process.cwd(),
        baseFallbacks: [],
      })),
    }))

    const incrementalRuntimeManager = {
      reset: vi.fn(async () => undefined),
      sync: vi.fn(async () => new Set([
        'bg-[#000092]',
      ])),
    }
    const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
    testState.currentContext = createContext({
      __internalWebpackRuntimeClassSetManager: incrementalRuntimeManager,
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      jsHandler: vi.fn((code: string, classSet?: Set<string>, options?: Record<string, unknown>) =>
        realJsHandler(code, classSet, options as any)),
      mainCssChunkMatcher: vi.fn(() => false),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        getClassSet: vi.fn(async () => new Set<string>()),
        getClassSetSync: vi.fn(() => new Set<string>()),
        extract: vi.fn(async () => ({ classSet: new Set<string>() })),
        majorVersion: 4,
        options: {},
      },
    } as any)
    getCompilerContextMock.mockImplementation(() => testState.currentContext)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let currentAssetStore: Record<string, string> = {
      'entry/styles.bundle.wxss': '/*! css-loader */.user-entry{color:red}',
      'sub-normal/pages/index.wxss': '/*! css-loader */.sub-entry{color:blue}',
      'pages/index/index.js': 'const cls = "bg-[#000092]";',
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [
        { id: 'entry-runtime', hash: 'hash-1', files: ['entry/styles.bundle.wxss', 'pages/index/index.js'], hasRuntime: () => true },
        { id: 'sub-normal/pages/index', hash: 'hash-2', files: ['sub-normal/pages/index.wxss'] },
      ],
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
          tap: vi.fn(),
        },
      },
    }

    new MockedWeappTailwindcss().apply(compiler as any)
    await processAssetsCallbacks[0](createAssetsFromStore(currentAssetStore))

    expect(testState.currentContext.mainCssChunkMatcher).toHaveBeenCalledWith('entry/styles.bundle.wxss', undefined)
    expect(currentAssetStore['pages/index/index.js']).toContain('bg-_b_h000092_B')
    expect(currentAssetStore['entry/styles.bundle.wxss']).toContain('bg-[#000092]')
    expect(currentAssetStore['entry/styles.bundle.wxss']).toContain('.user-entry')
    expect(currentAssetStore['sub-normal/pages/index.wxss']).toBe('/*! css-loader */.sub-entry{color:blue}')
  })

})
