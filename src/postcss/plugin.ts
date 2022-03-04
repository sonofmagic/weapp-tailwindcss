import type { PluginCreator } from 'postcss'
import type { InternalPostcssOptions } from '../types'
// import { getOptions } from '../defaults'
import { postcssPlugin, getOptions } from '../shared'
import { mpRulePreflight, commonChunkPreflight } from './mp'
import { createInjectPreflight } from './preflight'

export type PostcssWeappTailwindcssRename = PluginCreator<InternalPostcssOptions>

const plugin: PostcssWeappTailwindcssRename = (options: InternalPostcssOptions = {}) => {
  const { cssPreflight } = getOptions(options)
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
        commonChunkPreflight(rule, cssInjectPreflight)
        mpRulePreflight(rule)
      })
    }
  }
}

plugin.postcss = true

export default plugin // as Plugin
