import type { GeneratorResolvedSource } from '../source-resolver'
import process from 'node:process'
import { extractSourceCandidates } from '@tailwindcss-mangle/engine'
import { getTailwindGenerationSession } from '@/compiler/tailwind-generation-session'
import { shouldUseMiniProgramCssBranch } from '@/runtime-branch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { includesTailwindV4PreflightDirective } from '@/tailwindcss/v4/preflight'
import { runWithConcurrency } from '../../run-tasks'
import { removeTailwindSourceDirectives } from '../directives'
import { createRuntimeWithCurrentCssCandidates, mergeGeneratorResults, mergeScopedRuntimeWithCurrentRuntime, resolveGeneratorStyleOptions, resolveMiniProgramPreflightModeForGeneratorCss, shouldIsolateCurrentTailwindV4CssCandidates, shouldIsolateScopedCssSource, shouldScanTailwindV4Sources } from '../generation-helpers'
import { hasConfiguredContainerCompatSources } from '../legacy-compat'
import { removeMatchingLocalCssImports } from '../local-imports'
import { stripTailwindBanner } from '../markers'
import { resolveGeneratorSourceEntries, resolveGeneratorSources } from '../source-resolver'
import { filterApplyOnlyGeneratedCss, shouldFilterApplyOnlyGeneratedCss } from '../user-css'
import { finalizeDeferredGeneratorCss } from './deferred-output'
import { finalizeFallbackGeneratorCss } from './fallback-output'
import { finalizeOrderedGeneratorCss } from './ordered-output'

function resolveGeneratorSourceConcurrency() {
  const configured = Number.parseInt(process.env['WEAPP_TW_GENERATOR_SOURCE_CONCURRENCY'] ?? '', 10)
  return Number.isFinite(configured) && configured > 0 ? configured : 1
}

function resolveScopedRuntimeCandidates(sourceCandidates: Set<string> | undefined, sourceScopedRuntime: Set<string> | undefined) {
  if (!sourceCandidates) {
    return sourceScopedRuntime
  }
  if (!sourceScopedRuntime) {
    return sourceCandidates
  }
  if (sourceCandidates.size === 0) {
    return sourceScopedRuntime
  }
  const [small, large] = sourceCandidates.size <= sourceScopedRuntime.size ? [sourceCandidates, sourceScopedRuntime] : [sourceScopedRuntime, sourceCandidates]
  return new Set([...small].filter(candidate => large.has(candidate)))
}

export async function executeGeneratorPipeline(context: any) {
  const {
    cssHandlerOptions,
    debug,
    file,
    generatorBranch,
    generatorOptions,
    generatorRawSource,
    getSourceCandidatesForEntries,
    hasGeneratedCss,
    hasGeneratedMarkers,
    localImports,
    majorVersion,
    normalizeGeneratorSource,
    normalizedCssSources,
    options,
    opts,
    runtime,
    runtimeState,
    useMiniProgramCssBranch,
  } = context
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
  const generationSession = getTailwindGenerationSession(runtimeState)
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
    return generationSession.generate(generatorSource, {
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
  const outputContext = {
    ...context,
    configuredContainerCompat,
    filterGeneratedApplyOnlyCss,
    generated,
    generatedCss: filterGeneratedApplyOnlyCss(
      generated.target === 'web' ? generated.css : stripTailwindBanner(generated.css),
    ),
    generatorSources,
    generatorStyleOptions,
    hasMatchedCssSourceFile,
    isolateCurrentCssCandidates,
    preflightMode,
    runtimeWithCurrentCss,
    shouldFilterApplyOnlyCss,
  }
  if (options.deferCssAdaptation) {
    return finalizeDeferredGeneratorCss(outputContext)
  }
  const ordered = await finalizeOrderedGeneratorCss(outputContext)
  return ordered ?? finalizeFallbackGeneratorCss(outputContext)
}
