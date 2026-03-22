import type { OutputAsset, OutputChunk } from 'rollup'
import type { ResolvedConfig } from 'vite'
import type { OutputEntry } from './bundle-entries'
import type { BundleSnapshot, EntryType } from './bundle-state'
import type { CreateJsHandlerOptions, InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { createUniAppXAssetTask } from '@/uni-app-x'
import { processCachedTask } from '../shared/cache'
import { pushConcurrentTaskFactories } from '../shared/run-tasks'
import { applyLinkedResults, createBundleModuleGraphOptions } from './bundle-entries'
import { buildBundleSnapshot, createBundleBuildState, updateBundleBuildState } from './bundle-state'
import { shouldSkipViteJsTransform } from './js-precheck'

interface GenerateBundleContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  ensureBundleRuntimeClassSet: (snapshot: BundleSnapshot, forceRefresh?: boolean) => Promise<Set<string>>
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
}

interface BundleMetric {
  total: number
  transformed: number
  cacheHits: number
  elapsed: number
}

interface BundleMetrics {
  runtimeSet: number
  html: BundleMetric
  js: BundleMetric
  css: BundleMetric
}

function formatDebugFileList(files: Set<string>, limit = 8) {
  if (files.size === 0) {
    return '-'
  }
  const sorted = [...files].sort()
  if (sorted.length <= limit) {
    return sorted.join(',')
  }
  return `${sorted.slice(0, limit).join(',')},...(+${sorted.length - limit})`
}

function createEmptyMetric(): BundleMetric {
  return {
    total: 0,
    transformed: 0,
    cacheHits: 0,
    elapsed: 0,
  }
}

function createEmptyMetrics(): BundleMetrics {
  return {
    runtimeSet: 0,
    html: createEmptyMetric(),
    js: createEmptyMetric(),
    css: createEmptyMetric(),
  }
}

function measureElapsed(start: number) {
  return performance.now() - start
}

function formatCacheHitRate(metric: BundleMetric) {
  if (metric.total === 0) {
    return '0.00%'
  }
  return `${((metric.cacheHits / metric.total) * 100).toFixed(2)}%`
}

function formatMs(value: number) {
  return value.toFixed(2)
}

function summarizeStringDiff(previous: string, next: string) {
  if (previous === next) {
    return 'same'
  }

  const previousLength = previous.length
  const nextLength = next.length
  const minLength = Math.min(previousLength, nextLength)
  let prefixLength = 0
  while (prefixLength < minLength && previous.charCodeAt(prefixLength) === next.charCodeAt(prefixLength)) {
    prefixLength += 1
  }

  let previousSuffixCursor = previousLength - 1
  let nextSuffixCursor = nextLength - 1
  while (
    previousSuffixCursor >= prefixLength
    && nextSuffixCursor >= prefixLength
    && previous.charCodeAt(previousSuffixCursor) === next.charCodeAt(nextSuffixCursor)
  ) {
    previousSuffixCursor -= 1
    nextSuffixCursor -= 1
  }

  const previousChangedLength = previousSuffixCursor >= prefixLength ? previousSuffixCursor - prefixLength + 1 : 0
  const nextChangedLength = nextSuffixCursor >= prefixLength ? nextSuffixCursor - prefixLength + 1 : 0

  return `changed@${prefixLength} old=${previousChangedLength} new=${nextChangedLength} len=${previousLength}->${nextLength}`
}

function createLinkedImpactSignature(
  entry: string,
  linkedImpactsByEntry: Map<string, Set<string>>,
  sourceHashByFile: Map<string, string>,
) {
  const changedLinkedFiles = linkedImpactsByEntry.get(entry)
  if (!changedLinkedFiles || changedLinkedFiles.size === 0) {
    return undefined
  }

  const parts = [...changedLinkedFiles]
    .sort()
    .map((file) => {
      const hash = sourceHashByFile.get(file) ?? 'missing'
      return `${file}:${hash}`
    })

  return parts.join(',')
}

function createJsHashSalt(runtimeSignature: string, linkedImpactSignature?: string) {
  if (!linkedImpactSignature) {
    return runtimeSignature
  }
  return `${runtimeSignature}:linked:${linkedImpactSignature}`
}

function hasRuntimeAffectingSourceChanges(changedByType: Record<EntryType, Set<string>>) {
  return changedByType.html.size > 0 || changedByType.js.size > 0
}

function canShareCssTransformResult(rawSource: string) {
  return !rawSource.includes('@import') && !rawSource.includes('url(')
}

function hasOmittedKnownBundleFiles(
  currentBundleFiles: string[],
  previousBundleFiles: Iterable<string>,
) {
  const currentFileSet = new Set(currentBundleFiles)
  for (const file of previousBundleFiles) {
    if (!currentFileSet.has(file)) {
      return true
    }
  }
  return false
}

const MUSTACHE_EXPRESSION_RE = /\{\{[\s\S]*?\}\}/g
const QUOTED_LITERAL_RE = /'([^']*)'|"([^"]*)"|`([^`]*)`/g

