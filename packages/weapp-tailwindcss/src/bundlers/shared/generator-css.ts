import type { GeneratorResolvedSource } from './generator-css/source-resolver'
import type { GenerateCssByGeneratorOptions, GenerateCssByGeneratorResult } from './generator-css/types'
import process from 'node:process'
import { extractSourceCandidates } from '@tailwindcss-mangle/engine'
import { filterExistingCssRules, normalizeMiniProgramGeneratedCssForPostcss, postcss, transformWebCssCompat } from '@weapp-tailwindcss/postcss'
import { hasCssMacroStyleOptions, hasCssMacroTailwindV4InternalAtRules, transformCssMacroCss } from '@/css-macro/auto'
import { createWeappTailwindcssGenerator, normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch, shouldUseMiniProgramCssBranch } from '@/runtime-branch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { includesTailwindV4PreflightDirective } from '@/tailwindcss/v4/preflight'
import { removeUnsupportedMiniProgramAtRules } from './css-cleanup'
import { collectGeneratedRawSourceCandidates } from './generator-css/class-selectors'
import { hasTailwindApplyDirective, hasTailwindSourceDirectives, normalizeTailwindSourceDirectives, removeTailwindSourceDirectives } from './generator-css/directives'
import { createCssSourceOrderAppend, createRuntimeWithCurrentCssCandidates, finalizeMiniProgramGeneratorCss, isEmptyCssSourceOrderParts, mergeGeneratorResults, mergeScopedRuntimeWithCurrentRuntime, resolveGeneratorStyleOptions, resolveMiniProgramPreflightModeForGeneratorCss, shouldAppendWebBundleCssFallback, shouldFinalizeMarkedUserLayerComponentsCss, shouldIsolateCurrentTailwindV4CssCandidates, shouldIsolateScopedCssSource, shouldScanTailwindV4Sources, shouldUseGeneratorForCurrentCss, splitRawSourceByGeneratedCssOrder } from './generator-css/generation-helpers'
import { appendLegacyCompatCss, appendLegacyContainerCompatCss, hasConfiguredContainerCompatSources } from './generator-css/legacy-compat'
import { inheritLegacyUnitConvertedDeclarations } from './generator-css/legacy-units'
import { cleanLocalCssImportWrapperTailwindDirectives, cleanLocalCssImportWrapperTailwindDirectivesRoot, isPureLocalCssImportWrapper, isPureLocalCssImportWrapperRoot, removeMatchingLocalCssImports, restoreLocalCssImports, splitLocalCssImports, splitLocalCssImportsRoot } from './generator-css/local-imports'
import { createCssAppend, GENERATOR_PLACEHOLDER_MARKER_RE, hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, splitGeneratorPlaceholderCssBySourceOrder, splitTailwindV4GeneratedCssBySourceOrder, stripTailwindBanner } from './generator-css/markers'
import { normalizeMiniProgramGeneratorCssSource } from './generator-css/output-import-shell'
import { resolveGeneratorSourceEntries, resolveGeneratorSources } from './generator-css/source-resolver'
import { normalizeCssSourceForCompare } from './generator-css/source-resolver/matching'
import { extractGeneratedCssForUserLayerSelectors, filterApplyOnlyGeneratedCss, hasUserCssLayerBlocks, isCommentOnlyCss, normalizeEmptyTailwindCustomVariants, removeTailwindV4GeneratedUserCssArtifacts, removeTailwindV4GeneratorAtRules, shouldFilterApplyOnlyGeneratedCss, splitUserCssLayerBlocks, stripTailwindSourceMediaFragments, stripUnmatchedTailwindSourceMediaCloseFragments, transformGeneratorUserCss } from './generator-css/user-css'
import { reorderMarkedUserLayerComponentsCss, wrapUserLayerComponentsCss } from './generator-css/user-layer-order'
import { runWithConcurrency } from './run-tasks'

export {
  hasTailwindSourceDirectives,
  normalizeTailwindSourceForGenerator,
  removeTailwindSourceDirectives,
  resolveCssEntrySource,
} from './generator-css/directives'
export {
  removeTailwindApplyRules,
} from './generator-css/legacy-compat'
export {
  inheritLegacyUnitConvertedDeclarations,
} from './generator-css/legacy-units'
export {
  isPureLocalCssImportWrapper,
} from './generator-css/local-imports'
export {
  createCssAppend,
  hasTailwindGeneratedCss,
  hasTailwindGeneratedCssMarkers,
  removeTailwindGeneratedCssByBanner,
  splitGeneratorPlaceholderCssBySourceOrder,
  splitTailwindGeneratedCssByBanner,
  splitTailwindV4GeneratedCss,
  splitTailwindV4GeneratedCssBySourceOrder,
  stripGeneratorPlaceholderMarkers,
  stripTailwindBanner,
  stripTailwindBanners,
} from './generator-css/markers'
export {
  resolveGeneratorSource,
} from './generator-css/source-resolver'
export type {
  GenerateCssByGeneratorOptions,
  GenerateCssByGeneratorResult,
} from './generator-css/types'
export {
  validateCandidatesByGenerator,
} from './generator-css/validate'

function resolveGeneratorSourceConcurrency() {
  const configured = Number.parseInt(process.env['WEAPP_TW_GENERATOR_SOURCE_CONCURRENCY'] ?? '', 10)
  if (Number.isFinite(configured) && configured > 0) {
    return configured
  }
  return 1
}

