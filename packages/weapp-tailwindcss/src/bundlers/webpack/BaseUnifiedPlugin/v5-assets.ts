import type { Compiler, sources as WebpackSources } from 'webpack'
import type { BundleRuntimeClassSetManager } from '../../vite/incremental-runtime-class-set'
import type { AppType, InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { shouldSkipJsTransform } from '@/js/precheck'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../../shared/cache'
import { finalizeMiniProgramCss, pruneMiniProgramGeneratedCss } from '../../shared/css-cleanup'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap, isCssSourceTraceEnabled } from '../../shared/css-source-trace'
import { hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../../shared/generated-css-marker'
import { generateCssByGenerator } from '../../shared/generator-css'
import { removeTailwindSourceDirectives } from '../../shared/generator-css/directives'
import { emitHmrTiming } from '../../shared/hmr-timing'
import { resolveOutputSpecifier, toAbsoluteOutputPath } from '../../shared/module-graph'
import { pushConcurrentTaskFactories } from '../../shared/run-tasks'
import { buildBundleSnapshot, createBundleBuildState, updateBundleBuildState } from '../../vite/bundle-state'
import { createBundleRuntimeClassSetManager } from '../../vite/incremental-runtime-class-set'
import { createSourceCandidateCollector, createTailwindV3DefaultExtractor } from '../../vite/source-candidates'
import { resolveViteSourceScanEntries } from '../../vite/source-scan'
import { createAssetHashByChunkMap, createRuntimeAwareCssHash, getCacheKey } from './shared'

interface SetupWebpackV5ProcessAssetsHookOptions {
  compiler: Compiler
  options: InternalUserDefinedOptions
  appType?: AppType | undefined
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  getRuntimeRefreshRequirement: () => boolean
  refreshRuntimeMetadata: (force: boolean) => Promise<void>
  isWebpackProcessedCssAsset?: ((file: string, rawSource: string) => boolean) | undefined
  consumeRuntimeRefreshRequirement: () => void
  isWatchMode?: (() => boolean) | undefined
  runtimeClassSetManager?: BundleRuntimeClassSetManager | undefined
  debug: (format: string, ...args: unknown[]) => void
}

function createWebpackSnapshotAssets(assets: Record<string, { source: () => unknown }>) {
  return Object.fromEntries(
    Object.entries(assets).map(([file, asset]) => {
      const source = asset.source()
      return [
        file,
        {
          fileName: file,
          source: typeof source === 'string' ? source : source?.toString() ?? '',
          type: 'asset',
        },
      ]
    }),
  )
}

function stringifyWebpackSource(source: unknown) {
  if (typeof source === 'string') {
    return source
  }
  return source?.toString() ?? ''
}

type WebpackSourceLike = string | WebpackSources.Source

export function setupWebpackV5ProcessAssetsHook(options: SetupWebpackV5ProcessAssetsHookOptions) {
  const {
    compiler,
    options: compilerOptions,
    appType,
    runtimeState,
    getRuntimeRefreshRequirement,
    refreshRuntimeMetadata,
    isWebpackProcessedCssAsset,
    consumeRuntimeRefreshRequirement,
    isWatchMode,
    runtimeClassSetManager,
    debug,
  } = options
  const { Compilation, sources } = compiler.webpack
  const { ConcatSource } = sources
  const generatorOptions = compilerOptions.generator
  const isWebGeneratorTarget = generatorOptions?.target === 'web'
  const cssHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    postcssOptions: {
      options: {
        from: string
      }
    }
    majorVersion?: number | undefined
  }>()
  const cssUserHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    postcssOptions: {
      options: {
        from: string
      }
    }
    majorVersion?: number | undefined
  }>()
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
        const getCurrentAssetSource = (file: string) => {
          const asset = compilation.getAsset(file)
          if (!asset) {
            return undefined
          }
          return stringifyWebpackSource(asset.source.source())
        }
        const updateAssetIfChanged = (
          file: string,
          source: WebpackSourceLike,
          { notifyUpdate = true }: { notifyUpdate?: boolean } = {},
        ) => {
          const nextSource = typeof source === 'string'
            ? source
            : stringifyWebpackSource(source.source())
          const previousSource = getCurrentAssetSource(file)
          if (previousSource === nextSource) {
            debug('asset unchanged, skip update: %s', file)
            return false
          }
          compilation.updateAsset(file, typeof source === 'string' ? new ConcatSource(source) : source)
          if (notifyUpdate) {
            compilerOptions.onUpdate(file, previousSource ?? '', nextSource)
          }
          return true
        }

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
        const getCssHandlerOptions = (file: string) => {
          const majorVersion = runtimeState.twPatcher.majorVersion
          const isMainChunk = compilerOptions.mainCssChunkMatcher(file, appType)
          const cacheKey = `${majorVersion ?? 'unknown'}:${isMainChunk ? '1' : '0'}:${file}`
          const cached = cssHandlerOptionsCache.get(cacheKey)
          if (cached) {
            return cached
          }

          const created = {
            isMainChunk,
            postcssOptions: {
              options: {
                from: file,
              },
            },
            ...(majorVersion === undefined ? {} : { majorVersion }),
          }
          cssHandlerOptionsCache.set(cacheKey, created)
          return created
        }
        const getCssUserHandlerOptions = (file: string) => {
          const majorVersion = runtimeState.twPatcher.majorVersion
          const cacheKey = `${majorVersion ?? 'unknown'}:${file}`
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
        const finalizeCssAssetSource = (source: string, options: { generatedCss?: boolean } = {}) => {
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
            })
          }
          return finalized
        }
        const finalizeMiniProgramUserCssAssetSource = (source: string) => {
          if (isWebGeneratorTarget) {
            return source
          }
          return finalizeMiniProgramCss(source, {
            cssPreflight: runtimeState.twPatcher.majorVersion === 4 ? compilerOptions.cssPreflight : undefined,
            isTailwindcssV4: runtimeState.twPatcher.majorVersion === 4,
            preservePseudoContentInit: runtimeState.twPatcher.majorVersion === 3,
          })
        }
        const cssSourceTraceTokenSources = isCssSourceTraceEnabled(compilerOptions)
          ? await (async () => {
              const root = compilerOptions.tailwindcssBasedir ?? process.cwd()
              const sourceScan = await resolveViteSourceScanEntries(compilerOptions, runtimeState.twPatcher, {
                root,
              })
              const collector = createSourceCandidateCollector({
                bareArbitraryValues: compilerOptions.arbitraryValues?.bareArbitraryValues,
                extractor: runtimeState.twPatcher.majorVersion === 3
                  ? createTailwindV3DefaultExtractor()
                  : undefined,
              })
              await collector.scanRoot({
                entries: sourceScan?.entries,
                explicit: sourceScan?.explicit,
                root,
              })
              collector.syncInline(sourceScan?.inlineCandidates)
              return createCssTokenSourceMap(collector.sourcesForEntries(sourceScan?.entries), compilerOptions)
            })()
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
        const watchMode = isWatchMode?.() === true
        if (watchMode && runtimeState.twPatcher.majorVersion === 4 && !forceRuntimeRefresh) {
          const snapshot = buildBundleSnapshot(createWebpackSnapshotAssets(assets as any) as any, compilerOptions, outputDir, bundleBuildState)
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
        const runtimeSetHash = compilerOptions.cache.computeHash([
          getRuntimeClassSetSignature(runtimeState.twPatcher),
          [...runtimeSet].sort().join('\n'),
        ].join('\n\n'))
        const defaultTemplateHandlerOptions = {
          runtimeSet,
        }
        debug('get runtimeSet, class count: %d', runtimeSet.size)
        const tasks: Promise<void>[] = []
        if (!isWebGeneratorTarget && Array.isArray(groupedEntries.html)) {
          for (const element of groupedEntries.html) {
            const [file, originalSource] = element

            const rawSource = originalSource.source().toString()

            const cacheKey = file
            const chunkHash = assetHashByChunk.get(file)
            tasks.push(
              processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey: `${file}:asset`,
                rawSource,
                hash: chunkHash,
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, { notifyUpdate: !cacheHit })
                },
                onCacheHit() {
                  debug('html cache hit: %s', file)
                },
                transform: async () => {
                  const wxml = await compilerOptions.templateHandler(rawSource, defaultTemplateHandlerOptions)
                  const source = new ConcatSource(wxml)
                  debug('html handle: %s', file)

                  return {
                    result: source,
                  }
                },
              }),
            )
          }
        }

        const jsTaskFactories: Array<() => Promise<void>> = []

        if (!isWebGeneratorTarget && Array.isArray(groupedEntries.js)) {
          for (const [file] of groupedEntries.js) {
            const cacheKey = getCacheKey(file)
            const asset = compilation.getAsset(file)
            if (!asset) {
              continue
            }
            const absoluteFile = toAbsoluteOutputPath(file, outputDir)
            const initialSource = asset.source.source()
            const initialRawSource = typeof initialSource === 'string' ? initialSource : initialSource.toString()
            const chunkHash = assetHashByChunk.get(file)
            jsTaskFactories.push(async () => {
              await processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey: `${file}:asset`,
                rawSource: initialRawSource,
                hash: chunkHash,
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, { notifyUpdate: !cacheHit })
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
                    classNameSet: runtimeSet,
                  })) {
                    return { result: new ConcatSource(currentSource) }
                  }
                  const { code, linked } = await compilerOptions.jsHandler(currentSource, runtimeSet, handlerOptions)
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

            const rawSource = originalSource.source().toString()
            if (isWebpackProcessedCssAsset?.(file, rawSource)) {
              const nextCss = finalizeCssAssetSource(rawSource, {
                generatedCss: hasBundlerGeneratedCssMarker(rawSource),
              })
              tasks.push(
                processCachedTask({
                  cache: compilerOptions.cache,
                  cacheKey: file,
                  hashKey: `${file}:asset`,
                  rawSource,
                  hash: createRuntimeAwareCssHash(
                    assetHashByChunk.get(file),
                    compilerOptions.cache.computeHash(rawSource),
                    `${runtimeSetHash}:${cssSourceTraceSignature}`,
                  ),
                  applyResult(source, { cacheHit }) {
                    updateAssetIfChanged(file, source, { notifyUpdate: !cacheHit })
                  },
                  onCacheHit() {
                    debug('css webpack-loader-pipeline cache hit: %s', file)
                  },
                  transform: async () => {
                    debug('css skip webpack-loader-pipeline asset: %s', file)
                    return {
                      result: new ConcatSource(finalizeTracedCss(nextCss)),
                    }
                  },
                }),
              )
              continue
            }
            const cacheKey = file
            const chunkHash = assetHashByChunk.get(file)
            const runtimeAwareHash = createRuntimeAwareCssHash(
              chunkHash,
              compilerOptions.cache.computeHash(rawSource),
              `${runtimeSetHash}:${cssSourceTraceSignature}`,
            )
            tasks.push(
              processCachedTask({
                cache: compilerOptions.cache,
                cacheKey,
                hashKey: `${file}:asset`,
                rawSource,
                hash: runtimeAwareHash,
                applyResult(source, { cacheHit }) {
                  updateAssetIfChanged(file, source, { notifyUpdate: !cacheHit })
                },
                onCacheHit() {
                  debug('css cache hit: %s', file)
                },
                transform: async () => {
                  await runtimeState.readyPromise
                  const cssHandlerOptions = getCssHandlerOptions(file)
                  const generated = await generateCssByGenerator({
                    opts: compilerOptions,
                    runtimeState,
                    runtime: runtimeSet,
                    rawSource,
                    file,
                    cssHandlerOptions,
                    cssUserHandlerOptions: getCssUserHandlerOptions(file),
                    styleHandler: compilerOptions.styleHandler,
                    debug,
                  })
                  const css = finalizeTracedCss(finalizeCssAssetSource(
                    generated?.css ?? (await compilerOptions.styleHandler(rawSource, cssHandlerOptions)).css,
                    { generatedCss: generated != null },
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
              }),
            )
          }
        }
        pushConcurrentTaskFactories(tasks, jsTaskFactories)

        await Promise.all(tasks)
        debug('end')
        emitHmrTiming('webpack', 'processAssets', performance.now() - hmrTimingStartedAt)
        compilerOptions.onEnd()
      },
    )
  })
}
