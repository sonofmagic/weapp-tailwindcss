import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { SourceSideCssEntrySource } from './source-files'
import type {
  GeneratorResolvedSource,
  GeneratorSourceRuntimeState,
  GeneratorSourceSelectionOptions,
  SourceStyleMatchOptions,
  TailwindV4CssSource,
  TailwindV4CssSourceRef,
  TailwindV4SourceOptions,
} from './source-resolver/types'
import type { NormalizedWeappTailwindcssGeneratorOptions, TailwindResolvedSource } from '@/generator'
import type { UndefinedOptional } from '@/utils/object'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { resolveTailwindV4EntriesFromCss } from '@/bundlers/vite/source-scan'
import {
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromRuntime,
  resolveTailwindV4SourceOptionsFromRuntime,
} from '@/generator'
import {
  resolveTailwindV4CssSourceBase,
} from '@/tailwindcss/source-scan'
import { omitUndefined } from '@/utils/object'
import {
  normalizeConfigDirective,
  prependConfigDirective,
} from './config-directive'
import {
  hasTailwindApplyDirective,
  hasTailwindRootDirectives,
  hasTailwindSourceDirectives,
  resolveCssEntrySource,
} from './directives'
import {
  hasTailwindGeneratedCss,
  hasTailwindGeneratedCssMarkers,
} from './markers'
import { resolveSourceSideCssEntrySource } from './source-files'
import { createTailwindV4ApplyReferenceSource, createTailwindV4SourceReferenceSource } from './source-resolver/apply-reference'
import { resolveExistingConfigPath } from './source-resolver/config'
import { normalizeCssSourceForCompare, scoreTailwindV4CssSourceFileMatch } from './source-resolver/matching'
import {
  withGeneratorSourceMetadata,
  withMatchedSourceSideMetadata,
} from './source-resolver/metadata'
import {
  resolveCssHandlerSourceOptions,
  resolveCssSourceBase,
  resolvePostcssFromOption,
  resolvePostcssSourceFile,
} from './source-resolver/postcss-source'

export type { GeneratorResolvedSource, GeneratorSourceMetadata } from './source-resolver/metadata'
export { resolveCssSourceBase } from './source-resolver/postcss-source'
export type { GeneratorSourceRuntimeState, GeneratorSourceSelectionOptions } from './source-resolver/types'

function createCssEntrySources(cssEntries: string[] | undefined) {
  return cssEntries
    ?.filter(entry => typeof entry === 'string' && entry.length > 0 && path.isAbsolute(entry))
    .map(entry => ({ file: path.resolve(entry) }) satisfies TailwindV4CssSourceRef)
}

