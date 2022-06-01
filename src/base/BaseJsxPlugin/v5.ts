// webpack 5
import type { AppType, UserDefinedOptions } from '@/types'
import type { Compiler } from 'webpack'
import { styleHandler, jsxHandler, pluginName, getOptions, createInjectPreflight } from '@/shared'
import { createReplacer } from '@/jsx/replacer'
import type { IBaseWebpackPlugin } from '@/interface'
import { NormalModule } from 'webpack'
import path from 'path'
const NS = 'jsx-rename-loader'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2
 */

export class BaseJsxWebpackPluginV5 implements IBaseWebpackPlugin {
  options: Required<UserDefinedOptions>
  appType: AppType
  static NS = NS
  constructor (options: UserDefinedOptions = {}, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, cssPreflight, customRuleCallback, onLoad, onUpdate, onEnd, onStart } = this.options
    const cssInjectPreflight = createInjectPreflight(cssPreflight)
    const Compilation = compiler.webpack.Compilation
    const { ConcatSource } = compiler.webpack.sources
    // react
    const replacer = createReplacer()
    const isReact = true
    onLoad()
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      if (isReact) {
        NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
          if (jsMatcher(module.resource)) {
            // unshift
            module.loaders.unshift({
              loader: path.resolve(__dirname, 'jsx-rename-loader.js'),
              options: {
                replacer
              },
              ident: null,
              type: null
            })
          }
        })
      }

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
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
                customRuleCallback
              })
              const source = new ConcatSource(css)
              compilation.updateAsset(file, source)
              onUpdate(file)
            } else if (!isReact && jsMatcher(file)) {
              const rawSource = originalSource.source().toString()
              const { code } = jsxHandler(rawSource, replacer)
              const source = new ConcatSource(code)
              compilation.updateAsset(file, source)
              // const sourceMapFileName = `${file}.map`
              // if (compilation.assets[sourceMapFileName]) {
              //   const sourceMap = new ConcatSource(JSON.stringify(map))
              //   compilation.updateAsset(sourceMapFileName, sourceMap)
              // }
              onUpdate(file)
            }
          }
          onEnd()
        }
      )
    })
  }
}
