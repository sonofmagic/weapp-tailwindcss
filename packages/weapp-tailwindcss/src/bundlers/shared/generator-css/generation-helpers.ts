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
  TAILWIND_BANNER_RE,
} from './markers'

export function hasMiniProgramTailwindV4PreflightReset(css: string) {
  return /(?:^|[},])\s*view\s*,\s*text\s*,\s*::after\s*,\s*::before\s*\{[^}]*\bborder\s*:\s*0\s+solid\b/.test(css)
}

export function finalizeMiniProgramGeneratorCss(
  css: string,
  target: string,
  majorVersion: number | undefined,
  cssPreflight: InternalUserDefinedOptions['cssPreflight'],
  options: { injectPreflight?: boolean, styleOptions?: Partial<IStyleHandlerOptions> | undefined } = {},
) {
  if (target !== 'weapp') {
    return css
  }
  const injectPreflight = majorVersion === 4
    && options.injectPreflight !== false
    && !hasMiniProgramTailwindV4PreflightReset(css)
  return finalizeMiniProgramCss(css, {
    cssPreflight: injectPreflight ? cssPreflight : undefined,
    isTailwindcssV4: majorVersion === 4,
    preservePseudoContentInit: majorVersion === 3,
    tailwindcssV4GradientFallback: options.styleOptions?.cssOptions?.tailwindcssV4GradientFallback
      ?? options.styleOptions?.tailwindcssV4GradientFallback,
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
    majorVersion?: number | undefined
    matchedCssSourceFile: boolean
  },
) {
  if (
    options.majorVersion === 3
    && !options.isolateCssSource
  ) {
    return new Set([
      ...scopedRuntime,
      ...runtime,
      ...(options.currentCssCandidates ?? []),
    ])
  }
  if (options.isolateCssSource) {
    if (options.matchedCssSourceFile) {
      return new Set([
        ...scopedRuntime,
        ...(options.currentCssCandidates ?? []),
      ])
    }
    return new Set([
      ...scopedRuntime,
      ...(options.currentCssCandidates ?? []),
    ])
  }
  if (
    runtime.size === 0
    || !options.cssHandlerOptions.isMainChunk
  ) {
    return scopedRuntime
  }
  return new Set([
    ...scopedRuntime,
    ...runtime,
  ])
}

export function shouldIsolateScopedCssSource(
  majorVersion: number | undefined,
  source: GeneratorResolvedSource,
  sourceEntries: TailwindSourceEntry[] | undefined,
  options: {
    cssHandlerOptions?: IStyleHandlerOptions | undefined
    target: string
  },
) {
  if (options.target !== 'weapp') {
    return false
  }
  if (source.__weappTailwindcssMeta?.isolateCssSource) {
    return true
  }
  if (source.__weappTailwindcssMeta?.matchedCssSourceFile && (sourceEntries?.length ?? 0) > 0) {
    return true
  }
  if (sourceEntries?.length === 0) {
    return false
  }
  return (majorVersion === 3 || majorVersion === 4) && sourceEntries !== undefined && options.cssHandlerOptions?.isMainChunk !== true
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
  _options: {
    hasSourceDirectives: boolean
    hasMatchedCssSourceFile: boolean
  },
) {
  return target === 'web'
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
  const resolvedStyleOptions = resolveStyleOptionsFromContext(opts)
  const preflightStyleOptions: Partial<IStyleHandlerOptions> = {
    cssPreflight: resolvedStyleOptions.cssPreflight,
    cssPreflightRange: resolvedStyleOptions.cssPreflightRange,
  }
  return {
    ...resolvedStyleOptions,
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
  majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    forceGenerator?: boolean | undefined
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    hasSourceDirectives: boolean
    rawSource: string
  },
) {
  if (
    majorVersion === 3
    && TAILWIND_BANNER_RE.test(options.rawSource)
    && !options.hasGeneratedMarkers
    && !hasTailwindSourceDirectives(options.rawSource, { importFallback: true })
    && !hasTailwindApplyDirective(options.rawSource)
    && options.forceGenerator !== true
  ) {
    return false
  }
  const hasApplyDirectives = hasTailwindApplyDirective(options.rawSource)
  const sourceCss = (cssHandlerOptions as { sourceOptions?: { sourceCss?: string | undefined } | undefined }).sourceOptions?.sourceCss
  const hasSourceCssDirectives = typeof sourceCss === 'string'
    && (
      hasTailwindRootDirectives(sourceCss, { importFallback: true })
      || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
      || hasTailwindApplyDirective(sourceCss)
    )
  return options.forceGenerator === true
    || options.hasGeneratedCss
    || options.hasGeneratedMarkers
    || options.hasSourceDirectives
    || hasApplyDirectives
    || ((majorVersion === 3 || majorVersion === 4) && hasSourceCssDirectives)
    || (majorVersion === 4 && cssHandlerOptions.isMainChunk)
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
