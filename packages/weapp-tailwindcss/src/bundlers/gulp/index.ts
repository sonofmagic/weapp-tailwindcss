import type File from 'vinyl'
import type { BundleRuntimeClassSetManager } from '../vite/incremental-runtime-class-set'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, JsModuleGraphOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { prependConfigDirective } from '@/bundlers/shared/generator-css/config-directive'
import { hasTailwindRootDirectives, normalizeTailwindConfigDirectives, normalizeTailwindSourceForGenerator } from '@/bundlers/shared/generator-css/directives'
import { getCompilerContext } from '@/context'
import { normalizeStyleHandlerMajorVersion } from '@/context/style-options'
import { createDebug } from '@/debug'
import { shouldSkipJsTransform } from '@/js/precheck'
import { createTailwindRuntimeReadyPromise, ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { getTailwindV4IncrementalGenerateCacheStats } from '@/tailwindcss/v4-engine'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { processCachedTask } from '../shared/cache'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap } from '../shared/css-source-trace'
import { generateCssByGenerator } from '../shared/generator-css'
import { rewriteLocalCssImportRequestsForOutput, splitLocalCssImports } from '../shared/generator-css/local-imports'
import { createBundleRuntimeClassSetManager } from '../vite/incremental-runtime-class-set'
import { createSourceCandidateCollector } from '../vite/source-candidates'
import { resolveViteSourceScanEntries } from '../vite/source-scan'
import { createGulpModuleGraphOptions } from './module-graph'
import { createGulpRuntimeSnapshot } from './runtime-snapshot'
import { createVinylTransform } from './vinyl-transform'

const debug = createDebug()
const GULP_RUNTIME_SOURCE_CACHE_MAX = 256
const GULP_PROCESS_CACHE_MAX = 512

function toMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024)
}

function touchMapEntry<Key, Value>(map: Map<Key, Value>, key: Key, value: Value) {
  map.delete(key)
  map.set(key, value)
}

function pruneGulpRuntimeSourceCaches(
  sourceHashByFile: Map<string, string>,
  sourcesByFile: Map<string, { source: string, type: 'html' | 'js' }>,
) {
  while (sourcesByFile.size > GULP_RUNTIME_SOURCE_CACHE_MAX) {
    const oldestKey = sourcesByFile.keys().next().value
    if (typeof oldestKey !== 'string') {
      break
    }
    sourcesByFile.delete(oldestKey)
    sourceHashByFile.delete(oldestKey)
  }
}

function rememberGulpProcessCacheKey(cacheKeys: Set<string>, key: string) {
  cacheKeys.delete(key)
  cacheKeys.add(key)
  while (cacheKeys.size > GULP_PROCESS_CACHE_MAX) {
    const oldestKey = cacheKeys.keys().next().value
    if (typeof oldestKey !== 'string') {
      break
    }
    cacheKeys.delete(oldestKey)
  }
}

function pruneGulpProcessCache(cache: ReturnType<typeof getCompilerContext>['cache'], cacheKeys: Set<string>) {
  cache.prune?.({
    cacheKeys,
    hashKeys: cacheKeys,
  })
}

function resolveGulpMemoryDebugStats(context: {
  cache: ReturnType<typeof getCompilerContext>['cache']
  defaultStyleHandlerOptionsCache: Map<number | 'unknown', Partial<IStyleHandlerOptions>>
  gulpProcessCacheKeys: Set<string>
  phase: string
  runtimeSet: Set<string>
  runtimeSourceHashByFile: Map<string, string>
  runtimeSourcesByFile: Map<string, { source: string, type: 'html' | 'js' }>
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
    runtime: {
      runtimeSet: context.runtimeSet.size,
      runtimeSourceHashByFile: context.runtimeSourceHashByFile.size,
      runtimeSourcesByFile: context.runtimeSourcesByFile.size,
      maxRuntimeSources: GULP_RUNTIME_SOURCE_CACHE_MAX,
    },
    processCache: {
      instance: context.cache.instance.size,
      hashMap: context.cache.hashMap.size,
      activeCacheKeys: context.gulpProcessCacheKeys.size,
      maxCacheKeys: GULP_PROCESS_CACHE_MAX,
    },
    gulpOptions: {
      defaultStyleHandlerOptions: context.defaultStyleHandlerOptionsCache.size,
    },
    tailwind: {
      v4: getTailwindV4IncrementalGenerateCacheStats(),
    },
  }
}

