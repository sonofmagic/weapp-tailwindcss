import type { Plugin } from 'vite'
import { UserDefinedOptions } from '../types'
import { getOptions } from '../shared'
import { templeteHandler } from '../wxml'
import postcssPlugin from '../postcss/plugin'
import type { Plugin as PostcssPlugin } from 'postcss'

export function ViteWeappTailwindcssPlugin (options: UserDefinedOptions = {}): Plugin {
  const { htmlMatcher, cssMatcher, mainCssChunkMatcher } = getOptions(options)

  return {
    name: 'vite-plugin-uni-app-weapp-tailwindcss',
    config (config) {
      // add a postcss8 plugin
      const postcssOptions = config.css?.postcss
      if (typeof postcssOptions !== 'string') {
        postcssOptions?.plugins?.push(
          postcssPlugin({
            cssMatcher,
            mainCssChunkMatcher
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
            originalSource.source = templeteHandler(originalSource.source.toString())
          }
        }
      }
    }
  }
}
