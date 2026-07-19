import type { ViteCssAssetIdentityKind } from '../css-asset-identity'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../../shared/generated-css-marker'
import { hasTailwindApplyDirective } from '../../shared/generator-css/directives'
import { createCssRuntimeSignature } from './css-share-scope'
import { createRememberedCssRuntimeSignature } from './remembered-css'
import { hasTailwindGenerationSource } from './sfc-style-source'

export interface ResolveViteCssTransformDecisionPlanOptions {
  alreadyProcessedCssAsset: boolean
  cssAssetIdentityKind: ViteCssAssetIdentityKind
  cssIsMainChunk: boolean
  generatorCandidateSignatureInitialized: boolean
  generatorCandidatesChanged: boolean
  generatorRawSource: string
  hasCurrentTailwindGenerationDirective: boolean
  hasRememberedApplySource: boolean
  hasRuntimeAffectingChanges: boolean
  hasSameOutputRememberedTailwindGenerationSource: boolean
  hasStaleViteProcessedCssSource: boolean
  isCollectedBundlerGeneratedCssFile: boolean
  isProcessCssFile: boolean
  isRuntimeLinkedCss: boolean
  rawSource: string
  rememberedRawSource?: string | undefined
  shouldProcessTailwindGeneration: boolean
  shouldRegenerateMainPackageCssWithScopedCandidates: boolean
  useIncrementalMode: boolean
  vitePipelineCssAsset: boolean
  viteProcessedCssAsset: boolean
}

export interface ViteCssTransformDecisionPlan {
  shouldPreserveCollectedViteCssAsset: boolean
  shouldPreserveStaleGeneratedCssAsset: boolean
  shouldRefreshViteProcessedCssByCandidates: boolean
  shouldRegenerateCollectedViteCss: boolean
  shouldReplayLastCss: boolean
  shouldReuseProcessedCss: boolean
  shouldTrackGeneratorRuntime: boolean
  strippedViteProcessedCss: string
}

export function resolveViteCssTransformDecisionPlan(
  options: ResolveViteCssTransformDecisionPlanOptions,
): ViteCssTransformDecisionPlan {
  const hasRememberedTailwindGenerationSource = options.rememberedRawSource != null
    && hasTailwindGenerationSource(options.rememberedRawSource)
  const shouldRegenerateCollectedViteCss = options.viteProcessedCssAsset
    && options.useIncrementalMode
    && options.generatorCandidateSignatureInitialized
    && options.generatorCandidatesChanged
    && (
      hasTailwindGenerationSource(options.generatorRawSource)
      || hasBundlerGeneratedCssMarker(options.rawSource)
      || hasRememberedTailwindGenerationSource
    )
  const shouldRefreshViteProcessedCssByCandidates = options.viteProcessedCssAsset
    && options.useIncrementalMode
    && options.generatorCandidateSignatureInitialized
    && options.generatorCandidatesChanged
  const hasRuntimeAffectingTrackedAsset = options.hasRuntimeAffectingChanges
    && (options.alreadyProcessedCssAsset || options.vitePipelineCssAsset)
  const shouldTrackForTailwindGeneration = options.shouldProcessTailwindGeneration
    && (
      !options.useIncrementalMode
      || options.cssIsMainChunk
      || options.isProcessCssFile
      || options.isRuntimeLinkedCss
      || shouldRegenerateCollectedViteCss
      || hasRuntimeAffectingTrackedAsset
    )
  const shouldTrackGeneratorRuntime = options.hasStaleViteProcessedCssSource
    || options.shouldRegenerateMainPackageCssWithScopedCandidates
    || options.hasCurrentTailwindGenerationDirective
    || options.hasSameOutputRememberedTailwindGenerationSource
    || shouldTrackForTailwindGeneration
  const shouldPreserveCollectedViteCssAsset = !shouldRegenerateCollectedViteCss
    && (!options.generatorCandidateSignatureInitialized || !options.generatorCandidatesChanged)
    && (
      options.isCollectedBundlerGeneratedCssFile
      || hasBundlerGeneratedCssMarker(options.rawSource)
    )
  const strippedViteProcessedCss = stripBundlerGeneratedCssMarkers(options.rawSource)
  const shouldPreserveStaleGeneratedCssAsset = options.hasStaleViteProcessedCssSource
    && shouldPreserveCollectedViteCssAsset
    && strippedViteProcessedCss.trim().length > 0
    && options.cssAssetIdentityKind !== 'generator-placeholder'
    && !hasTailwindGenerationSource(strippedViteProcessedCss)
    && !hasTailwindApplyDirective(strippedViteProcessedCss)
  const shouldReuseProcessedCss = options.alreadyProcessedCssAsset
    && !shouldRefreshViteProcessedCssByCandidates
    && (
      !options.hasStaleViteProcessedCssSource
      || shouldPreserveStaleGeneratedCssAsset
    )
    && !options.hasRememberedApplySource
    && !options.shouldRegenerateMainPackageCssWithScopedCandidates
    && (!shouldTrackGeneratorRuntime || shouldPreserveCollectedViteCssAsset)

  return {
    shouldPreserveCollectedViteCssAsset,
    shouldPreserveStaleGeneratedCssAsset,
    shouldRefreshViteProcessedCssByCandidates,
    shouldRegenerateCollectedViteCss,
    shouldReplayLastCss: !shouldTrackGeneratorRuntime && !options.isRuntimeLinkedCss,
    shouldReuseProcessedCss,
    shouldTrackGeneratorRuntime,
    strippedViteProcessedCss,
  }
}

