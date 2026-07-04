import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createBundlerGeneratedCssMarker, createContext, getWebpackLoaderRuntime, isCssImportRewriteLoader, path, testState, WeappTailwindcss } from './shared'

describe('bundlers/webpack WeappTailwindcss / registered source css mpx main', () => {
  setupWebpackV5UnitTest()

  it('does not duplicate mpx app css generation into empty page css assets', async () => {
    const projectRoot = path.resolve('/workspace')
    const sourceCssFile = path.join(projectRoot, 'src/app.css')
    const generatedCss = [
      createBundlerGeneratedCssMarker('webpack', sourceCssFile),
      `/* tokens: test-class <= ${sourceCssFile} */`,
      '.test-class { color: #040506; }',
    ].join('\n')
    testState.currentContext = createContext({
      appType: 'mpx',
      rewriteCssImports: true,
      cssEntries: [sourceCssFile],
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: `handled:${code}` })),
      tailwindRuntime: {
        ...createContext().tailwindRuntime,
        getClassSet: vi.fn(async () => new Set(['test-class'])),
        getClassSetSync: vi.fn(() => new Set(['test-class'])),
        extract: vi.fn(async () => ({ classSet: new Set(['test-class']) })),
        majorVersion: 4,
        options: {
          projectRoot,
          tailwindcss: {
            v4: {
              cssEntries: [sourceCssFile],
            },
          },
        },
      } as any,
      tailwindcssBasedir: projectRoot,
    } as any)

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
    let assetStore: Record<string, string> = {
      'app.wxss': generatedCss,
      'pages/component/index.wxss': generatedCss,
    }
    const compilation = {
      compiler: { outputPath: path.join(projectRoot, 'dist/wx') },
      chunks: [
        {
          id: 'app',
          hash: 'hash-app-css',
          files: ['app.wxss'],
          hasRuntime: () => true,
        },
        {
          id: 'pages/component/index',
          hash: 'hash-page-css',
          files: ['pages/component/index.wxss'],
        },
      ],
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

    new WeappTailwindcss().apply(compiler as any)
    const sourceCssModule: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
      resource: sourceCssFile,
    }
    loaderHandler?.({}, sourceCssModule)
    const rewriteLoaderEntry = sourceCssModule.loaders.find(isCssImportRewriteLoader)
    const loaderRuntime = getWebpackLoaderRuntime(rewriteLoaderEntry?.options?.tailwindcssImportRewriteRuntimeKey)
    loaderRuntime?.cssImportRewrite?.registerCssSourceFile?.({
      file: sourceCssFile,
      css: [
        '@import "tailwindcss";',
        '@source "./pages";',
      ].join('\n'),
      processed: false,
    })
    loaderRuntime?.cssImportRewrite?.registerGeneratedCss?.({
      classSet: new Set(['test-class']),
      css: generatedCss,
      dependencies: [sourceCssFile],
      file: sourceCssFile,
    })
    loaderRuntime?.cssImportRewrite?.markGeneratedCssSource?.(sourceCssFile)

    await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

    expect(assetStore['app.wxss']?.match(/\.test-class/g)).toHaveLength(1)
    expect(assetStore['pages/component/index.wxss']).not.toContain('.test-class')
    expect(testState.currentContext.styleHandler).not.toHaveBeenCalled()
  })
})
