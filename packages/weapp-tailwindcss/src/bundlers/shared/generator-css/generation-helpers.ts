import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { GeneratorResolvedSource } from './source-resolver'
import type { createWeappTailwindcssGenerator } from '@/generator'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions } from '@/types'
import { resolveStyleOptionsFromContext } from '@/context/style-options'
import { isUniAppXEnabled } from '@/uni-app-x/options'
import { finalizeMiniProgramCss } from '../css-cleanup'
import {
  hasTailwindApplyDirective,
  hasTailwindRootDirectives,
  hasTailwindSourceDirectives,
} from './directives'
import {
  splitGeneratorPlaceholderCssBySourceOrder,
  splitTailwindGeneratedCssByBanner,
  splitTailwindV4GeneratedCssBySourceOrder,
} from './markers'

export function finalizeMiniProgramGeneratorCss(
  css: string,
  target: string,
  majorVersion: number | undefined,
  cssPreflight: InternalUserDefinedOptions['cssPreflight'],
  options: { injectPreflight?: boolean } = {},
) {
  if (target !== 'weapp') {
    return css
  }
  return finalizeMiniProgramCss(css, {
    cssPreflight: majorVersion === 4 && options.injectPreflight !== false ? cssPreflight : undefined,
    isTailwindcssV4: majorVersion === 4,
    preservePseudoContentInit: majorVersion === 3,
  })
}

export function shouldInjectMiniProgramPreflightForGeneratorCss(
  opts: InternalUserDefinedOptions,
  options: {
    cssHandlerOptions: IStyleHandlerOptions
    isolateCurrentCssCandidates: boolean
    localImports?: string | undefined
  },
) {
  if (options.cssHandlerOptions.uniAppX === true && options.cssHandlerOptions.uniAppXCssTarget === 'uvue') {
    return false
  }
  if (!options.isolateCurrentCssCandidates) {
    return true
  }
  return isUniAppXEnabled(opts.uniAppX) && Boolean(options.localImports?.trim())
}

export function mergeScopedRuntimeWithCurrentRuntime(
  scopedRuntime: Set<string>,
  runtime: Set<string>,
  options: {
    currentCssCandidates?: string[] | undefined
    cssHandlerOptions: IStyleHandlerOptions
    isolateCssSource: boolean
    matchedCssSourceFile: boolean
  },
) {
  if (options.isolateCssSource) {
    return new Set([
      ...scopedRuntime,
      ...(options.currentCssCandidates ?? []),
    ])
  }
  if (
    runtime.size === 0
    || !options.cssHandlerOptions.isMainChunk
    || options.matchedCssSourceFile
  ) {
    return scopedRuntime
  }
  return new Set([
    ...scopedRuntime,
    ...runtime,
  ])
}

export function shouldIsolateScopedCssSource(source: GeneratorResolvedSource, sourceEntries: TailwindSourceEntry[] | undefined) {
  return Boolean(source.__weappTailwindcssMeta?.matchedCssSourceFile)
    || sourceEntries !== undefined
}

export function shouldIsolateCurrentTailwindV4CssCandidates(
  majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    rawSource: string
  },
) {
  return majorVersion === 4
    && !cssHandlerOptions.isMainChunk
    && hasTailwindApplyDirective(options.rawSource)
    && !hasTailwindRootDirectives(options.rawSource)
    && !options.hasGeneratedCss
    && !options.hasGeneratedMarkers
}

export function shouldScanTailwindV4Sources(
  majorVersion: number | undefined,
  target: string,
  generatorRuntime: Set<string>,
  isolateCssSource: boolean,
) {
  if (majorVersion !== 4) {
    return false
  }
  if (target === 'web') {
    return true
  }
  if (isolateCssSource) {
    return false
  }
  return generatorRuntime.size === 0
}

export function shouldAppendWebBundleCssFallback(
  target: string,
  options: {
    hasSourceDirectives: boolean
    hasMatchedCssSourceFile: boolean
  },
) {
  return target === 'web'
    && !options.hasMatchedCssSourceFile
    && !options.hasSourceDirectives
}

export function isEmptyCssSourceOrderParts(parts: {
  before: string
  after: string
}) {
  return parts.before.trim().length === 0 && parts.after.trim().length === 0
}

