import { getOptions } from '@/options'
import { UserDefinedOptions } from '@/types'
import stream from 'stream'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import type File from 'vinyl'
import { initStore, setRuntimeSet } from '@/mangle/store'
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
  if (typeof options.customReplaceDictionary === 'undefined') {
    options.customReplaceDictionary = 'simple'
  }
  const opts = getOptions(options, ['patch', 'style', 'templete', 'js'])
  const { templeteHandler, styleHandler, patch, jsHandler, mangle } = opts

  let set = new Set<string>()
  patch?.()

  initStore(mangle)
  const twPatcher = createTailwindcssPatcher()

  function transformWxss() {
    const transformStream = new Transform({ objectMode: true })

    transformStream._transform = function (file: File, encoding, callback) {
      set = twPatcher.getClassSet()
      setRuntimeSet(set)
      const error = null

      if (file.contents) {
        const code = styleHandler(file.contents.toString(), {
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
        const { code } = jsHandler(file.contents.toString(), set)
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
        const code = templeteHandler(file.contents.toString())
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
