import type { Plugin } from 'vite'
import type { OutputAsset, OutputChunk } from 'rollup'
import { UserDefinedOptions } from '@/types'
import { getOptions } from '@/options'
import { vitePluginName } from '@/constants'
import { getGroupedEntries } from '@/utils'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'

/**
 * @name UnifiedViteWeappTailwindcssPlugin
 * @description uni-app vite vue3 版本插件
 * @link https://weapp-tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function UnifiedViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin | undefined {
  if (options.customReplaceDictionary === undefined) {
    options.customReplaceDictionary = 'simple'
  }
  const opts = getOptions(options)
  const { disabled, onEnd, onLoad, onStart, onUpdate, templeteHandler, styleHandler, patch, jsHandler, mainCssChunkMatcher, appType, setMangleRuntimeSet } = opts
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
      const runtimeSet = twPatcher.getClassSet()
      setMangleRuntimeSet(runtimeSet)
      if (Array.isArray(groupedEntries.html)) {
        for (let i = 0; i < groupedEntries.html.length; i++) {
          // let classGenerator
          const [file, originalSource] = groupedEntries.html[i] as [string, OutputAsset]
          // if (globalClassGenerator && globalClassGenerator.isFileIncluded(file)) {
          //   classGenerator = globalClassGenerator
          // }
          const oldVal = originalSource.source.toString()
          originalSource.source = templeteHandler(oldVal, {
            runtimeSet
          })
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
        for (let i = 0; i < groupedEntries.js.length; i++) {
          const [file, originalSource] = groupedEntries.js[i] as [string, OutputChunk]
          const rawSource = originalSource.code
          const { code } = jsHandler(rawSource, runtimeSet)
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
