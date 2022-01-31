import type { UserDefinedOptions } from './types'
import type { Compiler } from 'webpack4'
import { styleHandler, templeteHandler } from './shared'
import { ReplaceSource, ConcatSource, Source } from 'webpack-sources'

const pluginName = 'weapp-tailwindcss-webpack-plugin'
// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class UniAppWeappTailwindcssWebpackPluginV4 {
  opts: UserDefinedOptions
  constructor (opts = {}) {
    this.opts = opts
  }

  apply (compiler: Compiler) {
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const entries: [string, Source][] = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (file.match(/.+\.wxss$/)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource)
          const source = new ConcatSource(css)
          compilation.updateAsset(file, source)
        } else if (file.match(/.+\.wxml$/)) {
          const rawSource = originalSource.source().toString()
          const source = new ReplaceSource(originalSource)
          templeteHandler(rawSource, (startPos, endPos, newClassName) => {
            source.replace(startPos, endPos, newClassName)
          })
          compilation.updateAsset(file, source)
        }
      }
    })
  }
}
