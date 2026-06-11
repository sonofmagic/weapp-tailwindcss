import type { OutputAsset, OutputChunk } from 'rollup'
import type { BundleSnapshot } from './bundle-state'
import type { GenerateBundleContext, GenerateBundleThis } from './generate-bundle/types'
import type { SourceCandidateFilterOptions } from './source-candidates'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { collectUniAppXHarmonyApplyStyleSources, collectUniAppXHarmonyApplyUtilities, createUniAppXBundleAssetSourceGetter, createUniAppXHarmonyApplyGeneratorSource, injectUniAppXHarmonyBundleStyles, injectUniAppXStylePlaceholder, isUniAppXHarmonyBundle, UNI_APP_X_STYLE_PLACEHOLDER_VERSION } from '@/uni-app-x/style-asset'
import { createUniAppXAssetTask } from '@/uni-app-x/vite'
import { resolveUniUtsPlatform } from '@/utils'
import { processCachedTask } from '../shared/cache'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap } from '../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { generateCssByGenerator, validateCandidatesByGenerator } from '../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, hasTailwindSourceDirectives } from '../shared/generator-css/directives'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { pushConcurrentTaskFactories } from '../shared/run-tasks'
import { createBundleModuleGraphOptions } from './bundle-entries'
import { buildBundleSnapshot, createBundleBuildState, updateBundleBuildState } from './bundle-state'
import { collectLegacyContainerCompatCandidates, collectUnescapedDynamicCandidates } from './generate-bundle/candidates'
import { normalizeRelativeCssConfigDirectives } from './generate-bundle/css-config-directives'
import { createCssHandlerOptionsCache } from './generate-bundle/css-handler-options'
import { canProcessViteSourceStyleAsCss, isAppOriginCssFile, isMainStyleEntryCssFile, isTailwindEntryCssFile, normalizeCssSourceForCompare, resolveViteCssOutputFile, resolveViteCssPipelineOutputFile } from './generate-bundle/css-output'
import { createCssRuntimeSignature, createCssTransformShareScopeKey } from './generate-bundle/css-share-scope'
import { hasOmittedKnownBundleFiles } from './generate-bundle/dirty-state'
import { createJsEntryResolver } from './generate-bundle/js-entries'
import { createJsHandlerOptionsFactory, resolveUniAppXJsTransformEnabled } from './generate-bundle/js-handler-options'
import { collectLinkedFileNames, createLinkedUpdateHelpers } from './generate-bundle/js-linking'
import { createEmptyMetrics, formatCacheHitRate, formatMs, measureElapsed } from './generate-bundle/metrics'
import { logBundleProcessPlan } from './generate-bundle/process-plan'
import { collectRememberedCssReplayGroups, createRememberedCssRuntimeSignature, findRememberedCssSources, mergeRememberedCssSources } from './generate-bundle/remembered-css'
import { createReplayCssAsset, registerGeneratorDependencies } from './generate-bundle/rollup-assets'
import { hasSfcStyleSources, hasTailwindGenerationSource, normalizeSfcSourceFileForCompare, resolveSfcStyleSourceFromOutputFile } from './generate-bundle/sfc-style-source'
import { createCandidateSignature, createJsHashSalt, createLinkedImpactSignature, getSnapshotHash, hasRuntimeAffectingSourceChanges, summarizeStringDiff } from './generate-bundle/signatures'
import { collectMiniProgramSubpackageRoots, collectMiniProgramSubpackageSourceEntries, isSubpackageOutputFile } from './generate-bundle/subpackages'
import { shouldSkipViteJsTransform } from './js-precheck'
import { collectViteProcessedCssAssetResults, injectViteProcessedCssIntoMainCssAssets } from './processed-css-assets'
import { createRuntimeAffectingSourceSignature } from './runtime-affecting-signature'
import { resolveTailwindV4EntriesFromCssCached } from './source-scan'
import { resolveUniAppXNativeCssHandlerOptions } from './uni-app-x-css-options'

export { resolveReplayCssOutputFile, resolveViteCssPipelineOutputFile } from './generate-bundle/css-output'
export { resolveRememberedCssSourceForTest } from './generate-bundle/remembered-css'
export type { GenerateBundleContext, GenerateBundleThis, RememberedCssSource } from './generate-bundle/types'

function addSiblingCssFile(files: Set<string>, file: string) {
  if (file.endsWith('.wxml')) {
    files.add(file.replace(/\.wxml$/, '.wxss'))
  }
  else if (file.endsWith('.js')) {
    files.add(file.replace(/\.js$/, '.wxss'))
  }
}

function collectRuntimeLinkedCssFiles(snapshot: BundleSnapshot) {
  const files = new Set<string>()
  for (const file of snapshot.runtimeAffectingChangedByType.html) {
    addSiblingCssFile(files, file)
  }
  for (const file of snapshot.runtimeAffectingChangedByType.js) {
    addSiblingCssFile(files, file)
  }
  return files
}

