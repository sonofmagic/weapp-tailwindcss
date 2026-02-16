import type { OutputAsset, OutputChunk } from 'rollup'
import type { ResolvedConfig } from 'vite'
import type { OutputEntry } from './bundle-entries'
import type { CreateJsHandlerOptions, InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { createUniAppXAssetTask } from '@/uni-app-x'
import { processCachedTask } from '../shared/cache'
import { toAbsoluteOutputPath } from '../shared/module-graph'
import { pushConcurrentTaskFactories } from '../shared/run-tasks'
import { applyLinkedResults, createBundleModuleGraphOptions, isJavaScriptEntry } from './bundle-entries'
import { shouldSkipViteJsTransform } from './js-precheck'

interface GenerateBundleContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
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

type EntryType = 'html' | 'js' | 'css' | 'other'

interface BundleBuildState {
  iteration: number
  previousSourceHashByFile: Map<string, string>
  previousLinkedByEntry: Map<string, Set<string>>
  changedByType: Record<EntryType, Set<string>>
}

interface DirtyEntriesResult {
  sourceHashByFile: Map<string, string>
  changedByType: Record<EntryType, Set<string>>
}

interface ProcessFileSets {
  html: Set<string>
  js: Set<string>
  css: Set<string>
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

function classifyEntry(file: string, opts: InternalUserDefinedOptions): EntryType {
  if (opts.cssMatcher(file)) {
    return 'css'
  }
  if (opts.htmlMatcher(file)) {
    return 'html'
  }
  if (opts.jsMatcher(file) || opts.wxsMatcher(file)) {
    return 'js'
  }
  return 'other'
}

function readEntrySource(output: OutputAsset | OutputChunk) {
  if (output.type === 'chunk') {
    return output.code
  }
  return output.source.toString()
}

function toJsAbsoluteFilename(file: string, outDir: string) {
  return toAbsoluteOutputPath(file, outDir)
}

function computeDirtyEntries(
  entries: [string, OutputAsset | OutputChunk][],
  opts: InternalUserDefinedOptions,
  state: BundleBuildState,
): DirtyEntriesResult {
  const nextSourceHashByFile = new Map<string, string>()
  const changedByType: Record<EntryType, Set<string>> = {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
    other: new Set<string>(),
  }

  for (const [file, output] of entries) {
    const type = classifyEntry(file, opts)
    const source = readEntrySource(output)
    const hash = opts.cache.computeHash(source)
    nextSourceHashByFile.set(file, hash)

    const previousHash = state.previousSourceHashByFile.get(file)
    if (previousHash == null || previousHash !== hash) {
      changedByType[type].add(file)
    }
  }

  return {
    sourceHashByFile: nextSourceHashByFile,
    changedByType,
  }
}

function buildProcessSets(
  entries: [string, OutputAsset | OutputChunk][],
  opts: InternalUserDefinedOptions,
  changedByType: Record<EntryType, Set<string>>,
  previousLinkedByEntry: Map<string, Set<string>>,
  forceAll = false,
) {
  const processFiles: ProcessFileSets = {
    html: new Set<string>(),
    js: new Set<string>(),
    css: new Set<string>(),
  }
  const linkedImpactsByEntry = new Map<string, Set<string>>()

  if (forceAll) {
    for (const [file] of entries) {
      const type = classifyEntry(file, opts)
      if (type === 'html' || type === 'js' || type === 'css') {
        processFiles[type].add(file)
      }
    }
    return {
      files: processFiles,
      linkedImpactsByEntry,
    }
  }

  const firstRun = previousLinkedByEntry.size === 0
  if (firstRun) {
    for (const [file] of entries) {
      const type = classifyEntry(file, opts)
      if (type === 'html' || type === 'js' || type === 'css') {
        processFiles[type].add(file)
      }
    }
    return {
      files: processFiles,
      linkedImpactsByEntry,
    }
  }

  // 在 uni-app + Vite/HBuilderX 的 watch 模式下，即使模板源码未变化，
  // 产物阶段仍可能在每一轮重新输出 html 资产。
  // 因此这里始终让 html 进入缓存回填流程，避免仅 script 变更时 wxml 回退到未转义类名。
  for (const [file] of entries) {
    if (classifyEntry(file, opts) === 'html') {
      processFiles.html.add(file)
    }
  }
  for (const file of changedByType.css) {
    processFiles.css.add(file)
  }
  for (const file of changedByType.js) {
    processFiles.js.add(file)
  }

  for (const changedFile of changedByType.js) {
    for (const [entryFile, linkedFiles] of previousLinkedByEntry.entries()) {
      if (linkedFiles.has(changedFile)) {
        processFiles.js.add(entryFile)
        let impacts = linkedImpactsByEntry.get(entryFile)
        if (!impacts) {
          impacts = new Set<string>()
          linkedImpactsByEntry.set(entryFile, impacts)
        }
        impacts.add(changedFile)
      }
    }
  }

  return {
    files: processFiles,
    linkedImpactsByEntry,
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

function resolveViteStaleClassNameFallback(
  option: InternalUserDefinedOptions['staleClassNameFallback'],
  resolvedConfig?: ResolvedConfig,
) {
  if (typeof option === 'boolean') {
    return option
  }
  if (!resolvedConfig) {
    return false
  }
  if (resolvedConfig.command === 'serve') {
    return true
  }
  if (resolvedConfig.command === 'build' && resolvedConfig.build?.watch) {
    return true
  }
  return false
}

export function createGenerateBundleHook(context: GenerateBundleContext) {
  const state: BundleBuildState = {
    iteration: 0,
    previousSourceHashByFile: new Map<string, string>(),
    previousLinkedByEntry: new Map<string, Set<string>>(),
    changedByType: {
      html: new Set<string>(),
      js: new Set<string>(),
      css: new Set<string>(),
      other: new Set<string>(),
    },
  }

  return async function generateBundle(_opt: unknown, bundle: Record<string, OutputAsset | OutputChunk>) {
    const {
      opts,
      runtimeState,
      ensureRuntimeClassSet,
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

    await runtimeState.patchPromise
    debug('start')
    onStart()

    const metrics = createEmptyMetrics()
    const forceRuntimeRefreshByEnv = process.env.WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH === '1'
    const disableDirtyOptimization = process.env.WEAPP_TW_VITE_DISABLE_DIRTY === '1'
    const disableJsPrecheck = process.env.WEAPP_TW_VITE_DISABLE_JS_PRECHECK === '1'
    const debugCssDiff = process.env.WEAPP_TW_VITE_DEBUG_CSS_DIFF === '1'
    const entries = Object.entries(bundle)
    const dirtyEntries = computeDirtyEntries(entries, opts, state)
    const forceRuntimeRefreshBySource = hasRuntimeAffectingSourceChanges(dirtyEntries.changedByType)
    const forceRuntimeRefresh = forceRuntimeRefreshByEnv || forceRuntimeRefreshBySource
    const processSets = buildProcessSets(entries, opts, dirtyEntries.changedByType, state.previousLinkedByEntry, disableDirtyOptimization)
    const processFiles = processSets.files
    const resolvedConfig = getResolvedConfig()
    const staleClassNameFallback = resolveViteStaleClassNameFallback(opts.staleClassNameFallback, resolvedConfig)
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const outDir = resolvedConfig?.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir
    const jsEntries = new Map<string, OutputEntry>()
    for (const [fileName, output] of entries) {
      const entry: OutputEntry = { fileName, output }
      if (isJavaScriptEntry(entry)) {
        const absolute = toJsAbsoluteFilename(fileName, outDir)
        jsEntries.set(absolute, entry)
      }
    }
    const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
    const runtimeStart = performance.now()
    const runtime = await ensureRuntimeClassSet(forceRuntimeRefresh)
    metrics.runtimeSet = measureElapsed(runtimeStart)
    if (forceRuntimeRefreshBySource) {
      debug(
        'runtimeSet forced refresh due to source changes: html=%d js=%d',
        dirtyEntries.changedByType.html.size,
        dirtyEntries.changedByType.js.size,
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
      staleClassNameFallback: extra?.staleClassNameFallback ?? staleClassNameFallback,
      filename: absoluteFilename,
      moduleGraph: moduleGraphOptions,
      babelParserOptions: {
        ...(extra?.babelParserOptions ?? {}),
        sourceFilename: absoluteFilename,
      },
    })

    const linkedByEntry = new Map<string, Set<string>>()
    const tasks: Promise<void>[] = []
    const jsTaskFactories: Array<() => Promise<void>> = []

    for (const [file, originalSource] of entries) {
      const type = classifyEntry(file, opts)

      if (type === 'html' && originalSource.type === 'asset') {
        metrics.html.total++
        if (!processFiles.html.has(file)) {
          continue
        }
        const rawSource = originalSource.source.toString()
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
              const transformed = await templateHandler(rawSource, {
                runtimeSet: runtime,
              })
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
        const rawSource = originalSource.source.toString()
        tasks.push(
          processCachedTask<string>({
            cache,
            cacheKey: file,
            rawSource,
            hashKey: `${file}:css:${runtimeSignature}:${runtimeState.twPatcher.majorVersion ?? 'unknown'}`,
            applyResult(source) {
              originalSource.source = source
            },
            onCacheHit() {
              metrics.css.cacheHits++
              debug('css cache hit: %s', file)
            },
            async transform() {
              const start = performance.now()
              await runtimeState.patchPromise
              const { css } = await styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(originalSource.fileName, appType),
                postcssOptions: {
                  options: {
                    from: file,
                  },
                },
                majorVersion: runtimeState.twPatcher.majorVersion,
              })
              if (debugCssDiff) {
                debug('css diff %s: %s', file, summarizeStringDiff(rawSource, css))
              }
              metrics.css.elapsed += measureElapsed(start)
              metrics.css.transformed++
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
      if (!processFiles.js.has(file)) {
        continue
      }

      if (originalSource.type === 'chunk') {
        const absoluteFile = toJsAbsoluteFilename(file, outDir)
        const initialRawSource = originalSource.code
        const linkedSet = new Set<string>()
        linkedByEntry.set(file, linkedSet)

        jsTaskFactories.push(async () => {
          const linkedImpactSignature = createLinkedImpactSignature(
            file,
            processSets.linkedImpactsByEntry,
            dirtyEntries.sourceHashByFile,
          )
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
                  if (linkedEntry) {
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
        const linkedSet = new Set<string>()
        linkedByEntry.set(file, linkedSet)

        const baseApplyLinkedUpdates = applyLinkedUpdates
        const wrappedApplyLinkedUpdates = (linked?: Record<string, LinkedJsModuleResult>) => {
          if (linked) {
            for (const id of Object.keys(linked)) {
              const linkedEntry = jsEntries.get(id)
              if (linkedEntry) {
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
              createLinkedImpactSignature(
                file,
                processSets.linkedImpactsByEntry,
                dirtyEntries.sourceHashByFile,
              ),
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
          const currentSource = originalSource.source.toString()
          const absoluteFile = toJsAbsoluteFilename(file, outDir)
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

    state.iteration += 1
    state.previousSourceHashByFile = dirtyEntries.sourceHashByFile
    state.changedByType = dirtyEntries.changedByType

    const nextLinkedByEntry = new Map(state.previousLinkedByEntry)
    for (const [entryFile, linkedFiles] of linkedByEntry.entries()) {
      nextLinkedByEntry.set(entryFile, linkedFiles)
    }
    for (const entryFile of [...nextLinkedByEntry.keys()]) {
      const exists = entries.some(([fileName]) => fileName === entryFile)
      if (!exists) {
        nextLinkedByEntry.delete(entryFile)
      }
    }
    state.previousLinkedByEntry = nextLinkedByEntry

    debug(
      'metrics iteration=%d runtime=%sms html(total=%d transform=%d hit=%d rate=%s elapsed=%sms) js(total=%d transform=%d hit=%d rate=%s elapsed=%sms) css(total=%d transform=%d hit=%d rate=%s elapsed=%sms)',
      state.iteration,
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
