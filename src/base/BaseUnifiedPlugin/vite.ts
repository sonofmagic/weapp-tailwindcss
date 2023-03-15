import type { Plugin } from 'vite'
import { UserDefinedOptions } from '@/types'
import { getOptions } from '@/defaults'
import type { OutputAsset } from 'rollup'
import { vitePluginName } from '@/constants'
import { getGroupedEntries } from '@/base/shared'
import { getClassCacheSet } from '@/tailwindcss/exposeContext'

// issue 一个节点静态，一个节点动态，动态节点中的静态属性不会被 mangle 导致存在问题

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/3
export default function UnifiedViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin | undefined {
  const opts = getOptions(options, ['patch', 'style', 'templete', 'js'])
  const { disabled, onEnd, onLoad, onStart, onUpdate, templeteHandler, styleHandler, patch, jsHandler } = opts
  if (disabled) {
    return
  }
  patch?.()

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
      if (Array.isArray(groupedEntries.js)) {
        const set = getClassCacheSet()

        for (let i = 0; i < groupedEntries.js.length; i++) {
          const [file, originalSource] = groupedEntries.js[i]
          const rawSource = originalSource.source.toString()
          const { code } = jsHandler(rawSource, set)
          originalSource.source = code
          onUpdate(file, rawSource, code)
        }
      }
    },
    buildEnd() {
      onEnd()
    }
  }
}
