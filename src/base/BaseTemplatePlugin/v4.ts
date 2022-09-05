import type { UserDefinedOptions, AppType, IMangleOptions } from '@/types'
import type { Compiler } from 'webpack4'
import { styleHandler } from '@/postcss'
import { createInjectPreflight } from '@/postcss/preflight'
import { templeteHandler } from '@/wxml'
import { getOptions } from '@/defaults'
import { pluginName } from '@/shared'
import { ConcatSource, Source } from 'webpack-sources'
import type { IBaseWebpackPlugin } from '@/interface'
import { getGroupedEntries } from '@/base/shared'
import ClassGenerator from '@/mangle/classGenerator'
// https://github.com/dcloudio/uni-app/blob/231df55edc5582dff5aa802ebbb8d337c58821ae/packages/uni-template-compiler/lib/index.js
// https://github.com/dcloudio/uni-app/blob/master/packages/uni-template-compiler/lib/index.js
// 3 个方案，由 loader 生成的 wxml
export class BaseTemplateWebpackPluginV4 implements IBaseWebpackPlugin {
  options: Required<UserDefinedOptions>
  appType: AppType
  classGenerator?: ClassGenerator
  constructor (options: UserDefinedOptions = {}, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { mainCssChunkMatcher, replaceUniversalSelectorWith, cssPreflight, cssPreflightRange, customRuleCallback, disabled, onLoad, onUpdate, onEnd, onStart, mangle } = this.options
    if (disabled) {
      return
    }
    if (mangle) {
      this.classGenerator = new ClassGenerator(mangle as IMangleOptions)
    }

    const cssInjectPreflight = createInjectPreflight(cssPreflight)
    onLoad()
    compiler.hooks.emit.tap(pluginName, (compilation) => {
      onStart()
      const entries: [string, Source][] = Object.entries(compilation.assets)
      const groupedEntries = getGroupedEntries(entries, this.options)
      if (Array.isArray(groupedEntries.html)) {
        for (let i = 0; i < groupedEntries.html.length; i++) {
          let classGenerator
          const [file, originalSource] = groupedEntries.html[i]
          const rawSource = originalSource.source().toString()
          if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
            classGenerator = this.classGenerator
          }
          const wxml = templeteHandler(rawSource, { classGenerator })
          const source = new ConcatSource(wxml)
          compilation.updateAsset(file, source)
          onUpdate(file, rawSource, wxml)
        }
      }
      if (Array.isArray(groupedEntries.css)) {
        for (let i = 0; i < groupedEntries.css.length; i++) {
          let classGenerator
          const [file, originalSource] = groupedEntries.css[i]
          const rawSource = originalSource.source().toString()
          if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
            classGenerator = this.classGenerator
          }
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(file, this.appType),
            cssInjectPreflight,
            customRuleCallback,
            cssPreflightRange,
            replaceUniversalSelectorWith,
            classGenerator
          })
          const source = new ConcatSource(css)
          compilation.updateAsset(file, source)
          onUpdate(file, rawSource, css)
        }
      }
      onEnd()
    })
  }
}
