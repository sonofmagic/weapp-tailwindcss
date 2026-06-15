import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { SourceSideCssEntryOptions, SourceSideCssEntrySource } from './source-files'
import type { NormalizedWeappTailwindcssGeneratorOptions, TailwindResolvedSource } from '@/generator'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import type { UndefinedOptional } from '@/utils/object'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { postcss } from '@weapp-tailwindcss/postcss'
import { splitCandidateTokens } from 'tailwindcss-patch'
import { resolveTailwindConfigEntriesFromCssCached, resolveTailwindV4EntriesFromCss } from '@/bundlers/vite/source-scan'
import {
  resolveTailwindV3Source,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV3SourceOptionsFromPatcher,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromPatcher,
  resolveTailwindV4SourceOptionsFromPatcher,
} from '@/generator'
import {
  normalizeLegacyContentEntries,
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
  normalizeTailwindV3CssEntrySource,
  resolveCssEntrySource,
} from './directives'
import {
  hasTailwindGeneratedCss,
  hasTailwindGeneratedCssMarkers,
  stripGeneratorPlaceholderMarkers,
  stripTailwindBanners,
} from './markers'
import { resolveSourceSideCssEntrySource } from './source-files'

interface GeneratorSourceRuntimeState {
  twPatcher: InternalUserDefinedOptions['twPatcher']
}

interface GeneratorSourceSelectionOptions {
  runtime?: Set<string> | undefined
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  cssEntries?: string[] | undefined
}

export interface GeneratorSourceMetadata {
  matchedCssSourceFile?: string | undefined
  sourceEntries?: TailwindSourceEntry[] | undefined
  sourceBase?: string | undefined
  sourceCss?: string | undefined
}

export type GeneratorResolvedSource = TailwindResolvedSource & {
  __weappTailwindcssMeta?: GeneratorSourceMetadata | undefined
}

type TailwindV4SourceOptions = ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher> & {
  config?: string | undefined
  outputRoot?: string | undefined
  sourceFile?: string | undefined
}
type TailwindV4CssSource = NonNullable<TailwindV4SourceOptions['cssSources']>[number]
type TailwindV4CssSourceRef = Pick<TailwindV4CssSource, 'file'>
interface SourceStyleMatchOptions extends SourceSideCssEntryOptions {}

function resolvePostcssFromOption(cssHandlerOptions: IStyleHandlerOptions) {
  const from = cssHandlerOptions.postcssOptions?.options?.from
  return typeof from === 'string' && from.length > 0 ? from : undefined
}

