import { describe, expect, it, vi } from 'vitest'

const generateTailwindV4Css = vi.fn()

vi.mock('@/bundlers/shared/v4-generation-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/bundlers/shared/v4-generation-core')>()
  return {
    ...actual,
    generateTailwindV4Css,
  }
})

describe('bundlers/vite remembered css replay root shell', () => {
  it('replays generated css into the remembered root import target', async () => {
    const {
      processRememberedCssReplay,
      resolveRememberedCssReplayOutputFile,
    } = await import('@/bundlers/vite/generate-bundle/remembered-css-replay')
    const cssTaskFactories: Array<() => Promise<void>> = []
    const bundle = {
      'app-origin.wxss': {
        fileName: 'app-origin.wxss',
        name: undefined,
        names: [],
        needsCodeReference: false,
        originalFileName: undefined,
        originalFileNames: [],
        source: '.stale{color:red}',
        type: 'asset' as const,
      },
    }
    const generatedCss = [
      '@import "@nutui/nutui-react-taro/dist/style.css";',
      '.fresh{color:green}',
    ].join('\n')
    const createScopedGeneratorRuntime = vi.fn(async () => new Set(['fresh']))
    const pendingRememberedCssReplayUpdates: Array<{
      css: string
      file: string
      injectIntoMain?: boolean
      outputFile: string
    }> = []
    const recordViteProcessedCssAssetResult = vi.fn()
    const rememberedCssSignatures = new Map<string, string>()
    const lastCssResultByFile = new Map<string, string>()
    const lastCssSourceHashByFile = new Map<string, string>()

    generateTailwindV4Css.mockResolvedValueOnce({
      css: generatedCss,
      dependencies: [],
    })

    const options = {
      activeViteCssCacheFiles: new Set<string>(),
      addWatchFile: vi.fn(),
      bundle,
      bundleFiles: ['app-origin.wxss'],
      cache: {
        computeHash: (source: string) => `hash:${source}`,
      },
      changedCssFiles: new Set(),
      createScopedGeneratorRuntime,
      createScopedSourceCandidateGetter: vi.fn(() => undefined),
      createScopedSourceCandidateSourceGetter: vi.fn(() => undefined),
      cssPipelineContext: { opts: { cssMatcher: (file: string) => file.endsWith('.wxss') } } as any,
      cssPipelineStrategy: {
        shouldKeepRootMiniProgramStyleAsImportShell: ({ file }: { file: string }) => file === 'app.wxss',
      },
      cssTaskFactories,
      debug: vi.fn(),
      defaultStyleOutputExtension: '.wxss',
      emitOrReplayCssAsset: vi.fn(),
      frameworkRootImportShellTargetByFile: new Map([
        ['app.wxss', 'app-origin.wxss'],
      ]),
      generatorRuntime: new Set(['fresh']),
      getCssHandlerOptions: vi.fn((file: string) => ({ isMainChunk: file === 'app.wxss' })),
      getCssUserHandlerOptions: vi.fn(() => ({})),
      getRememberedCssSignature: vi.fn((file: string) => rememberedCssSignatures.get(file)),
      getRememberedCssSources: () => new Map([
        ['app.wxss', {
          outputFile: 'app.wxss',
          rawSource: '@import "tailwindcss" source(none);\n@source "./pages/**/*";',
          sourceFile: '/repo/src/app.css',
        }],
      ]),
      isNativeAppStyleTarget: false,
      isWebGeneratorTarget: false,
      lastCssRawSourceHashByFile: new Map(),
      lastCssResultByFile,
      lastCssSourceHashByFile,
      markCssAssetProcessed: vi.fn(),
      metrics: {
        runtimeSet: 0,
        html: { total: 0, transformed: 0, cacheHits: 0, elapsed: 0 },
        js: { total: 0, transformed: 0, cacheHits: 0, elapsed: 0 },
        css: { total: 0, transformed: 0, cacheHits: 0, elapsed: 0 },
      },
      normalizeViteCssCacheKey: (file: string) => file,
      onUpdate: vi.fn(),
      opts: {
        cssMatcher: (file: string) => file.endsWith('.wxss'),
        htmlMatcher: (file: string) => file.endsWith('.wxml'),
      },
      pendingRememberedCssReplayUpdates,
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult,
      rootDir: '/repo',
      runtimeState: {
        readyPromise: Promise.resolve(),
        tailwindRuntime: { majorVersion: 4 },
      },
      setRememberedCssSignature: vi.fn((file: string, signature: string) => rememberedCssSignatures.set(file, signature)),
      shouldInjectCssIntoMainFromOutput: vi.fn(() => false),
      shouldPreserveAppCssExtension: false,
      sourceRoot: '/repo/src',
      styleHandler: vi.fn(async (source: string) => ({ css: source })),
      timeTask: vi.fn(async (_name: string, task: () => Promise<void>) => {
        await task()
      }),
      useIncrementalMode: true,
    } as any

    await processRememberedCssReplay(options)

    expect(cssTaskFactories).toHaveLength(1)
    await cssTaskFactories[0]!()

    expect(generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      cssHandlerOptions: expect.objectContaining({ isMainChunk: true }),
      file: '/repo/src/app.css',
      outputFile: 'app-origin.wxss',
    }))
    expect(createScopedGeneratorRuntime).toHaveBeenCalledWith(
      'app-origin.wxss',
      expect.objectContaining({ isMainChunk: true }),
      expect.any(Set),
      expect.any(String),
      '/repo/src/app.css',
    )
    expect(bundle['app-origin.wxss'].source).toBe('.stale{color:red}')
    expect(recordViteProcessedCssAssetResult).not.toHaveBeenCalled()
    expect(pendingRememberedCssReplayUpdates).toContainEqual({
      css: generatedCss,
      file: 'app-origin.wxss',
      injectIntoMain: true,
      outputFile: 'app-origin.wxss',
    })
    expect(pendingRememberedCssReplayUpdates).toContainEqual({
      css: generatedCss,
      file: '/repo/src/app.css',
      injectIntoMain: true,
      outputFile: 'app-origin.wxss',
    })

    const cachedReplayTasks: Array<() => Promise<void>> = []
    const cachedReplayUpdates: typeof pendingRememberedCssReplayUpdates = []
    await processRememberedCssReplay({
      ...options,
      bundle: {
        'app-origin.wxss': {
          ...bundle['app-origin.wxss'],
          source: '.fresh-framework-bundle{color:blue}',
        },
      },
      cssTaskFactories: cachedReplayTasks,
      pendingRememberedCssReplayUpdates: cachedReplayUpdates,
    })

    expect(cachedReplayTasks).toHaveLength(0)
    expect(generateTailwindV4Css).toHaveBeenCalledTimes(1)
    expect(cachedReplayUpdates).toEqual(pendingRememberedCssReplayUpdates)

    lastCssResultByFile.clear()
    const cacheMissReplayTasks: Array<() => Promise<void>> = []
    await processRememberedCssReplay({
      ...options,
      cssTaskFactories: cacheMissReplayTasks,
      pendingRememberedCssReplayUpdates: [],
    })
    expect(cacheMissReplayTasks).toHaveLength(1)
    expect(resolveRememberedCssReplayOutputFile(
      'nested/app.wxss',
      new Map([['nested\\app.wxss', 'app-origin.wxss']]),
    )).toBe('app-origin.wxss')
  })
})
