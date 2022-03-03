import type { UserDefinedOptions } from '../types'
import type { Compiler } from 'webpack'
import { styleHandler, templeteHandler, pluginName, getOptions } from '../shared'

export class NativeWeappTailwindcssWebpackPluginV5 {
  options: Required<UserDefinedOptions>
  constructor (options: UserDefinedOptions = {}) {
    this.options = getOptions(options)
  }

  apply (compiler: Compiler) {
    const { cssMatcher, htmlMatcher, mainCssChunkMatcher } = this.options
    const { ConcatSource } = compiler.webpack.sources
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const entries = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (cssMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(file, 'native')
          })
          const source = new ConcatSource(css)
          compilation.updateAsset(file, source)
        } else if (htmlMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const wxml = templeteHandler(rawSource)
          const source = new ConcatSource(wxml)
          compilation.updateAsset(file, source)
        }
      }
    })
  }
}
