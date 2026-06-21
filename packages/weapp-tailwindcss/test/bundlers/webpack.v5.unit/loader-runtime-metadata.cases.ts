import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createBundlerGeneratedCssMarker, createCompilerWithLoaderTracking, createContext, getWebpackLoaderRuntime, isCssImportRewriteLoader, path, replaceWxml, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / loader runtime metadata', () => {
  setupWebpackV5UnitTest()
  it('prepares runtime metadata from the injected loader and tolerates token collection failures', async () => {
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
    testState.currentContext.tailwindRuntime.collectContentTokens = vi.fn(async () => {
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

    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === testState.currentContext.runtimeLoaderPath)
    const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
    expect(loaderRuntime?.classSet?.getClassSet).toEqual(expect.any(Function))
    expect(loaderRuntime?.classSet?.getWatchDependencies).toEqual(expect.any(Function))

    await loaderRuntime?.classSet?.getClassSet?.()
    await loaderRuntime?.classSet?.getClassSet?.()

    expect(testState.currentContext.tailwindRuntime.collectContentTokens).toHaveBeenCalledTimes(1)
    expect(testState.currentContext.tailwindRuntime.extract).toHaveBeenCalledTimes(1)

    const dependencies = loaderRuntime?.classSet?.getWatchDependencies?.()
    expect([...dependencies.files]).toEqual([
      '/workspace/tailwind.config.ts',
      '/workspace/src/app.css',
    ])
    expect([...dependencies.contexts]).toEqual(['/workspace/src'])
  })

  it('registers tailwindcss v4 cssSources from the injected css rewrite loader', async () => {
    testState.currentContext = createContext({
      rewriteCssImports: true,
    })
    testState.currentContext.tailwindRuntime.majorVersion = 4
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

    expect(testState.currentContext.tailwindcss?.v4?.cssSources).toEqual([
      {
        file: '/workspace/src/app.css',
        css: '@import "tailwindcss";\n@source inline("w-4");',
      },
    ])
    expect(testState.currentContext.refreshTailwindcssRuntime).toHaveBeenCalledTimes(1)
  })

  it('does not generate duplicated utilities when webpack loader output reaches processAssets', async () => {
    const generatedClass = replaceWxml('text-[40px]')
    testState.currentContext = createContext({
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
      tailwindRuntime: {
        ...createContext().tailwindRuntime,
        getClassSet: vi.fn(async () => new Set(['text-[40px]'])),
        getClassSetSync: vi.fn(() => new Set(['text-[40px]'])),
        extract: vi.fn(async () => ({ classSet: new Set(['text-[40px]']) })),
        majorVersion: 4,
        options: {
          tailwindcss: {
            v4: {
              cssEntries: ['/workspace/src/app.css'],
            },
          },
        },
      } as any,
    })

    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    let assetStore: Record<string, string> = {
      'app.wxss': [
        createBundlerGeneratedCssMarker('webpack', '/workspace/src/app.css'),
        `.${generatedClass}{font-size:40px}`,
      ].join('\n'),
    }
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [{ id: 'app', hash: 'hash-generated', files: ['app.wxss'] }],
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
    await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

    expect(testState.currentContext.styleHandler).not.toHaveBeenCalled()
    expect(assetStore['app.wxss']).not.toContain('weapp-tailwindcss webpack-generated-css')
    expect(assetStore['app.wxss']?.match(new RegExp(`\\.${generatedClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'))).toHaveLength(1)
  })

})
