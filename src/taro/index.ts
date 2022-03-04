import type { TaroUserDefinedOptions } from '../types'
import type { Compiler } from 'webpack4'
import { styleHandler, jsxHandler, pluginName, getOptions } from '../shared'
import { ConcatSource, Source } from 'webpack-sources'
import { createReplacer } from '../jsx/replacer'

/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/5
 */
export class TaroWeappTailwindcssWebpackPluginV4 {
  options: Required<TaroUserDefinedOptions>
  constructor (options: TaroUserDefinedOptions = { framework: 'react' }) {
    this.options = getOptions(options)
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, framework, cssPreflight } = this.options
    const replacer = createReplacer(framework)
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const entries: [string, Source][] = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (cssMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(file, 'taro'),
            cssPreflight
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
