import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRuntimeAffectingSourceSignature } from '@/bundlers/vite/runtime-affecting-signature'
import { createCssRuntimeSignature } from '@/bundlers/vite/generate-bundle/css-share-scope'
import { createRememberedCssRuntimeSignature } from '@/bundlers/vite/generate-bundle/remembered-css'
import { createCandidateSignature } from '@/bundlers/vite/generate-bundle/signatures'

const createCssTokenSourceMap = vi.fn()

vi.mock('@/bundlers/shared/css-source-trace', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/bundlers/shared/css-source-trace')>()
  return {
    ...actual,
    createCssTokenSourceMap,
  }
})

describe('bundlers/vite remembered css replay', () => {
  beforeEach(() => {
    createCssTokenSourceMap.mockReset()
  })

  it('skips source trace preparation when remembered replay signature is fresh', async () => {
    const { processRememberedCssReplay } = await import('@/bundlers/vite/generate-bundle/remembered-css-replay')
    const cssTaskFactories: Array<() => Promise<void>> = []
    const activeViteCssCacheFiles = new Set<string>()
    const rawSource = '@tailwind utilities;'
    const runtime = new Set(['text-red-500'])
    const runtimeSignature = createCandidateSignature(runtime)
    const freshSignature = createRememberedCssRuntimeSignature(
      createCssRuntimeSignature(runtimeSignature, runtimeSignature),
      `hash:${createRuntimeAffectingSourceSignature(rawSource, 'css')}`,
    )

    await processRememberedCssReplay({
      addWatchFile: vi.fn(),
      activeViteCssCacheFiles,
      bundle: {},
      bundleFiles: ['pages/index/index.js'],
      cache: {
        computeHash: (source: string) => `hash:${source}`,
      },
      createScopedGeneratorRuntime: vi.fn(async () => runtime),
      createScopedSourceCandidateGetter: vi.fn(() => undefined),
      createScopedSourceCandidateSourceGetter: vi.fn(() => new Map()),
      cssTaskFactories,
      debug: vi.fn(),
      defaultStyleOutputExtension: '.wxss',
      emitOrReplayCssAsset: vi.fn(),
      generatorRuntime: new Set(['text-red-500']),
      getCssHandlerOptions: vi.fn(() => ({ isMainChunk: false })),
      getCssUserHandlerOptions: vi.fn(() => ({})),
      getRememberedCssSignature: vi.fn(() => freshSignature),
      getRememberedCssSources: () => new Map([
        ['pages/index/index.wxss', {
          outputFile: 'pages/index/index.wxss',
          rawSource,
          sourceFile: '/repo/src/pages/index/index.vue?vue&type=style&index=0&lang.css',
        }],
      ]),
      isNativeAppStyleTarget: false,
      isWebGeneratorTarget: false,
      lastCssResultByFile: new Map(),
      lastCssSourceHashByFile: new Map(),
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
      recordCssAssetResult: vi.fn(),
      recordViteProcessedCssAssetResult: vi.fn(),
      refreshRememberedCssSource: vi.fn(),
      rootDir: '/repo',
      runtimeState: {
        tailwindRuntime: {
          majorVersion: 4,
        },
        readyPromise: Promise.resolve(),
      },
      setRememberedCssSignature: vi.fn(),
      shouldInjectCssIntoMainFromOutput: vi.fn(() => false),
      shouldPreserveAppCssExtension: false,
      sourceRoot: undefined,
      styleHandler: vi.fn(async (source: string) => ({ css: source })),
      timeTask: vi.fn(async (_name: string, task: () => Promise<void>) => {
        await task()
      }),
      useIncrementalMode: true,
    } as any)

    expect(createCssTokenSourceMap).not.toHaveBeenCalled()
    expect(cssTaskFactories).toHaveLength(0)
  })
})
