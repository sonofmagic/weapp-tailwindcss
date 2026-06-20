import type { GeneratorResolvedSource } from './generator-css/source-resolver'
import type { GenerateCssByGeneratorOptions, GenerateCssByGeneratorResult } from './generator-css/types'
import process from 'node:process'
import { extractSourceCandidates } from '@tailwindcss-mangle/engine'
import { filterExistingCssRules, postcss } from '@weapp-tailwindcss/postcss'
import { createWeappTailwindcssGenerator, normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch, shouldUseMiniProgramCssBranch } from '@/runtime-branch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { removeUnsupportedMiniProgramAtRules } from './css-cleanup'
import { hasTailwindApplyDirective, hasTailwindSourceDirectives, normalizeTailwindSourceDirectives } from './generator-css/directives'
import { createCssSourceOrderAppend, createRuntimeWithCurrentCssCandidates, finalizeMiniProgramGeneratorCss, isEmptyCssSourceOrderParts, isSupportedGeneratorMajorVersion, mergeGeneratorResults, mergeScopedRuntimeWithCurrentRuntime, resolveGeneratorStyleOptions, shouldAppendWebBundleCssFallback, shouldFinalizeMarkedUserLayerComponentsCss, shouldInjectMiniProgramPreflightForGeneratorCss, shouldIsolateCurrentTailwindV4CssCandidates, shouldIsolateScopedCssSource, shouldScanTailwindV4Sources, shouldUseGeneratorForCurrentCss, splitRawSourceByGeneratedCssOrder } from './generator-css/generation-helpers'
import { appendLegacyCompatCss, appendLegacyContainerCompatCss, hasConfiguredContainerCompatSources } from './generator-css/legacy-compat'
import { inheritLegacyUnitConvertedDeclarations } from './generator-css/legacy-units'
import { cleanLocalCssImportWrapperTailwindDirectives, isPureLocalCssImportWrapper, restoreLocalCssImports, splitLocalCssImports } from './generator-css/local-imports'
import { createCssAppend, GENERATOR_PLACEHOLDER_MARKER_RE, hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, splitGeneratorPlaceholderCssBySourceOrder, splitTailwindV4GeneratedCssBySourceOrder, stripTailwindBanner } from './generator-css/markers'
import { resolveGeneratorSourceEntries, resolveGeneratorSources } from './generator-css/source-resolver'
import { normalizeCssSourceForCompare } from './generator-css/source-resolver/matching'
import { extractGeneratedCssForUserLayerSelectors, filterApplyOnlyGeneratedCss, hasUserCssLayerBlocks, removeTailwindV4GeneratorAtRules, shouldFilterApplyOnlyGeneratedCss, splitUserCssLayerBlocks, stripTailwindSourceMediaFragments, stripUnmatchedTailwindSourceMediaCloseFragments, transformGeneratorUserCss } from './generator-css/user-css'
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
    userRawSource,
    userRawSourceProcessed,
    debug,
  } = options
  const generatorOptions = {
    ...normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
      appType: opts.appType,
      platform: opts.cssOptions?.platform ?? opts.platform,
      tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
      uniAppX: opts.uniAppX,
    }),
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  }
  const generatorBranch = resolveGeneratorRuntimeBranch(generatorOptions, {
    appType: opts.appType,
    platform: opts.cssOptions?.platform ?? opts.platform,
    tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
    uniAppX: opts.uniAppX,
  })
  const majorVersion = runtimeState.tailwindRuntime.majorVersion
  const effectiveRawSource = stripUnmatchedTailwindSourceMediaCloseFragments(
    stripTailwindSourceMediaFragments(
      normalizeTailwindSourceDirectives(rawSource, {
        importFallback: generatorOptions.importFallback,
      }),
    ),
  )
  const localImportParts = splitLocalCssImports(effectiveRawSource)
  const localImports = options.restoreLocalCssImports === false
    ? undefined
    : localImportParts?.imports
  const generatorRawSource = localImportParts?.source ?? effectiveRawSource
  const rawUserSource = userRawSource === undefined
    ? generatorRawSource
    : userRawSourceProcessed
      ? userRawSource
      : stripUnmatchedTailwindSourceMediaCloseFragments(
          stripTailwindSourceMediaFragments(
            normalizeTailwindSourceDirectives(userRawSource, {
              importFallback: generatorOptions.importFallback,
            }),
          ),
        )
  const userLocalImportParts = splitLocalCssImports(rawUserSource)
  const userSource = userLocalImportParts?.source ?? rawUserSource
  const userCssRawSource = majorVersion === 4
    ? removeTailwindV4GeneratorAtRules(userSource)
    : userSource
  const userCssOrderSource = GENERATOR_PLACEHOLDER_MARKER_RE.test(userSource)
    ? userSource
    : userCssRawSource
  const hasDistinctUserRawSource = typeof userRawSource === 'string'
    && normalizeCssSourceForCompare(userCssRawSource) !== normalizeCssSourceForCompare(generatorRawSource)

  const cleanedLocalImportWrapper = cleanLocalCssImportWrapperTailwindDirectives(effectiveRawSource)
  if (cleanedLocalImportWrapper !== undefined) {
    return {
      css: shouldUseMiniProgramCssBranch(generatorBranch)
        ? removeUnsupportedMiniProgramAtRules(cleanedLocalImportWrapper)
        : cleanedLocalImportWrapper,
      target: generatorOptions.target,
      source: 'generator',
      dependencies: [],
    }
  }

  if (isPureLocalCssImportWrapper(effectiveRawSource)) {
    return undefined
  }

  const hasGeneratedCss = hasTailwindGeneratedCss(generatorRawSource)
  const hasSourceDirectives = hasTailwindSourceDirectives(generatorRawSource, {
    importFallback: generatorOptions.importFallback,
  })
  const hasGeneratedMarkers = hasTailwindGeneratedCssMarkers(generatorRawSource)
  const shouldGenerateCurrentCss = shouldUseGeneratorForCurrentCss(majorVersion, cssHandlerOptions, {
    forceGenerator: options.forceGenerator,
    hasGeneratedCss,
    hasGeneratedMarkers,
    hasSourceDirectives,
    rawSource: generatorRawSource,
  })

  if (
    !isSupportedGeneratorMajorVersion(majorVersion)
    || !shouldGenerateCurrentCss
    || (
      majorVersion === 3
      && !cssHandlerOptions.isMainChunk
      && !hasSourceDirectives
      && !hasGeneratedCss
      && !hasGeneratedMarkers
    )
  ) {
    return undefined
  }

  try {
    await runtimeState.readyPromise
    const currentCssCandidates = majorVersion === 4
      ? await extractSourceCandidates(generatorRawSource, 'css', {
          ...(generatorOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: generatorOptions.bareArbitraryValues }),
        })
      : []
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
        cssEntries: opts.cssEntries,
        cssSources: options.cssSources,
        getSourceCandidatesForEntries,
        runtime: runtimeWithCurrentCss,
      },
    )
    const generatorStyleOptions = resolveGeneratorStyleOptions(opts, cssHandlerOptions, generatorOptions.styleOptions)
    const configuredContainerCompat = hasConfiguredContainerCompatSources(sources)
    const sourceConcurrency = resolveGeneratorSourceConcurrency()
    const generatedResultsWithDeferred = await runWithConcurrency(sources.map(source => async () => {
      const generator = createWeappTailwindcssGenerator(source)
      const sourceEntries = getSourceCandidatesForEntries && (majorVersion === 3 || majorVersion === 4)
        ? await resolveGeneratorSourceEntries(source, runtimeState)
        : undefined
      const scopedRuntime = sourceEntries && sourceEntries.length > 0
        ? getSourceCandidatesForEntries?.(sourceEntries)
        : undefined
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
      const generatorRuntime = majorVersion === 4 && shouldUseMiniProgramCssBranch(generatorBranch)
        ? filterUnsupportedMiniProgramTailwindV4Candidates(sourceRuntime)
        : sourceRuntime
      const useIncrementalCache = majorVersion === 3 || majorVersion === 4
      return generator.generate({
        bareArbitraryValues: generatorOptions.bareArbitraryValues,
        candidates: generatorRuntime,
        incrementalCache: useIncrementalCache,
        scanSources: shouldScanTailwindV4Sources(
          majorVersion,
          generatorOptions.target,
          generatorRuntime,
          isolateCssSource,
        ),
        styleOptions: generatorStyleOptions,
        tailwindcssV3Compatibility: generatorOptions.tailwindcssV3Compatibility,
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
    const canAppendIncrementalCss = generated.target !== 'weapp' || !hasUserCssLayerBlocks(generatorRawSource)
    if (canAppendIncrementalCss && typeof options.previousCss === 'string' && typeof generated.incrementalCss === 'string') {
      const incrementalCss = stripTailwindBanner(generated.incrementalCss)
      const css = incrementalCss.trim().length > 0
        ? createCssAppend(options.previousCss, finalizeMiniProgramGeneratorCss(incrementalCss, generated.target, majorVersion, opts.cssPreflight, {
            injectPreflight: false,
            styleOptions: generatorStyleOptions,
          }))
        : options.previousCss
      return {
        css: restoreLocalCssImports(css, localImports),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
        incremental: true,
      }
    }
    const shouldFilterApplyOnlyCss = shouldFilterApplyOnlyGeneratedCss(
      majorVersion,
      generated.target,
      generatorRawSource,
      {
        hasGeneratedCss,
        hasGeneratedMarkers,
      },
    )
    const generatedCss = shouldFilterApplyOnlyCss
      ? filterApplyOnlyGeneratedCss(stripTailwindBanner(generated.css), generatorRawSource)
      : stripTailwindBanner(generated.css)
    const hasMatchedCssSourceFile = sources.some(source => (source as GeneratorResolvedSource).__weappTailwindcssMeta?.matchedCssSourceFile)
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
        && afterLayerParts.layer.trim().length === 0
        && hasUserCssLayerBlocks(userCssRawSource)
        ? await transformGeneratorUserCss(splitUserCssLayerBlocks(userCssRawSource).layer, userCssOptions)
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
      if (isEmptyCssSourceOrderParts(orderedExtraCss) && shouldAppendWebBundleCssFallback(generated.target, {
        hasSourceDirectives,
        hasMatchedCssSourceFile,
      })) {
        const userCss = await transformGeneratorUserCss(userCssRawSource, userCssOptions)
        css = createCssSourceOrderAppend(css, userCss)
      }
      if (
        generated.target === 'weapp'
        && isEmptyCssSourceOrderParts(orderedExtraCss)
        && hasDistinctUserRawSource
        && !hasGeneratedCss
        && !hasGeneratedMarkers
        && !hasTailwindApplyDirective(userCssRawSource)
      ) {
        const userCss = await transformGeneratorUserCss(userCssRawSource, userCssOptions)
        const missingUserCss = isCssAlreadyRepresentedByMarkers(css, userCssRawSource)
          ? filterExistingCssRules(css, userCss)
          : userCss
        css = createCssSourceOrderAppend(css, missingUserCss)
      }
      if (generated.target === 'weapp' && shouldAppendMatchedCssSourceCompat) {
        if (shouldFinalizeMarkedUserLayerComponentsCss(file)) {
          css = reorderMarkedUserLayerComponentsCss(css)
        }
        if (!shouldFilterApplyOnlyCss && !userRawSourceProcessed) {
          css = await appendLegacyCompatCss(
            css,
            userCssRawSource,
            generated.target,
            styleHandler,
            cssHandlerOptions,
            generatorStyleOptions,
          )
          if (!isolateCurrentCssCandidates) {
            css = await appendLegacyContainerCompatCss(
              css,
              userCssRawSource,
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
      return {
        css: restoreLocalCssImports(
          finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight, {
            injectPreflight: shouldInjectMiniProgramPreflightForGeneratorCss(opts, {
              cssHandlerOptions,
              isolateCurrentCssCandidates,
              localImports,
            }),
            styleOptions: generatorStyleOptions,
          }),
          localImports,
        ),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
      }
    }

    debug(
      'tailwind direct css generation prefix mismatch, append transformed bundle css %s',
      file,
    )
    let css = generatedCss
    if (
      majorVersion === 4
      && generated.target === 'weapp'
      && generatorRawSource.includes('weapp-tailwindcss generator-placeholder')
      && !hasUserCssLayerBlocks(generatorRawSource)
    ) {
      const userCss = await transformGeneratorUserCss(userCssRawSource, {
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
    }
    if (hasMatchedCssSourceFile || generated.target === 'web') {
      if (
        generated.target === 'weapp'
        && !hasGeneratedCss
        && !hasGeneratedMarkers
      ) {
        const userCss = await transformGeneratorUserCss(userCssRawSource, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        })
        const missingUserCss = isCssAlreadyRepresentedByMarkers(css, userCssRawSource)
          ? filterExistingCssRules(css, userCss)
          : userCss
        css = createCssSourceOrderAppend(css, missingUserCss)
      }
      else if (hasMatchedCssSourceFile && generated.target === 'weapp' && hasUserCssLayerBlocks(userCssRawSource)) {
        const layerUserCss = await transformGeneratorUserCss(splitUserCssLayerBlocks(userCssRawSource).layer, {
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
        if (!isolateCurrentCssCandidates && !shouldFilterApplyOnlyCss && !userRawSourceProcessed) {
          css = await appendLegacyContainerCompatCss(
            css,
            userCssRawSource,
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
      if (shouldAppendWebBundleCssFallback(generated.target, {
        hasSourceDirectives,
        hasMatchedCssSourceFile,
      })) {
        const userCss = await transformGeneratorUserCss(userCssRawSource, {
          generatorTarget: generated.target,
          generatorStyleOptions,
          cssUserHandlerOptions,
          styleHandler,
          importFallback: generatorOptions.importFallback,
          processed: userRawSourceProcessed,
        })
        css = createCssSourceOrderAppend(css, userCss)
      }
      return {
        css: restoreLocalCssImports(
          finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight, {
            injectPreflight: shouldInjectMiniProgramPreflightForGeneratorCss(opts, {
              cssHandlerOptions,
              isolateCurrentCssCandidates,
              localImports,
            }),
            styleOptions: generatorStyleOptions,
          }),
          localImports,
        ),
        target: generated.target,
        source: 'generator',
        dependencies: generated.dependencies,
      }
    }
    if (!shouldFilterApplyOnlyCss && !userRawSourceProcessed) {
      css = await appendLegacyCompatCss(
        css,
        userCssRawSource,
        generated.target,
        styleHandler,
        cssHandlerOptions,
        generatorStyleOptions,
      )
      css = await appendLegacyContainerCompatCss(
        css,
        userCssRawSource,
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
      && !hasTailwindApplyDirective(userCssRawSource)
    ) {
      const userCss = await transformGeneratorUserCss(userCssRawSource, {
        generatorTarget: generated.target,
        generatorStyleOptions,
        cssUserHandlerOptions,
        styleHandler,
        importFallback: generatorOptions.importFallback,
        processed: userRawSourceProcessed,
      })
      const missingUserCss = isCssAlreadyRepresentedByMarkers(css, userCssRawSource)
        ? filterExistingCssRules(css, userCss)
        : userCss
      css = createCssSourceOrderAppend(css, missingUserCss)
    }
    return {
      css: restoreLocalCssImports(
        finalizeMiniProgramGeneratorCss(css, generated.target, majorVersion, opts.cssPreflight, {
          injectPreflight: shouldInjectMiniProgramPreflightForGeneratorCss(opts, {
            cssHandlerOptions,
            isolateCurrentCssCandidates,
            localImports,
          }),
          styleOptions: generatorStyleOptions,
        }),
        localImports,
      ),
      target: generated.target,
      source: 'generator',
      dependencies: generated.dependencies,
    }
  }
  catch (error) {
    debug('tailwind direct css generation failed: %s %O', file, error)
    throw error
  }

  return undefined
}
