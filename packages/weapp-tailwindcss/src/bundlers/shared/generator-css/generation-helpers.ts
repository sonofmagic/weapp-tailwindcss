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
import { resolvePostcssFromOption } from './source-resolver/postcss-source'

function isVueScopedStyleSource(from: string | undefined) {
  if (typeof from !== 'string' || from.length === 0) {
    return false
  }
  const queryIndex = from.indexOf('?')
  if (queryIndex === -1) {
    return false
  }
  const query = from.slice(queryIndex + 1)
  return /(?:^|&)type=style(?:&|$)/.test(query)
    && /(?:^|&)scoped(?:=(?:true|1))?(?:&|$)/.test(query)
}

export function hasMiniProgramTailwindV4PreflightReset(css: string) {
  return /(?:^|[},])\s*view\s*,\s*text\s*,\s*::after\s*,\s*::before\s*\{[^}]*\bborder\s*:\s*0\s+solid\b/.test(css)
}

function isMiniProgramGeneratorTarget(target: string) {
  return target !== 'web' && target !== 'tailwind'
}

export function finalizeMiniProgramGeneratorCss(
  css: string,
  target: string,
  _majorVersion: number | undefined,
  cssPreflight: InternalUserDefinedOptions['cssPreflight'],
  options: { injectPreflight?: boolean, preservePreflight?: boolean, styleOptions?: Partial<IStyleHandlerOptions> | undefined } = {},
) {
  if (!isMiniProgramGeneratorTarget(target)) {
    return css
  }
  if (isVueScopedStyleSource(options.styleOptions?.postcssOptions?.options?.from)) {
    return finalizeMiniProgramCss(css, {
      cssPreflight: false,
      cssSelectorReplacement: options.styleOptions?.cssOptions?.cssSelectorReplacement
        ?? options.styleOptions?.cssSelectorReplacement,
      isTailwindcssV4: true,
      tailwindcssV4GradientFallback: options.styleOptions?.cssOptions?.tailwindcssV4GradientFallback
        ?? options.styleOptions?.tailwindcssV4GradientFallback,
    })
  }
  const hasPreflightReset = hasMiniProgramTailwindV4PreflightReset(css)
  const injectPreflight = options.injectPreflight !== false
    && !hasPreflightReset
  const preservePreflight = options.preservePreflight !== false
  return finalizeMiniProgramCss(css, {
    cssPreflight: cssPreflight === false || (options.injectPreflight === false && (!hasPreflightReset || !preservePreflight))
      ? false
      : injectPreflight
        ? cssPreflight
        : hasPreflightReset && preservePreflight
          ? cssPreflight
          : undefined,
    cssSelectorReplacement: options.styleOptions?.cssOptions?.cssSelectorReplacement
      ?? options.styleOptions?.cssSelectorReplacement,
    isTailwindcssV4: true,
    tailwindcssV4GradientFallback: options.styleOptions?.cssOptions?.tailwindcssV4GradientFallback
      ?? options.styleOptions?.tailwindcssV4GradientFallback,
  })
}

export function resolveMiniProgramPreflightModeForGeneratorCss(
  opts: InternalUserDefinedOptions,
  options: {
    cssHandlerOptions: IStyleHandlerOptions
    isolateCurrentCssCandidates: boolean
    localImports?: string | undefined
    primaryCssSource?: boolean | undefined
    explicitCssSource?: boolean | undefined
  },
) {
  if (isVueScopedStyleSource(resolvePostcssFromOption(options.cssHandlerOptions))) {
    return {
      inject: false,
      preserve: false,
    }
  }
  if (options.cssHandlerOptions.uniAppX === true && options.cssHandlerOptions.uniAppXCssTarget === 'uvue') {
    return {
      inject: false,
      preserve: false,
    }
  }
  const shouldInjectUniAppXLocalImportPreflight = isUniAppXEnabled(opts.uniAppX) && Boolean(options.localImports?.trim())
  if (opts.cssPreflight === false) {
    return {
      inject: false,
      preserve: false,
    }
  }
  if (options.primaryCssSource) {
    return {
      inject: true,
      preserve: true,
    }
  }
  if (options.explicitCssSource) {
    return {
      inject: false,
      preserve: true,
    }
  }
  if (options.cssHandlerOptions.isMainChunk) {
    return {
      inject: true,
      preserve: true,
    }
  }
  if (!options.cssHandlerOptions.isMainChunk && !options.primaryCssSource && !options.explicitCssSource) {
    return {
      inject: shouldInjectUniAppXLocalImportPreflight,
      preserve: shouldInjectUniAppXLocalImportPreflight,
    }
  }
  if (!options.isolateCurrentCssCandidates) {
    return {
      inject: true,
      preserve: true,
    }
  }
  return {
    inject: shouldInjectUniAppXLocalImportPreflight,
    preserve: shouldInjectUniAppXLocalImportPreflight,
  }
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
  _majorVersion: number | undefined,
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
  return sourceEntries !== undefined && options.cssHandlerOptions?.isMainChunk !== true
}

export function shouldIsolateCurrentTailwindV4CssCandidates(
  _majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    rawSource: string
  },
) {
  return !cssHandlerOptions.isMainChunk
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
    throw new Error('weapp-tailwindcss 生成管线仅支持 Tailwind CSS v4。')
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
  const scopedVueStyleSource = isVueScopedStyleSource(resolvePostcssFromOption(cssHandlerOptions))
  const preflightStyleOptions: Partial<IStyleHandlerOptions> = {
    cssPreflight: scopedVueStyleSource ? false : resolvedStyleOptions.cssPreflight,
    cssPreflightRange: scopedVueStyleSource ? undefined : resolvedStyleOptions.cssPreflightRange,
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
  _majorVersion: number | undefined,
  cssHandlerOptions: IStyleHandlerOptions,
  options: {
    forceGenerator?: boolean | undefined
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
    hasSourceDirectives: boolean
    rawSource: string
    runtimeCandidateCount?: number | undefined
    target?: string | undefined
    configuredCssSourceCount?: number | undefined
  },
) {
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
    || hasSourceCssDirectives
    || (
      cssHandlerOptions.isMainChunk
      && (options.configuredCssSourceCount ?? 0) > 0
    )
    || (
      cssHandlerOptions.isMainChunk
      && options.rawSource.includes('weapp-tailwindcss')
    )
    || (
      options.target === 'web'
      && cssHandlerOptions.isMainChunk
      && (options.runtimeCandidateCount ?? 0) > 0
    )
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
type GeneratorResult = Awaited<ReturnType<ReturnType<typeof createWeappTailwindcssGenerator>['generate']>>
