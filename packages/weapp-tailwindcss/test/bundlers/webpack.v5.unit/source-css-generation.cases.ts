import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createContext, getWebpackLoaderRuntime, mkdir, mkdtemp, os, path, rm, testState, WeappTailwindcss, writeFile } from './shared'
describe('bundlers/webpack WeappTailwindcss / registered source css generation', () => {
  setupWebpackV5UnitTest()
  it('generates Taro webpack v4 css from loader registered source css when final wxss has no Tailwind directives', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-webpack-v4-source-css-'))
    const sourceCssFile = path.join(root, 'src/sub-normal/pages/index.css')
    const sourceCss = [
      '@import "tailwindcss" source(none);',
      '@config "../../../tailwind.config.sub-normal.js";',
      '@source "../**/*.{css,ts,js,vue,html}";',
    ].join('\n')
    const generatedCss = '.bg-normal-subpackage-marker{background-color:#2563eb}'
    const generateMock = vi.fn(async () => ({
      css: generatedCss,
      rawCss: generatedCss,
      target: 'weapp',
      classSet: new Set(['bg-normal-subpackage-marker']),
      dependencies: [],
      sources: [],
      root: null,
    }))

    vi.resetModules()
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn(() => ({
        generate: generateMock,
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        importFallback: true,
        styleOptions: {},
        tailwindcssV3Compatibility: true,
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: root,
        base: options.base,
        baseFallbacks: [],
        css: options.css,
        dependencies: [],
      })),
      resolveTailwindV4SourceFromPatcher: vi.fn(async () => ({
        projectRoot: root,
        base: root,
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromPatcher: vi.fn(() => ({
        projectRoot: root,
        baseFallbacks: [],
      })),
    }))

    try {
      await mkdir(path.dirname(sourceCssFile), { recursive: true })
      await writeFile(sourceCssFile, sourceCss, { encoding: 'utf8' })
      await writeFile(path.join(root, 'tailwind.config.sub-normal.js'), 'module.exports = { content: [] }')

      const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
      testState.currentContext = createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn(() => false),
        styleHandler: vi.fn(async (code: string) => ({ css: `handled:${code}` })),
        tailwindcssBasedir: root,
        twPatcher: {
          ...createContext().twPatcher,
          majorVersion: 4,
          getClassSet: vi.fn(async () => new Set(['bg-normal-subpackage-marker'])),
          getClassSetSync: vi.fn(() => new Set(['bg-normal-subpackage-marker'])),
          extract: vi.fn(async () => ({ classSet: new Set(['bg-normal-subpackage-marker']) })),
        },
      } as any)

      const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
      let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
      let assetStore: Record<string, string> = {
        'sub-normal/pages/index.wxss': 'view,text{box-sizing:border-box}',
      }
      const compilation = {
        compiler: { outputPath: path.join(root, 'dist') },
        chunks: [{ id: 'sub-normal', hash: 'hash-source-css', files: ['sub-normal/pages/index.wxss'] }],
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
        options: {},
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
        css: sourceCss,
      })

      await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

      expect(generateMock).toHaveBeenCalledTimes(1)
      expect(testState.currentContext.styleHandler).not.toHaveBeenCalled()
      expect(assetStore['sub-normal/pages/index.wxss']).toContain('.bg-normal-subpackage-marker')
      expect(assetStore['sub-normal/pages/index.wxss']).not.toContain('handled:')
    }
    finally {
      vi.doUnmock('@/generator')
      vi.resetModules()
      await rm(root, { force: true, recursive: true })
    }
  })

})
