import type { UserDefinedOptions } from '../types'
import type { Compiler } from 'webpack4'
import { styleHandler, templeteHandler, pluginName, getOptions } from '../shared'
import { ConcatSource, Source } from 'webpack-sources'

// ReplaceSource,

// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class UniAppWeappTailwindcssWebpackPluginV4 {
  options: Required<UserDefinedOptions>
  constructor (options: UserDefinedOptions = {}) {
    this.options = getOptions(options)
  }

  apply (compiler: Compiler) {
    const { cssMatcher, htmlMatcher, mainCssChunkMatcher } = this.options
    // @ts-ignore
    // compiler.hooks.compilation.tap(pluginName, (compilation) => {
    //   // compilation.hooks.optimize.tap(pluginName, () => {
    //   //   console.log(compilation.assets)
    //   // })
    //   // @ts-ignore
    //   // compilation.hooks.optimizeChunks.tap(pluginName, (chunks) => {
    //   //   console.log(chunks, compilation.assets)
    //   // })
    //   // compilation.hooks.afterOptimizeTree.tap(pluginName, (chunks, modules) => {
    //   //   console.log(chunks, modules, compilation.assets)
    //   // })
    //   // // @ts-ignore
    //   // compilation.hooks.afterOptimizeChunkModules.tap(pluginName, (chunks, modules) => {
    //   //   console.log(chunks, modules, compilation.assets)
    //   // })

    //   compilation.hooks.additionalChunkAssets.tap(pluginName, (chunks) => {
    //     // console.log(chunks, compilation.assets)
    //     const entries: [string, Source][] = Object.entries(compilation.assets)
    //     entries.forEach(([file, originalSource]) => {
    //       console.log(file, originalSource.source().toString())
    //     })
    //   })
    //   // webpack4
    //   // compilation.hooks.buildModule.tap(pluginName, (module) => {
    //   //   console.log(module, compilation)
    //   // })
    //   // compilation.hooks.rebuildModule.tap(pluginName, (module) => {
    //   //   console.log(module, compilation)
    //   // })
    //   // // @ts-ignore
    //   // compilation.hooks.failedModule.tap(pluginName, (module, error) => {
    //   //   console.log(module, error, compilation)
    //   // })
    //   // compilation.hooks.succeedModule.tap(pluginName, (module) => {
    //   //   console.log(module, compilation)
    //   // })
    //   // compilation.hooks.finishModules.tap(pluginName, (modules) => {
    //   //   console.log(modules, compilation)
    //   // })
    //   // compilation.hooks.finishRebuildingModule.tap(pluginName, (module) => {
    //   //   console.log(module, compilation)
    //   // })
    // })

    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const entries: [string, Source][] = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (cssMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(file, 'uni-app')
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