function resolvePostcssSourceFile(cssHandlerOptions: IStyleHandlerOptions) {
  const from = resolvePostcssFromOption(cssHandlerOptions)
  if (!from || !path.isAbsolute(from)) {
    return undefined
  }
  return from.replace(/[?#].*$/, '')
}

function resolveCssHandlerSourceOptions(cssHandlerOptions: IStyleHandlerOptions) {
  return (cssHandlerOptions as {
    sourceOptions?: {
      outputRoot?: string | undefined
      sourceFile?: string | undefined
      sourceCss?: string | undefined
      cssSources?: TailwindV4CssSource[] | undefined
      cssEntries?: string[] | undefined
    } | undefined
  }).sourceOptions
}

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

export function resolveCssSourceBase(file: string, cssHandlerOptions: IStyleHandlerOptions) {
  const from = resolvePostcssFromOption(cssHandlerOptions)
  const baseFile = from ?? file
  const normalized = baseFile.replace(/[?#].*$/, '')
  return path.dirname(path.resolve(normalized))
}

function resolveExistingConfigPath(
  config: string | undefined,
  configRequest: string | undefined,
  file: string,
  sourceOptions: {
    projectRoot?: string | undefined
    cwd?: string | undefined
    config?: string | undefined
    sourceFile?: string | undefined
    outputRoot?: string | undefined
  },
) {
  if (config && existsSync(config)) {
    return config
  }
  if (!configRequest || path.isAbsolute(configRequest)) {
    return sourceOptions.config
  }

  const outputDir = path.dirname(file.replace(/[?#].*$/, ''))
  const sourceDir = sourceOptions.sourceFile
    ? path.dirname(sourceOptions.sourceFile.replace(/[?#].*$/, ''))
    : undefined
  const baseCandidates = [
    sourceDir,
    path.isAbsolute(outputDir) ? outputDir : undefined,
    sourceOptions.projectRoot,
    sourceOptions.cwd,
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)
  const seenCandidates = new Set<string>()
  const configCandidates: string[] = []
  const addConfigCandidate = (candidate: string | undefined) => {
    if (!candidate) {
      return
    }
    const normalized = path.resolve(candidate)
    if (seenCandidates.has(normalized)) {
      return
    }
    seenCandidates.add(normalized)
    configCandidates.push(normalized)
  }

  for (const base of baseCandidates) {
    addConfigCandidate(path.resolve(base, configRequest))
    if (!path.isAbsolute(outputDir)) {
      addConfigCandidate(path.resolve(base, outputDir, configRequest))
    }
  }

  for (const candidate of configCandidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return sourceOptions.config
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

function shouldPreferTailwindV3SourceSideEntry(rawSource: string, sourceSideEntrySource: unknown) {
  return Boolean(sourceSideEntrySource)
    && !hasTailwindSourceDirectives(rawSource, { importFallback: true })
}

function shouldPreferResolvedSourceSideEntry(
  cssEntrySource: ReturnType<typeof resolveCssEntrySource> | undefined,
  sourceSideEntrySource: SourceSideCssEntrySource | undefined,
) {
  return Boolean(sourceSideEntrySource?.config)
    && (Boolean(cssEntrySource?.configRequest) || !cssEntrySource?.config)
    && (!cssEntrySource?.config || !existsSync(cssEntrySource.config))
}

function normalizeCssSourceForCompare(css: string) {
  return stripGeneratorPlaceholderMarkers(stripTailwindBanners(css)).trim()
}

function getOutputFileStem(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  return path.basename(normalized, path.extname(normalized))
}

function getOutputFileWithoutExtension(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  const ext = path.extname(normalized)
  return ext ? normalized.slice(0, -ext.length) : normalized
}

function normalizeMatchPath(file: string) {
  return file.split(path.sep).join('/')
}

function isPathWithinRoot(file: string, root: string) {
  const relative = path.relative(root, file)
  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function collectCssSourceMatchBases(
  file: string,
  roots: Array<string | undefined>,
) {
  const normalizedFile = file.replace(/[?#].*$/, '')
  const bases = new Set<string>()
  const addBase = (candidate: string) => {
    const base = normalizeMatchPath(getOutputFileWithoutExtension(candidate))
    if (base.length > 0) {
      bases.add(base)
      const withoutWorkspaceSegment = base.replace(/^(?:src|dist)\//, '')
      if (withoutWorkspaceSegment !== base && withoutWorkspaceSegment.length > 0) {
        bases.add(withoutWorkspaceSegment)
      }
    }
  }
  addBase(normalizedFile)

  const resolvedRoots = roots
    .filter((root): root is string => typeof root === 'string' && root.length > 0)
    .map(root => path.resolve(root))
  if (path.isAbsolute(normalizedFile)) {
    for (const root of resolvedRoots) {
      if (isPathWithinRoot(normalizedFile, root)) {
        addBase(path.relative(root, normalizedFile))
      }
    }
  }
  else {
    for (const root of resolvedRoots) {
      addBase(path.resolve(root, normalizedFile))
    }
  }
  return bases
}

function scoreTailwindV4CssSourceFileMatch(
  file: string,
  cssSourceFile: string,
  sourceOptions: SourceStyleMatchOptions,
) {
  const outputBases = collectCssSourceMatchBases(file, [
    sourceOptions.outputRoot,
    sourceOptions.projectRoot,
    sourceOptions.cwd,
  ])
  const sourceBases = collectCssSourceMatchBases(cssSourceFile, [
    sourceOptions.projectRoot,
    sourceOptions.cwd,
  ])
  let bestScore = 0
  for (const outputBase of outputBases) {
    for (const sourceBase of sourceBases) {
      if (outputBase === sourceBase) {
        bestScore = Math.max(bestScore, 100000 + outputBase.length)
      }
      else if (outputBase.endsWith(`/${sourceBase}`)) {
        bestScore = Math.max(bestScore, 50000 + sourceBase.length)
      }
      else if (sourceBase.endsWith(`/${outputBase}`)) {
        bestScore = Math.max(bestScore, 1000 + outputBase.length)
      }
    }
  }
  return bestScore
}

function resolveMatchingTailwindV4CssEntry(
  rawSource: string,
  file: string,
  sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher>,
) {
  const cssEntries = sourceOptions.cssEntries
  if (!cssEntries?.length) {
    return undefined
  }

  const normalizedRawSource = normalizeCssSourceForCompare(rawSource)
  const outputStem = getOutputFileStem(file)
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
        if (pathScore > 0) {
          return {
            cssEntry,
            score: pathScore,
          }
        }
        if (cssEntries.length === 1 && outputStem.length > 0 && getOutputFileStem(cssEntry) === outputStem) {
          return {
            cssEntry,
            score: 1,
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
      if (typeof cssSource.file === 'string') {
        const pathScore = scoreTailwindV4CssSourceFileMatch(file, cssSource.file, sourceOptions)
        if (pathScore > 0) {
          return {
            cssSource,
            index,
            score: pathScore,
          }
        }
      }
      if (normalizeCssSourceForCompare(cssSource.css) === normalizedRawSource) {
        return {
          cssSource,
          index,
          score: 1,
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
    return resolveTailwindV4SourceOptionsFromPatcher(runtimeState.twPatcher)
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
  sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher>,
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
  const css = createTailwindV4ApplyReferenceSource(
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

function withGeneratorSourceMetadata(
  source: TailwindResolvedSource,
  metadata: GeneratorSourceMetadata,
): GeneratorResolvedSource {
  return {
    ...source,
    __weappTailwindcssMeta: metadata,
  }
}

function resolveTailwindV3SourceEntries(source: TailwindResolvedSource) {
  if (!('version' in source) || source.version !== 3) {
    return undefined
  }
  const entries = normalizeLegacyContentEntries(source.configObject?.content, source.cwd, {
    relativeBase: source.config ? path.dirname(source.config) : source.cwd,
  })
  return entries.length > 0 ? entries : undefined
}

function withTailwindV3SourceMetadata(source: TailwindResolvedSource) {
  const sourceEntries = resolveTailwindV3SourceEntries(source)
  return sourceEntries
    ? withGeneratorSourceMetadata(source, { sourceEntries })
    : source
}

function withMatchedSourceSideMetadata(
  source: TailwindResolvedSource,
  resolvedEntrySource: SourceSideCssEntrySource,
) {
  return resolvedEntrySource.file
    ? withGeneratorSourceMetadata(source, {
        matchedCssSourceFile: resolvedEntrySource.file,
        sourceBase: resolvedEntrySource.base,
        sourceCss: resolvedEntrySource.css,
      })
    : source
}

function createTailwindV4ApplyReferenceSource(css: string, sourceOptions: { packageName?: string }) {
  if (!hasTailwindApplyDirective(css) || hasTailwindRootDirectives(css)) {
    return css
  }
  const utilities = collectTailwindApplyUtilities(css)
  return [
    `@import "${sourceOptions.packageName ?? 'tailwindcss'}" source(none);`,
    utilities.length > 0 ? `@source inline(${JSON.stringify(utilities.join(' '))});` : undefined,
    css,
  ].filter(Boolean).join('\n')
}

function collectTailwindApplyUtilities(css: string) {
  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return []
  }
  const utilities = new Set<string>()
  root.walkAtRules('apply', (rule) => {
    for (const utility of splitCandidateTokens(rule.params)) {
      utilities.add(utility)
    }
  })
  return [...utilities].sort()
}

export async function resolveGeneratorSource(
  majorVersion: number | undefined,
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
    removeConfig: majorVersion === 3,
  })
  const applyEntrySource = hasTailwindApplyDirective(rawSource)
    ? {
        base,
        css: rawSource,
      } as SourceSideCssEntrySource
    : undefined
  if (majorVersion === 3) {
    const sourceOptions = resolveTailwindV3SourceOptionsFromPatcher(runtimeState.twPatcher)
    const mergedSourceOptions = omitUndefined({
      ...sourceOptions,
      config: generatorOptions?.config ?? sourceOptions.config,
      sourceFile: resolvePostcssSourceFile(cssHandlerOptions),
      ...resolveCssHandlerSourceOptions(cssHandlerOptions),
      cssEntries: selectionOptions?.cssEntries,
      cssSources: createCssEntrySources(selectionOptions?.cssEntries),
    })
    const sourceSideEntrySource = canResolveSourceSideCssEntry(file, cssHandlerOptions, mergedSourceOptions)
      ? resolveSourceSideCssEntrySource(file, mergedSourceOptions, { removeConfig: true })
      : undefined
    const shouldPreferSourceSideEntry = shouldPreferResolvedSourceSideEntry(cssEntrySource, sourceSideEntrySource)
    const resolvedEntrySource: SourceSideCssEntrySource | ReturnType<typeof resolveCssEntrySource> = shouldResolveSourceSideCssEntry(rawSource)
      ? shouldPreferSourceSideEntry
        ? sourceSideEntrySource ?? cssEntrySource ?? applyEntrySource
        : cssEntrySource ?? applyEntrySource ?? sourceSideEntrySource
      : shouldPreferTailwindV3SourceSideEntry(rawSource, sourceSideEntrySource) || shouldPreferSourceSideEntry
        ? sourceSideEntrySource ?? cssEntrySource ?? applyEntrySource
        : cssEntrySource ?? applyEntrySource ?? sourceSideEntrySource
    if (!resolvedEntrySource) {
      const source = await (generatorOptions?.config
        ? resolveTailwindV3Source(mergedSourceOptions)
        : resolveTailwindV3SourceFromPatcher(runtimeState.twPatcher))
      return withTailwindV3SourceMetadata(source)
    }
    if (
      cssEntrySource
      && !sourceSideEntrySource
      && !applyEntrySource
      && !hasTailwindRootDirectives(rawSource, { importFallback: true })
    ) {
      const source = await (generatorOptions?.config
        ? resolveTailwindV3Source(mergedSourceOptions)
        : resolveTailwindV3SourceFromPatcher(runtimeState.twPatcher))
      return withTailwindV3SourceMetadata(source)
    }
    const config = resolveExistingConfigPath(
      resolvedEntrySource.config,
      resolvedEntrySource.configRequest,
      file,
      omitUndefined(mergedSourceOptions),
    )
    const source = await resolveTailwindV3Source({
      ...mergedSourceOptions,
      base: resolvedEntrySource.base,
      css: normalizeTailwindV3CssEntrySource(resolvedEntrySource.css),
      ...(config ? { config } : {}),
    })
    const sourceWithMetadata = withTailwindV3SourceMetadata(source)
    const cssEntrySourceEntries = await resolveTailwindConfigEntriesFromCssCached(
      rawSource,
      resolvedEntrySource.base,
    )
    const sourceMetadata = (sourceWithMetadata as GeneratorResolvedSource).__weappTailwindcssMeta
    const matchedSourceFile = (resolvedEntrySource as SourceSideCssEntrySource).file ?? sourceSideEntrySource?.file
    return withGeneratorSourceMetadata(sourceWithMetadata, {
      ...sourceMetadata,
      matchedCssSourceFile: matchedSourceFile,
      sourceEntries: cssEntrySourceEntries?.entries ?? sourceMetadata?.sourceEntries,
    })
  }

  const sourceOptions = tryResolveTailwindV4SourceOptions(runtimeState)
  const resolvedSourceOptions: TailwindV4SourceOptions | undefined = sourceOptions
    ? omitUndefined<TailwindV4SourceOptions>({
        ...sourceOptions,
        sourceFile: resolvePostcssSourceFile(cssHandlerOptions),
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
  const sourceSideEntrySource = normalizedSourceOptions && shouldPreferSourceSideEntry && canResolveSourceSideCssEntry(file, cssHandlerOptions, normalizedSourceOptions)
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
    const source = await resolveTailwindV4SourceFromPatcher(runtimeState.twPatcher)
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
    resolvedSourceOptions ?? {},
  )
  const sourceBase = resolvedEntrySource === cssEntrySource && config
    ? path.dirname(config)
    : resolvedEntrySource.base
  const css = createTailwindV4ApplyReferenceSource(
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
    removeConfig: majorVersion === 3,
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
    const sourceOptionsFromPatcher = resolveTailwindV4SourceOptionsFromPatcher(runtimeState.twPatcher)
    const cssEntries = selectionOptions?.cssEntries ?? sourceOptionsFromPatcher.cssEntries
    sourceOptions = omitUndefined<TailwindV4SourceOptions>({
      ...sourceOptionsFromPatcher,
      sourceFile: resolvePostcssSourceFile(cssHandlerOptions),
      ...resolveCssHandlerSourceOptions(cssHandlerOptions),
      cssEntries,
      cssSources: mergeCssSources(
        sourceOptionsFromPatcher.cssSources,
        sourceOptionsFromPatcher.cssSources?.length
          ? undefined
          : createCssEntrySources(cssEntries) as TailwindV4CssSource[] | undefined,
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
    return [
      generatorOptions?.config
        ? {
            ...matchedCssEntrySource,
            css: prependConfigDirective(matchedCssEntrySource.css, generatorOptions.config),
          }
        : matchedCssEntrySource,
    ]
  }
  const shouldPreferSourceSideEntry = shouldResolveSourceSideCssEntry(rawSource)
    || (
      Boolean(cssEntrySource?.css.includes('weapp-tailwindcss generator-placeholder'))
      && (sourceOptions.cssEntries?.length ?? 0) <= 1
    )
  const sourceSideEntrySource = shouldPreferSourceSideEntry && canResolveSourceSideCssEntry(file, cssHandlerOptions, sourceOptions)
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
    return [
      generatorOptions?.config
        ? {
            ...preferredCssEntrySource,
            css: prependConfigDirective(preferredCssEntrySource.css, generatorOptions.config),
          }
        : preferredCssEntrySource,
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
        await createTailwindV4CssSourceResolver(sourceOptions, generatorOptions)(sourceOptions.cssSources[0]!),
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
