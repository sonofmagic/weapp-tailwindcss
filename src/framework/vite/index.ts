import type { Plugin } from 'vite'
import { UserDefinedOptions } from '@/types'
import { getOptions } from '@/defaults'
import { templeteHandler } from '@/wxml'
import WeappTailwindcssRenamePlugin from '@/postcss/plugin'
import { postcssPlugin } from '@/postcss/shared'
import type { Plugin as PostcssPlugin } from 'postcss'

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/3
export default function ViteWeappTailwindcssPlugin (options: UserDefinedOptions = {}): Plugin | undefined {
  const {
    htmlMatcher,
    cssMatcher,
    mainCssChunkMatcher,
    disabled,
    cssPreflight,
    replaceUniversalSelectorWith,
    cssPreflightRange,
    customRuleCallback,
    onEnd,
    onLoad,
    onStart,
    onUpdate
  } = getOptions(options)

  if (disabled) {
    return
  }
  onLoad()
  return {
    name: 'vite-plugin-uni-app-weapp-tailwindcss-adaptor',
    buildStart () {
      onStart()
    },
    configResolved (config) {
      const postcssConfig = config.css?.postcss as {
        plugins: PostcssPlugin[]
      }
      const tailwindcssIdx = postcssConfig.plugins.findIndex((x) => x.postcssPlugin === 'tailwindcss')
      if (tailwindcssIdx === -1) {
        console.warn('请先安装 tailwindcss! `npm i -D tailwindcss / yarn add -D tailwindcss `')
      }
      const postcssIdx = postcssConfig.plugins.findIndex((x) => x.postcssPlugin === postcssPlugin)
      if (postcssIdx === -1) {
        postcssConfig.plugins.splice(
          tailwindcssIdx + 1,
          0,
          WeappTailwindcssRenamePlugin({
            cssMatcher,
            cssPreflight,
            mainCssChunkMatcher,
            replaceUniversalSelectorWith,
            cssPreflightRange,
            customRuleCallback
          }) as PostcssPlugin
        )
      }
    },
    generateBundle (opt, bundle, isWrite) {
      const entries = Object.entries(bundle)
      for (let i = 0; i < entries.length; i++) {
        const [file, originalSource] = entries[i]
        if (htmlMatcher(file)) {
          if (originalSource.type === 'asset') {
            const oldVal = originalSource.source.toString()
            originalSource.source = templeteHandler(oldVal)
            onUpdate(file, oldVal, originalSource.source)
          }
        }
      }
    },
    buildEnd () {
      onEnd()
    }
  }
}
