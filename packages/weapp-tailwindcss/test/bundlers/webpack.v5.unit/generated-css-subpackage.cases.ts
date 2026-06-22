import { describe, expect, it, vi } from 'vitest'
import type { LoaderModule } from './shared'
import { setupWebpackV5UnitTest, FakeConcatSource, createAssetsFromStore, createContext, fs, getWebpackLoaderRuntime, mkdir, mkdtemp, os, path, rm, testState, WeappTailwindcss, writeFile } from './shared'

function toPosixPath(value: string) {
  return value.replace(/\\/g, '/')
}

describe('bundlers/webpack WeappTailwindcss / generated css subpackages', () => {
  setupWebpackV5UnitTest()
  it('scopes webpack Tailwind v4 subpackage css generation to each config content entry', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-webpack-v4-subpackage-'))
    const srcDir = path.join(dir, 'src')
    const appCss = path.join(srcDir, 'app.wxss')
    const moduleBCss = path.join(srcDir, 'moduleB/pages/index.wxss')
    const moduleCCss = path.join(srcDir, 'moduleC/pages/index.wxss')
    const subNormalCss = path.join(srcDir, 'sub-normal/pages/index.css')
    const appWxml = path.join(srcDir, 'pages/index/index.wxml')
    const moduleBWxml = path.join(srcDir, 'moduleB/pages/index.wxml')
    const moduleCWxml = path.join(srcDir, 'moduleC/pages/index.wxml')
    const subNormalWxml = path.join(srcDir, 'sub-normal/pages/index.wxml')
    await fs.promises.mkdir(path.dirname(appWxml), { recursive: true })
    await fs.promises.mkdir(path.dirname(moduleBWxml), { recursive: true })
    await fs.promises.mkdir(path.dirname(moduleCWxml), { recursive: true })
    await fs.promises.mkdir(path.dirname(subNormalWxml), { recursive: true })
    await writeFile(path.join(dir, 'tailwind.config.js'), 'module.exports = { content: ["./src/pages/**/*.{wxml,ts}"] }')
    await writeFile(path.join(dir, 'tailwind.config.sub-b.js'), 'module.exports = { content: ["./src/moduleB/**/*.{wxml,ts}"] }')
    await writeFile(path.join(dir, 'tailwind.config.sub-c.js'), 'module.exports = { content: ["./src/moduleC/**/*.{wxml,ts}"] }')
    await writeFile(path.join(dir, 'tailwind.config.sub-normal.js'), 'module.exports = { content: ["./src/sub-normal/**/*.{wxml,ts}"] }')
    await writeFile(appCss, [
      '@config "../tailwind.config.js";',
      '@tailwind utilities;',
    ].join('\n'))
    await writeFile(moduleBCss, [
      '@config "../../../tailwind.config.sub-b.js";',
      '@tailwind utilities;',
    ].join('\n'))
    await writeFile(moduleCCss, [
      '@config "../../../tailwind.config.sub-c.js";',
      '@tailwind utilities;',
    ].join('\n'))
    await writeFile(subNormalCss, [
      '@import "tailwindcss/base";',
      '@import "tailwindcss/components";',
      '@import "tailwindcss/utilities";',
      '@config "../../../tailwind.config.sub-normal.js";',
    ].join('\n'))
    await writeFile(appWxml, '<view class="app-only"></view>')
    await writeFile(moduleBWxml, '<view class="module-b-only"></view>')
    await writeFile(moduleCWxml, '<view class="module-c-only"></view>')
    await writeFile(subNormalWxml, '<view class="normal-only"></view>')

    const generateMock = vi.fn(async ({ candidates }: { candidates: Set<string> }) => ({
      css: [...candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      rawCss: [...candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: new Set(candidates),
      dependencies: [],
      sources: [],
      root: null,
    }))
    vi.resetModules()
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn((source: any) => ({
        generate: (options: any) => generateMock({
          ...options,
          source,
        }),
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        styleOptions: {},
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: dir,
        base: dir,
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        dependencies: options.config ? [options.config] : [],
      })),
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: dir,
        base: dir,
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: dir,
        baseFallbacks: [],
      })),
    }))

    try {
      const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
      testState.currentContext = createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
        styleHandler: vi.fn(async (code: string) => ({ css: code })),
        tailwindcssBasedir: dir,
        tailwindRuntime: {
          ...createContext().tailwindRuntime,
          majorVersion: 4,
        },
      } as any)

      const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
      let assetStore: Record<string, string> = {
        'app.wxss': '@tailwind utilities;',
        'moduleB/pages/index.wxss': '@tailwind utilities;',
        'moduleC/pages/index.wxss': '@tailwind utilities;',
        'sub-normal/pages/index.wxss': '@tailwind utilities;',
      }
      const compilation = {
        compiler: { outputPath: path.join(dir, 'dist') },
        chunks: [
          { id: 'app', hash: 'hash-app', files: ['app.wxss'] },
          { id: 'module-b', hash: 'hash-module-b', files: ['moduleB/pages/index.wxss'] },
          { id: 'module-c', hash: 'hash-module-c', files: ['moduleC/pages/index.wxss'] },
          { id: 'sub-normal', hash: 'hash-sub-normal', files: ['sub-normal/pages/index.wxss'] },
        ],
        chunkGraph: {
          getChunkModulesIterable: (chunk: { id?: string }) => {
            if (chunk.id === 'app') {
              return [{ resource: appCss }]
            }
            if (chunk.id === 'module-b') {
              return [{ resource: moduleBCss }]
            }
            if (chunk.id === 'module-c') {
              return [{ resource: moduleCCss }]
            }
            if (chunk.id === 'sub-normal') {
              return [{ resource: subNormalCss }]
            }
            return []
          },
        },
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
        outputPath: path.join(dir, 'dist'),
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

      new MockedWeappTailwindcss().apply(compiler as any)
      const loaderHook = compiler.webpack.NormalModule.getCompilationHooks.mock.results[0]?.value?.loader?.tap.mock.calls[0]?.[1]
      const appModule: LoaderModule = {
        resource: appCss,
        loaders: [{ loader: '/path/postcss-loader.js' }],
      }
      const moduleBModule: LoaderModule = {
        resource: moduleBCss,
        loaders: [{ loader: '/path/postcss-loader.js' }],
      }
      const moduleCModule: LoaderModule = {
        resource: moduleCCss,
        loaders: [{ loader: '/path/postcss-loader.js' }],
      }
      const subNormalModule: LoaderModule = {
        resource: subNormalCss,
        loaders: [{ loader: '/path/postcss-loader.js' }],
      }
      loaderHook?.({}, appModule)
      loaderHook?.({}, moduleBModule)
      loaderHook?.({}, moduleCModule)
      loaderHook?.({}, subNormalModule)
      for (const [module, cssFile] of [
        [appModule, appCss],
        [moduleBModule, moduleBCss],
        [moduleCModule, moduleCCss],
        [subNormalModule, subNormalCss],
      ] as const) {
        const classSetLoaderEntry = module.loaders.find(entry => entry.loader === testState.currentContext.runtimeLoaderPath)
        const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
        loaderRuntime?.classSet?.registerCssSourceFile?.({
          file: cssFile,
          css: await fs.promises.readFile(cssFile, 'utf8'),
        })
      }
      await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

      const callsByFile = new Map<string, Set<string>>()
      for (const call of generateMock.mock.calls) {
        const source = call[0]?.source
        const config = source?.config
          ?? [
            'tailwind.config.sub-normal.js',
            'tailwind.config.sub-b.js',
            'tailwind.config.sub-c.js',
            'tailwind.config.js',
          ]
            .map(file => path.join(dir, file))
            .find(file => source?.css?.includes(toPosixPath(file)) || source?.css?.includes(file))
        callsByFile.set(config ? toPosixPath(config) : config, call[0]?.candidates as Set<string>)
      }
      expect(callsByFile.get(toPosixPath(path.join(dir, 'tailwind.config.js')))).toEqual(new Set(['app-only']))
      expect(callsByFile.get(toPosixPath(path.join(dir, 'tailwind.config.sub-b.js')))).toEqual(new Set(['module-b-only']))
      expect(callsByFile.get(toPosixPath(path.join(dir, 'tailwind.config.sub-c.js')))).toEqual(new Set(['module-c-only']))
      expect(callsByFile.get(toPosixPath(path.join(dir, 'tailwind.config.sub-normal.js')))).toEqual(new Set(['normal-only']))
    }
    finally {
      vi.doUnmock('@/generator')
      vi.resetModules()
      await rm(dir, { force: true, recursive: true })
    }
  })

  it('does not merge main runtime candidates into webpack Tailwind v4 subpackage css', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-webpack-v4-subpackage-runtime-'))
    const srcDir = path.join(dir, 'src')
    const subNormalCss = path.join(srcDir, 'sub-normal/pages/index.css')
    const appCss = path.join(srcDir, 'app.css')
    const appWxml = path.join(srcDir, 'pages/index/index.wxml')
    const subNormalWxml = path.join(srcDir, 'sub-normal/pages/index.wxml')
    await fs.promises.mkdir(path.dirname(appWxml), { recursive: true })
    await fs.promises.mkdir(path.dirname(subNormalWxml), { recursive: true })
    await writeFile(path.join(dir, 'tailwind.config.js'), 'module.exports = { content: ["./src/pages/**/*.{wxml,ts}"] }')
    await writeFile(path.join(dir, 'tailwind.config.sub-normal.js'), [
      'module.exports = {',
      '  content: ["./src/sub-normal/**/*.{wxml,ts}"],',
      '  theme: { extend: { colors: { "normal-subpackage-marker": "#2563eb" } } },',
      '}',
    ].join('\n'))
    await writeFile(subNormalCss, [
      '@import "tailwindcss/base";',
      '@import "tailwindcss/components";',
      '@import "tailwindcss/utilities";',
      '@config "../../../tailwind.config.sub-normal.js";',
    ].join('\n'))
    await writeFile(appCss, [
      '@import "tailwindcss/base";',
      '@import "tailwindcss/components";',
      '@import "tailwindcss/utilities";',
      '@config "../tailwind.config.js";',
    ].join('\n'))
    await writeFile(appWxml, '<view class="main-only"></view>')
    await writeFile(subNormalWxml, '<view class="bg-normal-subpackage-marker sub-only"></view>')

    const generateMock = vi.fn(async ({ candidates }: { candidates: Set<string> }) => ({
      css: [...candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      rawCss: [...candidates].sort().map(candidate => `.${candidate}{}`).join('\n'),
      target: 'weapp',
      classSet: new Set(candidates),
      dependencies: [],
      sources: [],
      root: null,
    }))
    vi.resetModules()
    vi.doMock('@/generator', () => ({
      createWeappTailwindcssGenerator: vi.fn((source: any) => ({
        generate: (options: any) => generateMock({
          ...options,
          source,
        }),
      })),
      normalizeWeappTailwindcssGeneratorOptions: vi.fn(() => ({
        target: 'weapp',
        styleOptions: {},
      })),
      resolveTailwindV4Source: vi.fn(async (options: any) => ({
        projectRoot: dir,
        base: dir,
        baseFallbacks: [],
        css: options.css,
        config: options.config,
        dependencies: options.config ? [options.config] : [],
      })),
      resolveTailwindV4SourceFromRuntime: vi.fn(async () => ({
        projectRoot: dir,
        base: dir,
        baseFallbacks: [],
        css: '@import "tailwindcss";',
        dependencies: [],
      })),
      resolveTailwindV4SourceOptionsFromRuntime: vi.fn(() => ({
        projectRoot: dir,
        baseFallbacks: [],
      })),
    }))

    try {
      const { WeappTailwindcss: MockedWeappTailwindcss } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5')
      testState.currentContext = createContext({
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        mainCssChunkMatcher: vi.fn((file: string) => file === 'app.wxss'),
        styleHandler: vi.fn(async (code: string) => ({ css: code })),
        tailwindcssBasedir: dir,
        tailwindRuntime: {
          getClassSet: vi.fn(async () => new Set(['main-only', 'bg-normal-subpackage-marker', 'sub-only'])),
          getClassSetSync: vi.fn(() => new Set(['main-only', 'bg-normal-subpackage-marker', 'sub-only'])),
          extract: vi.fn(async () => ({ classSet: new Set(['main-only', 'bg-normal-subpackage-marker', 'sub-only']) })),
          majorVersion: 4,
        },
      } as any)

      const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
      let assetStore: Record<string, string> = {
        'app.wxss': '@tailwind utilities;',
      }
      const compilation = {
        compiler: { outputPath: path.join(dir, 'dist') },
        chunks: [{ id: 'sub-normal', hash: 'hash-1', files: Object.keys(assetStore) }],
        chunkGraph: {
          getChunkModulesIterable: (chunk: { files?: string[] }) => {
            if (chunk.files?.includes('app.wxss')) {
              return [{ resource: appCss }]
            }
            if (chunk.files?.includes('sub-normal/pages/index.wxss')) {
              return [{ resource: subNormalCss }]
            }
            return []
          },
        },
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
        outputPath: path.join(dir, 'dist'),
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

      new MockedWeappTailwindcss().apply(compiler as any)
      const loaderHook = compiler.webpack.NormalModule.getCompilationHooks.mock.results[0]?.value?.loader?.tap.mock.calls[0]?.[1]
      const appModule: LoaderModule = {
        resource: appCss,
        loaders: [{ loader: '/path/postcss-loader.js' }],
      }
      const subNormalModule: LoaderModule = {
        resource: subNormalCss,
        loaders: [{ loader: '/path/postcss-loader.js' }],
      }
      loaderHook?.({}, appModule)
      loaderHook?.({}, subNormalModule)
      for (const [module, cssFile] of [
        [appModule, appCss],
        [subNormalModule, subNormalCss],
      ] as const) {
        const classSetLoaderEntry = module.loaders.find(entry => entry.loader === testState.currentContext.runtimeLoaderPath)
        const loaderRuntime = getWebpackLoaderRuntime(classSetLoaderEntry?.options?.weappTailwindcssRuntimeKey)
        loaderRuntime?.classSet?.registerCssSourceFile?.({
          file: cssFile,
          css: await fs.promises.readFile(cssFile, 'utf8'),
        })
      }
      await processAssetsCallbacks[0](createAssetsFromStore(assetStore))
      assetStore = {
        'sub-normal/pages/index.wxss': '@tailwind utilities;',
      }
      compilation.chunks[0] = { id: 'sub-normal', hash: 'hash-2', files: Object.keys(assetStore) }
      await processAssetsCallbacks[0](createAssetsFromStore(assetStore))

      expect(generateMock.mock.calls).toHaveLength(2)
      expect(generateMock.mock.calls[0]?.[0]?.candidates).toEqual(new Set(['main-only']))
      expect(generateMock.mock.calls[1]?.[0]?.candidates).toEqual(new Set(['bg-normal-subpackage-marker', 'sub-only']))
      expect(assetStore['sub-normal/pages/index.wxss']).toContain('.bg-normal-subpackage-marker')
      expect(assetStore['sub-normal/pages/index.wxss']).toContain('.sub-only')
      expect(assetStore['sub-normal/pages/index.wxss']).not.toContain('.main-only')
    }
    finally {
      vi.doUnmock('@/generator')
      vi.resetModules()
      await rm(dir, { force: true, recursive: true })
    }
  })

})
