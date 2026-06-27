import type { TailwindV4CssSource } from '@tailwindcss-mangle/engine'
import type { InternalUserDefinedOptions } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { resolveTailwindV4CssSourceBase } from '@/tailwindcss/source-scan'
import { filterTailwindV4CssSourceRoots } from '@/tailwindcss/v4/css-sources'

export interface ConfiguredCssSourceEntry {
  file: string
  source: string
}

export function collectConfiguredTailwindV4CssSources(opts: InternalUserDefinedOptions) {
  const runtimeCssSources = ((opts.tailwindcssRuntimeOptions as any)?.tailwindcss?.v4?.cssSources ?? []) as TailwindV4CssSource[]
  return filterTailwindV4CssSourceRoots([
    ...(opts.tailwindcss?.v4?.cssSources ?? []),
    ...runtimeCssSources,
  ]) ?? []
}

function collectExplicitTailwindV4CssEntries(opts: InternalUserDefinedOptions) {
  const entries = [
    ...(opts.cssEntries ?? []),
    ...(opts.tailwindcss?.v4?.cssEntries ?? []),
    ...(((opts.tailwindcssRuntimeOptions as any)?.tailwindcss?.v4?.cssEntries ?? []) as string[]),
  ]
  return [...new Set(entries.filter((entry): entry is string =>
    typeof entry === 'string' && entry.length > 0,
  ))]
}

export function collectConfiguredTailwindV4CssSourceEntries(
  opts: InternalUserDefinedOptions,
  fallbackBase: string,
) {
  const entries: ConfiguredCssSourceEntry[] = []
  const seen = new Set<string>()

  // 显式多入口需要保留入口 CSS 原文，用于把临时样式资产重新匹配回分包输出。
  const explicitCssEntries = collectExplicitTailwindV4CssEntries(opts)
  for (const cssEntry of explicitCssEntries.length > 1 ? explicitCssEntries : []) {
    if (typeof cssEntry !== 'string' || cssEntry.length === 0) {
      continue
    }
    const resolvedFile = path.isAbsolute(cssEntry)
      ? path.resolve(cssEntry)
      : path.resolve(fallbackBase, cssEntry)
    if (!existsSync(resolvedFile)) {
      continue
    }
    const source = readFileSync(resolvedFile, 'utf8')
    const key = `${resolvedFile}\0${source}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    entries.push({
      file: resolvedFile,
      source,
    })
  }
  for (const cssSource of collectConfiguredTailwindV4CssSources(opts)) {
    if (typeof cssSource.css !== 'string' || cssSource.css.length === 0) {
      continue
    }
    const base = resolveTailwindV4CssSourceBase(cssSource, fallbackBase)
    const file = typeof cssSource.file === 'string' && cssSource.file.length > 0
      ? cssSource.file
      : path.join(base, 'tailwind.css')
    const resolvedFile = path.isAbsolute(file) ? path.resolve(file) : path.resolve(base, file)
    const key = `${resolvedFile}\0${cssSource.css}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    entries.push({
      file: resolvedFile,
      source: cssSource.css,
    })
  }
  return entries
}
