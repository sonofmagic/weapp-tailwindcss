import stream from 'node:stream'
import type File from 'vinyl'
import { getOptions } from '@/options'
import { UserDefinedOptions } from '@/types'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { createDebug } from '@/debug'

const debug = createDebug('')
const Transform = stream.Transform

// export interface IBaseTransformOptions {
//   encoding?: BufferEncoding
// }
/**
 * @name weapp-tw-gulp
 * @description gulp版本weapp-tw插件
 * @link https://weapp-tw.icebreaker.top/docs/quick-start/frameworks/native
 */
export function createPlugins(options: UserDefinedOptions = {}) {
  const opts = getOptions(options)
  const { templateHandler, styleHandler, patch, jsHandler, setMangleRuntimeSet, tailwindcssBasedir, cache } = opts

  let runtimeSet = new Set<string>()
  patch?.()

  const twPatcher = createTailwindcssPatcher()

  function transformWxss() {
    const transformStream = new Transform({ objectMode: true })

    transformStream._transform = async function (file: File, encoding, callback) {
      runtimeSet = twPatcher.getClassSet({
        basedir: tailwindcssBasedir
      })
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
            } else {
              return false
            }
          },
          async () => {
            const code = await styleHandler(rawSource, {
              isMainChunk: true
            })
            file.contents = Buffer.from(code)
            debug('css handle: %s', file.path)
            return {
              key: file.path,
              source: code
            }
          }
        )
      }

      callback(error, file)
    }

    return transformStream
  }

  function transformJs() {
    const transformStream = new Transform({ objectMode: true })

    transformStream._transform = async function (file: File, encoding, callback) {
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
            } else {
              return false
            }
          },
          () => {
            const { code } = jsHandler(rawSource, runtimeSet)
            file.contents = Buffer.from(code)
            debug('js handle: %s', file.path)
            return {
              key: file.path,
              source: code
            }
          }
        )
      }
      callback(error, file)
    }

    return transformStream
  }

  function transformWxml() {
    const transformStream = new Transform({ objectMode: true })

    transformStream._transform = async function (file: File, encoding, callback) {
      const error = null
      // file.path
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
              debug('html handle: %s', file.path)
            } else {
              return false
            }
          },
          () => {
            const code = templateHandler(rawSource, {
              runtimeSet
            })
            file.contents = Buffer.from(code)
            debug('html handle: %s', file.path)
            return {
              key: file.path,
              source: code
            }
          }
        )
      }

      callback(error, file)
    }

    return transformStream
  }

  return {
    transformWxss,
    transformWxml,
    transformJs
  }
}
