import type { OutputAsset, OutputChunk } from 'rollup'
import type { GenerateBundleContext, GenerateBundleThis } from './generate-bundle/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { isUniAppXHarmonyOutDir } from '@/uni-app-x/harmony'
import { isUniAppXHarmonyBundle } from '@/uni-app-x/style-asset'
import { resolveUniUtsPlatform } from '@/utils'
import { processCachedTask } from '../shared/cache'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap } from '../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { generateCssByGenerator, validateCandidatesByGenerator } from '../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, hasTailwindSourceDirectives } from '../shared/generator-css/directives'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { pushConcurrentTaskFactories } from '../shared/run-tasks'
import { createBundleModuleGraphOptions } from './bundle-entries'
import { buildBundleSnapshot, createBundleBuildState } from './bundle-state'
import { collectLegacyContainerCompatCandidates, collectUnescapedDynamicCandidates } from './generate-bundle/candidates'
import { collectConfiguredTailwindV4CssSourceEntries } from './generate-bundle/configured-css-sources'
import { createCssAssetEmitter, resolveAssetSourceFile } from './generate-bundle/css-assets'
import { normalizeRelativeCssConfigDirectives } from './generate-bundle/css-config-directives'
import { createCssHandlerOptionsCache, resolveViteCssHandlerExtraOptions } from './generate-bundle/css-handler-options'
import { canProcessViteSourceStyleAsCss, normalizeCssSourceForCompare, resolveMiniProgramStyleOutputExtension, resolveViteCssOutputFile, resolveViteCssPipelineOutputFile, SOURCE_STYLE_OUTPUT_EXT_RE } from './generate-bundle/css-output'
import { createCssRuntimeSignature, createCssTransformShareScopeKey } from './generate-bundle/css-share-scope'
import { hasOmittedKnownBundleFiles } from './generate-bundle/dirty-state'
import { resolveGenerateBundleEnvFlags } from './generate-bundle/env-flags'
import { finalizeGenerateBundle } from './generate-bundle/finalize'
import { createJsEntryResolver } from './generate-bundle/js-entries'
import { createJsHandlerOptionsFactory } from './generate-bundle/js-handler-options'
import { createLinkedUpdateHelpers } from './generate-bundle/js-linking'
import { processJsBundleEntry } from './generate-bundle/js-processing'
import { createEmptyMetrics, measureElapsed } from './generate-bundle/metrics'
import { logBundleProcessPlan } from './generate-bundle/process-plan'
import { createRememberedCssRuntimeSignature, findRememberedCssSources, mergeRememberedCssSources } from './generate-bundle/remembered-css'
import { processRememberedCssReplay } from './generate-bundle/remembered-css-replay'
import { registerGeneratorDependencies } from './generate-bundle/rollup-assets'
import { collectCssExtensionByStem, collectJsImportedCssFiles, collectRuntimeLinkedCssFiles } from './generate-bundle/runtime-linked-css'
import { createScopedGeneratorCandidateSignature, createScopedGeneratorRuntime as resolveScopedGeneratorRuntime } from './generate-bundle/scoped-generator'
import { hasSfcStyleSources, hasTailwindGenerationSource, normalizeSfcSourceFileForCompare, resolveSfcStyleSourceFromOutputFile, resolveSourceStyleSourceFromOutputFile } from './generate-bundle/sfc-style-source'
import { createCandidateSignature, getSnapshotHash, hasRuntimeAffectingSourceChanges, summarizeStringDiff } from './generate-bundle/signatures'
import { createSubpackageSourceCandidateScope } from './generate-bundle/source-candidate-scope'
import { collectMiniProgramSubpackageRoots, isSubpackageOutputFile } from './generate-bundle/subpackages'
import { createBundleTaskTimer } from './generate-bundle/timing'
import { getLastCssResult, normalizeViteCssCacheKey, rememberLastCssResult } from './generate-bundle/vite-css-cache'
import { collectViteProcessedCssAssetResults, isCssImportOnlyBundleAsset } from './processed-css-assets'
import { createRuntimeAffectingSourceSignature } from './runtime-affecting-signature'
import { resolveUniAppXNativeCssHandlerOptions } from './uni-app-x-css-options'
import { resolveSourceRootFromBundleGraph, resolveWeappViteSourceRoot } from './weapp-vite-config'

