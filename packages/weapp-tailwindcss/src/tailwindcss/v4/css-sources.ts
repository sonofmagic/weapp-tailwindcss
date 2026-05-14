import type { TailwindV4CssSource } from 'tailwindcss-patch'
import type { UserDefinedOptions } from '@/types'
import path from 'node:path'
import { omitUndefined } from '@/utils/object'

function hasCssEntriesValue(value: unknown) {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return Array.isArray(value) && value.some(entry => typeof entry === 'string' && entry.trim().length > 0)
}

export function hasCssSourcesValue(value: unknown) {
  return Array.isArray(value) && value.some((source) => {
    return typeof source === 'object'
      && source !== null
      && typeof (source as { css?: unknown }).css === 'string'
      && (source as { css: string }).css.trim().length > 0
  })
}

export function hasConfiguredTailwindV4CssRoots(
  options: Pick<UserDefinedOptions, 'cssEntries' | 'tailwindcss' | 'tailwindcssPatcherOptions'>,
) {
  return hasCssEntriesValue(options.cssEntries)
    || hasCssEntriesValue(options.tailwindcss?.v4?.cssEntries)
    || hasCssEntriesValue((options.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssEntries)
    || hasCssSourcesValue(options.tailwindcss?.v4?.cssSources)
    || hasCssSourcesValue((options.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssSources)
}

function normalizeCssSourceFile(file: string | undefined) {
  if (!file) {
    return undefined
  }
  return path.isAbsolute(file) ? path.normalize(file) : file
}

function normalizeDependencies(dependencies: string[] | undefined) {
  return dependencies
    ?.map(normalizeCssSourceFile)
    .filter((dependency): dependency is string => typeof dependency === 'string' && dependency.length > 0)
}

function isSameCssSource(a: TailwindV4CssSource, b: TailwindV4CssSource) {
  return a.css === b.css
    && a.base === b.base
    && normalizeCssSourceFile(a.file) === normalizeCssSourceFile(b.file)
    && JSON.stringify(normalizeDependencies(a.dependencies)) === JSON.stringify(normalizeDependencies(b.dependencies))
}

export function upsertTailwindV4CssSource(
  opts: UserDefinedOptions,
  source: TailwindV4CssSource,
) {
  const normalizedSource: TailwindV4CssSource = omitUndefined({
    ...source,
    ...(source.file === undefined ? {} : { file: normalizeCssSourceFile(source.file) }),
    ...(source.dependencies === undefined ? {} : { dependencies: normalizeDependencies(source.dependencies) }),
  }) as TailwindV4CssSource
  const tailwindcss = opts.tailwindcss ?? {}
  const v4 = tailwindcss.v4 ?? {}
  const cssSources = [...(v4.cssSources ?? [])]
  const sourceFile = normalizeCssSourceFile(normalizedSource.file)
  const existingIndex = cssSources.findIndex(candidate => normalizeCssSourceFile(candidate.file) === sourceFile)
  if (existingIndex >= 0) {
    const existing = cssSources[existingIndex]
    if (!existing) {
      cssSources[existingIndex] = normalizedSource
      return true
    }
    const nextSource = {
      ...existing,
      ...normalizedSource,
    }
    if (isSameCssSource(existing, nextSource)) {
      return false
    }
    cssSources[existingIndex] = nextSource
  }
  else {
    cssSources.push(normalizedSource)
  }
  opts.tailwindcss = {
    ...tailwindcss,
    v4: {
      ...v4,
      cssSources,
    },
  }
  return true
}
