import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createContext, getCompilerContextMock, isCssImportRewriteLoader, path, testState, WeappTailwindcss } from './shared'
describe('bundlers/webpack WeappTailwindcss / web css rewrite loader', () => {
  setupWebpackV5UnitTest()
  it('propagates linked js asset updates', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const outDir = path.resolve(process.cwd(), 'dist')
    let currentAssetStore: Record<string, string> = {}
    const updateAsset = vi.fn((file: string, source: FakeConcatSource) => {
      currentAssetStore[file] = source.toString()
    })
    const compilation = {
      compiler: { outputPath: outDir },
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
          tap: (_name: string, handler: (compilationParam: any) => void) => {
            handler(compilation)
          },
        },
      },
    }

    testState.currentContext = createContext({
      jsHandler: vi.fn(async (code: string, _runtime: Set<string>, options?: { filename?: string }) => {
        if (options?.filename?.endsWith('index.js')) {
          return {
            code: `js:${code}`,
            linked: {
              [path.resolve(outDir, 'chunk.js')]: { code: 'linked:chunk' },
              [path.resolve(outDir, 'external.js')]: { code: 'linked:external' },
              [path.resolve(outDir, 'missing.js')]: { code: 'linked:missing' },
              [path.resolve(outDir, 'same.js')]: { code: 'const same = "beta";' },
            },
          }
        }
        return { code }
      }),
    })
    getCompilerContextMock.mockReturnValue(testState.currentContext)

    const plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)

    const assetStore = {
      'index.js': 'import "./chunk.js";',
      'chunk.js': 'import { bar } from "./dep"; export const foo = bar;',
      'same.js': 'const same = "beta";',
    }
    currentAssetStore = assetStore
    const assetsRun = createAssetsFromStore({
      ...assetStore,
      'missing.js': 'missing',
      'orphan.js': 'orphan',
    })
    await processAssetsCallbacks[0](assetsRun)

    expect(testState.currentContext.jsHandler).toHaveBeenCalledTimes(2)
    const chunkUpdate = updateAsset.mock.calls.find(([file]) => file === 'chunk.js')
    expect(chunkUpdate?.[1].toString()).toBe('linked:chunk')
    const onUpdateCalls = testState.currentContext.onUpdate.mock.calls.filter(([file]) => file === 'chunk.js')
    expect(onUpdateCalls.some(([, , updated]) => updated === 'linked:chunk')).toBe(true)
    expect(testState.currentContext.onUpdate.mock.calls.some(([file]) => file === 'same.js')).toBe(false)
    expect(updateAsset.mock.calls.some(([file]) => file === 'missing.js')).toBe(false)
    expect(updateAsset.mock.calls.some(([file]) => file === 'orphan.js')).toBe(false)

    const [firstCall] = testState.currentContext.jsHandler.mock.calls
    const options = firstCall?.[2]
    expect(options?.moduleGraph?.resolve?.('./chunk.js', options.filename ?? '')).toBe(path.resolve(outDir, 'chunk.js'))
    expect(options?.moduleGraph?.load?.(path.resolve(outDir, 'chunk.js'))).toContain('bar')
    expect(options?.moduleGraph?.load?.(path.resolve(outDir, 'missing.js'))).toBeUndefined()
    expect(options?.moduleGraph?.filter?.(path.resolve(outDir, 'orphan.js'))).toBe(true)
    expect(options?.moduleGraph?.filter?.(path.resolve(outDir, 'external.js'))).toBe(false)
  })

  it('applies css import rewrite for tailwindcss v4 and web generator projects', () => {
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
        Compilation: { PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage') },
        sources: { ConcatSource: FakeConcatSource },
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
        normalModuleFactory: { tap: vi.fn() },
        compilation: {
          tap: (_name: string, handler: (_compilation: any) => void) => {
            handler(compilation)
          },
        },
        emit: { tapPromise: vi.fn() },
      },
    }

    const ctxV4 = createContext()
    ctxV4.twPatcher.majorVersion = 4
    getCompilerContextMock.mockImplementationOnce(() => ctxV4)
    let plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    const v4Module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
      resource: '/abs/app.css',
    }
    loaderHandler?.({}, v4Module)
    expect(v4Module.loaders.some(entry => isCssImportRewriteLoader(entry))).toBe(true)

    const ctxV3 = createContext()
    ctxV3.twPatcher.majorVersion = 3
    getCompilerContextMock.mockImplementationOnce(() => ctxV3)
    loaderHandler = undefined
    plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    const v3Module: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
      resource: '/abs/app.css',
    }
    loaderHandler?.({}, v3Module)
    expect(v3Module.loaders.some(entry => isCssImportRewriteLoader(entry))).toBe(false)

    const ctxV3Web = createContext({
      generator: {
        target: 'web',
      },
    })
    ctxV3Web.twPatcher.majorVersion = 3
    getCompilerContextMock.mockImplementationOnce(() => ctxV3Web)
    loaderHandler = undefined
    plugin = new WeappTailwindcss()
    plugin.apply(compiler as any)
    const v3WebModule: LoaderModule = {
      loaders: [{ loader: '/path/postcss-loader.js' }],
      resource: '/abs/app.css',
    }
    loaderHandler?.({}, v3WebModule)
    expect(v3WebModule.loaders.some(entry => isCssImportRewriteLoader(entry))).toBe(true)
    expect(v3WebModule.loaders.some(entry => entry.loader === ctxV3Web.runtimeLoaderPath)).toBe(false)
  })
})
