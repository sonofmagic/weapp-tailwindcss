import type { AppType, UserDefinedOptions, IMangleOptions } from '@/types'
import type { Compiler } from 'webpack'
import { styleHandler } from '@/postcss'
import { createInjectPreflight } from '@/postcss/preflight'
import { templeteHandler } from '@/wxml'
import { getOptions } from '@/defaults'
import { pluginName } from '@/shared'
import type { IBaseWebpackPlugin } from '@/interface'
import { getGroupedEntries } from '@/base/shared'
import ClassGenerator from '@/mangle/classGenerator'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/6
 */
export class BaseTemplateWebpackPluginV5 implements IBaseWebpackPlugin {
  options: Required<UserDefinedOptions>
  appType: AppType
  classGenerator?: ClassGenerator
  constructor (options: UserDefinedOptions = {}, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { mainCssChunkMatcher, replaceUniversalSelectorWith, cssPreflight, cssPreflightRange, customRuleCallback, disabled, onLoad, onUpdate, onEnd, onStart, mangle } =
      this.options
    if (disabled) {
      return
    }
    const needMangled = Boolean(mangle)
    if (needMangled) {
      this.classGenerator = new ClassGenerator(mangle as IMangleOptions)
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
          const groupedEntries = getGroupedEntries(entries, this.options)

          if (Array.isArray(groupedEntries.html)) {
            for (let i = 0; i < groupedEntries.html.length; i++) {
              const [file, originalSource] = groupedEntries.html[i]
              const rawSource = originalSource.source().toString()
              const wxml = templeteHandler(rawSource, {
                classGenerator: this.classGenerator
              })
              const source = new ConcatSource(wxml)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, wxml)
            }
          }
          if (Array.isArray(groupedEntries.css)) {
            for (let i = 0; i < groupedEntries.css.length; i++) {
              const [file, originalSource] = groupedEntries.css[i]
              const rawSource = originalSource.source().toString()
              const css = styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(file, this.appType),
                cssInjectPreflight,
                customRuleCallback,
                cssPreflightRange,
                replaceUniversalSelectorWith,
                classGenerator: this.classGenerator
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
