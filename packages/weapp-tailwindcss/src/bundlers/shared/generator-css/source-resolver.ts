import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { NormalizedWeappTailwindcssGeneratorOptions, TailwindResolvedSource } from '@/generator'
import type { InternalUserDefinedOptions } from '@/types'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
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
  hasTailwindGeneratedCssMarkers,
  stripGeneratorPlaceholderMarkers,
  stripTailwindBanners,
} from './markers'
import { resolveSourceSideCssEntrySource } from './source-files'

interface GeneratorSourceRuntimeState {
  twPatcher: InternalUserDefinedOptions['twPatcher']
}

function resolvePostcssFromOption(cssHandlerOptions: IStyleHandlerOptions) {
  const from = cssHandlerOptions.postcssOptions?.options?.from
  return typeof from === 'string' && from.length > 0 ? from : undefined
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
}

function normalizeCssSourceForCompare(css: string) {
  return stripGeneratorPlaceholderMarkers(stripTailwindBanners(css)).trim()
}

function getOutputFileStem(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  return path.basename(normalized, path.extname(normalized))
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
  const cssEntrySource = resolveCssEntrySource(rawSource, base, { removeConfig: majorVersion === 3 })
  if (majorVersion === 3) {
    const sourceOptions = resolveTailwindV3SourceOptionsFromPatcher(runtimeState.twPatcher)
    const mergedSourceOptions = omitUndefined({
      ...sourceOptions,
      config: generatorOptions?.config ?? sourceOptions.config,
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
  const configuredCssSource = sourceOptions
    && hasConfiguredTailwindV4CssSource(sourceOptions)
    && hasTailwindGeneratedCssMarkers(rawSource)
    ? await resolveTailwindV4Source(sourceOptions)
    : undefined
  if (configuredCssSource) {
    return generatorOptions?.config
      ? {
          ...configuredCssSource,
          css: prependConfigDirective(configuredCssSource.css, generatorOptions.config),
        }
      : configuredCssSource
  }
  const shouldPreferSourceSideEntry = shouldResolveSourceSideCssEntry(rawSource)
    || Boolean(cssEntrySource?.css.includes('weapp-tailwindcss generator-placeholder'))
  const sourceSideEntrySource = sourceOptions && shouldPreferSourceSideEntry
    ? resolveSourceSideCssEntrySource(file, sourceOptions, { removeConfig: false })
    : undefined
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
  const preferredCssEntrySource = matchedCssEntrySource ?? mainCssEntrySource
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
  const resolvedSourceOptions = omitUndefined(sourceOptions ?? {})
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
  return resolveTailwindV4Source({
    ...resolvedSourceOptions,
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
  const cssEntrySource = resolveCssEntrySource(rawSource, base, { removeConfig: majorVersion === 3 })
  if (majorVersion !== 4 || (cssEntrySource && !cssHandlerOptions.isMainChunk)) {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions),
    ]
  }

  let sourceOptions: ReturnType<typeof resolveTailwindV4SourceOptionsFromPatcher>
  try {
    sourceOptions = resolveTailwindV4SourceOptionsFromPatcher(runtimeState.twPatcher)
  }
  catch {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions),
    ]
  }

  if (!sourceOptions.cssEntries || sourceOptions.cssEntries.length <= 1) {
    return [
      await resolveGeneratorSource(majorVersion, runtimeState, rawSource, file, cssHandlerOptions, generatorOptions),
    ]
  }

  const sources = await Promise.all(sourceOptions.cssEntries.map(cssEntry =>
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
  return sources
}
