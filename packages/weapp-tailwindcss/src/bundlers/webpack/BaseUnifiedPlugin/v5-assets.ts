import type { SetupWebpackV5ProcessAssetsHookOptions, WebpackSourceLike } from './v5-assets/helpers'
import type { WebpackCssHandlerOptions } from './v5-assets/pipeline-helpers'
import path from 'node:path'
import process from 'node:process'
import { MappingChars2String } from '@weapp-core/escape'
import { filterExistingCssRules } from '@weapp-tailwindcss/postcss'
import { pluginName } from '@/constants'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { shouldSkipJsTransform } from '@/js/precheck'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, isCssSourceTraceEnabled } from '../../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../../shared/generated-css-marker'
import { hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, hasTailwindSourceDirectives, isPureLocalCssImportWrapper } from '../../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, removeTailwindSourceDirectives } from '../../shared/generator-css/directives'
import { removeGeneratedSelectorCompatCss } from '../../shared/generator-css/legacy-selectors'
import { isCommentOnlyCss } from '../../shared/generator-css/user-css'
import { emitHmrTiming } from '../../shared/hmr-timing'
import { toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories, resolveTaskConcurrency } from '../../shared/run-tasks'
import { generateTailwindV4Css } from '../../shared/v4-generation-core'
import { createBundleBuildState, updateBundleBuildState } from '../../vite/bundle-state'
import { createScopedGeneratorRuntime } from '../../vite/generate-bundle/scoped-generator'
import { createCandidateSignature } from '../../vite/generate-bundle/signatures'
import { createBundleRuntimeClassSetManager } from '../../vite/incremental-runtime-class-set'
import { collectStrictEscapedRuntimeCandidates, createEscapeFragments } from '../../vite/incremental-runtime-class-set/escaped-candidates'
import { resolveTailwindV4EntriesFromCssCached } from '../../vite/source-scan'
import { isWebpackCssLoaderRuntimeSource } from '../shared/css-loader-runtime'
import { createAssetHashByChunkMap, createRuntimeAwareCssHash, createWebpackCssAssetResourceMap, createWebpackDirectCssAssetResourceMap, getCacheKey } from './shared'
import { createWebpackCssSourceResolvers } from './v5-assets/css-source-resolvers'
import { buildWebpackBundleSnapshot, createWebpackAssetUpdater, releaseWebpackBundleSnapshotSources } from './v5-assets/helpers'
import { applyWebpackLinkedJsResults, createWebpackJsAssetModuleGraph } from './v5-assets/js-module-graph'
import {
  addRuntimeTransformCandidates,
  collectGeneratedCssRuntimeCandidates,
  collectWebpackBareSelectorUserCss,
  collectWebpackJsRuntimeCandidatesFromAssets,
  collectWebpackJsRuntimeTokenSignature,
  createWebpackCssSourceTraceTokenSources,
  createWebpackCurrentAssetUserRawSource,
  createWebpackGeneratorUserCssSourceAppend,
  createWebpackUserCssSourceAppend,
  finalizeTracedWebpackCssAsset,
  finalizeWebpackCssAssetOutputSource,
  finalizeWebpackCssAssetSource,
  getRuntimeClassSetSync,
  hasAdditionalWebpackAssetUserCssMarkers,
  hasDeferredWebpackGeneratedCss,
  hasMissingRuntimeCandidates,
  hasProcessedCssAssetUrl,
  hasUsableWebpackGeneratorCssSources,
  isRuntimeTransformCandidate,
  normalizeWebpackGeneratorCssSources,
  pruneWebpackCssHandlerOptionCaches,
  removeWebpackGeneratorNonTailwindImports,
  removeWebpackTailwindGeneratedAssetCss,
  resolveGeneratedCssRuntimeCandidates,
  resolveWebpackCssAssetModuleResource,
  resolveWebpackGeneratorRawSource,
  resolveWebpackMemoryDebugStats,
  scopeWebpackGeneratorOptionsToCssSource,
  shouldAppendCurrentWebpackAssetUserCss,
  shouldConsumeWebpackLoaderGeneratedCss,
  shouldFallbackToWebpackUserCssOnGeneratorError,
  shouldUseWebpackAssetAsGeneratorUserCss,
  stringifyOptionalWebpackSourceValue,
  stringifyWebpackSourceLike,
  stripTrailingLineWhitespace,
} from './v5-assets/pipeline-helpers'
import { createWebpackSourceCandidateScanCache } from './v5-assets/source-candidate-cache'
import { refreshWebpackSourceCandidates } from './v5-assets/source-candidate-refresh'

export * from './v5-assets/pipeline-helpers'

