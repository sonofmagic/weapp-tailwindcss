import type { OutputAsset, OutputChunk } from 'rollup'
import type { BundleBuildState, BundleSnapshot } from '../bundle-state'
import type { BundleMetrics } from './metrics'
import type { GenerateBundleContext } from './types'
import { injectUniAppXHarmonyBundleStyles } from '@/uni-app-x/style-asset'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { runWithConcurrency } from '../../shared/run-tasks'
import { updateBundleBuildState } from '../bundle-state'
import { collectViteProcessedCssAssetResults, injectViteProcessedCssIntoMainCssAssets } from '../processed-css-assets'
import { normalizeBundleFileNameKeysForTest } from './bundle-file-names'
import { resolveViteCssPipelineOutputFile } from './css-output'
import { resolveViteMemoryDebugStats } from './memory-debug'
import { formatCacheHitRate, formatMs } from './metrics'
import { handleUniAppXPostCssTasks } from './uni-app-x-postprocess'
import { pruneLastCssResults, resolveViteCssTaskConcurrency } from './vite-css-cache'

interface FinalizeGenerateBundleOptions {
  activeProcessCacheKeys: Set<string>
  activeProcessHashKeys: Set<string | number>
  activeViteCssCacheFiles: Set<string>
  bundle: Record<string, OutputAsset | OutputChunk>
  bundleFiles: string[]
  cache: GenerateBundleContext['opts']['cache']
  cssTaskFactories: Array<() => Promise<void>>
  debug: GenerateBundleContext['debug']
  defaultStyleOutputExtension: string
  formatIteration: number
  generatorCandidateSignature: string
  generatorRuntime: Set<string>
  getCssHandlerOptions: (file: string) => ReturnType<ReturnType<typeof import('./css-handler-options').createCssHandlerOptionsCache>['getCssHandlerOptions']>
  getSourceCandidateSourcesForEntries: GenerateBundleContext['getSourceCandidateSourcesForEntries']
  getSourceCandidatesForEntries: GenerateBundleContext['getSourceCandidatesForEntries']
  getViteCssCacheStats: GenerateBundleContext['getViteCssCacheStats']
  getViteProcessedCssAssetResults: GenerateBundleContext['getViteProcessedCssAssetResults']
  hmrTimingRecorder: GenerateBundleContext['hmrTimingRecorder']
  hmrTimingStartedAt: number
  isHarmonyAppStyleTarget: boolean
  isNativeAppStyleTarget: boolean
  isViteProcessedCssAsset: GenerateBundleContext['isViteProcessedCssAsset']
  isWebGeneratorTarget: boolean
  lastCssResultByFile: Map<string, string>
  lastCssSourceHashByFile: Map<string, string>
  linkedByEntry: Map<string, Set<string>> | undefined
  markCssAssetProcessed: GenerateBundleContext['markCssAssetProcessed']
  metrics: BundleMetrics
  onEnd: GenerateBundleContext['opts']['onEnd']
  onUpdate: GenerateBundleContext['opts']['onUpdate']
  opts: GenerateBundleContext['opts']
  outDir: string
  pendingLinkedUpdates: Array<() => void>
  pruneViteCssCaches: GenerateBundleContext['pruneViteCssCaches']
  recordCssAssetResult: GenerateBundleContext['recordCssAssetResult']
  recordTimingDetail: (name: string, startedAt: number) => void
  recordViteProcessedCssAssetResult: GenerateBundleContext['recordViteProcessedCssAssetResult']
  rootDir: string
  runtime: Set<string>
  runtimeState: GenerateBundleContext['runtimeState']
  shouldPreserveAppCssExtension: boolean
  snapshot: BundleSnapshot
  sourceCandidates: Set<string>
  sourceRoot: string | undefined
  state: BundleBuildState
  styleHandler: GenerateBundleContext['opts']['styleHandler']
  tasks: Promise<void>[]
  timingDetails: Record<string, number>
  transformRuntime: Set<string>
  useIncrementalMode: boolean
}

