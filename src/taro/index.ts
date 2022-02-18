import type { TaroUserDefinedOptions } from '../types'
import type { Compiler } from 'webpack4'
import { styleHandler, jsxHandler, pluginName, getOptions } from '../shared'
import { ConcatSource, Source } from 'webpack-sources'
import { createReplacer } from '../jsx/replacer'
// ReplaceSource,

// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class TaroWeappTailwindcssWebpackPluginV4 {
  options: Required<TaroUserDefinedOptions>
  constructor (options: TaroUserDefinedOptions = { framework: 'react' }) {
    this.options = getOptions(options)
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, framework } = this.options
    const replacer = createReplacer(framework)
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
          const jsSource = jsxHandler(rawSource, replacer)
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
