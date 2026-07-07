import type { OutputAsset, OutputChunk } from 'rollup'
import type { BundleMetrics } from './metrics'
import type { GenerateBundleContext, RememberedCssSource } from './types'
import { annotateCssSourceTrace, createCssTokenSourceMap } from '../../shared/css-source-trace'
import { generateTailwindV4Css } from '../../shared/v4-generation-core'
import { createRuntimeAffectingSourceSignature } from '../runtime-affecting-signature'
import { isHTMLRequest } from '../utils'
import { createCssRuntimeSignature } from './css-share-scope'
import { measureElapsed } from './metrics'
import { collectRememberedCssReplayGroups, createRememberedCssRuntimeSignature, mergeRememberedCssSources } from './remembered-css'
import { registerGeneratorDependencies } from './rollup-assets'
import { createScopedGeneratorCandidateSignature, createScopedGeneratorSourceTraceMap } from './scoped-generator'
import { createCandidateSignature } from './signatures'
import { getLastCssResult, getLastCssSourceHash, rememberLastCssResult } from './vite-css-cache'

interface ProcessRememberedCssReplayOptions {
  addWatchFile: (id: string) => void
  bundle: Record<string, OutputAsset | OutputChunk>
  bundleFiles: string[]
  cache: GenerateBundleContext['opts']['cache']
  changedCssFiles: Set<string>
  createScopedGeneratorRuntime: (
    outputFile: string,
    cssHandlerOptions: { isMainChunk?: boolean | undefined },
    runtime: Set<string>,
    rawSource?: string | undefined,
    sourceFile?: string | undefined,
  ) => Promise<Set<string>>
  createScopedSourceCandidateGetter: (
    outputFile: string,
    cssHandlerOptions: { isMainChunk?: boolean | undefined },
  ) => GenerateBundleContext['getSourceCandidatesForEntries']
  createScopedSourceCandidateSourceGetter: (
    outputFile: string,
    cssHandlerOptions: { isMainChunk?: boolean | undefined },
  ) => GenerateBundleContext['getSourceCandidateSourcesForEntries']
  cssTaskFactories: Array<() => Promise<void>>
  debug: GenerateBundleContext['debug']
  defaultStyleOutputExtension: string
  emitOrReplayCssAsset: (fileName: string, source: string) => OutputAsset | undefined
  generatorRuntime: Set<string>
  generatorPlatform?: string | undefined
  getCssHandlerOptions: (file: string) => ReturnType<ReturnType<typeof import('./css-handler-options').createCssHandlerOptionsCache>['getCssHandlerOptions']>
  getCssUserHandlerOptions: (file: string) => ReturnType<ReturnType<typeof import('./css-handler-options').createCssHandlerOptionsCache>['getCssUserHandlerOptions']>
  getRememberedCssSignature?: ((file: string) => string | undefined) | undefined
  getRememberedCssSources?: (() => Iterable<[string, RememberedCssSource]>) | undefined
  isNativeAppStyleTarget: boolean
  isWebGeneratorTarget: boolean
  lastCssRawSourceHashByFile: Map<string, string>
  lastCssResultByFile: Map<string, string>
  lastCssSourceHashByFile: Map<string, string>
  markCssAssetProcessed: GenerateBundleContext['markCssAssetProcessed']
  metrics: BundleMetrics
  normalizeViteCssCacheKey: (file: string) => string
  onUpdate: GenerateBundleContext['opts']['onUpdate']
  opts: GenerateBundleContext['opts']
  recordCssAssetResult: GenerateBundleContext['recordCssAssetResult']
  recordViteProcessedCssAssetResult: GenerateBundleContext['recordViteProcessedCssAssetResult']
  refreshRememberedCssSource?: GenerateBundleContext['refreshRememberedCssSource']
  rootDir: string
  runtimeState: GenerateBundleContext['runtimeState']
  setRememberedCssSignature?: ((file: string, cssRuntimeSignature: string) => void) | undefined
  shouldInjectCssIntoMainFromOutput: (
    outputFile: string,
    sourceFile: string,
    cssHandlerOptions: { isMainChunk?: boolean | undefined },
  ) => boolean
  shouldPreserveAppCssExtension: boolean
  sourceRoot: string | undefined
  styleHandler: GenerateBundleContext['opts']['styleHandler']
  timeTask: (name: string, task: () => Promise<void>) => Promise<void>
  useIncrementalMode: boolean
  activeViteCssCacheFiles: Set<string>
}

