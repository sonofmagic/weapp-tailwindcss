import type { SourceCandidateCollector } from '../../vite/source-candidates'
import type { SetupWebpackV5ProcessAssetsHookOptions } from './v5-assets/helpers'
import type { WebpackSourceCandidateScanMemoryStats } from './v5-assets/source-candidate-cache'
import type { LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { resolveStyleOptionsFromContext } from '@/context/style-options'
import { shouldSkipJsTransform } from '@/js/precheck'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { getTailwindV3IncrementalGenerateCacheStats } from '@/tailwindcss/v3-engine'
import { getTailwindV4IncrementalGenerateCacheStats } from '@/tailwindcss/v4-engine'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import { finalizeMiniProgramCss, pruneMiniProgramGeneratedCss } from '../../shared/css-cleanup'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap, isCssSourceTraceEnabled } from '../../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../../shared/generated-css-marker'
import { generateCssByGenerator, isPureLocalCssImportWrapper } from '../../shared/generator-css'
import { removeTailwindSourceDirectives } from '../../shared/generator-css/directives'
import { emitHmrTiming } from '../../shared/hmr-timing'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories, resolveTaskConcurrency } from '../../shared/run-tasks'
import { createBundleBuildState, updateBundleBuildState } from '../../vite/bundle-state'
import { createCandidateSignature } from '../../vite/generate-bundle/signatures'
import { createBundleRuntimeClassSetManager } from '../../vite/incremental-runtime-class-set'
import { createSourceCandidateCollector, createTailwindV3DefaultExtractor } from '../../vite/source-candidates'
import { resolveViteSourceScanEntries } from '../../vite/source-scan'
import { createAssetHashByChunkMap, createRuntimeAwareCssHash, getCacheKey } from './shared'
import { buildWebpackBundleSnapshot, createWebpackAssetUpdater, releaseWebpackBundleSnapshotSources } from './v5-assets/helpers'
import { createWebpackSourceCandidateScanCache } from './v5-assets/source-candidate-cache'

interface WebpackCssHandlerOptions {
  isMainChunk: boolean
  postcssOptions: { options: { from: string } }
  majorVersion?: number | undefined
  sourceOptions?: {
    outputRoot?: string | undefined
    sourceCss?: string | undefined
    sourceFile?: string | undefined
  } | undefined
}

const WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX = 128

interface WebpackSourceCandidateCache {
  getSourceCandidatesForEntries: SourceCandidateCollector['valuesForEntries']
  signatureHash: string
  tokenSources: ReturnType<SourceCandidateCollector['sourcesForEntries']>
}

function isRuntimeTransformCandidate(candidate: string) {
  return candidate.length > 0
    && !candidate.includes('=')
    && !candidate.includes('<')
    && !candidate.includes('>')
    && !candidate.includes('${')
}

function toMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024)
}

function pruneMapToMaxSize<Key, Value>(map: Map<Key, Value>, maxSize: number) {
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value
    if (oldestKey === undefined) {
      break
    }
    map.delete(oldestKey)
  }
}

function pruneWebpackCssHandlerOptionCaches(
  cssHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>,
  cssUserHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>,
  activeCssFiles: Set<string>,
) {
  const activeSuffixes = [...activeCssFiles].map(file => `:${file}`)
  for (const key of cssHandlerOptionsCache.keys()) {
    if (!activeSuffixes.some(suffix => key.endsWith(suffix))) {
      cssHandlerOptionsCache.delete(key)
    }
  }
  for (const key of cssUserHandlerOptionsCache.keys()) {
    if (!activeSuffixes.some(suffix => key.endsWith(suffix))) {
      cssUserHandlerOptionsCache.delete(key)
    }
  }
  pruneMapToMaxSize(cssHandlerOptionsCache, WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX)
  pruneMapToMaxSize(cssUserHandlerOptionsCache, WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX)
}

function resolveWebpackGeneratorRawSource(
  rawSource: string,
  cssHandlerOptions: WebpackCssHandlerOptions,
) {
  return cssHandlerOptions.sourceOptions?.sourceCss ?? rawSource
}

function stripStyleExtension(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  const ext = path.extname(normalized)
  return ext ? normalized.slice(0, -ext.length) : normalized
}

