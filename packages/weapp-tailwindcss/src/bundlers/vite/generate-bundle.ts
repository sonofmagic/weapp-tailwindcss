import type { OutputAsset, OutputChunk } from 'rollup'
import type { ResolvedConfig } from 'vite'
import type { HmrTimingRecorder } from '../shared/hmr-timing'
import type { BundleSnapshot } from './bundle-state'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { filterUnsupportedMiniProgramTailwindV4Candidates } from '@/tailwindcss/v4-engine/candidates'
import { createUniAppXAssetTask } from '@/uni-app-x'
import { processCachedTask } from '../shared/cache'
import { generateCssByGenerator, validateCandidatesByGenerator } from '../shared/generator-css'
import { pushConcurrentTaskFactories } from '../shared/run-tasks'
import { createBundleModuleGraphOptions } from './bundle-entries'
import { buildBundleSnapshot, createBundleBuildState, updateBundleBuildState } from './bundle-state'
import { collectLegacyContainerCompatCandidates, collectUnescapedDynamicCandidates } from './generate-bundle/candidates'
import { createCssHandlerOptionsCache } from './generate-bundle/css-handler-options'
import { createCssRuntimeSignature, createCssTransformShareScopeKey } from './generate-bundle/css-share-scope'
import { hasOmittedKnownBundleFiles } from './generate-bundle/dirty-state'
import { createJsEntryResolver } from './generate-bundle/js-entries'
import { createJsHandlerOptionsFactory, resolveUniAppXJsTransformEnabled } from './generate-bundle/js-handler-options'
import { collectLinkedFileNames, createLinkedUpdateHelpers } from './generate-bundle/js-linking'
import { createEmptyMetrics, formatCacheHitRate, formatMs, measureElapsed } from './generate-bundle/metrics'
import { logBundleProcessPlan } from './generate-bundle/process-plan'
import { createReplayCssAsset, registerGeneratorDependencies } from './generate-bundle/rollup-assets'
import { createCandidateSignature, createJsHashSalt, createLinkedImpactSignature, getSnapshotHash, hasRuntimeAffectingSourceChanges, summarizeStringDiff } from './generate-bundle/signatures'
import { shouldSkipViteJsTransform } from './js-precheck'

interface GenerateBundleContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    readyPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  ensureBundleRuntimeClassSet: (
    snapshot: BundleSnapshot,
    forceRefresh?: boolean,
    options?: {
      allowBaselineOnlyInitialSync?: boolean | undefined
      baseClassSet?: Set<string> | undefined
    },
  ) => Promise<Set<string>>
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
  markCssAssetProcessed?: (asset: OutputAsset, file?: string) => void
  recordCssAssetResult?: (file: string, css: string) => void
  getSourceCandidates?: () => Set<string>
  getSourceCandidatesForEntries?: ((entries: TailwindSourceEntry[] | undefined) => Set<string>) | undefined
  waitForSourceCandidateSyncs?: () => Promise<void>
  rememberMainCssSource?: (file: string, rawSource: string, cssRuntimeSignature: string) => void
  getRememberedMainCssSources?: () => Map<string, string>
  getRememberedMainCssSignature?: (file: string) => string | undefined
  setRememberedMainCssSignature?: (file: string, cssRuntimeSignature: string) => void
  recordGeneratorCandidates?: (candidates: Set<string>) => void
  hmrTimingRecorder?: HmrTimingRecorder
}

