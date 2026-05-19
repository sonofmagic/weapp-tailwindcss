import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import fg from 'fast-glob'
import micromatch from 'micromatch'
import { expandTailwindSourceEntries } from '@/tailwindcss/source-scan'

export interface SourceCandidateCollector {
  sync: (id: string, source: string) => Promise<void>
  syncFile: (id: string) => Promise<void>
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
  inlineExcludedCandidates: string[]
  inlineIncludedCandidates: string[]
}

interface ScanSourceCandidateRootOptions {
  root: string
  outDir?: string | undefined
  entries?: TailwindSourceEntry[] | undefined
}

const CLEAN_URL_RE = /[?#].*$/
const SOURCE_CANDIDATE_EXTENSIONS = [
  'js',
  'jsx',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'mts',
  'cts',
  'vue',
  'uvue',
  'nvue',
  'svelte',
  'mpx',
  'html',
  'wxml',
  'axml',
  'jxml',
  'ksml',
  'ttml',
  'qml',
  'tyml',
  'xhsml',
  'swan',
  'css',
  'wxss',
  'acss',
  'jxss',
  'ttss',
  'qss',
  'tyss',
  'scss',
  'sass',
  'less',
  'styl',
  'stylus',
]
const SOURCE_CANDIDATE_EXTENSION_RE = /\.(?:[cm]?[jt]sx?|vue|uvue|nvue|svelte|mpx|html|wxml|axml|jxml|ksml|ttml|qml|tyml|xhsml|swan|css|wxss|acss|jxss|ttss|qss|tyss|scss|sass|less|stylus?)$/
const CSS_SOURCE_CANDIDATE_EXTENSION_RE = /^(?:css|wxss|acss|jxss|ttss|qss|tyss|scss|sass|less|styl|stylus)$/
const SOURCE_CANDIDATE_GLOB = `**/*.{${SOURCE_CANDIDATE_EXTENSIONS.join(',')}}`
const DEFAULT_SCAN_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
]
const sourceCandidateContentCache = new Map<string, string[]>()

function cleanUrl(id: string) {
  return path.resolve(id.replace(CLEAN_URL_RE, ''))
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
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
    const relative = toPosixPath(path.relative(path.resolve(entry.base), resolvedFile))
    return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, entry.pattern)
  })
  if (!matchesPositive) {
    return false
  }
  return !negativeEntries.some((entry) => {
    const relative = toPosixPath(path.relative(path.resolve(entry.base), resolvedFile))
    return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, entry.pattern)
  })
}

const CSS_APPLY_RE = /@apply\s+([^;{}]+)/g
const CSS_APPLY_IMPORTANT = '!important'
const SOURCE_QUOTED_LITERAL_RE = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`((?:\\.|[^`\\])*)`/g

function extractCssApplyCandidates(source: string) {
  const candidates = new Set<string>()
  CSS_APPLY_RE.lastIndex = 0
  let match = CSS_APPLY_RE.exec(source)
  while (match !== null) {
    const params = match[1] ?? ''
    for (const candidate of splitCode(params, true)) {
      const normalized = candidate.trim()
      if (normalized && normalized !== CSS_APPLY_IMPORTANT) {
        candidates.add(normalized)
      }
    }
    match = CSS_APPLY_RE.exec(source)
  }
  return candidates
}

function extractSourceCandidates(source: string) {
  const candidates = new Set<string>()
  SOURCE_QUOTED_LITERAL_RE.lastIndex = 0
  let match = SOURCE_QUOTED_LITERAL_RE.exec(source)
  while (match !== null) {
    const token = match[1] ?? match[2] ?? match[3] ?? ''
    for (const candidate of splitCode(token, true)) {
      const normalized = candidate.trim()
      if (normalized) {
        candidates.add(normalized)
      }
    }
    match = SOURCE_QUOTED_LITERAL_RE.exec(source)
  }
  return candidates
}

export function createSourceCandidateCollector(): SourceCandidateCollector {
  const candidatesById = new Map<string, Set<string>>()
  const candidateCount = new Map<string, number>()
  let inlineIncludedCandidates = new Set<string>()
  let inlineExcludedCandidates = new Set<string>()

  async function sync(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    const extension = resolveSourceCandidateExtension(normalizedId)
    const contentCacheKey = createSourceCandidateContentCacheKey(extension, source)
    const cachedCandidates = sourceCandidateContentCache.get(contentCacheKey)
    if (cachedCandidates) {
      replace(normalizedId, new Set(cachedCandidates))
      return
    }

    const nextCandidates = new Set<string>()
    if (CSS_SOURCE_CANDIDATE_EXTENSION_RE.test(extension)) {
      for (const candidate of extractCssApplyCandidates(source)) {
        nextCandidates.add(candidate)
      }
    }
    else {
      for (const candidate of extractSourceCandidates(source)) {
        nextCandidates.add(candidate)
      }
    }
    sourceCandidateContentCache.set(contentCacheKey, [...nextCandidates])

    remove(normalizedId)
    if (nextCandidates.size === 0) {
      return
    }

    candidatesById.set(normalizedId, nextCandidates)
    addCandidateSet(candidateCount, nextCandidates)
  }

  async function syncFile(id: string) {
    const normalizedId = cleanUrl(id)
    await sync(normalizedId, await readFile(normalizedId, 'utf8'))
  }

  async function scanRoot({ entries, root, outDir }: ScanSourceCandidateRootOptions) {
    const resolvedRoot = path.resolve(root)
    const outDirIgnore = resolveOutDirIgnorePattern(resolvedRoot, outDir)
    const ignore = outDirIgnore
      ? [...DEFAULT_SCAN_IGNORE, outDirIgnore]
      : DEFAULT_SCAN_IGNORE
    const files = entries
      ? await expandTailwindSourceEntries(entries, { ignore })
      : await fg(SOURCE_CANDIDATE_GLOB, {
          absolute: true,
          cwd: resolvedRoot,
          ignore,
          onlyFiles: true,
          unique: true,
        })

    await Promise.all(files.map(file => syncFile(file)))
  }

  function replace(id: string, nextCandidates: Set<string>) {
    const normalizedId = cleanUrl(id)
    remove(normalizedId)
    if (nextCandidates.size === 0) {
      return
    }
    candidatesById.set(normalizedId, nextCandidates)
    addCandidateSet(candidateCount, nextCandidates)
  }

  function syncInline(inlineCandidates: TailwindInlineSourceCandidates | undefined) {
    inlineIncludedCandidates = new Set(inlineCandidates?.included ?? [])
    inlineExcludedCandidates = new Set(inlineCandidates?.excluded ?? [])
  }

  function remove(id: string) {
    const normalizedId = cleanUrl(id)
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
    candidateCount.clear()
    inlineIncludedCandidates.clear()
    inlineExcludedCandidates.clear()
  }

  function snapshot(): SourceCandidateCollectorSnapshot {
    return {
      candidatesById: [...candidatesById.entries()].map(([id, candidates]) => [id, [...candidates]]),
      inlineExcludedCandidates: [...inlineExcludedCandidates],
      inlineIncludedCandidates: [...inlineIncludedCandidates],
    }
  }

  function restore(snapshot: SourceCandidateCollectorSnapshot) {
    clear()
    inlineExcludedCandidates = new Set(snapshot.inlineExcludedCandidates)
    inlineIncludedCandidates = new Set(snapshot.inlineIncludedCandidates)
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
    syncFile,
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