export function resolveGeneratorStyleOptions(
  opts: InternalUserDefinedOptions,
  cssHandlerOptions: IStyleHandlerOptions,
  generatorStyleOptions: Partial<IStyleHandlerOptions> | undefined,
): Partial<IStyleHandlerOptions> {
  const preflightStyleOptions: Partial<IStyleHandlerOptions> = {
    cssPreflight: opts.cssPreflight,
    cssPreflightRange: opts.cssPreflightRange,
  }
  return {
    ...resolveStyleOptionsFromContext(opts),
    atRules: opts.atRules,
    uniAppXCssTarget: opts.uniAppXCssTarget,
    uniAppXUnsupported: opts.uniAppXUnsupported,
    ...cssHandlerOptions,
    ...preflightStyleOptions,
    ...generatorStyleOptions,
  }
}

export function createCssSourceOrderAppend(base: string, extra: string) {
  if (!base) {
    return extra
  }
  if (!extra) {
    return base
  }
  if (/\s$/.test(base) || /^\s/.test(extra)) {
    return `${base}${extra}`
  }
  return `${base}\n${extra}`
}

export function shouldFinalizeMarkedUserLayerComponentsCss(file: string) {
  return !/\.(?:vue|svelte|astro|scss|sass|less|styl)(?:[?#].*)?$/i.test(file)
}

export function splitRawSourceByGeneratedCssOrder(rawSource: string, rawTailwindCss: string) {
  const placeholderParts = splitGeneratorPlaceholderCssBySourceOrder(rawSource, rawTailwindCss)
  if (placeholderParts) {
    return placeholderParts
  }
  const exactParts = splitTailwindV4GeneratedCssBySourceOrder(rawSource, rawTailwindCss)
  if (exactParts) {
    return exactParts
  }
  return splitTailwindGeneratedCssByBanner(rawSource)
}

export function shouldUseGeneratorForCurrentCss(
  _majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    hasSourceDirectives: boolean
    rawSource: string
  },
) {
  const hasApplyDirectives = hasTailwindApplyDirective(options.rawSource)
  return options.hasGeneratedCss
    || options.hasGeneratedMarkers
    || options.hasSourceDirectives
    || hasApplyDirectives
    || cssHandlerOptions.isMainChunk
}

export function hasGeneratorSourceDirectives(source: string, importFallback: boolean) {
  return hasTailwindSourceDirectives(source, { importFallback })
}

export function createRuntimeWithCurrentCssCandidates(
  runtime: Set<string>,
  currentCssCandidates: string[],
  isolateCurrentCssCandidates: boolean,
) {
  return isolateCurrentCssCandidates
    ? new Set(currentCssCandidates)
    : currentCssCandidates.length > 0
      ? new Set([
          ...runtime,
          ...currentCssCandidates,
        ])
      : runtime
}

export function mergeGeneratorResults(generatedResults: GeneratorResult[]) {
  const firstGenerated = generatedResults[0]
  if (!firstGenerated) {
    return undefined
  }
  if (generatedResults.length === 1) {
    return firstGenerated
  }
  const incrementalCssResults = generatedResults
    .map(item => item.incrementalCss)
    .filter((css): css is string => typeof css === 'string')
  const incrementalRawCssResults = generatedResults
    .map(item => item.incrementalRawCss)
    .filter((css): css is string => typeof css === 'string')
  return {
    ...firstGenerated,
    css: generatedResults.map(item => item.css).join('\n'),
    rawCss: generatedResults.map(item => item.rawCss).join('\n'),
    incrementalCss: incrementalCssResults.length === generatedResults.length
      ? incrementalCssResults.filter(Boolean).join('\n')
      : undefined,
    incrementalRawCss: incrementalRawCssResults.length === generatedResults.length
      ? incrementalRawCssResults.filter(Boolean).join('\n')
      : undefined,
    classSet: new Set(generatedResults.flatMap(item => [...item.classSet])),
    dependencies: [...new Set(generatedResults.flatMap(item => item.dependencies))],
    sources: generatedResults.flatMap(item => item.sources),
  }
}
const SUPPORTED_GENERATOR_MAJOR_VERSIONS = new Set([3, 4])

type GeneratorResult = Awaited<ReturnType<ReturnType<typeof createWeappTailwindcssGenerator>['generate']>>

export function isSupportedGeneratorMajorVersion(majorVersion: number | undefined) {
  return SUPPORTED_GENERATOR_MAJOR_VERSIONS.has(majorVersion ?? 0)
}
