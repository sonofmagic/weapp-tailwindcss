import type { TailwindInlineSourceCandidates, TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { TailwindcssRuntimeLike, UserDefinedOptions } from '@/types'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  createTailwindSourceEntryMatcher,
  resolveTailwindV4CssSourceBase,
} from '@/tailwindcss/source-scan'
import { resolveTailwindV4SourceFromRuntime, resolveTailwindV4SourceOptionsFromRuntime } from '@/tailwindcss/v4-engine'
import {
  collectConfiguredCssSources,
  collectExistingCssEntries,
  discoverTailwindV4CssEntries,
  mergeTailwindInlineSourceCandidates,
  resolveTailwindV4EntriesFromCssCached,
} from './source-scan/css-entries'
import { addSourceScanDependencies, addSourceScanDependency } from './source-scan/dependencies'

export {
  discoverTailwindV4CssEntries,
  resolveTailwindConfigEntriesFromCssCached,
  resolveTailwindV4EntriesFromCss,
  resolveTailwindV4EntriesFromCssCached,
  resolveViteTailwindV4CssDependencies,
} from './source-scan/css-entries'

export type { ResolvedTailwindV4CssEntries } from './source-scan/css-entries'

export interface ResolvedViteSourceScan {
  dependencies?: string[] | undefined
  entries?: TailwindSourceEntry[] | undefined
  explicit?: boolean | undefined
  inlineCandidates?: TailwindInlineSourceCandidates | undefined
}

interface ResolveViteSourceScanOptions {
  root?: string | undefined
  outDir?: string | undefined
}

function createResolvedViteSourceScan(input: ResolvedViteSourceScan, dependencies: Set<string>): ResolvedViteSourceScan {
  return {
    ...input,
    ...(dependencies.size > 0 ? { dependencies: [...dependencies].sort() } : {}),
  }
}

function createMergedCssEntrySourceScanEntries(
  entries: TailwindSourceEntry[],
  options: {
    sourceCount: number
  },
) {
  if (options.sourceCount <= 1) {
    return entries
  }
  const positiveEntries = entries.filter(entry => !entry.negated)
  return positiveEntries.length > 0 ? positiveEntries : entries
}

function createResolvedV4CssScanInput(
  entries: TailwindSourceEntry[],
  inlineCandidates: TailwindInlineSourceCandidates | undefined,
  explicit: boolean,
): Pick<ResolvedViteSourceScan, 'entries' | 'explicit' | 'inlineCandidates'> {
  return {
    entries: explicit ? entries : entries.length > 0 ? entries : undefined,
    explicit,
    inlineCandidates,
  }
}

