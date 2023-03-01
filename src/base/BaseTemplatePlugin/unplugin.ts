import type { UserDefinedOptions, AppType, InternalUserDefinedOptions } from '@/types'
import { createUnplugin } from 'unplugin'
import { getOptions } from '@/defaults'
import { pluginName } from '@/constants'
import { getGroupedEntries } from '@/base/shared'
import WebpackSources from 'webpack-sources'
export default function WebpackPlugin(options: UserDefinedOptions = {}, appType: AppType) {
  return createUnplugin(() => {
    const ctx: InternalUserDefinedOptions = getOptions(options, ['templete', 'style', 'patch'])
    const { mainCssChunkMatcher, disabled, onLoad, onUpdate, onEnd, onStart, templeteHandler, styleHandler, patch } = ctx

    return {
      name: pluginName,
      webpack(compiler) {
        if (disabled) {
          return
        }
        patch?.()
        onLoad()
        compiler.hooks.emit.tap(pluginName, (compilation) => {
          onStart()
          const entries = Object.entries(compilation.assets)
          const groupedEntries = getGroupedEntries(entries, ctx)
          if (Array.isArray(groupedEntries.html)) {
            for (let i = 0; i < groupedEntries.html.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.html[i]
              const rawSource = originalSource.source().toString()
              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }
              const wxml = templeteHandler(rawSource, {})
              const source = new WebpackSources.ConcatSource(wxml) as any
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, wxml)
            }
          }
          if (Array.isArray(groupedEntries.css)) {
            for (let i = 0; i < groupedEntries.css.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.css[i]
              const rawSource = originalSource.source().toString()
              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }
              const css = styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(file, appType)
                // classGenerator
              })
              const source = new WebpackSources.ConcatSource(css) as any
              compilation.updateAsset(file, source)
              onUpdate(file, rawSource, css)
            }
          }
          onEnd()
        })
      }
    }
  }).webpack()
}