interface GenerateBundleThis {
  addWatchFile?: (id: string) => void
  emitFile?: (emittedFile: {
    type: 'asset'
    fileName: string
    source: string
  }) => string
}

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

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const state = createBundleBuildState()
  const lastCssResultByFile = new Map<string, string>()
  let currentOutDir: string | undefined
  const cssHandlerOptions = createCssHandlerOptionsCache({
    getAppType: () => context.opts.appType,
    mainCssChunkMatcher: context.opts.mainCssChunkMatcher,
    getMajorVersion: () => context.runtimeState.twPatcher.majorVersion,
    getOutputRoot: () => currentOutDir,
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
      recordCssAssetResult,
      getSourceCandidates,
      getSourceCandidatesForEntries,
      waitForSourceCandidateSyncs,
      rememberMainCssSource,
      getRememberedMainCssSources,
      getRememberedMainCssSignature,
      setRememberedMainCssSignature,
      recordGeneratorCandidates,
      hmrTimingRecorder,
    } = context
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
    const { getCssHandlerOptions, getCssUserHandlerOptions } = cssHandlerOptions

    await runtimeState.readyPromise
    debug('start')
    onStart()
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
    const resolvedConfig = getResolvedConfig()
    const bundleFiles = Object.keys(bundle)
    const buildCommand = resolvedConfig?.command === 'build'
    const hasPreviousBundleState = state.iteration > 0 || state.sourceHashByFile.size > 0
    // uni-app vite 的 dev 流程可能以 command=build 驱动 generateBundle，
    // 后续轮次可能回传完整 bundle 或脏文件子集；只要同一插件实例已有状态，
    // 就按增量处理，避免候选变化时把未改动的分包 CSS 全量重生成。
    const useIncrementalMode = !buildCommand
      || hasPreviousBundleState
      || hasOmittedKnownBundleFiles(bundleFiles, state.sourceHashByFile.keys())
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const outDir = resolvedConfig?.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir
    currentOutDir = outDir
    const snapshotStart = performance.now()
    const snapshot = buildBundleSnapshot(bundle, opts, outDir, state, disableDirtyOptimization || !useIncrementalMode)
    recordTimingDetail('snapshot', snapshotStart)
    const useBundleRuntimeClassSet = useIncrementalMode || runtimeState.twPatcher.majorVersion === 4
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
    const runtime = useV3OxideSourceRuntime
      ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv, {
          allowBaselineOnlyInitialSync: true,
          baseClassSet: sourceCandidates,
        })
      : useBundleRuntimeClassSet
        ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv, {
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
    let generatorRuntime = collectLegacyContainerCompatCandidates(
      sourceCandidates,
      filteredGeneratorCandidates,
    )
    let transformRuntime = runtime
    if (runtimeState.twPatcher.majorVersion === 3 && generatorRuntime.size > 0) {
      const cssEntries = snapshot.entries.filter(entry =>
        entry.type === 'css' && entry.output.type === 'asset')
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
    const defaultTemplateHandlerOptions = {
      runtimeSet: transformRuntime,
    }
    metrics.runtimeSet = measureElapsed(runtimeStart)
    timingDetails.runtime = metrics.runtimeSet
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

              if (unresolvedDynamicCandidates.length > 0) {
                logger.warn(
                  '检测到 WXML 动态类名未完成转译，已回退到完整 runtimeSet 重试: %s -> %O',
                  file,
                  unresolvedDynamicCandidates,
                )
                const fullRuntimeSet = new Set([
                  ...await context.ensureRuntimeClassSet(true),
                  ...unresolvedDynamicCandidates,
                ])
                transformed = await templateHandler(rawSource, {
                  runtimeSet: fullRuntimeSet,
                })
                unresolvedDynamicCandidates = collectUnescapedDynamicCandidates(transformed)
                if (unresolvedDynamicCandidates.length > 0) {
                  logger.warn(
                    'WXML 动态类名在完整 runtimeSet 重试后仍未完成转译: %s -> %O',
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
        const rawSource = originalEntrySource
        const cssRuntimeAffectingSignature = snapshot.runtimeAffectingSignatureByFile.get(file) ?? rawSource
        const cssShareScope = createCssTransformShareScopeKey(opts, file, rawSource)
        const cssHandlerOptions = getCssHandlerOptions(file)
        const shouldTrackGeneratorRuntime = shouldProcessTailwindGeneration
          && (
            !useIncrementalMode
            || cssHandlerOptions.isMainChunk
            || processFiles.css.has(file)
            || runtimeLinkedCssFiles.has(file)
            || (generatorCandidatesChanged && lastCssResultByFile.has(file))
          )
        const scopedGeneratorCandidateSignature = shouldTrackGeneratorRuntime
          ? generatorCandidateSignature
          : 'generator:stable'
        const cssRuntimeSignature = createCssRuntimeSignature(runtimeSignature, scopedGeneratorCandidateSignature)
        const cssSharedCacheKey = `${cssShareScope}:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}:${cssHandlerOptions.isMainChunk ? '1' : '0'}:${cssRuntimeAffectingSignature}`
        if (!shouldTrackGeneratorRuntime) {
          const lastCss = lastCssResultByFile.get(file)
          if (lastCss != null) {
            originalSource.source = lastCss
            markCssAssetProcessed?.(originalSource, file)
            metrics.css.cacheHits++
            debug('css replay last result: %s', file)
            continue
          }
        }
        tasks.push(timeTask('css', () =>
          processCachedTask<string>({
            cache,
            cacheKey: file,
            hashKey: `${file}:css:${cssRuntimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}`,
            hash: `${getSnapshotHash(snapshot.runtimeAffectingHashByFile, file, cssRuntimeAffectingSignature)}:${scopedGeneratorCandidateSignature}`,
            applyResult(source) {
              originalSource.source = source
              lastCssResultByFile.set(file, source)
              markCssAssetProcessed?.(originalSource, file)
              if (cssHandlerOptions.isMainChunk) {
                rememberMainCssSource?.(file, rawSource, cssRuntimeSignature)
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
                const generated = await generateCssByGenerator({
                  opts,
                  runtimeState,
                  runtime: generatorRuntime,
                  rawSource,
                  file,
                  cssHandlerOptions,
                  cssUserHandlerOptions: getCssUserHandlerOptions(file),
                  getSourceCandidatesForEntries,
                  styleHandler,
                  debug,
                })
                if (generated) {
                  registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
                  if (debugCssDiff) {
                    debug('css diff %s: %s', file, summarizeStringDiff(rawSource, generated.css))
                  }
                  debug('css generated result: %s bytes=%d', file, generated.css.length)
                  recordCssAssetResult?.(file, generated.css)
                  metrics.css.elapsed += measureElapsed(start)
                  metrics.css.transformed++
                  debug('css handle via tailwind v%s engine(%s): %s', runtimeState.twPatcher.majorVersion, generated.target, file)
                  return generated.css
                }
                const { css } = await styleHandler(rawSource, getCssHandlerOptions(file))
                if (debugCssDiff) {
                  debug('css diff %s: %s', file, summarizeStringDiff(rawSource, css))
                }
                metrics.css.elapsed += measureElapsed(start)
                metrics.css.transformed++
                return css
              }

              const cssTask = cssSharedCacheKey
                ? sharedCssResultCache.get(cssSharedCacheKey) ?? runTransform()
                : runTransform()

              if (cssSharedCacheKey && !sharedCssResultCache.has(cssSharedCacheKey)) {
                sharedCssResultCache.set(cssSharedCacheKey, cssTask)
              }

              const css = await cssTask
              onUpdate(file, rawSource, css)
              debug('css handle: %s', file)
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
              useIncrementalMode
                ? createLinkedImpactSignature(
                    file,
                    snapshot.linkedImpactsByEntry,
                    snapshot.sourceHashByFile,
                  )
                : undefined,
            ),
            createHandlerOptions,
            debug,
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

    const cssRuntimeSignature = createCssRuntimeSignature(runtimeSignature, generatorCandidateSignature)
    if (useIncrementalMode) {
      for (const [file, rawSource] of getRememberedMainCssSources?.() ?? []) {
        if (bundleFiles.includes(file) || getRememberedMainCssSignature?.(file) === cssRuntimeSignature) {
          continue
        }
        tasks.push(timeTask('css.replay', async () => {
          const start = performance.now()
          const cssHandlerOptions = getCssHandlerOptions(file)
          const generated = await generateCssByGenerator({
            opts,
            runtimeState,
            runtime: generatorRuntime,
            rawSource,
            file,
            cssHandlerOptions,
            cssUserHandlerOptions: getCssUserHandlerOptions(file),
            getSourceCandidatesForEntries,
            styleHandler,
            debug,
          })
          const css = generated?.css ?? (await styleHandler(rawSource, cssHandlerOptions)).css
          setRememberedMainCssSignature?.(file, cssRuntimeSignature)
          if (generated) {
            registerGeneratorDependencies({ addWatchFile }, generated.dependencies)
            recordCssAssetResult?.(file, generated.css)
            debug('css replay generated result: %s bytes=%d', file, css.length)
          }
          const replayAsset = createReplayCssAsset(file, css)
          if (typeof this.emitFile === 'function') {
            this.emitFile({
              type: 'asset',
              fileName: file,
              source: css,
            })
          }
          else {
            bundle[file] = replayAsset
          }
          markCssAssetProcessed?.(replayAsset, file)
          metrics.css.elapsed += measureElapsed(start)
          metrics.css.transformed++
          onUpdate(file, rawSource, css)
          debug('css replay handle: %s', file)
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
