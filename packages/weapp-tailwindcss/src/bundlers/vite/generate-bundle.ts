import type { OutputAsset, OutputChunk } from 'rollup'
import type { GenerateBundleContext, GenerateBundleThis } from './generate-bundle/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { transformWebCssCompat } from '@weapp-tailwindcss/postcss'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { resolveGeneratorRuntimeBranch, shouldUseMiniProgramCssBranch } from '@/runtime-branch'
import { resolveTailwindcssOptions } from '@/tailwindcss/runtime-options'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { resolveUniUtsPlatform } from '@/utils'
import { processCachedTask } from '../shared/cache'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap } from '../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { validateCandidatesByGenerator } from '../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, hasTailwindSourceDirectives } from '../shared/generator-css/directives'
import { isPureLocalCssImportWrapper } from '../shared/generator-css/local-imports'
import { normalizeMiniProgramGeneratorCssSource } from '../shared/generator-css/output-import-shell'
import { hasUserCssLayerBlocks } from '../shared/generator-css/user-css'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { generateTailwindV4Css } from '../shared/v4-generation-core'
import { createBundleModuleGraphOptions } from './bundle-entries'
import { buildBundleSnapshot, createBundleBuildState } from './bundle-state'
import { syncBundleMarkupCandidates } from './generate-bundle/bundle-markup-candidates'
import { collectConfiguredTailwindV4CssSourceEntries } from './generate-bundle/configured-css-sources'
import { createCssAssetEmitter, resolveAssetSourceFile } from './generate-bundle/css-assets'
import { normalizeRelativeCssConfigDirectives } from './generate-bundle/css-config-directives'
import { createCssHandlerOptionsCache, resolveViteCssHandlerExtraOptions } from './generate-bundle/css-handler-options'
import { normalizeCssSourceForCompare, resolveMiniProgramStyleOutputExtension, resolveReplayCssOutputFile, resolveViteCssPipelineOutputFile } from './generate-bundle/css-output'
import { applyCssResultToBundle, createMatchedCssSourceOutputResolver, hasViteProcessedCssResultForSource, resolveCssBundleOutputFile, resolveOutputFileFromMatchedCssSource, shouldSkipRawSourceStyleAsset } from './generate-bundle/css-output-helpers'
import { createCssRuntimeSignature, createCssTransformShareScopeKey } from './generate-bundle/css-share-scope'
import { hasOmittedKnownBundleFiles } from './generate-bundle/dirty-state'
import { resolveGenerateBundleEnvFlags } from './generate-bundle/env-flags'
import { finalizeGenerateBundle } from './generate-bundle/finalize'
import { processHtmlBundleEntry } from './generate-bundle/html-processing'
import { createJsEntryResolver } from './generate-bundle/js-entries'
import { createJsHandlerOptionsFactory } from './generate-bundle/js-handler-options'
import { createLinkedUpdateHelpers } from './generate-bundle/js-linking'
import { processJsBundleEntry } from './generate-bundle/js-processing'
import { createEmptyMetrics, measureElapsed } from './generate-bundle/metrics'
import { logBundleProcessPlan } from './generate-bundle/process-plan'
import { createRememberedCssRuntimeSignature, findRememberedCssSources, mergeRememberedCssSources } from './generate-bundle/remembered-css'
import { processRememberedCssReplay, shouldSkipRawRememberedCssSource } from './generate-bundle/remembered-css-replay'
import { registerGeneratorDependencies } from './generate-bundle/rollup-assets'
import { isRootMiniProgramStyleOutputFile, resolveSingleCssImportOutputFile, shouldKeepRootMiniProgramStyleAsImportShell, shouldMoveRootMiniProgramStyleToImportShellOrigin, shouldPreserveFrameworkRootMiniProgramImportShell } from './generate-bundle/root-style-output'
import { collectCssExtensionByStem, collectJsImportedCssFiles, collectRuntimeLinkedCssFiles } from './generate-bundle/runtime-linked-css'
import { rememberRuntimeLinkedCssSources } from './generate-bundle/runtime-linked-source-memory'
import { createScopedGeneratorCandidateSignature, createScopedGeneratorSourceTraceMap, createScopedGeneratorRuntime as resolveScopedGeneratorRuntime } from './generate-bundle/scoped-generator'
import { hasSfcStyleSources, hasTailwindGenerationSource, normalizeSfcSourceFileForCompare, resolveSfcStyleSourceFromOutputFile, resolveSourceStyleSourceFromOutputFile } from './generate-bundle/sfc-style-source'
import { createCandidateSignature, hasRuntimeAffectingSourceChanges, summarizeStringDiff } from './generate-bundle/signatures'
import { createSubpackageSourceCandidateScope } from './generate-bundle/source-candidate-scope'
import { resolveCurrentSourceCandidateFile, resolveCurrentSourceCandidateSource } from './generate-bundle/source-candidate-source'
import { collectMiniProgramSubpackageRoots, isSubpackageOutputFile } from './generate-bundle/subpackages'
import { selectTailwindV4GenerationCssSourceForOutput } from './generate-bundle/tailwind-v4-css-source'
import { createTemporaryCssAssetSourceResolver, isTemporaryCssAssetFile } from './generate-bundle/temporary-css-assets'
import { createBundleTaskTimer } from './generate-bundle/timing'
import { createTransformFilter, createTransformFilterSignature, shouldSkipViteAssetTransform, shouldSkipViteJsChunkTransform } from './generate-bundle/transform-filter'
import { getLastCssResult, normalizeViteCssCacheKey, rememberLastCssResult } from './generate-bundle/vite-css-cache'
import { collectViteProcessedCssAssetResults, isCssImportOnlyBundleAsset, removeCssCoveredByRootStyleBundleSources } from './processed-css-assets'
import { createRuntimeAffectingSourceSignature } from './runtime-affecting-signature'
import { resolveSourceRootFromBundleGraph, resolveWeappViteSourceRoot } from './weapp-vite-config'
import { resolveViteWebCssCompatOptions, shouldApplyViteWebCssCompat } from './web-css-compat'

export { normalizeBundleFileNameKeysForTest } from './generate-bundle/bundle-file-names'
export { resolveMiniProgramStyleOutputExtension, resolveReplayCssOutputFile, resolveReplayCssOutputFileFromSourceRoot, resolveViteCssPipelineOutputFile, resolveViteCssPipelineOutputFileFromSourceFile } from './generate-bundle/css-output'
export { resolveRememberedCssSourceForTest } from './generate-bundle/remembered-css'
export { shouldKeepRootMiniProgramStyleAsImportShell, shouldMoveRootMiniProgramStyleToImportShellOrigin } from './generate-bundle/root-style-output'

export type { GenerateBundleContext, GenerateBundleThis, RememberedCssSource } from './generate-bundle/types'

function inferPlatformFromViteOutDir(outDir: string | undefined) {
  const segment = outDir ? path.basename(path.normalize(outDir)) : undefined
  if (!segment) {
    return undefined
  }
  const normalized = segment.trim().toLowerCase()
  if (
    normalized === 'h5'
    || normalized === 'web'
    || normalized === 'app'
    || normalized === 'app-plus'
    || normalized.startsWith('app-')
    || normalized.startsWith('mp-')
    || normalized.startsWith('quickapp-webview')
  ) {
    return normalized
  }
}

