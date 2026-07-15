import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { GeneratorResolvedSource } from './metadata'
import type { GeneratorSourceRuntimeState, GeneratorSourceSelectionOptions, SourceStyleMatchOptions, TailwindV4CssSource, TailwindV4CssSourceRef, TailwindV4SourceOptions } from './types'
import type { TailwindResolvedSource } from '@/generator'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { resolveTailwindV4Source, resolveTailwindV4SourceOptionsFromRuntime } from '@/generator'
import { resolveTailwindV4CssSourceBase } from '@/tailwindcss/source-scan'
import { omitUndefined } from '@/utils/object'
import { normalizeConfigDirective } from '../config-directive'
import { hasTailwindRootDirectives, hasTailwindSourceDirectives, resolveCssEntrySource } from '../directives'
import { hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers } from '../markers'
import { resolveExistingConfigPath } from './config'
import { normalizeCssSourceForCompare, scoreTailwindV4CssSourceFileMatch } from './matching'
import { withGeneratorSourceMetadata } from './metadata'
import { resolvePostcssFromOption, resolvePostcssSourceFile } from './postcss-source'
import { resolveSingleTailwindV4CssSource, resolveTailwindV4CssEntryIncludesPreflight, resolveTailwindV4CssSourceEntries } from './single-source'

export function createCssEntrySources(cssEntries: string[] | undefined) {
  return cssEntries
    ?.filter(entry => typeof entry === 'string' && entry.length > 0 && path.isAbsolute(entry))
    .map(entry => ({ file: path.resolve(entry) }) satisfies TailwindV4CssSourceRef)
}

export function mergeCssSources(
  cssSources: TailwindV4CssSource[] | undefined,
  cssEntrySources: TailwindV4CssSource[] | undefined,
) {
  const merged: TailwindV4CssSource[] = []
  const fileIndex = new Map<string, number>()
  const addSource = (cssSource: TailwindV4CssSource) => {
    const file = typeof cssSource.file === 'string' && cssSource.file.length > 0
      ? path.resolve(cssSource.file)
      : undefined
    if (file) {
      const previousIndex = fileIndex.get(file)
      if (previousIndex !== undefined) {
        const previous = merged[previousIndex]
        if (
          typeof previous?.css !== 'string'
          && typeof cssSource.css === 'string'
        ) {
          merged[previousIndex] = cssSource
        }
        return
      }
      fileIndex.set(file, merged.length)
    }
    merged.push(cssSource)
  }
  for (const cssSource of cssSources ?? []) {
    addSource(cssSource)
  }
  for (const cssSource of cssEntrySources ?? []) {
    addSource(cssSource)
  }
  return merged.length > 0 ? merged : undefined
}

export function createSingleTailwindV4SourceOptions(
  sourceOptions: TailwindV4SourceOptions,
  options: {
    base: string
    css: string
    cssEntries?: string[] | undefined
  },
) {
  return omitUndefined({
    projectRoot: sourceOptions.projectRoot,
    baseFallbacks: sourceOptions.baseFallbacks,
    packageName: sourceOptions.packageName,
    base: options.base,
    css: options.css,
    cssEntries: options.cssEntries,
  })
}

export async function resolveTailwindV4CssEntrySource(
  cssEntry: string,
  sourceOptions: TailwindV4SourceOptions,
  options: {
    candidateMatched?: boolean | undefined
    includesPreflight?: boolean | undefined
    index?: number | undefined
  } = {},
) {
  const { cssEntries: _cssEntries, cssSources: _cssSources, ...singleEntrySourceOptions } = sourceOptions
  if (!existsSync(cssEntry)) {
    return withGeneratorSourceMetadata(
      await resolveTailwindV4Source({
        ...omitUndefined(singleEntrySourceOptions),
        cssEntries: [cssEntry],
      }),
      {
        candidateMatchedCssSource: options.candidateMatched,
        cssEntryIndex: options.index,
        includesPreflight: options.includesPreflight,
        primaryCssSource: options.index === 0,
      },
    )
  }
  const css = readFileSync(cssEntry, 'utf8')
  const base = path.dirname(path.resolve(cssEntry))
  const entrySource = resolveCssEntrySource(css, base, {
    removeConfig: false,
  })
  const config = resolveExistingConfigPath(
    entrySource?.config,
    entrySource?.configRequest,
    cssEntry,
    {
      ...sourceOptions,
      sourceFile: sourceOptions.sourceFile ?? cssEntry,
    },
  )
  return withGeneratorSourceMetadata(
    await resolveTailwindV4Source({
      ...omitUndefined(singleEntrySourceOptions),
      base,
      css: normalizeConfigDirective(css, config),
      cssEntries: [cssEntry],
    }),
    {
      candidateMatchedCssSource: options.candidateMatched,
      cssEntryIndex: options.index,
      includesPreflight: options.includesPreflight,
      matchedCssSourceFile: cssEntry,
      primaryCssSource: options.index === 0,
      sourceBase: base,
      sourceCss: css,
    },
  )
}

