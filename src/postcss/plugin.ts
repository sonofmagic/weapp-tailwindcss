import type { PluginCreator } from 'postcss'
import type { InternalPostcssOptions } from '../types'
// import { getOptions } from '../defaults'
import { postcssPlugin } from '../shared'
import { mpRulePreflight, commonChunkPreflight } from './mp'
export type PostcssWeappTailwindcssRename = PluginCreator<InternalPostcssOptions>

const plugin: PostcssWeappTailwindcssRename = (options: InternalPostcssOptions = {}) => {
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
        commonChunkPreflight(rule)
        mpRulePreflight(rule)
      })
    }
  }
}

plugin.postcss = true

export default plugin // as Plugin
