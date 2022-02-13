import type { UserDefinedOptions } from '../types'
import type { Compiler } from 'webpack4'
import { styleHandler, jsxHandler, pluginName, getOptions } from '../shared'
import { ConcatSource, Source } from 'webpack-sources'
// ReplaceSource,

// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class TaroWeappTailwindcssWebpackPluginV4 {
  options: Required<UserDefinedOptions>
  constructor (options: UserDefinedOptions = {}) {
    this.options = getOptions(options)
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher } = this.options
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const entries: [string, Source][] = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (cssMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(file, 'taro')
          })
          const source = new ConcatSource(css)
          compilation.updateAsset(file, source)
        } else if (jsMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const jsSource = jsxHandler(rawSource)
          const source = new ConcatSource(jsSource)
          compilation.updateAsset(file, source)
        }
        // else if (/.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file)) {
        //   const rawSource = originalSource.source().toString()
        //   const wxml = templeteHandler(rawSource)
        //   const source = new ConcatSource(wxml)
        //   compilation.updateAsset(file, source)
        // }
      }
    })
  }
}
