import type { OutputAsset } from 'rollup'
import { describe, expect, it, vi } from 'vitest'
import { createCache } from '../../src/cache'
import {
  applyViteCssCacheResult,
  processViteCssCacheTask,
} from '../../src/bundlers/vite/generate-bundle/css-cache-task'
import { resolveViteCssTransformCachePlan } from '../../src/bundlers/vite/generate-bundle/css-transform-decision-plan'

function createOutputAsset(): OutputAsset {
  return {
    fileName: 'pages/index.acss',
    name: undefined,
    names: [],
    needsCodeReference: false,
    originalFileName: null,
    originalFileNames: [],
    source: '.source {}',
    type: 'asset',
  }
}

describe('vite css cache task', () => {
  it('applies cached css to the last-result and remembered source owners', () => {
    const applyCssResult = vi.fn()
    const markCssAssetProcessed = vi.fn()
    const rememberCssSource = vi.fn()
    const lastCssResultByFile = new Map<string, string>()
    const lastCssSourceHashByFile = new Map<string, string>()

    applyViteCssCacheResult({
      applyCssResult,
      cssRuntimeAffectingHash: 'source-hash',
      generatorRawSource: '@import "tailwindcss";',
      generatorSourceFile: '/project/src/app.css',
      lastCssResultByFile,
      lastCssSourceHashByFile,
      markCssAssetProcessed,
      originalSource: createOutputAsset(),
      outputFile: 'pages/index.acss',
      rememberedCssRuntimeSignature: 'runtime-signature',
      rememberedSourcesCount: 1,
      rememberCssSource,
      vitePipelineCssInjectionOutputFile: 'app.acss',
    }, '.generated {}')

    expect(applyCssResult).toHaveBeenCalledWith('.generated {}')
    expect(lastCssResultByFile.get('pages/index.acss')).toBe('.generated {}')
    expect(lastCssSourceHashByFile.get('pages/index.acss')).toBe('source-hash')
    expect(markCssAssetProcessed).toHaveBeenCalledOnce()
    expect(rememberCssSource).toHaveBeenCalledWith({
      outputFile: 'app.acss',
      rawSource: '@import "tailwindcss";',
      sourceFile: '/project/src/app.css',
    }, 'runtime-signature')
  })

  it('uses the process cache before running the transform again', async () => {
    const cache = createCache()
    const transform = vi.fn(async () => '.generated {}')
    const applyResult = vi.fn()
    const onCacheHit = vi.fn()
    const createOptions = () => ({
      applyResult,
      cache,
      cacheKey: 'app.acss',
      hashKey: 'app.acss:css',
      onCacheHit,
      onSharedCacheHit: vi.fn(),
      onSharedResult: vi.fn(),
      onTransformResult: vi.fn(),
      sharedResultCache: new Map<string, Promise<string>>(),
      taskHash: 'stable-hash',
      transform,
    })

    await processViteCssCacheTask(createOptions())
    await processViteCssCacheTask(createOptions())

    expect(transform).toHaveBeenCalledOnce()
    expect(applyResult).toHaveBeenCalledTimes(2)
    expect(onCacheHit).toHaveBeenCalledOnce()
  })

  it('restores the exact cached candidate result when the source rolls back', async () => {
    const cache = createCache()
    const applied: string[] = []
    const transform = vi.fn(async (source: string) => source)
    const run = (source: string) => {
      const plan = resolveViteCssTransformCachePlan({
        cssIsMainChunk: false,
        cssRuntimeAffectingHash: 'source-hash',
        cssShareScope: 'scope',
        linkedImpactSignature: '',
        outputFile: 'pages/index.wxss',
        runtimeSignature: 'runtime',
        scopedGeneratorCandidateSignature: source,
        sourceTraceSignature: 'trace',
        tailwindcssMajorVersion: 4,
      })
      return processViteCssCacheTask({
        applyResult: result => applied.push(result),
        cache,
        cacheKey: plan.cssCacheKey,
        hashKey: plan.cssHashKey,
        onCacheHit: vi.fn(),
        onSharedCacheHit: vi.fn(),
        onSharedResult: vi.fn(),
        onTransformResult: vi.fn(),
        sharedResultCache: new Map<string, Promise<string>>(),
        taskHash: plan.cssTaskHash,
        transform: () => transform(source),
      })
    }

    await run('.probe{display:flex}')
    await run('.probe{display:block}')
    await run('.probe{display:flex}')

    expect(applied).toEqual([
      '.probe{display:flex}',
      '.probe{display:block}',
      '.probe{display:flex}',
    ])
    expect(transform).toHaveBeenCalledTimes(2)
  })

  it('shares an in-flight transform across distinct process cache keys', async () => {
    const sharedResultCache = new Map<string, Promise<string>>()
    const transform = vi.fn(async () => '.shared {}')
    const onSharedCacheHit = vi.fn()
    const onSharedResult = vi.fn()
    const onTransformResult = vi.fn()

    await processViteCssCacheTask({
      applyResult: vi.fn(),
      cache: createCache(false),
      cacheKey: 'first.acss',
      hashKey: 'first:css',
      onCacheHit: vi.fn(),
      onSharedCacheHit,
      onSharedResult,
      onTransformResult,
      sharedCacheKey: 'shared',
      sharedResultCache,
      taskHash: 'first',
      transform,
    })
    await processViteCssCacheTask({
      applyResult: vi.fn(),
      cache: createCache(false),
      cacheKey: 'second.acss',
      hashKey: 'second:css',
      onCacheHit: vi.fn(),
      onSharedCacheHit,
      onSharedResult,
      onTransformResult,
      sharedCacheKey: 'shared',
      sharedResultCache,
      taskHash: 'second',
      transform,
    })

    expect(transform).toHaveBeenCalledOnce()
    expect(onSharedCacheHit).toHaveBeenCalledOnce()
    expect(onSharedResult).toHaveBeenCalledWith('.shared {}')
    expect(onTransformResult).toHaveBeenCalledTimes(2)
  })
})
