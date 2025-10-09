import type File from 'vinyl'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import stream from 'node:stream'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
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

  const { templateHandler, styleHandler, jsHandler, setMangleRuntimeSet, cache, twPatcher } = opts

  let runtimeSet = new Set<string>()
  twPatcher.patch()

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
      runtimeSet = await twPatcher.getClassSet()
      setMangleRuntimeSet(runtimeSet)
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
          const { code } = await jsHandler(rawSource, runtimeSet, options)
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