async function createScopedGeneratorCandidateSignature(
  rawSource: string,
  sourceFile: string,
  fallbackSignature: string,
  getSourceCandidatesForEntries: ((entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) => Set<string>) | undefined,
  options: { includeFallbackSignature?: boolean | undefined } = {},
) {
  if (!getSourceCandidatesForEntries || !rawSource.includes('@source')) {
    return fallbackSignature
  }
  const resolved = await resolveTailwindV4EntriesFromCssCached(
    rawSource,
    path.dirname(path.resolve(sourceFile.replace(/[?#].*$/, ''))),
  )
  if (resolved?.entries === undefined) {
    return fallbackSignature
  }
  const scopedSignature = createCandidateSignature(getSourceCandidatesForEntries(resolved.entries))
  return options.includeFallbackSignature === true
    ? `${scopedSignature}:${fallbackSignature}`
    : scopedSignature
}

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const state = createBundleBuildState()
  const lastCssResultByFile = new Map<string, string>()
  let currentOutDir: string | undefined
  let currentSubpackageRoots: Set<string> | undefined
  const cssHandlerOptions = createCssHandlerOptionsCache({
    getAppType: () => context.opts.appType,
    mainCssChunkMatcher: context.opts.mainCssChunkMatcher,
    getMajorVersion: () => context.runtimeState.twPatcher.majorVersion,
    getOutputRoot: () => currentOutDir,
    getExtraOptions: () => resolveUniAppXNativeCssHandlerOptions(context.opts),
  })
  return async function generateBundle(this: GenerateBundleThis, _opt: unknown, bundle: Record<string, OutputAsset | OutputChunk>) {
    const addWatchFile = (id: string) => this.addWatchFile?.(id)
    const {
      opts,
      runtimeState,
      ensureBundleRuntimeClassSet,
      debug,
      getResolvedConfig,
      markCssAssetProcessed,
      isCssAssetProcessed,
      isViteProcessedCssAsset,
      recordCssAssetResult,
      recordViteProcessedCssAssetResult,
      getViteProcessedCssAssetResults,
      getViteProcessedCssAssetResult,
      getSourceCandidates,
      getSourceCandidatesForEntries,
      getSourceCandidateSourcesForEntries,
      waitForSourceCandidateSyncs,
      rememberCssSource,
      refreshRememberedCssSource,
      getRememberedCssSources,
      getRememberedCssSignature,
      setRememberedCssSignature,
      getKnownSfcSource,
      recordGeneratorCandidates,
      hmrTimingRecorder,
    } = context
    const getBundlerSfcSource = (sourceFile: string) => {
      const code = this.getModuleInfo?.(sourceFile)?.code
      return typeof code === 'string' && hasSfcStyleSources(code) ? code : undefined
    }
    const getSfcSource = (sourceFile: string) => getBundlerSfcSource(sourceFile) ?? getKnownSfcSource?.(sourceFile)
    const {
      cache,
      onEnd,
      onStart,
      onUpdate,
      styleHandler,
      templateHandler,
      jsHandler,
      uniAppX,
    } = opts
    const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator)
    const isWebGeneratorTarget = generatorOptions.target === 'web'
    const resolvedConfig = getResolvedConfig()
    const uniUtsPlatform = resolveUniUtsPlatform()
    const isNativeAppStyleTarget = uniUtsPlatform.isApp
    const canInferHarmonyAppStyleTarget = !uniUtsPlatform.normalized || uniUtsPlatform.isApp
    const isHarmonyAppStyleTarget = uniUtsPlatform.isAppHarmony || (
      canInferHarmonyAppStyleTarget
      && (isUniAppXHarmonyBundle(bundle) || isUniAppXHarmonyOutDir(resolvedConfig?.build?.outDir))
    )
    const shouldPreserveAppCssExtension = isNativeAppStyleTarget || isHarmonyAppStyleTarget
    const shouldGenerateWebCssByGenerator = isWebGeneratorTarget && runtimeState.twPatcher.majorVersion === 3
    const { getCssHandlerOptions, getCssUserHandlerOptions } = cssHandlerOptions
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const outDir = resolvedConfig?.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir

    await runtimeState.readyPromise
    debug('start')
    onStart()
    const collectedBundlerGeneratedCssFiles = new Set(
      Object.entries(bundle)
        .filter(([, output]) => output.type === 'asset' && hasBundlerGeneratedCssMarker(output.source))
        .map(([file]) => file),
    )
    collectViteProcessedCssAssetResults(bundle, {
      opts,
      isViteProcessedCssAsset,
      markCssAssetProcessed,
      recordCssAssetResult,
      recordViteProcessedCssAssetResult,
      resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension),
      debug,
    })
    const hmrTimingStartedAt = performance.now()
    const timingDetails: Record<string, number> = {}
    const recordTimingDetail = (name: string, startedAt: number) => {
      timingDetails[name] = (timingDetails[name] ?? 0) + Math.max(0, performance.now() - startedAt)
    }
    const timeTask = async (name: string, task: () => Promise<void>) => {
      const start = performance.now()
      try {
        await task()
      }
      finally {
        recordTimingDetail(`tasks.${name}`, start)
      }
    }

    const metrics = createEmptyMetrics()
    const forceRuntimeRefreshByEnv = process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] === '1'
    const disableDirtyOptimization = process.env['WEAPP_TW_VITE_DISABLE_DIRTY'] === '1'
    const disableJsPrecheck = process.env['WEAPP_TW_VITE_DISABLE_JS_PRECHECK'] === '1'
    const debugCssDiff = process.env['WEAPP_TW_VITE_DEBUG_CSS_DIFF'] === '1'
    const disableV3OxideSourceRuntime = process.env['WEAPP_TW_VITE_DISABLE_V3_OXIDE_RUNTIME'] === '1'
    const bundleFiles = Object.keys(bundle)
    const subpackageRoots = collectMiniProgramSubpackageRoots(bundle)
    if (subpackageRoots) {
      currentSubpackageRoots = subpackageRoots
    }
    const isMainPackageStyleOutputFile = (file: string) =>
      currentSubpackageRoots != null && !isSubpackageOutputFile(file, currentSubpackageRoots)
    const buildCommand = resolvedConfig?.command === 'build'
    const hasPreviousBundleState = state.iteration > 0 || state.sourceHashByFile.size > 0
    const hasOmittedKnownFiles = hasOmittedKnownBundleFiles(bundleFiles, state.sourceHashByFile.keys())
    // uni-app vite 的 dev 流程可能以 command=build 驱动 generateBundle，
    // 后续轮次可能回传完整 bundle 或脏文件子集；只要同一插件实例已有状态，
    // 就按增量处理，避免候选变化时把未改动的分包 CSS 全量重生成。
    const useIncrementalMode = !buildCommand
      || hasPreviousBundleState
      || hasOmittedKnownFiles
    currentOutDir = outDir
    const snapshotStart = performance.now()
    const snapshot = buildBundleSnapshot(bundle, opts, outDir, state, disableDirtyOptimization || !useIncrementalMode, {
      hasOmittedKnownFiles,
    })
    const subpackageSourceExcludeEntries = currentSubpackageRoots
      ? collectMiniProgramSubpackageSourceEntries(snapshot, currentSubpackageRoots, [
          rootDir,
          opts.tailwindcssBasedir,
          (opts.tailwindcssPatcherOptions as { projectRoot?: string | undefined } | undefined)?.projectRoot,
        ])
      : []
    const shouldExcludeSubpackageSourceCandidates = (outputFile: string, cssHandlerOptions: { isMainChunk?: boolean | undefined }) =>
      cssHandlerOptions.isMainChunk === true
      && subpackageSourceExcludeEntries.length > 0
      && isMainPackageStyleOutputFile(outputFile)
    const createScopedSourceCandidateGetter = (
      outputFile: string,
      cssHandlerOptions: { isMainChunk?: boolean | undefined },
    ) => {
      if (!getSourceCandidatesForEntries) {
        return undefined
      }
      if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
        return getSourceCandidatesForEntries
      }
      return (entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) =>
        getSourceCandidatesForEntries(entries, {
          ...options,
          excludeEntries: [
            ...(options?.excludeEntries ?? []),
            ...subpackageSourceExcludeEntries,
          ],
        })
    }
    const createScopedSourceCandidateSourceGetter = (
      outputFile: string,
      cssHandlerOptions: { isMainChunk?: boolean | undefined },
    ) => {
      if (!getSourceCandidateSourcesForEntries) {
        return undefined
      }
      if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
        return getSourceCandidateSourcesForEntries
      }
      return (entries: TailwindSourceEntry[] | undefined, options?: SourceCandidateFilterOptions) =>
        getSourceCandidateSourcesForEntries(entries, {
          ...options,
          excludeEntries: [
            ...(options?.excludeEntries ?? []),
            ...subpackageSourceExcludeEntries,
          ],
        })
    }
    const shouldInjectCssIntoMainFromOutput = (
      outputFile: string,
      sourceFile: string,
      outputCssHandlerOptions: { isMainChunk?: boolean | undefined },
    ) =>
      isMainStyleEntryCssFile(sourceFile)
      || isTailwindEntryCssFile(outputFile)
      || (
        useIncrementalMode
        && (
          outputCssHandlerOptions.isMainChunk
          || isMainPackageStyleOutputFile(outputFile)
        )
      )
    recordTimingDetail('snapshot', snapshotStart)
    const useBundleRuntimeClassSet = !isWebGeneratorTarget && (useIncrementalMode || runtimeState.twPatcher.majorVersion === 4)
    const forceRuntimeRefreshBySource = useIncrementalMode
      && hasRuntimeAffectingSourceChanges(snapshot.runtimeAffectingChangedByType)
    const processFiles = snapshot.processFiles
    logBundleProcessPlan({
      debug,
      snapshot,
      useIncrementalMode,
      iteration: state.iteration + 1,
    })
    const sourceCandidateWaitStart = performance.now()
    await waitForSourceCandidateSyncs?.()
    recordTimingDetail('sourceCandidates.wait', sourceCandidateWaitStart)
    const sourceCandidates = getSourceCandidates?.() ?? new Set<string>()
    const createScopedGeneratorRuntime = (
      outputFile: string,
      cssHandlerOptions: { isMainChunk?: boolean | undefined },
      runtime: Set<string>,
    ) => {
      if (!shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)) {
        return runtime
      }
      const filteredSourceCandidates = createScopedSourceCandidateGetter(outputFile, cssHandlerOptions)?.(undefined)
      if (!filteredSourceCandidates) {
        return runtime
      }
      return filteredSourceCandidates.size > 0 ? filteredSourceCandidates : runtime
    }
    const jsEntries = snapshot.jsEntries
    const getJsEntry = createJsEntryResolver(jsEntries)
    const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
    const hasCssAssetEntry = snapshot.entries.some(entry => entry.type === 'css' && entry.output.type === 'asset')
    const hasRuntimeAffectingChanges = hasRuntimeAffectingSourceChanges(snapshot.runtimeAffectingChangedByType)
    const useV3OxideSourceRuntime = runtimeState.twPatcher.majorVersion === 3
      && sourceCandidates.size > 0
      && hasCssAssetEntry
      && !forceRuntimeRefreshByEnv
      && !disableV3OxideSourceRuntime
    const runtimeStart = performance.now()
    const transformBaseRuntime = useV3OxideSourceRuntime
      ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv, {
          transformOnly: true,
        })
      : undefined
    // Tailwind v4 的任意值在 uni-app/Taro 等上游输出里可能已经被转义。
    // HTML/JS 发生运行时相关变更时，优先回到源码扫描刷新集合，避免用旧集合重放 app.wxss。
    const forceV4RuntimeRefreshBySource = runtimeState.twPatcher.majorVersion === 4
      && forceRuntimeRefreshBySource
    const runtime = isWebGeneratorTarget && !shouldGenerateWebCssByGenerator
      ? new Set<string>()
      : useV3OxideSourceRuntime
        ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv, {
            allowBaselineOnlyInitialSync: true,
            baseClassSet: sourceCandidates,
          })
        : useBundleRuntimeClassSet
          ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv || forceV4RuntimeRefreshBySource, {
              allowBaselineOnlyInitialSync: buildCommand,
            })
          : await context.ensureRuntimeClassSet(forceRuntimeRefreshByEnv)
    if (useV3OxideSourceRuntime) {
      debug(
        '[tailwindcss:v3] use oxide source candidates as runtime input, candidates=%d',
        sourceCandidates.size,
      )
    }
    const shouldFilterTailwindV4MiniProgramCandidates = runtimeState.twPatcher.majorVersion === 4 && generatorOptions.target === 'weapp'
    const collectedGeneratorCandidates = new Set([...runtime, ...sourceCandidates])
    const filteredGeneratorCandidates = shouldFilterTailwindV4MiniProgramCandidates
      ? filterUnsupportedMiniProgramTailwindV4Candidates(collectedGeneratorCandidates)
      : collectedGeneratorCandidates
    let transformRuntime = transformBaseRuntime ?? runtime
    let generatorRuntime = collectLegacyContainerCompatCandidates(
      sourceCandidates,
      runtimeState.twPatcher.majorVersion === 3 && hasRuntimeAffectingChanges && transformBaseRuntime
        ? new Set([
            ...filteredGeneratorCandidates,
            ...transformBaseRuntime,
          ])
        : filteredGeneratorCandidates,
    )
    const cssEntries = snapshot.entries.filter(entry =>
      entry.type === 'css' && entry.output.type === 'asset')
    const shouldValidateV3GeneratorRuntime = runtimeState.twPatcher.majorVersion === 3
      && useV3OxideSourceRuntime
      && generatorRuntime.size > 0
      && (state.iteration === 0 || !hasRuntimeAffectingChanges)
      && cssEntries.length <= 1
    if (shouldValidateV3GeneratorRuntime) {
      const mainCssEntry = cssEntries.find(entry => getCssHandlerOptions(entry.file).isMainChunk) ?? cssEntries[0]
      if (mainCssEntry) {
        const validatedRuntime = await validateCandidatesByGenerator({
          opts,
          runtimeState,
          candidates: generatorRuntime,
          rawSource: mainCssEntry.source,
          file: mainCssEntry.file,
          cssHandlerOptions: getCssHandlerOptions(mainCssEntry.file),
          cssUserHandlerOptions: getCssUserHandlerOptions(mainCssEntry.file),
          styleHandler,
          debug,
        })
        if (validatedRuntime.size > 0) {
          generatorRuntime = collectLegacyContainerCompatCandidates(
            sourceCandidates,
            validatedRuntime,
          )
          transformRuntime = generatorRuntime
        }
        else {
          generatorRuntime = validatedRuntime
          transformRuntime = validatedRuntime
        }
      }
    }
    const generatorCandidateSignature = createCandidateSignature(generatorRuntime)
    const generatorCandidatesChanged = state.generatorCandidateSignature !== generatorCandidateSignature
    const runtimeLinkedCssFiles = collectRuntimeLinkedCssFiles(snapshot)
    recordGeneratorCandidates?.(generatorRuntime)
    const dynamicRetryCandidates = new Set([
      ...sourceCandidates,
      ...generatorRuntime,
      ...transformRuntime,
    ])
    const defaultTemplateHandlerOptions = {
      runtimeSet: transformRuntime,
    }
    metrics.runtimeSet = measureElapsed(runtimeStart)
    timingDetails['runtime'] = metrics.runtimeSet
    if (forceRuntimeRefreshBySource) {
      debug(
        'runtimeSet forced refresh due to source changes: html=%d js=%d',
        snapshot.runtimeAffectingChangedByType.html.size,
        snapshot.runtimeAffectingChangedByType.js.size,
      )
    }
    debug('get runtimeSet, class count: %d, transform class count: %d', runtime.size, transformRuntime.size)
    const runtimeSignature = getRuntimeClassSetSignature(runtimeState.twPatcher) ?? 'runtime:missing'
    const shouldProcessTailwindGeneration = !useIncrementalMode
      || hasRuntimeAffectingChanges
      || generatorCandidatesChanged
      || snapshot.processFiles.css.size > 0
    const { applyLinkedUpdates, pendingLinkedUpdates } = createLinkedUpdateHelpers({
      jsEntries,
      onUpdate,
      debug,
    })
    const createHandlerOptions = createJsHandlerOptionsFactory({
      getMajorVersion: () => runtimeState.twPatcher.majorVersion,
      moduleGraph: moduleGraphOptions,
    })

    const linkedByEntry = useIncrementalMode ? new Map<string, Set<string>>() : undefined
    const sharedCssResultCache = new Map<string, Promise<string>>()
    const tasks: Promise<void>[] = []
    const jsTaskFactories: Array<() => Promise<void>> = []

    for (const entry of snapshot.entries) {
      const { file, output: originalSource, source: originalEntrySource, type } = entry

      if (type === 'html' && originalSource.type === 'asset') {
        metrics.html.total++
        if (isWebGeneratorTarget) {
          debug('html skip web target: %s', file)
          continue
        }
        if (!processFiles.html.has(file)) {
          continue
        }
        const rawSource = originalEntrySource
        tasks.push(timeTask('html', () =>
          processCachedTask<string>({
            cache,
            cacheKey: file,
            hashKey: `${file}:html:${runtimeSignature}`,
            hash: getSnapshotHash(snapshot.sourceHashByFile, file, rawSource),
            applyResult(source) {
              originalSource.source = source
            },
            onCacheHit() {
              metrics.html.cacheHits++
              debug('html cache hit: %s', file)
            },
            async transform() {
              const start = performance.now()
              let transformed = await templateHandler(rawSource, defaultTemplateHandlerOptions)
              let unresolvedDynamicCandidates = collectUnescapedDynamicCandidates(transformed)
              let retryRuntimeSet: Set<string> | undefined

              if (unresolvedDynamicCandidates.length > 0) {
                const fullRuntimeSet = await context.ensureRuntimeClassSet(true)
                const allowedRetryCandidates = fullRuntimeSet.size === 0
                  ? unresolvedDynamicCandidates
                  : unresolvedDynamicCandidates.filter(candidate => dynamicRetryCandidates.has(candidate) || fullRuntimeSet.has(candidate))
                retryRuntimeSet = new Set([
                  ...fullRuntimeSet,
                  ...allowedRetryCandidates,
                ])
                unresolvedDynamicCandidates = unresolvedDynamicCandidates.filter(candidate => retryRuntimeSet?.has(candidate) === true)
              }

              if (retryRuntimeSet && unresolvedDynamicCandidates.length > 0) {
                logger.warn(
                  '检测到已提取 WXML 动态类名未完成转译，已回退到完整 runtimeSet 重试: %s -> %O',
                  file,
                  unresolvedDynamicCandidates,
                )
                transformed = await templateHandler(rawSource, {
                  runtimeSet: retryRuntimeSet,
                })
                unresolvedDynamicCandidates = collectUnescapedDynamicCandidates(transformed, retryRuntimeSet)
                if (unresolvedDynamicCandidates.length > 0) {
                  logger.warn(
                    '已提取 WXML 动态类名在完整 runtimeSet 重试后仍未完成转译: %s -> %O',
                    file,
                    unresolvedDynamicCandidates,
                  )
                }
              }
              metrics.html.elapsed += measureElapsed(start)
              metrics.html.transformed++
              onUpdate(file, rawSource, transformed)
              debug('html handle: %s', file)
              return {
                result: transformed,
              }
            },
          })))
        continue
      }

      if (type === 'css' && originalSource.type === 'asset') {
        metrics.css.total++
        // uni-app dev/watch 会在每轮产物阶段重写 app.wxss。
        // 即便本轮 CSS 原文 hash 未变化，也必须回填缓存中的转译结果，
        // 否则会退回未转译内容并与同轮 JS/WXML 的 class 改写失配。
        const rawSource = normalizeRelativeCssConfigDirectives(originalEntrySource, file, outDir, opts)
        const outputFile = resolveViteCssOutputFile(file, opts, isWebGeneratorTarget, shouldPreserveAppCssExtension)
        if (outputFile !== file && !canProcessViteSourceStyleAsCss(rawSource, file)) {
          delete bundle[file]
          debug('css skip raw source style asset: %s -> %s', file, outputFile)
          continue
        }
        const applyCssResult = (source: string) => {
          if (outputFile !== file) {
            delete bundle[file]
            if (typeof this.emitFile === 'function') {
              this.emitFile({
                type: 'asset',
                fileName: outputFile,
                source,
              })
            }
            else {
              bundle[outputFile] = createReplayCssAsset(outputFile, source)
            }
            originalSource.fileName = outputFile
          }
          originalSource.source = source
        }
        if (isWebGeneratorTarget && !shouldGenerateWebCssByGenerator) {
          applyCssResult(rawSource)
          markCssAssetProcessed?.(originalSource, outputFile)
          onUpdate(outputFile, rawSource, rawSource)
          debug('css skip web target: %s', outputFile)
          continue
        }
        const hasViteProcessedCssRecord = getViteProcessedCssAssetResult?.(file) != null
        const viteProcessedCssAsset = isViteProcessedCssAsset?.(originalSource, file) === true || hasViteProcessedCssRecord
        const cssAssetProcessed = isCssAssetProcessed?.(originalSource, file) === true
        const alreadyProcessedCssAsset = viteProcessedCssAsset || cssAssetProcessed
        let rememberedCssSources = findRememberedCssSources(
          getRememberedCssSources?.(),
          outputFile,
          file,
          originalSource,
          outDir,
          opts.tailwindcssBasedir,
        )
        if (rememberedCssSources.length > 0) {
          rememberedCssSources = await Promise.all(rememberedCssSources.map(async remembered =>
            await refreshRememberedCssSource?.(remembered) ?? remembered,
          ))
        }
        const hasUsableRememberedTailwindSource = rememberedCssSources.some(remembered =>
          hasTailwindGenerationSource(remembered.rawSource)
          && normalizeOutputPathKey(remembered.sourceFile.replace(/[?#].*$/, '')) !== normalizeOutputPathKey(file),
        )
        const inferredSfcStyleSource = await resolveSfcStyleSourceFromOutputFile(
          outputFile,
          snapshot,
          outDir,
          opts.tailwindcssBasedir,
          getSfcSource,
          debug,
        )
        if (inferredSfcStyleSource) {
          const inferredSourceFile = normalizeSfcSourceFileForCompare(inferredSfcStyleSource.sourceFile)
          const rememberedSourcesBelongToInferredSfc = rememberedCssSources.length > 0
            && rememberedCssSources.every(remembered =>
              normalizeSfcSourceFileForCompare(remembered.sourceFile) === inferredSourceFile,
            )
          if (!hasUsableRememberedTailwindSource || rememberedSourcesBelongToInferredSfc) {
            rememberedCssSources = [inferredSfcStyleSource]
          }
        }
        const rememberedCssSource = mergeRememberedCssSources(rememberedCssSources, outputFile)
        const useRememberedCssSource = rememberedCssSource != null
          && normalizeOutputPathKey(rememberedCssSource.sourceFile) !== normalizeOutputPathKey(file)
        const vitePipelineCssAsset = viteProcessedCssAsset || useRememberedCssSource
        const generatorRawSource = vitePipelineCssAsset
          ? rememberedCssSource?.rawSource ?? rawSource
          : rawSource
        const hasRememberedApplySource = vitePipelineCssAsset
          && rememberedCssSource != null
          && hasTailwindApplyDirective(generatorRawSource)
        const hasDifferentRememberedCssSource = rememberedCssSource != null
          && normalizeCssSourceForCompare(rememberedCssSource.rawSource) !== normalizeCssSourceForCompare(rawSource)
        const hasCurrentTailwindGenerationDirective = hasTailwindSourceDirectives(rawSource, { importFallback: true })
          || hasTailwindRootDirectives(rawSource, { importFallback: true })
          || hasTailwindApplyDirective(rawSource)
        const hasRememberedApplyDirective = rememberedCssSource != null
          && hasTailwindApplyDirective(rememberedCssSource.rawSource)
        const hasStaleViteProcessedCssSource = vitePipelineCssAsset
          && hasDifferentRememberedCssSource
          && (hasCurrentTailwindGenerationDirective || hasRememberedApplyDirective)
        const generatorSourceFile = vitePipelineCssAsset
          ? rememberedCssSource?.sourceFile ?? file
          : file
        const outputCssHandlerOptions = getCssHandlerOptions(outputFile)
        const cssHandlerOptions = vitePipelineCssAsset
          ? {
              ...getCssHandlerOptions(generatorSourceFile),
              isMainChunk: outputCssHandlerOptions.isMainChunk || isAppOriginCssFile(file) || isMainStyleEntryCssFile(generatorSourceFile),
            }
          : getCssHandlerOptions(file)
        const scopedSourceCandidateGetter = createScopedSourceCandidateGetter(outputFile, cssHandlerOptions)
        const scopedSourceCandidateSourceGetter = createScopedSourceCandidateSourceGetter(outputFile, cssHandlerOptions)
        const sourceTraceTokenSources = scopedSourceCandidateSourceGetter
          ? createCssTokenSourceMap(scopedSourceCandidateSourceGetter(undefined), opts)
          : undefined
        const sourceTraceSignature = createCssSourceTraceCacheSignature(sourceTraceTokenSources, opts)
        const scopedGeneratorRuntime = createScopedGeneratorRuntime(outputFile, cssHandlerOptions, generatorRuntime)
        const annotateCss = (css: string) => annotateCssSourceTrace(css, {
          opts,
          tokenSources: sourceTraceTokenSources,
        })
        const shouldRegenerateMainPackageCssWithScopedCandidates = vitePipelineCssAsset
          && shouldExcludeSubpackageSourceCandidates(outputFile, cssHandlerOptions)
        const generatorCssUserHandlerOptions = getCssUserHandlerOptions(generatorSourceFile)
        const cssRuntimeAffectingSignature = vitePipelineCssAsset
          ? createRuntimeAffectingSourceSignature(generatorRawSource, 'css')
          : snapshot.runtimeAffectingSignatureByFile.get(file)
            ?? createRuntimeAffectingSourceSignature(generatorRawSource, 'css')
        const cssRuntimeAffectingHash = vitePipelineCssAsset
          ? cache.computeHash(cssRuntimeAffectingSignature)
          : snapshot.runtimeAffectingHashByFile.get(file)
            ?? cache.computeHash(cssRuntimeAffectingSignature)
        const cssShareScope = createCssTransformShareScopeKey(opts, generatorSourceFile, generatorRawSource)
        const shouldRegenerateAppOriginCss = viteProcessedCssAsset && isAppOriginCssFile(file)
        const shouldTrackGeneratorRuntime = hasStaleViteProcessedCssSource
          || shouldRegenerateMainPackageCssWithScopedCandidates
          || hasCurrentTailwindGenerationDirective
          || (shouldProcessTailwindGeneration && (
            !useIncrementalMode
            || cssHandlerOptions.isMainChunk
            || processFiles.css.has(file)
            || runtimeLinkedCssFiles.has(file)
            || shouldRegenerateAppOriginCss
            || (hasRuntimeAffectingChanges && (alreadyProcessedCssAsset || vitePipelineCssAsset))
          ))
        const shouldPreserveCollectedViteCssAsset = !shouldRegenerateAppOriginCss
          && (
            collectedBundlerGeneratedCssFiles.has(file)
            || hasBundlerGeneratedCssMarker(rawSource)
          )
        if (
          alreadyProcessedCssAsset
          && !hasStaleViteProcessedCssSource
          && !hasRememberedApplySource
          && !shouldRegenerateMainPackageCssWithScopedCandidates
          && (!shouldTrackGeneratorRuntime || shouldPreserveCollectedViteCssAsset)
        ) {
          const nextCss = stripBundlerGeneratedCssMarkers(rawSource)
          applyCssResult(nextCss)
          markCssAssetProcessed?.(originalSource, outputFile)
          recordCssAssetResult?.(outputFile, nextCss)
          const shouldInjectPreservedViteCssIntoMain = vitePipelineCssAsset
            && !isAppOriginCssFile(file)
            && shouldInjectCssIntoMainFromOutput(outputFile, generatorSourceFile, outputCssHandlerOptions)
          recordViteProcessedCssAssetResult?.(outputFile, nextCss, {
            injectIntoMain: isAppOriginCssFile(file) ? false : shouldInjectPreservedViteCssIntoMain,
            outputFile,
          })
          onUpdate(outputFile, rawSource, nextCss)
          debug('css skip vite-processed asset: %s', outputFile)
          continue
        }
        const trackedGeneratorCandidateSignature = shouldTrackGeneratorRuntime
          ? createCandidateSignature(scopedGeneratorRuntime)
          : 'generator:stable'
        const scopedGeneratorCandidateSignature = shouldTrackGeneratorRuntime
          ? await createScopedGeneratorCandidateSignature(
              generatorRawSource,
              generatorSourceFile,
              trackedGeneratorCandidateSignature,
              scopedSourceCandidateGetter,
              {
                includeFallbackSignature: cssHandlerOptions.isMainChunk,
              },
            )
          : trackedGeneratorCandidateSignature
        const cssRuntimeSignature = createCssRuntimeSignature(runtimeSignature, scopedGeneratorCandidateSignature)
        const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(cssRuntimeSignature, cssRuntimeAffectingHash)
        const cssSharedCacheKey = `${cssShareScope}:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}:${cssHandlerOptions.isMainChunk ? '1' : '0'}:${cssRuntimeAffectingSignature}:${sourceTraceSignature}`
        if (!shouldTrackGeneratorRuntime) {
          const lastCss = lastCssResultByFile.get(outputFile) ?? lastCssResultByFile.get(file)
          if (lastCss != null) {
            applyCssResult(lastCss)
            markCssAssetProcessed?.(originalSource, outputFile)
            metrics.css.cacheHits++
            debug('css replay last result: %s', outputFile)
            continue
          }
        }
        tasks.push(timeTask('css', () =>
          processCachedTask<string>({
            cache,
            cacheKey: file,
            hashKey: `${file}:css:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}`,
            hash: `${cssRuntimeAffectingHash}:${scopedGeneratorCandidateSignature}:${sourceTraceSignature}`,
            applyResult(source) {
              applyCssResult(source)
              lastCssResultByFile.set(outputFile, source)
              markCssAssetProcessed?.(originalSource, outputFile)
              if (rememberedCssSources.length <= 1) {
                rememberCssSource?.({
                  outputFile,
                  rawSource: generatorRawSource,
                  sourceFile: generatorSourceFile,
                }, rememberedCssRuntimeSignature)
              }
            },
            onCacheHit() {
              metrics.css.cacheHits++
              debug('css cache hit: %s', file)
            },
            async transform() {
              if (cssSharedCacheKey) {
                const sharedCssTask = sharedCssResultCache.get(cssSharedCacheKey)
                if (sharedCssTask != null) {
                  metrics.css.cacheHits++
                  debug('css shared hit: %s', file)
                  const sharedCss = await sharedCssTask
                  onUpdate(file, rawSource, sharedCss)
                  return {
                    result: sharedCss,
                  }
                }
              }
              const runTransform = async () => {
                const start = performance.now()
                await runtimeState.readyPromise
                const previousCss = !vitePipelineCssAsset && useIncrementalMode && !hasRuntimeAffectingChanges && !snapshot.changedByType.css.has(file)
                  ? lastCssResultByFile.get(outputFile) ?? lastCssResultByFile.get(file)
                  : undefined
                const generated = await generateCssByGenerator({
                  opts,
                  runtimeState,
                  runtime: scopedGeneratorRuntime,
                  rawSource: generatorRawSource,
                  file: generatorSourceFile,
                  cssHandlerOptions,
                  cssUserHandlerOptions: generatorCssUserHandlerOptions,
                  getSourceCandidatesForEntries: scopedSourceCandidateGetter,
                  styleHandler,
                  debug,
                  previousCss,
                })
                if (generated) {
                  const tracedCss = annotateCss(generated.css)
                  registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
                  if (debugCssDiff) {
                    debug('css diff %s: %s', generatorSourceFile, summarizeStringDiff(generatorRawSource, tracedCss))
                  }
                  debug('css generated result: %s bytes=%d', file, tracedCss.length)
                  recordCssAssetResult?.(outputFile, tracedCss)
                  const shouldInjectVitePipelineCssIntoMain = vitePipelineCssAsset
                    && !isAppOriginCssFile(file)
                    && shouldInjectCssIntoMainFromOutput(outputFile, generatorSourceFile, outputCssHandlerOptions)
                  recordViteProcessedCssAssetResult?.(outputFile, tracedCss, {
                    injectIntoMain: isAppOriginCssFile(file) ? false : shouldInjectVitePipelineCssIntoMain,
                    outputFile,
                  })
                  if (vitePipelineCssAsset && shouldInjectVitePipelineCssIntoMain) {
                    recordViteProcessedCssAssetResult?.(file, tracedCss, {
                      injectIntoMain: isAppOriginCssFile(file) ? false : shouldInjectVitePipelineCssIntoMain,
                      outputFile,
                    })
                  }
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css handle via tailwind v%s engine(%s): %s', runtimeState.twPatcher.majorVersion, generated.target, outputFile)
                  return tracedCss
                }
                if (isWebGeneratorTarget) {
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css preserve web target: %s', outputFile)
                  return annotateCss(rawSource)
                }
                const { css } = await styleHandler(generatorRawSource, cssHandlerOptions)
                const tracedCss = annotateCss(css)
                if (debugCssDiff) {
                  debug('css diff %s: %s', generatorSourceFile, summarizeStringDiff(generatorRawSource, tracedCss))
                }
                metrics.css.elapsed += measureElapsed(start)
                metrics.css.transformed++
                return tracedCss
              }

              const cssTask = cssSharedCacheKey
                ? sharedCssResultCache.get(cssSharedCacheKey) ?? runTransform()
                : runTransform()

              if (cssSharedCacheKey && !sharedCssResultCache.has(cssSharedCacheKey)) {
                sharedCssResultCache.set(cssSharedCacheKey, cssTask)
              }

              const css = await cssTask
              onUpdate(outputFile, rawSource, css)
              debug('css handle: %s', outputFile)
              return {
                result: css,
              }
            },
          })))
        continue
      }

      if (type !== 'js') {
        continue
      }

      metrics.js.total++
      if (isWebGeneratorTarget) {
        debug('js skip web target: %s', file)
        continue
      }
      const shouldTransformJs = !useIncrementalMode || processFiles.js.has(file)
      if (!shouldTransformJs) {
        // 增量轮次上游可能重写相同源码的原始 JS 产物，这里仍要走缓存回填以保持转译结果稳定。
        debug('js skip transform (clean), replay cache: %s', file)
      }

      if (originalSource.type === 'chunk') {
        const absoluteFile = path.resolve(outDir, file)
        const initialRawSource = originalEntrySource
        const linkedSet = useIncrementalMode ? new Set<string>() : undefined
        if (linkedByEntry && linkedSet) {
          linkedByEntry.set(file, linkedSet)
        }

        jsTaskFactories.push(async () => {
          await timeTask('js', async () => {
            const linkedImpactSignature = useIncrementalMode
              ? createLinkedImpactSignature(
                  file,
                  snapshot.linkedImpactsByEntry,
                  snapshot.sourceHashByFile,
                )
              : undefined
            const hashSalt = createJsHashSalt(runtimeSignature, linkedImpactSignature)
            await processCachedTask<string>({
              cache,
              cacheKey: file,
              hashKey: `${file}:js`,
              hash: `${getSnapshotHash(snapshot.sourceHashByFile, file, initialRawSource)}:${hashSalt}`,
              applyResult(source) {
                originalSource.code = source
              },
              onCacheHit() {
                metrics.js.cacheHits++
                debug('js cache hit: %s', file)
              },
              async transform() {
                const start = performance.now()
                const rawSource = originalSource.code
                if (!shouldTransformJs) {
                  debug('js cache replay miss, fallback transform: %s', file)
                }
                const handlerOptions = createHandlerOptions(absoluteFile)
                if (!disableJsPrecheck && shouldSkipViteJsTransform(rawSource, handlerOptions)) {
                  metrics.js.elapsed += measureElapsed(start)
                  metrics.js.transformed++
                  return {
                    result: rawSource,
                  }
                }

                const { code, linked } = await jsHandler(rawSource, transformRuntime, handlerOptions)
                metrics.js.elapsed += measureElapsed(start)
                metrics.js.transformed++
                onUpdate(file, rawSource, code)
                debug('js handle: %s', file)
                collectLinkedFileNames(linked, getJsEntry, linkedSet)
                applyLinkedUpdates(linked)
                return {
                  result: code,
                }
              },
            })
          })
        })
      }
      else if (uniAppX && originalSource.type === 'asset') {
        const linkedSet = useIncrementalMode ? new Set<string>() : undefined
        if (linkedByEntry && linkedSet) {
          linkedByEntry.set(file, linkedSet)
        }

        const baseApplyLinkedUpdates = applyLinkedUpdates
        const wrappedApplyLinkedUpdates = (linked?: Record<string, LinkedJsModuleResult>) => {
          collectLinkedFileNames(linked, getJsEntry, linkedSet)
          baseApplyLinkedUpdates(linked)
        }

        const factory = createUniAppXAssetTask(
          file,
          originalSource,
          outDir,
          {
            cache,
            hashKey: `${file}:js`,
            hashSalt: createJsHashSalt(
              runtimeSignature,
              [
                UNI_APP_X_STYLE_PLACEHOLDER_VERSION,
                useIncrementalMode
                  ? createLinkedImpactSignature(
                      file,
                      snapshot.linkedImpactsByEntry,
                      snapshot.sourceHashByFile,
                    )
                  : undefined,
              ].filter(Boolean).join(':'),
            ),
            createHandlerOptions,
            debug,
            getAssetSource: createUniAppXBundleAssetSourceGetter(bundle),
            jsHandler,
            onUpdate,
            runtimeSet: transformRuntime,
            applyLinkedResults: wrappedApplyLinkedUpdates,
            uniAppX,
          },
        )

        jsTaskFactories.push(async () => {
          await timeTask('js', async () => {
            const start = performance.now()
            if (!shouldTransformJs) {
              debug('js skip transform (clean, uni-app-x), replay cache: %s', file)
              await factory()
              metrics.js.elapsed += measureElapsed(start)
              metrics.js.transformed++
              return
            }
            const currentSource = originalEntrySource
            const absoluteFile = path.resolve(outDir, file)
            const precheckOptions = createHandlerOptions(absoluteFile, {
              uniAppX: resolveUniAppXJsTransformEnabled(uniAppX),
              babelParserOptions: {
                plugins: ['typescript'],
                sourceType: 'unambiguous',
              },
            })
            if (!disableJsPrecheck && shouldSkipViteJsTransform(currentSource, precheckOptions)) {
              metrics.js.elapsed += measureElapsed(start)
              metrics.js.transformed++
              return
            }
            await factory()
            metrics.js.elapsed += measureElapsed(start)
            metrics.js.transformed++
          })
        })
      }
    }

    if (useIncrementalMode || isNativeAppStyleTarget) {
      const rememberedReplayGroups = collectRememberedCssReplayGroups(
        getRememberedCssSources?.(),
        opts,
        rootDir,
        isWebGeneratorTarget,
        shouldPreserveAppCssExtension,
      )
      for (const [outputFile, rememberedGroup] of rememberedReplayGroups) {
        const refreshedRememberedGroup = await Promise.all(rememberedGroup.map(async item => ({
          key: item.key,
          remembered: await refreshRememberedCssSource?.(item.remembered) ?? item.remembered,
        })))
        const rememberedCssSource = mergeRememberedCssSources(
          refreshedRememberedGroup.map(item => item.remembered),
          outputFile,
        )
        if (!rememberedCssSource) {
          continue
        }
        const { rawSource, sourceFile } = rememberedCssSource
        const outputCssHandlerOptions = getCssHandlerOptions(outputFile)
        const cssHandlerOptions = {
          ...getCssHandlerOptions(sourceFile),
          isMainChunk: outputCssHandlerOptions.isMainChunk || isMainStyleEntryCssFile(sourceFile),
        }
        const scopedSourceCandidateGetter = createScopedSourceCandidateGetter(outputFile, cssHandlerOptions)
        const scopedSourceCandidateSourceGetter = createScopedSourceCandidateSourceGetter(outputFile, cssHandlerOptions)
        const sourceTraceTokenSources = scopedSourceCandidateSourceGetter
          ? createCssTokenSourceMap(scopedSourceCandidateSourceGetter(undefined), opts)
          : undefined
        const annotateCss = (css: string) => annotateCssSourceTrace(css, {
          opts,
          tokenSources: sourceTraceTokenSources,
        })
        const scopedGeneratorRuntime = createScopedGeneratorRuntime(outputFile, cssHandlerOptions, generatorRuntime)
        const cssRuntimeSignature = createCssRuntimeSignature(
          createCandidateSignature(scopedGeneratorRuntime),
          await createScopedGeneratorCandidateSignature(
            rawSource,
            sourceFile,
            createCandidateSignature(scopedGeneratorRuntime),
            scopedSourceCandidateGetter,
            {
              includeFallbackSignature: cssHandlerOptions.isMainChunk,
            },
          ),
        )
        const cssRuntimeAffectingHash = cache.computeHash(createRuntimeAffectingSourceSignature(rawSource, 'css'))
        const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(cssRuntimeSignature, cssRuntimeAffectingHash)
        const rememberedKeys = refreshedRememberedGroup.map(item => item.key)
        const allRememberedSignaturesFresh = rememberedKeys.length > 0
          && rememberedKeys.every(key => getRememberedCssSignature?.(key) === rememberedCssRuntimeSignature)
        if (bundleFiles.includes(outputFile) || bundleFiles.includes(sourceFile) || allRememberedSignaturesFresh) {
          continue
        }
        tasks.push(timeTask('css.replay', async () => {
          const start = performance.now()
          const generated = await generateCssByGenerator({
            opts,
            runtimeState,
            runtime: scopedGeneratorRuntime,
            rawSource,
            file: sourceFile,
            cssHandlerOptions,
            cssUserHandlerOptions: getCssUserHandlerOptions(sourceFile),
            getSourceCandidatesForEntries: scopedSourceCandidateGetter,
            styleHandler,
            debug,
          })
          const css = annotateCss(generated?.css ?? (await styleHandler(rawSource, cssHandlerOptions)).css)
          for (const key of rememberedKeys) {
            setRememberedCssSignature?.(key, rememberedCssRuntimeSignature)
          }
          if (generated) {
            registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
            recordCssAssetResult?.(outputFile, css)
            const shouldInjectReplayCssIntoMain = shouldInjectCssIntoMainFromOutput(outputFile, sourceFile, outputCssHandlerOptions)
            recordViteProcessedCssAssetResult?.(sourceFile, css, {
              injectIntoMain: isAppOriginCssFile(outputFile)
                ? false
                : shouldInjectReplayCssIntoMain,
              outputFile,
            })
            debug('css replay generated result: %s bytes=%d', outputFile, css.length)
          }
          const replayAsset = createReplayCssAsset(outputFile, css)
          if (typeof this.emitFile === 'function') {
            this.emitFile({
              type: 'asset',
              fileName: outputFile,
              source: css,
            })
          }
          else {
            bundle[outputFile] = replayAsset
          }
          markCssAssetProcessed?.(replayAsset, outputFile)
          metrics.css.elapsed += measureElapsed(start)
          metrics.css.transformed++
          onUpdate(outputFile, rawSource, css)
          debug('css replay handle: %s', outputFile)
        }))
      }
    }

    pushConcurrentTaskFactories(tasks, jsTaskFactories)

    const tasksStart = performance.now()
    await Promise.all(tasks)
    recordTimingDetail('tasks', tasksStart)
    for (const apply of pendingLinkedUpdates) {
      apply()
    }
    const applyStyleSources = collectUniAppXHarmonyApplyStyleSources(bundle)
    if (opts.appType === 'uni-app-x' || isNativeAppStyleTarget || isHarmonyAppStyleTarget) {
      const getAssetSource = createUniAppXBundleAssetSourceGetter(bundle)
      const viteProcessedCssSources = [...(getViteProcessedCssAssetResults?.() ?? [])]
        .map(([, record]) => typeof record === 'string' ? record : record.css)
      const applyUtilities = collectUniAppXHarmonyApplyUtilities(bundle)
      const shouldInjectHarmonyBundleStyles = isHarmonyAppStyleTarget
      if (shouldInjectHarmonyBundleStyles) {
        if (applyUtilities.size > 0 && applyStyleSources.length > 0) {
          const outputFile = 'uni-app-x-harmony-apply.css'
          const cssHandlerOptions = getCssHandlerOptions(outputFile)
          const generated = await generateCssByGenerator({
            opts,
            runtimeState,
            runtime: new Set([
              ...generatorRuntime,
              ...applyUtilities,
            ]),
            rawSource: createUniAppXHarmonyApplyGeneratorSource(applyStyleSources, applyUtilities),
            file: outputFile,
            cssHandlerOptions,
            cssUserHandlerOptions: {
              ...cssHandlerOptions,
              isMainChunk: false,
            },
            getSourceCandidatesForEntries,
            styleHandler,
            debug,
          })
          if (generated?.css) {
            viteProcessedCssSources.push(annotateCssSourceTrace(generated.css, {
              opts,
              tokenSources: getSourceCandidateSourcesForEntries
                ? createCssTokenSourceMap(getSourceCandidateSourcesForEntries(undefined), opts)
                : undefined,
            }))
          }
        }
      }
      if (shouldInjectHarmonyBundleStyles && injectUniAppXHarmonyBundleStyles(bundle, { cssSources: viteProcessedCssSources })) {
        debug('uni-app-x harmony bundle styles inject')
      }
      for (const [file, item] of Object.entries(bundle)) {
        if (item.type !== 'asset' || !file.endsWith('.uvue.ts')) {
          continue
        }
        const currentSource = String(item.source)
        const nextSource = injectUniAppXStylePlaceholder(file, currentSource, getAssetSource)
        if (nextSource !== currentSource) {
          item.source = nextSource
          onUpdate(file, currentSource, nextSource)
          debug('uni-app-x style placeholder inject: %s', file)
        }
      }
    }
    const syncViteProcessedCssIntoMainCssAssets = () => {
      collectViteProcessedCssAssetResults(bundle, {
        opts,
        isViteProcessedCssAsset,
        markCssAssetProcessed,
        recordCssAssetResult,
        recordViteProcessedCssAssetResult,
        resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension),
        debug,
      })
      return injectViteProcessedCssIntoMainCssAssets(bundle, {
        opts,
        getViteProcessedCssAssetResults,
        markCssAssetProcessed,
        recordCssAssetResult,
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

    const stateUpdateStart = performance.now()
    updateBundleBuildState(
      state,
      snapshot,
      useIncrementalMode ? (linkedByEntry ?? new Map<string, Set<string>>()) : new Map<string, Set<string>>(),
      { incremental: useIncrementalMode },
    )
    state.generatorCandidateSignature = generatorCandidateSignature
    recordTimingDetail('state.update', stateUpdateStart)

    debug(
      'metrics iteration=%d runtime=%sms html(total=%d transform=%d hit=%d rate=%s elapsed=%sms) js(total=%d transform=%d hit=%d rate=%s elapsed=%sms) css(total=%d transform=%d hit=%d rate=%s elapsed=%sms)',
      useIncrementalMode ? state.iteration : 0,
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
      hmrTimingRecorder.record('generateBundle', performance.now() - hmrTimingStartedAt, timingDetails)
      hmrTimingRecorder.emitTotal()
    }
    onEnd()
    debug('end')
  }
}
