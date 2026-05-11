import type File from 'vinyl'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, JsModuleGraphOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import stream from 'node:stream'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { shouldSkipJsTransform } from '@/js/precheck'
import { createTailwindRuntimeReadyPromise, ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { processCachedTask } from '../shared/cache'
import { generateCssByGenerator } from '../shared/generator-css'

const debug = createDebug()

const Transform = stream.Transform

/**
 * @name weapp-tw-gulp
 * @description gulp版本weapp-tw插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/native
 */
export function createPlugins(options: UserDefinedOptions = {}) {
  const opts = getCompilerContext(options)

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

  async function refreshRuntimeSet(force = false) {
    if (!force && runtimeSetInitialized) {
      return runtimeSet
    }
    runtimeSet = await ensureRuntimeClassSet(runtimeState, {
      forceRefresh: force,
      forceCollect: force,
      clearCache: force,
      allowEmpty: false,
    })
    runtimeSetInitialized = true
    return runtimeSet
  }

  function createRuntimeSetHash(rawSource: string, nextRuntimeSet: Set<string>) {
    return cache.computeHash([
      rawSource,
      getRuntimeClassSetSignature(runtimeState.twPatcher),
      [...nextRuntimeSet].sort().join('\n'),
    ].join('\n\n'))
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
        cached = {
          majorVersion: runtimeState.twPatcher.majorVersion,
        }
        defaultStyleHandlerOptionsCache.set(majorVersion, cached)
      }
      return cached
    }

    return {
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
      const nextRuntimeSet = await refreshRuntimeSet(true)
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
      await refreshRuntimeSet(true)
      await runtimeState.readyPromise
      const filename = path.resolve(file.path)
      const moduleGraph = resolveModuleGraphOptions(options.moduleGraph)
      const handlerOptions: CreateJsHandlerOptions = {
        ...options,
        filename,
        moduleGraph,
        tailwindcssMajorVersion: runtimeState.twPatcher.majorVersion,
        babelParserOptions: {
          ...(options?.babelParserOptions ?? {}),
          sourceFilename: filename,
        },
      }
      const rawSource = file.contents.toString()
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
          if (shouldSkipJsTransform(currentSource, handlerOptions)) {
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
      await refreshRuntimeSet(true)
      await runtimeState.readyPromise
      const rawSource = file.contents.toString()
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