export async function finalizeGenerateBundle(options: FinalizeGenerateBundleOptions) {
  const {
    activeProcessCacheKeys,
    activeProcessHashKeys,
    activeViteCssCacheFiles,
    bundle,
    bundleFiles,
    cache,
    cssTaskFactories,
    debug,
    defaultStyleOutputExtension,
    formatIteration,
    generatorCandidateSignature,
    generatorRuntime,
    getCssHandlerOptions,
    getSourceCandidateSourcesForEntries,
    getSourceCandidatesForEntries,
    getViteCssCacheStats,
    getViteProcessedCssAssetResults,
    hmrTimingRecorder,
    hmrTimingStartedAt,
    isHarmonyAppStyleTarget,
    isNativeAppStyleTarget,
    isViteProcessedCssAsset,
    isWebGeneratorTarget,
    lastCssResultByFile,
    lastCssSourceHashByFile,
    linkedByEntry,
    markCssAssetProcessed,
    metrics,
    onEnd,
    onUpdate,
    opts,
    pendingLinkedUpdates,
    pruneViteCssCaches,
    recordCssAssetResult,
    recordTimingDetail,
    recordViteProcessedCssAssetResult,
    rootDir,
    runtime,
    runtimeState,
    shouldPreserveAppCssExtension,
    snapshot,
    sourceCandidates,
    sourceRoot,
    state,
    styleHandler,
    tasks,
    timingDetails,
    transformRuntime,
    useIncrementalMode,
  } = options
  if (cssTaskFactories.length > 0) {
    const cssConcurrency = resolveViteCssTaskConcurrency(useIncrementalMode)
    tasks.push(runWithConcurrency(cssTaskFactories, cssConcurrency).then(() => undefined))
  }

  const tasksStart = performance.now()
  await Promise.all(tasks)
  recordTimingDetail('tasks', tasksStart)
  for (const apply of pendingLinkedUpdates) {
    apply()
  }
  const applyStyleSources = await handleUniAppXPostCssTasks({
    bundle,
    debug,
    generatorRuntime,
    getCssHandlerOptions,
    getSourceCandidateSourcesForEntries,
    getSourceCandidatesForEntries,
    getViteProcessedCssAssetResults,
    isHarmonyAppStyleTarget,
    isNativeAppStyleTarget,
    onUpdate,
    opts,
    runtimeState,
    styleHandler,
  })
  const syncViteProcessedCssIntoMainCssAssets = () => {
    collectViteProcessedCssAssetResults(bundle, {
      opts,
      isViteProcessedCssAsset,
      markCssAssetProcessed,
      recordCssAssetResult,
      recordViteProcessedCssAssetResult,
      resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension, sourceRoot, defaultStyleOutputExtension, bundleFiles),
      debug,
    })
    return injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts,
      getViteProcessedCssAssetResults,
      markCssAssetProcessed,
      recordCssAssetResult,
      shouldRemoveInjectedSourceAsset: (_targetFile, record) => {
        if (record.injectIntoMain !== true || typeof record.outputFile !== 'string') {
          return false
        }
        const recordFileKey = normalizeOutputPathKey(record.file)
        const outputFileKey = normalizeOutputPathKey(record.outputFile)
        return recordFileKey !== outputFileKey
      },
      debug,
      onUpdate,
    })
  }
  syncViteProcessedCssIntoMainCssAssets()
  if (isHarmonyAppStyleTarget && applyStyleSources.length > 0) {
    const viteProcessedCssSources = [...(getViteProcessedCssAssetResults?.() ?? [])]
      .map(([, record]) => typeof record === 'string' ? record : record.css)
    if (injectUniAppXHarmonyBundleStyles(bundle, { cssSources: viteProcessedCssSources })) {
      debug('uni-app-x harmony bundle styles inject after css assets')
    }
    syncViteProcessedCssIntoMainCssAssets()
  }
  normalizeBundleFileNameKeysForTest(bundle)

  const stateUpdateStart = performance.now()
  updateBundleBuildState(
    state,
    snapshot,
    useIncrementalMode ? (linkedByEntry ?? new Map<string, Set<string>>()) : new Map<string, Set<string>>(),
    { incremental: useIncrementalMode },
  )
  state.generatorCandidateSignature = generatorCandidateSignature
  if (useIncrementalMode && !snapshot.hasOmittedKnownFiles) {
    cache.prune?.({
      cacheKeys: activeProcessCacheKeys,
      hashKeys: activeProcessHashKeys,
    })
  }
  pruneLastCssResults(lastCssResultByFile, lastCssSourceHashByFile, activeViteCssCacheFiles)
  pruneViteCssCaches?.({
    activeFiles: activeViteCssCacheFiles,
    activeKnownSfcFiles: new Set([
      ...snapshot.sourceHashByFile.keys(),
      ...snapshot.entries.map(entry => entry.file),
    ]),
  })
  recordTimingDetail('state.update', stateUpdateStart)

  debug(
    'metrics iteration=%d runtime=%sms html(total=%d transform=%d hit=%d rate=%s elapsed=%sms) js(total=%d transform=%d hit=%d rate=%s elapsed=%sms) css(total=%d transform=%d hit=%d rate=%s elapsed=%sms)',
    formatIteration,
    formatMs(metrics.runtimeSet),
    metrics.html.total,
    metrics.html.transformed,
    metrics.html.cacheHits,
    formatCacheHitRate(metrics.html),
    formatMs(metrics.html.elapsed),
    metrics.js.total,
    metrics.js.transformed,
    metrics.js.cacheHits,
    formatCacheHitRate(metrics.js),
    formatMs(metrics.js.elapsed),
    metrics.css.total,
    metrics.css.transformed,
    metrics.css.cacheHits,
    formatCacheHitRate(metrics.css),
    formatMs(metrics.css.elapsed),
  )

  if (hmrTimingRecorder) {
    hmrTimingRecorder.record('generateBundle', performance.now() - hmrTimingStartedAt, {
      ...timingDetails,
      memoryDebug: resolveViteMemoryDebugStats({
        activeProcessCacheKeys,
        activeProcessHashKeys,
        cache,
        generatorRuntimeSize: generatorRuntime.size,
        getViteCssCacheStats,
        lastCssResultByFile,
        phase: 'generateBundle',
        runtimeSize: runtime.size,
        sourceCandidatesSize: sourceCandidates.size,
        transformRuntimeSize: transformRuntime.size,
        useIncrementalMode,
      }),
    })
    hmrTimingRecorder.emitTotal()
  }
  onEnd()
  debug('end')
}
