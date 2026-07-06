import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { IArbitraryValues } from '@/types/shared'
import { readFile } from 'node:fs/promises'
import { LRUCache } from 'lru-cache'
import { md5Hash } from '@/cache/md5'
import { extractCandidatesFromSource } from '@/tailwindcss/candidates'
import {
  FULL_SOURCE_SCAN_EXTENSION_RE,
  isFileMatchedByTailwindSourceEntries,
  resolveSourceScanPath,
} from '@/tailwindcss/source-scan'
import { resolveSourceCandidateScanFiles } from './source-candidates/scan-root'

export interface SourceCandidateStore {
  syncSource: (id: string, source: string) => Promise<void>
  sync: (id: string, source: string) => Promise<void>
  syncCss: (id: string, source: string) => Promise<void>
  merge: (id: string, source: string) => Promise<void>
  syncFile: (id: string) => Promise<void>
  syncCurrentSource: (id: string, source: string) => Promise<SourceCandidateChange>
  syncCurrentFile: (id: string) => Promise<SourceCandidateChange>
  scanRoot: (options: ScanSourceCandidateRootOptions) => Promise<void>
  syncInline: (inlineCandidates: TailwindInlineSourceCandidates | undefined) => void
  remove: (id: string) => SourceCandidateChange
  source: (id: string) => string | undefined
  sources: () => IterableIterator<[string, string]>
  values: () => Set<string>
  valuesForEntries: (entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>
  sourcesForEntries: (entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Map<string, Set<string>>
  snapshot: () => SourceCandidateCollectorSnapshot
  restore: (snapshot: SourceCandidateCollectorSnapshot) => void
  clearScan: () => void
  resetScan: () => void
  clear: () => void
}

export interface SourceCandidateCollector extends SourceCandidateStore {}

export interface SourceCandidateChange {
  addedCandidates: Set<string>
  removedCandidates: Set<string>
}

export interface SourceCandidateCollectorSnapshot {
  candidatesById: Array<[string, string[]]>
  cssCandidatesById?: Array<[string, string[]]> | undefined
  cssSourceById?: Array<[string, string]> | undefined
  scanCandidatesById?: Array<[string, string[]]> | undefined
  scanSourceById?: Array<[string, string]> | undefined
  sourceById?: Array<[string, string]> | undefined
  transformCandidatesById?: Array<[string, string[]]> | undefined
  transformSourceById?: Array<[string, string]> | undefined
  inlineExcludedCandidates: string[]
  inlineIncludedCandidates: string[]
}

export interface SourceCandidateFilterOptions {
  excludeEntries?: TailwindSourceEntry[] | undefined
}

interface ScanSourceCandidateRootOptions {
  root: string
  outDir?: string | undefined
  entries?: TailwindSourceEntry[] | undefined
  explicit?: boolean | undefined
}

export interface SourceCandidateCollectorOptions {
  /**
   * 是否补充 UnoCSS 风格裸任意值候选。
   */
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined
  extractor?: ((source: string, extension: string) => Promise<Iterable<string>> | Iterable<string>) | undefined
}

const CLEAN_URL_RE = /[?#].*$/
const SOURCE_CANDIDATE_CONTENT_CACHE_MAX = 128
const sourceCandidateContentCache = new LRUCache<string, string[]>({
  max: SOURCE_CANDIDATE_CONTENT_CACHE_MAX,
})

function cleanUrl(id: string) {
  return resolveSourceScanPath(id.replace(CLEAN_URL_RE, ''))
}

function resolveSourceCandidateExtension(id: string) {
  const normalized = cleanUrl(id)
  const match = /\.([^.\\/]+)$/.exec(normalized)
  return match?.[1] ?? 'html'
}

function createSourceCandidateContentCacheKey(
  extension: string,
  source: string,
  bareArbitraryValues: IArbitraryValues['bareArbitraryValues'] | undefined,
  extractor: SourceCandidateCollectorOptions['extractor'],
) {
  return `${extension}\0${JSON.stringify(bareArbitraryValues ?? false)}\0${extractor ? 'custom' : 'default'}\0${md5Hash(source)}`
}

async function extractCandidates(
  source: string,
  extension: string,
  options: SourceCandidateCollectorOptions,
) {
  return extractCandidatesFromSource(source, extension, options)
}

export function isSourceCandidateRequest(id: string) {
  return FULL_SOURCE_SCAN_EXTENSION_RE.test(cleanUrl(id))
}

function removeCandidateSet(
  candidateCount: Map<string, number>,
  candidates: Set<string>,
) {
  for (const candidate of candidates) {
    const count = candidateCount.get(candidate)
    if (count == null) {
      continue
    }
    if (count <= 1) {
      candidateCount.delete(candidate)
      continue
    }
    candidateCount.set(candidate, count - 1)
  }
}

function addCandidateSet(
  candidateCount: Map<string, number>,
  candidates: Set<string>,
) {
  for (const candidate of candidates) {
    candidateCount.set(candidate, (candidateCount.get(candidate) ?? 0) + 1)
  }
}

function diffCandidateSets(previous: Set<string>, next: Set<string>): SourceCandidateChange {
  const addedCandidates = new Set<string>()
  const removedCandidates = new Set<string>()
  for (const candidate of next) {
    if (!previous.has(candidate)) {
      addedCandidates.add(candidate)
    }
  }
  for (const candidate of previous) {
    if (!next.has(candidate)) {
      removedCandidates.add(candidate)
    }
  }
  return {
    addedCandidates,
    removedCandidates,
  }
}

export function createSourceCandidateStore(options: SourceCandidateCollectorOptions = {}): SourceCandidateStore {
  const candidatesById = new Map<string, Set<string>>()
  const scanCandidatesById = new Map<string, Set<string>>()
  const transformCandidatesById = new Map<string, Set<string>>()
  const cssCandidatesById = new Map<string, Set<string>>()
  const scanSourceById = new Map<string, string>()
  const transformSourceById = new Map<string, string>()
  const cssSourceById = new Map<string, string>()
  const candidateCount = new Map<string, number>()
  let inlineIncludedCandidates = new Set<string>()
  let inlineExcludedCandidates = new Set<string>()

  async function sync(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    scanSourceById.set(normalizedId, source)
    const extension = resolveSourceCandidateExtension(normalizedId)
    const contentCacheKey = createSourceCandidateContentCacheKey(extension, source, options.bareArbitraryValues, options.extractor)
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    if (cachedCandidates) {
      replaceScanLayer(normalizedId, new Set(cachedCandidates))
      return
    }

    const nextCandidates = await extractCandidates(source, extension, options)
    sourceCandidateContentCache.set(contentCacheKey, [...nextCandidates])

    replaceScanLayer(normalizedId, nextCandidates)
  }

  async function syncCss(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    cssSourceById.set(normalizedId, source)
    const contentCacheKey = createSourceCandidateContentCacheKey('css', source, options.bareArbitraryValues, options.extractor)
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    if (cachedCandidates) {
      replaceCssLayer(normalizedId, new Set(cachedCandidates))
      return
    }

    const nextCandidates = await extractCandidates(source, 'css', options)
    sourceCandidateContentCache.set(contentCacheKey, [...nextCandidates])

    replaceCssLayer(normalizedId, nextCandidates)
  }

  async function merge(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    transformSourceById.set(normalizedId, source)
    const extension = resolveSourceCandidateExtension(normalizedId)
    const contentCacheKey = createSourceCandidateContentCacheKey(extension, source, options.bareArbitraryValues, options.extractor)
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    const extractedCandidates = cachedCandidates
      ? new Set(cachedCandidates)
      : await extractCandidates(source, extension, options)
    if (!cachedCandidates) {
      sourceCandidateContentCache.set(contentCacheKey, [...extractedCandidates])
    }

    replaceTransformLayer(normalizedId, extractedCandidates)
  }

  async function syncFile(id: string) {
    const normalizedId = cleanUrl(id)
    try {
      await sync(normalizedId, await readFile(normalizedId, 'utf8'))
    }
    catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? (error as { code?: unknown }).code
        : undefined
      if (code === 'ENOENT') {
        remove(normalizedId)
        return
      }
      throw error
    }
  }

  async function syncCurrentSource(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    transformCandidatesById.delete(normalizedId)
    cssCandidatesById.delete(normalizedId)
    transformSourceById.delete(normalizedId)
    cssSourceById.delete(normalizedId)
    recompute(normalizedId)
    const previousCandidates = values()
    await sync(normalizedId, source)
    return diffCandidateSets(previousCandidates, values())
  }

  async function syncCurrentFile(id: string) {
    const normalizedId = cleanUrl(id)
    try {
      return await syncCurrentSource(normalizedId, await readFile(normalizedId, 'utf8'))
    }
    catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? (error as { code?: unknown }).code
        : undefined
      if (code === 'ENOENT') {
        return remove(normalizedId)
      }
      throw error
    }
  }

  async function scanRoot({ entries, explicit, root, outDir }: ScanSourceCandidateRootOptions) {
    const files = await resolveSourceCandidateScanFiles({
      entries,
      explicit,
      filter: isSourceCandidateRequest,
      outDir,
      root,
    })
    await Promise.all(files.map(file => syncFile(resolveSourceScanPath(file))))
  }

  function replaceFinal(id: string, nextCandidates: Set<string>) {
    const normalizedId = cleanUrl(id)
    const previousCandidates = candidatesById.get(normalizedId)
    if (previousCandidates) {
      removeCandidateSet(candidateCount, previousCandidates)
      candidatesById.delete(normalizedId)
    }
    if (nextCandidates.size === 0) {
      return
    }
    candidatesById.set(normalizedId, nextCandidates)
    addCandidateSet(candidateCount, nextCandidates)
  }

  function replaceScanLayer(id: string, nextCandidates: Set<string>) {
    const normalizedId = cleanUrl(id)
    if (nextCandidates.size === 0) {
      scanCandidatesById.delete(normalizedId)
    }
    else {
      scanCandidatesById.set(normalizedId, nextCandidates)
    }
    recompute(normalizedId)
  }

  function replaceTransformLayer(id: string, nextCandidates: Set<string>) {
    const normalizedId = cleanUrl(id)
    if (nextCandidates.size === 0) {
      transformCandidatesById.delete(normalizedId)
    }
    else {
      transformCandidatesById.set(normalizedId, nextCandidates)
    }
    recompute(normalizedId)
  }

  function replaceCssLayer(id: string, nextCandidates: Set<string>) {
    const normalizedId = cleanUrl(id)
    if (nextCandidates.size === 0) {
      cssCandidatesById.delete(normalizedId)
    }
    else {
      cssCandidatesById.set(normalizedId, nextCandidates)
    }
    recompute(normalizedId)
  }

  function recompute(id: string) {
    const normalizedId = cleanUrl(id)
    const nextCandidates = new Set([
      ...(scanCandidatesById.get(normalizedId) ?? []),
      ...(transformCandidatesById.get(normalizedId) ?? []),
      ...(cssCandidatesById.get(normalizedId) ?? []),
    ])
    replaceFinal(normalizedId, nextCandidates)
  }

  function syncInline(inlineCandidates: TailwindInlineSourceCandidates | undefined) {
    inlineIncludedCandidates = new Set(inlineCandidates?.included ?? [])
    inlineExcludedCandidates = new Set(inlineCandidates?.excluded ?? [])
  }

  function remove(id: string) {
    const normalizedId = cleanUrl(id)
    const previousValues = values()
    scanCandidatesById.delete(normalizedId)
    transformCandidatesById.delete(normalizedId)
    cssCandidatesById.delete(normalizedId)
    scanSourceById.delete(normalizedId)
    transformSourceById.delete(normalizedId)
    cssSourceById.delete(normalizedId)
    const previousCandidates = candidatesById.get(normalizedId)
    if (!previousCandidates) {
      return diffCandidateSets(previousValues, values())
    }
    removeCandidateSet(candidateCount, previousCandidates)
    candidatesById.delete(normalizedId)
    return diffCandidateSets(previousValues, values())
  }

  function source(id: string) {
    const normalizedId = cleanUrl(id)
    return scanSourceById.get(normalizedId)
      ?? cssSourceById.get(normalizedId)
      ?? transformSourceById.get(normalizedId)
  }

  function sources() {
    return mergeSourcesByPriority().entries()
  }

  function values() {
    const values = new Set([
      ...candidateCount.keys(),
      ...inlineIncludedCandidates,
    ])
    for (const candidate of inlineExcludedCandidates) {
      values.delete(candidate)
    }
    return values
  }

  function valuesForEntries(entries: TailwindSourceEntry[] | undefined, options: SourceCandidateFilterOptions = {}) {
    if (entries === undefined) {
      if (!options.excludeEntries?.length) {
        return values()
      }
    }
    if (entries?.length === 0) {
      return new Set(inlineIncludedCandidates)
    }
    const filtered = new Set<string>()
    for (const [id, candidates] of candidatesById) {
      if (entries !== undefined && !isFileMatchedByTailwindSourceEntries(id, entries)) {
        continue
      }
      if (options.excludeEntries?.length && isFileMatchedByTailwindSourceEntries(id, options.excludeEntries)) {
        continue
      }
      for (const candidate of candidates) {
        filtered.add(candidate)
      }
    }
    for (const candidate of inlineIncludedCandidates) {
      filtered.add(candidate)
    }
    for (const candidate of inlineExcludedCandidates) {
      filtered.delete(candidate)
    }
    return filtered
  }

  function sourcesForEntries(entries: TailwindSourceEntry[] | undefined, options: SourceCandidateFilterOptions = {}) {
    const sources = new Map<string, Set<string>>()
    const addCandidateSource = (candidate: string, id: string | undefined) => {
      let candidateSources = sources.get(candidate)
      if (!candidateSources) {
        candidateSources = new Set()
        sources.set(candidate, candidateSources)
      }
      if (id) {
        candidateSources.add(id)
      }
    }

    if (entries?.length === 0) {
      for (const candidate of inlineIncludedCandidates) {
        addCandidateSource(candidate, undefined)
      }
      for (const candidate of inlineExcludedCandidates) {
        sources.delete(candidate)
      }
      return sources
    }

    for (const [id, candidates] of candidatesById) {
      if (entries !== undefined && !isFileMatchedByTailwindSourceEntries(id, entries)) {
        continue
      }
      if (options.excludeEntries?.length && isFileMatchedByTailwindSourceEntries(id, options.excludeEntries)) {
        continue
      }
      for (const candidate of candidates) {
        addCandidateSource(candidate, id)
      }
    }
    for (const candidate of inlineIncludedCandidates) {
      addCandidateSource(candidate, undefined)
    }
    for (const candidate of inlineExcludedCandidates) {
      sources.delete(candidate)
    }
    return sources
  }

  function clear() {
    candidatesById.clear()
    scanCandidatesById.clear()
    transformCandidatesById.clear()
    cssCandidatesById.clear()
    scanSourceById.clear()
    transformSourceById.clear()
    cssSourceById.clear()
    candidateCount.clear()
    inlineIncludedCandidates.clear()
    inlineExcludedCandidates.clear()
  }

  function clearScan() {
    for (const id of scanCandidatesById.keys()) {
      scanCandidatesById.delete(id)
      recompute(id)
    }
    inlineIncludedCandidates.clear()
    inlineExcludedCandidates.clear()
  }

  function resetScan() {
    inlineIncludedCandidates.clear()
    inlineExcludedCandidates.clear()
  }

  function snapshot(): SourceCandidateCollectorSnapshot {
    return {
      candidatesById: [...candidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      cssCandidatesById: [...cssCandidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      cssSourceById: [...cssSourceById.entries()],
      scanCandidatesById: [...scanCandidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      scanSourceById: [...scanSourceById.entries()],
      sourceById: [...mergeSourcesByPriority().entries()],
      transformCandidatesById: [...transformCandidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      transformSourceById: [...transformSourceById.entries()],
      inlineExcludedCandidates: [...inlineExcludedCandidates],
      inlineIncludedCandidates: [...inlineIncludedCandidates],
    }
  }

  function restore(snapshot: SourceCandidateCollectorSnapshot) {
    clear()
    inlineExcludedCandidates = new Set(snapshot.inlineExcludedCandidates)
    inlineIncludedCandidates = new Set(snapshot.inlineIncludedCandidates)
    const scanEntries = snapshot.scanCandidatesById ?? snapshot.candidatesById
    for (const [id, candidates] of scanEntries) {
      const candidateSet = new Set(candidates)
      if (candidateSet.size === 0) {
        continue
      }
      scanCandidatesById.set(id, candidateSet)
    }
    for (const [id, candidates] of snapshot.transformCandidatesById ?? []) {
      const candidateSet = new Set(candidates)
      if (candidateSet.size === 0) {
        continue
      }
      transformCandidatesById.set(id, candidateSet)
    }
    for (const [id, candidates] of snapshot.cssCandidatesById ?? []) {
      const candidateSet = new Set(candidates)
      if (candidateSet.size === 0) {
        continue
      }
      cssCandidatesById.set(id, candidateSet)
    }
    for (const [id, source] of snapshot.scanSourceById ?? snapshot.sourceById ?? []) {
      scanSourceById.set(id, source)
    }
    for (const [id, source] of snapshot.transformSourceById ?? []) {
      transformSourceById.set(id, source)
    }
    for (const [id, source] of snapshot.cssSourceById ?? []) {
      cssSourceById.set(id, source)
    }
    const ids = new Set([
      ...scanCandidatesById.keys(),
      ...transformCandidatesById.keys(),
      ...cssCandidatesById.keys(),
    ])
    for (const id of ids) {
      recompute(id)
    }
  }

  return {
    syncSource: sync,
    sync,
    syncCss,
    merge,
    syncFile,
    syncCurrentSource,
    syncCurrentFile,
    scanRoot,
    syncInline,
    remove,
    source,
    sources,
    values,
    valuesForEntries,
    sourcesForEntries,
    snapshot,
    restore,
    clearScan,
    resetScan,
    clear,
  }

  function mergeSourcesByPriority() {
    const sources = new Map<string, string>()
    for (const [id, source] of transformSourceById) {
      sources.set(id, source)
    }
    for (const [id, source] of cssSourceById) {
      sources.set(id, source)
    }
    for (const [id, source] of scanSourceById) {
      sources.set(id, source)
    }
    return sources
  }
}

export function createSourceCandidateCollector(options: SourceCandidateCollectorOptions = {}): SourceCandidateCollector {
  return createSourceCandidateStore(options)
}

export function getSourceCandidateContentCacheStatsForTest() {
  return {
    max: SOURCE_CANDIDATE_CONTENT_CACHE_MAX,
    size: sourceCandidateContentCache.size,
    keys: [...sourceCandidateContentCache.keys()],
  }
}

export function clearSourceCandidateContentCacheForTest() {
  sourceCandidateContentCache.clear()
}
