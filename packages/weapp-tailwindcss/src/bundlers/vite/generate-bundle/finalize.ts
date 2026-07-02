import type { OutputAsset, OutputChunk } from 'rollup'
import type { BundleBuildState, BundleSnapshot } from '../bundle-state'
import type { BundleMetrics } from './metrics'
import type { GenerateBundleContext } from './types'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { injectUniAppXHarmonyBundleStyles } from '@/uni-app-x/style-asset'
import { parseImportRequest } from '../../shared/generator-css/directives'
import { isPureLocalCssImportWrapper } from '../../shared/generator-css/local-imports'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { runWithConcurrency } from '../../shared/run-tasks'
import { updateBundleBuildState } from '../bundle-state'
import { collectViteProcessedCssAssetResults, injectViteProcessedCssIntoMainCssAssets, removeCssCoveredByRootStyleAssets, removeDuplicateUnlinkedRootCssAssetsReferencedByHtml } from '../processed-css-assets'
import { normalizeBundleFileNameKeysForTest } from './bundle-file-names'
import { resolveViteCssPipelineOutputFile } from './css-output'
import { finalizeMiniProgramCssAssets } from './final-css-assets'
import { resolveViteMemoryDebugStats } from './memory-debug'
import { formatCacheHitRate, formatMs } from './metrics'
import { collectMiniProgramSubpackageRoots } from './subpackages'
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
  jsAfterCss: boolean
  jsTaskFactories: Array<() => Promise<void>>
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

function readAssetSource(asset: OutputAsset) {
  return typeof asset.source === 'string' ? asset.source : asset.source.toString()
}

