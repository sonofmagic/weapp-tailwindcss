import { INCREMENTAL_GENERATE_CACHE_MAX, INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX, INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX, INCREMENTAL_GENERATE_TASK_CACHE_MAX, incrementalGenerateCache, incrementalGenerateTaskCache, summarizeIncrementalCacheKey } from './incremental-cache'

export function getTailwindV4IncrementalGenerateCacheStats() {
  return {
    max: INCREMENTAL_GENERATE_CACHE_MAX,
    entryCandidatesMax: INCREMENTAL_GENERATE_ENTRY_CANDIDATES_MAX,
    entryCssBytesMax: INCREMENTAL_GENERATE_ENTRY_CSS_BYTES_MAX,
    size: incrementalGenerateCache.size,
    taskMax: INCREMENTAL_GENERATE_TASK_CACHE_MAX,
    taskSize: incrementalGenerateTaskCache.size,
    entries: [...incrementalGenerateCache.entries()].map(([key, entry]) => ({
      ...summarizeIncrementalCacheKey(key),
      candidates: entry.seenCandidates.size,
      classSet: entry.classSet.size,
      cssBytes: entry.css.length,
      rawCssBytes: entry.rawCss.length,
    })),
    keys: [...incrementalGenerateCache.keys()].map(summarizeIncrementalCacheKey),
    taskKeys: [...incrementalGenerateTaskCache.keys()].map(summarizeIncrementalCacheKey),
  }
}

export const getTailwindV4IncrementalGenerateCacheStatsForTest = getTailwindV4IncrementalGenerateCacheStats

export function clearTailwindV4IncrementalGenerateCacheForTest() {
  incrementalGenerateCache.clear()
  incrementalGenerateTaskCache.clear()
}