export async function resolveViteSourceScanEntries(
  options: UserDefinedOptions,
  runtime: TailwindcssRuntimeLike,
  scanOptions: ResolveViteSourceScanOptions = {},
): Promise<ResolvedViteSourceScan | undefined> {
  const sourceOptions = resolveTailwindV4SourceOptionsFromRuntime(runtime)
  const cssEntries = collectExistingCssEntries(options)
  if (cssEntries.length === 0 && !sourceOptions.css && !sourceOptions.cssSources?.length) {
    const scanRoot = scanOptions.root
    const sourceProjectRoot = sourceOptions.projectRoot
    if (scanRoot && sourceProjectRoot && path.resolve(scanRoot) === path.resolve(sourceProjectRoot)) {
      const discoveredCssEntries = await discoverTailwindV4CssEntries(
        scanRoot,
        scanOptions.outDir,
      )
      cssEntries.push(...discoveredCssEntries)
    }
  }
  const entries: TailwindSourceEntry[] = []
  const cssInlineCandidates: TailwindInlineSourceCandidates[] = []
  const dependencies = new Set<string>()
  let explicit = false
  let readableCssEntryCount = 0
  for (const cssEntry of cssEntries) {
    addSourceScanDependency(dependencies, cssEntry)
    let css: string
    try {
      css = readFileSync(cssEntry, 'utf8')
    }
    catch {
      // 自动发现或 Vite transform 记录的 CSS 入口可能在测试/临时构建清理后消失。
      continue
    }
    readableCssEntryCount++
    const resolved = await resolveTailwindV4EntriesFromCssCached(css, path.dirname(cssEntry))
    if (resolved) {
      entries.push(...resolved.entries)
      cssInlineCandidates.push(resolved.inlineCandidates)
      addSourceScanDependencies(dependencies, resolved.dependencies)
      explicit ||= resolved.explicit
    }
  }
  const inlineCandidates = mergeTailwindInlineSourceCandidates(cssInlineCandidates)
  const scanEntries = createMergedCssEntrySourceScanEntries(entries, {
    sourceCount: readableCssEntryCount,
  })
  if (scanEntries.length > 0 || inlineCandidates || explicit || readableCssEntryCount > 0) {
    return createResolvedViteSourceScan({
      entries: explicit ? scanEntries : scanEntries.length > 0 ? scanEntries : undefined,
      explicit,
      inlineCandidates,
    }, dependencies)
  }

  if (typeof sourceOptions.css === 'string' && sourceOptions.css.length > 0) {
    const resolved = await resolveTailwindV4EntriesFromCssCached(sourceOptions.css, sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd())
    return resolved
      ? createResolvedViteSourceScan(
          createResolvedV4CssScanInput(resolved.entries, resolved.inlineCandidates, resolved.explicit),
          new Set(resolved.dependencies),
        )
      : undefined
  }

  const sourceOptionBase = sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd()
  const configuredCssSources = collectConfiguredCssSources(options)
  for (const cssSource of [
    ...configuredCssSources,
    ...(sourceOptions.cssSources ?? []),
  ]) {
    if (typeof cssSource.css !== 'string' || cssSource.css.length === 0) {
      continue
    }
    addSourceScanDependency(dependencies, cssSource.file)
    addSourceScanDependencies(dependencies, cssSource.dependencies)
    const resolved = await resolveTailwindV4EntriesFromCssCached(
      cssSource.css,
      resolveTailwindV4CssSourceBase(cssSource, sourceOptionBase),
    )
    if (resolved) {
      entries.push(...resolved.entries)
      cssInlineCandidates.push(resolved.inlineCandidates)
      addSourceScanDependencies(dependencies, resolved.dependencies)
      explicit ||= resolved.explicit
    }
  }
  const cssSourceInlineCandidates = mergeTailwindInlineSourceCandidates(cssInlineCandidates)
  const cssSourceCount = (sourceOptions.cssSources?.length ?? 0) + configuredCssSources.length
  const cssSourceScanEntries = createMergedCssEntrySourceScanEntries(entries, {
    sourceCount: cssSourceCount,
  })
  if (cssSourceScanEntries.length > 0 || cssSourceInlineCandidates || explicit) {
    return createResolvedViteSourceScan({
      entries: explicit ? cssSourceScanEntries : cssSourceScanEntries.length > 0 ? cssSourceScanEntries : undefined,
      explicit,
      inlineCandidates: cssSourceInlineCandidates,
    }, dependencies)
  }
  if (cssSourceCount > 0) {
    return undefined
  }

  const source = await resolveTailwindV4SourceFromRuntime(runtime)
  addSourceScanDependency(dependencies, (source as { file?: string }).file)
  addSourceScanDependencies(dependencies, (source as { dependencies?: string[] }).dependencies)
  const resolved = await resolveTailwindV4EntriesFromCssCached(source.css, source.base)
  return resolved
    ? createResolvedViteSourceScan(
        createResolvedV4CssScanInput(
          resolved.entries.length > 0 ? resolved.entries : [],
          resolved.inlineCandidates,
          resolved.entries.length > 0 ? resolved.explicit : false,
        ),
        new Set([...dependencies, ...resolved.dependencies]),
      )
    : undefined
}

export function createViteSourceScanMatcher(entries: TailwindSourceEntry[] | undefined) {
  if (entries?.length === 0) {
    return undefined
  }
  return createTailwindSourceEntryMatcher(entries)
}
