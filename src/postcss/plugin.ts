import type { PluginCreator } from 'postcss'
import type { InternalPostcssOptions, StyleHandlerOptions } from '@/types'
import { transformSync } from './selectorParser'
// import { getOptions } from '../defaults'
import { getOptions } from '@/defaults'
import { commonChunkPreflight } from './mp'
import { createInjectPreflight } from './preflight'
const postcssPlugin = 'postcss-weapp-tailwindcss-rename'

export type PostcssWeappTailwindcssRename = PluginCreator<InternalPostcssOptions>

const plugin: PostcssWeappTailwindcssRename = (options: InternalPostcssOptions = {}) => {
  const mergedOptions = getOptions(options)
  const { cssPreflight, cssPreflightRange, customRuleCallback, replaceUniversalSelectorWith } = mergedOptions
  const cssInjectPreflight = createInjectPreflight(cssPreflight)
  const opts: StyleHandlerOptions = {
    cssInjectPreflight,
    cssPreflightRange,
    isMainChunk: true,
    customRuleCallback,
    replaceUniversalSelectorWith
  }

  // eslint-disable-next-line no-unused-vars
  // const { mainCssChunkMatcher } = getOptions<InternalPostcssOptions>(options)
  return {
    postcssPlugin,
    Once (css) {
      // const source = css.source
      // const filePath = source!.input.file as string
      // // if (mainCssChunkMatcher(filePath)) {
      //   css.walkRules((rule) => {
      //     commonChunkPreflight(rule)
      //   })
      // }
      css.walkRules((rule) => {
        transformSync(rule, opts)
        // mpRulePreflight(rule, opts)
        commonChunkPreflight(rule, opts)
      })
    }
  }
}

plugin.postcss = true

export default plugin // as Plugin