export interface ResolveViteCssTransformCachePlanOptions {
  cssIsMainChunk: boolean
  cssRuntimeAffectingHash: string
  cssShareScope: string
  linkedImpactSignature: string
  outputFile: string
  runtimeSignature: string
  scopedGeneratorCandidateSignature: string
  sourceTraceSignature: string
  tailwindcssMajorVersion?: number | undefined
}

export interface ViteCssTransformCachePlan {
  cssCacheKey: string
  cssHashKey: string
  cssRuntimeSignature: string
  cssSharedCacheKey: string
  cssTaskHash: string
  rememberedCssRuntimeSignature: string
}

export function resolveViteCssTransformCachePlan(
  options: ResolveViteCssTransformCachePlanOptions,
): ViteCssTransformCachePlan {
  const cssRuntimeSignature = createCssRuntimeSignature(
    options.runtimeSignature,
    options.scopedGeneratorCandidateSignature,
  )
  const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(
    cssRuntimeSignature,
    options.cssRuntimeAffectingHash,
  )
  const tailwindcssMajorVersion = options.tailwindcssMajorVersion ?? 'unknown'

  return {
    cssCacheKey: options.outputFile,
    cssHashKey: `${options.outputFile}:css:${cssRuntimeSignature}:${tailwindcssMajorVersion}`,
    cssRuntimeSignature,
    cssSharedCacheKey: [
      options.cssShareScope,
      cssRuntimeSignature,
      tailwindcssMajorVersion,
      options.cssIsMainChunk ? '1' : '0',
      options.cssRuntimeAffectingHash,
      options.scopedGeneratorCandidateSignature,
      options.sourceTraceSignature,
    ].join(':'),
    cssTaskHash: [
      options.cssRuntimeAffectingHash,
      options.scopedGeneratorCandidateSignature,
      options.sourceTraceSignature,
      options.linkedImpactSignature,
    ].join(':'),
    rememberedCssRuntimeSignature,
  }
}

export interface ResolveViteCssLinkedImpactSignatureOptions {
  changedHtmlFiles: ReadonlySet<string>
  changedJsFiles: ReadonlySet<string>
  runtimeAffectingSignatureByFile: ReadonlyMap<string, string>
}

export function resolveViteCssLinkedImpactSignature(
  options: ResolveViteCssLinkedImpactSignatureOptions,
) {
  return [
    ...[...options.changedHtmlFiles]
      .sort()
      .map(file => options.runtimeAffectingSignatureByFile.get(file) ?? ''),
    ...[...options.changedJsFiles]
      .sort()
      .map(file => options.runtimeAffectingSignatureByFile.get(file) ?? ''),
  ].join(':')
}
