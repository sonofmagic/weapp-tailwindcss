import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import fg from 'fast-glob'
import { extractRawCandidatesWithPositions } from 'tailwindcss-patch'
import { expandTailwindSourceEntries } from '@/tailwindcss/source-scan'

export interface SourceCandidateCollector {
  sync: (id: string, source: string) => Promise<void>
  syncFile: (id: string) => Promise<void>
  scanRoot: (options: ScanSourceCandidateRootOptions) => Promise<void>
  syncInline: (inlineCandidates: TailwindInlineSourceCandidates | undefined) => void
  remove: (id: string) => void
  values: () => Set<string>
  clear: () => void
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

function cleanUrl(id: string) {
  return id.replace(CLEAN_URL_RE, '')
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

const CSS_APPLY_RE = /@apply\s+([^;{}]+)/g
const CSS_APPLY_IMPORTANT = '!important'

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

export function createSourceCandidateCollector(): SourceCandidateCollector {
  const candidatesById = new Map<string, Set<string>>()
  const candidateCount = new Map<string, number>()
  let inlineIncludedCandidates = new Set<string>()
  let inlineExcludedCandidates = new Set<string>()

  async function sync(id: string, source: string) {
    const normalizedId = cleanUrl(id)
    const extension = resolveSourceCandidateExtension(normalizedId)
    const nextCandidates = new Set<string>()

    if (CSS_SOURCE_CANDIDATE_EXTENSION_RE.test(extension)) {
      for (const candidate of extractCssApplyCandidates(source)) {
        nextCandidates.add(candidate)
      }
    }
    else {
      const matches = await extractRawCandidatesWithPositions(
        source,
        extension,
      )
      for (const match of matches) {
        const candidate = match.rawCandidate
        if (typeof candidate === 'string' && candidate.length > 0) {
          nextCandidates.add(candidate)
        }
      }
    }

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

  function clear() {
    candidatesById.clear()
    candidateCount.clear()
    inlineIncludedCandidates.clear()
    inlineExcludedCandidates.clear()
  }

  return {
    sync,
    syncFile,
    scanRoot,
    syncInline,
    remove,
    values,
    clear,
  }
}
