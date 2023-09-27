import stream from 'node:stream'
import type File from 'vinyl'
import { getOptions } from '@/options'
import { UserDefinedOptions } from '@/types'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'

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
  if (options.customReplaceDictionary === undefined) {
    options.customReplaceDictionary = 'simple'
  }
  const opts = getOptions(options)
  const { templateHandler, styleHandler, patch, jsHandler, setMangleRuntimeSet, tailwindcssBasedir } = opts

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
        const code = await styleHandler(file.contents.toString(), {
          isMainChunk: true
        })
        file.contents = Buffer.from(code)
      }

      callback(error, file)
    }

    return transformStream
  }

  function transformJs() {
    const transformStream = new Transform({ objectMode: true })

    transformStream._transform = function (file: File, encoding, callback) {
      const error = null
      if (file.contents) {
        const { code } = jsHandler(file.contents.toString(), runtimeSet)
        file.contents = Buffer.from(code)
      }
      callback(error, file)
    }

    return transformStream
  }

  function transformWxml() {
    const transformStream = new Transform({ objectMode: true })

    transformStream._transform = function (file: File, encoding, callback) {
      const error = null
      // file.path
      if (file.contents) {
        const code = templateHandler(file.contents.toString(), {
          runtimeSet
        })
        file.contents = Buffer.from(code)
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
