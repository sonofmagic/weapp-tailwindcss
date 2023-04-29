import type { Plugin } from 'vite'
import { UserDefinedOptions } from '@/types'
import { getOptions } from '@/options'
import type { OutputAsset, OutputChunk } from 'rollup'
import { vitePluginName } from '@/constants'
// import type { Plugin as PostcssPlugin } from 'postcss'
import { getGroupedEntries } from '@/base/shared'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'

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

export function UnifiedViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin | undefined {
  if (typeof options.customReplaceDictionary === 'undefined') {
    options.customReplaceDictionary = 'simple'
  }
  const opts = getOptions(options, ['patch', 'style', 'templete', 'js'])
  const { disabled, onEnd, onLoad, onStart, onUpdate, templeteHandler, styleHandler, patch, jsHandler, mainCssChunkMatcher, appType } = opts
  if (disabled) {
    return
  }

  patch?.()
  const twPatcher = createTailwindcssPatcher()
  onLoad()
  // 要在 vite:css 处理之前运行
  return {
    name: vitePluginName,
    enforce: 'post',
    buildStart() {
      onStart()
    },
    generateBundle(opt, bundle, isWrite) {
      // 也许应该都在这里处理
      // .filter(([, s]) => s.type === 'asset' || s.type === 'chunk')
      const entries = Object.entries(bundle)
      const groupedEntries = getGroupedEntries(entries, opts)
      if (Array.isArray(groupedEntries.html)) {
        for (let i = 0; i < groupedEntries.html.length; i++) {
          // let classGenerator
          const [file, originalSource] = groupedEntries.html[i] as [string, OutputAsset]
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
          const [file, originalSource] = groupedEntries.css[i] as [string, OutputAsset]
          // if (globalClassGenerator && globalClassGenerator.isFileIncluded(file)) {
          //   classGenerator = globalClassGenerator
          // }
          const rawSource = originalSource.source.toString()
          const css = styleHandler(rawSource, {
            isMainChunk: mainCssChunkMatcher(originalSource.fileName, appType)
            // classGenerator
          })
          originalSource.source = css
          onUpdate(file, rawSource, css)
        }
      }
      if (Array.isArray(groupedEntries.js)) {
        const set = twPatcher.getClassSet()

        for (let i = 0; i < groupedEntries.js.length; i++) {
          const [file, originalSource] = groupedEntries.js[i] as [string, OutputChunk]
          const rawSource = originalSource.code
          const { code } = jsHandler(rawSource, set)
          originalSource.code = code
          onUpdate(file, rawSource, code)
        }
      }
    },
    buildEnd() {
      onEnd()
    }
  }
}