export { normalizeBundleFileNameKeysForTest } from './generate-bundle/bundle-file-names'
export { resolveMiniProgramStyleOutputExtension, resolveReplayCssOutputFile, resolveReplayCssOutputFileFromSourceRoot, resolveViteCssPipelineOutputFile } from './generate-bundle/css-output'
export { resolveRememberedCssSourceForTest } from './generate-bundle/remembered-css'
export type { GenerateBundleContext, GenerateBundleThis, RememberedCssSource } from './generate-bundle/types'

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const state = createBundleBuildState()
  const lastCssResultByFile = new Map<string, string>()
  const lastCssSourceHashByFile = new Map<string, string>()
  let currentOutDir: string | undefined
  let currentSubpackageRoots: Set<string> | undefined
  const cssHandlerOptions = createCssHandlerOptionsCache({
    getAppType: () => context.opts.appType,
    mainCssChunkMatcher: context.opts.mainCssChunkMatcher,
    getMajorVersion: () => context.runtimeState.twPatcher.majorVersion,
    getOutputRoot: () => currentOutDir,
    getExtraOptions: file => ({
      ...resolveViteCssHandlerExtraOptions(file),
      ...resolveUniAppXNativeCssHandlerOptions(context.opts),
      ...(currentSubpackageRoots && isSubpackageOutputFile(file, currentSubpackageRoots)
        ? { isMainChunk: false }
        : {}),
    }),
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
      getSourceCandidateSource,
      getSourceCandidateSources,
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
      pruneViteCssCaches,
      getViteCssCacheStats,
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
    const sourceRoot = resolveWeappViteSourceRoot(resolvedConfig, opts.appType)
      ?? resolveSourceRootFromBundleGraph(resolvedConfig, bundle)
    const outDir = resolvedConfig?.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir
    const defaultStyleOutputExtension = resolveMiniProgramStyleOutputExtension({
      files: Object.keys(bundle),
    })

    await runtimeState.readyPromise
    debug('start')
    onStart()
    const collectedBundlerGeneratedCssFiles = new Set(
      Object.entries(bundle)
        .filter(([, output]) => output.type === 'asset' && hasBundlerGeneratedCssMarker(output.source))
        .map(([file]) => file),
    )
    const subpackageRoots = collectMiniProgramSubpackageRoots(bundle)
    if (subpackageRoots) {
      currentSubpackageRoots = subpackageRoots
    }
    collectViteProcessedCssAssetResults(bundle, {
      opts,
      isViteProcessedCssAsset,
      markCssAssetProcessed,
      recordCssAssetResult,
      recordViteProcessedCssAssetResult,
      resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension, sourceRoot, defaultStyleOutputExtension, Object.keys(bundle)),
      subpackageRoots: currentSubpackageRoots,
      debug,
    })
    const hmrTimingStartedAt = performance.now()
    const timingDetails: Record<string, number> = {}
    const recordTimingDetail = (name: string, startedAt: number) => {
      timingDetails[name] = (timingDetails[name] ?? 0) + Math.max(0, performance.now() - startedAt)
    }
    const timeTask = createBundleTaskTimer(recordTimingDetail)
    const emitOrReplayCssAsset = createCssAssetEmitter(this)

    const metrics = createEmptyMetrics()
    const envFlags = resolveGenerateBundleEnvFlags()
    const bundleFiles = Object.keys(bundle)
    const activeViteCssCacheFiles = new Set(bundleFiles.map(normalizeViteCssCacheKey))
    const configuredTailwindV4CssSourceEntries = collectConfiguredTailwindV4CssSourceEntries(opts, opts.tailwindcssBasedir ?? rootDir)
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
    const snapshot = buildBundleSnapshot(bundle, opts, outDir, state, envFlags.disableDirtyOptimization || !useIncrementalMode, {
      hasOmittedKnownFiles,
    })
    const {
      createScopedSourceCandidateGetter,
      createScopedSourceCandidateSourceGetter,
      shouldExcludeSubpackageSourceCandidates,
      shouldInjectCssIntoMainFromOutput,
    } = createSubpackageSourceCandidateScope({
      getSourceCandidateSourcesForEntries,
      getSourceCandidatesForEntries,
      projectRoot: (opts.tailwindcssPatcherOptions as { projectRoot?: string | undefined } | undefined)?.projectRoot,
      rootDir,
      snapshot,
      sourceRoot,
      subpackageRoots: currentSubpackageRoots,
      tailwindcssBasedir: opts.tailwindcssBasedir,
      useIncrementalMode,
    })
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
      rawSource?: string | undefined,
      sourceFile?: string | undefined,
    ) => resolveScopedGeneratorRuntime({
      cssHandlerOptions,
      fallbackRuntime: runtime,
      getSourceCandidatesForEntries,
      majorVersion: runtimeState.twPatcher.majorVersion,
      outputFile,
      rawSource,
      shouldExcludeSubpackageSourceCandidates,
      sourceFile,
      scopedSourceCandidateGetter: createScopedSourceCandidateGetter(outputFile, cssHandlerOptions),
    })
    const jsEntries = snapshot.jsEntries
    const getJsEntry = createJsEntryResolver(jsEntries)
    const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
    const hasCssAssetEntry = snapshot.entries.some(entry => entry.type === 'css' && entry.output.type === 'asset')
    const hasRuntimeAffectingChanges = hasRuntimeAffectingSourceChanges(snapshot.runtimeAffectingChangedByType)
    const useV3OxideSourceRuntime = runtimeState.twPatcher.majorVersion === 3
      && sourceCandidates.size > 0
      && hasCssAssetEntry
      && !envFlags.forceRuntimeRefreshByEnv
      && !envFlags.disableV3OxideSourceRuntime
    const runtimeStart = performance.now()
    const transformBaseRuntime = useV3OxideSourceRuntime
      ? await ensureBundleRuntimeClassSet(snapshot, envFlags.forceRuntimeRefreshByEnv, {
          transformOnly: true,
        })
      : undefined
    // Tailwind v4 的任意值在 uni-app/Taro 等上游输出里可能已经被转义。
    // HTML/JS 发生运行时相关变更时，优先回到源码扫描刷新集合，避免用旧集合重放主样式产物。
    const forceV4RuntimeRefreshBySource = runtimeState.twPatcher.majorVersion === 4
      && forceRuntimeRefreshBySource
    const runtime = isWebGeneratorTarget && !shouldGenerateWebCssByGenerator
      ? new Set<string>()
      : useV3OxideSourceRuntime
        ? await ensureBundleRuntimeClassSet(snapshot, envFlags.forceRuntimeRefreshByEnv, {
            allowBaselineOnlyInitialSync: true,
            baseClassSet: sourceCandidates,
          })
        : useBundleRuntimeClassSet
          ? await ensureBundleRuntimeClassSet(snapshot, envFlags.forceRuntimeRefreshByEnv || forceV4RuntimeRefreshBySource, {
              allowBaselineOnlyInitialSync: buildCommand,
            })
          : await context.ensureRuntimeClassSet(envFlags.forceRuntimeRefreshByEnv)
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
    if (runtimeState.twPatcher.majorVersion === 3 && generatorRuntime.size === 0) {
      generatorRuntime = await context.ensureRuntimeClassSet(envFlags.forceRuntimeRefreshByEnv)
      transformRuntime = generatorRuntime
    }
    const cssEntries = snapshot.entries.filter(entry =>
      entry.type === 'css' && entry.output.type === 'asset')
    if (runtimeState.twPatcher.majorVersion === 4 && sourceCandidates.size > 0 && jsEntries.size > 0) {
      const mainCssEntry = cssEntries.find(entry => getCssHandlerOptions(entry.file).isMainChunk) ?? cssEntries[0]
      if (mainCssEntry) {
        const validatedSourceRuntime = await validateCandidatesByGenerator({
          opts,
          runtimeState,
          candidates: filteredGeneratorCandidates,
          rawSource: mainCssEntry.source,
          file: mainCssEntry.file,
          cssHandlerOptions: getCssHandlerOptions(mainCssEntry.file),
          cssUserHandlerOptions: getCssUserHandlerOptions(mainCssEntry.file),
          styleHandler,
          debug,
          skipGenerateFallback: true,
        })
        if (validatedSourceRuntime.size > 0) {
          transformRuntime = new Set([
            ...transformRuntime,
            ...validatedSourceRuntime,
          ])
        }
      }
    }
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
      }
    }
    const generatorCandidateSignature = createCandidateSignature(generatorRuntime)
    const generatorCandidatesChanged = state.generatorCandidateSignature !== generatorCandidateSignature
    const cssExtensionByStem = collectCssExtensionByStem(bundleFiles, opts.cssMatcher)
    const jsImportedCssFiles = collectJsImportedCssFiles(snapshot)
    const runtimeLinkedCssFiles = new Set([
      ...collectRuntimeLinkedCssFiles(snapshot, cssExtensionByStem, defaultStyleOutputExtension),
      ...jsImportedCssFiles,
    ])
    for (const file of runtimeLinkedCssFiles) {
      if (snapshot.sourceHashByFile.has(file)) {
        processFiles.css.add(file)
        continue
      }
      const outputFile = resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension, sourceRoot, defaultStyleOutputExtension, bundleFiles)
      const inferredSourceStyle = resolveSourceStyleSourceFromOutputFile(
        outputFile,
        snapshot,
        outDir,
        sourceRoot,
        getSourceCandidateSource,
        jsImportedCssFiles.has(file) ? getSourceCandidateSources : undefined,
        configuredTailwindV4CssSourceEntries.map(entry => [entry.file, entry.source] as [string, string]),
        debug,
      )
      const rawSource = inferredSourceStyle?.rawSource
        ?? getSourceCandidateSource?.(path.resolve(outDir, file))
        ?? getSourceCandidateSource?.(file)
      if (rawSource === undefined || !hasTailwindGenerationSource(rawSource)) {
        continue
      }
      rememberCssSource?.({
        outputFile,
        rawSource,
        sourceFile: inferredSourceStyle?.sourceFile ?? path.resolve(outDir, file),
      })
    }
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
    const transformRuntimeSignature = createCandidateSignature(transformRuntime)
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
    const activeProcessCacheKeys = new Set<string>()
    const activeProcessHashKeys = new Set<string | number>()
    const rememberProcessCacheKey = (cacheKey: string, hashKey: string | number = cacheKey) => {
      activeProcessCacheKeys.add(cacheKey)
      activeProcessHashKeys.add(hashKey)
    }
    const tasks: Promise<void>[] = []
    const cssTaskFactories: Array<() => Promise<void>> = []
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
        const cacheKey = file
        const hashKey = `${file}:html:${transformRuntimeSignature}`
        rememberProcessCacheKey(cacheKey, hashKey)
        tasks.push(timeTask('html', () =>
          processCachedTask<string>({
            cache,
            cacheKey,
            hashKey,
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
        // uni-app dev/watch 会在每轮产物阶段重写主样式产物。
        // 即便本轮 CSS 原文 hash 未变化，也必须回填缓存中的转译结果，
        // 否则会退回未转译内容并与同轮 JS/WXML 的 class 改写失配。
        const assetSourceFile = resolveAssetSourceFile(originalSource, file)
        const rawSource = normalizeRelativeCssConfigDirectives(originalEntrySource, assetSourceFile, outDir, opts)
        const outputFile = resolveViteCssOutputFile(file, opts, isWebGeneratorTarget, shouldPreserveAppCssExtension, defaultStyleOutputExtension, bundleFiles)
        activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
        if (outputFile !== file && !canProcessViteSourceStyleAsCss(rawSource, file)) {
          delete bundle[file]
          debug('css skip raw source style asset: %s -> %s', file, outputFile)
          continue
        }
        const applyCssResult = (source: string) => {
          if (outputFile !== file) {
            emitOrReplayCssAsset(outputFile, source)
            if (!viteProcessedCssAsset && SOURCE_STYLE_OUTPUT_EXT_RE.test(file)) {
              delete bundle[file]
            }
            else {
              originalSource.source = ''
            }
            return
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
          opts.cssMatcher,
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
        const hasTailwindRememberedSource = rememberedCssSources.some(remembered =>
          hasTailwindGenerationSource(remembered.rawSource),
        )
        if (!hasTailwindRememberedSource) {
          const inferredSourceStyle = resolveSourceStyleSourceFromOutputFile(
            outputFile,
            snapshot,
            outDir,
            sourceRoot,
            getSourceCandidateSource,
            getSourceCandidateSources,
            configuredTailwindV4CssSourceEntries.map(entry => [entry.file, entry.source] as [string, string]),
            debug,
          )
          if (inferredSourceStyle) {
            rememberedCssSources = [inferredSourceStyle]
          }
        }
        const rememberedCssSource = mergeRememberedCssSources(rememberedCssSources, outputFile)
        const shouldKeepImportedCssShell = isCssImportOnlyBundleAsset(bundle, file, rawSource)
        const useRememberedCssSource = !shouldKeepImportedCssShell
          && rememberedCssSource != null
          && (
            normalizeOutputPathKey(rememberedCssSource.sourceFile) !== normalizeOutputPathKey(file)
            || (!hasTailwindGenerationSource(rawSource) && hasTailwindGenerationSource(rememberedCssSource.rawSource))
          )
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
        if (shouldKeepImportedCssShell && !hasCurrentTailwindGenerationDirective) {
          applyCssResult(rawSource)
          markCssAssetProcessed?.(originalSource, outputFile)
          recordCssAssetResult?.(outputFile, rawSource)
          onUpdate(outputFile, rawSource, rawSource)
          debug('css preserve imported shell asset: %s', outputFile)
          continue
        }
        const hasRememberedApplyDirective = rememberedCssSource != null
          && hasTailwindApplyDirective(rememberedCssSource.rawSource)
        const hasRememberedTailwindGenerationSource = rememberedCssSource != null
          && hasTailwindGenerationSource(rememberedCssSource.rawSource)
        const hasSameOutputRememberedTailwindGenerationSource = hasRememberedTailwindGenerationSource
          && rememberedCssSource != null
          && normalizeOutputPathKey(rememberedCssSource.outputFile) === normalizeOutputPathKey(outputFile)
        const hasStaleViteProcessedCssSource = vitePipelineCssAsset
          && hasDifferentRememberedCssSource
          && (
            hasCurrentTailwindGenerationDirective
            || hasRememberedApplyDirective
            || (
              runtimeState.twPatcher.majorVersion === 4
              && hasRememberedTailwindGenerationSource
            )
          )
        const generatorSourceFile = vitePipelineCssAsset
          ? rememberedCssSource?.sourceFile ?? assetSourceFile
          : assetSourceFile
        const outputCssHandlerOptions = getCssHandlerOptions(outputFile)
        const cssHandlerOptions = vitePipelineCssAsset
          ? {
              ...getCssHandlerOptions(generatorSourceFile),
              isMainChunk: outputCssHandlerOptions.isMainChunk,
            }
          : getCssHandlerOptions(file)
        const scopedSourceCandidateGetter = createScopedSourceCandidateGetter(outputFile, cssHandlerOptions)
        const scopedSourceCandidateSourceGetter = createScopedSourceCandidateSourceGetter(outputFile, cssHandlerOptions)
        const sourceTraceTokenSources = scopedSourceCandidateSourceGetter
          ? createCssTokenSourceMap(scopedSourceCandidateSourceGetter(undefined), opts)
          : undefined
        const sourceTraceSignature = createCssSourceTraceCacheSignature(sourceTraceTokenSources, opts)
        const scopedGeneratorRuntime = await createScopedGeneratorRuntime(outputFile, cssHandlerOptions, generatorRuntime, generatorRawSource, generatorSourceFile)
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
        const shouldRegenerateCollectedViteCss = viteProcessedCssAsset
          && useIncrementalMode
          && state.generatorCandidateSignature !== undefined
          && generatorCandidatesChanged
          && (
            hasTailwindGenerationSource(generatorRawSource)
            || hasBundlerGeneratedCssMarker(rawSource)
            || (
              rememberedCssSource != null
              && hasTailwindGenerationSource(rememberedCssSource.rawSource)
            )
          )
        const shouldRefreshViteProcessedCssByCandidates = viteProcessedCssAsset
          && useIncrementalMode
          && state.generatorCandidateSignature !== undefined
          && generatorCandidatesChanged
        const shouldInjectVitePipelineCssIntoMain = vitePipelineCssAsset
          && outputCssHandlerOptions.isMainChunk !== true
          && shouldInjectCssIntoMainFromOutput(outputFile, generatorSourceFile, outputCssHandlerOptions)
        const shouldTrackGeneratorRuntime = hasStaleViteProcessedCssSource
          || shouldRegenerateMainPackageCssWithScopedCandidates
          || hasCurrentTailwindGenerationDirective
          || hasSameOutputRememberedTailwindGenerationSource
          || (shouldProcessTailwindGeneration && (
            !useIncrementalMode
            || cssHandlerOptions.isMainChunk
            || processFiles.css.has(file)
            || runtimeLinkedCssFiles.has(file)
            || runtimeLinkedCssFiles.has(outputFile)
            || shouldRegenerateCollectedViteCss
            || (hasRuntimeAffectingChanges && (alreadyProcessedCssAsset || vitePipelineCssAsset))
          ))
        const shouldPreserveCollectedViteCssAsset = !shouldRegenerateCollectedViteCss
          && (
            state.generatorCandidateSignature === undefined
            || !generatorCandidatesChanged
          )
          && (
            collectedBundlerGeneratedCssFiles.has(file)
            || hasBundlerGeneratedCssMarker(rawSource)
          )
        if (
          alreadyProcessedCssAsset
          && !shouldRefreshViteProcessedCssByCandidates
          && !hasStaleViteProcessedCssSource
          && !hasRememberedApplySource
          && !shouldRegenerateMainPackageCssWithScopedCandidates
          && (!shouldTrackGeneratorRuntime || shouldPreserveCollectedViteCssAsset)
        ) {
          const nextCss = stripBundlerGeneratedCssMarkers(rawSource)
          applyCssResult(nextCss)
          markCssAssetProcessed?.(originalSource, outputFile)
          recordCssAssetResult?.(outputFile, nextCss)
          recordViteProcessedCssAssetResult?.(outputFile, nextCss, {
            injectIntoMain: outputCssHandlerOptions.isMainChunk ? false : shouldInjectVitePipelineCssIntoMain,
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
                majorVersion: runtimeState.twPatcher.majorVersion,
              },
            )
          : trackedGeneratorCandidateSignature
        const cssRuntimeSignature = createCssRuntimeSignature(runtimeSignature, scopedGeneratorCandidateSignature)
        const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(cssRuntimeSignature, cssRuntimeAffectingHash)
        const cssSharedCacheKey = `${cssShareScope}:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}:${cssHandlerOptions.isMainChunk ? '1' : '0'}:${cssRuntimeAffectingSignature}:${sourceTraceSignature}`
        const cssCacheKey = file
        const cssHashKey = `${file}:css:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}`
        const cssLinkedImpactSignature = runtimeLinkedCssFiles.has(file) || runtimeLinkedCssFiles.has(outputFile)
          ? [
              ...[...snapshot.runtimeAffectingChangedByType.html]
                .sort()
                .map(changedFile => snapshot.runtimeAffectingSignatureByFile.get(changedFile) ?? ''),
              ...[...snapshot.runtimeAffectingChangedByType.js]
                .sort()
                .map(changedFile => snapshot.runtimeAffectingSignatureByFile.get(changedFile) ?? ''),
            ].join(':')
          : ''
        if (!shouldTrackGeneratorRuntime && !runtimeLinkedCssFiles.has(file) && !runtimeLinkedCssFiles.has(outputFile)) {
          const lastCss = getLastCssResult(lastCssResultByFile, outputFile, file)
          if (lastCss != null) {
            applyCssResult(lastCss)
            markCssAssetProcessed?.(originalSource, outputFile)
            metrics.css.cacheHits++
            debug('css replay last result: %s', outputFile)
            continue
          }
        }
        rememberProcessCacheKey(cssCacheKey, cssHashKey)
        cssTaskFactories.push(() => timeTask('css', () =>
          processCachedTask<string>({
            cache,
            cacheKey: cssCacheKey,
            hashKey: cssHashKey,
            hash: `${cssRuntimeAffectingHash}:${scopedGeneratorCandidateSignature}:${sourceTraceSignature}:${cssLinkedImpactSignature}`,
            applyResult(source) {
              applyCssResult(source)
              rememberLastCssResult(lastCssResultByFile, lastCssSourceHashByFile, outputFile, source, cssRuntimeAffectingHash)
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
                  ? getLastCssResult(lastCssResultByFile, outputFile, file)
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
                  if (envFlags.debugCssDiff) {
                    debug('css diff %s: %s', generatorSourceFile, summarizeStringDiff(generatorRawSource, tracedCss))
                  }
                  debug('css generated result: %s bytes=%d', file, tracedCss.length)
                  recordCssAssetResult?.(outputFile, tracedCss)
                  recordViteProcessedCssAssetResult?.(outputFile, tracedCss, {
                    injectIntoMain: outputCssHandlerOptions.isMainChunk ? false : shouldInjectVitePipelineCssIntoMain,
                    outputFile,
                  })
                  if (vitePipelineCssAsset && shouldInjectVitePipelineCssIntoMain) {
                    recordViteProcessedCssAssetResult?.(file, tracedCss, {
                      injectIntoMain: shouldInjectVitePipelineCssIntoMain,
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
                if (envFlags.debugCssDiff) {
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

      if (isWebGeneratorTarget) {
        debug('js skip web target: %s', file)
        continue
      }
      processJsBundleEntry({
        applyLinkedUpdates,
        bundle,
        cache,
        createHandlerOptions,
        debug,
        disableJsPrecheck: envFlags.disableJsPrecheck,
        entry,
        getJsEntry,
        jsHandler,
        jsTaskFactories,
        linkedByEntry,
        metrics,
        onUpdate,
        outDir,
        processFiles,
        rememberProcessCacheKey,
        runtimeSignature,
        snapshot,
        timeTask,
        transformRuntime,
        uniAppX,
        useIncrementalMode,
      })
    }

    if (shouldProcessTailwindGeneration || useIncrementalMode || isNativeAppStyleTarget) {
      await processRememberedCssReplay({
        addWatchFile,
        activeViteCssCacheFiles,
        bundle,
        bundleFiles,
        cache,
        createScopedGeneratorRuntime,
        createScopedSourceCandidateGetter,
        createScopedSourceCandidateSourceGetter,
        cssTaskFactories,
        debug,
        defaultStyleOutputExtension,
        emitOrReplayCssAsset,
        generatorRuntime,
        getCssHandlerOptions,
        getCssUserHandlerOptions,
        getRememberedCssSignature,
        getRememberedCssSources,
        isNativeAppStyleTarget,
        isWebGeneratorTarget,
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
      })
    }

    pushConcurrentTaskFactories(tasks, jsTaskFactories)
    await finalizeGenerateBundle({
      activeProcessCacheKeys,
      activeProcessHashKeys,
      activeViteCssCacheFiles,
      bundle,
      bundleFiles,
      cache,
      cssTaskFactories,
      debug,
      defaultStyleOutputExtension,
      formatIteration: useIncrementalMode ? state.iteration : 0,
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
      outDir,
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
    })
  }
}
