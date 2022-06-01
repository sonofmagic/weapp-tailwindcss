import type { AppType, TaroUserDefinedOptions } from '@/types'
import type { Compiler } from 'webpack4'
import { styleHandler, jsxHandler, pluginName, getOptions, createInjectPreflight } from '@/shared'
import { ConcatSource, Source } from 'webpack-sources'
import { createReplacer } from '@/jsx/replacer'
import type { IBaseWebpackPlugin } from '@/interface'
import path from 'path'
const NS = 'jsx-rename-loader'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/5
 */
export class BaseJsxWebpackPluginV4 implements IBaseWebpackPlugin {
  options: Required<TaroUserDefinedOptions>
  appType: AppType
  static NS = NS
  constructor (options: TaroUserDefinedOptions = { framework: 'react' }, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, framework, cssPreflight, customRuleCallback, onLoad, onUpdate, onEnd, onStart } = this.options
    // default react
    const replacer = createReplacer(framework)
    const cssInjectPreflight = createInjectPreflight(cssPreflight)
    const isReact = framework === 'react'
    const rule = {
      loader: path.resolve(__dirname, `${NS}.js`), // Path to loader
      options: {
        framework,
        replacer
      }
    }
    onLoad()
    if (isReact) {
      // @ts-ignore
      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        // @ts-ignore
        compilation.hooks.normalModuleLoader.tap(pluginName, (loaderContext, module) => {
          // loaderContext[NS] = true
          if (jsMatcher(module.resource)) {
            // unshift
            // ignore node_modules ?
            module.loaders.unshift(rule)
          }
          // else if (/\.vue$/.test(module.resource)) {
          //   module.loaders.unshift({
          //     loader: path.resolve(__dirname, 'vue-template-rename-loader.js'), // Path to loader
          //     options: {
          //       // framework,
          //       // replacer,
          //       // isVue: true
          //     }
          //   })
          // }
        })
      })
    }

    compiler.hooks.emit.tap(pluginName, (compilation) => {
      onStart()
      const entries: [string, Source][] = Object.entries(compilation.assets)
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
    })
  }
}