function hasPostcssUserPlugins(options: GenerateCssByGeneratorOptions['cssHandlerOptions']) {
  const plugins = options.postcssOptions?.plugins
  if (Array.isArray(plugins)) {
    return plugins.length > 0
  }
  return typeof plugins === 'object' && plugins !== null && Object.keys(plugins).length > 0
}

function shouldProcessDisabledGeneratorCss(rawSource: string, options: GenerateCssByGeneratorOptions['cssHandlerOptions']) {
  if (!hasPostcssUserPlugins(options)) {
    return false
  }
  return /@import\s+(?:url\(\s*)?["']tailwindcss(?:\/[^"')\s]*)?["']/.test(rawSource)
    || hasTailwindApplyDirective(rawSource)
}

function intersectCandidateSets(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) {
    return new Set<string>()
  }
  const [small, large] = left.size <= right.size ? [left, right] : [right, left]
  const matched = new Set<string>()
  for (const candidate of small) {
    if (large.has(candidate)) {
      matched.add(candidate)
    }
  }
  return matched
}

function resolveScopedRuntimeCandidates(
  sourceCandidates: Set<string> | undefined,
  sourceScopedRuntime: Set<string> | undefined,
) {
  if (!sourceCandidates) {
    return sourceScopedRuntime
  }
  if (!sourceScopedRuntime) {
    return sourceCandidates
  }
  if (sourceCandidates.size === 0) {
    return sourceScopedRuntime
  }
  return intersectCandidateSets(sourceCandidates, sourceScopedRuntime)
}

function parseCssSourceRoot(rawSource: string) {
  try {
    return postcss.parse(rawSource)
  }
  catch {
    return undefined
  }
}

function cleanLocalCssImportWrapperFromParsedRoot(rawSource: string, root: postcss.Root | undefined) {
  if (!root) {
    return cleanLocalCssImportWrapperTailwindDirectives(rawSource)
  }
  return cleanLocalCssImportWrapperTailwindDirectivesRoot(root)
    ? root.toString()
    : undefined
}

function isPureLocalCssImportWrapperFromParsedRoot(rawSource: string, root: postcss.Root | undefined) {
  return root
    ? isPureLocalCssImportWrapperRoot(root)
    : isPureLocalCssImportWrapper(rawSource)
}

function splitLocalCssImportsFromParsedRoot(rawSource: string, root: postcss.Root | undefined) {
  return root
    ? splitLocalCssImportsRoot(root)
    : splitLocalCssImports(rawSource)
}

function collectCssRuleIdentityMarkers(source: string) {
  const markers = new Set<string>()
  try {
    const root = postcss.parse(source)
    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        for (const match of selector.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
          markers.add(`class:${match[1]}`)
        }
      }
    })
    root.walkAtRules('keyframes', (rule) => {
      if (rule.params) {
        markers.add(`keyframes:${rule.params}`)
      }
    })
  }
  catch {
  }
  return markers
}

function isCssAlreadyRepresentedByMarkers(css: string, source: string) {
  const sourceMarkers = collectCssRuleIdentityMarkers(source)
  if (sourceMarkers.size === 0) {
    return false
  }
  const cssMarkers = collectCssRuleIdentityMarkers(css)
  for (const marker of sourceMarkers) {
    if (!cssMarkers.has(marker)) {
      return false
    }
  }
  return true
}

function mergeGeneratedCssClassSet(classSet: Set<string>, candidates: Iterable<string>, css: string, escapeMap: Record<string, string> | undefined) {
  const merged = new Set(classSet)
  for (const candidate of collectGeneratedRawSourceCandidates(candidates, css, escapeMap)) {
    merged.add(candidate)
  }
  return merged
}

function resolveGeneratedCssClassSet(
  target: string,
  classSet: Set<string>,
  candidates: Iterable<string>,
  css: string,
  escapeMap: Record<string, string> | undefined,
  previousClassSet?: Set<string> | undefined,
) {
  if (target === 'web') {
    return new Set([
      ...(previousClassSet ?? []),
      ...classSet,
    ])
  }
  return mergeGeneratedCssClassSet(classSet, candidates, css, escapeMap)
}

function finalizeWebGeneratorCss(
  css: string,
  target: string,
  webCompat: ReturnType<typeof normalizeWeappTailwindcssGeneratorOptions>['webCompat'],
) {
  return target === 'web'
    ? transformWebCssCompat(css, webCompat)
    : css
}

function finalizeIncrementalGeneratorCss(
  previousCss: string,
  incrementalCss: string,
  target: string,
  majorVersion: number | undefined,
  cssPreflight: Parameters<typeof finalizeMiniProgramGeneratorCss>[3],
  options: Parameters<typeof finalizeMiniProgramGeneratorCss>[4],
  webCompat: ReturnType<typeof normalizeWeappTailwindcssGeneratorOptions>['webCompat'],
) {
  const finalizedIncrementalCss = finalizeMiniProgramGeneratorCss(incrementalCss, target, majorVersion, cssPreflight, options)
  if (target === 'web') {
    return createCssAppend(previousCss, finalizeWebGeneratorCss(finalizedIncrementalCss, target, webCompat))
  }
  return createCssAppend(previousCss, finalizedIncrementalCss)
}

