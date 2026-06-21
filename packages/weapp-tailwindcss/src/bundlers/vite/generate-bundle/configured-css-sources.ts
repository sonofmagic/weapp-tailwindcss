import type { TailwindV4CssSource } from '@tailwindcss-mangle/engine'
import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import { resolveTailwindV4CssSourceBase } from '@/tailwindcss/source-scan'

export interface ConfiguredCssSourceEntry {
  file: string
  source: string
}

export function collectConfiguredTailwindV4CssSources(opts: InternalUserDefinedOptions) {
  const runtimeCssSources = ((opts.tailwindcssRuntimeOptions as any)?.tailwindcss?.v4?.cssSources ?? []) as TailwindV4CssSource[]
  return [
    ...(opts.tailwindcss?.v4?.cssSources ?? []),
    ...runtimeCssSources,
  ]
}

export function collectConfiguredTailwindV4CssSourceEntries(
  opts: InternalUserDefinedOptions,
  fallbackBase: string,
) {
  const entries: ConfiguredCssSourceEntry[] = []
  const seen = new Set<string>()
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
