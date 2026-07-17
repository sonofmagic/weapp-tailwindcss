import type { ScanSourceCandidateRootOptions, SourceCandidateCollectorOptions, SourceCandidateCollectorSnapshot, SourceCandidateFilterOptions, SourceCandidateStore } from './types-and-cache'
import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import { readFile } from 'node:fs/promises'
import { isFileMatchedByTailwindSourceEntries, resolveSourceScanPath } from '@/tailwindcss/source-scan'
import { resolveSourceCandidateScanFiles } from './scan-root'
import { addCandidateSet, cleanUrl, createSourceCandidateContentCacheKey, diffCandidateSets, extractCandidates, isSourceCandidateRequest, removeCandidateSet, resolveSourceCandidateExtension, sourceCandidateContentCache } from './types-and-cache'

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

  async function resolveCandidates(source: string, extension: string) {
    const contentCacheKey = createSourceCandidateContentCacheKey(
      extension,
      source,
      options.bareArbitraryValues,
      options.customAttributesEntities,
      options.disabledDefaultTemplateHandler,
      options.extractor,
    )
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    if (cachedCandidates) {
      return new Set(cachedCandidates)
    }

    const nextCandidates = await extractCandidates(source, extension, options)
    sourceCandidateContentCache.set(contentCacheKey, [...nextCandidates])
    return nextCandidates
  }

  function isCandidateVisible(candidate: string) {
    if (inlineExcludedCandidates.has(candidate)) {
      return false
    }
    return inlineIncludedCandidates.has(candidate) || candidateCount.has(candidate)
  }

  function collectVisibleCandidates(candidates: Iterable<string>) {
    const visible = new Set<string>()
    for (const candidate of candidates) {
      if (isCandidateVisible(candidate)) {
        visible.add(candidate)
      }
    }
    return visible
  }

  async function sync(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    scanSourceById.set(normalizedId, source)
    const extension = resolveSourceCandidateExtension(normalizedId)
    replaceScanLayer(normalizedId, await resolveCandidates(source, extension))
  }

  async function syncCss(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    cssSourceById.set(normalizedId, source)
    replaceCssLayer(normalizedId, await resolveCandidates(source, 'css'))
  }

  async function merge(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    transformSourceById.set(normalizedId, source)
    const extension = resolveSourceCandidateExtension(normalizedId)
    replaceTransformLayer(normalizedId, await resolveCandidates(source, extension))
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
    const previousFileCandidates = new Set(candidatesById.get(normalizedId) ?? [])
    const extension = resolveSourceCandidateExtension(normalizedId)
    const nextCandidates = await resolveCandidates(source, extension)
    const affectedCandidates = new Set([
      ...previousFileCandidates,
      ...nextCandidates,
    ])
    const previousVisibleCandidates = collectVisibleCandidates(affectedCandidates)

    scanSourceById.set(normalizedId, source)
    replaceScanLayer(normalizedId, nextCandidates)

    return diffCandidateSets(
      previousVisibleCandidates,
      collectVisibleCandidates(affectedCandidates),
    )
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
    const affectedCandidates = new Set(candidatesById.get(normalizedId) ?? [])
    const previousVisibleCandidates = collectVisibleCandidates(affectedCandidates)
    scanCandidatesById.delete(normalizedId)
    transformCandidatesById.delete(normalizedId)
    cssCandidatesById.delete(normalizedId)
    scanSourceById.delete(normalizedId)
    transformSourceById.delete(normalizedId)
    cssSourceById.delete(normalizedId)
    const previousCandidates = candidatesById.get(normalizedId)
    if (!previousCandidates) {
      return diffCandidateSets(previousVisibleCandidates, new Set())
    }
    removeCandidateSet(candidateCount, previousCandidates)
    candidatesById.delete(normalizedId)
    return diffCandidateSets(
      previousVisibleCandidates,
      collectVisibleCandidates(affectedCandidates),
    )
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
