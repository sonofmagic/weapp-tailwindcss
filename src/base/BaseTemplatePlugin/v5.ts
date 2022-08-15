import type { AppType, UserDefinedOptions } from '@/types'
import type { Compiler } from 'webpack'
import { styleHandler } from '@/postcss'
import { createInjectPreflight } from '@/postcss/preflight'
import { templeteHandler } from '@/wxml'
import { getOptions } from '@/defaults'
import { pluginName } from '@/shared'
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
    const {
      cssMatcher,
      htmlMatcher,
      mainCssChunkMatcher,
      replaceUniversalSelectorWith,
      cssPreflight,
      cssPreflightRange,
      customRuleCallback,
      disabled,
      onLoad,
      onUpdate,
      onEnd,
      onStart
    } = this.options
    if (disabled) {
      return
    }
    const { ConcatSource } = compiler.webpack.sources
    const Compilation = compiler.webpack.Compilation
    const cssInjectPreflight = createInjectPreflight(cssPreflight)
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
          for (let i = 0; i < entries.length; i++) {
            const [file, originalSource] = entries[i]
            if (cssMatcher(file)) {
              const rawSource = originalSource.source().toString()
              const css = styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(file, this.appType),
                cssInjectPreflight,
                customRuleCallback,
                cssPreflightRange,
                replaceUniversalSelectorWith
              })
              const source = new ConcatSource(css)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, css)
            } else if (htmlMatcher(file)) {
              const rawSource = originalSource.source().toString()
              const wxml = templeteHandler(rawSource)
              const source = new ConcatSource(wxml)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, wxml)
            }
          }
          onEnd()
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
