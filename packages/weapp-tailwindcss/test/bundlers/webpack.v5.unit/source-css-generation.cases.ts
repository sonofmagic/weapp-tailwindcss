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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: root,
        base: root,
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
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
        tailwindRuntime: {
          ...createContext().tailwindRuntime,
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

  it('keeps webpack extracted third-party css when generation uses registered source css', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-webpack-v4-source-css-user-'))
    const sourceCssFile = path.join(root, 'src/pages/index/index.css')
    const sourceCss = [
      '@import "./third-party-ui.css";',
      '@import "tailwindcss" source(none);',
      '@config "../../../tailwind.config.js";',
      '@source "../**/*.{css,ts,js,tsx}";',
      '.tw-page-style-watch-anchor{color:inherit}',
    ].join('\n')
    const extractedCss = [
      '.weapp-tw-user-ui-card{display:inline-flex;color:#175e75}',
      '@keyframes weappTwUserUiBreathe{50%{opacity:.65}}',
      '.tw-page-style-watch-anchor{color:inherit}',
      '.nut-icon{display:inline-block;width:var(--nut-icon-width,32rpx)}',
      '.nut-icon-loading{animation:rotation 1s linear infinite}',
      '@keyframes rotation{to{transform:rotate(360deg)}}',
    ].join('\n')
    const generatedCss = '.bg-page-marker{background-color:#2563eb}'
    const generateMock = vi.fn(async () => ({
      css: generatedCss,
      rawCss: generatedCss,
      target: 'weapp',
      classSet: new Set(['bg-page-marker']),
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: root,
        base: root,
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: root,
        baseFallbacks: [],
      })),
    }))

    try {
      await mkdir(path.dirname(sourceCssFile), { recursive: true })
      await writeFile(sourceCssFile, sourceCss, { encoding: 'utf8' })
      await writeFile(path.join(path.dirname(sourceCssFile), 'third-party-ui.css'), '.weapp-tw-user-ui-card{display:inline-flex;color:#175e75}')
      await writeFile(path.join(root, 'tailwind.config.js'), 'module.exports = { content: [] }')

      const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
      testState.currentContext = createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn(() => false),
        styleHandler: vi.fn(async (code: string) => ({ css: code })),
        tailwindcssBasedir: root,
        tailwindRuntime: {
          ...createContext().tailwindRuntime,
          majorVersion: 4,
          getClassSet: vi.fn(async () => new Set(['bg-page-marker'])),
          getClassSetSync: vi.fn(() => new Set(['bg-page-marker'])),
          extract: vi.fn(async () => ({ classSet: new Set(['bg-page-marker']) })),
        },
      } as any)

      const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
      let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
      let assetStore: Record<string, string> = {
        'pages/index/index.wxss': extractedCss,
      }
      const compilation = {
        compiler: { outputPath: path.join(root, 'dist') },
        chunks: [{ id: 'pages/index/index', hash: 'hash-source-css-user', files: ['pages/index/index.wxss'] }],
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

      const css = assetStore['pages/index/index.wxss'] ?? ''
      expect(generateMock).toHaveBeenCalledTimes(1)
      expect(css).toContain('.bg-page-marker')
      expect(css).toContain('.weapp-tw-user-ui-card')
      expect(css).toContain('@keyframes weappTwUserUiBreathe')
      expect(css).toContain('.tw-page-style-watch-anchor')
      expect(css).toContain('.nut-icon')
      expect(css).toContain('.nut-icon-loading')
      expect(css).toContain('@keyframes rotation')
      expect(css).not.toContain('@import "./third-party-ui.css"')
      expect(css).not.toContain('@import "tailwindcss"')
    }
    finally {
      vi.doUnmock('@/generator')
      vi.resetModules()
      await rm(root, { force: true, recursive: true })
    }
  })

  it('keeps webpack extracted third-party css when v3 generated css is already in the asset', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-webpack-v3-generated-user-'))
    const appCssFile = path.join(root, 'src/app.css')
    const sourceCss = [
      '@config "../tailwind.config.js";',
      '@tailwind base;',
      '@tailwind components;',
      '@tailwind utilities;',
    ].join('\n')
    const generatedRawCss = [
      '/*! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com */',
      '.bg-page-marker{background-color:#2563eb}',
    ].join('\n')
    const extractedCss = [
      generatedRawCss,
      '.weapp-tw-user-ui-card{display:inline-flex;color:#175e75}',
      '.weapp-tw-user-ui-loading{animation:weappTwUserUiRotation 1s linear infinite}',
      '@keyframes weappTwUserUiRotation{to{transform:rotate(360deg)}}',
    ].join('\n')
    const generateMock = vi.fn(async () => ({
      css: generatedRawCss,
      rawCss: generatedRawCss,
      target: 'weapp',
      classSet: new Set(['bg-page-marker']),
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
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: root,
        base: root,
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: root,
        baseFallbacks: [],
      })),
      resolveTailwindV3SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: root,
        base: root,
        baseFallbacks: [],
      })),
      resolveTailwindV3Source: vi.fn(async (options: any) => ({
        projectRoot: root,
        base: options.base,
        baseFallbacks: [],
        css: options.css,
        dependencies: [],
      })),
      resolveTailwindV3SourceFromRuntime: vi.fn(async () => ({
        projectRoot: root,
        base: root,
        baseFallbacks: [],
        css: sourceCss,
        dependencies: [],
      })),
    }))

    try {
      await mkdir(path.dirname(appCssFile), { recursive: true })
      await writeFile(appCssFile, sourceCss, { encoding: 'utf8' })
      await writeFile(path.join(root, 'tailwind.config.js'), 'module.exports = { content: [] }')

      const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
      testState.currentContext = createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn(() => true),
        styleHandler: vi.fn(async (code: string) => ({ css: code })),
        tailwindcssBasedir: root,
        tailwindRuntime: {
          ...createContext().tailwindRuntime,
          majorVersion: 3,
          getClassSet: vi.fn(async () => new Set(['bg-page-marker'])),
          getClassSetSync: vi.fn(() => new Set(['bg-page-marker'])),
          extract: vi.fn(async () => ({ classSet: new Set(['bg-page-marker']) })),
        },
      } as any)

      const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
      let loaderHandler: ((loaderContext: any, module: LoaderModule) => void) | undefined
      let assetStore: Record<string, string> = {
        'app.wxss': extractedCss,
      }
      const compilation = {
        compiler: { outputPath: path.join(root, 'dist') },
        chunks: [{ id: 'app', hash: 'hash-v3-generated-user', files: ['app.wxss'] }],
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
        resource: appCssFile,
      }
      loaderHandler?.({}, sourceCssModule)
      const classSetLoaderEntry = sourceCssModule.loaders.find(entry => entry.loader === testState.currentContext.runtimeLoaderPath)
      const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
      loaderRuntime?.classSet?.registerCssSourceFile?.({
        file: appCssFile,
        css: sourceCss,
      })

      await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

      const css = assetStore['app.wxss'] ?? ''
      expect(generateMock).toHaveBeenCalledTimes(1)
      expect(css).toContain('.bg-page-marker')
      expect(css).toContain('.weapp-tw-user-ui-card')
      expect(css).toContain('.weapp-tw-user-ui-loading')
      expect(css).toContain('@keyframes weappTwUserUiRotation')
      expect(css.match(/\.bg-page-marker/g)).toHaveLength(1)
      expect(css).not.toContain('@tailwind utilities')
    }
    finally {
      vi.doUnmock('@/generator')
      vi.resetModules()
      await rm(root, { force: true, recursive: true })
    }
  })

})
