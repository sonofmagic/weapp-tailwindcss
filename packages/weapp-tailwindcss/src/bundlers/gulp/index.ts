import type File from 'vinyl'
import type { BundleSnapshot, BundleStateEntry, EntryType } from '../vite/bundle-state'
import type { BundleRuntimeClassSetManager } from '../vite/incremental-runtime-class-set'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, JsModuleGraphOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import stream from 'node:stream'
import { hasTailwindRootDirectives } from '@/bundlers/shared/generator-css/directives'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { shouldSkipJsTransform } from '@/js/precheck'
import { createTailwindRuntimeReadyPromise, ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { processCachedTask } from '../shared/cache'
import { generateCssByGenerator } from '../shared/generator-css'
import { createBundleRuntimeClassSetManager } from '../vite/incremental-runtime-class-set'

const debug = createDebug()

const Transform = stream.Transform

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

  const { templateHandler, styleHandler, jsHandler, cache, twPatcher: initialTwPatcher, refreshTailwindcssPatcher } = opts

  const readyPromise = createTailwindRuntimeReadyPromise(initialTwPatcher)

  let runtimeSet = new Set<string>()
  const runtimeState = {
    twPatcher: initialTwPatcher,
    readyPromise,
    refreshTailwindcssPatcher,
  }
  const defaultStyleHandlerOptionsCache = new Map<number | 'unknown', Partial<IStyleHandlerOptions>>()
  let cachedDefaultTemplateHandlerOptions: Partial<ITemplateHandlerOptions> | undefined
  let cachedDefaultTemplateRuntimeSet: Set<string> | undefined
  let cachedDefaultModuleGraphOptions: JsModuleGraphOptions | undefined

  const MODULE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']
  let runtimeSetInitialized = false
  let runtimeSetDirty = false
  const runtimeSourceHashByFile = new Map<string, string>()
  const runtimeSourcesByFile = new Map<string, { source: string, type: 'html' | 'js' }>()
  const bundleRuntimeClassSetManager: BundleRuntimeClassSetManager
    = (options as UserDefinedOptions & { __internalGulpRuntimeClassSetManager?: BundleRuntimeClassSetManager }).__internalGulpRuntimeClassSetManager
      ?? createBundleRuntimeClassSetManager()

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

  function createRuntimeSnapshot(changedFiles: Iterable<string>): BundleSnapshot {
    const runtimeAffectingChangedByType = {
      html: new Set<string>(),
      js: new Set<string>(),
      css: new Set<string>(),
      other: new Set<string>(),
    } satisfies Record<EntryType, Set<string>>
    for (const file of changedFiles) {
      const entry = runtimeSourcesByFile.get(file)
      if (entry) {
        runtimeAffectingChangedByType[entry.type].add(file)
      }
    }
    const entries = [...runtimeSourcesByFile.entries()].map(([file, entry]) => ({
      file,
      output: {
        fileName: file,
        source: entry.source,
        type: 'asset' as const,
      } as BundleStateEntry['output'],
      source: entry.source,
      type: entry.type,
    }))
    return {
      entries,
      jsEntries: new Map(),
      sourceHashByFile: new Map(),
      runtimeAffectingSignatureByFile: new Map(),
      runtimeAffectingHashByFile: new Map(),
      changedByType: {
        html: new Set<string>(),
        js: new Set<string>(),
        css: new Set<string>(),
        other: new Set<string>(),
      },
      runtimeAffectingChangedByType,
      processFiles: {
        html: new Set<string>(),
        js: new Set<string>(),
        css: new Set<string>(),
      },
      linkedImpactsByEntry: new Map(),
    }
  }

  async function refreshRuntimeSetForSource(file: File, rawSource: string, type: 'html' | 'js') {
    const filename = path.resolve(file.path)
    const hash = cache.computeHash(rawSource)
    const changed = runtimeSourceHashByFile.get(filename) !== hash
    runtimeSourceHashByFile.set(filename, hash)
    runtimeSourcesByFile.set(filename, {
      source: rawSource,
      type,
    })
    if (!changed && runtimeSetInitialized) {
      return runtimeSet
    }
    if (runtimeState.twPatcher.majorVersion === 4 && !runtimeSetDirty) {
      try {
        runtimeSet = await bundleRuntimeClassSetManager.sync(runtimeState.twPatcher, createRuntimeSnapshot([filename]))
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

  function createRuntimeSetHash(rawSource: string, nextRuntimeSet: Set<string>) {
    return cache.computeHash([
      rawSource,
      getRuntimeClassSetSignature(runtimeState.twPatcher),
      [...nextRuntimeSet].sort().join('\n'),
    ].join('\n\n'))
  }

  async function registerAutoCssSource(file: File, rawSource: string) {
    if (
      hasInitialTailwindCssRoots
      || (runtimeState.twPatcher.majorVersion ?? 0) < 4
      || !file.path
      || !hasTailwindRootDirectives(rawSource)
    ) {
      return false
    }
    const changed = upsertTailwindV4CssSource(opts, {
      file: path.resolve(file.path),
      css: rawSource,
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
  function resolveWithExtensions(base: string): string | undefined {
    for (const ext of MODULE_EXTENSIONS) {
      const candidate = `${base}${ext}`
      try {
        if (fs.statSync(candidate).isFile()) {
          return candidate
        }
      }
      catch {
        continue
      }
    }
    return undefined
  }

  function resolveLocalModuleCandidate(base: string): string | undefined {
    try {
      const stat = fs.statSync(base)
      if (stat.isFile()) {
        return base
      }
      if (stat.isDirectory()) {
        const resolvedIndex = resolveWithExtensions(path.join(base, 'index'))
        if (resolvedIndex) {
          return resolvedIndex
        }
      }
    }
    catch {
      // 继续尝试按扩展名补全的逻辑
    }

    if (!path.extname(base)) {
      return resolveWithExtensions(base)
    }
    return undefined
  }

  function createModuleGraphOptionsFor(): JsModuleGraphOptions {
    return {
      resolve(specifier, importer) {
        if (!specifier) {
          return undefined
        }
        if (!specifier.startsWith('.') && !path.isAbsolute(specifier)) {
          return undefined
        }
        const normalized = path.resolve(path.dirname(importer), specifier)
        return resolveLocalModuleCandidate(normalized)
      },
      load(id) {
        try {
          return fs.readFileSync(id, 'utf8')
        }
        catch {
          return undefined
        }
      },
      filter(id) {
        const relative = path.relative(process.cwd(), id)
        return opts.jsMatcher(relative) || opts.wxsMatcher(relative)
      },
    }
  }

  function resolveModuleGraphOptions(moduleGraph?: JsModuleGraphOptions) {
    if (moduleGraph) {
      return moduleGraph
    }

    if (!cachedDefaultModuleGraphOptions) {
      cachedDefaultModuleGraphOptions = createModuleGraphOptionsFor()
    }

    return cachedDefaultModuleGraphOptions
  }

  function createVinylTransform(handler: (file: File) => Promise<void>) {
    return new Transform({
      objectMode: true,
      async transform(file: File, _encoding, callback) {
        try {
          await handler(file)
          callback(null, file)
        }
        catch (error) {
          callback(error as Error, file)
        }
      },
    })
  }

  function resolveWxssHandlerOptions(options?: Partial<IStyleHandlerOptions>) {
    const majorVersion = runtimeState.twPatcher.majorVersion ?? 'unknown'
    if (!options || Object.keys(options).length === 0) {
      let cached = defaultStyleHandlerOptionsCache.get(majorVersion)
      if (!cached) {
        cached = runtimeState.twPatcher.majorVersion === undefined
          ? {}
          : {
              majorVersion: runtimeState.twPatcher.majorVersion,
            }
        defaultStyleHandlerOptionsCache.set(majorVersion, cached)
      }
      return cached
    }

    return runtimeState.twPatcher.majorVersion === undefined
      ? {
          ...options,
        }
      : {
          majorVersion: runtimeState.twPatcher.majorVersion,
          ...options,
        }
  }

  function resolveGulpMatcherName(file: File) {
    const relative = file.relative || path.basename(file.path)
    return relative.replaceAll(path.sep, '/')
  }

  function resolveWxssFileHandlerOptions(file: File, options?: Partial<IStyleHandlerOptions>) {
    const resolved = resolveWxssHandlerOptions(options)
    if (resolved.isMainChunk !== undefined) {
      return resolved
    }
    return {
      ...resolved,
      isMainChunk: opts.mainCssChunkMatcher(resolveGulpMatcherName(file), opts.appType),
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

  const transformWxss = (options: Partial<IStyleHandlerOptions> = {}) =>
    createVinylTransform(async (file) => {
      if (!file.contents) {
        return
      }
      const rawSource = file.contents.toString()
      const cssSourceChanged = await registerAutoCssSource(file, rawSource)
      const nextRuntimeSet = await refreshRuntimeSet({
        forceRefresh: cssSourceChanged,
        forceCollect: cssSourceChanged || opts.mainCssChunkMatcher(resolveGulpMatcherName(file), opts.appType),
        clearCache: cssSourceChanged,
      })
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        hash: createRuntimeSetHash(rawSource, nextRuntimeSet),
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('css cache hit: %s', file.path)
        },
        async transform() {
          await runtimeState.readyPromise
          const cssHandlerOptions = resolveWxssFileHandlerOptions(file, options)
          const generated = await generateCssByGenerator({
            opts,
            runtimeState,
            runtime: nextRuntimeSet,
            rawSource,
            file: file.path,
            cssHandlerOptions,
            cssUserHandlerOptions: resolveWxssUserHandlerOptions(options),
            styleHandler,
            debug,
          })
          const css = generated?.css ?? (await styleHandler(rawSource, cssHandlerOptions)).css
          debug('css handle: %s', file.path)
          return {
            result: css,
          }
        },
      })
    })

  const transformJs = (options: Partial<CreateJsHandlerOptions> = {}) =>
    createVinylTransform(async (file) => {
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
        filename,
        moduleGraph,
        babelParserOptions: {
          ...(options?.babelParserOptions ?? {}),
          sourceFilename: filename,
        },
      }
      if (runtimeState.twPatcher.majorVersion !== undefined) {
        handlerOptions.tailwindcssMajorVersion = runtimeState.twPatcher.majorVersion
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
    })

  const transformWxml = (options: Partial<ITemplateHandlerOptions> = {}) =>
    createVinylTransform(async (file) => {
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
    })

  return {
    transformWxss,
    transformWxml,
    transformJs,
  }
}
