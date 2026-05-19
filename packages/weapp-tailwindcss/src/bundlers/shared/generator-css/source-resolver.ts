import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { NormalizedWeappTailwindcssGeneratorOptions, TailwindResolvedSource } from '@/generator'
import type { InternalUserDefinedOptions } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { resolveTailwindV4EntriesFromCss } from '@/bundlers/vite/source-scan'
import {
  resolveTailwindV3Source,
  resolveTailwindV3SourceFromPatcher,
  resolveTailwindV3SourceOptionsFromPatcher,
  resolveTailwindV4Source,
  resolveTailwindV4SourceFromPatcher,
  resolveTailwindV4SourceOptionsFromPatcher,
} from '@/generator'
import { omitUndefined } from '@/utils/object'
import {
  normalizeConfigDirective,
  prependConfigDirective,
} from './config-directive'
import {
  hasTailwindApplyDirective,
  hasTailwindRootDirectives,
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

export interface GeneratorSourceMetadata {
  matchedCssSourceFile?: string | undefined
}

export type GeneratorResolvedSource = TailwindResolvedSource & {
  __weappTailwindcssMeta?: GeneratorSourceMetadata | undefined
}

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
    } | undefined
  }).sourceOptions
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
    projectRoot?: string
    cwd?: string
    config?: string
  },
) {
  if (config && existsSync(config)) {
    return config
  }
  if (!configRequest || path.isAbsolute(configRequest)) {
    return sourceOptions.config
  }

  const outputDir = path.dirname(file.replace(/[?#].*$/, ''))
  const baseCandidates = [
    sourceOptions.projectRoot,
    sourceOptions.cwd,
    process.cwd(),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)

  for (const base of baseCandidates) {
    const candidates = [
      path.resolve(base, configRequest),
      path.resolve(base, 'src', configRequest),
      path.resolve(base, outputDir, configRequest),
      path.resolve(base, 'src', outputDir, configRequest),
    ]
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate
      }
    }
  }

  return sourceOptions.config
}

function canResolveSourceSideCssEntry(file: string, cssHandlerOptions: IStyleHandlerOptions) {
  const from = resolvePostcssFromOption(cssHandlerOptions)
  if (!from || !path.isAbsolute(from)) {
    return path.isAbsolute(file)
  }
  return true
}

function shouldResolveSourceSideCssEntry(rawSource: string) {
  return rawSource.includes('@apply')
    || hasTailwindGeneratedCss(rawSource)
    || hasTailwindGeneratedCssMarkers(rawSource)
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

function stripKnownBuildRootPrefix(file: string) {
  const segments = normalizeMatchPath(file).split('/')
  const knownRoots = new Set(['dist', 'src'])
  for (let index = segments.length - 1; index >= 0; index--) {
    if (knownRoots.has(segments[index]!)) {
      return segments.slice(index + 1).join('/')
    }
  }
  return segments.join('/')
}

function isMatchingTailwindV4CssSourceFile(file: string, cssSourceFile: string) {
  const outputBase = normalizeMatchPath(getOutputFileWithoutExtension(path.resolve(file)))
  const sourceBase = normalizeMatchPath(getOutputFileWithoutExtension(path.resolve(cssSourceFile)))
  const outputRelativeBase = stripKnownBuildRootPrefix(outputBase)
  const sourceRelativeBase = stripKnownBuildRootPrefix(sourceBase)
  return outputBase === sourceBase
    || outputBase.endsWith(`/${sourceBase}`)
    || sourceBase.endsWith(`/${outputBase}`)
    || (
      outputRelativeBase.length > 0
      && outputRelativeBase === sourceRelativeBase
    )
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
  const matchingEntry = cssEntries.find((cssEntry) => {
    if (!existsSync(cssEntry)) {
      return false
    }
    try {
      const entrySource = readFileSync(cssEntry, 'utf8')
      if (normalizeCssSourceForCompare(entrySource) === normalizedRawSource) {
        return true
      }
      return outputStem.length > 0 && getOutputFileStem(cssEntry) === outputStem
    }
    catch {
      return false
    }
  })
  if (!matchingEntry) {
    return undefined
  }
  return resolveTailwindV4Source({
    ...omitUndefined(sourceOptions),
    cssEntries: [matchingEntry],
  })
}

async function resolveMatchingTailwindV4CssSource(
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher>,
) {
  const cssSources = sourceOptions.cssSources
  if (!cssSources?.length) {
    return undefined
  }

  const normalizedRawSource = normalizeCssSourceForCompare(rawSource)
  const sourceFile = resolvePostcssSourceFile(cssHandlerOptions)
  const matchingSource = cssSources.find((cssSource) => {
    if (typeof cssSource.css !== 'string' || cssSource.css.length === 0) {
      return false
    }
    if (sourceFile && typeof cssSource.file === 'string' && path.resolve(sourceFile) === path.resolve(cssSource.file)) {
      return true
    }
    if (typeof cssSource.file === 'string' && isMatchingTailwindV4CssSourceFile(file, cssSource.file)) {
      return true
    }
    return normalizeCssSourceForCompare(cssSource.css) === normalizedRawSource
  })
  if (!matchingSource) {
    return undefined
  }
  const source = await resolveTailwindV4Source({
    ...omitUndefined(sourceOptions),
    cssSources: [matchingSource],
  })
  return withGeneratorSourceMetadata(source, {
    matchedCssSourceFile: typeof matchingSource.file === 'string' ? matchingSource.file : undefined,
  })
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
  sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher> | undefined,
) {
  return Boolean(sourceOptions?.css)
    || Boolean(sourceOptions?.cssSources?.length)
}

function createTailwindV4CssSourceResolver(
  sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher>,
  generatorOptions: NormalizedWeappTailwindcssGeneratorOptions | undefined,
) {
  return (cssSource: NonNullable<typeof sourceOptions.cssSources>[number]) =>
    resolveTailwindV4Source({
      ...omitUndefined(sourceOptions),
      cssSources: [cssSource],
    }).then(source => generatorOptions?.config
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
    resolvedSourceOptions,
  )
  const css = createTailwindV4ApplyReferenceSource(
    normalizeConfigDirective(
      prependConfigDirective(resolvedEntrySource.css, generatorOptions?.config),
      config,
    ),
    resolvedSourceOptions,
  )
  const source = await resolveTailwindV4Source({
    ...resolvedSourceOptions,
    base: resolvedEntrySource.base,
    css,
  })
  return withMatchedSourceSideMetadata(source, resolvedEntrySource.file)
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

function withMatchedSourceSideMetadata(
  source: TailwindResolvedSource,
  sourceFile: string | undefined,
) {
  return sourceFile
    ? withGeneratorSourceMetadata(source, {
        matchedCssSourceFile: sourceFile,
      })
    : source
}

function createTailwindV4ApplyReferenceSource(css: string, sourceOptions: { packageName?: string }) {
  if (!hasTailwindApplyDirective(css) || hasTailwindRootDirectives(css)) {
    return css
  }
  return `@reference "${sourceOptions.packageName ?? 'tailwindcss'}";\n${css}`
}

export async function resolveGeneratorSource(
  majorVersion: number | undefined,
  runtimeState: GeneratorSourceRuntimeState,
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorOptions?: NormalizedWeappTailwindcssGeneratorOptions,
) {
  const base = resolveCssSourceBase(file, cssHandlerOptions)
  const cssEntrySource = resolveCssEntrySource(rawSource, base, {
    importFallback: generatorOptions?.importFallback ?? false,
    removeConfig: majorVersion === 3,
  })
  if (majorVersion === 3) {
    const sourceOptions = resolveTailwindV3SourceOptionsFromPatcher(runtimeState.twPatcher)
    const mergedSourceOptions = omitUndefined({
      ...sourceOptions,
      config: generatorOptions?.config ?? sourceOptions.config,
      ...resolveCssHandlerSourceOptions(cssHandlerOptions),
    })
    const sourceSideEntrySource = canResolveSourceSideCssEntry(file, cssHandlerOptions)
      ? resolveSourceSideCssEntrySource(file, mergedSourceOptions, { removeConfig: true })
      : undefined
    const resolvedEntrySource = cssEntrySource ?? sourceSideEntrySource
    if (!resolvedEntrySource) {
      return generatorOptions?.config
        ? resolveTailwindV3Source(mergedSourceOptions)
        : resolveTailwindV3SourceFromPatcher(runtimeState.twPatcher)
    }
    const config = resolveExistingConfigPath(
      resolvedEntrySource.config,
      resolvedEntrySource.configRequest,
      file,
      omitUndefined(mergedSourceOptions),
    )
    return resolveTailwindV3Source({
      ...mergedSourceOptions,
      base: resolvedEntrySource.base,
      css: resolvedEntrySource.css,
      ...(config ? { config } : {}),
    })
  }

  const sourceOptions = tryResolveTailwindV4SourceOptions(runtimeState)
  const resolvedSourceOptions = sourceOptions
    ? omitUndefined({
        ...sourceOptions,
        ...resolveCssHandlerSourceOptions(cssHandlerOptions),
      })
    : undefined
  const shouldPreferSourceSideEntry = shouldResolveSourceSideCssEntry(rawSource)
    || Boolean(cssEntrySource?.css.includes('weapp-tailwindcss generator-placeholder'))
  const sourceSideEntrySource = resolvedSourceOptions && shouldPreferSourceSideEntry
    ? resolveSourceSideCssEntrySource(file, resolvedSourceOptions, { removeConfig: false })
    : undefined
  const matchedCssSource = sourceOptions
    ? await resolveMatchingTailwindV4CssSource(rawSource, file, cssHandlerOptions, sourceOptions)
    : undefined
  const configuredCssSource = sourceOptions
    && hasConfiguredTailwindV4CssSource(sourceOptions)
    && hasTailwindGeneratedCssMarkers(rawSource)
    ? matchedCssSource ?? await resolveTailwindV4Source(sourceOptions)
    : undefined
  if (configuredCssSource) {
    return generatorOptions?.config
      ? {
          ...configuredCssSource,
          css: prependConfigDirective(configuredCssSource.css, generatorOptions.config),
        }
      : configuredCssSource
  }
  const matchedCssEntrySource = sourceOptions && cssEntrySource
    ? await resolveMatchingTailwindV4CssEntry(rawSource, file, sourceOptions)
    : undefined
  const mainCssEntrySource = sourceOptions
    && cssHandlerOptions.isMainChunk
    && sourceOptions.cssEntries?.length === 1
    ? await resolveTailwindV4Source({
        ...omitUndefined(sourceOptions),
        cssEntries: [sourceOptions.cssEntries[0]!],
      })
    : undefined
  const preferredCssEntrySource = matchedCssEntrySource ?? matchedCssSource ?? mainCssEntrySource
  if (preferredCssEntrySource) {
    return generatorOptions?.config
      ? {
          ...preferredCssEntrySource,
          css: prependConfigDirective(preferredCssEntrySource.css, generatorOptions.config),
        }
      : preferredCssEntrySource
  }

  const resolvedEntrySource = sourceSideEntrySource ?? cssEntrySource
  if (!resolvedEntrySource) {
    const source = await resolveTailwindV4SourceFromPatcher(runtimeState.twPatcher)
    return generatorOptions?.config
      ? {
          ...source,
          css: prependConfigDirective(source.css, generatorOptions.config),
        }
      : source
  }
  if (sourceSideEntrySource && resolvedSourceOptions) {
    return resolveTailwindV4SourceSideEntrySource(
      sourceSideEntrySource,
      resolvedSourceOptions,
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
  const css = createTailwindV4ApplyReferenceSource(
    normalizeConfigDirective(
      prependConfigDirective(resolvedEntrySource.css, generatorOptions?.config),
      config,
    ),
    resolvedSourceOptions ?? {},
  )
  return resolveTailwindV4Source({
    ...omitUndefined(resolvedSourceOptions ?? {}),
    base: resolvedEntrySource.base,
    css,
  })
}

export async function resolveGeneratorSources(
  majorVersion: number | undefined,
  runtimeState: GeneratorSourceRuntimeState,
  rawSource: string,
  file: string,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorOptions?: NormalizedWeappTailwindcssGeneratorOptions,
): Promise<TailwindResolvedSource[]> {
  const base = resolveCssSourceBase(file, cssHandlerOptions)
  const cssEntrySource = resolveCssEntrySource(rawSource, base, {
    importFallback: generatorOptions?.importFallback ?? false,
    removeConfig: majorVersion === 3,
  })
  if (majorVersion !== 4 || (cssEntrySource && !cssHandlerOptions.isMainChunk)) {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions),
    ]
  }

  let sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher>
  try {
    sourceOptions = omitUndefined({
      ...resolveTailwindV4SourceOptionsFromPatcher(runtimeState.twPatcher),
      ...resolveCssHandlerSourceOptions(cssHandlerOptions),
    })
  }
  catch {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions),
    ]
  }

  const matchedCssEntrySource = cssEntrySource
    ? await resolveMatchingTailwindV4CssEntry(rawSource, file, sourceOptions)
    : undefined
  const matchedCssSource = await resolveMatchingTailwindV4CssSource(rawSource, file, cssHandlerOptions, sourceOptions)
  const shouldPreferSourceSideEntry = shouldResolveSourceSideCssEntry(rawSource)
    || Boolean(cssEntrySource?.css.includes('weapp-tailwindcss generator-placeholder'))
  const sourceSideEntrySource = shouldPreferSourceSideEntry
    ? resolveSourceSideCssEntrySource(file, sourceOptions, { removeConfig: false })
    : undefined
  const sourceSideCssSource = await resolveTailwindV4SourceSideEntrySource(
    sourceSideEntrySource,
    sourceOptions,
    generatorOptions,
    file,
  )
  const preferredCssEntrySource = matchedCssEntrySource ?? matchedCssSource
  if (sourceSideCssSource) {
    return [sourceSideCssSource]
  }
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
    if (sourceOptions.cssSources?.length) {
      return Promise.all(sourceOptions.cssSources.map(createTailwindV4CssSourceResolver(sourceOptions, generatorOptions)))
    }
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions),
    ]
  }

  const cssEntrySources = await Promise.all(sourceOptions.cssEntries.map(cssEntry =>
    resolveTailwindV4Source({
      ...omitUndefined(sourceOptions),
      cssEntries: [cssEntry],
    }).then(source => generatorOptions?.config
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
  if (!('css' in source) || !('base' in source) || !('baseFallbacks' in source)) {
    return undefined
  }
  const sourceMetadata = (source as GeneratorResolvedSource).__weappTailwindcssMeta
  const resolved = await resolveTailwindV4EntriesFromCss(source.css, source.base)
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
  return resolved.entries
}
