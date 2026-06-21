import { describe, expect, it, vi } from 'vitest'
import { processJsBundleEntry } from '@/bundlers/vite/generate-bundle/js-processing'
import { createCache } from '@/cache'
import { createRollupChunk } from './vite-plugin.testkit'

describe('bundlers/vite js processing', () => {
  it('directly replays cached clean incremental chunks without scheduling js work', () => {
    const cache = createCache()
    const file = 'assets/index.js'
    const source = 'const cls = "text-red-500"'
    const cached = 'const cls = "tw-text-red-500"'
    const sourceHash = cache.computeHash(source)
    const runtimeSignature = 'runtime:stable'
    const processHash = `${sourceHash}:${runtimeSignature}`
    cache.set(file, cached)
    cache.setHashValue(`${file}:js`, {
      changed: false,
      hash: processHash,
    })
    const chunk = {
      ...createRollupChunk(source),
      fileName: file,
    }
    const jsTaskFactories: Array<() => Promise<void>> = []
    const linkedByEntry = new Map<string, Set<string>>()

    processJsBundleEntry({
      applyLinkedUpdates: vi.fn(),
      bundle: {},
      cache,
      createHandlerOptions: vi.fn(() => ({} as any)),
      debug: vi.fn(),
      disableJsPrecheck: false,
      entry: {
        file,
        output: chunk,
        source,
        type: 'js',
      },
      getJsEntry: vi.fn(),
      jsHandler: vi.fn(),
      jsTaskFactories,
      linkedByEntry,
      metrics: {
        runtimeSet: 0,
        html: { total: 0, transformed: 0, cacheHits: 0, elapsed: 0 },
        js: { total: 0, transformed: 0, cacheHits: 0, elapsed: 0 },
        css: { total: 0, transformed: 0, cacheHits: 0, elapsed: 0 },
      },
      onUpdate: vi.fn(),
      outDir: '/repo/dist',
      processFiles: {
        html: new Set(),
        js: new Set(),
        css: new Set(),
      },
      rememberProcessCacheKey: vi.fn(),
      runtimeSignature,
      snapshot: {
        entries: [],
        jsEntries: new Map(),
        sourceHashByFile: new Map([[file, sourceHash]]),
        runtimeAffectingSignatureByFile: new Map(),
        runtimeAffectingHashByFile: new Map(),
        hasOmittedKnownFiles: false,
        changedByType: {
          html: new Set(),
          js: new Set(),
          css: new Set(),
          other: new Set(),
        },
        runtimeAffectingChangedByType: {
          html: new Set(),
          js: new Set(),
          css: new Set(),
          other: new Set(),
        },
        processFiles: {
          html: new Set(),
          js: new Set(),
          css: new Set(),
        },
        linkedImpactsByEntry: new Map(),
      },
      timeTask: vi.fn(async (_name: string, task: () => Promise<void>) => {
        await task()
      }),
      transformRuntime: new Set(['text-red-500']),
      uniAppX: undefined,
      useIncrementalMode: true,
    })

    expect(chunk.code).toBe(cached)
    expect(jsTaskFactories).toHaveLength(0)
    expect(linkedByEntry.get(file)).toEqual(new Set())
  })
})
