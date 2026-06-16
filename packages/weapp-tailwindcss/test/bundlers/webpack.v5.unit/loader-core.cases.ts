import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createCompilerWithLoaderTracking, createContext, getCompilerContextMock, isCssImportRewriteLoader, path, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / loader core wiring', () => {
  setupWebpackV5UnitTest()
  it('forwards tailwindcssImportRewrite options when tailwindcss v4 detected', () => {
    let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
    const compilation = {
      compiler: { outputPath: path.resolve(process.cwd(), 'dist') },
      chunks: [],
      hooks: {
        processAssets: {
          tapPromise: vi.fn(),
        },
      },
      updateAsset: vi.fn(),
      getAsset: vi.fn(),
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
    const module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    loaderHandler?.({}, module)
    const classSetLoaderEntry = module.loaders.find(entry => entry.loader === testState.currentContext.runtimeLoaderPath)
    const rewriteLoaderEntry = module.loaders.find(entry => isCssImportRewriteLoader(entry))
    expect(classSetLoaderEntry).toBeDefined()
    expect(rewriteLoaderEntry).toBeDefined()
    expect(rewriteLoaderEntry?.options?.tailwindcssImportRewriteRuntimeKey).toEqual(expect.any(String))
    expect(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey).toBe(rewriteLoaderEntry?.options?.tailwindcssImportRewriteRuntimeKey)
    expect(classSetLoaderEntry?.ident).toBeNull()
    expect(rewriteLoaderEntry?.ident).toBeNull()
    const classSetIndex = module.loaders.indexOf(classSetLoaderEntry!)
    const postcssIndex = module.loaders.findIndex(entry => entry.loader.includes('postcss-loader'))
    const rewriteIndex = module.loaders.indexOf(rewriteLoaderEntry!)
    expect(classSetIndex).toBeLessThan(postcssIndex)
    expect(rewriteIndex).toBeGreaterThan(postcssIndex)
  })

  it('uses safe runtime keys so runtime options are not serialized into webpack requests', () => {
    testState.currentContext = createContext({
      ...testState.currentContext,
      customReplaceDictionary: {
        '!': '_e',
        '#': '_h',
        '/': '_f',
      },
    } as any)
    testState.currentContext.twPatcher.majorVersion = 4
    getCompilerContextMock.mockReturnValue(testState.currentContext)
    const { compiler, getLoaderHandler } = createCompilerWithLoaderTracking()
    new WeappTailwindcss().apply(compiler as any)

    const module: LoaderModule = {
      resource: '/workspace/src/app.css',
      loaders: [{ loader: '/path/postcss-loader.js' }],
    }
    getLoaderHandler()?.({}, module)

    const rewriteLoaderEntry = module.loaders.find(isCssImportRewriteLoader)
    const serializedRequest = `${rewriteLoaderEntry?.loader}?${JSON.stringify(rewriteLoaderEntry?.options)}`
    expect(rewriteLoaderEntry?.options).toEqual({
      tailwindcssImportRewriteRuntimeKey: expect.any(String),
    })
    expect(serializedRequest).not.toContain('customReplaceDictionary')
    expect(serializedRequest).not.toContain('"_e"')
    expect(serializedRequest).not.toContain('!')
  })

})