function isArbitraryValueCandidate(candidate: string) {
  return candidate.includes('[') && candidate.includes(']')
}

function collectUnescapedDynamicCandidates(
  source: string,
) {
  const matches = new Set<string>()

  for (const expression of source.match(MUSTACHE_EXPRESSION_RE) ?? []) {
    QUOTED_LITERAL_RE.lastIndex = 0
    let quoted = QUOTED_LITERAL_RE.exec(expression)
    while (quoted !== null) {
      const literal = quoted[1] ?? quoted[2] ?? quoted[3] ?? ''
      for (const candidate of splitCode(literal, true)) {
        const normalized = candidate.trim()
        if (!normalized || !isArbitraryValueCandidate(normalized)) {
          continue
        }
        matches.add(normalized)
      }
      quoted = QUOTED_LITERAL_RE.exec(expression)
    }
  }

  return [...matches]
}

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const state = createBundleBuildState()
  const cssHandlerOptionsCache = new Map<string, {
    isMainChunk: boolean
    postcssOptions: {
      options: {
        from: string
      }
    }
    majorVersion: number | undefined
  }>()

  return async function generateBundle(_opt: unknown, bundle: Record<string, OutputAsset | OutputChunk>) {
    const {
      opts,
      runtimeState,
      ensureBundleRuntimeClassSet,
      debug,
      getResolvedConfig,
    } = context
    const {
      appType,
      cache,
      mainCssChunkMatcher,
      onEnd,
      onStart,
      onUpdate,
      styleHandler,
      templateHandler,
      jsHandler,
      uniAppX,
    } = opts

    // 按文件缓存 CSS handler 的 override 对象，减少 watch/incremental 轮次的重复构造与下游 fingerprint 开销。
    const getCssHandlerOptions = (file: string) => {
      const majorVersion = runtimeState.twPatcher.majorVersion
      const isMainChunk = mainCssChunkMatcher(file, appType)
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
        majorVersion,
      }
      cssHandlerOptionsCache.set(cacheKey, created)
      return created
    }

    await runtimeState.patchPromise
    debug('start')
    onStart()

    const metrics = createEmptyMetrics()
    const forceRuntimeRefreshByEnv = process.env.WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH === '1'
    const disableDirtyOptimization = process.env.WEAPP_TW_VITE_DISABLE_DIRTY === '1'
    const disableJsPrecheck = process.env.WEAPP_TW_VITE_DISABLE_JS_PRECHECK === '1'
    const debugCssDiff = process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF === '1'
    const resolvedConfig = getResolvedConfig()
    const bundleFiles = Object.keys(bundle)
    const buildCommand = resolvedConfig?.command === 'build'
    // uni-app vite 的 dev 流程可能以 command=build 驱动 generateBundle，
    // 但后续轮次只回传脏文件子集；此时需要保留上一轮状态并按增量处理。
    const useIncrementalMode = !buildCommand || hasOmittedKnownBundleFiles(bundleFiles, state.sourceHashByFile.keys())
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const outDir = resolvedConfig?.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir
    const snapshot = buildBundleSnapshot(bundle, opts, outDir, state, disableDirtyOptimization || !useIncrementalMode)
    const useBundleRuntimeClassSet = useIncrementalMode || runtimeState.twPatcher.majorVersion === 4
    const forceRuntimeRefreshBySource = useIncrementalMode
      && hasRuntimeAffectingSourceChanges(snapshot.runtimeAffectingChangedByType)
    const processFiles = snapshot.processFiles
    if (useIncrementalMode) {
      debug(
        'dirty iteration=%d html=%d[%s] js=%d[%s] css=%d[%s] other=%d[%s]',
        state.iteration + 1,
        snapshot.changedByType.html.size,
        formatDebugFileList(snapshot.changedByType.html),
        snapshot.changedByType.js.size,
        formatDebugFileList(snapshot.changedByType.js),
        snapshot.changedByType.css.size,
        formatDebugFileList(snapshot.changedByType.css),
        snapshot.changedByType.other.size,
        formatDebugFileList(snapshot.changedByType.other),
      )
      debug(
        'process iteration=%d html=%d[%s] js=%d[%s] css=%d[%s]',
        state.iteration + 1,
        processFiles.html.size,
        formatDebugFileList(processFiles.html),
        processFiles.js.size,
        formatDebugFileList(processFiles.js),
        processFiles.css.size,
        formatDebugFileList(processFiles.css),
      )
    }
    else {
      debug(
        'build mode full process html=%d[%s] js=%d[%s] css=%d[%s]',
        processFiles.html.size,
        formatDebugFileList(processFiles.html),
        processFiles.js.size,
        formatDebugFileList(processFiles.js),
        processFiles.css.size,
        formatDebugFileList(processFiles.css),
      )
    }
    const jsEntries = snapshot.jsEntries
    const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
    const runtimeStart = performance.now()
    const runtime = useBundleRuntimeClassSet
      ? await ensureBundleRuntimeClassSet(snapshot, forceRuntimeRefreshByEnv)
      : await context.ensureRuntimeClassSet(forceRuntimeRefreshByEnv)
    const defaultTemplateHandlerOptions = {
      runtimeSet: runtime,
    }
    metrics.runtimeSet = measureElapsed(runtimeStart)
    if (forceRuntimeRefreshBySource) {
      debug(
        'runtimeSet forced refresh due to source changes: html=%d js=%d',
        snapshot.runtimeAffectingChangedByType.html.size,
        snapshot.runtimeAffectingChangedByType.js.size,
      )
    }
    debug('get runtimeSet, class count: %d', runtime.size)
    const runtimeSignature = getRuntimeClassSetSignature(runtimeState.twPatcher) ?? 'runtime:missing'

    const handleLinkedUpdate = (fileName: string, previous: string, next: string) => {
      onUpdate(fileName, previous, next)
      debug('js linked handle: %s', fileName)
    }
    const pendingLinkedUpdates: Array<() => void> = []
    const scheduleLinkedApply = (entry: OutputEntry, code: string) => {
      pendingLinkedUpdates.push(() => {
        if (entry.output.type === 'chunk') {
          entry.output.code = code
        }
        else {
          entry.output.source = code
        }
      })
    }
    const applyLinkedUpdates = (linked?: Record<string, LinkedJsModuleResult>) => {
      applyLinkedResults(linked, jsEntries, handleLinkedUpdate, scheduleLinkedApply)
    }
    const createHandlerOptions = (absoluteFilename: string, extra?: CreateJsHandlerOptions): CreateJsHandlerOptions => ({
      ...extra,
      filename: absoluteFilename,
      tailwindcssMajorVersion: runtimeState.twPatcher.majorVersion,
      moduleGraph: moduleGraphOptions,
      babelParserOptions: {
        ...(extra?.babelParserOptions ?? {}),
        sourceFilename: absoluteFilename,
      },
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
        tasks.push(
          processCachedTask<string>({
            cache,
            cacheKey: file,
            rawSource,
            hashKey: `${file}:html:${runtimeSignature}`,
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
                const fullRuntimeSet = await context.ensureRuntimeClassSet(true)
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
          }),
        )
        continue
      }

      if (type === 'css' && originalSource.type === 'asset') {
        metrics.css.total++
        // uni-app dev/watch 会在每轮产物阶段重写 app.wxss。
        // 即便本轮 CSS 原文 hash 未变化，也必须回填缓存中的转译结果，
        // 否则会退回未转译内容并与同轮 JS/WXML 的 class 改写失配。
        const rawSource = originalEntrySource
        const cssRuntimeAffectingSignature = snapshot.runtimeAffectingSignatureByFile.get(file) ?? rawSource
        const shareCssResult = canShareCssTransformResult(rawSource)
        const cssSharedCacheKey = shareCssResult
          ? `${runtimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}:${getCssHandlerOptions(file).isMainChunk ? '1' : '0'}:${cssRuntimeAffectingSignature}`
          : undefined
        tasks.push(
          processCachedTask<string>({
            cache,
            cacheKey: file,
            hashKey: `${file}:css:${runtimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}`,
            rawSource: cssRuntimeAffectingSignature,
            applyResult(source) {
              originalSource.source = source
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
                await runtimeState.patchPromise
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
          }),
        )
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
            rawSource: `${initialRawSource}\n/*${hashSalt}*/`,
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

              const { code, linked } = await jsHandler(rawSource, runtime, handlerOptions)
              metrics.js.elapsed += measureElapsed(start)
              metrics.js.transformed++
              onUpdate(file, rawSource, code)
              debug('js handle: %s', file)
              if (linked) {
                for (const id of Object.keys(linked)) {
                  const linkedEntry = jsEntries.get(id)
                  if (linkedEntry && linkedSet) {
                    linkedSet.add(linkedEntry.fileName)
                  }
                }
              }
              applyLinkedUpdates(linked)
              return {
                result: code,
              }
            },
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
          if (linked) {
            for (const id of Object.keys(linked)) {
              const linkedEntry = jsEntries.get(id)
              if (linkedEntry && linkedSet) {
                linkedSet.add(linkedEntry.fileName)
              }
            }
          }
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
            runtimeSet: runtime,
            applyLinkedResults: wrappedApplyLinkedUpdates,
            uniAppX,
          },
        )

        jsTaskFactories.push(async () => {
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
            uniAppX: uniAppX ?? true,
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
      }
    }

    pushConcurrentTaskFactories(tasks, jsTaskFactories)

    await Promise.all(tasks)
    for (const apply of pendingLinkedUpdates) {
      apply()
    }

    updateBundleBuildState(
      state,
      snapshot,
      useIncrementalMode ? (linkedByEntry ?? new Map<string, Set<string>>()) : new Map<string, Set<string>>(),
      { incremental: useIncrementalMode },
    )

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

    onEnd()
    debug('end')
  }
}
