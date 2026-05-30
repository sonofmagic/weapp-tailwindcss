import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { extractSourceCandidates, resolveProjectSourceFiles } from 'tailwindcss-patch'
import {
  FULL_SOURCE_SCAN_EXTENSION_RE,
  isFileMatchedByTailwindSourceEntries,
  resolveSourceScanPath,
  toPosixPath,
} from '@/tailwindcss/source-scan'

export interface SourceCandidateCollector {
  sync: (id: string, source: string) => Promise<void>
  syncCss: (id: string, source: string) => Promise<void>
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
  cssCandidatesById?: Array<[string, string[]]> | undefined
  scanCandidatesById?: Array<[string, string[]]> | undefined
  transformCandidatesById?: Array<[string, string[]]> | undefined
  inlineExcludedCandidates: string[]
  inlineIncludedCandidates: string[]
}

interface ScanSourceCandidateRootOptions {
  root: string
  outDir?: string | undefined
  entries?: TailwindSourceEntry[] | undefined
  explicit?: boolean | undefined
}

const CLEAN_URL_RE = /[?#].*$/
const TAILWIND_V4_IGNORED_CONTENT_DIRS = [
  '.git',
  '.hg',
  '.jj',
  '.next',
  '.parcel-cache',
  '.pnpm-store',
  '.svelte-kit',
  '.svn',
  '.turbo',
  '.venv',
  '.vercel',
  '.yarn',
  '__pycache__',
  'node_modules',
  'venv',
]
const TAILWIND_V4_IGNORED_EXTENSIONS = [
  'css',
  'less',
  'postcss',
  'pcss',
  'lock',
  'sass',
  'scss',
  'styl',
  'stylus',
  'log',
  'wxss',
  'acss',
  'jxss',
  'ttss',
  'qss',
  'tyss',
]
const TAILWIND_V4_IGNORED_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'bun.lockb',
  '.gitignore',
  '.env',
  '.env.*',
]
const sourceCandidateContentCache = new Map<string, string[]>()

function cleanUrl(id: string) {
  return resolveSourceScanPath(id.replace(CLEAN_URL_RE, ''))
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

function normalizeScanEntries(
  root: string,
  entries: TailwindSourceEntry[] | undefined,
  outDirIgnore: string | undefined,
) {
  const hasPositiveEntry = entries?.some(entry => !entry.negated) === true
  const scanEntries = entries?.length
    ? hasPositiveEntry
      ? entries
      : [
          {
            base: root,
            pattern: '**/*',
            negated: false,
          },
          ...entries,
        ]
    : undefined
  if (!outDirIgnore) {
    return scanEntries
  }
  return [
    ...(scanEntries ?? [{
      base: root,
      pattern: '**/*',
      negated: false,
    }]),
    {
      base: root,
      pattern: outDirIgnore,
      negated: true,
    },
  ]
}

function shouldApplyDefaultIgnoredSources(entries: TailwindSourceEntry[] | undefined) {
  return entries?.length === undefined
    ? false
    : entries.length > 0 && entries.every(entry => entry.negated)
}

function createDefaultIgnoredSources(
  root: string,
  outDirIgnore: string | undefined,
  entries: TailwindSourceEntry[] | undefined,
  explicit: boolean | undefined,
) {
  const shouldUseTailwindDefaults = !explicit || shouldApplyDefaultIgnoredSources(entries)
  const defaultIgnoredSources = shouldUseTailwindDefaults
    ? [
        ...TAILWIND_V4_IGNORED_CONTENT_DIRS.map(pattern => ({
          base: root,
          pattern: `**/${pattern}/**`,
          negated: true,
        })),
        ...TAILWIND_V4_IGNORED_EXTENSIONS.map(extension => ({
          base: root,
          pattern: `**/*.${extension}`,
          negated: true,
        })),
        ...TAILWIND_V4_IGNORED_FILES.map(pattern => ({
          base: root,
          pattern: `**/${pattern}`,
          negated: true,
        })),
      ]
    : []
  return [
    ...defaultIgnoredSources,
    ...(outDirIgnore
      ? [{
          base: root,
          pattern: outDirIgnore,
          negated: true,
        }]
      : []),
  ]
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

export function createSourceCandidateCollector(): SourceCandidateCollector {
  const candidatesById = new Map<string, Set<string>>()
  const scanCandidatesById = new Map<string, Set<string>>()
  const transformCandidatesById = new Map<string, Set<string>>()
  const cssCandidatesById = new Map<string, Set<string>>()
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

  async function syncCss(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    const contentCacheKey = createSourceCandidateContentCacheKey('css', source)
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    if (cachedCandidates) {
      replaceCssLayer(normalizedId, new Set(cachedCandidates))
      return
    }

    const nextCandidates = new Set(await extractSourceCandidates(source, 'css'))
    sourceCandidateContentCache.set(contentCacheKey, [...nextCandidates])

    replaceCssLayer(normalizedId, nextCandidates)
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

  async function scanRoot({ entries, explicit, root, outDir }: ScanSourceCandidateRootOptions) {
    const resolvedRoot = path.resolve(root)
    const outDirIgnore = resolveOutDirIgnorePattern(resolvedRoot, outDir)
    const scanEntries = normalizeScanEntries(resolvedRoot, entries, outDirIgnore)
    const ignoredSources = createDefaultIgnoredSources(resolvedRoot, outDirIgnore, entries, explicit)
    const files = await resolveProjectSourceFiles({
      cwd: resolvedRoot,
      ...(scanEntries === undefined ? {} : { sources: scanEntries }),
      ...(ignoredSources.length > 0 ? { ignoredSources } : {}),
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
    scanCandidatesById.delete(normalizedId)
    transformCandidatesById.delete(normalizedId)
    cssCandidatesById.delete(normalizedId)
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
      if (!isFileMatchedByTailwindSourceEntries(id, entries)) {
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
    cssCandidatesById.clear()
    candidateCount.clear()
    inlineIncludedCandidates.clear()
    inlineExcludedCandidates.clear()
  }

  function snapshot(): SourceCandidateCollectorSnapshot {
    return {
      candidatesById: [...candidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      cssCandidatesById: [...cssCandidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
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
    for (const [id, candidates] of snapshot.cssCandidatesById ?? []) {
      const candidateSet = new Set(candidates)
      if (candidateSet.size === 0) {
        continue
      }
      cssCandidatesById.set(id, candidateSet)
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
    syncCss,
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
