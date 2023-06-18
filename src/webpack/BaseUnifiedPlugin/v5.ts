// webpack 5
import type { Compiler } from 'webpack'
import { createLoader } from 'create-functional-loader'
import type { AppType, UserDefinedOptions, InternalUserDefinedOptions, IBaseWebpackPlugin } from '@/types'
import { getOptions } from '@/options'
import { pluginName, runtimeAopLoader } from '@/constants'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { getGroupedEntries } from '@/utils'

/**
 * @name UnifiedWebpackPluginV5
 * @description webpack5 核心转义插件
 * @link https://weapp-tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV5 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    if (options.customReplaceDictionary === undefined) {
      options.customReplaceDictionary = 'simple'
    }
    this.options = getOptions(options)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    const { mainCssChunkMatcher, disabled, onLoad, onUpdate, onEnd, onStart, styleHandler, patch, templeteHandler, jsHandler, setMangleRuntimeSet } = this.options
    if (disabled) {
      return
    }
    patch?.()
    // NormalModule,
    const { Compilation, sources, NormalModule } = compiler.webpack
    const { ConcatSource } = sources
    // react
    const twPatcher = createTailwindcssPatcher()
    function getClassSet() {
      return twPatcher.getClassSet()
    }

    const WeappTwRuntimeAopLoader = createLoader(
      function (content: string) {
        // for cache merge
        getClassSet()
        return content
      },
      {
        ident: runtimeAopLoader
      }
    )
    onLoad()
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
        const idx = module.loaders.findIndex((x) => x.loader.includes('postcss-loader'))
        // // css
        if (idx > -1) {
          // for aop
          // @ts-ignore
          module.loaders.unshift(WeappTwRuntimeAopLoader)
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
          // 再次 build 不转化的原因是此时 set.size 为0
          // 也就是说当开启缓存的时候没有触发 postcss,导致 tailwindcss 并没有触发
          const runtimeSet = getClassSet()
          setMangleRuntimeSet(runtimeSet)
          if (Array.isArray(groupedEntries.html)) {
            for (let i = 0; i < groupedEntries.html.length; i++) {
              const [file, originalSource] = groupedEntries.html[i]

              const rawSource = originalSource.source().toString()

              const wxml = templeteHandler(rawSource, {
                runtimeSet
              })
              const source = new ConcatSource(wxml)
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, wxml)
            }
          }

          if (Array.isArray(groupedEntries.js)) {
            for (let i = 0; i < groupedEntries.js.length; i++) {
              const [file, originalSource] = groupedEntries.js[i]

              const rawSource = originalSource.source().toString()
              const { code } = jsHandler(rawSource, runtimeSet)
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
                isMainChunk: mainCssChunkMatcher(file, this.appType)
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
