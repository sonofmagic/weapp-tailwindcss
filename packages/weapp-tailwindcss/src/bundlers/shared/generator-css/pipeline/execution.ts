import type { GeneratorSourceRecord } from '../source-resolver'
import type { GenerateCssByGeneratorResult } from '../types'
import type { GeneratorPipelineExecutionContext, GeneratorPipelineOutputContext } from './context'
import type { CompilationScopeDependency } from '@/compiler'
import process from 'node:process'
import { extractSourceCandidates } from '@tailwindcss-mangle/engine'
import { getCompilationSessionPool } from '@/compiler'
import { getTailwindGenerationSessionPool } from '@/compiler/tailwind-generation-session-pool'
import { shouldUseMiniProgramCssBranch } from '@/runtime-branch'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { includesTailwindV4PreflightDirective } from '@/tailwindcss/v4/preflight'
import { runWithConcurrency } from '../../run-tasks'
import { isSourceStyleRequest } from '../../style-requests'
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

function resolveCompilationSourceId(record: GeneratorSourceRecord, index: number) {
  const sourceId = record.metadata.matchedCssSourceFile
    ?? record.source.dependencies[0]
    ?? record.source.base
  return `${sourceId}:tailwind-source:${index}`
}

function resolveCompilationDependencies(record: GeneratorSourceRecord): CompilationScopeDependency[] {
  return [...new Set(record.source.dependencies)].map(id => ({
    id,
    kind: isSourceStyleRequest(id) ? 'css' : 'config',
  }))
}

export async function executeGeneratorPipeline(
  context: GeneratorPipelineExecutionContext,
): Promise<GenerateCssByGeneratorResult | undefined> {
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
  const sourceRecords = await resolveGeneratorSources(
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
  const generatorSourceRecords = useMiniProgramCssBranch
    ? sourceRecords.map(record => ({
        ...record,
        source: normalizeGeneratorSource(record.source),
      }))
    : sourceRecords
  const generatorStyleOptions = resolveGeneratorStyleOptions(opts, cssHandlerOptions, generatorOptions.styleOptions)
  const configuredContainerCompat = hasConfiguredContainerCompatSources(
    generatorSourceRecords.map(record => record.source),
  )
  const sourceConcurrency = resolveGeneratorSourceConcurrency()
  const generationSession = getTailwindGenerationSessionPool(runtimeState)
  const preparedGenerationInputs = (await runWithConcurrency(generatorSourceRecords.map((record, index) => async () => {
    const { metadata: sourceMetadata, source } = record
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
      ? await resolveGeneratorSourceEntries(record, runtimeState)
      : undefined
    const sourceScopedRuntime = sourceEntries && sourceEntries.length > 0
      ? getSourceCandidatesForEntries?.(sourceEntries)
      : undefined
    const scopedRuntime = resolveScopedRuntimeCandidates(options.sourceCandidates, sourceScopedRuntime)
    const isolateCssSource = shouldIsolateScopedCssSource(majorVersion, record, sourceEntries, {
      cssHandlerOptions,
      target: generatorOptions.target,
    })
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
    return {
      generatorRuntime,
      generatorSource,
      dependencies: resolveCompilationDependencies(record),
      isolateCssSource,
      sourceId: resolveCompilationSourceId(record, index),
    }
  }), sourceConcurrency)).filter((item): item is NonNullable<typeof item> => Boolean(item))
  const generatePreparedInputs = async (candidateSets?: Map<string, Set<string>>) => {
    return runWithConcurrency(preparedGenerationInputs.map(input => async () => {
      const currentCandidates = candidateSets?.get(input.sourceId) ?? input.generatorRuntime
      return generationSession.generate(input.generatorSource, {
        bareArbitraryValues: generatorOptions.bareArbitraryValues,
        candidates: currentCandidates,
        incrementalCache: true,
        scanSources: options.disableSourceScan === true
          ? false
          : shouldScanTailwindV4Sources(
              majorVersion,
              generatorOptions.target,
              currentCandidates,
              input.isolateCssSource,
            ),
        styleOptions: generatorStyleOptions,
        target: generatorOptions.target,
      })
    }), sourceConcurrency)
  }
  let compilationRevision: number | undefined
  let generated
  if (options.compilation?.enabled) {
    const compilationPool = getCompilationSessionPool(runtimeState)
    const execution = await compilationPool.run({
      scope: options.compilation.scope,
      outputId: options.outputFile ?? file,
      sources: preparedGenerationInputs.map(input => ({
        id: input.sourceId,
        kind: 'css',
        content: input.generatorSource.css,
        candidates: input.generatorRuntime,
        dependencies: input.dependencies,
      })),
      preserveDeletedCss: options.compilation.preserveDeletedCss,
    }, async (compilation) => {
      const results = await generatePreparedInputs(compilation.candidatesBySource)
      return mergeGeneratorResults(results)
    })
    if (!execution.committed) {
      debug(
        'discard stale graph compilation result: %s revision=%d',
        file,
        execution.compilation.revision,
      )
      return undefined
    }
    generated = execution.value
    compilationRevision = execution.compilation.revision
  }
  else {
    generated = mergeGeneratorResults(await generatePreparedInputs())
  }
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
  const hasMatchedCssSourceFile = generatorSourceRecords.some(record => record.metadata.matchedCssSourceFile)
  const hasExplicitCssSource = generatorSourceRecords.some(({ metadata }) => {
    return metadata?.candidateMatchedCssSource !== true
      && (metadata?.cssEntryIndex !== undefined || metadata?.cssSourceIndex !== undefined)
  })
  const hasPreflightCssSource = generatorSourceRecords.some(({ metadata }) => {
    const appEntryMatchedByCandidates = metadata?.candidateMatchedCssSource === true
      && metadata.cssEntryIndex === 0
      && metadata.cssSourceIndex === undefined
    return metadata?.includesPreflight === true
      && !appEntryMatchedByCandidates
  })
  const hasPreflightRawSource = includesTailwindV4PreflightDirective(generatorRawSource)
  const hasOnlyPrimaryCssSource = generatorSourceRecords.length > 0
    && generatorSourceRecords.every(({ metadata }) => {
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
  const outputContext: GeneratorPipelineOutputContext = {
    ...context,
    configuredContainerCompat,
    filterGeneratedApplyOnlyCss,
    generated,
    generatedCss: filterGeneratedApplyOnlyCss(
      generated.target === 'web' ? generated.css : stripTailwindBanner(generated.css),
    ),
    generatorStyleOptions,
    hasMatchedCssSourceFile,
    isolateCurrentCssCandidates,
    preflightMode,
    runtimeWithCurrentCss,
    shouldFilterApplyOnlyCss,
  }
  const withCompilationMetadata = (result: typeof generated | undefined) => {
    if (!result || compilationRevision === undefined) {
      return result
    }
    return {
      ...result,
      metadata: {
        ...result.metadata,
        revision: compilationRevision,
      },
    }
  }
  if (options.deferCssAdaptation) {
    return withCompilationMetadata(await finalizeDeferredGeneratorCss(outputContext))
  }
  const ordered = await finalizeOrderedGeneratorCss(outputContext)
  return withCompilationMetadata(ordered ?? await finalizeFallbackGeneratorCss(outputContext))
}