export function setupWebpackV5ProcessAssetsHook(options: SetupWebpackV5ProcessAssetsHookOptions) {
  const {
    compiler,
    options: compilerOptions,
    appType,
    runtimeState,
    getRuntimeRefreshRequirement,
    refreshRuntimeMetadata,
    isKnownWebpackProcessedCssAsset,
    isWebpackProcessedCssAsset,
    consumeRuntimeRefreshRequirement,
    isWatchMode,
    getWatchChangedFiles,
    runtimeClassSetManager,
    getWebpackCssSources,
    getWebpackGeneratedCssSources,
    pruneWebpackCssSources,
    prepareWebpackCssSources,
    debug,
  } = options
  const { Compilation, sources } = compiler.webpack
  const { ConcatSource } = sources
  const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(compilerOptions.generator, {
    appType: compilerOptions.appType,
    platform: compilerOptions.cssOptions?.platform ?? compilerOptions.platform,
    tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
    uniAppX: compilerOptions.uniAppX,
  })
  const isWebGeneratorTarget = generatorOptions.target === 'web'
  const cssHandlerOptionsCache = new Map<string, WebpackCssHandlerOptions>()
  const cssUserHandlerOptionsCache = new Map<string, WebpackCssHandlerOptions>()
  const webpackSourceCandidateScanCache = createWebpackSourceCandidateScanCache()
  const bundleBuildState = createBundleBuildState()
  const bundleRuntimeClassSetManager = runtimeClassSetManager ?? createBundleRuntimeClassSetManager()
  const escapeFragments = createEscapeFragments(MappingChars2String)
  const processedCssAssetSkipDecisionCache = new Map<string, boolean>()
  let webpackWatchRuntimeScanInitialized = false

  compiler.hooks.compilation.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      },
      async (assets) => {
        const entries = Object.entries(assets)
        if (entries.length === 0) {
          return
        }
        const groupedEntries = getGroupedEntries(entries, compilerOptions)
        if (isWebGeneratorTarget && groupedEntries.css.length === 0) {
          return
        }
        compilerOptions.onStart()
        debug('start')
        await runtimeState.readyPromise
        const hmrTimingStartedAt = performance.now()

        // Initial pass marks cache state.
        for (const chunk of compilation.chunks) {
          if (chunk.id && chunk.hash) {
            compilerOptions.cache.calcHashValueChanged(chunk.id, chunk.hash)
          }
        }
        const assetHashByChunk = createAssetHashByChunkMap(compilation.chunks as any)
        const { updateAssetIfChanged } = createWebpackAssetUpdater({
          compilation,
          ConcatSource,
          onUpdate: compilerOptions.onUpdate,
          debug,
        })

        const compilerOutputPath = compilation.compiler?.outputPath ?? compiler.outputPath
        const outputDir = compilerOutputPath
          ? path.resolve(compilerOutputPath)
          : (compilation.outputOptions?.path ?? process.cwd())
        const { jsAssets, moduleGraphOptions } = createWebpackJsAssetModuleGraph({
          compilation,
          compilerOptions,
          entries,
          outputDir,
        })
        const watchMode = isWatchMode?.() === true
        const cssAssetResources = createWebpackCssAssetResourceMap(
          compilation.chunks as Iterable<{ files?: Iterable<string> | string[] | undefined, hasRuntime?: () => boolean, name?: string | undefined }>,
          (compilation as { chunkGraph?: { getChunkModulesIterable?: (chunk: unknown) => Iterable<{ resource?: string }> | undefined } }).chunkGraph as any,
          compilerOptions.cssMatcher,
          (resource, issuer) => resolveWebpackCssAssetModuleResource(resource, issuer, {
            appType,
            cssMatcher: compilerOptions.cssMatcher,
          }),
        )
        const directCssAssetResources = createWebpackDirectCssAssetResourceMap(
          compilation.chunks as Iterable<{ files?: Iterable<string> | string[] | undefined, hasRuntime?: () => boolean, name?: string | undefined }>,
          (compilation as { chunkGraph?: { getChunkModulesIterable?: (chunk: unknown) => Iterable<{ resource?: string }> | undefined } }).chunkGraph as any,
          compilerOptions.cssMatcher,
          (resource, issuer) => resolveWebpackCssAssetModuleResource(resource, issuer, {
            appType,
            cssMatcher: compilerOptions.cssMatcher,
          }),
        )
        const watchChangedFiles = new Set([...getWatchChangedFiles?.() ?? []].map(file => path.resolve(file)))
        const taskConcurrency = watchMode ? resolveTaskConcurrency(1) : undefined
        const activeProcessCacheKeys = new Set<string>()
        const activeProcessHashKeys = new Set<string | number>()
        const rememberProcessCacheKey = (cacheKey: string, hashKey: string | number = cacheKey) => {
          activeProcessCacheKeys.add(cacheKey)
          activeProcessHashKeys.add(hashKey)
        }
        const activeWebpackAssetResourceFiles = new Set(
          [...cssAssetResources.values()].flatMap(resources => [...resources].map(resource => path.resolve(resource))),
        )
        const registeredWebpackCssSourceFiles = prepareWebpackCssSources?.(activeWebpackAssetResourceFiles) ?? new Set<string>()
        for (const chunk of compilation.chunks) {
          if (chunk.id) {
            activeProcessHashKeys.add(chunk.id)
          }
        }
        const cssSources = new Map(
          [...(getWebpackCssSources?.() ?? [])]
            .map(([file, source]) => [path.resolve(file), source] as const),
        )
        const generatedCssSources = new Map(
          [...(getWebpackGeneratedCssSources?.() ?? [])]
            .map(([file, source]) => [path.resolve(file), source] as const),
        )
        const {
          activeWebpackCssSourceFiles,
          configuredCssEntryFiles,
          configuredMainCssEntryFiles,
          getCssHandlerOptions,
          getCssUserHandlerOptions,
          hasConfiguredTailwindV4SourceRoots,
          isSameWebpackSourceScope,
          resolveWebpackCssSourceFile,
        } = createWebpackCssSourceResolvers({
          activeWebpackAssetResourceFiles,
          appType,
          compilerOptions,
          compilation: compilation as any,
          cssAssetFiles: entries.map(([file]) => file),
          cssAssetResources,
          directCssAssetResources,
          cssHandlerOptionsCache,
          cssSources,
          cssUserHandlerOptionsCache,
          groupedCssEntriesLength: groupedEntries.css.length,
          singleCssAssetFile: groupedEntries.css[0]?.[0],
          isWebGeneratorTarget,
          outputDir,
          runtimeState,
        })
        const finalizeCssAssetSource = (source: string, options: { cssPreflight?: boolean | undefined, generatedCss?: boolean, preserveExistingPreflight?: boolean | undefined } = {}) =>
          finalizeWebpackCssAssetSource(source, compilerOptions, isWebGeneratorTarget, options)
        const shouldRefreshWebpackSourceCandidates = (!isWebGeneratorTarget && groupedEntries.css.length > 0)
          || cssSources.size > 0
          || generatedCssSources.size > 0
          || isCssSourceTraceEnabled(compilerOptions)
        const webpackSourceCandidates = shouldRefreshWebpackSourceCandidates
          ? await refreshWebpackSourceCandidates({
              compilerOptions,
              debug,
              outputDir,
              runtimeState,
              scanCache: webpackSourceCandidateScanCache,
              watchChangedFiles,
              watchMode,
            })
          : undefined
        const webpackSourceCandidateValueSignature = webpackSourceCandidates
          ? createCandidateSignature(webpackSourceCandidates.getSourceCandidatesForEntries(undefined))
          : 'source-candidates:0'
        const cssSourceTraceTokenSources = createWebpackCssSourceTraceTokenSources(compilerOptions, webpackSourceCandidates)
        const cssSourceTraceSignature = createCssSourceTraceCacheSignature(cssSourceTraceTokenSources, compilerOptions)
        const annotateCss = (css: string) => annotateCssSourceTrace(css, {
          opts: compilerOptions,
          tokenSources: cssSourceTraceTokenSources,
        })
        const finalizeTracedCss = (
          css: string,
          cssHandlerOptions: WebpackCssHandlerOptions,
          options: { finalized?: boolean | undefined } = {},
        ) =>
          finalizeTracedWebpackCssAsset(css, cssHandlerOptions, {
            annotateCss,
            compilerOptions,
            ...options,
            isWebGeneratorTarget,
          })
        const hasRuntimeTransformAssets = Boolean(
          !isWebGeneratorTarget
          && ((groupedEntries.html?.length ?? 0) > 0 || (groupedEntries.js?.length ?? 0) > 0),
        )
        const forceRuntimeRefresh = getRuntimeRefreshRequirement()
        debug('processAssets ensure runtime set forceRefresh=%s major=%s', forceRuntimeRefresh, runtimeState.tailwindRuntime.majorVersion ?? 'unknown')
        let runtimeSet: Set<string>
        let runtimeAffectingSourceHash = 'runtime-affecting:0'
        if (isWebGeneratorTarget && !hasRuntimeTransformAssets && !forceRuntimeRefresh) {
          runtimeSet = getRuntimeClassSetSync(runtimeState.tailwindRuntime)
        }
        else if (watchMode && !forceRuntimeRefresh) {
          const baseRuntimeSet = getRuntimeClassSetSync(runtimeState.tailwindRuntime)
          const snapshot = buildWebpackBundleSnapshot(assets as any, compilerOptions, bundleBuildState, compilation as any)
          if (!webpackWatchRuntimeScanInitialized) {
            for (const entry of snapshot.entries) {
              snapshot.runtimeAffectingChangedByType[entry.type].add(entry.file)
            }
          }
          runtimeAffectingSourceHash = compilerOptions.cache.computeHash([
            ...groupedEntries.html.map(([file, source]) => `${file}:${compilerOptions.cache.computeHash(source.source().toString())}`),
            ...groupedEntries.js.map(([file, source]) => `${file}:${compilerOptions.cache.computeHash(source.source().toString())}`),
          ].sort().join('\n\n'))
          try {
            runtimeSet = await bundleRuntimeClassSetManager.sync(runtimeState.tailwindRuntime, snapshot, {
              baseClassSet: baseRuntimeSet,
              skipInitialFullScanWithBase: false,
            })
          }
          catch (error) {
            debug('webpack incremental runtime set sync failed, fallback to full collect: %O', error)
            await bundleRuntimeClassSetManager.reset()
            runtimeSet = getRuntimeClassSetSync(runtimeState.tailwindRuntime)
          }
          releaseWebpackBundleSnapshotSources(snapshot)
          updateBundleBuildState(bundleBuildState, snapshot, new Map(), { incremental: true })
          webpackWatchRuntimeScanInitialized = true
        }
        else {
          if (forceRuntimeRefresh) {
            await bundleRuntimeClassSetManager.reset()
            webpackWatchRuntimeScanInitialized = false
          }
          runtimeSet = await ensureRuntimeClassSet(runtimeState, {
            forceRefresh: forceRuntimeRefresh,
            // In watch mode the runtime-classset loader may have already
            // refreshed the class set for this compilation. Reuse that cached
            // result unless webpack reported a runtime dependency change;
            // otherwise webpack can do a second full content scan in
            // processAssets for the same rebuild.
            forceCollect: !watchMode || forceRuntimeRefresh,
            clearCache: forceRuntimeRefresh,
            allowEmpty: false,
          })
        }
        await refreshRuntimeMetadata(forceRuntimeRefresh)
        consumeRuntimeRefreshRequirement()
        const webpackSourceCandidateSet = webpackSourceCandidates?.getSourceCandidatesForEntries(undefined)
        const generatorRuntimeSet = new Set(runtimeSet)
        addRuntimeTransformCandidates(generatorRuntimeSet, webpackSourceCandidateSet)
        const transformRuntimeSet = new Set(runtimeSet)
        if (hasRuntimeTransformAssets) {
          for (const [, originalSource] of groupedEntries.css) {
            for (const candidate of collectGeneratedCssRuntimeCandidates(originalSource.source().toString())) {
              transformRuntimeSet.add(candidate)
            }
          }
        }
        const transformedJsRuntimeCandidates = new Set<string>()
        let currentJsRuntimeCandidates: Set<string> | undefined
        let currentJsRuntimeTokenSignature: string | undefined
        const getWebpackAssetSource = (file: string): WebpackSourceLike | undefined => {
          const asset = compilation.getAsset(file)
          return asset?.source as WebpackSourceLike | undefined
        }
        const getCurrentJsRuntimeCandidates = () => {
          if (currentJsRuntimeCandidates) {
            return currentJsRuntimeCandidates
          }
          currentJsRuntimeCandidates = collectWebpackJsRuntimeCandidatesFromAssets({
            escapeFragments,
            getAssetSource: getWebpackAssetSource,
            isWebGeneratorTarget,
            jsAssets: jsAssets.values(),
          })
          return currentJsRuntimeCandidates
        }
        const getCurrentJsRuntimeTokenSignature = () => {
          if (currentJsRuntimeTokenSignature !== undefined) {
            return currentJsRuntimeTokenSignature
          }
          currentJsRuntimeTokenSignature = collectWebpackJsRuntimeTokenSignature({
            getAssetSource: getWebpackAssetSource,
            isWebGeneratorTarget,
            jsAssets: jsAssets.values(),
          })
          return currentJsRuntimeTokenSignature
        }
        const rememberTransformedRuntimeCandidates = (source: WebpackSourceLike) => {
          currentJsRuntimeCandidates = undefined
          currentJsRuntimeTokenSignature = undefined
          const code = stringifyWebpackSourceLike(source)
          for (const candidate of collectStrictEscapedRuntimeCandidates(code, MappingChars2String, escapeFragments)) {
            if (isRuntimeTransformCandidate(candidate)) {
              transformedJsRuntimeCandidates.add(candidate)
            }
          }
        }
        const createRuntimeSetHash = (generatorRuntimeSet: Set<string>) => compilerOptions.cache.computeHash([
          getRuntimeClassSetSignature(runtimeState.tailwindRuntime),
          [...runtimeSet].sort().join('\n'),
          [...transformRuntimeSet].sort().join('\n'),
          [...generatorRuntimeSet].sort().join('\n'),
          getCurrentJsRuntimeTokenSignature(),
        ].join('\n\n'))
        const getGeneratorRuntimeSet = () => {
          const currentJsCandidates = getCurrentJsRuntimeCandidates()
          if (transformedJsRuntimeCandidates.size === 0 && (!currentJsCandidates || currentJsCandidates.size === 0)) {
            return generatorRuntimeSet
          }
          const nextRuntimeSet = new Set(generatorRuntimeSet)
          for (const candidate of currentJsCandidates!) {
            nextRuntimeSet.add(candidate)
          }
          for (const candidate of transformedJsRuntimeCandidates) {
            nextRuntimeSet.add(candidate)
          }
          return nextRuntimeSet
        }
        const defaultTemplateHandlerOptions = {
          runtimeSet: transformRuntimeSet,
        }
        debug('get runtimeSet, class count: %d, transform class count: %d', runtimeSet.size, transformRuntimeSet.size)
        const tasks: Promise<void>[] = []
        const htmlTaskFactories: Array<() => Promise<void>> = []
        const cssTaskFactories: Array<() => Promise<void>> = []
        const enqueueTask = async (
          factory: () => Promise<void>,
          target: Array<() => Promise<void>>,
        ) => {
          if (watchMode) {
            await factory()
            return
          }
          target.push(factory)
        }
        if (!isWebGeneratorTarget && Array.isArray(groupedEntries.html)) {
          for (const element of groupedEntries.html) {
            const [file, originalSource] = element
            let rawSource: string | undefined
            const readRawSource = () => {
              rawSource ??= originalSource.source().toString()
              return rawSource
            }

            const cacheKey = file
            const hashKey = `${file}:asset`
            rememberProcessCacheKey(cacheKey, hashKey)
            const chunkHash = assetHashByChunk.get(file)
            await enqueueTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey,
                rawSource: chunkHash === undefined ? readRawSource() : undefined,
                hash: chunkHash,
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                },
                onCacheHit() {
                  debug('html cache hit: %s', file)
                },
                transform: async () => {
                  const wxml = await compilerOptions.templateHandler(readRawSource(), defaultTemplateHandlerOptions)
                  const source = new ConcatSource(wxml)
                  debug('html handle: %s', file)

                  return {
                    result: source,
                  }
                },
              })
            }, htmlTaskFactories)
          }
        }

        const jsTaskFactories: Array<() => Promise<void>> = []
        const enqueueJsTask = async (factory: () => Promise<void>) => {
          await enqueueTask(factory, jsTaskFactories)
        }

        if (!isWebGeneratorTarget && Array.isArray(groupedEntries.js)) {
          for (const [file] of groupedEntries.js) {
            const cacheKey = getCacheKey(file)
            const asset = compilation.getAsset(file)
            if (!asset) {
              continue
            }
            const hashKey = `${file}:asset`
            rememberProcessCacheKey(cacheKey, hashKey)
            const absoluteFile = toAbsoluteOutputPath(file, outputDir)
            const initialSource = asset.source.source()
            const initialRawSource = typeof initialSource === 'string' ? initialSource : initialSource.toString()
            const chunkHash = assetHashByChunk.get(file)
            await enqueueJsTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey,
                rawSource: chunkHash === undefined ? initialRawSource : undefined,
                hash: chunkHash,
                applyResult(source, { cacheHit }) {
                  const updated = updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                  if (updated) {
                    rememberTransformedRuntimeCandidates(source)
                  }
                },
                onCacheHit() {
                  debug('js cache hit: %s', file)
                },
                transform: async () => {
                  const currentAsset = compilation.getAsset(file)
                  const currentSourceValue = currentAsset?.source.source()
                  const currentSource = stringifyOptionalWebpackSourceValue(currentSourceValue)
                  const handlerOptions = {
                    tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion,
                    generateMap: false,
                    filename: absoluteFile,
                    moduleGraph: moduleGraphOptions,
                    babelParserOptions: {
                      sourceFilename: absoluteFile,
                    },
                  }
                  if (shouldSkipJsTransform(currentSource, {
                    ...handlerOptions,
                    classNameSet: transformRuntimeSet,
                  })) {
                    return { result: new ConcatSource(currentSource) }
                  }
                  const { code, linked } = await compilerOptions.jsHandler(currentSource, transformRuntimeSet, handlerOptions)
                  const source = new ConcatSource(code)
                  debug('js handle: %s', file)
                  applyWebpackLinkedJsResults({
                    ConcatSource,
                    compilation,
                    compilerOptions,
                    debug,
                    jsAssets,
                    linked,
                  })
                  return {
                    result: source,
                  }
                },
              })
            })
          }
        }

        for (const element of groupedEntries.css) {
          const [file, originalSource] = element

          let rawSource: string | undefined
          const readRawSource = () => {
            rawSource ??= originalSource.source().toString()
            return rawSource
          }
          const chunkHash = assetHashByChunk.get(file)
          const cssHandlerOptionsForProcessedAsset = getCssHandlerOptions(file, readRawSource())
          const processedCssAssetMetadata = {
            isMainCssChunk: cssHandlerOptionsForProcessedAsset.isMainChunk,
          }
          const processedSourceFile = cssHandlerOptionsForProcessedAsset.sourceOptions?.sourceFile
          const processedSourceCss = processedSourceFile ? cssSources.get(path.resolve(processedSourceFile))?.css : undefined
          const shouldRegenerateProcessedTailwindV4SourceCss = processedSourceCss !== undefined
            && (
              hasTailwindSourceDirectives(processedSourceCss, { importFallback: true })
              || processedSourceCss.includes('@config')
            )
          const processedCssAssetKnown = isKnownWebpackProcessedCssAsset?.(file, processedCssAssetMetadata) === true
          const processedLoaderGeneratedCss = processedSourceFile
            ? generatedCssSources.get(path.resolve(processedSourceFile))
            : undefined
          const processedAssetSourceHash = watchMode
            && isWebGeneratorTarget
            && cssHandlerOptionsForProcessedAsset.isMainChunk
            ? compilerOptions.cache.computeHash(readRawSource())
            : chunkHash === undefined
              ? processedCssAssetKnown
                ? 'webpack-css-asset:known'
                : compilerOptions.cache.computeHash(readRawSource())
              : 'webpack-css-asset:chunk'
          const processedCssHashKey = createRuntimeAwareCssHash(
            chunkHash,
            processedAssetSourceHash,
            `${createRuntimeSetHash(getGeneratorRuntimeSet())}:${runtimeAffectingSourceHash}:${webpackSourceCandidates?.signatureHash ?? 'source-candidates:0'}:${webpackSourceCandidateValueSignature}:${cssSourceTraceSignature}`,
          )
          const processedCssDecisionCacheKey = `${file}:${processedCssHashKey}`
          let currentProcessedRawSource: string | undefined
          let hasGeneratedCssMarker = false
          let hasTailwindGeneratedAssetCss = false
          const readCurrentProcessedRawSource = () => {
            currentProcessedRawSource ??= readRawSource()
            return currentProcessedRawSource
          }
          const cachedSkipProcessedCssAsset = processedCssAssetKnown
            ? processedCssAssetSkipDecisionCache.get(processedCssDecisionCacheKey)
            : undefined
          const shouldRegenerateStaleProcessedWebCssAsset = isWebGeneratorTarget
            && !processedCssAssetKnown
            && cachedSkipProcessedCssAsset === undefined
            && cssHandlerOptionsForProcessedAsset.isMainChunk
            && webpackSourceCandidateSet !== undefined
            && (
              hasMissingRuntimeCandidates(processedLoaderGeneratedCss?.classSet, webpackSourceCandidateSet)
              || hasMissingRuntimeCandidates(
                resolveGeneratedCssRuntimeCandidates(
                  readCurrentProcessedRawSource(),
                  processedLoaderGeneratedCss?.classSet,
                ),
                webpackSourceCandidateSet,
              )
            )
          if (cachedSkipProcessedCssAsset !== undefined) {
            hasGeneratedCssMarker = cachedSkipProcessedCssAsset && cssHandlerOptionsForProcessedAsset.isMainChunk
            hasTailwindGeneratedAssetCss = hasGeneratedCssMarker
          }
          else {
            const source = readCurrentProcessedRawSource()
            hasGeneratedCssMarker = hasBundlerGeneratedCssMarker(source)
            hasTailwindGeneratedAssetCss = hasTailwindGeneratedCss(source)
              || hasTailwindGeneratedCssMarkers(source)
          }
          const hasProcessedAssetTailwindDirectives = () => {
            const source = readCurrentProcessedRawSource()
            return hasTailwindRootDirectives(source, { importFallback: true })
              || hasTailwindSourceDirectives(source, { importFallback: true })
              || hasTailwindApplyDirective(source)
          }
          const shouldForceConfiguredMainCssGeneration = cssHandlerOptionsForProcessedAsset.isMainChunk
            && hasConfiguredTailwindV4SourceRoots()
            && !hasGeneratedCssMarker
            && (
              configuredMainCssEntryFiles.length > 0
              || shouldRegenerateProcessedTailwindV4SourceCss
              || hasProcessedAssetTailwindDirectives()
            )
          const hasProcessedMainAssetUserCss = cachedSkipProcessedCssAsset === undefined
            && cssHandlerOptionsForProcessedAsset.isMainChunk
            && (hasGeneratedCssMarker || hasTailwindGeneratedAssetCss)
            && createWebpackUserCssSourceAppend(
              [...cssSources.entries()].map(([sourceFile, source]) => ({
                ...source,
                file: sourceFile,
              })),
              readCurrentProcessedRawSource(),
            ) !== undefined
          const hasProcessedLoaderGeneratedUserCss = cachedSkipProcessedCssAsset === undefined
            && processedLoaderGeneratedCss !== undefined
            && hasAdditionalWebpackAssetUserCssMarkers(
              processedLoaderGeneratedCss.css,
              readCurrentProcessedRawSource(),
            )
          const shouldFinalizeProcessedWebCssAsset = isWebGeneratorTarget
            && !shouldForceConfiguredMainCssGeneration
            && !shouldRegenerateProcessedTailwindV4SourceCss
            && hasTailwindSourceDirectives(readCurrentProcessedRawSource(), { importFallback: true })
          const shouldPreserveFinalWebCssAsset = isWebGeneratorTarget
            && processedSourceFile === undefined
            && !shouldForceConfiguredMainCssGeneration
            && (hasGeneratedCssMarker || hasTailwindGeneratedAssetCss)
          const shouldSkipKnownProcessedCssAsset = !shouldForceConfiguredMainCssGeneration
            && !shouldRegenerateProcessedTailwindV4SourceCss
            && !shouldRegenerateStaleProcessedWebCssAsset
            && (
              processedCssAssetKnown
              || isWebpackProcessedCssAsset?.(file, readCurrentProcessedRawSource(), processedCssAssetMetadata)
            )
            && !hasProcessedMainAssetUserCss
            && !hasProcessedLoaderGeneratedUserCss
            && (!cssHandlerOptionsForProcessedAsset.isMainChunk || hasGeneratedCssMarker || hasTailwindGeneratedAssetCss)
          const shouldSkipProcessedCssAsset = (
            cachedSkipProcessedCssAsset
            ?? (shouldFinalizeProcessedWebCssAsset || shouldPreserveFinalWebCssAsset || shouldSkipKnownProcessedCssAsset)
          )
          if (processedCssAssetKnown && cachedSkipProcessedCssAsset === undefined && !shouldFinalizeProcessedWebCssAsset && !shouldPreserveFinalWebCssAsset) {
            processedCssAssetSkipDecisionCache.set(processedCssDecisionCacheKey, shouldSkipProcessedCssAsset === true)
          }
          if (shouldSkipProcessedCssAsset) {
            const hashKey = `${file}:asset`
            const sourceHash = processedAssetSourceHash
            rememberProcessCacheKey(file, hashKey)
            await enqueueTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey: file,
                hashKey,
                rawSource: chunkHash === undefined && !processedCssAssetKnown
                  ? readCurrentProcessedRawSource()
                  : undefined,
                hash: createRuntimeAwareCssHash(
                  chunkHash,
                  sourceHash,
                  `${createRuntimeSetHash(getGeneratorRuntimeSet())}:${runtimeAffectingSourceHash}:${webpackSourceCandidates?.signatureHash ?? 'source-candidates:0'}:${webpackSourceCandidateValueSignature}:${cssSourceTraceSignature}`,
                ),
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                },
                onCacheHit() {
                  debug('css webpack-loader-pipeline cache hit: %s', file)
                },
                transform: async () => {
                  const source = readCurrentProcessedRawSource()
                  const missingProcessedLoaderGeneratedCss = isWebGeneratorTarget && processedLoaderGeneratedCss
                    ? filterExistingCssRules(
                        source,
                        stripBundlerGeneratedCssMarkers(processedLoaderGeneratedCss.css),
                      )
                    : ''
                  const sourceWithLoaderGeneratedCss = missingProcessedLoaderGeneratedCss.trim().length === 0
                    ? source
                    : createWebpackGeneratorUserCssSourceAppend(
                      { css: source, processed: true },
                      { css: missingProcessedLoaderGeneratedCss, processed: true },
                    )!.css
                  const processedBareSelectorSourceCss = processedSourceCss
                    ?? (hasTailwindGeneratedAssetCss ? removeWebpackTailwindGeneratedAssetCss(sourceWithLoaderGeneratedCss) : undefined)
                  const shouldTransformGeneratedAssetCss = hasTailwindGeneratedAssetCss
                    && (
                      !hasGeneratedCssMarker
                      || (
                        !isWebGeneratorTarget
                        && hasDeferredWebpackGeneratedCss(
                          source,
                          [...generatedCssSources.values()].map(item => item.classSet),
                        )
                      )
                    )
                  const handledCss = shouldTransformGeneratedAssetCss
                    ? isWebGeneratorTarget
                      ? sourceWithLoaderGeneratedCss
                      : (await compilerOptions.styleHandler(
                          sourceWithLoaderGeneratedCss,
                          cssHandlerOptionsForProcessedAsset,
                        )).css
                    : sourceWithLoaderGeneratedCss
                  const nextCss = stripTrailingLineWhitespace(finalizeCssAssetSource(handledCss, {
                    cssPreflight: cssHandlerOptionsForProcessedAsset.isMainChunk,
                    generatedCss: hasGeneratedCssMarker || hasTailwindGeneratedAssetCss,
                  }))
                  const processedSourceBareUserCss = isWebGeneratorTarget || processedBareSelectorSourceCss === undefined
                    ? undefined
                    : createWebpackGeneratorUserCssSourceAppend({
                        css: collectWebpackBareSelectorUserCss(processedBareSelectorSourceCss),
                        processed: false,
                      })
                  const finalizedProcessedSourceBareUserCss = processedSourceBareUserCss === undefined
                    ? ''
                    : finalizeCssAssetSource(processedSourceBareUserCss.css, {
                        cssPreflight: false,
                        generatedCss: false,
                      })
                  const missingProcessedSourceBareUserCss = finalizedProcessedSourceBareUserCss.trim().length === 0
                    ? ''
                    : filterExistingCssRules(nextCss, finalizedProcessedSourceBareUserCss)
                  const css = missingProcessedSourceBareUserCss.trim().length === 0
                    ? nextCss
                    : createWebpackGeneratorUserCssSourceAppend(
                      {
                        css: nextCss,
                        processed: true,
                      },
                      {
                        css: missingProcessedSourceBareUserCss,
                        processed: true,
                      },
                    )!.css
                  debug('css skip webpack-loader-pipeline asset: %s', file)
                  return {
                    result: new ConcatSource(finalizeTracedCss(css, cssHandlerOptionsForProcessedAsset, { finalized: true })),
                  }
                },
              })
            }, cssTaskFactories)
            continue
          }
          const currentRawSource = readRawSource()
          if (isWebpackCssLoaderRuntimeSource(currentRawSource)) {
            const hashKey = `${file}:asset`
            rememberProcessCacheKey(file, hashKey)
            await enqueueTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey: file,
                hashKey,
                rawSource: currentRawSource,
                hash: createRuntimeAwareCssHash(
                  chunkHash,
                  compilerOptions.cache.computeHash(currentRawSource),
                  'webpack-css-loader-runtime',
                ),
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                },
                onCacheHit() {
                  debug('css-loader runtime cache hit: %s', file)
                },
                transform: async () => ({
                  result: new ConcatSource(currentRawSource),
                }),
              })
            }, cssTaskFactories)
            continue
          }
          const cacheKey = file
          const hashKey = `${file}:asset`
          rememberProcessCacheKey(cacheKey, hashKey)
          const cssHandlerOptionsForHash = getCssHandlerOptions(file, currentRawSource)
          const cssChunkHash = watchMode
            && cssHandlerOptionsForHash.isMainChunk
            ? undefined
            : chunkHash
          const cssSourceHash = (() => {
            const sourceFile = resolveWebpackCssSourceFile(file, currentRawSource)
            const sourceCss = sourceFile ? cssSources.get(sourceFile)?.css : undefined
            const generatorSourceCss = removeWebpackGeneratorNonTailwindImports(sourceCss)
            if (sourceCss === undefined) {
              return sourceFile === undefined
                ? 'webpack-css-source:0'
                : `webpack-css-source:0:${sourceFile}`
            }
            return `webpack-css-source:1:${compilerOptions.cache.computeHash(sourceCss)}:${generatorSourceCss === sourceCss || generatorSourceCss === undefined ? 'generator-source:0' : compilerOptions.cache.computeHash(generatorSourceCss)}`
          })()
          const runtimeAwareHash = createRuntimeAwareCssHash(
            cssChunkHash,
            compilerOptions.cache.computeHash(currentRawSource),
            `${createRuntimeSetHash(getGeneratorRuntimeSet())}:${runtimeAffectingSourceHash}:${webpackSourceCandidates?.signatureHash ?? 'source-candidates:0'}:${webpackSourceCandidateValueSignature}:${cssSourceTraceSignature}:${cssSourceHash}`,
          )
          await enqueueTask(async () => {
            await processCachedTask({
              cache: compilerOptions.cache,
              cacheKey,
              hashKey,
              rawSource: currentRawSource,
              hash: runtimeAwareHash,
              applyResult(source, { cacheHit }) {
                updateAssetIfChanged(file, source, {
                  compare: !cacheHit,
                  notifyUpdate: !cacheHit,
                })
              },
              onCacheHit() {
                debug('css cache hit: %s', file)
              },
              transform: async () => {
                await runtimeState.readyPromise
                const cssHandlerOptions = getCssHandlerOptions(file, currentRawSource)
                const generatorRawSource = resolveWebpackGeneratorRawSource(currentRawSource, cssHandlerOptions)
                if (isWebpackCssLoaderRuntimeSource(generatorRawSource)) {
                  return {
                    result: new ConcatSource(currentRawSource),
                  }
                }
                const sourceFile = cssHandlerOptions.sourceOptions?.sourceFile
                const sourceCss = sourceFile ? cssSources.get(path.resolve(sourceFile))?.css : undefined
                const isConfiguredCssSource = sourceFile !== undefined
                  && configuredCssEntryFiles.some(entry => path.resolve(entry) === path.resolve(sourceFile))
                const isConfiguredMainCssSource = sourceFile !== undefined
                  && configuredMainCssEntryFiles.some(entry => path.resolve(entry) === path.resolve(sourceFile))
                const sourceCssHasTailwindRoot = sourceCss !== undefined
                  && hasTailwindRootDirectives(sourceCss, { importFallback: true })
                const shouldPreserveExistingPreflight = cssHandlerOptions.isMainChunk
                  || (!isConfiguredMainCssSource && (isConfiguredCssSource || sourceCssHasTailwindRoot))
                const loaderGeneratedCss = sourceFile
                  ? generatedCssSources.get(path.resolve(sourceFile))
                  : undefined
                const shouldRegenerateExplicitTailwindV4CssSource = sourceCss !== undefined
                  && (
                    hasTailwindSourceDirectives(sourceCss, { importFallback: true })
                    || sourceCss.includes('@config')
                  )
                const explicitTailwindV4SourceCandidates = shouldRegenerateExplicitTailwindV4CssSource
                  && sourceCss
                  && sourceFile
                  && webpackSourceCandidates?.getSourceCandidatesForEntries
                  ? await resolveTailwindV4EntriesFromCssCached(sourceCss, path.dirname(sourceFile))
                      .then(resolved => resolved?.entries
                        ? webpackSourceCandidates.getSourceCandidatesForEntries(resolved.entries)
                        : undefined)
                  : undefined
                if (
                  loaderGeneratedCss
                  && shouldConsumeWebpackLoaderGeneratedCss({
                    allowMarkerlessRegistryMatch: configuredCssEntryFiles.length === 1,
                    hasBundlerGeneratedCssMarker: hasBundlerGeneratedCssMarker(currentRawSource),
                    loaderGeneratedClassSet: loaderGeneratedCss.classSet,
                    sourceCandidates: explicitTailwindV4SourceCandidates,
                    shouldRegenerateExplicitTailwindV4CssSource,
                    watchMode,
                  })
                ) {
                  for (const className of loaderGeneratedCss.classSet) {
                    generatorRuntimeSet.add(className)
                    transformRuntimeSet.add(className)
                  }
                  for (const dependency of loaderGeneratedCss.dependencies) {
                    compilation.fileDependencies?.add?.(dependency)
                  }
                  const currentRawSourceWithoutBundlerMarkers = stripBundlerGeneratedCssMarkers(currentRawSource)
                  const currentAssetHasProcessedUrl = hasProcessedCssAssetUrl(currentRawSourceWithoutBundlerMarkers)
                    && currentRawSourceWithoutBundlerMarkers !== loaderGeneratedCss.css
                  const currentAssetUserCss = currentAssetHasProcessedUrl
                    ? currentRawSourceWithoutBundlerMarkers
                    : shouldUseWebpackAssetAsGeneratorUserCss(currentRawSourceWithoutBundlerMarkers, loaderGeneratedCss.css, {
                      processed: true,
                    })
                      ? removeGeneratedSelectorCompatCss(
                          currentRawSourceWithoutBundlerMarkers,
                          loaderGeneratedCss.css,
                        )
                      : undefined
                  const loaderGeneratedCssWithoutMarkers = stripBundlerGeneratedCssMarkers(loaderGeneratedCss.css)
                  const currentAssetUserCssWithoutMarkers = currentAssetUserCss === undefined
                    ? ''
                    : stripBundlerGeneratedCssMarkers(currentAssetUserCss)
                  const currentAssetUserCssHasRules = currentAssetUserCssWithoutMarkers.trim().length > 0
                    && !isCommentOnlyCss(currentAssetUserCssWithoutMarkers)
                  const currentAssetMissingUserCss = !currentAssetUserCssHasRules
                    ? ''
                    : filterExistingCssRules(currentAssetUserCssWithoutMarkers, loaderGeneratedCssWithoutMarkers)
                  if (
                    isConfiguredMainCssSource
                    && !cssHandlerOptions.isMainChunk
                  ) {
                    debug('css skip duplicate webpack loader main generation: %s <- %s', file, sourceFile)
                    const userCss = currentAssetMissingUserCss.trim().length === 0 || isCommentOnlyCss(currentAssetMissingUserCss)
                      ? ''
                      : finalizeCssAssetSource(currentAssetMissingUserCss, {
                          cssPreflight: false,
                          generatedCss: false,
                        })
                    return {
                      result: new ConcatSource(finalizeTracedCss(userCss, cssHandlerOptions)),
                    }
                  }
                  const mergedLoaderCss = currentAssetUserCss === undefined
                    ? loaderGeneratedCss.css
                    : (createWebpackGeneratorUserCssSourceAppend(
                        {
                          css: currentAssetUserCss === undefined
                            ? loaderGeneratedCss.css
                            : currentAssetHasProcessedUrl
                              ? removeGeneratedSelectorCompatCss(loaderGeneratedCss.css, currentAssetUserCss)
                              : filterExistingCssRules(currentAssetUserCss, loaderGeneratedCss.css),
                          processed: true,
                        },
                        currentAssetUserCss === undefined
                          ? undefined
                          : {
                              css: currentAssetUserCss,
                              processed: true,
                            },
                      )!.css)
                  const handledLoaderCss = isWebGeneratorTarget
                    ? mergedLoaderCss
                    : (await compilerOptions.styleHandler(mergedLoaderCss, cssHandlerOptions)).css
                  const finalizedLoaderCss = finalizeCssAssetSource(handledLoaderCss, {
                    cssPreflight: cssHandlerOptions.isMainChunk,
                    generatedCss: true,
                    preserveExistingPreflight: shouldPreserveExistingPreflight,
                  })
                  const loaderSourceBareUserCss = isWebGeneratorTarget
                    ? undefined
                    : createWebpackGeneratorUserCssSourceAppend(
                        ...[
                          currentAssetUserCss === undefined
                            ? undefined
                            : {
                                css: currentAssetUserCss,
                                processed: true,
                              },
                          sourceCss === undefined
                            ? undefined
                            : {
                                css: sourceCss,
                                processed: false,
                              },
                        ].map((source) => {
                          if (source === undefined) {
                            return undefined
                          }
                          return {
                            css: collectWebpackBareSelectorUserCss(source.css),
                            processed: source.processed,
                          }
                        }),
                      )
                  const handledLoaderSourceBareUserCss = loaderSourceBareUserCss === undefined
                    ? ''
                    : loaderSourceBareUserCss.processed
                      ? loaderSourceBareUserCss.css
                      : (await compilerOptions.styleHandler(loaderSourceBareUserCss.css, cssHandlerOptions)).css
                  const finalizedLoaderSourceBareUserCss = handledLoaderSourceBareUserCss.trim().length === 0
                    ? ''
                    : finalizeCssAssetSource(handledLoaderSourceBareUserCss, {
                        cssPreflight: false,
                        generatedCss: false,
                      })
                  const missingLoaderSourceBareUserCss = finalizedLoaderSourceBareUserCss.trim().length === 0
                    ? ''
                    : filterExistingCssRules(finalizedLoaderCss, finalizedLoaderSourceBareUserCss)
                  const css = finalizeTracedCss(
                    missingLoaderSourceBareUserCss.trim().length === 0
                      ? finalizedLoaderCss
                      : createWebpackGeneratorUserCssSourceAppend(
                        {
                          css: finalizedLoaderCss,
                          processed: true,
                        },
                        {
                          css: missingLoaderSourceBareUserCss,
                          processed: true,
                        },
                      )!.css,
                    cssHandlerOptions,
                    { finalized: true },
                  )
                  debug('css consume webpack loader generation: %s <- %s', file, sourceFile)
                  return {
                    result: new ConcatSource(css),
                  }
                }
                const sourceCssProcessed = sourceFile ? cssSources.get(path.resolve(sourceFile))?.processed === true : false
                const registeredUserRawSource = createWebpackUserCssSourceAppend(
                  [...cssSources.entries()].map(([registeredSourceFile, source]) => ({
                    ...source,
                    file: registeredSourceFile,
                  })),
                  generatorRawSource,
                  sourceFile,
                  registeredSourceFile => isSameWebpackSourceScope(file, registeredSourceFile, sourceFile),
                )
                const currentAssetLooksGenerated = hasTailwindGeneratedCss(currentRawSource)
                  || hasTailwindGeneratedCssMarkers(currentRawSource)
                const currentAssetHasBundlerGeneratedMarker = hasBundlerGeneratedCssMarker(currentRawSource)
                const currentAssetUserCssSource = currentAssetLooksGenerated
                  ? removeWebpackTailwindGeneratedAssetCss(currentRawSource)
                  : currentRawSource
                if (
                  sourceFile === undefined
                  && currentAssetHasBundlerGeneratedMarker
                  && (
                    currentAssetUserCssSource.trim().length === 0
                    || isCommentOnlyCss(currentAssetUserCssSource)
                  )
                ) {
                  return {
                    result: new ConcatSource(finalizeTracedCss('', cssHandlerOptions)),
                  }
                }
                const currentAssetHasAdditionalUserCss = currentAssetLooksGenerated
                  && (
                    hasAdditionalWebpackAssetUserCssMarkers(currentAssetUserCssSource, generatorRawSource)
                    || currentAssetUserCssSource.trim().length > 0
                  )
                const shouldPreserveGeneratedWebAssetUserCss = isWebGeneratorTarget
                  && currentAssetLooksGenerated
                  && !currentAssetHasBundlerGeneratedMarker
                  && !currentAssetHasAdditionalUserCss
                const hasExplicitSourceCssForCurrentAsset = sourceCss !== undefined
                  && (
                    hasTailwindRootDirectives(sourceCss, { importFallback: true })
                    || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
                    || hasTailwindApplyDirective(sourceCss)
                  )
                const currentAssetHasUserCss = (sourceCssProcessed || hasExplicitSourceCssForCurrentAsset) && currentAssetLooksGenerated && !shouldPreserveGeneratedWebAssetUserCss
                  ? currentAssetHasAdditionalUserCss
                  : shouldUseWebpackAssetAsGeneratorUserCss(currentAssetUserCssSource, generatorRawSource, {
                      processed: sourceCssProcessed || shouldPreserveGeneratedWebAssetUserCss,
                    })
                const shouldAppendCurrentAssetUserCss = shouldAppendCurrentWebpackAssetUserCss({
                  currentAssetHasBundlerGeneratedMarker,
                  currentAssetHasUserCss,
                  currentAssetLooksGenerated,
                  registeredUserRawSource,
                  shouldPreserveGeneratedWebAssetUserCss,
                  sourceCssProcessed,
                })
                const userRawSource = createWebpackGeneratorUserCssSourceAppend(
                  createWebpackCurrentAssetUserRawSource({
                    currentAssetHasUserCss,
                    currentAssetLooksGenerated,
                    currentAssetUserCssSource,
                    shouldAppendCurrentAssetUserCss,
                    sourceCssProcessed,
                  }),
                  registeredUserRawSource,
                )
                if (isPureLocalCssImportWrapper(currentRawSource)) {
                  return {
                    result: new ConcatSource(removeTailwindSourceDirectives(
                      stripBundlerGeneratedCssMarkers(currentRawSource),
                      { importFallback: true },
                    )),
                  }
                }
                const fallbackGeneratorRuntimeSet = getGeneratorRuntimeSet()
                const hasExplicitTailwindV4SourceCss = sourceCss !== undefined
                  && (
                    hasTailwindSourceDirectives(sourceCss, { importFallback: true })
                    || sourceCss.includes('@config')
                  )
                const currentAssetHasTailwindDirectives = hasTailwindRootDirectives(generatorRawSource, { importFallback: true })
                  || hasTailwindSourceDirectives(generatorRawSource, { importFallback: true })
                  || hasTailwindApplyDirective(generatorRawSource)
                const shouldForceTailwindV4Generation = hasConfiguredTailwindV4SourceRoots()
                  && (
                    (configuredMainCssEntryFiles.length > 0 && sourceFile !== undefined)
                    || currentAssetHasTailwindDirectives
                    || hasExplicitTailwindV4SourceCss
                  )
                const shouldSkipUnmatchedMainCssGeneration = !isWebGeneratorTarget
                  && cssHandlerOptions.isMainChunk
                  && sourceFile === undefined
                  && configuredMainCssEntryFiles.length > 0
                  && !currentAssetHasTailwindDirectives
                const shouldSkipPlainNonMainCssGeneration = !cssHandlerOptions.isMainChunk
                  && sourceCss !== undefined
                  && !hasExplicitSourceCssForCurrentAsset
                  && !hasExplicitTailwindV4SourceCss
                  && !currentAssetHasTailwindDirectives
                const shouldMergeFallbackGeneratorRuntime = cssHandlerOptions.isMainChunk
                  || currentAssetHasTailwindDirectives
                  || hasExplicitSourceCssForCurrentAsset
                const scopedFallbackGeneratorRuntimeSet = hasExplicitTailwindV4SourceCss || !shouldMergeFallbackGeneratorRuntime
                  ? new Set<string>()
                  : fallbackGeneratorRuntimeSet
                const resolvedScopedGeneratorRuntimeSet = await createScopedGeneratorRuntime({
                  cssHandlerOptions,
                  fallbackRuntime: scopedFallbackGeneratorRuntimeSet,
                  getSourceCandidatesForEntries: webpackSourceCandidates?.getSourceCandidatesForEntries,
                  majorVersion: runtimeState.tailwindRuntime.majorVersion,
                  outputFile: file,
                  rawSource: sourceFile ? (cssSources.get(path.resolve(sourceFile))?.css ?? generatorRawSource) : generatorRawSource,
                  shouldExcludeSubpackageSourceCandidates: () => false,
                  sourceFile: sourceFile ?? file,
                  scopedSourceCandidateGetter: webpackSourceCandidates?.getSourceCandidatesForEntries,
                })
                const scopedGeneratorRuntimeSet = !hasExplicitTailwindV4SourceCss
                  && resolvedScopedGeneratorRuntimeSet !== scopedFallbackGeneratorRuntimeSet
                  && shouldMergeFallbackGeneratorRuntime
                  ? new Set([
                      ...fallbackGeneratorRuntimeSet,
                      ...resolvedScopedGeneratorRuntimeSet,
                    ])
                  : resolvedScopedGeneratorRuntimeSet
                const generatorCssSources = normalizeWebpackGeneratorCssSources(cssHandlerOptions.sourceOptions?.cssSources)
                const scopedGeneratorCompilerOptions = scopeWebpackGeneratorOptionsToCssSource(compilerOptions, sourceFile, {
                  disableUnmatchedCssEntries: !isWebGeneratorTarget && cssHandlerOptions.isMainChunk,
                })
                const generatorCssHandlerOptions = generatorCssSources === undefined
                  ? cssHandlerOptions
                  : {
                      ...cssHandlerOptions,
                      sourceOptions: {
                        ...cssHandlerOptions.sourceOptions,
                        cssSources: generatorCssSources,
                      },
                    }
                const generatorOptions = {
                  opts: scopedGeneratorCompilerOptions,
                  runtimeState,
                  runtime: scopedGeneratorRuntimeSet,
                  rawSource: generatorRawSource,
                  forceGenerator: shouldForceTailwindV4Generation,
                  ...(hasUsableWebpackGeneratorCssSources(generatorCssSources)
                    ? { cssSources: generatorCssSources }
                    : {}),
                  ...(userRawSource === undefined ? {} : { userRawSource: userRawSource.css }),
                  ...(userRawSource?.processed === true ? { userRawSourceProcessed: true } : {}),
                  file,
                  cssHandlerOptions: generatorCssHandlerOptions,
                  cssUserHandlerOptions: getCssUserHandlerOptions(file),
                  getSourceCandidatesForEntries: webpackSourceCandidates?.getSourceCandidatesForEntries,
                  sourceCandidates: scopedGeneratorRuntimeSet,
                  restoreLocalCssImports: false,
                  styleHandler: compilerOptions.styleHandler,
                  debug,
                }
                let generated: Awaited<ReturnType<typeof generateTailwindV4Css>>
                if (!shouldSkipUnmatchedMainCssGeneration && !shouldSkipPlainNonMainCssGeneration) {
                  try {
                    generated = await generateTailwindV4Css({
                      ...generatorOptions,
                      outputFile: file,
                    })
                  }
                  catch (error) {
                    const shouldFallbackToUserCss = shouldFallbackToWebpackUserCssOnGeneratorError({
                      configuredMainCssEntryFilesLength: configuredMainCssEntryFiles.length,
                      generatorRawSource,
                      hasExplicitTailwindV4SourceCss,
                    })
                    if (!shouldFallbackToUserCss) {
                      throw error
                    }
                    debug('css generator skipped for plain webpack css asset: %s %O', file, error)
                    generated = undefined
                  }
                }
                else {
                  debug('css generator skipped for plain webpack css asset: %s', file)
                }
                const finalizedGeneratedCss = generated
                  ? finalizeCssAssetSource(
                      isWebGeneratorTarget && currentRawSource.includes('tailwindcss v4.')
                        ? createWebpackGeneratorUserCssSourceAppend(
                          { css: generated.css, processed: true },
                          {
                            css: removeWebpackTailwindGeneratedAssetCss(currentRawSource),
                            processed: true,
                          },
                        )?.css ?? generated.css
                        : generated.css,
                      {
                        cssPreflight: cssHandlerOptions.isMainChunk,
                        generatedCss: true,
                        preserveExistingPreflight: shouldPreserveExistingPreflight,
                      },
                    )
                  : isWebGeneratorTarget
                    ? finalizeCssAssetSource(generatorRawSource, { generatedCss: false })
                    : finalizeCssAssetSource(
                        (await compilerOptions.styleHandler(generatorRawSource, cssHandlerOptions)).css,
                        { generatedCss: false },
                      )
                const sourceBareUserCss = isWebGeneratorTarget
                  ? undefined
                  : createWebpackGeneratorUserCssSourceAppend(
                      ...[
                        userRawSource,
                        sourceCss === undefined
                          ? undefined
                          : {
                              css: sourceCss,
                              processed: sourceCssProcessed,
                            },
                        {
                          css: generatorRawSource,
                          processed: false,
                        },
                      ].map((source) => {
                        if (source === undefined) {
                          return undefined
                        }
                        return {
                          css: collectWebpackBareSelectorUserCss(source.css),
                          processed: source.processed,
                        }
                      }),
                    )
                const handledSourceBareUserCss = sourceBareUserCss === undefined
                  ? ''
                  : sourceBareUserCss.processed
                    ? sourceBareUserCss.css
                    : (await compilerOptions.styleHandler(sourceBareUserCss.css, cssHandlerOptions)).css
                const finalizedSourceBareUserCss = handledSourceBareUserCss.trim().length === 0
                  ? ''
                  : finalizeCssAssetSource(handledSourceBareUserCss, {
                      cssPreflight: false,
                      generatedCss: false,
                    })
                const missingSourceBareUserCss = finalizedSourceBareUserCss.trim().length === 0
                  ? ''
                  : filterExistingCssRules(finalizedGeneratedCss, finalizedSourceBareUserCss)
                const css = finalizeTracedCss(
                  missingSourceBareUserCss.trim().length === 0
                    ? finalizedGeneratedCss
                    : createWebpackGeneratorUserCssSourceAppend(
                      {
                        css: finalizedGeneratedCss,
                        processed: true,
                      },
                      {
                        css: missingSourceBareUserCss,
                        processed: true,
                      },
                    )!.css,
                  cssHandlerOptions,
                  { finalized: true },
                )
                const source = new ConcatSource(css)

                if (generated) {
                  for (const className of generated.classSet) {
                    generatorRuntimeSet.add(className)
                  }
                  debug('css handle via tailwind v%s engine(%s): %s', runtimeState.tailwindRuntime.majorVersion, generated.target, file)
                }
                else {
                  debug('css handle: %s', file)
                }

                return {
                  result: source,
                }
              },
            })
          }, cssTaskFactories)
        }
        if (!watchMode) {
          pushConcurrentTaskFactories(tasks, htmlTaskFactories, taskConcurrency)
          await Promise.all(tasks)
          tasks.length = 0
          pushConcurrentTaskFactories(tasks, jsTaskFactories, taskConcurrency)
          await Promise.all(tasks)
          tasks.length = 0
          pushConcurrentTaskFactories(tasks, cssTaskFactories, taskConcurrency)
        }

        await Promise.all(tasks)
        compilerOptions.cache.prune?.({
          cacheKeys: activeProcessCacheKeys,
          hashKeys: activeProcessHashKeys,
        })
        const activeCssFiles = new Set(groupedEntries.css.map(([file]) => file))
        pruneWebpackCssHandlerOptionCaches(
          cssHandlerOptionsCache,
          cssUserHandlerOptionsCache,
          activeCssFiles,
        )
        if (activeCssFiles.size > 0) {
          pruneWebpackCssSources?.(new Set([
            ...registeredWebpackCssSourceFiles,
            ...activeWebpackCssSourceFiles,
            ...[...cssAssetResources.values()].flatMap(resources => [...resources]),
          ]), { watchMode })
        }
        debug('end')
        emitHmrTiming('webpack', 'processAssets', performance.now() - hmrTimingStartedAt, {
          memoryDebug: resolveWebpackMemoryDebugStats({
            activeAssetFiles: entries.length,
            activeCssFiles: activeCssFiles.size,
            activeProcessCacheKeys,
            activeProcessHashKeys,
            cache: compilerOptions.cache,
            cssHandlerOptionsCache,
            cssUserHandlerOptionsCache,
            phase: 'processAssets',
            sourceCandidateScan: webpackSourceCandidateScanCache.getMemoryStats(),
          }),
        })
        compilerOptions.onEnd()
      },
    )
    if (!isWebGeneratorTarget) {
      compilation.hooks.processAssets.tapPromise(
        {
          name: `${pluginName}:finalize-css-assets`,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_HASH,
        },
        async (assets) => {
          const entries = Object.entries(assets)
          if (entries.length === 0) {
            return
          }
          const groupedEntries = getGroupedEntries(entries, compilerOptions)
          if (groupedEntries.css.length === 0) {
            return
          }
          const { updateAssetIfChanged } = createWebpackAssetUpdater({
            compilation,
            ConcatSource,
            onUpdate: compilerOptions.onUpdate,
            debug,
          })
          for (const [file, asset] of groupedEntries.css) {
            const currentAsset = compilation.getAsset(file)
            const rawSource = currentAsset?.source.source() ?? asset.source()
            const source = stringifyWebpackSourceLike(rawSource)
            const finalized = finalizeWebpackCssAssetOutputSource(source, compilerOptions, isWebGeneratorTarget)
            updateAssetIfChanged(file, finalized)
          }
        },
      )
    }
  })
}
