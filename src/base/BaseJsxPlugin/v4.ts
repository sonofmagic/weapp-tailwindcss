import type { AppType, UserDefinedOptions, InternalUserDefinedOptions, IBaseWebpackPlugin } from '@/types'
import type { Compiler } from 'webpack4'
import { getOptions } from '@/defaults'
import { pluginName, NS } from '@/constants'
import { ConcatSource, Source } from 'webpack-sources'
import path from 'path'
import { getGroupedEntries } from '@/base/shared'
// import ClassGenerator from '@/mangle/classGenerator'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/5
 */
export class BaseJsxWebpackPluginV4 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType: AppType
  // classGenerator?: ClassGenerator
  static NS = NS
  constructor (options: UserDefinedOptions = { framework: 'react' }, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { jsMatcher, mainCssChunkMatcher, framework, disabled, onLoad, onUpdate, onEnd, onStart, loaderOptions, styleHandler, jsxHandler } = this.options
    if (disabled) {
      return
    }
    // if (mangle) {
    //   this.classGenerator = new ClassGenerator(mangle as IMangleOptions)
    // }

    const isReact = framework === 'react'
    const loader = path.resolve(__dirname, `${NS}.js`)
    onLoad()

    // @ts-ignore
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // @ts-ignore
      compilation.hooks.normalModuleLoader.tap(pluginName, (loaderContext, module) => {
        // loaderContext[NS] = true
        if (jsMatcher(module.resource)) {
          // let classGenerator
          // if (this.classGenerator && this.classGenerator.isFileIncluded(module.resource)) {
          //   classGenerator = this.classGenerator
          // }
          // default react

          const rule = {
            loader, // Path to loader
            options: {
              framework,
              // classGenerator,
              write: loaderOptions.jsxRename
            }
          }

          module.loaders.unshift(rule)
        }
      })
    })

    compiler.hooks.emit.tap(pluginName, (compilation) => {
      onStart()
      const entries: [string, Source][] = Object.entries(compilation.assets)
      const groupedEntries = getGroupedEntries(entries, this.options)
      if (!isReact && Array.isArray(groupedEntries.js)) {
        for (let i = 0; i < groupedEntries.js.length; i++) {
          // let classGenerator

          const [file, originalSource] = groupedEntries.js[i]
          // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
          //   classGenerator = this.classGenerator
          // }

          const rawSource = originalSource.source().toString()
          const { code } = jsxHandler(rawSource, framework)
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
    })
  }
}
