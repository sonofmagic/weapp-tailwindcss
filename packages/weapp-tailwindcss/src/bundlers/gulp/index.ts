import type File from 'vinyl'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import stream from 'node:stream'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'

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

  function transformWxss(options: Partial<IStyleHandlerOptions> = {}) {
    return new Transform({
      objectMode: true,
      async transform(file: File, _encoding, callback) {
        runtimeSet = await twPatcher.getClassSet()
        setMangleRuntimeSet(runtimeSet)
        const error = null

        if (file.contents) {
          const rawSource = file.contents.toString()
          const hash = cache.computeHash(rawSource)
          cache.calcHashValueChanged(file.path, hash)
          await cache.process(
            file.path,
            () => {
              const source = cache.get<string>(file.path)
              if (source) {
                file.contents = Buffer.from(source)
                debug('css cache hit: %s', file.path)
              }
              else {
                return false
              }
            },
            async () => {
              const { css } = await styleHandler(rawSource, {
                isMainChunk: true,
                majorVersion: twPatcher.majorVersion,
                ...options,
              })
              file.contents = Buffer.from(css)
              debug('css handle: %s', file.path)
              return {
                key: file.path,
                source: css,
              }
            },
          )
        }

        callback(error, file)
      },
      // construct(callback) {
      //   debug('transformWxss start')
      //   callback()
      // }
    })
  }

  function transformJs(options: Partial<CreateJsHandlerOptions> = {}) {
    return new Transform({
      objectMode: true,
      async transform(file: File, _encoding, callback) {
        const error = null
        if (file.contents) {
          const rawSource = file.contents.toString()
          const hash = cache.computeHash(rawSource)
          cache.calcHashValueChanged(file.path, hash)
          await cache.process(
            file.path,
            () => {
              const source = cache.get<string>(file.path)
              if (source) {
                file.contents = Buffer.from(source)
                debug('js cache hit: %s', file.path)
              }
              else {
                return false
              }
            },
            async () => {
              const { code } = await jsHandler(rawSource, runtimeSet, options)
              file.contents = Buffer.from(code)
              debug('js handle: %s', file.path)
              return {
                key: file.path,
                source: code,
              }
            },
          )
        }
        callback(error, file)
      },
    })
  }

  function transformWxml(options: Partial<ITemplateHandlerOptions> = {}) {
    return new Transform({
      objectMode: true,
      async transform(file: File, _encoding, callback) {
        const error = null

        if (file.contents) {
          const rawSource = file.contents.toString()
          const hash = cache.computeHash(rawSource)
          cache.calcHashValueChanged(file.path, hash)

          await cache.process(
            file.path,
            () => {
              const source = cache.get<string>(file.path)
              if (source) {
                file.contents = Buffer.from(source)
                debug('html cache hit: %s', file.path)
              }
              else {
                return false
              }
            },
            async () => {
              const code = await templateHandler(rawSource, {
                runtimeSet,
                ...options,
              })
              file.contents = Buffer.from(code)
              debug('html handle: %s', file.path)
              return {
                key: file.path,
                source: code,
              }
            },
          )
        }
        callback(error, file)
      },
    })
  }

  return {
    transformWxss,
    transformWxml,
    transformJs,
  }
}
