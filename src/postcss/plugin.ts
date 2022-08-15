import type { PluginCreator } from 'postcss'
import type { InternalPostcssOptions, StyleHandlerOptions } from '@/types'
import { transformSync } from './selectorParser'
// import { getOptions } from '../defaults'
import { getOptions } from '@/defaults'
import { commonChunkPreflight, removeUnsupportedRule, mpRulePreflight } from './mp'
import { createInjectPreflight } from './preflight'
const postcssPlugin = 'postcss-weapp-tailwindcss-rename'

export type PostcssWeappTailwindcssRename = PluginCreator<InternalPostcssOptions>

const plugin: PostcssWeappTailwindcssRename = (options: InternalPostcssOptions = {}) => {
  const { cssPreflight, cssPreflightRange, customRuleCallback } = getOptions(options)
  const cssInjectPreflight = createInjectPreflight(cssPreflight)
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
        removeUnsupportedRule(rule)
        transformSync(rule, options as StyleHandlerOptions)
        mpRulePreflight(rule)
        commonChunkPreflight(rule, {
          cssInjectPreflight,
          cssPreflightRange,
          isMainChunk: true,
          customRuleCallback
        })
      })
    }
  }
}

plugin.postcss = true

export default plugin // as Plugin
