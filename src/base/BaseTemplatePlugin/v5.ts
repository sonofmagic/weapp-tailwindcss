import type { AppType, UserDefinedOptions } from '@/types'
import type { Compiler } from 'webpack'
import { styleHandler, templeteHandler, pluginName, getOptions, createInjectPreflight } from '@/shared'
import type { IBaseWebpackPlugin } from '@/interface'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/6
 */
export class BaseTemplateWebpackPluginV5 implements IBaseWebpackPlugin {
  options: Required<UserDefinedOptions>
  appType: AppType

  constructor (options: UserDefinedOptions = {}, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { cssMatcher, htmlMatcher, mainCssChunkMatcher, cssPreflight, customRuleCallback } = this.options
    const { ConcatSource } = compiler.webpack.sources
    const Compilation = compiler.webpack.Compilation
    const cssInjectPreflight = createInjectPreflight(cssPreflight)

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
          // additionalAssets: true
        },
        async (assets) => {
          const entries = Object.entries(assets)
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
            } else if (htmlMatcher(file)) {
              const rawSource = originalSource.source().toString()
              const wxml = templeteHandler(rawSource)
              const source = new ConcatSource(wxml)
              compilation.updateAsset(file, source)
            }
          }
        }
      )
    })

    // compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
    //   const entries = Object.entries(compilation.assets)
    //   for (let i = 0; i < entries.length; i++) {
    //     const [file, originalSource] = entries[i]
    //     if (cssMatcher(file)) {
    //       const rawSource = originalSource.source().toString()
    //       const css = styleHandler(rawSource, {
    //         isMainChunk: mainCssChunkMatcher(file, this.appType),
    //         cssInjectPreflight,
    //         customRuleCallback
    //       })
    //       const source = new ConcatSource(css)
    //       compilation.updateAsset(file, source)
    //     } else if (htmlMatcher(file)) {
    //       const rawSource = originalSource.source().toString()
    //       const wxml = templeteHandler(rawSource)
    //       const source = new ConcatSource(wxml)
    //       compilation.updateAsset(file, source)
    //     }
    //   }
    // })
  }
}
