import type { Plugin } from 'vite'
import { UserDefinedOptions } from '@/types'
import { getOptions } from '@/defaults'
import type { OutputAsset } from 'rollup'
import { vitePluginName } from '@/constants'
// import type { Plugin as PostcssPlugin } from 'postcss'
import { getGroupedEntries } from '@/base/shared'
import { createUnplugin } from 'unplugin'
// import ClassGenerator from '@/mangle/classGenerator'

// function isRegisterPostcssPlugin(name: string) {
//   return ['postcss-windicss', 'tailwindcss'].includes(name)
// }
// issue 一个节点静态，一个节点动态，动态节点中的静态属性不会被 mangle 导致存在问题

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/3
export function ViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin | undefined {
  const opts = getOptions(options, ['patch', 'style', 'templete'])
  const { disabled, onEnd, onLoad, onStart, onUpdate, templeteHandler, styleHandler, patch } = opts
  if (disabled) {
    return
  }
  patch?.()
  // let globalClassGenerator: ClassGenerator | undefined
  // if (mangle) {
  //   globalClassGenerator = new ClassGenerator(mangle as IMangleOptions)
  // }
  // const cssInjectPreflight = createInjectPreflight(cssPreflight)
  onLoad()
  // 要在 vite:css 处理之前运行
  return {
    name: vitePluginName,
    enforce: 'post',
    buildStart() {
      onStart()
    },
    // configResolved(config) {
    //   // const postcssConfig = config.css?.postcss as {
    //   //   plugins: PostcssPlugin[]
    //   // }
    //   // const tailwindcssIdx = postcssConfig.plugins.findIndex((x) => isRegisterPostcssPlugin(x.postcssPlugin))
    //   // if (tailwindcssIdx === -1) {
    //   //   console.warn('请先安装 tailwindcss! `npm i -D tailwindcss / yarn add -D tailwindcss `')
    //   // }
    //   // const postcssIdx = postcssConfig.plugins.findIndex((x) => x.postcssPlugin === postcssPlugin)
    //   // if (postcssIdx === -1) {
    //   //   postcssConfig.plugins.splice(
    //   //     tailwindcssIdx + 1,
    //   //     0,
    //   //     WeappTailwindcssRenamePlugin({
    //   //       cssMatcher,
    //   //       cssPreflight,
    //   //       mainCssChunkMatcher,
    //   //       replaceUniversalSelectorWith,
    //   //       cssPreflightRange,
    //   //       customRuleCallback
    //   //       // classGenerator
    //   //     }) as PostcssPlugin
    //   //   )
    //   // }
    // },
    // renderChunk (code, chunk, options) {
    //   return code
    // },
    // transform (code, id, options) {
    //   return code
    // },
    generateBundle(opt, bundle, isWrite) {
      // 也许应该都在这里处理
      const entries = Object.entries(bundle).filter(([, s]) => s.type === 'asset') as [string, OutputAsset][]
      const groupedEntries = getGroupedEntries(entries, opts)
      if (Array.isArray(groupedEntries.html)) {
        for (let i = 0; i < groupedEntries.html.length; i++) {
          // let classGenerator
          const [file, originalSource] = groupedEntries.html[i]
          // if (globalClassGenerator && globalClassGenerator.isFileIncluded(file)) {
          //   classGenerator = globalClassGenerator
          // }
          const oldVal = originalSource.source.toString()
          originalSource.source = templeteHandler(oldVal)
          onUpdate(file, oldVal, originalSource.source)
        }
      }
      if (Array.isArray(groupedEntries.css)) {
        for (let i = 0; i < groupedEntries.css.length; i++) {
          // let classGenerator
          const [file, originalSource] = groupedEntries.css[i]
          // if (globalClassGenerator && globalClassGenerator.isFileIncluded(file)) {
          //   classGenerator = globalClassGenerator
          // }
          const rawSource = originalSource.source.toString()
          const css = styleHandler(rawSource, {
            isMainChunk: true
            // classGenerator
          })
          originalSource.source = css
          onUpdate(file, rawSource, css)
        }
      }
    },
    buildEnd() {
      onEnd()
    }
  }
}

export function VitePlugin(options: UserDefinedOptions = {}) {
  return createUnplugin(() => {
    const opts = getOptions(options, ['patch', 'style', 'templete'])
    const { disabled, onEnd, onLoad, onStart, onUpdate, templeteHandler, styleHandler, patch } = opts
    if (disabled) {
      return {
        name: vitePluginName
      }
    }
    patch?.()
    // let globalClassGenerator: ClassGenerator | undefined
    // if (mangle) {
    //   globalClassGenerator = new ClassGenerator(mangle as IMangleOptions)
    // }
    // const cssInjectPreflight = createInjectPreflight(cssPreflight)
    onLoad()
    // 要在 vite:css 处理之前运行
    return {
      name: vitePluginName,
      vite: {
        name: vitePluginName,
        enforce: 'post',
        buildStart() {
          onStart()
        },
        generateBundle(opt, bundle, isWrite) {
          // 也许应该都在这里处理
          const entries = Object.entries(bundle).filter(([, s]) => s.type === 'asset') as [string, OutputAsset][]
          const groupedEntries = getGroupedEntries(entries, opts)
          if (Array.isArray(groupedEntries.html)) {
            for (let i = 0; i < groupedEntries.html.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.html[i]
              // if (globalClassGenerator && globalClassGenerator.isFileIncluded(file)) {
              //   classGenerator = globalClassGenerator
              // }
              const oldVal = originalSource.source.toString()
              originalSource.source = templeteHandler(oldVal)
              onUpdate(file, oldVal, originalSource.source)
            }
          }
          if (Array.isArray(groupedEntries.css)) {
            for (let i = 0; i < groupedEntries.css.length; i++) {
              // let classGenerator
              const [file, originalSource] = groupedEntries.css[i]
              // if (globalClassGenerator && globalClassGenerator.isFileIncluded(file)) {
              //   classGenerator = globalClassGenerator
              // }
              const rawSource = originalSource.source.toString()
              const css = styleHandler(rawSource, {
                isMainChunk: true
                // classGenerator
              })
              originalSource.source = css
              onUpdate(file, rawSource, css)
            }
          }
        },
        buildEnd() {
          onEnd()
        }
      }
    }
  }).vite()
}
