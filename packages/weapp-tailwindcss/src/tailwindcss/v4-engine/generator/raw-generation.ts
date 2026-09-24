import type { TailwindV4GenerateOptions, TailwindV4ResolvedSource } from '../types'
import type { TailwindV4NativeSessionPool } from './native-session'
import { createTailwindV4Engine as createEngineTailwindV4Engine, extractRawCandidates } from '@weapp-tailwindcss/engine'
import { resolveCssMacroTailwindV4Source } from '../css-macro-source'
import { transformTailwindV4CssByTarget } from '../miniprogram'
import { createCompatibleSource } from './css-compat'
import { collectCandidates, createTailwindV4SourceCacheKey, normalizeTargetRpxLengthCandidates, resolveStyleOptions, resolveTargetCandidates } from './incremental-cache'
import { createEngineSourceEntries, serializeTailwindGenerationArtifact } from './native-session'
import { restoreRpxLengthCandidates, restoreRpxLengthCssSelectors } from './rpx-candidates'
import { resolveCompiledSourceRoot, resolveScanSources } from './scan-sources'
import { resolveGenerationStyleContext } from './style-context'

function isCssSyntaxError(error: unknown) {
  return error instanceof Error && error.name === 'CssSyntaxError'
}

/** 原生生成会话负责按当前候选产出完整主题、utility 和运行时依赖。 */
export async function generateRawArtifact(
  generationSessions: TailwindV4NativeSessionPool,
  generateSource: TailwindV4ResolvedSource,
  options: TailwindV4GenerateOptions = {},
) {
  const {
    scanSources = true,
    styleOptions,
    target = 'weapp',
    ...patchOptions
  } = options
  const resolvedStyleOptions = resolveStyleOptions(generateSource, styleOptions)
  const cssMacroSource = resolveCssMacroTailwindV4Source(generateSource)
  const compatibleSource = createCompatibleSource(cssMacroSource, target)
  const compiledScan = options.scanMode === 'compiled'
  const resolvedScanSources = compiledScan ? undefined : await resolveScanSources(generateSource, scanSources)
  const filesystemCandidates = Array.isArray(resolvedScanSources)
    ? new Set(await extractRawCandidates(resolvedScanSources, {
        ...(patchOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: patchOptions.bareArbitraryValues }),
      }))
    : undefined
  const resolvedCandidates = resolveTargetCandidates(new Set([
    ...collectCandidates(patchOptions.candidates),
    ...(filesystemCandidates ?? []),
  ]), target)
  let normalizedCandidates = normalizeTargetRpxLengthCandidates(resolvedCandidates, target, resolvedStyleOptions)
  const sourceId = compatibleSource.dependencies[0] ?? compatibleSource.base
  const generationRequest = {
    ...(compiledScan
      ? {
          scanSources,
          excludeFiles: options.excludeFiles ?? [],
          prepareCandidates: (candidates: Set<string>) => {
            normalizedCandidates = normalizeTargetRpxLengthCandidates(resolveTargetCandidates(candidates, target), target, resolvedStyleOptions)
            return normalizedCandidates.candidates
          },
        }
      : {}),
    ...(patchOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: patchOptions.bareArbitraryValues }),
    ...(patchOptions.sources === undefined
      ? {}
      : { sourceEntries: createEngineSourceEntries(patchOptions.sources, sourceId) }),
    candidates: compiledScan ? resolvedCandidates : normalizedCandidates.candidates,
  }
  let generatedCss: string
  let classSet: Set<string>
  let rawCandidates: Set<string>
  let dependencies: string[]
  try {
    const artifact = await generationSessions.generate(
      target,
      createTailwindV4SourceCacheKey(compatibleSource),
      compatibleSource,
      generationRequest,
    )
    generatedCss = serializeTailwindGenerationArtifact(artifact)
    classSet = artifact.classSet
    rawCandidates = artifact.rawCandidates
    dependencies = artifact.dependencies
  }
  catch (error) {
    if (compiledScan || !isCssSyntaxError(error)) {
      throw error
    }
    const legacyEngine = createEngineTailwindV4Engine(compatibleSource)
    try {
      const legacyResult = await legacyEngine.generate({
        ...(patchOptions.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: patchOptions.bareArbitraryValues }),
        ...(patchOptions.sources === undefined ? {} : { sources: patchOptions.sources }),
        candidates: normalizedCandidates.candidates,
        scanSources: false,
      })
      generatedCss = legacyResult.css
      classSet = legacyResult.classSet
      rawCandidates = legacyResult.rawCandidates
      dependencies = legacyResult.dependencies
    }
    finally {
      legacyEngine.dispose?.()
    }
  }
  const sources = Array.isArray(resolvedScanSources) ? resolvedScanSources : []
  const rawCss = restoreRpxLengthCssSelectors(
    generatedCss,
    normalizedCandidates.restoreCandidates,
  )
  return {
    classSet: restoreRpxLengthCandidates(classSet, normalizedCandidates.restoreCandidates),
    rawCandidates: restoreRpxLengthCandidates(rawCandidates, normalizedCandidates.restoreCandidates),
    dependencies,
    root: resolveCompiledSourceRoot(compatibleSource),
    sources,
    rawCss,
    target,
    styleContext: resolveGenerationStyleContext(compatibleSource.css, rawCss, resolvedStyleOptions),
  }
}

export async function transformGeneratedArtifact(artifact: Awaited<ReturnType<typeof generateRawArtifact>>) {
  const { styleContext, ...generated } = artifact
  const css = await transformTailwindV4CssByTarget(generated.rawCss, generated.target, styleContext)
  return {
    ...generated,
    css,
    customPropertyContextCss: styleContext?.customPropertyContextCss,
    ...(styleContext?.customPropertyValues
      ? { customPropertyValues: new Map(styleContext.customPropertyValues) }
      : {}),
  }
}
