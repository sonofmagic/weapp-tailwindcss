import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import { realpathSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import micromatch from 'micromatch'
import { extractSourceCandidates, resolveProjectSourceFiles } from 'tailwindcss-patch'

export interface SourceCandidateCollector {
  sync: (id: string, source: string) => Promise<void>
  merge: (id: string, source: string) => Promise<void>
  syncFile: (id: string) => Promise<void>
  syncCurrentFile: (id: string) => Promise<void>
  scanRoot: (options: ScanSourceCandidateRootOptions) => Promise<void>
  syncInline: (inlineCandidates: TailwindInlineSourceCandidates | undefined) => void
  remove: (id: string) => void
  values: () => Set<string>
  valuesForEntries: (entries: TailwindSourceEntry[] | undefined) => Set<string>
  snapshot: () => SourceCandidateCollectorSnapshot
  restore: (snapshot: SourceCandidateCollectorSnapshot) => void
  clear: () => void
}

export interface SourceCandidateCollectorSnapshot {
  candidatesById: Array<[string, string[]]>
  scanCandidatesById?: Array<[string, string[]]> | undefined
  transformCandidatesById?: Array<[string, string[]]> | undefined
  inlineExcludedCandidates: string[]
  inlineIncludedCandidates: string[]
}

interface ScanSourceCandidateRootOptions {
  root: string
  outDir?: string | undefined
  entries?: TailwindSourceEntry[] | undefined
}

const CLEAN_URL_RE = /[?#].*$/
const SOURCE_CANDIDATE_EXTENSION_RE = /\.(?:[cm]?[jt]sx?|vue|uvue|nvue|svelte|mpx|html|wxml|axml|jxml|ksml|ttml|qml|tyml|xhsml|swan|css|wxss|acss|jxss|ttss|qss|tyss|scss|sass|less|stylus?)$/
const sourceCandidateContentCache = new Map<string, string[]>()

function cleanUrl(id: string) {
  const resolved = path.resolve(id.replace(CLEAN_URL_RE, ''))
  try {
    return realpathSync.native(resolved)
  }
  catch {
    return resolved
  }
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

function resolveEntryBase(entry: TailwindSourceEntry) {
  return cleanUrl(entry.base)
}

function resolveOutDirIgnorePattern(root: string, outDir: string | undefined) {
  if (!outDir) {
    return
  }
  const relative = path.relative(root, path.resolve(root, outDir))
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    return
  }
  return `${toPosixPath(relative)}/**`
}

function resolveSourceCandidateExtension(id: string) {
  const normalized = cleanUrl(id)
  const match = /\.([^.\\/]+)$/.exec(normalized)
  return match?.[1] ?? 'html'
}

function createSourceCandidateContentCacheKey(extension: string, source: string) {
  return `${extension}\0${source}`
}

export function isSourceCandidateRequest(id: string) {
  return SOURCE_CANDIDATE_EXTENSION_RE.test(cleanUrl(id))
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

function isFileMatchedByEntries(file: string, entries: TailwindSourceEntry[] | undefined) {
  if (!entries?.length) {
    return true
  }
  const positiveEntries = entries.filter(entry => !entry.negated)
  const negativeEntries = entries.filter(entry => entry.negated)
  if (positiveEntries.length === 0) {
    return false
  }
  const resolvedFile = path.resolve(file)
  const matchesPositive = positiveEntries.some((entry) => {
    const relative = toPosixPath(path.relative(resolveEntryBase(entry), resolvedFile))
    const pattern = path.isAbsolute(entry.pattern)
      ? toPosixPath(path.relative(resolveEntryBase(entry), entry.pattern))
      : entry.pattern
    return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, pattern)
  })
  if (!matchesPositive) {
    return false
  }
  return !negativeEntries.some((entry) => {
    const relative = toPosixPath(path.relative(resolveEntryBase(entry), resolvedFile))
    const pattern = path.isAbsolute(entry.pattern)
      ? toPosixPath(path.relative(resolveEntryBase(entry), entry.pattern))
      : entry.pattern
    return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, pattern)
  })
}

export function createSourceCandidateCollector(): SourceCandidateCollector {
  const candidatesById = new Map<string, Set<string>>()
  const scanCandidatesById = new Map<string, Set<string>>()
  const transformCandidatesById = new Map<string, Set<string>>()
  const candidateCount = new Map<string, number>()
  let inlineIncludedCandidates = new Set<string>()
  let inlineExcludedCandidates = new Set<string>()

  async function sync(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    const extension = resolveSourceCandidateExtension(normalizedId)
    const contentCacheKey = createSourceCandidateContentCacheKey(extension, source)
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    if (cachedCandidates) {
      replaceScanLayer(normalizedId, new Set(cachedCandidates))
      return
    }

    const nextCandidates = new Set(await extractSourceCandidates(source, extension))
    sourceCandidateContentCache.set(contentCacheKey, [...nextCandidates])

    replaceScanLayer(normalizedId, nextCandidates)
  }

  async function merge(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    const extension = resolveSourceCandidateExtension(normalizedId)
    const contentCacheKey = createSourceCandidateContentCacheKey(extension, source)
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    const extractedCandidates = cachedCandidates
      ? new Set(cachedCandidates)
      : new Set(await extractSourceCandidates(source, extension))
    if (!cachedCandidates) {
      sourceCandidateContentCache.set(contentCacheKey, [...extractedCandidates])
    }

    replaceTransformLayer(normalizedId, extractedCandidates)
  }

  async function syncFile(id: string) {
    const normalizedId = cleanUrl(id)
    await sync(normalizedId, await readFile(normalizedId, 'utf8'))
  }

  async function syncCurrentFile(id: string) {
    const normalizedId = cleanUrl(id)
    transformCandidatesById.delete(normalizedId)
    await syncFile(normalizedId)
  }

  async function scanRoot({ entries, root, outDir }: ScanSourceCandidateRootOptions) {
    const resolvedRoot = path.resolve(root)
    const outDirIgnore = resolveOutDirIgnorePattern(resolvedRoot, outDir)
    const scanEntries = outDirIgnore
      ? [
          ...(entries?.length
            ? entries
            : [{
                base: resolvedRoot,
                pattern: '**/*',
                negated: false,
              }]),
          {
            base: resolvedRoot,
            pattern: outDirIgnore,
            negated: true,
          },
        ]
      : entries
    const files = await resolveProjectSourceFiles({
      cwd: resolvedRoot,
      ...(scanEntries === undefined ? {} : { sources: scanEntries }),
      filter: isSourceCandidateRequest,
    })

    await Promise.all(files.map(file => syncFile(file)))
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

  function recompute(id: string) {
    const normalizedId = cleanUrl(id)
    const nextCandidates = new Set([
      ...(scanCandidatesById.get(normalizedId) ?? []),
      ...(transformCandidatesById.get(normalizedId) ?? []),
    ])
    replaceFinal(normalizedId, nextCandidates)
  }

  function syncInline(inlineCandidates: TailwindInlineSourceCandidates | undefined) {
    inlineIncludedCandidates = new Set(inlineCandidates?.included ?? [])
    inlineExcludedCandidates = new Set(inlineCandidates?.excluded ?? [])
  }

  function remove(id: string) {
    const normalizedId = cleanUrl(id)
    scanCandidatesById.delete(normalizedId)
    transformCandidatesById.delete(normalizedId)
    const previousCandidates = candidatesById.get(normalizedId)
    if (!previousCandidates) {
      return
    }
    removeCandidateSet(candidateCount, previousCandidates)
    candidatesById.delete(normalizedId)
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

  function valuesForEntries(entries: TailwindSourceEntry[] | undefined) {
    if (entries === undefined) {
      return values()
    }
    const filtered = new Set<string>()
    for (const [id, candidates] of candidatesById) {
      if (!isFileMatchedByEntries(id, entries)) {
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

  function clear() {
    candidatesById.clear()
    scanCandidatesById.clear()
    transformCandidatesById.clear()
    candidateCount.clear()
    inlineIncludedCandidates.clear()
    inlineExcludedCandidates.clear()
  }

  function snapshot(): SourceCandidateCollectorSnapshot {
    return {
      candidatesById: [...candidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      scanCandidatesById: [...scanCandidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      transformCandidatesById: [...transformCandidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
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
    for (const [id, candidates] of snapshot.candidatesById) {
      const candidateSet = new Set(candidates)
      if (candidateSet.size === 0) {
        continue
      }
      candidatesById.set(id, candidateSet)
      addCandidateSet(candidateCount, candidateSet)
    }
  }

  return {
    sync,
    merge,
    syncFile,
    syncCurrentFile,
    scanRoot,
    syncInline,
    remove,
    values,
    valuesForEntries,
    snapshot,
    restore,
    clear,
  }
}
