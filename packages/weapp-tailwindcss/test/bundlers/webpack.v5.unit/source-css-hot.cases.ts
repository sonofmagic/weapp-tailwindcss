import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createContext, getWebpackLoaderRuntime, mkdir, mkdtemp, os, path, rm, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / registered source css hot updates', () => {
  setupWebpackV5UnitTest()
  it('refreshes webpack registered source css options after style hot updates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-webpack-source-css-hot-'))
    const sourceCssFile = path.join(root, 'src/pages/index/index.css')
    const firstSourceCss = '.tw-watch-style-case { color: red; }'
    const secondSourceCss = '.tw-watch-style-case { @apply font-bold; color: red; }'
    const generatedCss = '.tw-watch-style-case{font-weight:700;color:red}'

    vi.resetModules()
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: vi.fn(),
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        importFallback: true,
        styleOptions: {},
        tailwindcssV3Compatibility: true,
      })),
      resolveTailwindV3Source: vi.fn(async (options: any) => ({
        projectRoot: root,
        cwd: root,
        base: options.base ?? root,
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        configObject: {
          content: [],
        },
        dependencies: [],
        version: 3,
      })),
      resolveTailwindV3SourceFromPatcher: vi.fn(async () => ({
        projectRoot: root,
        cwd: root,
        base: root,
        baseFallbacks: [],
        css: '@tailwind utilities;',
        dependencies: [],
        configObject: {
          content: [],
        },
        version: 3,
      })),
      resolveTailwindV3SourceOptionsFromPatcher: vi.fn(() => ({
        projectRoot: root,
        cwd: root,
        baseFallbacks: [],
      })),
    }))

    try {
      await mkdir(path.dirname(sourceCssFile), { recursive: true })
      const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
      testState.currentContext = createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn(() => false),
        styleHandler: vi.fn(async (code: string, options: any) => ({
          css: options?.sourceOptions?.sourceCss?.includes('@apply font-bold')
            ? generatedCss
            : `handled:${code}`,
        })),
        tailwindcssBasedir: root,
      } as any)

      const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
      let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
      let assetStore: Record<string, string> = {
        'pages/index/index.wxss': firstSourceCss,
      }
      const compilation = {
        compiler: { outputPath: path.join(root, 'dist') },
        chunks: [{ id: 'page', hash: 'hash-1', files: ['pages/index/index.wxss'] }],
        hooks: {
          processAssets: {
            tapPromise: (_options: unknown, handler: (assets: Record<string, any>) => Promise<void>) => {
              processAssetsCallbacks.push(handler)
            },
          },
        },
        updateAsset: vi.fn((file: string, source: FakeConcatSource) => {
          assetStore[file] = source.toString()
        }),
        getAsset(file: string) {
          const content = assetStore[file]
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
        outputPath: path.join(root, 'dist'),
        options: {
          watch: true,
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
                tap: (_name: string, handler: (loaderContext: any, module: LoaderModule) => void) => {
                  loaderHandler = handler
                },
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

      new MockedWeappTailwindcss().apply(compiler as any)
      const sourceCssModule: LoaderModule = {
        loaders: [{ loader: '/path/postcss-loader.js' }],
        resource: sourceCssFile,
      }
      loaderHandler?.({}, sourceCssModule)
      const classSetLoaderEntry = sourceCssModule.loaders.find(entry => entry.loader === testState.currentContext.runtimeLoaderPath)
      const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
      loaderRuntime?.classSet?.registerCssSourceFile?.({
        file: sourceCssFile,
        css: firstSourceCss,
      })

      await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

      loaderRuntime?.classSet?.registerCssSourceFile?.({
        file: sourceCssFile,
        css: secondSourceCss,
      })
      await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

      expect(testState.currentContext.styleHandler).toHaveBeenCalledTimes(2)
      expect(testState.currentContext.styleHandler.mock.calls.at(-1)?.[0]).toBe(secondSourceCss)
      expect(testState.currentContext.styleHandler.mock.calls.at(-1)?.[1]?.sourceOptions?.sourceCss).toContain('@apply font-bold')
      expect(assetStore['pages/index/index.wxss']).toContain('font-weight:700')
    }
    finally {
      vi.doUnmock('@/generator')
      vi.resetModules()
      await rm(root, { force: true, recursive: true })
    }
  })

})