function mergeCssSources(
  cssSources: TailwindV4CssSource[] | undefined,
  cssEntrySources: TailwindV4CssSource[] | undefined,
) {
  const merged: TailwindV4CssSource[] = []
  const seenFiles = new Set<string>()
  const addSource = (cssSource: TailwindV4CssSource) => {
    const file = typeof cssSource.file === 'string' && cssSource.file.length > 0
      ? path.resolve(cssSource.file)
      : undefined
    if (file) {
      if (seenFiles.has(file)) {
        return
      }
      seenFiles.add(file)
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

function createSingleTailwindV4SourceOptions(
  sourceOptions: TailwindV4SourceOptions,
  options: {
    base: string
    css: string
  },
) {
  return omitUndefined({
    projectRoot: sourceOptions.projectRoot,
    baseFallbacks: sourceOptions.baseFallbacks,
    packageName: sourceOptions.packageName,
    base: options.base,
    css: options.css,
  })
}

async function resolveTailwindV4CssEntrySource(
  cssEntry: string,
  sourceOptions: TailwindV4SourceOptions,
) {
  const { cssEntries: _cssEntries, cssSources: _cssSources, ...singleEntrySourceOptions } = sourceOptions
  if (!existsSync(cssEntry)) {
    return resolveTailwindV4Source({
      ...omitUndefined(singleEntrySourceOptions),
      cssEntries: [cssEntry],
    })
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
      matchedCssSourceFile: cssEntry,
      sourceBase: base,
      sourceCss: css,
    },
  )
}

function canResolveSourceSideCssEntry(
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

function shouldResolveSourceSideCssEntry(rawSource: string) {
  return rawSource.includes('@apply')
    || hasTailwindRootDirectives(rawSource, { importFallback: true })
    || hasTailwindSourceDirectives(rawSource, { importFallback: true })
    || hasTailwindGeneratedCss(rawSource)
    || hasTailwindGeneratedCssMarkers(rawSource)
}

function resolveMatchingTailwindV4CssEntry(
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
    return resolveTailwindV4CssEntrySource(pathMatchedEntries[0]!, sourceOptions)
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
  return resolveTailwindV4CssEntrySource(matchingEntry, sourceOptions)
}

function normalizeTailwindV4CssSourceConfig(
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

function normalizeResolvedTailwindV4SourceConfig<T extends TailwindResolvedSource>(
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

function normalizeTailwindV4CssSourceConfigs(sourceOptions: TailwindV4SourceOptions) {
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

async function resolveMatchingTailwindV4CssSource(
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  sourceOptions: TailwindV4SourceOptions,
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
  return resolveSingleTailwindV4CssSource(matchingSource, sourceOptions, { matched: true })
}

function tryResolveTailwindV4SourceOptions(
  runtimeState: GeneratorSourceRuntimeState,
) {
  try {
    return resolveTailwindV4SourceOptionsFromRuntime(runtimeState.tailwindRuntime)
  }
  catch {
    return undefined
  }
}

function hasConfiguredTailwindV4CssSource(
  sourceOptions: TailwindV4SourceOptions | undefined,
) {
  return Boolean(sourceOptions?.css)
    || Boolean(sourceOptions?.cssSources?.length)
}

async function resolveSingleTailwindV4CssSource(
  cssSource: TailwindV4CssSource,
  sourceOptions: TailwindV4SourceOptions,
  options: {
    matched?: boolean
  } = {},
) {
  const sourceBaseFallback = sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd()
  const sourceBase = resolveTailwindV4CssSourceBase(cssSource, sourceBaseFallback)
  const normalizedCssSource = normalizeTailwindV4CssSourceConfig(cssSource, sourceBase)
  const source = await resolveTailwindV4Source({
    ...omitUndefined(sourceOptions),
    cssSources: [normalizedCssSource],
  })
  return withGeneratorSourceMetadata(source, {
    matchedCssSourceFile: options.matched && typeof normalizedCssSource.file === 'string'
      ? normalizedCssSource.file
      : undefined,
    sourceBase,
    sourceCss: normalizedCssSource.css,
  })
}

async function resolveTailwindV4CssSourceEntries(
  cssSource: TailwindV4CssSource,
  sourceOptions: TailwindV4SourceOptions,
) {
  if (typeof cssSource.css !== 'string' || cssSource.css.length === 0) {
    return undefined
  }
  const sourceBaseFallback = sourceOptions.base ?? sourceOptions.projectRoot ?? process.cwd()
  const sourceBase = resolveTailwindV4CssSourceBase(cssSource, sourceBaseFallback)
  return resolveTailwindV4EntriesFromCss(cssSource.css, sourceBase)
}

function countRuntimeCandidateHits(candidates: Set<string>, runtime: Set<string> | undefined) {
  if (!runtime?.size) {
    return 0
  }
  let hits = 0
  for (const candidate of candidates) {
    if (runtime.has(candidate)) {
      hits += 1
    }
  }
  return hits
}

async function resolveCandidateMatchedTailwindV4CssSource(
  _rawSource: string,
  _cssHandlerOptions: IStyleHandlerOptions,
  sourceOptions: TailwindV4SourceOptions,
  selectionOptions: GeneratorSourceSelectionOptions | undefined,
) {
  const cssSources = sourceOptions.cssSources
  const getSourceCandidatesForEntries = selectionOptions?.getSourceCandidatesForEntries
  if (
    !cssSources?.length
    || !getSourceCandidatesForEntries
  ) {
    return undefined
  }

  const matches: Array<{
    cssSource: TailwindV4CssSource
    index: number
    runtimeHits: number
    totalCandidates: number
  }> = []
  await Promise.all(cssSources.map(async (cssSource, index) => {
    const resolved = await resolveTailwindV4CssSourceEntries(cssSource, sourceOptions)
    if (resolved?.entries === undefined) {
      return
    }
    const scopedCandidates = getSourceCandidatesForEntries(resolved?.entries)
    const runtimeHits = countRuntimeCandidateHits(scopedCandidates, selectionOptions?.runtime)
    if (runtimeHits === 0) {
      return
    }
    matches.push({
      cssSource,
      index,
      runtimeHits,
      totalCandidates: scopedCandidates.size,
    })
  }))
  if (matches.length === 0) {
    return undefined
  }
  matches.sort((a, b) =>
    b.runtimeHits - a.runtimeHits
    || b.totalCandidates - a.totalCandidates
    || a.index - b.index)
  const best = matches[0]
  const second = matches[1]
  if (!best) {
    return undefined
  }
  if (
    second
    && second.runtimeHits === best.runtimeHits
    && second.totalCandidates === best.totalCandidates
  ) {
    return undefined
  }
  return resolveSingleTailwindV4CssSource(best.cssSource, sourceOptions, { matched: true })
}

function createTailwindV4CssSourceResolver(
  sourceOptions: TailwindV4SourceOptions,
  generatorOptions: NormalizedWeappTailwindcssGeneratorOptions | undefined,
) {
  return (cssSource: NonNullable<typeof sourceOptions.cssSources>[number]) =>
    resolveSingleTailwindV4CssSource(cssSource, sourceOptions)
      .then(source => generatorOptions?.config
        ? {
            ...source,
            css: prependConfigDirective(source.css, generatorOptions.config),
          }
        : source)
}

async function resolveTailwindV4SourceSideEntrySource(
  resolvedEntrySource: ReturnType<typeof resolveSourceSideCssEntrySource>,
  sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromRuntime>,
  generatorOptions: NormalizedWeappTailwindcssGeneratorOptions | undefined,
  file: string,
) {
  if (!resolvedEntrySource) {
    return undefined
  }
  const resolvedSourceOptions = omitUndefined(sourceOptions)
  const config = resolveExistingConfigPath(
    resolvedEntrySource.config,
    resolvedEntrySource.configRequest,
    file,
    {
      ...resolvedSourceOptions,
      sourceFile: resolvedEntrySource.file,
    },
  )
  const css = createTailwindV4SourceReferenceSource(
    normalizeConfigDirective(
      prependConfigDirective(resolvedEntrySource.css, generatorOptions?.config),
      config,
    ),
    resolvedSourceOptions,
  )
  const source = await resolveTailwindV4Source(createSingleTailwindV4SourceOptions(resolvedSourceOptions, {
    base: resolvedEntrySource.base,
    css,
  }))
  return withMatchedSourceSideMetadata(source, resolvedEntrySource)
}

export async function resolveGeneratorSource(
  _majorVersion: number | undefined,
  runtimeState: GeneratorSourceRuntimeState,
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorOptions?: NormalizedWeappTailwindcssGeneratorOptions,
  selectionOptions?: GeneratorSourceSelectionOptions,
) {
  const base = resolveCssSourceBase(file, cssHandlerOptions)
  const cssEntrySource = resolveCssEntrySource(rawSource, base, {
    importFallback: generatorOptions?.importFallback ?? false,
    removeConfig: false,
  })
  const applyEntrySource = hasTailwindApplyDirective(rawSource)
    ? {
        base,
        css: rawSource,
      } as SourceSideCssEntrySource
    : undefined
  const sourceOptions = tryResolveTailwindV4SourceOptions(runtimeState)
  const resolvedSourceOptions: TailwindV4SourceOptions | undefined = sourceOptions
    ? omitUndefined<TailwindV4SourceOptions>({
        ...sourceOptions,
        sourceFile: sourceOptions.sourceFile ?? resolvePostcssSourceFile(cssHandlerOptions),
        ...resolveCssHandlerSourceOptions(cssHandlerOptions),
        cssEntries: selectionOptions?.cssEntries ?? sourceOptions.cssEntries,
        cssSources: mergeCssSources(
          sourceOptions.cssSources,
          sourceOptions.cssSources?.length
            ? undefined
            : createCssEntrySources(selectionOptions?.cssEntries ?? sourceOptions.cssEntries) as TailwindV4CssSource[] | undefined,
        ),
      })
    : undefined
  const normalizedSourceOptions = resolvedSourceOptions
    ? normalizeTailwindV4CssSourceConfigs(resolvedSourceOptions)
    : undefined
  if (applyEntrySource && !cssHandlerOptions.isMainChunk && !hasTailwindRootDirectives(rawSource, { importFallback: generatorOptions?.importFallback ?? false })) {
    const css = createTailwindV4ApplyReferenceSource(
      normalizeConfigDirective(
        prependConfigDirective(applyEntrySource.css, generatorOptions?.config),
        undefined,
      ),
      normalizedSourceOptions ?? {},
    )
    return resolveTailwindV4Source(createSingleTailwindV4SourceOptions(normalizedSourceOptions ?? {}, {
      base: applyEntrySource.base,
      css,
    }))
  }
  const shouldPreferSourceSideEntry = shouldResolveSourceSideCssEntry(rawSource)
    || (
      Boolean(cssEntrySource?.css.includes('weapp-tailwindcss generator-placeholder'))
      && (sourceOptions?.cssEntries?.length ?? 0) <= 1
    )
  const sourceSideEntrySource = normalizedSourceOptions
    && (shouldPreferSourceSideEntry || normalizedSourceOptions.sourceFile !== undefined)
    && canResolveSourceSideCssEntry(file, cssHandlerOptions, normalizedSourceOptions)
    ? resolveSourceSideCssEntrySource(file, normalizedSourceOptions as SourceStyleMatchOptions, { removeConfig: false })
    : undefined
  const matchedCssEntrySource = normalizedSourceOptions
    ? await resolveMatchingTailwindV4CssEntry(rawSource, file, normalizedSourceOptions)
    : undefined
  const matchedCssSource = normalizedSourceOptions && !matchedCssEntrySource
    ? await resolveMatchingTailwindV4CssSource(rawSource, file, cssHandlerOptions, normalizedSourceOptions)
    : undefined
  const candidateMatchedCssSource = normalizedSourceOptions && !matchedCssEntrySource
    ? await resolveCandidateMatchedTailwindV4CssSource(rawSource, cssHandlerOptions, normalizedSourceOptions, selectionOptions)
    : undefined
  const singleConfiguredCssSource = normalizedSourceOptions?.cssSources?.length === 1
    ? await resolveSingleTailwindV4CssSource(normalizedSourceOptions.cssSources[0]!, normalizedSourceOptions, { matched: true })
    : undefined
  const configuredCssSource = normalizedSourceOptions
    && hasConfiguredTailwindV4CssSource(normalizedSourceOptions)
    && hasTailwindGeneratedCssMarkers(rawSource)
    ? matchedCssSource ?? candidateMatchedCssSource ?? singleConfiguredCssSource ?? await resolveTailwindV4Source(normalizedSourceOptions)
    : undefined
  if (configuredCssSource) {
    return generatorOptions?.config
      ? {
          ...configuredCssSource,
          css: prependConfigDirective(configuredCssSource.css, generatorOptions.config),
        }
      : configuredCssSource
  }
  const mainCssEntrySource = normalizedSourceOptions
    && cssHandlerOptions.isMainChunk
    && normalizedSourceOptions.cssEntries?.length === 1
    ? await resolveTailwindV4CssEntrySource(normalizedSourceOptions.cssEntries[0]!, normalizedSourceOptions)
    : undefined
  const preferredCssEntrySource = matchedCssEntrySource ?? matchedCssSource ?? candidateMatchedCssSource ?? mainCssEntrySource ?? singleConfiguredCssSource
  if (preferredCssEntrySource) {
    return generatorOptions?.config
      ? {
          ...preferredCssEntrySource,
          css: prependConfigDirective(preferredCssEntrySource.css, generatorOptions.config),
        }
      : preferredCssEntrySource
  }

  const resolvedEntrySource = sourceSideEntrySource ?? cssEntrySource ?? applyEntrySource
  if (!resolvedEntrySource) {
    const source = await resolveTailwindV4SourceFromRuntime(runtimeState.tailwindRuntime)
    return generatorOptions?.config
      ? {
          ...source,
          css: prependConfigDirective(source.css, generatorOptions.config),
        }
      : source
  }
  if (sourceSideEntrySource && normalizedSourceOptions) {
    return resolveTailwindV4SourceSideEntrySource(
      sourceSideEntrySource,
      normalizedSourceOptions,
      generatorOptions,
      file,
    )
  }
  const config = resolveExistingConfigPath(
    resolvedEntrySource.config,
    resolvedEntrySource.configRequest,
    file,
    omitUndefined({
      ...(resolvedSourceOptions ?? {}),
      sourceFile: (resolvedEntrySource as SourceSideCssEntrySource).file
        ?? resolvedSourceOptions?.sourceFile
        ?? resolvePostcssSourceFile(cssHandlerOptions),
    }),
  )
  const sourceBase = resolvedEntrySource === cssEntrySource && config
    ? path.dirname(config)
    : resolvedEntrySource.base
  const css = createTailwindV4SourceReferenceSource(
    normalizeConfigDirective(
      prependConfigDirective(resolvedEntrySource.css, generatorOptions?.config),
      config,
    ),
    normalizedSourceOptions ?? {},
  )
  return resolveTailwindV4Source(createSingleTailwindV4SourceOptions(normalizedSourceOptions ?? {}, {
    base: sourceBase,
    css,
  }))
}

export async function resolveGeneratorSources(
  majorVersion: number | undefined,
  runtimeState: GeneratorSourceRuntimeState,
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorOptions?: NormalizedWeappTailwindcssGeneratorOptions,
  selectionOptions?: GeneratorSourceSelectionOptions,
): Promise<TailwindResolvedSource[]> {
  const base = resolveCssSourceBase(file, cssHandlerOptions)
  const cssEntrySource = resolveCssEntrySource(rawSource, base, {
    importFallback: generatorOptions?.importFallback ?? false,
    removeConfig: false,
  })
  if (
    majorVersion !== 4
    || (cssEntrySource && !cssHandlerOptions.isMainChunk)
    || (
      !cssHandlerOptions.isMainChunk
      && hasTailwindApplyDirective(rawSource)
      && !hasTailwindRootDirectives(rawSource, { importFallback: generatorOptions?.importFallback ?? false })
    )
  ) {
    const resolved = await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions, selectionOptions)
    return resolved ? [resolved] : []
  }

  let sourceOptions: TailwindV4SourceOptions
  try {
    const sourceOptionsFromRuntime = resolveTailwindV4SourceOptionsFromRuntime(runtimeState.tailwindRuntime)
    const cssEntries = selectionOptions?.cssEntries ?? sourceOptionsFromRuntime.cssEntries
    const runtimeCssSources = selectionOptions?.cssEntries ? undefined : sourceOptionsFromRuntime.cssSources
    sourceOptions = omitUndefined<TailwindV4SourceOptions>({
      ...sourceOptionsFromRuntime,
      sourceFile: resolvePostcssSourceFile(cssHandlerOptions),
      ...resolveCssHandlerSourceOptions(cssHandlerOptions),
      cssEntries,
      cssSources: mergeCssSources(
        mergeCssSources(runtimeCssSources, selectionOptions?.cssSources),
        undefined,
      ),
    } satisfies UndefinedOptional<TailwindV4SourceOptions>) as TailwindV4SourceOptions
  }
  catch {
    const resolved = await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions, selectionOptions)
    return resolved ? [resolved] : []
  }

  const matchedCssEntrySource = sourceOptions
    ? await resolveMatchingTailwindV4CssEntry(rawSource, file, sourceOptions)
    : undefined
  if (matchedCssEntrySource) {
    const source = generatorOptions?.config
      ? {
          ...matchedCssEntrySource,
          css: prependConfigDirective(matchedCssEntrySource.css, generatorOptions.config),
        }
      : matchedCssEntrySource
    return [
      normalizeResolvedTailwindV4SourceConfig(
        source,
        (matchedCssEntrySource as GeneratorResolvedSource).__weappTailwindcssMeta?.matchedCssSourceFile,
        sourceOptions,
      ),
    ]
  }
  const sourceSideEntrySource = canResolveSourceSideCssEntry(file, cssHandlerOptions, sourceOptions)
    ? resolveSourceSideCssEntrySource(file, sourceOptions as SourceStyleMatchOptions, { removeConfig: false })
    : undefined
  const sourceSideCssSource = await resolveTailwindV4SourceSideEntrySource(
    sourceSideEntrySource,
    sourceOptions,
    generatorOptions,
    file,
  )
  if (sourceSideCssSource) {
    return [sourceSideCssSource]
  }
  const matchedCssSource = await resolveMatchingTailwindV4CssSource(rawSource, file, cssHandlerOptions, sourceOptions)
  const candidateMatchedCssSource = await resolveCandidateMatchedTailwindV4CssSource(
    rawSource,
    cssHandlerOptions,
    sourceOptions,
    selectionOptions,
  )
  const preferredCssEntrySource = matchedCssEntrySource ?? matchedCssSource ?? candidateMatchedCssSource
  if (preferredCssEntrySource) {
    const source = generatorOptions?.config
      ? {
          ...preferredCssEntrySource,
          css: prependConfigDirective(preferredCssEntrySource.css, generatorOptions.config),
        }
      : preferredCssEntrySource
    return [
      normalizeResolvedTailwindV4SourceConfig(
        source,
        (preferredCssEntrySource as GeneratorResolvedSource).__weappTailwindcssMeta?.matchedCssSourceFile,
        sourceOptions,
      ),
    ]
  }

  if (!sourceOptions.cssEntries || sourceOptions.cssEntries.length <= 1) {
    if (cssHandlerOptions.isMainChunk && sourceOptions.cssEntries?.length === 1) {
      return [
        await resolveTailwindV4CssEntrySource(
          sourceOptions.cssEntries[0]!,
          normalizeTailwindV4CssSourceConfigs(sourceOptions),
        ).then(source => generatorOptions?.config
          ? {
              ...source,
              css: prependConfigDirective(source.css, generatorOptions.config),
            }
          : source),
      ]
    }
    if (sourceOptions.cssSources?.length === 1) {
      return [
        normalizeResolvedTailwindV4SourceConfig(
          await createTailwindV4CssSourceResolver(sourceOptions, generatorOptions)(sourceOptions.cssSources[0]!),
          sourceOptions.cssSources[0]?.file,
          sourceOptions,
        ),
      ]
    }
    const resolved = await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions, selectionOptions)
    return resolved ? [resolved] : []
  }

  if (
    cssHandlerOptions.isMainChunk
    && !cssEntrySource
    && !hasTailwindGeneratedCss(rawSource)
    && !hasTailwindGeneratedCssMarkers(rawSource)
    && !hasTailwindSourceDirectives(rawSource, {
      importFallback: generatorOptions?.importFallback ?? false,
    })
    && !rawSource.includes('weapp-tailwindcss generator-placeholder')
    && !hasConfiguredTailwindV4CssSource(sourceOptions)
  ) {
    const resolved = await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions, selectionOptions)
    return resolved ? [resolved] : []
  }

  const normalizedCssSourceOptions = normalizeTailwindV4CssSourceConfigs(sourceOptions)
  const cssEntrySources = await Promise.all(sourceOptions.cssEntries.map(cssEntry =>
    resolveTailwindV4CssEntrySource(cssEntry, normalizedCssSourceOptions).then(source => generatorOptions?.config
      ? {
          ...source,
          css: prependConfigDirective(source.css, generatorOptions.config),
        }
      : source),
  ))
  const cssSources = sourceOptions.cssSources?.length
    ? await Promise.all(sourceOptions.cssSources.map(createTailwindV4CssSourceResolver(sourceOptions, generatorOptions)))
    : []
  return [
    ...cssEntrySources,
    ...cssSources,
  ]
}

export async function resolveGeneratorSourceEntries(source: TailwindResolvedSource, runtimeState?: GeneratorSourceRuntimeState) {
  const sourceMetadata = (source as GeneratorResolvedSource).__weappTailwindcssMeta
  if (sourceMetadata?.sourceEntries) {
    return sourceMetadata.sourceEntries
  }
  if (!('css' in source) || !('base' in source) || !('baseFallbacks' in source)) {
    return undefined
  }
  const resolved = await resolveTailwindV4EntriesFromCss(
    sourceMetadata?.sourceCss ?? source.css,
    sourceMetadata?.sourceBase ?? source.base,
  )
  if (
    resolved?.entries.length === 0
    && !resolved.inlineCandidates.included.size
    && !resolved.inlineCandidates.excluded.size
    && !resolved.dependencies.length
  ) {
    if (sourceMetadata?.matchedCssSourceFile) {
      return []
    }
    return undefined
  }
  if (resolved?.entries.length || (!resolved?.explicit && !sourceMetadata?.matchedCssSourceFile) || !runtimeState) {
    return resolved?.entries
  }
  const sourceOptions = tryResolveTailwindV4SourceOptions(runtimeState)
  const matchingCssSource = sourceOptions?.cssSources?.find((cssSource) => {
    if (
      sourceMetadata?.matchedCssSourceFile
      && typeof cssSource.file === 'string'
      && path.resolve(cssSource.file) === path.resolve(sourceMetadata.matchedCssSourceFile)
    ) {
      return true
    }
    return cssSource.css === source.css
  })
  if (!matchingCssSource) {
    return resolved?.entries
  }
  const sourceResolved = await resolveTailwindV4EntriesFromCss(
    matchingCssSource.css,
    typeof matchingCssSource.base === 'string' && matchingCssSource.base.length > 0
      ? matchingCssSource.base
      : typeof matchingCssSource.file === 'string' && matchingCssSource.file.length > 0
        ? path.dirname(matchingCssSource.file)
        : source.base,
  )
  if (sourceResolved?.entries.length) {
    return sourceResolved.entries
  }
  for (const dependency of matchingCssSource.dependencies ?? []) {
    if (!existsSync(dependency)) {
      continue
    }
    try {
      const dependencyResolved = await resolveTailwindV4EntriesFromCss(
        readFileSync(dependency, 'utf8'),
        path.dirname(dependency),
      )
      if (dependencyResolved?.entries.length) {
        return dependencyResolved.entries
      }
    }
    catch {
      // 依赖内容只用于裁剪候选，读取失败时回退到 Tailwind 自身生成逻辑。
    }
  }
  return resolved?.entries
}
