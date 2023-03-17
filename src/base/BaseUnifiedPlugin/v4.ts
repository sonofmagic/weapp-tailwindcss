// webpack 5
import type { AppType, UserDefinedOptions, InternalUserDefinedOptions, IBaseWebpackPlugin } from '@/types'
import type { Compiler } from 'webpack'
import { getOptions } from '@/defaults'
import { pluginName, NS } from '@/constants'
import { getClassCacheSet } from '@/tailwindcss/exposeContext'
// import ClassGenerator from '@/mangle/classGenerator'
import { getGroupedEntries } from '@/base/shared'

/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2
 */

export class UnifiedWebpackPluginV4 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType: AppType
  // classGenerator?: ClassGenerator
  static NS = NS
  constructor(options: UserDefinedOptions, appType: AppType) {
    if (typeof options.customReplaceDictionary === 'undefined') {
      options.customReplaceDictionary = 'simple'
    }
    this.options = getOptions(options, ['style', 'patch', 'templete', 'js'])
    this.appType = appType
  }

  apply(compiler: Compiler) {
    const { mainCssChunkMatcher, disabled, onLoad, onUpdate, onEnd, onStart, styleHandler, patch, templeteHandler, jsHandler } = this.options
    if (disabled) {
      return
    }
    patch?.()

    const Compilation = compiler.webpack.Compilation
    const { ConcatSource } = compiler.webpack.sources
    // react

    onLoad()
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        (assets) => {
          onStart()
          const entries = Object.entries(assets)
          const groupedEntries = getGroupedEntries(entries, this.options)

          if (Array.isArray(groupedEntries.html)) {
            for (let i = 0; i < groupedEntries.html.length; i++) {
              const [file, originalSource] = groupedEntries.html[i]

              const rawSource = originalSource.source().toString()

              const wxml = templeteHandler(rawSource)
              const source = new ConcatSource(wxml)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, wxml)
            }
          }

          if (Array.isArray(groupedEntries.js)) {
            const set = getClassCacheSet()

            for (let i = 0; i < groupedEntries.js.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.js[i]
              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }

              const rawSource = originalSource.source().toString()
              const { code } = jsHandler(rawSource, set)
              const source = new ConcatSource(code)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, code)
            }
          }

          if (Array.isArray(groupedEntries.css)) {
            for (let i = 0; i < groupedEntries.css.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.css[i]
              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }
              const rawSource = originalSource.source().toString()
              const css = styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(file, this.appType)
                // classGenerator
              })
              const source = new ConcatSource(css)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, css)
            }
          }

          onEnd()
        }
      )
    })
  }
}