/**
 * @name weapp-tw-gulp
 * @description gulp版本weapp-tw插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/native
 */
export function createPlugins(options: UserDefinedOptions = {}) {
  const hasInitialTailwindCssRoots = hasConfiguredTailwindV4CssRoots(options)
  const opts = getCompilerContext({
    ...options,
    __internalDeferMissingCssEntriesWarning: true,
  } as UserDefinedOptions)

  const { templateHandler, styleHandler, jsHandler, cache } = opts
  const initialTailwindRuntime = opts.tailwindRuntime
  const refreshTailwindcssRuntime = opts.refreshTailwindcssRuntime

  const readyPromise = createTailwindRuntimeReadyPromise(initialTailwindRuntime)

  let runtimeSet = new Set<string>()
  const runtimeState = {
    tailwindRuntime: initialTailwindRuntime,
    readyPromise,
    refreshTailwindcssRuntime,
  }
  const defaultStyleHandlerOptionsCache = new Map<number | 'unknown', Partial<IStyleHandlerOptions>>()
  let cachedDefaultTemplateHandlerOptions: Partial<ITemplateHandlerOptions> | undefined
  let cachedDefaultTemplateRuntimeSet: Set<string> | undefined
  let cachedDefaultModuleGraphOptions: JsModuleGraphOptions | undefined
  let cachedGulpSourceCandidateGetter: ((entries: Parameters<ReturnType<typeof createSourceCandidateCollector>['valuesForEntries']>[0]) => Set<string>) | undefined
  let cachedGulpSourceCandidateSourceGetter: ((entries: Parameters<ReturnType<typeof createSourceCandidateCollector>['sourcesForEntries']>[0]) => Map<string, Set<string>>) | undefined

  let runtimeSetInitialized = false
  let runtimeSetDirty = false
  const runtimeSourceHashByFile = new Map<string, string>()
  const runtimeSourcesByFile = new Map<string, { source: string, type: 'html' | 'js' }>()
  let cachedGulpSourceCandidateSignature: string | undefined
  const gulpProcessCacheKeys = new Set<string>()
  const bundleRuntimeClassSetManager: BundleRuntimeClassSetManager
    = (options as UserDefinedOptions & { __internalGulpRuntimeClassSetManager?: BundleRuntimeClassSetManager }).__internalGulpRuntimeClassSetManager
      ?? createBundleRuntimeClassSetManager()

  function invalidateGulpSourceCandidates() {
    cachedGulpSourceCandidateSignature = undefined
    cachedGulpSourceCandidateGetter = undefined
    cachedGulpSourceCandidateSourceGetter = undefined
  }

  async function refreshRuntimeSet(options: boolean | {
    forceRefresh?: boolean
    forceCollect?: boolean
    clearCache?: boolean
  } = false) {
    const normalizedOptions = typeof options === 'boolean'
      ? {
          forceRefresh: options,
          forceCollect: options,
          clearCache: options,
        }
      : options
    const forceRefresh = normalizedOptions.forceRefresh === true
    const shouldForceCollect = normalizedOptions.forceCollect === true || runtimeSetDirty
    const clearCache = normalizedOptions.clearCache === true || runtimeSetDirty
    if (!forceRefresh && !shouldForceCollect && runtimeSetInitialized) {
      return runtimeSet
    }
    runtimeSet = await ensureRuntimeClassSet(runtimeState, {
      forceRefresh,
      forceCollect: shouldForceCollect,
      clearCache,
      allowEmpty: false,
    })
    runtimeSetInitialized = true
    runtimeSetDirty = false
    return runtimeSet
  }

  async function refreshRuntimeSetForSource(file: File, rawSource: string, type: 'html' | 'js') {
    const filename = path.resolve(file.path)
    const hash = cache.computeHash(rawSource)
    const changed = runtimeSourceHashByFile.get(filename) !== hash
    runtimeSourceHashByFile.delete(filename)
    runtimeSourceHashByFile.set(filename, hash)
    touchMapEntry(runtimeSourcesByFile, filename, {
      source: rawSource,
      type,
    })
    pruneGulpRuntimeSourceCaches(runtimeSourceHashByFile, runtimeSourcesByFile)
    if (changed) {
      invalidateGulpSourceCandidates()
    }
    if (!changed && runtimeSetInitialized) {
      return runtimeSet
    }
    if (!runtimeSetDirty) {
      try {
        runtimeSet = await bundleRuntimeClassSetManager.sync(runtimeState.tailwindRuntime, createGulpRuntimeSnapshot(runtimeSourcesByFile, [filename]))
        runtimeSetInitialized = true
        return runtimeSet
      }
      catch (error) {
        debug('gulp incremental runtime set sync failed, fallback to collect: %O', error)
        await bundleRuntimeClassSetManager.reset()
      }
    }
    return refreshRuntimeSet({
      forceCollect: true,
    })
  }

  async function refreshGulpV4SourceCandidates(forceRefresh = false) {
    const root = opts.tailwindcssBasedir ?? process.cwd()
    const sourceScan = await resolveViteSourceScanEntries(opts, runtimeState.tailwindRuntime, {
      root,
    })
    const nextSignature = cache.computeHash(JSON.stringify({
      root,
      entries: sourceScan?.entries,
      inlineCandidates: sourceScan?.inlineCandidates
        ? {
            included: [...sourceScan.inlineCandidates.included].sort(),
            excluded: [...sourceScan.inlineCandidates.excluded].sort(),
          }
        : undefined,
      explicit: sourceScan?.explicit ?? false,
      dependencies: [...(sourceScan?.dependencies ?? [])].sort(),
    }))
    if (!forceRefresh && cachedGulpSourceCandidateSignature === nextSignature && cachedGulpSourceCandidateGetter) {
      return cachedGulpSourceCandidateGetter
    }
    const collector = createSourceCandidateCollector({
      bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
    })
    await collector.scanRoot({
      entries: sourceScan?.entries,
      explicit: sourceScan?.explicit,
      root,
    })
    collector.syncInline(sourceScan?.inlineCandidates)
    cachedGulpSourceCandidateSignature = nextSignature
    cachedGulpSourceCandidateGetter = entries => collector.valuesForEntries(entries)
    cachedGulpSourceCandidateSourceGetter = entries => collector.sourcesForEntries(entries)
    return cachedGulpSourceCandidateGetter
  }

  function createRuntimeSetHash(rawSource: string, nextRuntimeSet: Set<string>, sourceTraceSignature?: string, sourceCandidateSignature?: string, outputSignature?: string) {
    return cache.computeHash([
      rawSource,
      getRuntimeClassSetSignature(runtimeState.tailwindRuntime),
      [...nextRuntimeSet].sort().join('\n'),
      sourceTraceSignature ?? 'css-source-trace:0',
      sourceCandidateSignature ?? 'gulp-source-candidates:0',
      outputSignature ?? 'gulp-output:0',
    ].join('\n\n'))
  }

  async function registerAutoCssSource(file: File, rawSource: string) {
    if (
      hasInitialTailwindCssRoots
      || (runtimeState.tailwindRuntime.majorVersion ?? 0) < 4
      || !file.path
      || !hasTailwindRootDirectives(rawSource)
    ) {
      return false
    }
    const sourceFile = path.resolve(file.path)
    const sourceCss = normalizeTailwindSourceForGenerator(
      normalizeTailwindConfigDirectives(rawSource, path.dirname(sourceFile)),
      { importFallback: true },
    )
    const config = runtimeState.tailwindRuntime.options?.tailwindcss?.config
    const generatorSourceCss = prependConfigDirective(splitLocalCssImports(sourceCss)?.source ?? sourceCss, config)
    const changed = upsertTailwindV4CssSource(opts, {
      file: sourceFile,
      base: path.dirname(sourceFile),
      css: generatorSourceCss,
    })
    if (!changed) {
      return false
    }
    runtimeSetInitialized = false
    runtimeSetDirty = true
    await bundleRuntimeClassSetManager.reset()
    debug('detected tailwindcss v4 css source from gulp css file: %s', file.path)
    return true
  }
  function resolveModuleGraphOptions(moduleGraph?: JsModuleGraphOptions) {
    if (moduleGraph) {
      return moduleGraph
    }

    if (!cachedDefaultModuleGraphOptions) {
      cachedDefaultModuleGraphOptions = createGulpModuleGraphOptions(opts)
    }

    return cachedDefaultModuleGraphOptions
  }

  function resolveWxssHandlerOptions(options?: Partial<IStyleHandlerOptions>) {
    const styleHandlerMajorVersion = normalizeStyleHandlerMajorVersion(runtimeState.tailwindRuntime.majorVersion)
    const majorVersion = styleHandlerMajorVersion ?? 'unknown'
    if (!options || Object.keys(options).length === 0) {
      let cached = defaultStyleHandlerOptionsCache.get(majorVersion)
      if (!cached) {
        cached = styleHandlerMajorVersion === undefined
          ? {}
          : {
              majorVersion: styleHandlerMajorVersion,
            }
        defaultStyleHandlerOptionsCache.set(majorVersion, cached)
      }
      return cached
    }

    return styleHandlerMajorVersion === undefined
      ? {
          ...options,
        }
      : {
          majorVersion: styleHandlerMajorVersion,
          ...options,
        }
  }

  function resolveGulpStyleOutputExtension(file: File) {
    return typeof opts.cssMatcher === 'function' && opts.cssMatcher(path.basename(file.path))
      ? path.extname(file.path)
      : undefined
  }

  function resolveGulpMatcherName(file: File) {
    const relative = file.relative || path.basename(file.path)
    return relative.replaceAll(path.sep, '/')
  }

  function resolveWxssFileHandlerOptions(file: File, rawSource: string, options?: Partial<IStyleHandlerOptions>) {
    const resolved = resolveWxssHandlerOptions(options)
    const sourceFile = file.path ? path.resolve(file.path) : undefined
    const sourceOptions = sourceFile
      ? {
          outputRoot: path.resolve(file.cwd ?? process.cwd()),
          sourceCss: rawSource,
          sourceFile,
        }
      : undefined
    if (resolved.isMainChunk !== undefined) {
      return {
        ...resolved,
        postcssOptions: {
          ...resolved.postcssOptions,
          options: {
            ...resolved.postcssOptions?.options,
            ...(sourceFile ? { from: sourceFile } : {}),
          },
        },
        ...(sourceOptions ? { sourceOptions } : {}),
      }
    }
    return {
      ...resolved,
      isMainChunk: opts.mainCssChunkMatcher(resolveGulpMatcherName(file), opts.appType),
      postcssOptions: {
        ...resolved.postcssOptions,
        options: {
          ...resolved.postcssOptions?.options,
          ...(sourceFile ? { from: sourceFile } : {}),
        },
      },
      ...(sourceOptions ? { sourceOptions } : {}),
    }
  }

  function resolveWxssUserHandlerOptions(options?: Partial<IStyleHandlerOptions>) {
    return {
      ...resolveWxssHandlerOptions(options),
      isMainChunk: false,
    }
  }

  function resolveWxmlHandlerOptions(options?: Partial<ITemplateHandlerOptions>) {
    if (!options || Object.keys(options).length === 0) {
      if (cachedDefaultTemplateRuntimeSet !== runtimeSet || !cachedDefaultTemplateHandlerOptions) {
        cachedDefaultTemplateRuntimeSet = runtimeSet
        cachedDefaultTemplateHandlerOptions = {
          runtimeSet,
        }
      }
      return cachedDefaultTemplateHandlerOptions
    }

    return {
      runtimeSet,
      ...options,
    }
  }

  function resolveGulpTransformTimingDetails(phase: string) {
    return {
      memoryDebug: resolveGulpMemoryDebugStats({
        cache,
        defaultStyleHandlerOptionsCache,
        gulpProcessCacheKeys,
        phase,
        runtimeSet,
        runtimeSourceHashByFile,
        runtimeSourcesByFile,
      }),
    }
  }

  const transformWxss = (options: Partial<IStyleHandlerOptions> = {}) =>
    createVinylTransform('css', async (file) => {
      if (!file.contents) {
        return
      }
      const rawSource = file.contents.toString()
      const cssSourceChanged = await registerAutoCssSource(file, rawSource)
      const shouldUseGenerator = runtimeState.tailwindRuntime.majorVersion === 4
      let gulpSourceCandidateGetter: typeof cachedGulpSourceCandidateGetter
      if (shouldUseGenerator) {
        gulpSourceCandidateGetter = await refreshGulpV4SourceCandidates(cssSourceChanged)
      }
      const nextRuntimeSet = await refreshRuntimeSet({
        forceRefresh: cssSourceChanged,
        forceCollect: cssSourceChanged,
        clearCache: cssSourceChanged,
      })
      const sourceTraceTokenSources = cachedGulpSourceCandidateSourceGetter
        ? createCssTokenSourceMap(cachedGulpSourceCandidateSourceGetter(undefined), opts)
        : undefined
      const sourceTraceSignature = createCssSourceTraceCacheSignature(sourceTraceTokenSources, opts)
      const sourceCandidateSignature = cachedGulpSourceCandidateGetter
        ? `gulp-source-candidates:1:${[...cachedGulpSourceCandidateGetter(undefined)].sort().join('\n')}`
        : undefined
      const styleOutputExtension = resolveGulpStyleOutputExtension(file)
      const outputSignature = styleOutputExtension
        ? `gulp-output:1:${styleOutputExtension}`
        : 'gulp-output:0'
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        hash: createRuntimeSetHash(rawSource, nextRuntimeSet, sourceTraceSignature, sourceCandidateSignature, outputSignature),
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('css cache hit: %s', file.path)
        },
        async transform() {
          await runtimeState.readyPromise
          const cssHandlerOptions = resolveWxssFileHandlerOptions(file, rawSource, options)
          const generated = shouldUseGenerator
            ? await generateCssByGenerator({
                opts,
                runtimeState,
                runtime: nextRuntimeSet,
                rawSource,
                file: file.path,
                cssHandlerOptions,
                cssUserHandlerOptions: resolveWxssUserHandlerOptions(options),
                getSourceCandidatesForEntries: gulpSourceCandidateGetter,
                styleHandler,
                debug,
              })
            : undefined
          const css = annotateCssSourceTrace(generated?.css ?? (await styleHandler(rawSource, cssHandlerOptions)).css, {
            opts,
            tokenSources: sourceTraceTokenSources,
          })
          const outputCss = rewriteLocalCssImportRequestsForOutput(css, {
            styleOutputExtension,
          })
          debug('css handle: %s', file.path)
          return {
            result: outputCss,
          }
        },
      })
      rememberGulpProcessCacheKey(gulpProcessCacheKeys, file.path)
      pruneGulpProcessCache(cache, gulpProcessCacheKeys)
    }, () => resolveGulpTransformTimingDetails('css'))

  const transformJs = (options: Partial<CreateJsHandlerOptions> = {}) =>
    createVinylTransform('js', async (file) => {
      if (!file.contents) {
        return
      }
      const filename = path.resolve(file.path)
      const rawSource = file.contents.toString()
      await refreshRuntimeSetForSource(file, rawSource, 'js')
      await runtimeState.readyPromise
      const moduleGraph = resolveModuleGraphOptions(options.moduleGraph)
      const handlerOptions: CreateJsHandlerOptions = {
        ...options,
        generateMap: false,
        filename,
        moduleGraph,
        babelParserOptions: {
          ...(options?.babelParserOptions ?? {}),
          sourceFilename: filename,
        },
      }
      if (runtimeState.tailwindRuntime.majorVersion !== undefined) {
        handlerOptions.tailwindcssMajorVersion = runtimeState.tailwindRuntime.majorVersion
      }
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        rawSource,
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('js cache hit: %s', file.path)
        },
        async transform() {
          await runtimeState.readyPromise
          const currentSource = file.contents?.toString() ?? rawSource
          if (shouldSkipJsTransform(currentSource, {
            ...handlerOptions,
            classNameSet: runtimeSet,
          } as CreateJsHandlerOptions)) {
            return { result: currentSource }
          }
          const { code } = await jsHandler(currentSource, runtimeSet, handlerOptions)
          debug('js handle: %s', file.path)
          return {
            result: code,
          }
        },
      })
      rememberGulpProcessCacheKey(gulpProcessCacheKeys, file.path)
      pruneGulpProcessCache(cache, gulpProcessCacheKeys)
    }, () => resolveGulpTransformTimingDetails('js'))

  const transformWxml = (options: Partial<ITemplateHandlerOptions> = {}) =>
    createVinylTransform('html', async (file) => {
      if (!file.contents) {
        return
      }
      const rawSource = file.contents.toString()
      await refreshRuntimeSetForSource(file, rawSource, 'html')
      await runtimeState.readyPromise
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        rawSource,
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('html cache hit: %s', file.path)
        },
        async transform() {
          await runtimeState.readyPromise
          const code = await templateHandler(rawSource, resolveWxmlHandlerOptions(options))
          debug('html handle: %s', file.path)
          return {
            result: code,
          }
        },
      })
      rememberGulpProcessCacheKey(gulpProcessCacheKeys, file.path)
      pruneGulpProcessCache(cache, gulpProcessCacheKeys)
    }, () => resolveGulpTransformTimingDetails('html'))

  return {
    transformWxss,
    transformWxml,
    transformJs,
  }
}
