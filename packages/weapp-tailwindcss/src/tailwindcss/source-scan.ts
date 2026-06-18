import type { TailwindV4CssSource } from '@tailwindcss-mangle/engine'
import type { Root } from '@weapp-tailwindcss/postcss'
import { realpathSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { resolveProjectSourceFiles } from '@tailwindcss-mangle/engine'
import micromatch from 'micromatch'

export interface TailwindSourceEntry {
  base: string
  pattern: string
  negated: boolean
}

export type { TailwindInlineSourceCandidates } from './source-scan/inline-source'
export { collectCssInlineSourceCandidates, expandInlineSourceCandidatePattern } from './source-scan/inline-source'

interface LegacyContentObject {
  files?: LegacyContentConfig
  relative?: boolean
}

type LegacyContentConfig
  = | string
    | string[]
    | LegacyContentObject
    | Array<string | LegacyContentObject>

export const DEFAULT_SOURCE_SCAN_EXTENSIONS = [
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
  'vue',
  'mpx',
  'js',
  'jsx',
  'ts',
  'tsx',
]

export const FULL_SOURCE_SCAN_EXTENSIONS = [
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

export function createSourceScanPattern(extensions = DEFAULT_SOURCE_SCAN_EXTENSIONS) {
  return `**/*.{${extensions.join(',')}}`
}

export const FULL_SOURCE_SCAN_PATTERN = createSourceScanPattern(FULL_SOURCE_SCAN_EXTENSIONS)
export const FULL_SOURCE_SCAN_EXTENSION_RE = new RegExp(`\\.(?:${FULL_SOURCE_SCAN_EXTENSIONS.map(extension => extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`)

export function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

export function resolveSourceScanPath(value: string) {
  const resolved = path.resolve(value)
  try {
    return realpathSync.native(resolved)
  }
  catch {
    return resolved
  }
}

function normalizeEntryPattern(entry: TailwindSourceEntry) {
  return path.isAbsolute(entry.pattern)
    ? toPosixPath(path.relative(resolveSourceScanPath(entry.base), entry.pattern))
    : entry.pattern
}

function isFileMatchedByTailwindSourceEntry(file: string, entry: TailwindSourceEntry) {
  const relative = toPosixPath(path.relative(resolveSourceScanPath(entry.base), file))
  return relative && !relative.startsWith('../') && !path.isAbsolute(relative) && micromatch.isMatch(relative, normalizeEntryPattern(entry))
}

export function isFileExcludedByTailwindSourceEntries(file: string, entries: TailwindSourceEntry[] | undefined) {
  if (!entries?.length) {
    return false
  }
  const resolvedFile = resolveSourceScanPath(file)
  return entries.some(entry => entry.negated && isFileMatchedByTailwindSourceEntry(resolvedFile, entry))
}

export function isFileMatchedByTailwindSourceEntries(file: string, entries: TailwindSourceEntry[] | undefined) {
  if (!entries?.length) {
    return true
  }
  const positiveEntries = entries.filter(entry => !entry.negated)
  const negativeEntries = entries.filter(entry => entry.negated)
  const resolvedFile = resolveSourceScanPath(file)
  if (positiveEntries.length === 0) {
    return !negativeEntries.some(entry => isFileMatchedByTailwindSourceEntry(resolvedFile, entry))
  }
  const matchesPositive = positiveEntries.some(entry => isFileMatchedByTailwindSourceEntry(resolvedFile, entry))
  if (!matchesPositive) {
    return false
  }
  return !negativeEntries.some(entry => isFileMatchedByTailwindSourceEntry(resolvedFile, entry))
}

export function createTailwindSourceEntryMatcher(entries: TailwindSourceEntry[] | undefined) {
  if (!entries?.length) {
    return undefined
  }
  return (file: string) => isFileMatchedByTailwindSourceEntries(file, entries)
}

export function resolveTailwindV4CssSourceBase(
  source: Pick<TailwindV4CssSource, 'base' | 'file'>,
  fallbackBase: string,
) {
  if (typeof source.base === 'string' && source.base.length > 0) {
    return source.base
  }
  if (typeof source.file === 'string' && source.file.length > 0) {
    return path.dirname(source.file)
  }
  return fallbackBase
}

export function parseConfigParam(params: string) {
  const value = params.trim()
  const match = /^(['"])(.+)\1$/.exec(value)
  return match?.[2]
}

function isLegacyContentObject(value: unknown): value is LegacyContentObject {
  return typeof value === 'object' && value !== null && 'files' in value
}

function normalizeGlobPattern(pattern: string) {
  return pattern.startsWith('./') ? pattern.slice(2) : pattern
}

function hasGlobMagic(value: string) {
  return /[*?[\]{}()!+@]/.test(value)
}

function splitStaticGlobPrefix(pattern: string) {
  const normalized = normalizeGlobPattern(pattern)
  const segments = normalized.split(/[\\/]+/)
  const prefix: string[] = []
  const rest: string[] = []
  let reachedGlob = false
  for (const segment of segments) {
    if (!reachedGlob && segment && !hasGlobMagic(segment)) {
      prefix.push(segment)
      continue
    }
    reachedGlob = true
    rest.push(segment)
  }
  return {
    prefix,
    rest,
  }
}

export function normalizeLegacyContentEntries(
  content: unknown,
  base: string,
  options: { relativeBase?: string | undefined } = {},
): TailwindSourceEntry[] {
  if (typeof content === 'string') {
    const negated = content.startsWith('!')
    return [{
      base,
      negated,
      pattern: normalizeGlobPattern(negated ? content.slice(1) : content),
    }]
  }
  if (Array.isArray(content)) {
    return content.flatMap(item => normalizeLegacyContentEntries(item, base, options))
  }
  if (isLegacyContentObject(content)) {
    return normalizeLegacyContentEntries(content.files, content.relative && options.relativeBase ? options.relativeBase : base, options)
  }
  return []
}

async function pathExistsAsDirectory(file: string) {
  try {
    return (await stat(file)).isDirectory()
  }
  catch {
    return false
  }
}

export async function resolveTailwindSourceEntry(
  sourcePath: string,
  base: string,
  negated: boolean,
  defaultPattern = createSourceScanPattern(),
): Promise<TailwindSourceEntry> {
  const absoluteSource = path.isAbsolute(sourcePath) ? path.resolve(sourcePath) : path.resolve(base, sourcePath)
  if (await pathExistsAsDirectory(absoluteSource)) {
    return {
      base: absoluteSource,
      negated,
      pattern: normalizeGlobPattern(defaultPattern),
    }
  }

  if (path.isAbsolute(sourcePath) && hasGlobMagic(sourcePath)) {
    const { prefix, rest } = splitStaticGlobPrefix(sourcePath)
    const root = path.parse(sourcePath).root
    const normalizedPrefix = prefix[0] === '' ? prefix.slice(1) : prefix
    if (rest.length > 0) {
      return {
        base: path.resolve(root, ...normalizedPrefix),
        negated,
        pattern: normalizeGlobPattern(rest.join('/')),
      }
    }
  }

  if (path.isAbsolute(sourcePath)) {
    return {
      base: path.dirname(absoluteSource),
      negated,
      pattern: normalizeGlobPattern(path.basename(absoluteSource)),
    }
  }

  const { prefix, rest } = splitStaticGlobPrefix(sourcePath)
  if (prefix.length > 0 && rest.length > 0) {
    return {
      base: path.resolve(base, ...prefix),
      negated,
      pattern: normalizeGlobPattern(rest.join('/')),
    }
  }

  return {
    base,
    negated,
    pattern: normalizeGlobPattern(sourcePath),
  }
}

export function parseSourceFileParam(params: string) {
  const value = params.trim()
  if (!value || value === 'none' || value.startsWith('inline(')) {
    return undefined
  }

  const negated = value.startsWith('not ')
  const sourceValue = negated ? value.slice(4).trim() : value
  if (sourceValue.startsWith('inline(')) {
    return undefined
  }

  const match = /^(['"])(.+)\1$/.exec(sourceValue)
  return match?.[2]
    ? {
        negated,
        sourcePath: match[2],
      }
    : undefined
}

export async function resolveCssSourceEntries(
  root: Root,
  base: string,
  defaultPattern = createSourceScanPattern(),
) {
  const entries: TailwindSourceEntry[] = []
  const tasks: Array<Promise<TailwindSourceEntry>> = []
  root.walkAtRules('source', (rule) => {
    const parsed = parseSourceFileParam(rule.params)
    if (!parsed) {
      return
    }
    tasks.push(resolveTailwindSourceEntry(parsed.sourcePath, base, parsed.negated, defaultPattern))
  })
  entries.push(...await Promise.all(tasks))
  return entries
}

export async function expandTailwindSourceEntries(
  entries: TailwindSourceEntry[],
  options: {
    ignore?: string[]
  } = {},
) {
  if (entries.length === 0) {
    return []
  }

  const files = new Set<string>()
  const entriesByBase = new Map<string, TailwindSourceEntry[]>()
  for (const entry of entries) {
    const base = path.resolve(entry.base)
    const group = entriesByBase.get(base) ?? []
    group.push({
      ...entry,
      base,
    })
    entriesByBase.set(base, group)
  }

  await Promise.all([...entriesByBase.entries()].map(async ([base, group]) => {
    const ignoredSources = options.ignore?.map(pattern => ({
      base,
      pattern: normalizeGlobPattern(pattern),
      negated: true,
    }))
    const matched = await resolveProjectSourceFiles({
      cwd: base,
      sources: group,
      ...(ignoredSources === undefined ? {} : { ignoredSources }),
    })
    for (const file of matched) {
      files.add(path.resolve(file))
    }
  }))

  return [...files].filter(file => !isFileExcludedByTailwindSourceEntries(file, entries))
}
