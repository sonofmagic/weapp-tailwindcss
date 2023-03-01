import type { UserDefinedOptions, AppType, InternalUserDefinedOptions } from '@/types'
import { createUnplugin } from 'unplugin'
import { getOptions } from '@/defaults'
import { pluginName, NS } from '@/constants'
import { getGroupedEntries } from '@/base/shared'
import path from 'path'
import WebpackSources from 'webpack-sources'
export default function WebpackPlugin(options: UserDefinedOptions = { framework: 'react' }, appType: AppType) {
  return createUnplugin(() => {
    const ctx: InternalUserDefinedOptions = getOptions(options, ['jsx', 'style', 'patch'])
    const { jsMatcher, mainCssChunkMatcher, framework, disabled, onLoad, onUpdate, onEnd, onStart, loaderOptions, styleHandler, jsxHandler, jsxRenameLoaderPath, patch } = ctx

    return {
      name: pluginName,
      webpack(compiler) {
        if (disabled) {
          return
        }
        patch?.()
        // if (mangle) {
        //   this.classGenerator = new ClassGenerator(mangle as IMangleOptions)
        // }

        const isReact = framework === 'react'
        const loader = jsxRenameLoaderPath || path.resolve(__dirname, `${NS}.js`)
        onLoad()

        compiler.hooks.compilation.tap(pluginName, (compilation) => {
          compilation.hooks.normalModuleLoader.tap(pluginName, (loaderContext, module) => {
            // loaderContext[NS] = true
            // @ts-ignore
            if (jsMatcher(module.resource)) {
              // let classGenerator
              // if (this.classGenerator && this.classGenerator.isFileIncluded(module.resource)) {
              //   classGenerator = this.classGenerator
              // }
              // default react

              const rule = {
                loader, // Path to loader
                options: {
                  jsxHandler,
                  // classGenerator,
                  write: loaderOptions.jsxRename
                }
              }
              // @ts-ignore
              module.loaders.unshift(rule)
            }
          })
        })

        compiler.hooks.emit.tap(pluginName, (compilation) => {
          onStart()
          const entries = Object.entries(compilation.assets)
          const groupedEntries = getGroupedEntries(entries, ctx)
          if (!isReact && Array.isArray(groupedEntries.js)) {
            for (let i = 0; i < groupedEntries.js.length; i++) {
              // let classGenerator

              const [file, originalSource] = groupedEntries.js[i]
              // if (this.classGenerator && this.classGenerator.isFileIncluded(file)) {
              //   classGenerator = this.classGenerator
              // }

              const rawSource = originalSource.source().toString()
              const { code } = jsxHandler(rawSource)
              const source = new WebpackSources.ConcatSource(code) as any
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
