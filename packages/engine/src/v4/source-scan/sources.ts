import type { SourceEntry } from '@tailwindcss/oxide'
import type { TailwindV4CompiledSourceRoot, TailwindV4SourcePattern } from '../types.ts'
import { realpathSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

export const TAILWIND_V4_IGNORED_CONTENT_DIRS = [
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

export const TAILWIND_V4_IGNORED_EXTENSIONS = [
  'less',
  'lock',
  'sass',
  'scss',
  'styl',
  'log',
]

export const TAILWIND_V4_IGNORED_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'bun.lockb',
  '.gitignore',
  '.env',
  '.env.*',
]

export const TAILWIND_V4_AUTO_SOURCE_SCAN_PATTERN = '**/*'

function uniqueResolvedPaths(values: Iterable<string | undefined>) {
  const result: string[] = []
  for (const value of values) {
    if (!value) {
      continue
    }
    const resolved = path.resolve(value)
    if (!result.includes(resolved)) {
      result.push(resolved)
    }
  }
  return result
}

export function toPosixPath(value: string) {
  return value.replaceAll(path.sep, '/')
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

export function normalizeGlobPattern(pattern: string) {
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

async function pathExistsAsDirectory(file: string) {
  try {
    return (await stat(file)).isDirectory()
  }
  catch {
    return false
  }
}

export function createTailwindV4DefaultIgnoreSources(base: string): TailwindV4SourcePattern[] {
  return [
    ...TAILWIND_V4_IGNORED_CONTENT_DIRS.map(pattern => ({
      base,
      pattern: `**/${pattern}/**`,
      negated: true,
    })),
    ...TAILWIND_V4_IGNORED_EXTENSIONS.map(extension => ({
      base,
      pattern: `**/*.${extension}`,
      negated: true,
    })),
    ...TAILWIND_V4_IGNORED_FILES.map(pattern => ({
      base,
      pattern: `**/${pattern}`,
      negated: true,
    })),
  ]
}

export function createTailwindV4RootSources(
  root: TailwindV4CompiledSourceRoot,
  fallbackBase: string,
): TailwindV4SourcePattern[] {
  if (root === 'none') {
    return []
  }
  if (root === null) {
    return [{ base: fallbackBase, pattern: TAILWIND_V4_AUTO_SOURCE_SCAN_PATTERN, negated: false }]
  }
  return [{ ...root, negated: false }]
}

export function createTailwindV4CompiledSourceEntries(
  root: TailwindV4CompiledSourceRoot,
  sources: TailwindV4SourcePattern[],
  fallbackBase: string,
) {
  return [
    ...createTailwindV4RootSources(root, fallbackBase),
    ...sources,
  ]
}

export async function resolveTailwindV4SourceEntry(
  sourcePath: string,
  base: string,
  negated: boolean,
  defaultPattern = TAILWIND_V4_AUTO_SOURCE_SCAN_PATTERN,
): Promise<TailwindV4SourcePattern> {
  const absoluteSource = path.isAbsolute(sourcePath) ? path.resolve(sourcePath) : path.resolve(base, sourcePath)

  if (await pathExistsAsDirectory(absoluteSource)) {
    return {
      base: absoluteSource,
      negated,
      pattern: normalizeGlobPattern(defaultPattern),
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

export async function normalizeTailwindV4SourceEntries(
  sources: TailwindV4SourcePattern[],
  options: {
    cwd?: string
    defaultPattern?: string
  } = {},
) {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd()
  return Promise.all(sources.map(source =>
    resolveTailwindV4SourceEntry(
      source.pattern,
      source.base ? path.resolve(source.base) : cwd,
      source.negated,
      options.defaultPattern,
    )))
}

function expandBracePattern(pattern: string): string[] {
  const index = pattern.indexOf('{')
  if (index === -1) {
    return [pattern]
  }

  const rest = pattern.slice(index)
  let depth = 0
  let endIndex = -1
  for (let i = 0; i < rest.length; i++) {
    const char = rest[i]
    if (char === '\\') {
      i += 1
      continue
    }
    if (char === '{') {
      depth += 1
      continue
    }
    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        endIndex = i
        break
      }
    }
  }
  if (endIndex === -1) {
    return [pattern]
  }

  const prefix = pattern.slice(0, index)
  const inner = rest.slice(1, endIndex)
  const suffix = rest.slice(endIndex + 1)
  const parts: string[] = []
  const stack: string[] = []
  let lastPos = 0
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i]
    if (char === '\\') {
      i += 1
      continue
    }
    if (char === '{') {
      stack.push('}')
      continue
    }
    if (char === '}' && stack[stack.length - 1] === '}') {
      stack.pop()
      continue
    }
    if (char === ',' && stack.length === 0) {
      parts.push(inner.slice(lastPos, i))
      lastPos = i + 1
    }
  }
  parts.push(inner.slice(lastPos))

  return parts.flatMap(part =>
    expandBracePattern(`${prefix}${part}${suffix}`))
}

export function expandTailwindV4SourceEntryBraces(sources: TailwindV4SourcePattern[]): TailwindV4SourcePattern[] {
  return sources.flatMap((source) => {
    const base = path.resolve(source.base)
    return expandBracePattern(source.pattern).map(pattern => ({
      base,
      pattern,
      negated: source.negated,
    }))
  })
}

export function normalizeTailwindV4ScannerSources(
  sources: TailwindV4SourcePattern[] | undefined,
  cwd: string,
  ignoredSources: TailwindV4SourcePattern[] = [],
): SourceEntry[] {
  const baseSources = sources?.length
    ? sources
    : [
        {
          base: cwd,
          pattern: TAILWIND_V4_AUTO_SOURCE_SCAN_PATTERN,
          negated: false,
        },
      ]

  return expandTailwindV4SourceEntryBraces([...baseSources, ...ignoredSources])
}

export function resolveTailwindV4SourceBaseCandidates(
  projectRoot: string,
  base: string,
  baseFallbacks: string[],
) {
  return uniqueResolvedPaths([base, projectRoot, ...baseFallbacks])
}