export function canResolveSourceSideCssEntry(
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  sourceOptions?: Pick<SourceStyleMatchOptions, 'sourceFile' | 'cssSources' | 'outputRoot'>,
) {
  const from = resolvePostcssFromOption(cssHandlerOptions)
  if (!from || !path.isAbsolute(from)) {
    return path.isAbsolute(file)
      || Boolean(sourceOptions?.sourceFile)
      || Boolean(sourceOptions?.cssSources?.length)
  }
  return true
}

export function shouldResolveSourceSideCssEntry(rawSource: string) {
  return rawSource.includes('@apply')
    || hasTailwindRootDirectives(rawSource, { importFallback: true })
    || hasTailwindSourceDirectives(rawSource, { importFallback: true })
    || hasTailwindGeneratedCss(rawSource)
    || hasTailwindGeneratedCssMarkers(rawSource)
}

export async function resolveMatchingTailwindV4CssEntry(
  rawSource: string,
  file: string,
  sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromRuntime>,
) {
  const cssEntries = sourceOptions.cssEntries
  if (!cssEntries?.length) {
    return undefined
  }

  const normalizedFile = path.resolve(file.replace(/[?#].*$/, ''))
  const pathMatchedEntries = cssEntries.filter(cssEntry =>
    path.resolve(cssEntry.replace(/[?#].*$/, '')) === normalizedFile,
  )
  if (pathMatchedEntries.length === 1) {
    return resolveTailwindV4CssEntrySource(pathMatchedEntries[0]!, sourceOptions, {
      includesPreflight: await resolveTailwindV4CssEntryIncludesPreflight(pathMatchedEntries[0]!),
      index: cssEntries.indexOf(pathMatchedEntries[0]!),
    })
  }

  const normalizedRawSource = normalizeCssSourceForCompare(rawSource)
  const matches = cssEntries
    .map((cssEntry) => {
      if (!existsSync(cssEntry)) {
        return undefined
      }
      try {
        const entrySource = readFileSync(cssEntry, 'utf8')
        const pathScore = scoreTailwindV4CssSourceFileMatch(file, cssEntry, sourceOptions)
        if (normalizeCssSourceForCompare(entrySource) === normalizedRawSource) {
          return {
            cssEntry,
            score: 1000000 + pathScore,
          }
        }
        return undefined
      }
      catch {
        return undefined
      }
    })
    .filter((match): match is { cssEntry: string, score: number } => Boolean(match))
    .sort((a, b) => b.score - a.score)
  const bestScore = matches[0]?.score
  const matchingEntry = bestScore && matches.filter(match => match.score === bestScore).length === 1
    ? matches[0]?.cssEntry
    : undefined
  if (!matchingEntry) {
    return undefined
  }
  return resolveTailwindV4CssEntrySource(matchingEntry, sourceOptions, {
    includesPreflight: await resolveTailwindV4CssEntryIncludesPreflight(matchingEntry),
    index: cssEntries.indexOf(matchingEntry),
  })
}

export function normalizeTailwindV4CssSourceConfig(
  cssSource: TailwindV4CssSource,
  sourceBase: string,
) {
  if (typeof cssSource.css !== 'string' || cssSource.css.length === 0 || !cssSource.css.includes('@config')) {
    return cssSource
  }
  const entrySource = resolveCssEntrySource(cssSource.css, sourceBase, {
    removeConfig: false,
  })
  if (!entrySource?.config) {
    return cssSource
  }
  return {
    ...cssSource,
    css: normalizeConfigDirective(cssSource.css, entrySource.config),
  }
}

export function normalizeResolvedTailwindV4SourceConfig<T extends TailwindResolvedSource>(
  source: T,
  file: string | undefined,
  sourceOptions: TailwindV4SourceOptions | undefined,
) {
  if (!('css' in source) || typeof source.css !== 'string' || !source.css.includes('@config')) {
    return source
  }
  const sourceFile = typeof file === 'string' && file.length > 0
    ? file
    : (source as GeneratorResolvedSource).__weappTailwindcssMeta?.matchedCssSourceFile
  if (!sourceFile) {
    return source
  }
  const entrySource = resolveCssEntrySource(source.css, path.dirname(path.resolve(sourceFile)), {
    removeConfig: false,
  })
  const config = resolveExistingConfigPath(
    entrySource?.config,
    entrySource?.configRequest,
    sourceFile,
    sourceOptions ?? {},
  )
  const normalizedCss = normalizeConfigDirective(source.css, config)
  return normalizedCss === source.css
    ? source
    : {
        ...source,
        css: normalizedCss,
      }
}

function hydrateTailwindV4CssSource(
  cssSource: TailwindV4CssSource,
): TailwindV4CssSource {
  if (typeof cssSource.css === 'string' && cssSource.css.length > 0) {
    return cssSource
  }
  if (typeof cssSource.file !== 'string' || !existsSync(cssSource.file)) {
    return cssSource
  }
  const file = path.resolve(cssSource.file)
  return {
    ...cssSource,
    file,
    base: cssSource.base ?? path.dirname(file),
    css: readFileSync(file, 'utf8'),
    dependencies: [
      ...new Set([
        ...(cssSource.dependencies ?? []),
        file,
      ]),
    ],
  }
}

export function normalizeTailwindV4CssSourceConfigs(sourceOptions: TailwindV4SourceOptions) {
  if (!sourceOptions.cssSources?.length) {
    return sourceOptions
  }

  const sourceBaseFallback = sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd()
  let changed = false
  const cssSources = sourceOptions.cssSources.map((cssSource) => {
    const hydratedCssSource = hydrateTailwindV4CssSource(cssSource)
    const sourceBase = resolveTailwindV4CssSourceBase(hydratedCssSource, sourceBaseFallback)
    const normalizedCssSource = normalizeTailwindV4CssSourceConfig(hydratedCssSource, sourceBase)
    changed ||= normalizedCssSource !== cssSource
    return normalizedCssSource
  })
  return changed
    ? {
        ...sourceOptions,
        cssSources,
      }
    : sourceOptions
}

export async function resolveMatchingTailwindV4CssSource(
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  sourceOptions: TailwindV4SourceOptions,
  selectionOptions?: GeneratorSourceSelectionOptions | undefined,
) {
  const cssSources = sourceOptions.cssSources
  if (!cssSources?.length) {
    return undefined
  }

  const normalizedRawSource = normalizeCssSourceForCompare(rawSource)
  const sourceFile = resolvePostcssSourceFile(cssHandlerOptions)
  const matches = cssSources
    .map((cssSource, index) => {
      if (typeof cssSource.css !== 'string' || cssSource.css.length === 0) {
        return undefined
      }
      if (sourceFile && typeof cssSource.file === 'string' && path.resolve(sourceFile) === path.resolve(cssSource.file)) {
        return {
          cssSource,
          index,
          score: 1000000,
        }
      }
      if (normalizeCssSourceForCompare(cssSource.css) === normalizedRawSource) {
        const pathScore = typeof cssSource.file === 'string'
          ? scoreTailwindV4CssSourceFileMatch(file, cssSource.file, sourceOptions)
          : 0
        return {
          cssSource,
          index,
          score: 1 + pathScore,
        }
      }
      return undefined
    })
    .filter((match): match is { cssSource: TailwindV4CssSource, index: number, score: number } => Boolean(match))
    .sort((a, b) => b.score - a.score || a.index - b.index)
  const bestScore = matches[0]?.score
  const matchingSource = bestScore && matches.filter(match => match.score === bestScore).length === 1
    ? matches[0]?.cssSource
    : undefined
  if (!matchingSource) {
    return undefined
  }
  return resolveSingleTailwindV4CssSource(matchingSource, sourceOptions, {
    includesPreflight: await resolveTailwindV4CssSourceEntries(matchingSource, sourceOptions).then(resolved => resolved?.includesPreflight),
    index: matches[0]?.index,
    matched: true,
    primary: isSameTailwindV4CssSource(matchingSource, selectionOptions?.cssSources?.[0]),
  })
}

export function tryResolveTailwindV4SourceOptions(
  runtimeState: GeneratorSourceRuntimeState,
): TailwindV4SourceOptions | undefined {
  try {
    return resolveTailwindV4SourceOptionsFromRuntime(runtimeState.tailwindRuntime)
  }
  catch {
    return undefined
  }
}

export function hasConfiguredTailwindV4CssSource(
  sourceOptions: TailwindV4SourceOptions | undefined,
) {
  return Boolean(sourceOptions?.css)
    || Boolean(sourceOptions?.cssSources?.length)
}

export function isSameTailwindV4CssSource(
  a: TailwindV4CssSource | undefined,
  b: TailwindV4CssSource | undefined,
) {
  if (!a || !b) {
    return false
  }
  if (typeof a.file === 'string' && typeof b.file === 'string') {
    return path.resolve(a.file) === path.resolve(b.file)
  }
  return typeof a.css === 'string'
    && typeof b.css === 'string'
    && normalizeCssSourceForCompare(a.css) === normalizeCssSourceForCompare(b.css)
}
