// webpack 5
import type { AppType, UserDefinedOptions, InternalUserDefinedOptions, IBaseWebpackPlugin } from '@/types'
import type { Compiler } from 'webpack'
import { getOptions } from '@/defaults'
import { pluginName, NS } from '@/constants'
import { NormalModule } from 'webpack'
import path from 'path'
// import ClassGenerator from '@/mangle/classGenerator'
import { getGroupedEntries } from '@/base/shared'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/2
 */

export class BaseJsxWebpackPluginV5 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType: AppType
  // classGenerator?: ClassGenerator
  static NS = NS
  constructor(options: UserDefinedOptions = { framework: 'react' }, appType: AppType) {
    this.options = getOptions(options, ['jsx', 'style', 'patch'])
    this.appType = appType
  }

  apply(compiler: Compiler) {
    const { jsMatcher, mainCssChunkMatcher, framework, disabled, onLoad, onUpdate, onEnd, onStart, loaderOptions, styleHandler, jsxHandler, jsxRenameLoaderPath, patch } =
      this.options
    if (disabled) {
      return
    }
    patch?.()
    // if (mangle) {
    //   this.classGenerator = new ClassGenerator(mangle as IMangleOptions)
    // }

    const Compilation = compiler.webpack.Compilation
    const { ConcatSource } = compiler.webpack.sources
    // react

    const isReact = framework === 'react'
    const loader = jsxRenameLoaderPath || path.resolve(__dirname, `${NS}.js`)
    onLoad()
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
        if (jsMatcher(module.resource)) {
          // let classGenerator
          // if (this.classGenerator && this.classGenerator.isFileIncluded(module.resource)) {
          //   classGenerator = this.classGenerator
          // }

          const rule = {
            loader,
            options: {
              jsxHandler,
              write: loaderOptions.jsxRename
            },
            ident: null,
            type: null
          }

          module.loaders.unshift(rule)
        }
      })

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
              // let classGenerator
              const [file, originalSource] = groupedEntries.js[i]
              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }

              const rawSource = originalSource.source().toString()
              const { code } = jsxHandler(rawSource)
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
