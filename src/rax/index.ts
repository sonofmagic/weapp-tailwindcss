// webpack 5
import type { UserDefinedOptions } from '../types'
import type { Compiler } from 'webpack'
import { styleHandler, jsxHandler, pluginName, getOptions } from '../shared'
import { createReplacer } from '../jsx/replacer'
export class RaxTailwindcssWebpackPluginV5 {
  options: Required<UserDefinedOptions>
  constructor (options: UserDefinedOptions = {}) {
    this.options = getOptions(options)
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher } = this.options
    // react
    const replacer = createReplacer()
    const { ConcatSource } = compiler.webpack.sources
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const entries = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (cssMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(file, 'rax')
          })
          const source = new ConcatSource(css)
          compilation.updateAsset(file, source)
        } else if (jsMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const jsSource = jsxHandler(rawSource, replacer)
          const source = new ConcatSource(jsSource)
          compilation.updateAsset(file, source)
        }
      }
    })
  }
}
