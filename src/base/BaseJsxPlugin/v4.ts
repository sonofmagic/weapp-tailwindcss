import type { AppType, TaroUserDefinedOptions } from '@/types'
import type { Compiler } from 'webpack4'
import { styleHandler, jsxHandler, pluginName, getOptions, createInjectPreflight } from '@/shared'
import { ConcatSource, Source } from 'webpack-sources'
import { createReplacer } from '@/jsx/replacer'
import type { IBaseWebpackPlugin } from '@/interface'
/**
 * @issue https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/5
 */
export class BaseJsxWebpackPluginV4 implements IBaseWebpackPlugin {
  options: Required<TaroUserDefinedOptions>
  appType: AppType
  constructor (options: TaroUserDefinedOptions = { framework: 'react' }, appType: AppType) {
    this.options = getOptions(options)
    this.appType = appType
  }

  apply (compiler: Compiler) {
    const { cssMatcher, jsMatcher, mainCssChunkMatcher, framework, cssPreflight, customRuleCallback, onLoad, onUpdate, onEnd, onStart } = this.options
    // default react
    const replacer = createReplacer(framework)
    const cssInjectPreflight = createInjectPreflight(cssPreflight)
    onLoad()
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
        } else if (jsMatcher(file)) {
          const rawSource = originalSource.source().toString()

          const { code, map } = jsxHandler(rawSource, replacer, file)
          const source = new ConcatSource(code)
          compilation.updateAsset(file, source)
          const sourceMapFileName = `${file}.map`
          if (compilation.assets[sourceMapFileName]) {
            const sourceMap = new ConcatSource(JSON.stringify(map))
            compilation.updateAsset(sourceMapFileName, sourceMap)
          }
          onUpdate(file)
        }
      }
      onEnd()
    })
  }
}
