import type { AppType, UserDefinedOptions, InternalUserDefinedOptions, IBaseWebpackPlugin } from '@/types'
import type { Compiler } from 'webpack'
import { getOptions } from '@/defaults'
import { pluginName } from '@/constants'
import { getGroupedEntries } from '@/base/shared'
// import ClassGenerator from '@/mangle/classGenerator'

/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/6
 */
export class BaseTemplateWebpackPluginV5 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType: AppType
  // classGenerator?: ClassGenerator
  constructor(options: UserDefinedOptions = {}, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply(compiler: Compiler) {
    const { mainCssChunkMatcher, disabled, onLoad, onUpdate, onEnd, onStart, templeteHandler, styleHandler, patch } = this.options
    if (disabled) {
      return
    }
    patch?.()
    // if (mangle) {
    //   this.classGenerator = new ClassGenerator(mangle as IMangleOptions)
    // }
    const { ConcatSource } = compiler.webpack.sources
    const Compilation = compiler.webpack.Compilation

    onLoad()
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
          // additionalAssets: true
        },
        (assets) => {
          onStart()
          const entries = Object.entries(assets)
          const groupedEntries = getGroupedEntries(entries, this.options)

          if (Array.isArray(groupedEntries.html)) {
            for (let i = 0; i < groupedEntries.html.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.html[i]

              const rawSource = originalSource.source().toString()
              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }

              const wxml = templeteHandler(rawSource, {
                // classGenerator
              })
              const source = new ConcatSource(wxml)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, wxml)
            }
          }
          if (Array.isArray(groupedEntries.css)) {
            for (let i = 0; i < groupedEntries.css.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.css[i]
              const rawSource = originalSource.source().toString()

              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }

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
