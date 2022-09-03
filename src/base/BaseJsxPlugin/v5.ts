// webpack 5
import type { AppType, UserDefinedOptions } from '@/types'
import type { Compiler } from 'webpack'
import { styleHandler } from '@/postcss'
import { createInjectPreflight } from '@/postcss/preflight'
import { jsxHandler } from '@/jsx'
import { getOptions } from '@/defaults'
import { pluginName } from '@/shared'
import { createReplacer } from '@/jsx/replacer'
import type { IBaseWebpackPlugin } from '@/interface'
import { NormalModule } from 'webpack'
import { NS } from './common'
import path from 'path'
import ClassGenerator from '@/mangle/classGenerator'
import { getGroupedEntries } from '@/base/shared'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2
 */

export class BaseJsxWebpackPluginV5 implements IBaseWebpackPlugin {
  options: Required<UserDefinedOptions>
  appType: AppType
  classGenerator?: ClassGenerator
  static NS = NS
  constructor (options: UserDefinedOptions = { framework: 'react' }, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const {
      jsMatcher,
      mainCssChunkMatcher,
      replaceUniversalSelectorWith,
      framework,
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
    const cssInjectPreflight = createInjectPreflight(cssPreflight)
    const Compilation = compiler.webpack.Compilation
    const { ConcatSource } = compiler.webpack.sources
    // react
    const replacer = createReplacer(framework)
    const isReact = true
    const rule = {
      loader: path.resolve(__dirname, `${NS}.js`),
      options: {
        replacer
      },
      ident: null,
      type: null
    }
    onLoad()
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      if (isReact) {
        NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
          if (jsMatcher(module.resource)) {
            // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
            // replacer.end()
            // unshift
            module.loaders.unshift(rule)
          }
        })
      }

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        (assets) => {
          onStart()
          const entries = Object.entries(assets)
          const groupedEntries = getGroupedEntries(entries, this.options)
          if (!isReact && Array.isArray(groupedEntries.js)) {
            for (let i = 0; i < groupedEntries.js.length; i++) {
              const [file, originalSource] = groupedEntries.js[i]
              // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
              replacer.end()
              const rawSource = originalSource.source().toString()
              const { code } = jsxHandler(rawSource, replacer)
              const source = new ConcatSource(code)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, code)
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
                replaceUniversalSelectorWith
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