export async function processRememberedCssReplay(options: ProcessRememberedCssReplayOptions) {
  const {
    addWatchFile,
    activeViteCssCacheFiles,
    bundleFiles,
    cache,
    changedCssFiles = new Set<string>(),
    createScopedGeneratorRuntime,
    createScopedSourceCandidateGetter,
    createScopedSourceCandidateSourceGetter,
    cssTaskFactories,
    debug,
    defaultStyleOutputExtension,
    emitOrReplayCssAsset,
    generatorRuntime,
    generatorPlatform,
    getCssHandlerOptions,
    getCssUserHandlerOptions,
    getRememberedCssSignature,
    getRememberedCssSources,
    isNativeAppStyleTarget,
    isWebGeneratorTarget,
    lastCssRawSourceHashByFile = new Map<string, string>(),
    lastCssResultByFile,
    lastCssSourceHashByFile,
    markCssAssetProcessed,
    metrics,
    normalizeViteCssCacheKey,
    onUpdate,
    opts,
    recordCssAssetResult,
    recordViteProcessedCssAssetResult,
    refreshRememberedCssSource,
    rootDir,
    runtimeState,
    setRememberedCssSignature,
    shouldInjectCssIntoMainFromOutput,
    shouldPreserveAppCssExtension,
    sourceRoot,
    styleHandler,
    timeTask,
    useIncrementalMode,
  } = options
  const rememberedReplayGroups = collectRememberedCssReplayGroups(
    getRememberedCssSources?.(),
    opts,
    rootDir,
    isWebGeneratorTarget,
    shouldPreserveAppCssExtension,
    sourceRoot,
    defaultStyleOutputExtension,
    bundleFiles,
  )
  for (const [outputFile, rememberedGroup] of rememberedReplayGroups) {
    if (isHTMLRequest(outputFile) || options.opts.htmlMatcher(outputFile)) {
      continue
    }
    const refreshedRememberedGroup = await Promise.all(rememberedGroup.map(async item => ({
      key: item.key,
      remembered: await refreshRememberedCssSource?.(item.remembered) ?? item.remembered,
    })))
    const rememberedKeys = refreshedRememberedGroup.map(item => item.key)
    const rememberedCssSource = mergeRememberedCssSources(
      refreshedRememberedGroup.map(item => item.remembered),
      outputFile,
    )
    if (!rememberedCssSource) {
      continue
    }
    const { rawSource, sourceFile } = rememberedCssSource
    activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
    activeViteCssCacheFiles.add(normalizeViteCssCacheKey(sourceFile))
    const outputCssHandlerOptions = getCssHandlerOptions(outputFile)
    const cssHandlerOptions = {
      ...getCssHandlerOptions(sourceFile),
      isMainChunk: outputCssHandlerOptions.isMainChunk,
    }
    const scopedSourceCandidateGetter = createScopedSourceCandidateGetter(outputFile, cssHandlerOptions)
    const scopedSourceCandidateSourceGetter = createScopedSourceCandidateSourceGetter(outputFile, cssHandlerOptions)
    const scopedGeneratorRuntime = await createScopedGeneratorRuntime(outputFile, cssHandlerOptions, generatorRuntime, rawSource, sourceFile)
    const cssRuntimeSignature = createCssRuntimeSignature(
      createCandidateSignature(scopedGeneratorRuntime),
      await createScopedGeneratorCandidateSignature(
        rawSource,
        sourceFile,
        createCandidateSignature(scopedGeneratorRuntime),
        scopedSourceCandidateGetter,
        {
          includeFallbackSignature: cssHandlerOptions.isMainChunk,
          majorVersion: runtimeState.tailwindRuntime.majorVersion,
        },
      ),
    )
    const cssRuntimeAffectingHash = cache.computeHash(createRuntimeAffectingSourceSignature(rawSource, 'css'))
    const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(cssRuntimeSignature, cssRuntimeAffectingHash)
    const rawSourceHash = cache.computeHash(rawSource)
    const previousRawSourceHash = lastCssRawSourceHashByFile.get(outputFile)
    const cssSourceChanged = changedCssFiles.has(outputFile)
      || changedCssFiles.has(sourceFile)
      || (previousRawSourceHash != null && previousRawSourceHash !== rawSourceHash)
    const previousCss = useIncrementalMode && !cssSourceChanged && getLastCssSourceHash(lastCssSourceHashByFile, outputFile) === cssRuntimeAffectingHash
      ? getLastCssResult(lastCssResultByFile, outputFile)
      : undefined
    const allRememberedSignaturesFresh = rememberedKeys.length > 0
      && rememberedKeys.every(key => getRememberedCssSignature?.(key) === rememberedCssRuntimeSignature)
    if (bundleFiles.includes(outputFile) || bundleFiles.includes(sourceFile) || allRememberedSignaturesFresh) {
      continue
    }
    const sourceTraceSources = scopedSourceCandidateSourceGetter
      ? await createScopedGeneratorSourceTraceMap(rawSource, sourceFile, scopedSourceCandidateSourceGetter)
      : undefined
    const sourceTraceTokenSources = sourceTraceSources
      ? createCssTokenSourceMap(sourceTraceSources, opts)
      : undefined
    const annotateCss = (css: string) => annotateCssSourceTrace(css, {
      opts,
      tokenSources: sourceTraceTokenSources,
    })
    const shouldRecordRememberedReplayCss = useIncrementalMode || isNativeAppStyleTarget
    const shouldEmitRememberedReplayCssAsset = shouldRecordRememberedReplayCss
    if (!shouldRecordRememberedReplayCss) {
      continue
    }
    cssTaskFactories.push(() => timeTask('css.replay', async () => {
      const start = performance.now()
      const generated = await generateTailwindV4Css({
        opts,
        runtimeState,
        runtime: scopedGeneratorRuntime,
        rawSource,
        file: sourceFile,
        outputFile,
        cssHandlerOptions,
        cssUserHandlerOptions: getCssUserHandlerOptions(sourceFile),
        getSourceCandidatesForEntries: scopedSourceCandidateGetter,
        generatorPlatform,
        styleHandler,
        debug,
        previousCss,
      })
      const css = annotateCss(generated?.css ?? (await styleHandler(rawSource, cssHandlerOptions)).css)
      lastCssRawSourceHashByFile.set(outputFile, rawSourceHash)
      rememberLastCssResult(lastCssResultByFile, lastCssSourceHashByFile, outputFile, css, cssRuntimeAffectingHash)
      for (const key of rememberedKeys) {
        setRememberedCssSignature?.(key, rememberedCssRuntimeSignature)
      }
      if (generated) {
        registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
        recordCssAssetResult?.(outputFile, css)
        const shouldInjectReplayCssIntoMain = shouldInjectCssIntoMainFromOutput(outputFile, sourceFile, outputCssHandlerOptions)
        recordViteProcessedCssAssetResult?.(sourceFile, css, {
          injectIntoMain: outputCssHandlerOptions.isMainChunk
            ? false
            : shouldInjectReplayCssIntoMain,
          outputFile,
        })
        if (outputFile !== sourceFile) {
          recordViteProcessedCssAssetResult?.(outputFile, css, {
            injectIntoMain: outputCssHandlerOptions.isMainChunk
              ? false
              : shouldInjectReplayCssIntoMain,
            outputFile,
          })
        }
        debug('css replay generated result: %s bytes=%d', outputFile, css.length)
      }
      if (shouldEmitRememberedReplayCssAsset) {
        const replayAsset = emitOrReplayCssAsset(outputFile, css)
        if (replayAsset) {
          markCssAssetProcessed?.(replayAsset, outputFile)
        }
      }
      metrics.css.elapsed += measureElapsed(start)
      metrics.css.transformed++
      onUpdate(outputFile, rawSource, css)
      debug('css replay handle: %s', outputFile)
    }))
  }
}