function normalizeMatchPath(file: string) {
  return file.split(path.sep).join('/')
}

function isPathWithinRoot(file: string, root: string) {
  const relative = path.relative(root, file)
  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function collectWebpackCssMatchBases(
  file: string,
  roots: Array<string | undefined>,
) {
  const normalizedFile = file.replace(/[?#].*$/, '')
  const bases = new Set<string>()
  const addBase = (candidate: string) => {
    const stripped = normalizeMatchPath(stripStyleExtension(candidate))
    if (stripped.length > 0) {
      bases.add(stripped)
      const withoutWorkspaceSegment = stripped.replace(/^(?:src|dist)\//, '')
      if (withoutWorkspaceSegment !== stripped && withoutWorkspaceSegment.length > 0) {
        bases.add(withoutWorkspaceSegment)
      }
    }
  }

  addBase(normalizedFile)
  const resolvedRoots = roots
    .filter((root): root is string => typeof root === 'string' && root.length > 0)
    .map(root => path.resolve(root))
  if (path.isAbsolute(normalizedFile)) {
    for (const root of resolvedRoots) {
      if (isPathWithinRoot(normalizedFile, root)) {
        addBase(path.relative(root, normalizedFile))
      }
    }
  }
  else {
    for (const root of resolvedRoots) {
      addBase(path.resolve(root, normalizedFile))
    }
  }
  return bases
}

function scoreWebpackCssSourceFileMatch(
  outputFile: string,
  sourceFile: string,
  options: {
    outputRoot: string
    projectRoot?: string | undefined
  },
) {
  const outputBases = collectWebpackCssMatchBases(outputFile, [
    options.outputRoot,
    options.projectRoot,
  ])
  const sourceBases = collectWebpackCssMatchBases(sourceFile, [
    options.projectRoot,
  ])
  let bestScore = 0
  for (const outputBase of outputBases) {
    for (const sourceBase of sourceBases) {
      if (outputBase === sourceBase) {
        bestScore = Math.max(bestScore, 100000 + outputBase.length)
      }
      else if (outputBase.endsWith(`/${sourceBase}`)) {
        bestScore = Math.max(bestScore, 50000 + sourceBase.length)
      }
      else if (sourceBase.endsWith(`/${outputBase}`)) {
        bestScore = Math.max(bestScore, 1000 + outputBase.length)
      }
    }
  }
  return bestScore
}

function resolveWebpackMemoryDebugStats(context: {
  activeAssetFiles: number
  activeCssFiles: number
  activeProcessCacheKeys: Set<string>
  activeProcessHashKeys: Set<string | number>
  cache: SetupWebpackV5ProcessAssetsHookOptions['options']['cache']
  cssHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  cssUserHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  phase: string
  sourceCandidateScan: WebpackSourceCandidateScanMemoryStats
}) {
  if (process.env['WEAPP_TW_HMR_MEMORY_DEBUG'] !== '1') {
    return undefined
  }

  const memory = process.memoryUsage()
  return {
    phase: context.phase,
    process: {
      rssMb: toMb(memory.rss),
      heapTotalMb: toMb(memory.heapTotal),
      heapUsedMb: toMb(memory.heapUsed),
      externalMb: toMb(memory.external),
      arrayBuffersMb: toMb(memory.arrayBuffers),
    },
    assets: {
      active: context.activeAssetFiles,
      activeCss: context.activeCssFiles,
    },
    processCache: {
      instance: context.cache.instance.size,
      hashMap: context.cache.hashMap.size,
      activeCacheKeys: context.activeProcessCacheKeys.size,
      activeHashKeys: context.activeProcessHashKeys.size,
    },
    webpackCss: {
      handlerOptions: context.cssHandlerOptionsCache.size,
      userHandlerOptions: context.cssUserHandlerOptionsCache.size,
      maxHandlerOptions: WEBPACK_CSS_HANDLER_OPTIONS_CACHE_MAX,
    },
    sourceCandidateScan: context.sourceCandidateScan,
    tailwind: {
      v3: getTailwindV3IncrementalGenerateCacheStats(),
      v4: getTailwindV4IncrementalGenerateCacheStats(),
    },
  }
}

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
    pruneWebpackCssSources,
    debug,
  } = options
  const { Compilation, sources } = compiler.webpack
  const { ConcatSource } = sources
  const generatorOptions = compilerOptions.generator
  const isWebGeneratorTarget = generatorOptions?.target === 'web'
  const cssHandlerOptionsCache = new Map<string, WebpackCssHandlerOptions>()
  const cssUserHandlerOptionsCache = new Map<string, WebpackCssHandlerOptions>()
  const webpackSourceCandidateScanCache = createWebpackSourceCandidateScanCache()
  const bundleBuildState = createBundleBuildState()
  const bundleRuntimeClassSetManager = runtimeClassSetManager ?? createBundleRuntimeClassSetManager()
  let webpackWatchRuntimeScanInitialized = false

  compiler.hooks.compilation.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      },
      async (assets) => {
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

        const entries = Object.entries(assets)
        const compilerOutputPath = compilation.compiler?.outputPath ?? compiler.outputPath
        const outputDir = compilerOutputPath
          ? path.resolve(compilerOutputPath)
          : (compilation.outputOptions?.path ?? process.cwd())
        const jsAssets = new Map<string, string>()
        for (const [file] of entries) {
          if (compilerOptions.jsMatcher(file) || compilerOptions.wxsMatcher(file)) {
            const absolute = toAbsoluteOutputPath(file, outputDir)
            jsAssets.set(absolute, file)
          }
        }
        const moduleGraphOptions = {
          resolve(specifier: string, importer: string) {
            return resolveOutputSpecifier(specifier, importer, outputDir, candidate => jsAssets.has(candidate))
          },
          load: (id: string) => {
            const assetName = jsAssets.get(id)
            if (!assetName) {
              return undefined
            }
            const asset = compilation.getAsset(assetName)
            if (!asset) {
              return undefined
            }
            const source = asset.source.source()
            return typeof source === 'string' ? source : source.toString()
          },
          filter(id: string) {
            return jsAssets.has(id)
          },
        }
        const applyLinkedResults = (linked: Record<string, LinkedJsModuleResult> | undefined) => {
          if (!linked) {
            return
          }
          for (const [id, { code }] of Object.entries(linked)) {
            const assetName = jsAssets.get(id)
            if (!assetName) {
              continue
            }
            const asset = compilation.getAsset(assetName)
            if (!asset) {
              continue
            }
            const previousSource = asset.source.source()
            const previous = typeof previousSource === 'string' ? previousSource : previousSource.toString()
            if (previous === code) {
              continue
            }
            const source = new ConcatSource(code)
            if (updateAssetIfChanged(assetName, source)) {
              debug('js linked handle: %s', assetName)
            }
          }
        }
        const groupedEntries = getGroupedEntries(entries, compilerOptions)
        const watchMode = isWatchMode?.() === true
        const watchChangedFiles = new Set([...getWatchChangedFiles?.() ?? []].map(file => path.resolve(file)))
        const taskConcurrency = watchMode ? resolveTaskConcurrency(1) : undefined
        const activeProcessCacheKeys = new Set<string>()
        const activeProcessHashKeys = new Set<string | number>()
        const rememberProcessCacheKey = (cacheKey: string, hashKey: string | number = cacheKey) => {
          activeProcessCacheKeys.add(cacheKey)
          activeProcessHashKeys.add(hashKey)
        }
        for (const chunk of compilation.chunks) {
          if (chunk.id) {
            activeProcessHashKeys.add(chunk.id)
          }
        }
        const cssSources = new Map(
          [...(getWebpackCssSources?.() ?? [])]
            .map(([file, css]) => [path.resolve(file), css] as const),
        )
        const cssSourceFiles = [...cssSources.keys()]
          .sort()
        const configuredMainCssSourceFiles = (() => {
          if ((runtimeState.twPatcher.majorVersion ?? 0) < 4) {
            return []
          }
          const tailwindOptions = resolveTailwindcssOptions(runtimeState.twPatcher.options)
          return [
            ...(tailwindOptions?.v4?.cssEntries ?? []),
            ...(tailwindOptions?.v4?.cssSources ?? []).map(source => source.file),
          ]
            .filter((file): file is string => typeof file === 'string' && file.length > 0)
            .map(file => path.resolve(file))
        })()
        const activeWebpackCssSourceFiles = new Set<string>()
        const resolveConfiguredMainCssSourceFile = (file: string) => {
          if (!compilerOptions.mainCssChunkMatcher(file, appType)) {
            return undefined
          }
          for (const sourceFile of configuredMainCssSourceFiles) {
            if (cssSources.has(sourceFile)) {
              activeWebpackCssSourceFiles.add(sourceFile)
              return sourceFile
            }
          }
          return undefined
        }
        const resolveWebpackCssSourceFile = (file: string) => {
          if (cssSourceFiles.length === 0) {
            return undefined
          }
          const configuredMainSourceFile = resolveConfiguredMainCssSourceFile(file)
          if (configuredMainSourceFile) {
            return configuredMainSourceFile
          }
          const matches = cssSourceFiles
            .map(sourceFile => ({
              sourceFile,
              score: scoreWebpackCssSourceFileMatch(file, sourceFile, {
                outputRoot: outputDir,
                projectRoot: compilerOptions.tailwindcssBasedir,
              }),
            }))
            .filter(match => match.score > 0)
            .sort((a, b) => b.score - a.score)
          const bestScore = matches[0]?.score ?? 0
          const bestMatches = matches.filter(match => match.score === bestScore)
          const sourceFile = bestMatches.length === 1 ? bestMatches[0]?.sourceFile : undefined
          if (sourceFile) {
            activeWebpackCssSourceFiles.add(sourceFile)
          }
          return sourceFile
        }
        const getCssHandlerOptions = (file: string) => {
          const majorVersion = runtimeState.twPatcher.majorVersion
          const isMainChunk = compilerOptions.mainCssChunkMatcher(file, appType)
          const sourceFile = resolveWebpackCssSourceFile(file)
          const sourceCss = sourceFile ? cssSources.get(sourceFile) : undefined
          const cacheKey = [
            majorVersion ?? 'unknown',
            isMainChunk ? '1' : '0',
            sourceFile ?? 'asset',
            sourceCss === undefined ? 'source:0' : compilerOptions.cache.computeHash(sourceCss),
            file,
          ].join(':')
          const cached = cssHandlerOptionsCache.get(cacheKey)
          if (cached) {
            return cached
          }

          const created = {
            isMainChunk,
            postcssOptions: {
              options: {
                from: sourceFile ?? file,
              },
            },
            sourceOptions: {
              outputRoot: outputDir,
              ...(sourceCss === undefined ? {} : { sourceCss }),
              ...(sourceFile === undefined ? {} : { sourceFile }),
            },
            ...(majorVersion === undefined ? {} : { majorVersion }),
          }
          cssHandlerOptionsCache.set(cacheKey, created)
          return created
        }
        const getCssUserHandlerOptions = (file: string) => {
          const majorVersion = runtimeState.twPatcher.majorVersion
          const sourceFile = resolveWebpackCssSourceFile(file)
          const sourceCss = sourceFile ? cssSources.get(sourceFile) : undefined
          const cacheKey = [
            majorVersion ?? 'unknown',
            sourceFile ?? 'asset',
            sourceCss === undefined ? 'source:0' : compilerOptions.cache.computeHash(sourceCss),
            file,
          ].join(':')
          const cached = cssUserHandlerOptionsCache.get(cacheKey)
          if (cached) {
            return cached
          }

          const created = {
            ...getCssHandlerOptions(file),
            isMainChunk: false,
          }
          cssUserHandlerOptionsCache.set(cacheKey, created)
          return created
        }
        const refreshWebpackSourceCandidates = async (): Promise<WebpackSourceCandidateCache | undefined> => {
          const majorVersion = runtimeState.twPatcher.majorVersion
          if (majorVersion !== 3 && majorVersion !== 4) {
            return undefined
          }
          const root = compilerOptions.tailwindcssBasedir ?? process.cwd()
          let sourceScan: Awaited<ReturnType<typeof resolveViteSourceScanEntries>>
          try {
            sourceScan = await resolveViteSourceScanEntries(compilerOptions, runtimeState.twPatcher, {
              root,
              outDir: outputDir,
            })
          }
          catch (error) {
            debug('webpack source candidate scan skipped: %O', error)
            return undefined
          }
          return webpackSourceCandidateScanCache.resolve({
            changedFiles: watchChangedFiles,
            collector: createSourceCandidateCollector({
              bareArbitraryValues: compilerOptions.arbitraryValues?.bareArbitraryValues,
              extractor: majorVersion === 3
                ? createTailwindV3DefaultExtractor()
                : undefined,
            }),
            outDir: outputDir,
            root,
            sourceScan,
            watchMode,
          })
        }
        const finalizeCssAssetSource = (source: string, options: { generatedCss?: boolean } = {}) => {
          const styleOptions = resolveStyleOptionsFromContext(compilerOptions)
          let finalized = removeTailwindSourceDirectives(
            stripBundlerGeneratedCssMarkers(source),
            { importFallback: true },
          )
          if (isWebGeneratorTarget || options.generatedCss !== true) {
            return finalized
          }
          try {
            finalized = pruneMiniProgramGeneratedCss(finalized, {
              preservePreflight: runtimeState.twPatcher.majorVersion === 3,
            })
          }
          catch {
            finalized = finalizeMiniProgramCss(finalized, {
              cssPreflight: runtimeState.twPatcher.majorVersion === 4 ? compilerOptions.cssPreflight : undefined,
              isTailwindcssV4: runtimeState.twPatcher.majorVersion === 4,
              preservePseudoContentInit: runtimeState.twPatcher.majorVersion === 3,
              tailwindcssV4GradientFallback: styleOptions.tailwindcssV4GradientFallback,
            })
          }
          return finalized
        }
        const finalizeMiniProgramUserCssAssetSource = (source: string) => {
          const styleOptions = resolveStyleOptionsFromContext(compilerOptions)
          if (isWebGeneratorTarget) {
            return source
          }
          return finalizeMiniProgramCss(source, {
            cssPreflight: runtimeState.twPatcher.majorVersion === 4 ? compilerOptions.cssPreflight : undefined,
            isTailwindcssV4: runtimeState.twPatcher.majorVersion === 4,
            preservePseudoContentInit: runtimeState.twPatcher.majorVersion === 3,
            tailwindcssV4GradientFallback: styleOptions.tailwindcssV4GradientFallback,
          })
        }
        const shouldRefreshWebpackSourceCandidates = groupedEntries.css?.length
          || isCssSourceTraceEnabled(compilerOptions)
        const webpackSourceCandidates = shouldRefreshWebpackSourceCandidates
          ? await refreshWebpackSourceCandidates()
          : undefined
        const webpackSourceCandidateValueSignature = webpackSourceCandidates
          ? createCandidateSignature(webpackSourceCandidates.getSourceCandidatesForEntries(undefined))
          : 'source-candidates:0'
        const cssSourceTraceTokenSources = isCssSourceTraceEnabled(compilerOptions) && webpackSourceCandidates
          ? createCssTokenSourceMap(webpackSourceCandidates.tokenSources, compilerOptions)
          : undefined
        const cssSourceTraceSignature = createCssSourceTraceCacheSignature(cssSourceTraceTokenSources, compilerOptions)
        const annotateCss = (css: string) => annotateCssSourceTrace(css, {
          opts: compilerOptions,
          tokenSources: cssSourceTraceTokenSources,
        })
        const finalizeTracedCss = (css: string) => {
          const traced = annotateCss(css)
          if (isWebGeneratorTarget || !isCssSourceTraceEnabled(compilerOptions)) {
            return traced
          }
          return finalizeMiniProgramUserCssAssetSource(traced)
        }
        const forceRuntimeRefresh = getRuntimeRefreshRequirement()
        debug('processAssets ensure runtime set forceRefresh=%s major=%s', forceRuntimeRefresh, runtimeState.twPatcher.majorVersion ?? 'unknown')
        let runtimeSet: Set<string>
        if (watchMode && runtimeState.twPatcher.majorVersion === 4 && !forceRuntimeRefresh) {
          const snapshot = buildWebpackBundleSnapshot(assets as any, compilerOptions, bundleBuildState)
          if (!webpackWatchRuntimeScanInitialized) {
            for (const entry of snapshot.entries) {
              if (entry.type === 'html' || entry.type === 'js') {
                snapshot.runtimeAffectingChangedByType[entry.type].add(entry.file)
              }
            }
          }
          try {
            runtimeSet = await bundleRuntimeClassSetManager.sync(runtimeState.twPatcher, snapshot)
          }
          catch (error) {
            debug('webpack incremental runtime set sync failed, fallback to full collect: %O', error)
            await bundleRuntimeClassSetManager.reset()
            runtimeSet = await ensureRuntimeClassSet(runtimeState, {
              forceRefresh: false,
              forceCollect: true,
              clearCache: false,
              allowEmpty: false,
            })
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
            // otherwise Taro webpack v3 can do a second full content scan in
            // processAssets for the same rebuild.
            forceCollect: !watchMode || forceRuntimeRefresh,
            clearCache: forceRuntimeRefresh,
            allowEmpty: false,
          })
        }
        await refreshRuntimeMetadata(forceRuntimeRefresh)
        consumeRuntimeRefreshRequirement()
        const transformRuntimeSet = new Set(runtimeSet)
        const webpackSourceCandidateSet = webpackSourceCandidates?.getSourceCandidatesForEntries(undefined)
        if (webpackSourceCandidateSet?.size) {
          for (const candidate of webpackSourceCandidateSet) {
            if (isRuntimeTransformCandidate(candidate)) {
              transformRuntimeSet.add(candidate)
            }
          }
        }
        const runtimeSetHash = compilerOptions.cache.computeHash([
          getRuntimeClassSetSignature(runtimeState.twPatcher),
          [...runtimeSet].sort().join('\n'),
          [...transformRuntimeSet].sort().join('\n'),
        ].join('\n\n'))
        const defaultTemplateHandlerOptions = {
          runtimeSet: transformRuntimeSet,
        }
        debug('get runtimeSet, class count: %d, transform class count: %d', runtimeSet.size, transformRuntimeSet.size)
        const tasks: Promise<void>[] = []
        const taskFactories: Array<() => Promise<void>> = []
        const enqueueTask = async (
          factory: () => Promise<void>,
          target: Array<() => Promise<void>> = taskFactories,
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
            })
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
            let initialRawSource: string | undefined
            const readInitialRawSource = () => {
              if (initialRawSource === undefined) {
                const initialSource = asset.source.source()
                initialRawSource = typeof initialSource === 'string' ? initialSource : initialSource.toString()
              }
              return initialRawSource
            }
            const chunkHash = assetHashByChunk.get(file)
            await enqueueJsTask(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey,
                rawSource: chunkHash === undefined ? readInitialRawSource() : undefined,
                hash: chunkHash,
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, {
                    compare: !cacheHit,
                    notifyUpdate: !cacheHit,
                  })
                },
                onCacheHit() {
                  debug('js cache hit: %s', file)
                },
                transform: async () => {
                  const currentAsset = compilation.getAsset(file)
                  const currentSourceValue = currentAsset?.source.source()
                  const currentSource = typeof currentSourceValue === 'string'
                    ? currentSourceValue
                    : currentSourceValue?.toString() ?? ''
                  const handlerOptions = {
                    tailwindcssMajorVersion: runtimeState.twPatcher.majorVersion,
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
                  applyLinkedResults(linked)
                  return {
                    result: source,
                  }
                },
              })
            })
          }
        }

        if (Array.isArray(groupedEntries.css)) {
          for (const element of groupedEntries.css) {
            const [file, originalSource] = element

            let rawSource: string | undefined
            const readRawSource = () => {
              rawSource ??= originalSource.source().toString()
              return rawSource
            }
            const chunkHash = assetHashByChunk.get(file)
            const processedCssAssetKnown = isKnownWebpackProcessedCssAsset?.(file) === true
            if (processedCssAssetKnown || isWebpackProcessedCssAsset?.(file, readRawSource())) {
              const hashKey = `${file}:asset`
              const sourceHash = chunkHash === undefined
                ? compilerOptions.cache.computeHash(readRawSource())
                : 'webpack-css-asset:chunk'
              rememberProcessCacheKey(file, hashKey)
              await enqueueTask(async () => {
                await processCachedTask({
                  cache: compilerOptions.cache,
                  cacheKey: file,
                  hashKey,
                  rawSource: chunkHash === undefined ? readRawSource() : undefined,
                  hash: createRuntimeAwareCssHash(
                    chunkHash,
                    sourceHash,
                    `${runtimeSetHash}:${cssSourceTraceSignature}`,
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
                    const currentRawSource = readRawSource()
                    const nextCss = finalizeCssAssetSource(currentRawSource, {
                      generatedCss: hasBundlerGeneratedCssMarker(currentRawSource),
                    })
                    debug('css skip webpack-loader-pipeline asset: %s', file)
                    return {
                      result: new ConcatSource(finalizeTracedCss(nextCss)),
                    }
                  },
                })
              })
              continue
            }
            if (isWebGeneratorTarget) {
              continue
            }
            const currentRawSource = readRawSource()
            const cacheKey = file
            const hashKey = `${file}:asset`
            rememberProcessCacheKey(cacheKey, hashKey)
            const cssSourceHash = (() => {
              const sourceFile = resolveWebpackCssSourceFile(file)
              const sourceCss = sourceFile ? cssSources.get(sourceFile) : undefined
              return sourceCss === undefined
                ? 'webpack-css-source:0'
                : `webpack-css-source:1:${compilerOptions.cache.computeHash(sourceCss)}`
            })()
            const runtimeAwareHash = createRuntimeAwareCssHash(
              chunkHash,
              compilerOptions.cache.computeHash(currentRawSource),
              `${runtimeSetHash}:${webpackSourceCandidates?.signatureHash ?? 'source-candidates:0'}:${webpackSourceCandidateValueSignature}:${cssSourceTraceSignature}:${cssSourceHash}`,
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
                  const cssHandlerOptions = getCssHandlerOptions(file)
                  const generatorRawSource = resolveWebpackGeneratorRawSource(currentRawSource, cssHandlerOptions)
                  if (isPureLocalCssImportWrapper(currentRawSource)) {
                    return {
                      result: new ConcatSource(removeTailwindSourceDirectives(
                        stripBundlerGeneratedCssMarkers(currentRawSource),
                        { importFallback: true },
                      )),
                    }
                  }
                  const generated = await generateCssByGenerator({
                    opts: compilerOptions,
                    runtimeState,
                    runtime: runtimeSet,
                    rawSource: generatorRawSource,
                    file,
                    cssHandlerOptions,
                    cssUserHandlerOptions: getCssUserHandlerOptions(file),
                    getSourceCandidatesForEntries: webpackSourceCandidates?.getSourceCandidatesForEntries,
                    styleHandler: compilerOptions.styleHandler,
                    debug,
                  })
                  const css = finalizeTracedCss(generated?.css ?? finalizeCssAssetSource(
                    (await compilerOptions.styleHandler(generatorRawSource, cssHandlerOptions)).css,
                    { generatedCss: false },
                  ))
                  const source = new ConcatSource(css)

                  if (generated) {
                    debug('css handle via tailwind v%s engine(%s): %s', runtimeState.twPatcher.majorVersion, generated.target, file)
                  }
                  else {
                    debug('css handle: %s', file)
                  }

                  return {
                    result: source,
                  }
                },
              })
            })
          }
        }
        if (!watchMode) {
          pushConcurrentTaskFactories(tasks, taskFactories, taskConcurrency)
          pushConcurrentTaskFactories(tasks, jsTaskFactories, taskConcurrency)
        }

        await Promise.all(tasks)
        compilerOptions.cache.prune?.({
          cacheKeys: activeProcessCacheKeys,
          hashKeys: activeProcessHashKeys,
        })
        const activeCssFiles = new Set(groupedEntries.css?.map(([file]) => file) ?? [])
        pruneWebpackCssHandlerOptionCaches(
          cssHandlerOptionsCache,
          cssUserHandlerOptionsCache,
          activeCssFiles,
        )
        if (activeCssFiles.size > 0) {
          pruneWebpackCssSources?.(activeWebpackCssSourceFiles, { watchMode })
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
  })
}
