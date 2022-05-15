import type { UserDefinedOptions, AppType } from '@/types'
import type { Compiler } from 'webpack4'
import { styleHandler, templeteHandler, pluginName, getOptions, createInjectPreflight } from '@/shared'
import { ConcatSource, Source } from 'webpack-sources'
import type { IBaseWebpackPlugin } from '@/interface'
// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class BaseTemplateWebpackPluginV4 implements IBaseWebpackPlugin {
  options: Required<UserDefinedOptions>
  appType: AppType
  constructor (options: UserDefinedOptions = {}, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { cssMatcher, htmlMatcher, mainCssChunkMatcher, cssPreflight, customRuleCallback, onLoad, onUpdate, onEnd, onStart } = this.options
    const cssInjectPreflight = createInjectPreflight(cssPreflight)
    onLoad()
    compiler.hooks.emit.tap(pluginName, (compilation) => {
      onStart()
      const entries: [string, Source][] = Object.entries(compilation.assets)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (cssMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(file, this.appType),
            cssInjectPreflight,
            customRuleCallback
          })
          const source = new ConcatSource(css)
          compilation.updateAsset(file, source)
          onUpdate(file)
        } else if (htmlMatcher(file)) {
          const rawSource = originalSource.source().toString()
          const wxml = templeteHandler(rawSource)
          const source = new ConcatSource(wxml)
          compilation.updateAsset(file, source)
          onUpdate(file)
        }
      }
      onEnd()
    })
  }
}