export async function generateCssByGenerator(
  options: GenerateCssByGeneratorOptions,
): Promise<GenerateCssByGeneratorResult | undefined> {
  const {
    opts,
    runtimeState,
    runtime,
    rawSource,
    file,
    cssHandlerOptions,
    cssUserHandlerOptions,
    getSourceCandidatesForEntries,
    styleHandler,
    generatorPlatform,
    userRawSource,
    userRawSourceProcessed,
    debug,
  } = options
  const platform = generatorPlatform ?? opts.cssOptions?.platform ?? opts.platform
  const generatorOptions = {
    ...normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
      appType: opts.appType,
      platform,
      tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
      uniAppX: opts.uniAppX,
    }),
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  }
  const generatorBranch = resolveGeneratorRuntimeBranch(generatorOptions, {
    appType: opts.appType,
    platform,
    tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
    uniAppX: opts.uniAppX,
  })
  const majorVersion = runtimeState.tailwindRuntime.majorVersion
  if (majorVersion !== 4) {
    throw new Error('weapp-tailwindcss 生成管线仅支持 Tailwind CSS v4。')
  }
  const useMiniProgramCssBranch = shouldUseMiniProgramCssBranch(generatorBranch)
  const normalizeGeneratorCssSource = (css: string) => {
    return useMiniProgramCssBranch
      ? normalizeMiniProgramGeneratorCssSource(css, file)
      : css
  }
  const normalizeGeneratorSource = <T extends { css: string }>(source: T): T => {
    const css = normalizeGeneratorCssSource(source.css)
    return css === source.css
      ? source
      : {
          ...source,
          css,
        }
  }
  if (!generatorOptions.enabled) {
    debug('tailwind direct css generation disabled: %s', file)
    if (shouldProcessDisabledGeneratorCss(rawSource, cssHandlerOptions)) {
      const handled = await styleHandler(rawSource, cssHandlerOptions)
      return {
        css: finalizeWebGeneratorCss(handled.css, generatorOptions.target, generatorOptions.webCompat),
        classSet: resolveGeneratedCssClassSet(
          generatorOptions.target,
          new Set(),
          runtime,
          handled.css,
          opts.escapeMap,
          options.previousClassSet,
        ),
        target: generatorOptions.target,
        source: 'generator',
        dependencies: [],
        metadata: {
          file,
          majorVersion,
          rawCss: rawSource,
        },
      }
    }
    return undefined
  }
  const effectiveRawSource = stripUnmatchedTailwindSourceMediaCloseFragments(
    stripTailwindSourceMediaFragments(
      normalizeEmptyTailwindCustomVariants(
        normalizeGeneratorCssSource(
          normalizeTailwindSourceDirectives(rawSource, {
            importFallback: generatorOptions.importFallback,
          }),
        ),
      ),
    ),
  )
  const effectiveRawSourceRoot = parseCssSourceRoot(effectiveRawSource)
  const cleanedLocalImportWrapper = cleanLocalCssImportWrapperFromParsedRoot(effectiveRawSource, effectiveRawSourceRoot)
  if (cleanedLocalImportWrapper !== undefined) {
    return {
      css: shouldUseMiniProgramCssBranch(generatorBranch)
        ? removeUnsupportedMiniProgramAtRules(cleanedLocalImportWrapper)
        : cleanedLocalImportWrapper,
      classSet: new Set(),
      target: generatorOptions.target,
      source: 'generator',
      dependencies: [],
      metadata: {
        file,
        majorVersion,
      },
    }
  }

  if (isPureLocalCssImportWrapperFromParsedRoot(effectiveRawSource, effectiveRawSourceRoot)) {
    return undefined
  }

  const localImportParts = splitLocalCssImportsFromParsedRoot(effectiveRawSource, effectiveRawSourceRoot)
  const localImports = options.restoreLocalCssImports === false
    ? undefined
    : localImportParts?.imports
  const finalizeGeneratorCss = (css: string, target: string, finalizeOptions: Parameters<typeof finalizeMiniProgramGeneratorCss>[4] = {}) => {
    return finalizeWebGeneratorCss(
      restoreLocalCssImports(
        finalizeMiniProgramGeneratorCss(css, target, majorVersion, opts.cssPreflight, finalizeOptions),
        localImports,
        { outputFile: file },
      ),
      target,
      generatorOptions.webCompat,
    )
  }
  const generatorRawSource = localImportParts?.source ?? effectiveRawSource
  const rawUserSource = userRawSource === undefined
    ? generatorRawSource
    : userRawSourceProcessed
      ? userRawSource
      : stripUnmatchedTailwindSourceMediaCloseFragments(
          stripTailwindSourceMediaFragments(
            normalizeEmptyTailwindCustomVariants(
              normalizeGeneratorCssSource(
                normalizeTailwindSourceDirectives(userRawSource, {
                  importFallback: generatorOptions.importFallback,
                }),
              ),
            ),
          ),
        )
  const userLocalImportParts = rawUserSource === generatorRawSource
    ? undefined
    : splitLocalCssImports(rawUserSource)
  const userSource = userLocalImportParts?.source ?? rawUserSource
  const userCssRawSource = removeTailwindV4GeneratorAtRules(userSource)
  const hasWebUserCssFallbackSource = userCssRawSource.trim().length > 0
    && !isCommentOnlyCss(userCssRawSource)
  const generatedUserCssOrderSource = hasTailwindGeneratedCss(userSource)
    ? splitTailwindV4GeneratedCssBySourceOrder(userSource, generatorRawSource)
    : undefined
  const generatedUserCssRawSource = generatedUserCssOrderSource
    ? createCssAppend(generatedUserCssOrderSource.before, generatedUserCssOrderSource.after)
    : hasTailwindGeneratedCss(userSource)
      ? ''
      : userCssRawSource
  const userCssOrderSource = GENERATOR_PLACEHOLDER_MARKER_RE.test(userSource)
    ? userSource
    : hasTailwindGeneratedCss(userSource)
      ? userSource
      : generatedUserCssRawSource
  const hasDistinctUserRawSource = typeof userRawSource === 'string'
    && normalizeCssSourceForCompare(generatedUserCssRawSource) !== normalizeCssSourceForCompare(generatorRawSource)

  const hasGeneratedCss = hasTailwindGeneratedCss(generatorRawSource)
  const hasSourceDirectives = hasTailwindSourceDirectives(generatorRawSource, {
    importFallback: generatorOptions.importFallback,
  })
  const hasGeneratedMarkers = hasTailwindGeneratedCssMarkers(generatorRawSource)
  const normalizedCssSources = options.cssSources?.map((source) => {
    const css = normalizeGeneratorCssSource(normalizeEmptyTailwindCustomVariants(source.css))
    return css === source.css
      ? source
      : {
          ...source,
          css,
        }
  })
  const shouldGenerateCurrentCss = shouldUseGeneratorForCurrentCss(majorVersion, cssHandlerOptions, {
    forceGenerator: options.forceGenerator,
    hasGeneratedCss,
    hasGeneratedMarkers,
    hasSourceDirectives,
    rawSource: generatorRawSource,
    runtimeCandidateCount: runtime.size,
    target: generatorOptions.target,
    configuredCssSourceCount: options.cssSources?.length,
  })

  if (
    !shouldGenerateCurrentCss
  ) {
    return undefined
  }

  try {
    await runtimeState.readyPromise
    const currentCssCandidates = await extractSourceCandidates(generatorRawSource, 'css', {
      ...(generatorOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: generatorOptions.bareArbitraryValues }),
    })
    const isolateCurrentCssCandidates = shouldIsolateCurrentTailwindV4CssCandidates(
      majorVersion,
      cssHandlerOptions,
      {
        hasGeneratedCss,
        hasGeneratedMarkers,
        rawSource: generatorRawSource,
      },
    )
    const runtimeWithCurrentCss = createRuntimeWithCurrentCssCandidates(
      runtime,
      currentCssCandidates,
      isolateCurrentCssCandidates,
    )
    const sources = await resolveGeneratorSources(
      majorVersion,
      runtimeState,
      generatorRawSource,
      file,
      cssHandlerOptions,
      generatorOptions,
      {
        cssEntries: cssHandlerOptions.sourceOptions?.cssEntries ?? opts.cssEntries,
        cssSources: normalizedCssSources,
        getSourceCandidatesForEntries,
        runtime: runtimeWithCurrentCss,
      },
    )
    const generatorSources = useMiniProgramCssBranch
      ? sources.map(normalizeGeneratorSource)
      : sources
    const generatorStyleOptions = resolveGeneratorStyleOptions(opts, cssHandlerOptions, generatorOptions.styleOptions)
    const configuredContainerCompat = hasConfiguredContainerCompatSources(generatorSources)
    const sourceConcurrency = resolveGeneratorSourceConcurrency()
    const generatedResultsWithDeferred = await runWithConcurrency(generatorSources.map(source => async () => {
      const sourceCss = options.deferCssAdaptation
        ? removeMatchingLocalCssImports(source.css, localImports)
        : source.css
      const generatorSource = options.disableSourceScan === true
        ? {
            ...source,
            css: removeTailwindSourceDirectives(sourceCss, {
              importFallback: generatorOptions.importFallback,
            }),
          }
        : sourceCss === source.css
          ? source
          : {
              ...source,
              css: sourceCss,
            }
      const generator = createWeappTailwindcssGenerator(generatorSource)
      const sourceEntries = getSourceCandidatesForEntries
        ? await resolveGeneratorSourceEntries(source, runtimeState)
        : undefined
      const sourceScopedRuntime = sourceEntries && sourceEntries.length > 0
        ? getSourceCandidatesForEntries?.(sourceEntries)
        : undefined
      const scopedRuntime = resolveScopedRuntimeCandidates(options.sourceCandidates, sourceScopedRuntime)
      const isolateCssSource = shouldIsolateScopedCssSource(majorVersion, source, sourceEntries, {
        cssHandlerOptions,
        target: generatorOptions.target,
      })
      const sourceMetadata = (source as GeneratorResolvedSource).__weappTailwindcssMeta
      const matchedCssSourceFile = Boolean(sourceMetadata?.matchedCssSourceFile)
      if (
        options.deferEmptyScopedCssSource
        && isolateCssSource
        && scopedRuntime?.size === 0
        && currentCssCandidates.length === 0
        && !cssHandlerOptions.isMainChunk
      ) {
        debug('defer empty scoped css source generation: %s', file)
        return undefined
      }
      const sourceRuntime = (scopedRuntime && (scopedRuntime.size > 0 || isolateCssSource)) || isolateCssSource
        ? isolateCurrentCssCandidates
          ? runtimeWithCurrentCss
          : mergeScopedRuntimeWithCurrentRuntime(scopedRuntime ?? new Set(), runtimeWithCurrentCss, {
              currentCssCandidates,
              cssHandlerOptions,
              isolateCssSource,
              majorVersion,
              matchedCssSourceFile,
            })
        : runtimeWithCurrentCss
      const generatorRuntime = shouldUseMiniProgramCssBranch(generatorBranch)
        ? filterUnsupportedMiniProgramTailwindV4Candidates(sourceRuntime)
        : sourceRuntime
      return generator.generate({
        bareArbitraryValues: generatorOptions.bareArbitraryValues,
        candidates: generatorRuntime,
        incrementalCache: true,
        scanSources: options.disableSourceScan === true
          ? false
          : shouldScanTailwindV4Sources(
              majorVersion,
              generatorOptions.target,
              generatorRuntime,
              isolateCssSource,
            ),
        styleOptions: generatorStyleOptions,
        target: generatorOptions.target,
      })
    }), sourceConcurrency)
    const generatedResults = generatedResultsWithDeferred.filter((item): item is NonNullable<typeof item> => Boolean(item))
    const generated = mergeGeneratorResults(generatedResults)
    if (!generated) {
      return undefined
    }
    debug(
      'tailwind generator result: %s rawBytes=%d cssBytes=%d candidates=%d',
      file,
      generated.rawCss.length,
      generated.css.length,
      generated.classSet.size,
    )
    const hasMatchedCssSourceFile = generatorSources.some(source => (source as GeneratorResolvedSource).__weappTailwindcssMeta?.matchedCssSourceFile)
    const hasExplicitCssSource = generatorSources.some((source) => {
      const metadata = (source as GeneratorResolvedSource).__weappTailwindcssMeta
      return metadata?.candidateMatchedCssSource !== true
        && (metadata?.cssEntryIndex !== undefined || metadata?.cssSourceIndex !== undefined)
    })
    const hasPreflightCssSource = generatorSources.some((source) => {
      const metadata = (source as GeneratorResolvedSource).__weappTailwindcssMeta
      const appEntryMatchedByCandidates = metadata?.candidateMatchedCssSource === true
        && metadata.cssEntryIndex === 0
        && metadata.cssSourceIndex === undefined
      return metadata?.includesPreflight === true
        && !appEntryMatchedByCandidates
    })
    const hasPreflightRawSource = includesTailwindV4PreflightDirective(generatorRawSource)
    const hasOnlyPrimaryCssSource = generatorSources.length > 0
      && generatorSources.every((source) => {
        const metadata = (source as GeneratorResolvedSource).__weappTailwindcssMeta
        return metadata?.candidateMatchedCssSource !== true
          && metadata?.primaryCssSource === true
      })
    const shouldFilterApplyOnlyCss = shouldFilterApplyOnlyGeneratedCss(
      majorVersion,
      generated.target,
      generatorRawSource,
      {
        hasGeneratedCss,
        hasGeneratedMarkers,
      },
    )
    const filterGeneratedApplyOnlyCss = (css: string) => {
      if (!shouldFilterApplyOnlyCss) {
        return css
      }
      return filterApplyOnlyGeneratedCss(css, generatorRawSource, {
        preserveVariables: generated.target !== 'web',
      })
    }
    const preflightMode = resolveMiniProgramPreflightModeForGeneratorCss(opts, {
      cssHandlerOptions,
      isolateCurrentCssCandidates,
      localImports,
      explicitCssSource: hasExplicitCssSource,
      primaryCssSource: hasOnlyPrimaryCssSource || hasPreflightCssSource || hasPreflightRawSource,
    })
    if (options.deferCssAdaptation) {
      const normalizeDeferredGeneratedCss = async (css: string) => {
        const rawCss = stripTailwindBanner(css)
        const generationCss = generated.target === 'weapp'
          && (hasCssMacroStyleOptions(generatorStyleOptions) || hasCssMacroTailwindV4InternalAtRules(rawCss))
          ? await transformCssMacroCss(rawCss, generatorStyleOptions)
          : rawCss
        const normalizedCss = generated.target === 'weapp'
          ? await normalizeMiniProgramGeneratedCssForPostcss(generationCss, {
              preservePreflight: true,
              preserveRawClassRules: true,
            })
          : generationCss
        return filterGeneratedApplyOnlyCss(normalizedCss)
      }
      const restoreDeferredUserCss = async (css: string) => {
        if (generated.target !== 'weapp' || generatedUserCssRawSource.trim().length === 0) {
          return css
        }

        const userCssOptions = {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        }
        const transformDeferredUserCss = async (source: string) => {
          const parts = splitUserCssLayerBlocks(source)
          const layerCss = await transformGeneratorUserCss(parts.layer, userCssOptions)
          const restCss = await transformGeneratorUserCss(parts.rest, userCssOptions)
          return createCssSourceOrderAppend(wrapUserLayerComponentsCss(layerCss), restCss)
        }
        const orderedUserCss = splitGeneratorPlaceholderCssBySourceOrder(userCssOrderSource, generated.rawCss)
          ?? (hasMatchedCssSourceFile
            ? splitTailwindV4GeneratedCssBySourceOrder(userCssOrderSource, generated.rawCss)
            : splitRawSourceByGeneratedCssOrder(userCssOrderSource, generated.rawCss))

        if (orderedUserCss) {
          const beforeUserCss = await transformDeferredUserCss(orderedUserCss.before)
          const afterUserCss = await transformDeferredUserCss(orderedUserCss.after)
          const missingBeforeUserCss = filterExistingCssRules(css, beforeUserCss)
          const cssWithBeforeUserCss = createCssSourceOrderAppend(missingBeforeUserCss, css)
          const missingAfterUserCss = filterExistingCssRules(cssWithBeforeUserCss, afterUserCss)
          return reorderMarkedUserLayerComponentsCss(
            createCssSourceOrderAppend(cssWithBeforeUserCss, missingAfterUserCss),
          )
        }

        const userCss = await transformDeferredUserCss(generatedUserCssRawSource)
        return reorderMarkedUserLayerComponentsCss(
          createCssSourceOrderAppend(css, filterExistingCssRules(css, userCss)),
        )
      }
      const canAppendIncrementalCss = generated.target !== 'weapp' || !hasUserCssLayerBlocks(generatorRawSource)
      const incrementalRawCss = generated.incrementalRawCss ?? generated.incrementalCss
      const shouldAppendIncrementalCss = canAppendIncrementalCss
        && typeof options.previousCss === 'string'
        && typeof incrementalRawCss === 'string'
      const normalizedCss = shouldAppendIncrementalCss
        ? incrementalRawCss.trim().length > 0
          ? createCssAppend(options.previousCss, await normalizeDeferredGeneratedCss(incrementalRawCss))
          : options.previousCss
        : await normalizeDeferredGeneratedCss(generated.rawCss ?? generated.css)
      const intermediateCss = shouldAppendIncrementalCss
        ? normalizedCss
        : await restoreDeferredUserCss(normalizedCss)
      const css = restoreLocalCssImports(
        intermediateCss,
        localImports,
        { outputFile: file },
      )
      return {
        css,
        classSet: resolveGeneratedCssClassSet(
          generated.target,
          generated.classSet,
          runtimeWithCurrentCss,
          css,
          opts.escapeMap,
          options.previousClassSet,
        ),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
        incremental: shouldAppendIncrementalCss,
        metadata: {
          file,
          majorVersion,
          preflightMode,
          rawCss: generated.rawCss,
        },
      }
    }
    const canAppendIncrementalCss = generated.target !== 'weapp' || !hasUserCssLayerBlocks(generatorRawSource)
    if (canAppendIncrementalCss && typeof options.previousCss === 'string' && typeof generated.incrementalCss === 'string') {
      const incrementalCss = stripTailwindBanner(generated.incrementalCss)
      const css = incrementalCss.trim().length > 0
        ? finalizeIncrementalGeneratorCss(options.previousCss, incrementalCss, generated.target, majorVersion, opts.cssPreflight, {
            injectPreflight: false,
            styleOptions: generatorStyleOptions,
          }, generatorOptions.webCompat)
        : options.previousCss
      const finalCss = generated.target === 'web'
        ? restoreLocalCssImports(css, localImports, { outputFile: file })
        : finalizeWebGeneratorCss(restoreLocalCssImports(css, localImports, { outputFile: file }), generated.target, generatorOptions.webCompat)
      return {
        css: finalCss,
        classSet: resolveGeneratedCssClassSet(generated.target, generated.classSet, runtimeWithCurrentCss, finalCss, opts.escapeMap, options.previousClassSet),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
        incremental: true,
        metadata: {
          file,
          majorVersion,
          rawCss: generated.rawCss,
        },
      }
    }
    const generatedCssSource = generated.target === 'web'
      ? generated.css
      : stripTailwindBanner(generated.css)
    const generatedCss = filterGeneratedApplyOnlyCss(generatedCssSource)
    const placeholderOrderedExtraCss = splitGeneratorPlaceholderCssBySourceOrder(userCssOrderSource, generated.rawCss)
    const orderedExtraCss = placeholderOrderedExtraCss ?? (hasMatchedCssSourceFile
      ? splitTailwindV4GeneratedCssBySourceOrder(userCssOrderSource, generated.rawCss)
      : splitRawSourceByGeneratedCssOrder(userCssOrderSource, generated.rawCss))
    const shouldAppendMatchedCssSourceCompat = !hasMatchedCssSourceFile || orderedExtraCss !== undefined
    if (orderedExtraCss) {
      let css = generatedCss
      if (generated.target === 'weapp') {
        css = inheritLegacyUnitConvertedDeclarations(css, generatorRawSource)
      }
      const userCssOptions = {
        generatorTarget: generated.target,
        generatorStyleOptions,
        cssUserHandlerOptions,
        styleHandler,
        importFallback: generatorOptions.importFallback,
        processed: userRawSourceProcessed,
      }
      const afterLayerParts = generated.target === 'weapp'
        ? splitUserCssLayerBlocks(orderedExtraCss.after)
        : {
            layer: '',
            rest: orderedExtraCss.after,
          }
      const beforeUserCss = await transformGeneratorUserCss(orderedExtraCss.before, userCssOptions)
      const afterLayerUserCss = await transformGeneratorUserCss(afterLayerParts.layer, userCssOptions)
      const afterUserCss = await transformGeneratorUserCss(afterLayerParts.rest, userCssOptions)
      const fallbackLayerUserCss = generated.target === 'weapp'
        && hasUserCssLayerBlocks(userCssRawSource)
        ? filterExistingCssRules(
            afterLayerUserCss,
            await transformGeneratorUserCss(splitUserCssLayerBlocks(userCssRawSource).layer, userCssOptions),
          )
        : ''
      const orderedAfterLayerUserCss = generated.target === 'weapp'
        ? wrapUserLayerComponentsCss(createCssSourceOrderAppend(afterLayerUserCss, fallbackLayerUserCss))
        : afterLayerUserCss
      css = createCssSourceOrderAppend(
        createCssSourceOrderAppend(
          createCssSourceOrderAppend(beforeUserCss, orderedAfterLayerUserCss),
          css,
        ),
        afterUserCss,
      )
      if (
        hasWebUserCssFallbackSource
        && isEmptyCssSourceOrderParts(orderedExtraCss)
        && shouldAppendWebBundleCssFallback(generated.target, {
          hasSourceDirectives,
          hasMatchedCssSourceFile,
        })
      ) {
        const userCss = await transformGeneratorUserCss(userCssRawSource, userCssOptions)
        css = createCssSourceOrderAppend(css, userCss)
      }
      if (generated.target === 'web' && hasWebUserCssFallbackSource) {
        const userCss = await transformGeneratorUserCss(userCssRawSource, userCssOptions)
        const missingUserCss = isCommentOnlyCss(userCss) ? '' : filterExistingCssRules(css, userCss)
        css = createCssSourceOrderAppend(css, missingUserCss)
      }
      if (
        generated.target === 'weapp'
        && isEmptyCssSourceOrderParts(orderedExtraCss)
        && hasDistinctUserRawSource
        && !hasGeneratedCss
        && !hasGeneratedMarkers
        && !hasTailwindApplyDirective(generatedUserCssRawSource)
      ) {
        const userCss = await transformGeneratorUserCss(generatedUserCssRawSource, userCssOptions)
        const missingUserCss = isCssAlreadyRepresentedByMarkers(css, generatedUserCssRawSource)
          ? filterExistingCssRules(css, userCss)
          : userCss
        css = createCssSourceOrderAppend(css, missingUserCss)
      }
      if (generated.target === 'weapp' && shouldAppendMatchedCssSourceCompat) {
        if (shouldFinalizeMarkedUserLayerComponentsCss(file)) {
          css = reorderMarkedUserLayerComponentsCss(css)
        }
        if (
          !shouldFilterApplyOnlyCss
          && !userRawSourceProcessed
          && !hasGeneratedCss
          && !hasGeneratedMarkers
        ) {
          css = await appendLegacyCompatCss(
            css,
            generatedUserCssRawSource,
            generated.target,
            styleHandler,
            cssHandlerOptions,
            generatorStyleOptions,
          )
          if (!isolateCurrentCssCandidates) {
            css = await appendLegacyContainerCompatCss(
              css,
              generatedUserCssRawSource,
              file,
              runtime,
              configuredContainerCompat,
              generated.target,
              styleHandler,
              cssHandlerOptions,
              generatorStyleOptions,
            )
          }
        }
      }
      else if (generated.target === 'weapp' && shouldFinalizeMarkedUserLayerComponentsCss(file)) {
        css = reorderMarkedUserLayerComponentsCss(css)
      }
      const finalCss = finalizeGeneratorCss(css, generated.target, {
        injectPreflight: preflightMode.inject,
        preservePreflight: preflightMode.preserve,
        styleOptions: generatorStyleOptions,
      })
      return {
        css: finalCss,
        classSet: resolveGeneratedCssClassSet(generated.target, generated.classSet, runtimeWithCurrentCss, finalCss, opts.escapeMap, options.previousClassSet),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
        metadata: {
          file,
          majorVersion,
          rawCss: generated.rawCss,
        },
      }
    }
    debug(
      'tailwind direct css generation prefix mismatch, append transformed bundle css %s',
      file,
    )
    let css = generatedCss
    const distinctUserLayerParts = hasDistinctUserRawSource
      && hasUserCssLayerBlocks(generatedUserCssRawSource)
      ? splitUserCssLayerBlocks(generatedUserCssRawSource)
      : undefined
    let restoredDistinctUserLayerCss = false
    if (
      generated.target === 'weapp'
      && generatorRawSource.includes('weapp-tailwindcss generator-placeholder')
      && !hasUserCssLayerBlocks(generatorRawSource)
    ) {
      const userCss = await transformGeneratorUserCss(generatedUserCssRawSource, {
        generatorTarget: generated.target,
        generatorStyleOptions,
        cssUserHandlerOptions,
        styleHandler,
        importFallback: generatorOptions.importFallback,
        processed: userRawSourceProcessed,
      })
      css = createCssSourceOrderAppend(userCss, css)
    }
    if (generated.target === 'weapp') {
      css = inheritLegacyUnitConvertedDeclarations(css, generatorRawSource)
      if (hasUserCssLayerBlocks(generatorRawSource)) {
        const layerParts = splitUserCssLayerBlocks(generatorRawSource)
        const layerUserCss = await transformGeneratorUserCss(layerParts.layer, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        })
        const layerCss = layerUserCss.trim().length > 0 && !hasTailwindApplyDirective(layerUserCss)
          ? {
              layer: layerUserCss,
              rest: css,
            }
          : extractGeneratedCssForUserLayerSelectors(css, layerParts.layer)
        if (layerCss.layer.trim().length > 0) {
          css = createCssSourceOrderAppend(wrapUserLayerComponentsCss(layerCss.layer), layerCss.rest)
          if (shouldFinalizeMarkedUserLayerComponentsCss(file)) {
            css = reorderMarkedUserLayerComponentsCss(css)
          }
        }
      }
      if (
        hasDistinctUserRawSource
        && distinctUserLayerParts
      ) {
        const layerUserCss = await transformGeneratorUserCss(
          distinctUserLayerParts.layer,
          {
            generatorTarget: generated.target,
            generatorStyleOptions,
            cssUserHandlerOptions,
            styleHandler,
            importFallback: generatorOptions.importFallback,
            processed: userRawSourceProcessed,
          },
        )
        const missingLayerUserCss = filterExistingCssRules(css, layerUserCss)
        if (missingLayerUserCss.trim().length > 0) {
          css = createCssSourceOrderAppend(wrapUserLayerComponentsCss(layerUserCss), css)
          restoredDistinctUserLayerCss = true
          if (shouldFinalizeMarkedUserLayerComponentsCss(file)) {
            css = reorderMarkedUserLayerComponentsCss(css)
          }
        }
      }
    }
    if (hasMatchedCssSourceFile || generated.target === 'web') {
      if (
        generated.target === 'weapp'
        && !hasGeneratedCss
        && !hasGeneratedMarkers
      ) {
        const distinctUserCssRawSource = restoredDistinctUserLayerCss
          ? distinctUserLayerParts?.rest ?? generatedUserCssRawSource
          : generatedUserCssRawSource
        const userCss = await transformGeneratorUserCss(distinctUserCssRawSource, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        })
        const missingUserCss = isCssAlreadyRepresentedByMarkers(css, distinctUserCssRawSource)
          ? filterExistingCssRules(css, userCss)
          : userCss
        css = createCssSourceOrderAppend(css, missingUserCss)
      }
      else if (
        hasMatchedCssSourceFile
        && generated.target === 'weapp'
        && hasGeneratedMarkers
        && !hasGeneratedCss
      ) {
        const cleanedUserCssRawSource = removeTailwindV4GeneratedUserCssArtifacts(userCssRawSource)
        const cleanedUserCssRestSource = restoredDistinctUserLayerCss && hasUserCssLayerBlocks(cleanedUserCssRawSource)
          ? splitUserCssLayerBlocks(cleanedUserCssRawSource).rest
          : cleanedUserCssRawSource
        const userCss = await transformGeneratorUserCss(cleanedUserCssRestSource, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        })
        const missingUserCss = filterExistingCssRules(css, userCss)
        css = createCssSourceOrderAppend(css, missingUserCss)
      }
      else if (hasMatchedCssSourceFile && generated.target === 'weapp' && hasUserCssLayerBlocks(generatedUserCssRawSource)) {
        const layerUserCss = await transformGeneratorUserCss(splitUserCssLayerBlocks(generatedUserCssRawSource).layer, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        })
        if (layerUserCss.trim().length > 0) {
          css = createCssSourceOrderAppend(css, wrapUserLayerComponentsCss(layerUserCss))
          if (shouldFinalizeMarkedUserLayerComponentsCss(file)) {
            css = reorderMarkedUserLayerComponentsCss(css)
          }
        }
      }
      if (hasMatchedCssSourceFile && generated.target === 'weapp') {
        if (
          !isolateCurrentCssCandidates
          && !shouldFilterApplyOnlyCss
          && !userRawSourceProcessed
          && !hasGeneratedCss
          && !hasGeneratedMarkers
        ) {
          css = await appendLegacyContainerCompatCss(
            css,
            generatedUserCssRawSource,
            file,
            runtime,
            configuredContainerCompat,
            generated.target,
            styleHandler,
            cssHandlerOptions,
            generatorStyleOptions,
          )
        }
      }
      if (
        hasWebUserCssFallbackSource
        && shouldAppendWebBundleCssFallback(generated.target, {
          hasSourceDirectives,
          hasMatchedCssSourceFile,
        })
      ) {
        const userCss = await transformGeneratorUserCss(generatedUserCssRawSource, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        })
        const missingUserCss = isCommentOnlyCss(userCss) ? '' : filterExistingCssRules(css, userCss)
        css = createCssSourceOrderAppend(css, missingUserCss)
      }
      const finalCss = finalizeGeneratorCss(css, generated.target, {
        injectPreflight: preflightMode.inject,
        preservePreflight: preflightMode.preserve,
        styleOptions: generatorStyleOptions,
      })
      return {
        css: finalCss,
        classSet: resolveGeneratedCssClassSet(generated.target, generated.classSet, runtimeWithCurrentCss, finalCss, opts.escapeMap, options.previousClassSet),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
        metadata: {
          file,
          majorVersion,
          rawCss: generated.rawCss,
        },
      }
    }
    if (
      !shouldFilterApplyOnlyCss
      && !userRawSourceProcessed
      && !hasGeneratedCss
      && !hasGeneratedMarkers
    ) {
      css = await appendLegacyCompatCss(
        css,
        generatedUserCssRawSource,
        generated.target,
        styleHandler,
        cssHandlerOptions,
        generatorStyleOptions,
      )
      css = await appendLegacyContainerCompatCss(
        css,
        generatedUserCssRawSource,
        file,
        runtime,
        configuredContainerCompat,
        generated.target,
        styleHandler,
        cssHandlerOptions,
        generatorStyleOptions,
      )
    }
    if (
      generated.target === 'weapp'
      && hasDistinctUserRawSource
      && !hasGeneratedCss
      && !hasGeneratedMarkers
      && !hasTailwindApplyDirective(generatedUserCssRawSource)
    ) {
      const distinctUserCssRawSource = restoredDistinctUserLayerCss
        ? distinctUserLayerParts?.rest ?? generatedUserCssRawSource
        : generatedUserCssRawSource
      const userCss = await transformGeneratorUserCss(distinctUserCssRawSource, {
        generatorTarget: generated.target,
        generatorStyleOptions,
        cssUserHandlerOptions,
        styleHandler,
        importFallback: generatorOptions.importFallback,
        processed: userRawSourceProcessed,
      })
      const missingUserCss = isCssAlreadyRepresentedByMarkers(css, distinctUserCssRawSource)
        ? filterExistingCssRules(css, userCss)
        : userCss
      css = createCssSourceOrderAppend(css, missingUserCss)
    }
    const finalCss = finalizeGeneratorCss(css, generated.target, {
      injectPreflight: preflightMode.inject,
      preservePreflight: preflightMode.preserve,
      styleOptions: generatorStyleOptions,
    })
    return {
      css: finalCss,
      classSet: resolveGeneratedCssClassSet(generated.target, generated.classSet, runtimeWithCurrentCss, finalCss, opts.escapeMap, options.previousClassSet),
      target: generated.target,
      source: 'generator',
      dependencies: generated.dependencies,
      metadata: {
        file,
        majorVersion,
        rawCss: generated.rawCss,
      },
    }
  }
  catch (error) {
    debug('tailwind direct css generation failed: %s %O', file, error)
    throw error
  }

  return undefined
}
