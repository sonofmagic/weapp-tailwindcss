import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { TailwindcssPatcherLike, UserDefinedOptions } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import micromatch from 'micromatch'
import postcss from 'postcss'
import {
  collectCssInlineSourceCandidates,
  createSourceScanPattern,
  normalizeLegacyContentEntries,
  resolveCssSourceEntries,
} from '@/tailwindcss/source-scan'
import { resolveTailwindV3SourceFromPatcher } from '@/tailwindcss/v3-engine'
import { resolveTailwindV4SourceFromPatcher, resolveTailwindV4SourceOptionsFromPatcher } from '@/tailwindcss/v4-engine'

const VITE_SOURCE_CANDIDATE_EXTENSIONS = [
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
const VITE_SOURCE_CANDIDATE_PATTERN = createSourceScanPattern(VITE_SOURCE_CANDIDATE_EXTENSIONS)

function parseImportSourceParam(params: string) {
  const match = /\bsource\(\s*(none|(['"])(.*?)\2)\s*\)/.exec(params)
  if (!match) {
    return undefined
  }
  return {
    none: match[1] === 'none',
    sourcePath: match[3],
  }
}

function isTailwindCssImport(params: string) {
  return /^\s*(['"])tailwindcss(?:\/[^'"]*)?\1/.test(params)
}

function resolveSourceBase(base: string, sourcePath: string) {
  return path.isAbsolute(sourcePath) ? sourcePath : path.resolve(base, sourcePath)
}

interface ResolvedTailwindV4CssEntries {
  entries: TailwindSourceEntry[]
  explicit: boolean
  inlineCandidates: TailwindInlineSourceCandidates
}

export interface ResolvedViteSourceScan {
  entries?: TailwindSourceEntry[]
  inlineCandidates?: TailwindInlineSourceCandidates
}

async function resolveTailwindV4EntriesFromCss(css: string, base: string): Promise<ResolvedTailwindV4CssEntries | undefined> {
  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return undefined
  }

  let importSourceBase: string | undefined
  let hasSourceNone = false
  const entries = await resolveCssSourceEntries(root, base, VITE_SOURCE_CANDIDATE_PATTERN)
  const inlineCandidates = collectCssInlineSourceCandidates(root)

  root.walkAtRules('import', (rule) => {
    if (!isTailwindCssImport(rule.params)) {
      return
    }
    const sourceParam = parseImportSourceParam(rule.params)
    if (sourceParam?.none) {
      hasSourceNone = true
    }
    if (sourceParam?.sourcePath) {
      importSourceBase = resolveSourceBase(base, sourceParam.sourcePath)
    }
  })

  if (importSourceBase) {
    return {
      entries: [
        {
          base: importSourceBase,
          negated: false,
          pattern: VITE_SOURCE_CANDIDATE_PATTERN,
        },
        ...entries,
      ],
      explicit: true,
      inlineCandidates,
    }
  }

  if (hasSourceNone) {
    return {
      entries,
      explicit: true,
      inlineCandidates,
    }
  }

  return entries.length > 0
    ? {
        entries,
        explicit: true,
        inlineCandidates,
      }
    : inlineCandidates.included.size > 0 || inlineCandidates.excluded.size > 0
      ? {
          entries: [],
          explicit: true,
          inlineCandidates,
        }
      : undefined
}

function collectExistingCssEntries(options: UserDefinedOptions) {
  return [
    ...(options.cssEntries ?? []),
    ...(options.tailwindcss?.v4?.cssEntries ?? []),
    ...((options.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssEntries ?? []),
  ]
    .filter((item): item is string => typeof item === 'string' && item.length > 0)
    .map(item => path.resolve(item))
    .filter(item => existsSync(item))
}

function mergeInlineCandidates(
  allInlineCandidates: Array<TailwindInlineSourceCandidates | undefined>,
): TailwindInlineSourceCandidates | undefined {
  const merged: TailwindInlineSourceCandidates = {
    included: new Set(),
    excluded: new Set(),
  }
  for (const inlineCandidates of allInlineCandidates) {
    if (!inlineCandidates) {
      continue
    }
    for (const candidate of inlineCandidates.included) {
      if (!merged.excluded.has(candidate)) {
        merged.included.add(candidate)
      }
    }
    for (const candidate of inlineCandidates.excluded) {
      merged.excluded.add(candidate)
      merged.included.delete(candidate)
    }
  }
  return merged.included.size > 0 || merged.excluded.size > 0
    ? merged
    : undefined
}

export async function resolveViteSourceScanEntries(
  options: UserDefinedOptions,
  patcher: TailwindcssPatcherLike,
): Promise<ResolvedViteSourceScan | undefined> {
  if (patcher.majorVersion === 3) {
    const source = await resolveTailwindV3SourceFromPatcher(patcher)
    const contentEntries = normalizeLegacyContentEntries(source.configObject?.content, source.config ? path.dirname(source.config) : source.cwd)
    return contentEntries.length > 0 ? { entries: contentEntries } : undefined
  }

  if (patcher.majorVersion === 4) {
    const sourceOptions = resolveTailwindV4SourceOptionsFromPatcher(patcher)
    const cssEntries = collectExistingCssEntries(options)
    const entries: TailwindSourceEntry[] = []
    const cssInlineCandidates: TailwindInlineSourceCandidates[] = []
    for (const cssEntry of cssEntries) {
      const css = readFileSync(cssEntry, 'utf8')
      const resolved = await resolveTailwindV4EntriesFromCss(css, path.dirname(cssEntry))
      if (resolved) {
        entries.push(...resolved.entries)
        cssInlineCandidates.push(resolved.inlineCandidates)
      }
    }
    const inlineCandidates = mergeInlineCandidates(cssInlineCandidates)
    if (entries.length > 0 || inlineCandidates) {
      return {
        entries,
        inlineCandidates,
      }
    }

    if (typeof sourceOptions.css === 'string' && sourceOptions.css.length > 0) {
      const resolved = await resolveTailwindV4EntriesFromCss(sourceOptions.css, sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd())
      return resolved
        ? {
            entries: resolved.entries,
            inlineCandidates: resolved.inlineCandidates,
          }
        : undefined
    }

    const source = await resolveTailwindV4SourceFromPatcher(patcher)
    const resolved = await resolveTailwindV4EntriesFromCss(source.css, source.base)
    return resolved
      ? {
          entries: resolved.entries,
          inlineCandidates: resolved.inlineCandidates,
        }
      : undefined
  }

  return undefined
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

export function createViteSourceScanMatcher(entries: TailwindSourceEntry[] | undefined) {
  if (!entries?.length) {
    return undefined
  }
  const positiveEntries = entries.filter(entry => !entry.negated)
  const negativeEntries = entries.filter(entry => entry.negated)
  if (positiveEntries.length === 0) {
    return () => false
  }

  return (file: string) => {
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
}
