import type File from 'vinyl'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, JsModuleGraphOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import stream from 'node:stream'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { collectRuntimeClassSet } from '@/tailwindcss/runtime'
import { processCachedTask } from '../shared/cache'

const debug = createDebug()

const Transform = stream.Transform

/**
 * @name weapp-tw-gulp
 * @description gulp版本weapp-tw插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/native
 */
export function createPlugins(options: UserDefinedOptions = {}) {
  const opts = getCompilerContext(options)

  const { templateHandler, styleHandler, jsHandler, cache, twPatcher } = opts

  let runtimeSet = new Set<string>()
  const patchPromise = Promise.resolve(twPatcher.patch())

  const MODULE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']
  let runtimeSetInitialized = false

  async function refreshRuntimeSet(force = false) {
    await patchPromise
    if (!force && runtimeSetInitialized && runtimeSet.size > 0) {
      return runtimeSet
    }
    runtimeSet = await collectRuntimeClassSet(twPatcher)
    runtimeSetInitialized = true
    return runtimeSet
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
      // fall through to extension-based lookup
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

  const transformWxss = (options: Partial<IStyleHandlerOptions> = {}) =>
    createVinylTransform(async (file) => {
      if (!file.contents) {
        return
      }
      await refreshRuntimeSet(true)
      await patchPromise
      const rawSource = file.contents.toString()
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        rawSource,
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('css cache hit: %s', file.path)
        },
        async transform() {
          await patchPromise
          const { css } = await styleHandler(rawSource, {
            isMainChunk: true,
            majorVersion: twPatcher.majorVersion,
            ...options,
          })
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
      await refreshRuntimeSet(runtimeSet.size === 0)
      await patchPromise
      const filename = path.resolve(file.path)
      const moduleGraph = options.moduleGraph ?? createModuleGraphOptionsFor()
      const handlerOptions: CreateJsHandlerOptions = {
        ...options,
        filename,
        moduleGraph,
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
          await patchPromise
          const currentSource = file.contents?.toString() ?? rawSource
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
      await refreshRuntimeSet(runtimeSet.size === 0)
      await patchPromise
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
          await patchPromise
          const code = await templateHandler(rawSource, {
            runtimeSet,
            ...options,
          })
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
