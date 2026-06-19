import type { GenerateBundleContext } from './types'
import process from 'node:process'
import { getTailwindV3IncrementalGenerateCacheStats } from '@/tailwindcss/v3-engine'
import { getTailwindV4IncrementalGenerateCacheStats } from '@/tailwindcss/v4-engine'

function toMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024)
}

function summarizeStringMapCache(map: Map<string, string>) {
  let bytes = 0
  for (const value of map.values()) {
    bytes += value.length
  }
  return {
    bytes,
    mb: toMb(bytes),
    size: map.size,
  }
}

export function resolveViteMemoryDebugStats(context: {
  activeProcessCacheKeys: Set<string>
  activeProcessHashKeys: Set<string | number>
  cache: GenerateBundleContext['opts']['cache']
  generatorRuntimeSize: number
  getViteCssCacheStats?: (() => Record<string, unknown>) | undefined
  hasOmittedKnownFiles: boolean
  lastCssResultByFile: Map<string, string>
  phase: string
  processCachePruned: boolean
  processCachePruneSkipReason?: string | undefined
  runtimeSize: number
  sourceCandidatesSize: number
  transformRuntimeSize: number
  useIncrementalMode: boolean
}) {
  if (process.env['WEAPP_TW_HMR_MEMORY_DEBUG'] !== '1') {
    return undefined
  }

  const memory = process.memoryUsage()
  const processCacheInstanceSize = context.cache.instance.size
  const processCacheHashMapSize = context.cache.hashMap.size
  return {
    phase: context.phase,
    mode: context.useIncrementalMode ? 'incremental' : 'full',
    bundle: {
      hasOmittedKnownFiles: context.hasOmittedKnownFiles,
    },
    process: {
      rssMb: toMb(memory.rss),
      heapTotalMb: toMb(memory.heapTotal),
      heapUsedMb: toMb(memory.heapUsed),
      externalMb: toMb(memory.external),
      arrayBuffersMb: toMb(memory.arrayBuffers),
    },
    runtime: {
      sourceCandidates: context.sourceCandidatesSize,
      runtime: context.runtimeSize,
      transformRuntime: context.transformRuntimeSize,
      generatorRuntime: context.generatorRuntimeSize,
    },
    processCache: {
      instance: processCacheInstanceSize,
      hashMap: processCacheHashMapSize,
      activeCacheKeys: context.activeProcessCacheKeys.size,
      activeHashKeys: context.activeProcessHashKeys.size,
      staleCacheKeys: Math.max(0, processCacheInstanceSize - context.activeProcessCacheKeys.size),
      staleHashKeys: Math.max(0, processCacheHashMapSize - context.activeProcessHashKeys.size),
      pruned: context.processCachePruned,
      pruneSkipped: !context.processCachePruned,
      ...(context.processCachePruneSkipReason ? { pruneSkipReason: context.processCachePruneSkipReason } : {}),
    },
    viteCss: {
      ...context.getViteCssCacheStats?.(),
      lastCssResultByFile: summarizeStringMapCache(context.lastCssResultByFile),
    },
    tailwind: {
      v3: getTailwindV3IncrementalGenerateCacheStats(),
      v4: getTailwindV4IncrementalGenerateCacheStats(),
    },
  }
}