function hasTailwindPluginDirective(source: string) {
  return /@plugin\b/.test(source)
}

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const state = createBundleBuildState()
  const lastCssResultByFile = new Map<string, string>()
  const lastCssSourceHashByFile = new Map<string, string>()
  const lastCssRawSourceHashByFile = new Map<string, string>()
  const frameworkRootImportShellTargetByFile = context.frameworkRootImportShellTargetByFile ?? new Map<string, string>()
  let currentOutDir: string | undefined
  let currentSubpackageRoots: Set<string> | undefined
  const createInitialCssPipelineContext = (file: string) => {
    const resolvedConfig = context.getResolvedConfig()
    const platform = context.opts.cssOptions?.platform
      ?? context.opts.platform
      ?? inferPlatformFromViteOutDir(resolvedConfig?.build?.outDir)
    const currentGeneratorOptions = normalizeWeappTailwindcssGeneratorOptions(context.opts.generator, {
      appType: context.opts.appType,
      platform,
      tailwindcssMajorVersion: context.runtimeState.tailwindRuntime.majorVersion,
      uniAppX: context.opts.uniAppX,
    })
    const currentGeneratorBranch = resolveGeneratorRuntimeBranch(currentGeneratorOptions, {
      appType: context.opts.appType,
      platform,
      tailwindcssMajorVersion: context.runtimeState.tailwindRuntime.majorVersion,
      uniAppX: context.opts.uniAppX,
    })
    return {
      currentGeneratorBranch,
      currentGeneratorOptions,
      file,
      opts: context.opts,
      resolvedConfig,
      resolveStylePlatform: () => platform,
    }
  }
  const cssHandlerOptions = createCssHandlerOptionsCache({
    getAppType: () => context.opts.appType,
    mainCssChunkMatcher: context.opts.mainCssChunkMatcher,
    getMajorVersion: () => context.runtimeState.tailwindRuntime.majorVersion,
    getOutputRoot: () => currentOutDir,
    getExtraOptions: file => ({
      ...resolveViteCssHandlerExtraOptions(file),
      ...(context.cssPipelineStrategy?.getCssHandlerExtraOptions?.(createInitialCssPipelineContext(file)) ?? {}),
      ...(currentSubpackageRoots && isSubpackageOutputFile(file, currentSubpackageRoots)
        ? { isMainChunk: false }
        : {}),
    }),
  })
  return async function generateBundle(this: GenerateBundleThis, _opt: unknown, bundle: Record<string, OutputAsset | OutputChunk>) {
    if (context.shouldProcessBundle?.() === false) {
      return
    }
    const processMarkupAndScripts = context.processMarkupAndScripts !== false
    const processStyles = context.shouldProcessStyles?.() ?? context.processStyles !== false
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
      mergeSourceCandidateSource,
      getSourceCandidatesForEntries,
      getSourceCandidateSourcesForEntries,
      waitForSourceCandidateSyncs,
      rememberCssSource,
      refreshRememberedCssSource,
      getRememberedCssSources,
      getRememberedCssSignature,
      setRememberedCssSignature,
      getKnownCssSource,
      getKnownSfcSource,
      getOriginalCssLayerSource,
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
    const getCssSource = (sourceFile: string) => getKnownCssSource?.(sourceFile) ?? getSourceCandidateSource?.(sourceFile)
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
    const resolvedConfig = getResolvedConfig()
    const uniUtsPlatform = resolveUniUtsPlatform()
    const generatorPlatform = opts.cssOptions?.platform
      ?? opts.platform
      ?? inferPlatformFromViteOutDir(resolvedConfig?.build?.outDir)
    const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(opts.generator, {
      appType: opts.appType,
      platform: generatorPlatform,
      tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
      uniAppX,
      uniUtsPlatform,
    })
    const generatorBranch = resolveGeneratorRuntimeBranch(generatorOptions, {
      appType: opts.appType,
      platform: generatorPlatform,
      tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
      uniAppX,
      uniUtsPlatform,
    })
    const cssPipelineContext = {
      bundle,
      currentGeneratorBranch: generatorBranch,
      currentGeneratorOptions: generatorOptions,
      opts,
      resolvedConfig,
      resolveStylePlatform: () => generatorPlatform,
    }
    const isWebGeneratorTarget = generatorBranch.isWeb
    const shouldApplyWebCssCompat = shouldApplyViteWebCssCompat(cssPipelineContext, context.cssPipelineStrategy)
    const transformWebTargetCss = (css: string) => {
      return context.cssPipelineStrategy?.transformGeneratedCss?.(css, {
        ...cssPipelineContext,
        defaultWebCssCompat: value => transformWebCssCompat(value, resolveViteWebCssCompatOptions(cssPipelineContext)),
        removeScopedPreflight: value => value,
        shouldApplyWebCssCompat,
      }) ?? (
        shouldApplyWebCssCompat
          ? transformWebCssCompat(css, resolveViteWebCssCompatOptions(cssPipelineContext))
          : css
      )
    }
    const isNativeAppStyleTarget = context.cssPipelineStrategy?.isNativeAppStyleTarget?.(cssPipelineContext) === true
    const isHarmonyAppStyleTarget = context.cssPipelineStrategy?.isHarmonyAppStyleTarget?.(cssPipelineContext) === true
    const shouldPreserveAppCssExtension = context.cssPipelineStrategy?.shouldPreserveStyleOutputExtension?.(cssPipelineContext)
      ?? (isNativeAppStyleTarget || isHarmonyAppStyleTarget)
    const shouldGenerateWebCssByGenerator = isWebGeneratorTarget
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
    const normalizeMiniProgramGeneratorRawSource = (source: string, outputFile?: string | undefined) => {
      return isWebGeneratorTarget
        ? source
        : normalizeMiniProgramGeneratorCssSource(source, outputFile)
    }

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
      cssPipelineStrategy: context.cssPipelineStrategy,
      createCssPipelineContext: () => cssPipelineContext,
      isViteProcessedCssAsset,
      markCssAssetProcessed,
      recordCssAssetResult,
      recordViteProcessedCssAssetResult,
      resolveViteProcessedCssOutputFile: file => resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension, sourceRoot, defaultStyleOutputExtension, Object.keys(bundle)),
      subpackageRoots: currentSubpackageRoots,
      transformCss: transformWebTargetCss,
      debug,
    })
    const hmrTimingStartedAt = performance.now()
    const timingDetails: Record<string, number> = {}
    const recordTimingDetail = (name: string, startedAt: number) => {
      timingDetails[name] = (timingDetails[name] ?? 0) + Math.max(0, performance.now() - startedAt)
    }
    const timeTask = createBundleTaskTimer(recordTimingDetail)
    const emitOrReplayCssAsset = createCssAssetEmitter(this, bundle)

    const metrics = createEmptyMetrics()
    const envFlags = resolveGenerateBundleEnvFlags()
    const bundleFiles = Object.keys(bundle)
    const activeViteCssCacheFiles = new Set(bundleFiles.map(normalizeViteCssCacheKey))
    const normalizeSystemAliasPathKey = (file: string) =>
      file.startsWith('/private/var/') ? file.slice('/private'.length) : file
    const normalizeConfiguredCssSourceCacheKey = (file: string) =>
      normalizeSystemAliasPathKey(normalizeOutputPathKey(path.resolve(file.replace(/[?#].*$/, ''))))
    const runtimeTailwindcssOptions = resolveTailwindcssOptions(opts.tailwindcssRuntimeOptions)
    const tailwindRuntimeOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
    const configuredTailwindV4ExplicitCssEntryFiles = [...new Set([
      ...(Array.isArray(opts.cssEntries) ? opts.cssEntries : []),
      ...(Array.isArray(opts.tailwindcss?.v4?.cssEntries) ? opts.tailwindcss.v4.cssEntries : []),
      ...(Array.isArray(runtimeTailwindcssOptions?.v4?.cssEntries) ? runtimeTailwindcssOptions.v4.cssEntries : []),
      ...(Array.isArray(tailwindRuntimeOptions?.v4?.cssEntries) ? tailwindRuntimeOptions.v4.cssEntries : []),
    ].filter((file): file is string => typeof file === 'string' && file.length > 0))]
    const getConfiguredTailwindV4CssSourceEntries = () => {
      const collectedEntries = collectConfiguredTailwindV4CssSourceEntries({
        ...opts,
        tailwindcssRuntimeOptions: {
          ...(opts.tailwindcssRuntimeOptions ?? {}),
          tailwindcss: {
            ...(resolveTailwindcssOptions(opts.tailwindcssRuntimeOptions) ?? {}),
            ...(resolveTailwindcssOptions(runtimeState.tailwindRuntime.options) ?? {}),
          },
        },
      }, opts.tailwindcssBasedir ?? rootDir)
      const cachedEntries = configuredTailwindV4ExplicitCssEntryFiles.flatMap((file) => {
        const resolvedFile = path.isAbsolute(file)
          ? path.resolve(file)
          : path.resolve(opts.tailwindcssBasedir ?? rootDir, file)
        const source = getCssSource(resolvedFile)
        return typeof source === 'string' && source.length > 0
          ? [{ file: resolvedFile, source }]
          : []
      })
      const cachedFileKeys = new Set(cachedEntries.map(entry => normalizeConfiguredCssSourceCacheKey(entry.file)))
      return [
        ...cachedEntries,
        ...collectedEntries.filter(entry => !cachedFileKeys.has(normalizeConfiguredCssSourceCacheKey(entry.file))),
      ]
    }
    const normalizeGeneratorUserRawSource = (
      source: string,
      sourceFile: string,
      fallbackFile: string,
    ) => normalizeRelativeCssConfigDirectives(source, sourceFile || fallbackFile, outDir, opts)
    const resolveMatchedCssSourceOutputFile = (sourceFile: string | undefined) =>
      resolveOutputFileFromMatchedCssSource({
        bundleFiles,
        defaultStyleOutputExtension,
        isWebGeneratorTarget,
        opts,
        rootDir,
        shouldPreserveAppCssExtension: false,
        sourceFile,
        sourceRoot,
      })
    const usedConfiguredTailwindV4CssSourceFiles = new Set<string>()
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
    const configuredTailwindV4CssSourceEntriesForScope = getConfiguredTailwindV4CssSourceEntries()
    const normalizeConfiguredTailwindV4CssEntryFileKey = (file: string) => {
      const cleanFile = file.replace(/[?#].*$/, '')
      return normalizeSystemAliasPathKey(normalizeOutputPathKey(path.isAbsolute(cleanFile)
        ? path.resolve(cleanFile)
        : path.resolve(opts.tailwindcssBasedir ?? rootDir, cleanFile)))
    }
    const configuredTailwindV4CssSourceFileKeysForScope = new Set(
      configuredTailwindV4CssSourceEntriesForScope
        .map(entry => normalizeConfiguredTailwindV4CssEntryFileKey(entry.file)),
    )
    const configuredTailwindV4ExplicitCssEntryFileKeysForScope = new Set(
      configuredTailwindV4ExplicitCssEntryFiles
        .map(normalizeConfiguredTailwindV4CssEntryFileKey),
    )
    const isRootStyleOutputFile = (file: string) => {
      const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
      return normalized.endsWith('.css') && !normalized.includes('/')
    }
    const isMiniProgramStyleOutputFile = (file: string) => /\.(?:wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i.test(file)
    const resolveConfiguredCssEntryRootInjectionTarget = (sourceFile: string | undefined, outputFile: string) => {
      if (
        !outputFile.replace(/[?#].*$/, '').endsWith('.css')
        || typeof sourceFile !== 'string'
        || !configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(sourceFile))
      ) {
        return
      }
      return context.cssPipelineStrategy?.resolveConfiguredCssEntryRootInjectionTarget?.({
        ...cssPipelineContext,
        bundle,
        isConfiguredCssEntryFile: file => typeof file === 'string'
          && configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(file)),
        isMiniProgramStyleOutputFile,
        isRootStyleOutputFile,
        outputFile,
        sourceFile,
      })
    }
    const resolveConfiguredTailwindV4CssEntryOutputFile = (sourceFile: string) =>
      resolveViteCssPipelineOutputFile(sourceFile, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension, sourceRoot, defaultStyleOutputExtension, bundleFiles)
    const shouldSelectConfiguredRootCssOutput = (outputFile: string) => {
      if (!opts.cssMatcher(outputFile) || !isRootStyleOutputFile(outputFile)) {
        return false
      }
      return context.cssPipelineStrategy?.shouldSelectConfiguredCssEntryRootSource?.({
        ...cssPipelineContext,
        isRootStyleOutputFile,
        outputFile,
      }) === true
      || cssPipelineContext.currentGeneratorBranch.isWeb
    }
    const selectConfiguredRootCssSourceEntry = (
      outputFile: string,
      entries: ReturnType<typeof getConfiguredTailwindV4CssSourceEntries>,
      originalFileNames: string[] | undefined,
    ) => {
      const matchedOriginalEntry = entries.find(entry =>
        originalFileNames?.some(originalFile =>
          normalizeConfiguredTailwindV4CssEntryFileKey(originalFile) === normalizeConfiguredTailwindV4CssEntryFileKey(entry.file),
        ) === true,
      )
      if (matchedOriginalEntry && outputFile.replace(/[?#].*$/, '').endsWith('.css')) {
        return matchedOriginalEntry
      }
      const shouldRequireExplicitConfiguredEntry = !cssPipelineContext.currentGeneratorBranch.isWeb
        && opts.cssMatcher(outputFile)
        && isRootStyleOutputFile(outputFile)
      const generationEntries = entries.filter(entry =>
        hasTailwindGenerationSource(entry.source)
        && (
          !shouldRequireExplicitConfiguredEntry
          || configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(entry.file))
        ),
      )
      const matchedOutputEntries = generationEntries.filter(entry =>
        normalizeOutputPathKey(resolveConfiguredTailwindV4CssEntryOutputFile(entry.file).replace(/[?#].*$/, ''))
        === normalizeOutputPathKey(outputFile.replace(/[?#].*$/, '')),
      )
      if (matchedOutputEntries.length === 1) {
        return matchedOutputEntries[0]
      }
      if (!shouldSelectConfiguredRootCssOutput(outputFile)) {
        return undefined
      }
      if (generationEntries.length <= 1) {
        return generationEntries[0]
      }
      const rootOutputEntries = generationEntries.filter((entry) => {
        const entryOutputFile = normalizeOutputPathKey(resolveConfiguredTailwindV4CssEntryOutputFile(entry.file).replace(/[?#].*$/, ''))
        return !entryOutputFile.includes('/')
      })
      if (rootOutputEntries.length === 1) {
        return rootOutputEntries[0]
      }
      if (currentSubpackageRoots) {
        const mainPackageEntries = generationEntries.filter((entry) => {
          const entryOutputFile = resolveConfiguredTailwindV4CssEntryOutputFile(entry.file)
          return !isSubpackageOutputFile(entryOutputFile, currentSubpackageRoots)
        })
        if (mainPackageEntries.length === 1) {
          return mainPackageEntries[0]
        }
      }
      return undefined
    }
    const resolveConfiguredRootCssSourceStyle = (
      outputFile: string,
      entries: ReturnType<typeof getConfiguredTailwindV4CssSourceEntries>,
      originalFileNames: string[] | undefined,
    ) => {
      const entry = selectConfiguredRootCssSourceEntry(outputFile, entries, originalFileNames)
      return entry
        ? {
            outputFile,
            rawSource: entry.source,
            sourceFile: entry.file,
          }
        : undefined
    }
    const shouldKeepCurrentRootMiniProgramStyleOutputAsImportShell = (outputFile: string, css?: string | undefined) => {
      const normalizedOutputFile = normalizeOutputPathKey(outputFile.replace(/[?#].*$/, ''))
      return opts.cssMatcher(outputFile)
        && isMiniProgramStyleOutputFile(outputFile)
        && !normalizedOutputFile.includes('/')
        && shouldKeepRootMiniProgramStyleAsImportShell(
          context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
            ...cssPipelineContext,
            css,
            file: outputFile,
          }),
        )
    }
    const shouldKeepCurrentRootCssOutputForConfiguredSource = (sourceFile: string | undefined, outputFile: string) => {
      const normalizedOutputFile = normalizeOutputPathKey(outputFile.replace(/[?#].*$/, ''))
      const isRootConfiguredStyleOutput = normalizedOutputFile.endsWith('.css')
        ? isRootStyleOutputFile(outputFile)
        : isMiniProgramStyleOutputFile(outputFile) && !normalizedOutputFile.includes('/')
      return typeof sourceFile === 'string'
        && opts.cssMatcher(outputFile)
        && isRootConfiguredStyleOutput
        && !shouldKeepCurrentRootMiniProgramStyleOutputAsImportShell(outputFile)
        && configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(sourceFile))
    }
    const hasExplicitConfiguredRootCssEntryForOutput = (outputFile: string) => {
      if (
        cssPipelineContext.currentGeneratorBranch.isWeb
        || !opts.cssMatcher(outputFile)
        || !isRootStyleOutputFile(outputFile)
        || !shouldSelectConfiguredRootCssOutput(outputFile)
      ) {
        return false
      }
      return configuredTailwindV4CssSourceEntriesForScope.some((entry) => {
        if (!configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(entry.file))) {
          return false
        }
        const entryOutputFile = resolveConfiguredTailwindV4CssEntryOutputFile(entry.file)
        return !normalizeOutputPathKey(entryOutputFile.replace(/[?#].*$/, '')).includes('/')
          || (currentSubpackageRoots != null && !isSubpackageOutputFile(entryOutputFile, currentSubpackageRoots))
      })
    }
    const {
      createScopedSourceCandidateGetter,
      createScopedSourceCandidateSourceGetter,
      shouldExcludeSubpackageSourceCandidates,
      shouldInjectCssIntoMainFromOutput,
    } = createSubpackageSourceCandidateScope({
      cssSourceFiles: configuredTailwindV4CssSourceEntriesForScope.map(entry => entry.file),
      getSourceCandidateSourcesForEntries,
      getSourceCandidatesForEntries,
      projectRoot: (opts.tailwindcssRuntimeOptions as { projectRoot?: string | undefined } | undefined)?.projectRoot,
      rootDir,
      snapshot,
      sourceRoot,
      subpackageRoots: currentSubpackageRoots,
      tailwindcssBasedir: opts.tailwindcssBasedir,
      useIncrementalMode,
    })
    recordTimingDetail('snapshot', snapshotStart)
    const useBundleRuntimeClassSet = !isWebGeneratorTarget
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
    const transformFilter = createTransformFilter(opts.transform, rootDir)
    if (processMarkupAndScripts && !isWebGeneratorTarget) {
      await syncBundleMarkupCandidates({
        mergeSourceCandidateSource,
        resolveSourceCandidateFile: file => resolveCurrentSourceCandidateFile({
          file,
          getSourceCandidateSource,
          getSourceCandidateSources,
          outDir,
          rootDir,
          sourceRoot,
        }),
        rootDir,
        snapshot,
        transformFilter,
      })
    }
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
      majorVersion: runtimeState.tailwindRuntime.majorVersion,
      outputFile,
      rawSource,
      shouldExcludeSubpackageSourceCandidates,
      sourceFile,
      scopedSourceCandidateGetter: createScopedSourceCandidateGetter(outputFile, cssHandlerOptions),
    })
    const jsEntries = snapshot.jsEntries
    const getJsEntry = createJsEntryResolver(jsEntries)
    const transformFilterSignature = createTransformFilterSignature(opts.transform)
    const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
    const hasRuntimeAffectingChanges = hasRuntimeAffectingSourceChanges(snapshot.runtimeAffectingChangedByType)
    const runtimeStart = performance.now()
    // Tailwind v4 的任意值在 uni-app/Taro 等上游输出里可能已经被转义。
    // HTML/JS 发生运行时相关变更时，优先回到源码扫描刷新集合，避免用旧集合重放主样式产物。
    const forceV4RuntimeRefreshBySource = forceRuntimeRefreshBySource
    const runtime = isWebGeneratorTarget
      ? new Set<string>()
      : useBundleRuntimeClassSet
        ? await ensureBundleRuntimeClassSet(snapshot, envFlags.forceRuntimeRefreshByEnv, {
            allowBaselineOnlyInitialSync: buildCommand,
            refreshBySource: forceV4RuntimeRefreshBySource,
          })
        : await context.ensureRuntimeClassSet(envFlags.forceRuntimeRefreshByEnv)
    const shouldFilterTailwindV4MiniProgramCandidates = shouldUseMiniProgramCssBranch(generatorBranch)
    const collectedGeneratorCandidates = new Set([...runtime, ...sourceCandidates])
    const filteredGeneratorCandidates = shouldFilterTailwindV4MiniProgramCandidates
      ? filterUnsupportedMiniProgramTailwindV4Candidates(collectedGeneratorCandidates)
      : collectedGeneratorCandidates
    const filteredSourceCandidates = shouldFilterTailwindV4MiniProgramCandidates
      ? filterUnsupportedMiniProgramTailwindV4Candidates(sourceCandidates)
      : sourceCandidates
    const transformRuntime = shouldFilterTailwindV4MiniProgramCandidates
      ? new Set(runtime)
      : new Set(filteredGeneratorCandidates)
    const generatorRuntime = filteredGeneratorCandidates
    const cssEntries = snapshot.entries.filter(entry =>
      entry.type === 'css' && entry.output.type === 'asset')
    const hasMultipleConfiguredCssEntries = (opts.cssEntries?.length ?? 0) > 1
    if (sourceCandidates.size > 0 && !hasMultipleConfiguredCssEntries) {
      const mainCssEntry = cssEntries.find(entry => getCssHandlerOptions(entry.file).isMainChunk) ?? cssEntries[0]
      if (mainCssEntry) {
        const mainCssRawSource = typeof mainCssEntry.output.source === 'string'
          ? mainCssEntry.output.source
          : Buffer.from(mainCssEntry.output.source).toString()
        const shouldValidateSourceRuntime = !hasTailwindApplyDirective(mainCssRawSource)
        if (shouldValidateSourceRuntime) {
          const validationRawSource = normalizeMiniProgramGeneratorRawSource(mainCssRawSource, mainCssEntry.file)
          const generatedCssSources = new Set<string>()
          for (const [, record] of getViteProcessedCssAssetResults?.() ?? []) {
            if (typeof record === 'string') {
              generatedCssSources.add(record)
            }
            else if (typeof record?.css === 'string') {
              generatedCssSources.add(record.css)
            }
          }
          const validatedSourceRuntime = await validateCandidatesByGenerator({
            opts,
            runtimeState,
            candidates: filteredSourceCandidates,
            rawSource: validationRawSource,
            generatedCssSources,
            file: mainCssEntry.file,
            cssHandlerOptions: getCssHandlerOptions(mainCssEntry.file),
            cssUserHandlerOptions: getCssUserHandlerOptions(mainCssEntry.file),
            styleHandler,
            debug,
            skipGenerateFallback: false,
          })
          if (validatedSourceRuntime.size > 0) {
            for (const candidate of validatedSourceRuntime) {
              transformRuntime.add(candidate)
            }
          }
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
    const shouldQueueTemporaryCssSourceEntry = (sourceFile: string | undefined, outputFile: string) => {
      return normalizeOutputPathKey(outputFile).includes('/')
        || (
          typeof sourceFile === 'string'
          && shouldSelectConfiguredRootCssOutput(outputFile)
          && configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(sourceFile))
        )
    }
    rememberRuntimeLinkedCssSources({
      bundleFiles,
      debug,
      defaultStyleOutputExtension,
      getConfiguredTailwindV4CssSourceEntries,
      getSourceCandidateSource,
      getSourceCandidateSources,
      isWebGeneratorTarget,
      jsImportedCssFiles,
      opts,
      outDir,
      rememberCssSource,
      rootDir,
      runtimeLinkedCssFiles,
      shouldPreserveAppCssExtension,
      snapshot,
      sourceRoot,
    })
    const sourceStyleTemporaryEntries = [...runtimeLinkedCssFiles]
      .filter(file => !snapshot.sourceHashByFile.has(file))
      .map((file) => {
        const outputFile = resolveViteCssPipelineOutputFile(file, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension, sourceRoot, defaultStyleOutputExtension, bundleFiles)
        const inferredSourceStyle = resolveSourceStyleSourceFromOutputFile(
          outputFile,
          snapshot,
          outDir,
          sourceRoot,
          getCssSource,
          jsImportedCssFiles.has(file) ? getSourceCandidateSources : undefined,
          getConfiguredTailwindV4CssSourceEntries().map(entry => [entry.file, entry.source] as [string, string]),
          debug,
        )
        return inferredSourceStyle
          && currentSubpackageRoots
          && shouldQueueTemporaryCssSourceEntry(inferredSourceStyle.sourceFile, outputFile)
          ? {
              file: inferredSourceStyle.sourceFile,
              outputFile,
              source: inferredSourceStyle.rawSource,
            }
          : undefined
      })
      .filter((entry): entry is { file: string, outputFile: string, source: string } => entry != null)
    const temporaryCssAssetSourceResolver = createTemporaryCssAssetSourceResolver(
      [
        ...sourceStyleTemporaryEntries,
        ...[...(getRememberedCssSources?.() ?? [])].map(([, remembered]) => ({
          file: remembered.sourceFile,
          outputFile: remembered.outputFile,
          source: remembered.rawSource,
        })).filter(entry => shouldQueueTemporaryCssSourceEntry(entry.file, entry.outputFile)),
        ...getConfiguredTailwindV4CssSourceEntries()
          .map((entry) => {
            const outputFile = resolveMatchedCssSourceOutputFile(entry.file)
            const isExplicitConfiguredEntry = configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(entry.file))
            return outputFile && (normalizeOutputPathKey(outputFile).includes('/') || (isExplicitConfiguredEntry && shouldSelectConfiguredRootCssOutput(outputFile)))
              ? {
                  file: entry.file,
                  outputFile,
                  source: entry.source,
                }
              : undefined
          })
          .filter((entry): entry is { file: string, outputFile: string, source: string } => entry != null),
        ...configuredTailwindV4CssSourceEntriesForScope
          .map((entry) => {
            const outputFile = resolveMatchedCssSourceOutputFile(entry.file)
            return outputFile && currentSubpackageRoots && isSubpackageOutputFile(outputFile, currentSubpackageRoots)
              ? {
                  file: entry.file,
                  outputFile,
                  source: entry.source,
                }
              : undefined
          })
          .filter((entry): entry is { file: string, outputFile: string, source: string } => entry != null),
      ],
    )
    recordGeneratorCandidates?.(generatorRuntime)
    const dynamicRetryCandidates = new Set([
      ...sourceCandidates,
      ...generatorRuntime,
      ...transformRuntime,
    ])
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
    const runtimeSignature = getRuntimeClassSetSignature(runtimeState.tailwindRuntime) ?? 'runtime:missing'
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
    const createBaseHandlerOptions = createJsHandlerOptionsFactory({
      getMajorVersion: () => runtimeState.tailwindRuntime.majorVersion,
      moduleGraph: moduleGraphOptions,
    })
    const resolveFrameworkJsHandlerOptions = (absoluteFilename: string) => context.cssPipelineStrategy?.getServeJsHandlerOptions?.({
      ...cssPipelineContext,
      file: absoluteFilename,
    })
    const createHandlerOptions = (absoluteFilename: string, extra?: Parameters<typeof createBaseHandlerOptions>[1]) => {
      const frameworkExtra = resolveFrameworkJsHandlerOptions(absoluteFilename)
      return createBaseHandlerOptions(
        absoluteFilename,
        frameworkExtra || extra
          ? {
              ...frameworkExtra,
              ...extra,
            }
          : undefined,
      )
    }
    const shouldTransformJsBundle = !isWebGeneratorTarget
      || context.cssPipelineStrategy?.shouldTransformServeJs?.(cssPipelineContext) === true

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

      if (processMarkupAndScripts && type === 'html' && originalSource.type === 'asset') {
        metrics.html.total++
        if (isWebGeneratorTarget) {
          debug('html skip web target: %s', file)
          continue
        }
        if (shouldSkipViteAssetTransform(originalSource, file, rootDir, transformFilter)) {
          metrics.html.transformed++
          debug('html skip transform (filtered): %s', file)
          continue
        }
        if (!processFiles.html.has(file)) {
          continue
        }
        processHtmlBundleEntry({
          cache,
          context,
          debug,
          dynamicRetryCandidates,
          file,
          metrics,
          onUpdate,
          originalEntrySource,
          originalSource,
          rememberProcessCacheKey,
          resolveCurrentSourceCandidateSource: file => resolveCurrentSourceCandidateSource({
            file,
            getSourceCandidateSource,
            getSourceCandidateSources,
            outDir,
            rootDir,
            sourceRoot,
          }),
          tasks,
          templateHandler,
          timeTask,
          transformRuntime,
          transformRuntimeSignature,
        })
        continue
      }

      if (processStyles && type === 'css' && originalSource.type === 'asset') {
        metrics.css.total++
        // uni-app dev/watch 会在每轮产物阶段重写主样式产物。
        // 即便本轮 CSS 原文 hash 未变化，也必须回填缓存中的转译结果，
        // 否则会退回未转译内容并与同轮 JS/WXML 的 class 改写失配。
        const assetSourceFile = resolveAssetSourceFile(originalSource, file)
        const rawSource = normalizeRelativeCssConfigDirectives(originalEntrySource, assetSourceFile, outDir, opts)
        const currentRawSourceHasExplicitScanContext = rawSource.includes('@source') || rawSource.includes('@config')
        const cssPipelineContext = {
          ...createInitialCssPipelineContext(file),
          bundle,
        }
        const rootImportShellOutputFile = resolveReplayCssOutputFile(
          outDir,
          originalSource.fileName || file,
        )
        let rememberedFrameworkRootImportTarget = frameworkRootImportShellTargetByFile.get(rootImportShellOutputFile)
        const isCurrentFrameworkRootImportShell = shouldPreserveFrameworkRootMiniProgramImportShell({
          css: rawSource,
          file: rootImportShellOutputFile,
          isWebGeneratorTarget,
          matchesCss: opts.cssMatcher(rootImportShellOutputFile) || opts.cssMatcher(file),
          shouldKeep: () => context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
            ...cssPipelineContext,
            css: rawSource,
            file: rootImportShellOutputFile,
          }),
        })
        if (isCurrentFrameworkRootImportShell) {
          const importedFile = resolveSingleCssImportOutputFile(rootImportShellOutputFile, rawSource)
          if (importedFile && isRootMiniProgramStyleOutputFile(importedFile)) {
            frameworkRootImportShellTargetByFile.set(rootImportShellOutputFile, importedFile)
          }
        }
        if (
          !rememberedFrameworkRootImportTarget
          && !isCurrentFrameworkRootImportShell
          && !isWebGeneratorTarget
          && isRootMiniProgramStyleOutputFile(rootImportShellOutputFile)
          && normalizeOutputPathKey(assetSourceFile) === normalizeOutputPathKey(file)
          && opts.mainCssChunkMatcher(rootImportShellOutputFile, opts.appType)
          && shouldKeepRootMiniProgramStyleAsImportShell(
            context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
              ...cssPipelineContext,
              css: rawSource,
              file: rootImportShellOutputFile,
            }),
          )
          && !shouldMoveRootMiniProgramStyleToImportShellOrigin(
            context.cssPipelineStrategy?.shouldMoveRootMiniProgramStyleToImportShellOrigin?.({
              ...cssPipelineContext,
              file: rootImportShellOutputFile,
            }),
          )
        ) {
          const rootGeneratedTargets = new Set<string>()
          for (const entry of getConfiguredTailwindV4CssSourceEntries()) {
            const targetFile = resolveMatchedCssSourceOutputFile(entry.file)
            if (
              targetFile
              && isRootMiniProgramStyleOutputFile(targetFile)
              && normalizeOutputPathKey(targetFile) !== normalizeOutputPathKey(rootImportShellOutputFile)
            ) {
              rootGeneratedTargets.add(targetFile)
            }
          }
          for (const [, record] of getViteProcessedCssAssetResults?.() ?? []) {
            if (typeof record === 'string' || record.injectIntoMain !== true || !record.outputFile) {
              continue
            }
            const targetFile = resolveViteCssPipelineOutputFile(
              record.outputFile,
              opts,
              rootDir,
              isWebGeneratorTarget,
              shouldPreserveAppCssExtension,
              sourceRoot,
              defaultStyleOutputExtension,
              bundleFiles,
            )
            if (
              isRootMiniProgramStyleOutputFile(targetFile)
              && normalizeOutputPathKey(targetFile) !== normalizeOutputPathKey(rootImportShellOutputFile)
            ) {
              rootGeneratedTargets.add(targetFile)
            }
          }
          if (rootGeneratedTargets.size === 1) {
            const [targetFile] = rootGeneratedTargets
            if (targetFile) {
              rememberedFrameworkRootImportTarget = targetFile
              frameworkRootImportShellTargetByFile.set(rootImportShellOutputFile, targetFile)
              debug('css remember framework root generated target: %s -> %s', rootImportShellOutputFile, targetFile)
            }
          }
        }
        let outputFile = resolveCssBundleOutputFile({
          bundleFiles,
          cssPipelineStrategy: context.cssPipelineStrategy,
          defaultStyleOutputExtension,
          file,
          isWebGeneratorTarget,
          opts,
          pipelineContext: cssPipelineContext,
          shouldPreserveAppCssExtension,
        })
        if (
          rememberedFrameworkRootImportTarget
          && !isWebGeneratorTarget
          && (opts.cssMatcher(rootImportShellOutputFile) || opts.cssMatcher(file))
          && shouldKeepRootMiniProgramStyleAsImportShell(
            context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
              ...cssPipelineContext,
              css: rawSource,
              file: rootImportShellOutputFile,
            }),
          )
        ) {
          outputFile = rememberedFrameworkRootImportTarget
          debug('css reuse framework root import shell target: %s -> %s', rootImportShellOutputFile, outputFile)
        }
        const resolveMatchedOutputFileForCurrentAsset = createMatchedCssSourceOutputResolver({
          assetSourceFile,
          file,
          originalFileNames: originalSource.originalFileNames,
          resolveOutputFileFromMatchedCssSource: resolveMatchedCssSourceOutputFile,
        })
        const configuredOriginalSourceEntry = outputFile.replace(/[?#].*$/, '').endsWith('.css')
          ? getConfiguredTailwindV4CssSourceEntries().find(entry =>
              originalSource.originalFileNames?.some(originalFile =>
                normalizeConfiguredTailwindV4CssEntryFileKey(originalFile) === normalizeConfiguredTailwindV4CssEntryFileKey(entry.file),
              ) === true,
            )
          : undefined
        const configuredOriginalOutputFile = configuredOriginalSourceEntry
          ? resolveMatchedOutputFileForCurrentAsset(configuredOriginalSourceEntry.file)
          : undefined
        let resolvedFromConfiguredOriginalCssEntry = false
        if (configuredOriginalOutputFile && normalizeOutputPathKey(configuredOriginalOutputFile) !== normalizeOutputPathKey(outputFile)) {
          outputFile = configuredOriginalOutputFile
          resolvedFromConfiguredOriginalCssEntry = true
        }
        activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
        if (shouldSkipRawSourceStyleAsset(outputFile, file, rawSource, assetSourceFile, opts.cssMatcher)) {
          delete bundle[file]
          debug('css skip raw source style asset: %s -> %s', file, outputFile)
          continue
        }
        const hasViteProcessedCssRecord = getViteProcessedCssAssetResult?.(file) != null
        const viteProcessedCssAsset = isViteProcessedCssAsset?.(originalSource, file) === true || hasViteProcessedCssRecord
        let resolvedFromTemporaryCssAsset = false
        const applyCssResult = (source: string) => {
          applyCssResultToBundle({
            assetSourceFile,
            bundle,
            cssPipelineStrategy: context.cssPipelineStrategy,
            emitOrReplayCssAsset,
            file,
            originalSource,
            outputFile,
            pipelineContext: cssPipelineContext,
            source,
            viteProcessedCssAsset,
          })
        }
        if (shouldSkipViteAssetTransform(originalSource, file, rootDir, transformFilter)) {
          applyCssResult(rawSource)
          markCssAssetProcessed?.(originalSource, outputFile)
          onUpdate(outputFile, rawSource, rawSource)
          metrics.css.transformed++
          debug('css skip transform (filtered): %s', outputFile)
          continue
        }
        if (isWebGeneratorTarget && !shouldGenerateWebCssByGenerator) {
          applyCssResult(rawSource)
          markCssAssetProcessed?.(originalSource, outputFile)
          onUpdate(outputFile, rawSource, rawSource)
          debug('css skip web target: %s', outputFile)
          continue
        }
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
          rememberedCssSources = await Promise.all(rememberedCssSources.map(async (remembered) => {
            const refreshed = await refreshRememberedCssSource?.(remembered)
            return refreshed ?? remembered
          }))
        }
        rememberedCssSources = rememberedCssSources.filter((remembered) => {
          if (
            currentRawSourceHasExplicitScanContext
            && !remembered.rawSource.includes('@source')
            && !remembered.rawSource.includes('@config')
          ) {
            return false
          }
          if (
            hasExplicitConfiguredRootCssEntryForOutput(outputFile)
            && !configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(remembered.sourceFile))
          ) {
            return false
          }
          if (!configuredTailwindV4CssSourceFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(remembered.sourceFile))) {
            return true
          }
          const matchedOutputFile = resolveMatchedOutputFileForCurrentAsset(remembered.sourceFile)
          return !matchedOutputFile || normalizeOutputPathKey(matchedOutputFile) === normalizeOutputPathKey(outputFile)
        })
        let hasUsableRememberedTailwindSource = rememberedCssSources.some(remembered =>
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
        if (
          isTemporaryCssAssetFile(outputFile)
          && rememberedCssSources.some(remembered =>
            configuredTailwindV4CssSourceFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(remembered.sourceFile)),
          )
        ) {
          rememberedCssSources = []
          hasUsableRememberedTailwindSource = false
        }
        let outputCssHandlerOptions = getCssHandlerOptions(outputFile)
        const configuredRootSourceStyle = resolveConfiguredRootCssSourceStyle(
          outputFile,
          getConfiguredTailwindV4CssSourceEntries(),
          originalSource.originalFileNames,
        )
        const hasExplicitRememberedRootSource = rememberedCssSources.some(remembered =>
          configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(remembered.sourceFile)),
        )
        const shouldUseConfiguredRootSourceStyle = configuredRootSourceStyle != null
          && (
            !currentRawSourceHasExplicitScanContext
            || hasTailwindGenerationSource(configuredRootSourceStyle.rawSource)
          )
        if (shouldUseConfiguredRootSourceStyle && (!hasUsableRememberedTailwindSource || !hasExplicitRememberedRootSource)) {
          rememberedCssSources = [configuredRootSourceStyle]
          hasUsableRememberedTailwindSource = true
          debug('source style source inferred from configured root tailwind v4 css source: %s -> %s', outputFile, configuredRootSourceStyle.sourceFile)
        }
        if (!hasUsableRememberedTailwindSource && isTemporaryCssAssetFile(outputFile) && hasTailwindGenerationSource(rawSource)) {
          const resolvedTemporarySource = temporaryCssAssetSourceResolver.resolve(outputFile, rawSource)
          if (resolvedTemporarySource) {
            outputFile = shouldKeepCurrentRootCssOutputForConfiguredSource(resolvedTemporarySource.sourceFile, outputFile)
              ? outputFile
              : resolveMatchedOutputFileForCurrentAsset(resolvedTemporarySource.sourceFile)
                ?? resolvedTemporarySource.outputFile
            activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
            outputCssHandlerOptions = getCssHandlerOptions(outputFile)
            outputCssHandlerOptions = {
              ...outputCssHandlerOptions,
              isMainChunk: false,
            }
            resolvedFromTemporaryCssAsset = true
            usedConfiguredTailwindV4CssSourceFiles.add(normalizeOutputPathKey(resolvedTemporarySource.sourceFile))
            rememberedCssSources = [{
              outputFile,
              rawSource: resolvedTemporarySource.rawSource,
              sourceFile: resolvedTemporarySource.sourceFile,
            }]
            hasUsableRememberedTailwindSource = true
            debug('source style source inferred from temporary remembered tailwind v4 css source: %s -> %s', outputFile, resolvedTemporarySource.sourceFile)
          }
        }
        if (!hasUsableRememberedTailwindSource) {
          const configuredTailwindV4CssSourceEntries = getConfiguredTailwindV4CssSourceEntries()
          const isCurrentRootMiniProgramStyleOutput = opts.cssMatcher(outputFile)
            && isMiniProgramStyleOutputFile(outputFile)
            && !normalizeOutputPathKey(outputFile.replace(/[?#].*$/, '')).includes('/')
          const configuredEntriesForCurrentRootMiniProgramStyle = isCurrentRootMiniProgramStyleOutput
            && !hasTailwindGenerationSource(rawSource)
            ? configuredTailwindV4CssSourceEntries.filter(entry => hasTailwindPluginDirective(entry.source))
            : configuredTailwindV4CssSourceEntries
          if (isCurrentRootMiniProgramStyleOutput && (hasTailwindGenerationSource(rawSource) || configuredEntriesForCurrentRootMiniProgramStyle.length > 0)) {
            const configuredGenerationSource = selectTailwindV4GenerationCssSourceForOutput(outputFile, configuredEntriesForCurrentRootMiniProgramStyle, rawSource, {
              cwd: opts.tailwindcssBasedir,
              outputRoot: outDir,
              projectRoot: sourceRoot ?? rootDir,
            })
            const configuredGenerationOutputFile = configuredGenerationSource
              ? shouldKeepCurrentRootMiniProgramStyleOutputAsImportShell(outputFile, rawSource)
                ? resolveMatchedOutputFileForCurrentAsset(configuredGenerationSource.file) ?? outputFile
                : outputFile
              : undefined
            const hasConfiguredGenerationSourceAlreadyUsed = configuredGenerationSource
              ? usedConfiguredTailwindV4CssSourceFiles.has(normalizeOutputPathKey(configuredGenerationSource.file))
              : false
            const hasConfiguredGenerationSourceAlreadyProcessed = configuredGenerationSource
              ? hasViteProcessedCssResultForSource(configuredGenerationSource.file, getViteProcessedCssAssetResults)
              : false
            const shouldUseConfiguredGenerationSource = configuredGenerationSource
              && (
                (!hasConfiguredGenerationSourceAlreadyUsed && !hasConfiguredGenerationSourceAlreadyProcessed)
                || normalizeOutputPathKey(configuredGenerationOutputFile ?? outputFile) === normalizeOutputPathKey(outputFile)
              )
            if (configuredGenerationSource && shouldUseConfiguredGenerationSource) {
              outputFile = configuredGenerationOutputFile ?? outputFile
              activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
              outputCssHandlerOptions = getCssHandlerOptions(outputFile)
              usedConfiguredTailwindV4CssSourceFiles.add(normalizeOutputPathKey(configuredGenerationSource.file))
              rememberedCssSources = [{
                outputFile,
                rawSource: configuredGenerationSource.source,
                sourceFile: configuredGenerationSource.file,
              }]
              hasUsableRememberedTailwindSource = true
              debug('source style source inferred from scoped configured tailwind v4 css source: %s -> %s', outputFile, configuredGenerationSource.file)
            }
          }
          if (!hasUsableRememberedTailwindSource) {
            const inferredSourceStyle = resolveSourceStyleSourceFromOutputFile(
              outputFile,
              snapshot,
              outDir,
              sourceRoot,
              getCssSource,
              getSourceCandidateSources,
              configuredTailwindV4CssSourceEntries.map(entry => [entry.file, entry.source] as [string, string]),
              debug,
            )
            const inferredWebviewRootSourceEntry = inferredSourceStyle
              ? undefined
              : selectConfiguredRootCssSourceEntry(outputFile, configuredTailwindV4CssSourceEntries, originalSource.originalFileNames)
            const inferredWebviewRootSourceStyle = inferredWebviewRootSourceEntry
              ? {
                  outputFile,
                  rawSource: inferredWebviewRootSourceEntry.source,
                  sourceFile: inferredWebviewRootSourceEntry.file,
                }
              : undefined
            const inferredOriginalSourceStyle = inferredSourceStyle
              ?? (
                outputFile === file
                  ? undefined
                  : resolveSourceStyleSourceFromOutputFile(
                      file,
                      snapshot,
                      outDir,
                      sourceRoot,
                      getCssSource,
                      getSourceCandidateSources,
                      configuredTailwindV4CssSourceEntries.map(entry => [entry.file, entry.source] as [string, string]),
                      debug,
                    )
              )
              ?? inferredWebviewRootSourceStyle
            if (inferredOriginalSourceStyle) {
              const matchedOutputFile = normalizeOutputPathKey(inferredOriginalSourceStyle.outputFile) === normalizeOutputPathKey(outputFile)
                ? outputFile
                : resolveMatchedOutputFileForCurrentAsset(inferredOriginalSourceStyle.sourceFile) ?? outputFile
              debug('source style output resolved: %s -> %s from %s', outputFile, matchedOutputFile, inferredOriginalSourceStyle.sourceFile)
              outputFile = matchedOutputFile
              activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
              outputCssHandlerOptions = getCssHandlerOptions(outputFile)
              rememberedCssSources = [{
                ...inferredOriginalSourceStyle,
                outputFile,
              }]
            }
            else if (
              isTemporaryCssAssetFile(outputFile)
              && configuredTailwindV4CssSourceEntries.length > 1
            ) {
              const resolvedTemporarySource = temporaryCssAssetSourceResolver.resolve(outputFile, rawSource)
              if (resolvedTemporarySource) {
                outputFile = shouldKeepCurrentRootCssOutputForConfiguredSource(resolvedTemporarySource.sourceFile, outputFile)
                  ? outputFile
                  : resolveMatchedOutputFileForCurrentAsset(resolvedTemporarySource.sourceFile)
                    ?? resolvedTemporarySource.outputFile
                activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
                outputCssHandlerOptions = getCssHandlerOptions(outputFile)
                outputCssHandlerOptions = {
                  ...outputCssHandlerOptions,
                  isMainChunk: false,
                }
                resolvedFromTemporaryCssAsset = true
                usedConfiguredTailwindV4CssSourceFiles.add(normalizeOutputPathKey(resolvedTemporarySource.sourceFile))
                rememberedCssSources = [{
                  outputFile,
                  rawSource: resolvedTemporarySource.rawSource,
                  sourceFile: resolvedTemporarySource.sourceFile,
                }]
                debug('source style source inferred from temporary configured tailwind v4 css source: %s -> %s', outputFile, resolvedTemporarySource.sourceFile)
              }
            }
            else if (
              !isCurrentRootMiniProgramStyleOutput
              && hasTailwindGenerationSource(rawSource)
              && (originalSource.originalFileNames?.length ?? 0) === 0
            ) {
              const availableConfiguredTailwindV4CssSourceEntries = configuredTailwindV4CssSourceEntries.filter(entry =>
                !usedConfiguredTailwindV4CssSourceFiles.has(normalizeOutputPathKey(entry.file)),
              )
              const configuredGenerationSource = selectTailwindV4GenerationCssSourceForOutput(outputFile, availableConfiguredTailwindV4CssSourceEntries, rawSource, {
                cwd: opts.tailwindcssBasedir,
                outputRoot: outDir,
                projectRoot: sourceRoot ?? rootDir,
              })
              if (configuredGenerationSource && !hasViteProcessedCssResultForSource(configuredGenerationSource.file, getViteProcessedCssAssetResults)) {
                outputFile = resolveMatchedOutputFileForCurrentAsset(configuredGenerationSource.file) ?? outputFile
                activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
                outputCssHandlerOptions = getCssHandlerOptions(outputFile)
                usedConfiguredTailwindV4CssSourceFiles.add(normalizeOutputPathKey(configuredGenerationSource.file))
                rememberedCssSources = [{
                  outputFile,
                  rawSource: configuredGenerationSource.source,
                  sourceFile: configuredGenerationSource.file,
                }]
                hasUsableRememberedTailwindSource = true
                debug('source style source inferred from scoped configured tailwind v4 css source: %s -> %s', outputFile, configuredGenerationSource.file)
              }
            }
          }
        }
        if (currentRawSourceHasExplicitScanContext) {
          rememberedCssSources = rememberedCssSources.filter(remembered =>
            remembered.rawSource.includes('@source') || remembered.rawSource.includes('@config'),
          )
        }
        rememberedCssSources = rememberedCssSources.filter((remembered) => {
          const shouldSkip = shouldSkipRawRememberedCssSource(remembered.rawSource, remembered.sourceFile)
          if (shouldSkip) {
            debug('css skip raw remembered source style: %s -> %s', remembered.sourceFile, outputFile)
          }
          return !shouldSkip
        })
        let rememberedCssSource = mergeRememberedCssSources(rememberedCssSources, outputFile)
        if (
          rememberedCssSource
          && viteProcessedCssAsset
          && outputCssHandlerOptions.isMainChunk !== true
          && configuredTailwindV4CssSourceFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(rememberedCssSource.sourceFile))
        ) {
          const matchedOutputFile = resolveMatchedOutputFileForCurrentAsset(rememberedCssSource.sourceFile)
          if (matchedOutputFile && normalizeOutputPathKey(matchedOutputFile) !== normalizeOutputPathKey(outputFile)) {
            outputFile = matchedOutputFile
            activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
            outputCssHandlerOptions = getCssHandlerOptions(outputFile)
            rememberedCssSource = {
              ...rememberedCssSource,
              outputFile,
            }
          }
        }
        if (
          !isWebGeneratorTarget
          && isRootMiniProgramStyleOutputFile(rootImportShellOutputFile)
          && isRootMiniProgramStyleOutputFile(outputFile)
          && normalizeOutputPathKey(rootImportShellOutputFile) !== normalizeOutputPathKey(outputFile)
          && shouldKeepRootMiniProgramStyleAsImportShell(
            context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
              ...cssPipelineContext,
              css: rawSource,
              file: rootImportShellOutputFile,
            }),
          )
          && !shouldMoveRootMiniProgramStyleToImportShellOrigin(
            context.cssPipelineStrategy?.shouldMoveRootMiniProgramStyleToImportShellOrigin?.({
              ...cssPipelineContext,
              file: rootImportShellOutputFile,
            }),
          )
        ) {
          frameworkRootImportShellTargetByFile.set(rootImportShellOutputFile, outputFile)
          debug('css remember framework root import shell target: %s -> %s', rootImportShellOutputFile, outputFile)
        }
        const shouldKeepImportedCssShell = isCssImportOnlyBundleAsset(bundle, file, rawSource)
        const useRememberedCssSource = !shouldKeepImportedCssShell
          && rememberedCssSource != null
          && (
            normalizeOutputPathKey(rememberedCssSource.sourceFile) !== normalizeOutputPathKey(file)
            || (!hasTailwindGenerationSource(rawSource) && hasTailwindGenerationSource(rememberedCssSource.rawSource))
          )
        const vitePipelineCssAsset = viteProcessedCssAsset || useRememberedCssSource
        const resolvedGeneratorRawSource = vitePipelineCssAsset
          ? rememberedCssSource?.rawSource ?? rawSource
          : rawSource
        const generatorRawSource = normalizeMiniProgramGeneratorRawSource(resolvedGeneratorRawSource, outputFile)
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
            || hasRememberedTailwindGenerationSource
          )
        const generatorSourceFile = vitePipelineCssAsset
          ? rememberedCssSource?.sourceFile ?? assetSourceFile
          : assetSourceFile
        const originalGeneratorLayerSource = vitePipelineCssAsset
          ? getOriginalCssLayerSource?.(generatorSourceFile)
          : undefined
        const generatorUserLayerRawSource = originalGeneratorLayerSource
          && normalizeCssSourceForCompare(originalGeneratorLayerSource) !== normalizeCssSourceForCompare(generatorRawSource)
          && hasUserCssLayerBlocks(originalGeneratorLayerSource)
          ? normalizeMiniProgramGeneratorRawSource(
              normalizeGeneratorUserRawSource(
                originalGeneratorLayerSource,
                generatorSourceFile,
                assetSourceFile,
              ),
              outputFile,
            )
          : undefined
        const webviewRootCssInjectionTarget = vitePipelineCssAsset
          ? resolveConfiguredCssEntryRootInjectionTarget(generatorSourceFile, outputFile)
          : undefined
        const usesConfiguredTailwindV4FallbackSource = rememberedCssSource != null
          && normalizeOutputPathKey(rememberedCssSource.outputFile) === normalizeOutputPathKey(outputFile)
          && normalizeOutputPathKey(rememberedCssSource.sourceFile.replace(/[?#].*$/, '')) !== normalizeOutputPathKey(file)
        if (
          vitePipelineCssAsset
          && outputCssHandlerOptions.isMainChunk !== true
          && configuredTailwindV4CssSourceFileKeysForScope.has(normalizeConfiguredTailwindV4CssEntryFileKey(generatorSourceFile))
        ) {
          usedConfiguredTailwindV4CssSourceFiles.add(normalizeOutputPathKey(generatorSourceFile))
          temporaryCssAssetSourceResolver.markUsed(generatorSourceFile)
        }
        const cssHandlerOptions = vitePipelineCssAsset
          ? {
              ...getCssHandlerOptions(generatorSourceFile),
              isMainChunk: resolvedFromTemporaryCssAsset ? false : outputCssHandlerOptions.isMainChunk,
            }
          : getCssHandlerOptions(file)
        const generatorSourceFileKey = normalizeConfiguredTailwindV4CssEntryFileKey(generatorSourceFile)
        const isExplicitGeneratorCssEntry = configuredTailwindV4ExplicitCssEntryFileKeysForScope.has(generatorSourceFileKey)
        const shouldUsePipelineSourceAsCssEntry = !isExplicitGeneratorCssEntry
          && vitePipelineCssAsset
          && opts.cssMatcher(generatorSourceFile)
          && hasTailwindGenerationSource(generatorRawSource)
        const generatorCssEntries = isExplicitGeneratorCssEntry || shouldUsePipelineSourceAsCssEntry
          ? [generatorSourceFile]
          : opts.cssEntries
        const generatorCssHandlerOptions = {
          ...cssHandlerOptions,
          sourceOptions: {
            ...(cssHandlerOptions.sourceOptions ?? {}),
            sourceFile: generatorSourceFile,
            cssEntries: generatorCssEntries,
          },
        }
        const scopedSourceCandidateGetter = createScopedSourceCandidateGetter(outputFile, generatorCssHandlerOptions)
        const scopedSourceCandidateSourceGetter = createScopedSourceCandidateSourceGetter(outputFile, generatorCssHandlerOptions)
        const sourceTraceSources = scopedSourceCandidateSourceGetter
          ? await createScopedGeneratorSourceTraceMap(generatorRawSource, generatorSourceFile, scopedSourceCandidateSourceGetter)
          : undefined
        const sourceTraceTokenSources = sourceTraceSources
          ? createCssTokenSourceMap(sourceTraceSources, opts)
          : undefined
        const sourceTraceSignature = createCssSourceTraceCacheSignature(sourceTraceTokenSources, opts)
        const scopedGeneratorRuntime = await createScopedGeneratorRuntime(outputFile, generatorCssHandlerOptions, generatorRuntime, generatorRawSource, generatorSourceFile)
        const annotateCss = (css: string) => annotateCssSourceTrace(css, {
          opts,
          tokenSources: sourceTraceTokenSources,
        })
        const removeRootCoveredCssFromScopedAsset = (css: string) => {
          const normalizedOutputFile = normalizeOutputPathKey(outputFile.replace(/[?#].*$/, ''))
          return !normalizedOutputFile.includes('/')
            || (currentSubpackageRoots != null && isSubpackageOutputFile(normalizedOutputFile, currentSubpackageRoots))
            ? css
            : removeCssCoveredByRootStyleBundleSources(bundle, outputFile, css)
        }
        const shouldRegenerateMainPackageCssWithScopedCandidates = vitePipelineCssAsset
          && shouldExcludeSubpackageSourceCandidates(outputFile, generatorCssHandlerOptions)
        const generatorCssUserHandlerOptions = getCssUserHandlerOptions(generatorSourceFile)
        const cssRuntimeAffectingSignature = vitePipelineCssAsset
          ? createRuntimeAffectingSourceSignature(generatorRawSource, 'css')
          : snapshot.runtimeAffectingSignatureByFile.get(file)
            ?? createRuntimeAffectingSourceSignature(generatorRawSource, 'css')
        const cssRuntimeAffectingHash = vitePipelineCssAsset
          ? cache.computeHash(cssRuntimeAffectingSignature)
          : snapshot.runtimeAffectingHashByFile.get(file)
            ?? cache.computeHash(cssRuntimeAffectingSignature)
        const cssShareScope = createCssTransformShareScopeKey(opts, outputFile, generatorRawSource)
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
        const vitePipelineCssInjectionOutputFile = webviewRootCssInjectionTarget ?? outputFile
        const shouldRecordVitePipelineCssByOutput = normalizeOutputPathKey(vitePipelineCssInjectionOutputFile) === normalizeOutputPathKey(outputFile)
        const shouldInjectVitePipelineCssIntoMain = vitePipelineCssAsset
          && !resolvedFromConfiguredOriginalCssEntry
          && outputCssHandlerOptions.isMainChunk !== true
          && (
            webviewRootCssInjectionTarget != null
            || shouldInjectCssIntoMainFromOutput(outputFile, generatorSourceFile, outputCssHandlerOptions)
          )
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
        const strippedViteProcessedCss = stripBundlerGeneratedCssMarkers(rawSource)
        const shouldPreserveStaleGeneratedCssAsset = hasStaleViteProcessedCssSource
          && shouldPreserveCollectedViteCssAsset
          && strippedViteProcessedCss.trim().length > 0
          && !strippedViteProcessedCss.includes('weapp-tailwindcss generator-placeholder')
          && !strippedViteProcessedCss.includes('vite-placeholder')
          && !hasTailwindGenerationSource(strippedViteProcessedCss)
          && !hasTailwindApplyDirective(strippedViteProcessedCss)
        if (
          alreadyProcessedCssAsset
          && !shouldRefreshViteProcessedCssByCandidates
          && (!hasStaleViteProcessedCssSource || shouldPreserveStaleGeneratedCssAsset)
          && !hasRememberedApplySource
          && !shouldRegenerateMainPackageCssWithScopedCandidates
          && (!shouldTrackGeneratorRuntime || shouldPreserveCollectedViteCssAsset)
        ) {
          const nextCss = removeRootCoveredCssFromScopedAsset(strippedViteProcessedCss)
          applyCssResult(nextCss)
          markCssAssetProcessed?.(originalSource, outputFile)
          recordCssAssetResult?.(outputFile, nextCss)
          if (vitePipelineCssAsset && rememberedCssSource) {
            rememberCssSource?.({
              outputFile: vitePipelineCssInjectionOutputFile,
              rawSource: generatorRawSource,
              sourceFile: generatorSourceFile,
            })
          }
          if (shouldRecordVitePipelineCssByOutput) {
            recordViteProcessedCssAssetResult?.(vitePipelineCssInjectionOutputFile, nextCss, {
              injectIntoMain: outputCssHandlerOptions.isMainChunk ? false : shouldInjectVitePipelineCssIntoMain,
              outputFile: vitePipelineCssInjectionOutputFile,
            })
          }
          if (vitePipelineCssAsset && shouldInjectVitePipelineCssIntoMain) {
            recordViteProcessedCssAssetResult?.(file, nextCss, {
              injectIntoMain: shouldInjectVitePipelineCssIntoMain,
              outputFile: vitePipelineCssInjectionOutputFile,
            })
          }
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
                includeFallbackSignature: generatorCssHandlerOptions.isMainChunk,
                majorVersion: runtimeState.tailwindRuntime.majorVersion,
              },
            )
          : trackedGeneratorCandidateSignature
        const cssRuntimeSignature = createCssRuntimeSignature(runtimeSignature, scopedGeneratorCandidateSignature)
        const rememberedCssRuntimeSignature = createRememberedCssRuntimeSignature(cssRuntimeSignature, cssRuntimeAffectingHash)
        const cssSharedCacheKey = `${cssShareScope}:${cssRuntimeSignature}:${runtimeState.tailwindRuntime.majorVersion ?? 'unknown'}:${cssHandlerOptions.isMainChunk ? '1' : '0'}:${cssRuntimeAffectingHash}:${scopedGeneratorCandidateSignature}:${sourceTraceSignature}`
        const cssCacheKey = outputFile
        const cssHashKey = `${outputFile}:css:${cssRuntimeSignature}:${runtimeState.tailwindRuntime.majorVersion ?? 'unknown'}`
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
                  outputFile: vitePipelineCssInjectionOutputFile,
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
                const previousCss = !vitePipelineCssAsset && useIncrementalMode && !generatorCandidatesChanged && !hasRuntimeAffectingChanges && !snapshot.changedByType.css.has(file)
                  ? getLastCssResult(lastCssResultByFile, outputFile, file)
                  : undefined
                const generatorTransformRawSource = generatorRawSource
                const previousGeneratorCss = previousCss && !isWebGeneratorTarget
                  ? normalizeMiniProgramGeneratorRawSource(previousCss, outputFile)
                  : previousCss
                const shouldGenerateCssWithCore = hasTailwindGenerationSource(generatorTransformRawSource)
                  || hasBundlerGeneratedCssMarker(rawSource)
                const bundleUserRawSource = vitePipelineCssAsset
                  && !hasBundlerGeneratedCssMarker(rawSource)
                  && normalizeCssSourceForCompare(rawSource) !== normalizeCssSourceForCompare(generatorRawSource)
                  ? normalizeMiniProgramGeneratorRawSource(
                      normalizeGeneratorUserRawSource(rawSource, generatorSourceFile, assetSourceFile),
                      outputFile,
                    )
                  : undefined
                const generatorUserRawSource = [generatorUserLayerRawSource, bundleUserRawSource]
                  .filter((source): source is string => typeof source === 'string' && source.trim().length > 0)
                  .join('\n')
                const generated = shouldGenerateCssWithCore
                  ? await generateTailwindV4Css({
                      opts,
                      runtimeState,
                      runtime: scopedGeneratorRuntime,
                      rawSource: generatorTransformRawSource,
                      file: generatorSourceFile,
                      outputFile,
                      cssHandlerOptions: generatorCssHandlerOptions,
                      cssUserHandlerOptions: generatorCssUserHandlerOptions,
                      getSourceCandidatesForEntries: scopedSourceCandidateGetter,
                      sourceCandidates: scopedGeneratorRuntime,
                      generatorPlatform,
                      styleHandler,
                      debug,
                      previousCss: previousGeneratorCss,
                      ...(generatorUserRawSource ? { userRawSource: generatorUserRawSource } : {}),
                      ...(usesConfiguredTailwindV4FallbackSource
                        ? { restoreLocalCssImports: false }
                        : {}),
                    })
                  : undefined
                if (generated) {
                  const outputCss = transformWebTargetCss(generated.css)
                  const tracedCss = removeRootCoveredCssFromScopedAsset(annotateCss(outputCss))
                  registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
                  if (envFlags.debugCssDiff) {
                    debug('css diff %s: %s', generatorSourceFile, summarizeStringDiff(generatorRawSource, tracedCss))
                  }
                  debug('css generated result: %s bytes=%d', file, tracedCss.length)
                  for (const candidate of generated.classSet ?? []) {
                    transformRuntime.add(candidate)
                  }
                  recordCssAssetResult?.(outputFile, tracedCss)
                  if (shouldRecordVitePipelineCssByOutput) {
                    recordViteProcessedCssAssetResult?.(vitePipelineCssInjectionOutputFile, tracedCss, {
                      injectIntoMain: outputCssHandlerOptions.isMainChunk ? false : shouldInjectVitePipelineCssIntoMain,
                      outputFile: vitePipelineCssInjectionOutputFile,
                    })
                  }
                  if (vitePipelineCssAsset && shouldInjectVitePipelineCssIntoMain) {
                    recordViteProcessedCssAssetResult?.(file, tracedCss, {
                      injectIntoMain: shouldInjectVitePipelineCssIntoMain,
                      outputFile: vitePipelineCssInjectionOutputFile,
                    })
                  }
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css handle via tailwind v%s engine(%s): %s', runtimeState.tailwindRuntime.majorVersion, generated.target, outputFile)
                  return tracedCss
                }
                if (isWebGeneratorTarget) {
                  const outputCss = transformWebTargetCss(rawSource)
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css preserve web target: %s', outputFile)
                  return annotateCss(outputCss)
                }
                if (isPureLocalCssImportWrapper(generatorTransformRawSource)) {
                  const tracedCss = annotateCss(generatorTransformRawSource)
                  recordCssAssetResult?.(outputFile, tracedCss)
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css preserve mini-program import shell: %s', outputFile)
                  return tracedCss
                }
                const { css } = await styleHandler(generatorTransformRawSource, cssHandlerOptions)
                const tracedCss = annotateCss(css)
                if (envFlags.debugCssDiff) {
                  debug('css diff %s: %s', generatorSourceFile, summarizeStringDiff(generatorTransformRawSource, tracedCss))
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

      if (!processMarkupAndScripts) {
        continue
      }

      if (!shouldTransformJsBundle) {
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
        transformFilterSignature,
        shouldSkipAstTransform: transformFilter
          ? chunk => shouldSkipViteJsChunkTransform(chunk, transformFilter)
          : undefined,
        slowJsAstWarnMs: envFlags.slowJsAstWarnMs,
        timeTask,
        transformRuntime,
        transformRuntimeSignature,
        uniAppX,
        useIncrementalMode,
      })
    }

    if (processStyles && (shouldProcessTailwindGeneration || useIncrementalMode || isNativeAppStyleTarget)) {
      await processRememberedCssReplay({
        addWatchFile,
        activeViteCssCacheFiles,
        bundle,
        bundleFiles,
        cache,
        changedCssFiles: snapshot.changedByType.css,
        cssTaskFactories,
        cssPipelineContext,
        cssPipelineStrategy: context.cssPipelineStrategy,
        createScopedGeneratorRuntime,
        createScopedSourceCandidateGetter,
        createScopedSourceCandidateSourceGetter,
        debug,
        defaultStyleOutputExtension,
        emitOrReplayCssAsset,
        generatorPlatform,
        generatorRuntime,
        getCssHandlerOptions,
        getCssUserHandlerOptions,
        getRememberedCssSignature,
        getRememberedCssSources,
        isNativeAppStyleTarget,
        isWebGeneratorTarget,
        lastCssRawSourceHashByFile,
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

    await finalizeGenerateBundle({
      activeProcessCacheKeys,
      activeProcessHashKeys,
      activeViteCssCacheFiles,
      bundle,
      bundleFiles,
      cache,
      cssTaskFactories,
      cssPipelineStrategy: context.cssPipelineStrategy,
      createCssPipelineContext: () => cssPipelineContext,
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
      jsAfterCss: shouldFilterTailwindV4MiniProgramCandidates && cssTaskFactories.length > 0,
      jsTaskFactories,
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
      transformWebTargetCss,
      useIncrementalMode,
    })
  }
}
