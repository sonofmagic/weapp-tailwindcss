// webpack 5
import type { AppType, UserDefinedOptions } from '../types'
import type { Compiler } from 'webpack'
import { styleHandler, jsxHandler, pluginName, getOptions, createInjectPreflight } from '../shared'
import { createReplacer } from '../jsx/replacer'
import type { IBaseWebpackPlugin } from '../interface'
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2
export class BaseJsxWebpackPluginV5 implements IBaseWebpackPlugin {
  options: Required<UserDefinedOptions>
  appType: AppType
  constructor (options: UserDefinedOptions = {}, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, cssPreflight } = this.options
    const cssInjectPreflight = createInjectPreflight(cssPreflight)
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
            isMainChunk: mainCssChunkMatcher(file, this.appType),
            cssInjectPreflight
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