function isUniAppViteWebviewAppBundle(bundleFiles: string[]) {
  return bundleFiles.some(file => path.basename(file.replace(/[?#].*$/, '')) === 'app-service.js')
}

function getAssetFile(bundleFile: string, asset: OutputAsset) {
  return asset.fileName || bundleFile
}

function isRootMiniProgramStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return !normalized.includes('/')
    && /\.(?:wxss|acss|ttss|qss|jxss|tyss)$/i.test(normalized)
}

function createRelativeCssImportRequest(targetFile: string, importedFile: string) {
  const normalizedTargetFile = normalizeOutputPathKey(targetFile.replace(/[?#].*$/, ''))
  const normalizedImportedFile = normalizeOutputPathKey(importedFile.replace(/[?#].*$/, ''))
  const targetDir = path.posix.dirname(normalizedTargetFile)
  const baseDir = targetDir === '.' ? '' : targetDir
  const relative = path.posix.relative(baseDir, normalizedImportedFile)
  return relative.startsWith('.') ? relative : `./${relative}`
}

function createCssImportShell(targetFile: string, importedFile: string) {
  return `@import "${createRelativeCssImportRequest(targetFile, importedFile)}";\n`
}

function resolveRootMiniProgramOriginStyleFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  if (!isRootMiniProgramStyleOutputFile(normalized)) {
    return
  }
  if (/(?:^|\/)[^/]+-origin\.[^.]+$/i.test(normalized)) {
    return
  }
  return normalized.replace(/(\.[^.]+)$/, '-origin$1')
}

function resolveSingleCssImportOutputFile(targetFile: string, css: string) {
  let importedFile: string | undefined
  try {
    const root = postcss.parse(css)
    root.walkAtRules('import', (atRule) => {
      if (importedFile !== undefined) {
        return
      }
      const request = parseImportRequest(atRule.params)
      if (!request || /^(?:https?:)?\/\//i.test(request) || request.startsWith('data:')) {
        return
      }
      const cleanRequest = request.replace(/[?#].*$/, '')
      if (!/\.(?:css|wxss|acss|ttss|qss|jxss|tyss)$/i.test(cleanRequest)) {
        return
      }
      const targetDir = path.posix.dirname(normalizeOutputPathKey(targetFile))
      importedFile = normalizeOutputPathKey(path.posix.join(targetDir === '.' ? '' : targetDir, cleanRequest))
    })
  }
  catch {
  }
  return importedFile
}

export function normalizeTaroRootImportShellAssets(
  bundle: Record<string, OutputAsset | OutputChunk>,
  options: Pick<GenerateBundleContext['opts'], 'appType' | 'cssMatcher'> & {
    debug: GenerateBundleContext['debug']
    onUpdate: GenerateBundleContext['opts']['onUpdate']
    recordCssAssetResult: GenerateBundleContext['recordCssAssetResult']
  },
) {
  if (options.appType !== 'taro') {
    return 0
  }
  let updated = 0
  for (const [rootBundleFile, rootOutput] of Object.entries(bundle)) {
    if (rootOutput.type !== 'asset') {
      continue
    }
    const rootFile = getAssetFile(rootBundleFile, rootOutput)
    if (!isRootMiniProgramStyleOutputFile(rootFile) || !options.cssMatcher(rootFile)) {
      continue
    }
    const originFile = resolveRootMiniProgramOriginStyleFile(rootFile)
    if (!originFile || !options.cssMatcher(originFile)) {
      continue
    }
    const originOutput = Object.entries(bundle).find(([bundleFile, output]) =>
      output.type === 'asset'
      && normalizeOutputPathKey(getAssetFile(bundleFile, output)) === normalizeOutputPathKey(originFile),
    )?.[1]
    if (originOutput?.type !== 'asset') {
      continue
    }
    const rootSource = readAssetSource(rootOutput)
    if (isPureLocalCssImportWrapper(rootSource)) {
      continue
    }
    const originSource = readAssetSource(originOutput)
    if (isPureLocalCssImportWrapper(originSource)) {
      const importedFile = resolveSingleCssImportOutputFile(originFile, originSource)
      if (importedFile && normalizeOutputPathKey(importedFile) !== normalizeOutputPathKey(rootFile)) {
        continue
      }
    }
    else if (originSource.trim().length > 0 && originSource.trim() !== rootSource.trim()) {
      continue
    }
    const nextRootSource = createCssImportShell(rootFile, originFile)
    if (rootSource === nextRootSource) {
      continue
    }
    rootOutput.source = nextRootSource
    originOutput.source = rootSource
    options.recordCssAssetResult?.(rootFile, nextRootSource)
    options.recordCssAssetResult?.(originFile, rootSource)
    options.onUpdate?.(rootFile, rootSource, nextRootSource)
    options.onUpdate?.(originFile, originSource, rootSource)
    options.debug('normalize taro root css import shell: %s -> %s', rootFile, originFile)
    updated++
  }
  return updated
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
    jsAfterCss,
    jsTaskFactories,
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
  const tasksStart = performance.now()
  if (cssTaskFactories.length > 0) {
    const cssConcurrency = resolveViteCssTaskConcurrency(useIncrementalMode, runtimeState.tailwindRuntime.majorVersion)
    const cssTask = runWithConcurrency(cssTaskFactories, cssConcurrency).then(() => undefined)
    if (jsAfterCss) {
      await cssTask
    }
    else {
      tasks.push(cssTask)
    }
  }
  if (jsTaskFactories.length > 0) {
    tasks.push(runWithConcurrency(jsTaskFactories).then(() => undefined))
  }
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
      subpackageRoots: collectMiniProgramSubpackageRoots(bundle),
      debug,
    })
    return injectViteProcessedCssIntoMainCssAssets(bundle, {
      opts,
      getViteProcessedCssAssetResults,
      markCssAssetProcessed,
      recordCssAssetResult,
      shouldRemoveInjectedSourceAsset: (targetFile, record) => {
        if (record.injectIntoMain === false) {
          return false
        }
        const targetFileKey = normalizeOutputPathKey(targetFile)
        const recordFileKey = normalizeOutputPathKey(record.file)
        return recordFileKey !== targetFileKey
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
  normalizeTaroRootImportShellAssets(bundle, {
    appType: opts.appType,
    cssMatcher: opts.cssMatcher,
    debug,
    onUpdate,
    recordCssAssetResult,
  })
  normalizeBundleFileNameKeysForTest(bundle)
  removeCssCoveredByRootStyleAssets(bundle, {
    cssMatcher: opts.cssMatcher,
    debug,
    includeTailwindGeneratedCssAssets: opts.appType === 'uni-app-vite'
      && isWebGeneratorTarget
      && isUniAppViteWebviewAppBundle(bundleFiles),
    isViteProcessedCssAsset,
    onUpdate,
    recordCssAssetResult,
    subpackageRoots: collectMiniProgramSubpackageRoots(bundle),
  })
  if (opts.appType === 'uni-app-vite' && isWebGeneratorTarget && isUniAppViteWebviewAppBundle(bundleFiles)) {
    removeDuplicateUnlinkedRootCssAssetsReferencedByHtml(bundle, { debug })
  }
  await finalizeMiniProgramCssAssets(bundle, {
    cssMatcher: opts.cssMatcher,
    debug,
    getCssHandlerOptions,
    isWebGeneratorTarget,
    lastCssResultByFile,
    onUpdate,
    recordCssAssetResult,
    styleHandler,
  })

  const stateUpdateStart = performance.now()
  updateBundleBuildState(
    state,
    snapshot,
    useIncrementalMode ? (linkedByEntry ?? new Map<string, Set<string>>()) : new Map<string, Set<string>>(),
    { incremental: useIncrementalMode },
  )
  state.generatorCandidateSignature = generatorCandidateSignature
  const shouldPruneTransientCaches = !snapshot.hasOmittedKnownFiles
  const processCachePruned = useIncrementalMode && shouldPruneTransientCaches && typeof cache.prune === 'function'
  const processCachePruneSkipReason = processCachePruned
    ? undefined
    : !useIncrementalMode
        ? 'full-mode'
        : !shouldPruneTransientCaches
            ? 'omitted-known-files'
            : 'cache-prune-unavailable'
  if (processCachePruned) {
    cache.prune?.({
      cacheKeys: activeProcessCacheKeys,
      hashKeys: activeProcessHashKeys,
    })
  }
  if (shouldPruneTransientCaches) {
    pruneLastCssResults(lastCssResultByFile, lastCssSourceHashByFile, activeViteCssCacheFiles)
    pruneViteCssCaches?.({
      activeFiles: activeViteCssCacheFiles,
      activeKnownSfcFiles: new Set([
        ...snapshot.sourceHashByFile.keys(),
        ...snapshot.entries.map(entry => entry.file),
      ]),
    })
  }
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
        hasOmittedKnownFiles: snapshot.hasOmittedKnownFiles,
        lastCssResultByFile,
        phase: 'generateBundle',
        processCachePruned,
        processCachePruneSkipReason,
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
