import { getOptions } from '@/options'
import { UserDefinedOptions } from '@/types'
import stream from 'stream'
import { getClassCacheSet } from '@/tailwindcss/exposeContext'
import type File from 'vinyl'
const Transform = stream.Transform

export function createPlugins(options: UserDefinedOptions = {}) {
  if (typeof options.customReplaceDictionary === 'undefined') {
    options.customReplaceDictionary = 'simple'
  }
  const opts = getOptions(options, ['patch', 'style', 'templete', 'js'])
  const { templeteHandler, styleHandler, patch, jsHandler } = opts

  let set = new Set<string>()
  patch?.()

  function transformWxss() {
    const transformStream = new Transform({ objectMode: true })

    transformStream._transform = function (file: File, encoding, callback) {
      set = getClassCacheSet()
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
