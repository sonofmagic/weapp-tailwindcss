import type { UserDefinedOptions } from '../types'
import type { Compiler } from 'webpack4'
import {
  styleHandler,
  templeteHandler,
  pluginName,
  getFileName
} from '../shared'
import { ConcatSource, Source } from 'webpack-sources'

// ReplaceSource,

// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class UniAppWeappTailwindcssWebpackPluginV4 {
  options: UserDefinedOptions
  constructor (options = {}) {
    this.options = options
  }

  apply (compiler: Compiler) {
    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const entries: [string, Source][] = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (/.+\.(?:wx|ac|jx|tt|q|c)ss$/.test(file)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource, getFileName(file))
          const source = new ConcatSource(css)
          compilation.updateAsset(file, source)
        } else if (/.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file)) {
          const rawSource = originalSource.source().toString()
          const wxml = templeteHandler(rawSource)
          const source = new ConcatSource(wxml)
          compilation.updateAsset(file, source)
        }
      }
    })
  }
}
