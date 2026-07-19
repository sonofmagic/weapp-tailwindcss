import { describe, expect, it, vi } from 'vitest'
import { setupWebpackV5ProcessAssetsHook } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets'
import { buildWebpackBundleSnapshot, createWebpackAssetUpdater, releaseWebpackBundleSnapshotSources } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/helpers'
import { createCache } from '@/cache'
import { createRuntimeCompilationBuildState, getCompilerShadowRunSnapshot } from '@/compiler'

function toPosixPath(value: string) {
  return value.replace(/\\/g, '/')
}

function toPortableResourcePath(value: string) {
  return toPosixPath(value).replace(/^[A-Z]:/i, '')
}

function createOptions() {
  return {
    cache: createCache(),
    cssMatcher: (file: string) => file.endsWith('.css'),
    htmlMatcher: (file: string) => file.endsWith('.wxml'),
    jsMatcher: (file: string) => file.endsWith('.js'),
    wxsMatcher: () => false,
  } as any
}

describe('bundlers/webpack webpack snapshot helpers', () => {
  it('only snapshots html and js entries for runtime processing', () => {
    const snapshot = buildWebpackBundleSnapshot({
      'pages/index/index.wxml': {
        source: () => '<view class="foo">hello</view>',
      },
      'assets/index.js': {
        source: () => 'const cls = "foo"',
      },
      'assets/index.css': {
        source: () => '.foo{color:red}',
      },
    }, createOptions(), createRuntimeCompilationBuildState())

    expect(snapshot.entries.map(entry => entry.file)).toEqual([
      'pages/index/index.wxml',
      'assets/index.js',
    ])
    expect(snapshot.processFiles.html.has('pages/index/index.wxml')).toBe(true)
    expect(snapshot.processFiles.js.has('assets/index.js')).toBe(true)
    expect(snapshot.changedByType.css.size).toBe(0)
    expect(snapshot.runtimeAffectingChangedByType.css.size).toBe(0)
  })

  it('can release snapshot sources after runtime sync without dropping state hashes', () => {
    const snapshot = buildWebpackBundleSnapshot({
      'pages/index/index.wxml': {
        source: () => '<view class="foo">hello</view>',
      },
      'assets/index.js': {
        source: () => 'const cls = "foo"',
      },
    }, createOptions(), createRuntimeCompilationBuildState())
    const sourceHashByFile = new Map(snapshot.sourceHashByFile)
    const runtimeAffectingHashByFile = new Map(snapshot.runtimeAffectingHashByFile)

    releaseWebpackBundleSnapshotSources(snapshot)

    expect(snapshot.entries.map(entry => entry.source)).toEqual(['', ''])
    expect(snapshot.entries.every(entry => !('output' in entry))).toBe(true)
    expect(snapshot.sourceHashByFile).toEqual(sourceHashByFile)
    expect(snapshot.runtimeAffectingHashByFile).toEqual(runtimeAffectingHashByFile)
    expect(snapshot.processFiles.html.has('pages/index/index.wxml')).toBe(true)
    expect(snapshot.processFiles.js.has('assets/index.js')).toBe(true)
  })

  it('prefers current compilation asset sources when snapshotting runtime entries', () => {
    const snapshot = buildWebpackBundleSnapshot({
      'assets/index.js': {
        source: () => 'const cls = "stale-source"',
      },
    }, createOptions(), createRuntimeCompilationBuildState(), {
      getAsset: vi.fn((file: string) => file === 'assets/index.js'
        ? {
            source: {
              source: () => 'const cls = "fresh-source"',
            },
          }
        : undefined),
      updateAsset: vi.fn(),
    } as any)

    expect(snapshot.entries).toHaveLength(1)
    expect(snapshot.entries[0]?.source).toBe('const cls = "fresh-source"')
    expect(snapshot.entries[0]).not.toHaveProperty('output')
  })

  it('can update cache-hit assets without stringifying sources for comparison', () => {
    const updateAsset = vi.fn()
    const onUpdate = vi.fn()
    const source = {
      source: vi.fn(() => {
        throw new Error('source should not be stringified')
      }),
    }
    const { updateAssetIfChanged } = createWebpackAssetUpdater({
      compilation: {
        getAsset: vi.fn(() => {
          throw new Error('current asset should not be read')
        }),
        updateAsset,
      } as any,
      ConcatSource: class {
        constructor(public readonly value: string) {}
      } as any,
      debug: vi.fn(),
      onUpdate,
    })

    expect(updateAssetIfChanged('app.wxss', source as any, {
      compare: false,
      notifyUpdate: false,
    })).toBe(true)

    expect(source.source).not.toHaveBeenCalled()
    expect(updateAsset).toHaveBeenCalledWith('app.wxss', source)
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('does not read known webpack processed css asset sources on cache hit', async () => {
    const cache = createCache()
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const updateAsset = vi.fn()
    const getAsset = vi.fn((file: string) => ({
      source: {
        source: () => assetStore[file],
      },
    }))
    const compilation = {
      compiler: { outputPath: '/dist' },
      chunks: [
        {
          id: 'main',
          hash: 'stable-hash',
          files: ['app.wxss'],
        },
      ],
      outputOptions: { path: '/dist' },
      hooks: {
        processAssets: {
          tapPromise: vi.fn((_options, handler) => {
            processAssetsCallbacks.push(handler)
          }),
        },
      },
      getAsset,
      updateAsset,
    }
    const compiler = {
      outputPath: '/dist',
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage'),
        },
        sources: {
          ConcatSource: class {
            constructor(private readonly value: string) {}

            source() {
              return this.value
            }
          },
        },
      },
      hooks: {
        compilation: {
          tap: vi.fn((_name: string, handler: (compilation: any) => void) => {
            handler(compilation)
          }),
        },
      },
    }
    const runtimeClassSetManager = {
      reset: vi.fn(),
      sync: vi.fn(async () => new Set(['beta'])),
    }
    const isWebpackProcessedCssAsset = vi.fn(() => {
      throw new Error('known processed css should not require source inspection')
    })
    const processedAssetFile = 'cache-hit-known-processed.wxss'
    const assetStore: Record<string, string> = {
      [processedAssetFile]: '/* weapp-tailwindcss webpack-generated-css: app.css */\n.beta{color:red}',
    }
    const runtimeState = {
      readyPromise: Promise.resolve(),
      tailwindRuntime: {
        majorVersion: 4,
        options: {},
      } as any,
    }
    setupWebpackV5ProcessAssetsHook({
      compiler: compiler as any,
      options: {
        arbitraryValues: {},
        cache,
        cssMatcher: (file: string) => file === processedAssetFile,
        cssPreflight: undefined,
        htmlMatcher: () => false,
        jsMatcher: () => false,
        wxsMatcher: () => false,
        mainCssChunkMatcher: () => true,
        onEnd: vi.fn(),
        onStart: vi.fn(),
        onUpdate: vi.fn(),
        styleHandler: vi.fn(async (source: string) => ({ css: source })),
        tailwindcssBasedir: process.cwd(),
        templateHandler: vi.fn(),
      } as any,
      runtimeState,
      getRuntimeRefreshRequirement: () => false,
      refreshRuntimeMetadata: vi.fn(async () => undefined),
      consumeRuntimeRefreshRequirement: vi.fn(),
      isWatchMode: () => true,
      getWatchChangedFiles: () => [],
      runtimeClassSetManager: runtimeClassSetManager as any,
      isKnownWebpackProcessedCssAsset: () => true,
      isWebpackProcessedCssAsset,
      debug: vi.fn(),
    })

    const firstSource = vi.fn(() => assetStore[processedAssetFile])
    await processAssetsCallbacks[0]({
      [processedAssetFile]: {
        source: firstSource,
      },
    })
    expect(getCompilerShadowRunSnapshot(runtimeState).revision).toBe(1)
    expect(firstSource).toHaveBeenCalled()

    const secondSource = vi.fn(() => assetStore[processedAssetFile])
    await processAssetsCallbacks[0]({
      [processedAssetFile]: {
        source: secondSource,
      },
    })
    expect(getCompilerShadowRunSnapshot(runtimeState).revision).toBe(2)

    expect(isWebpackProcessedCssAsset).not.toHaveBeenCalled()
  })

  it('prepares webpack css sources with active resources from chunk graph', async () => {
    const processAssetsCallbacks: Array<(assets: Record<string, any>) => Promise<void>> = []
    const subpackageCss = '/workspace/demo/src/sub-normal/pages/index.css'
    const chunk = {
      id: 'sub-normal',
      hash: 'stable-hash',
      files: ['sub-normal/pages/index.wxss'],
    }
    const compilation = {
      compiler: { outputPath: '/workspace/demo/dist' },
      chunks: [chunk],
      chunkGraph: {
        getChunkModulesIterable: vi.fn(() => [
          { resource: subpackageCss },
        ]),
      },
      outputOptions: { path: '/workspace/demo/dist' },
      hooks: {
        processAssets: {
          tapPromise: vi.fn((_options, handler) => {
            processAssetsCallbacks.push(handler)
          }),
        },
      },
      getAsset: vi.fn((file: string) => file === 'sub-normal/pages/index.wxss'
        ? {
            source: {
              source: () => '.bg-normal-subpackage-marker{}',
            },
          }
        : undefined),
      updateAsset: vi.fn(),
    }
    const compiler = {
      outputPath: '/workspace/demo/dist',
      webpack: {
        Compilation: {
          PROCESS_ASSETS_STAGE_SUMMARIZE: Symbol('stage'),
        },
        sources: {
          ConcatSource: class {
            constructor(private readonly value: string) {}

            source() {
              return this.value
            }
          },
        },
      },
      hooks: {
        compilation: {
          tap: vi.fn((_name: string, handler: (compilation: any) => void) => {
            handler(compilation)
          }),
        },
      },
    }
    const activeResourceSets: string[][] = []

    setupWebpackV5ProcessAssetsHook({
      compiler: compiler as any,
      options: {
        arbitraryValues: {},
        cache: createCache(),
        cssMatcher: (file: string) => file.endsWith('.wxss') || file.endsWith('.css'),
        cssPreflight: undefined,
        htmlMatcher: () => false,
        jsMatcher: () => false,
        wxsMatcher: () => false,
        mainCssChunkMatcher: () => false,
        onEnd: vi.fn(),
        onStart: vi.fn(),
        onUpdate: vi.fn(),
        styleHandler: vi.fn(async (source: string) => ({ css: source })),
        tailwindcssBasedir: '/workspace/demo',
        templateHandler: vi.fn(),
      } as any,
      runtimeState: {
        readyPromise: Promise.resolve(),
        tailwindRuntime: {
          majorVersion: 4,
          options: {},
        } as any,
      },
      getRuntimeRefreshRequirement: () => false,
      refreshRuntimeMetadata: vi.fn(async () => undefined),
      consumeRuntimeRefreshRequirement: vi.fn(),
      isWatchMode: () => false,
      getWatchChangedFiles: () => [],
      runtimeClassSetManager: {
        reset: vi.fn(),
        sync: vi.fn(async () => new Set<string>()),
      } as any,
      getWebpackCssSources: () => new Map([
        [subpackageCss, { css: '.bg-normal-subpackage-marker{}' }],
      ]),
      prepareWebpackCssSources: (activeResources = new Set()) => {
        activeResourceSets.push([...activeResources])
        return activeResources
      },
      debug: vi.fn(),
    })

    await processAssetsCallbacks[0]!({
      'sub-normal/pages/index.wxss': {
        source: () => '.bg-normal-subpackage-marker{}',
      },
    })

    expect(activeResourceSets.map(resources => resources.map(toPortableResourcePath))).toEqual([[toPortableResourcePath(subpackageCss)]])
  })
})
