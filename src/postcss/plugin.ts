import type { PluginCreator } from 'postcss'
import type { InternalPostcssOptions } from '../types'
import { getOptions } from '../defaults'
import { postcssPlugin } from '../shared'
export type PostcssWeappTailwindcssRename = PluginCreator<InternalPostcssOptions>

const plugin: PostcssWeappTailwindcssRename = (options: InternalPostcssOptions = {}) => {
  // eslint-disable-next-line no-unused-vars
  const opts = getOptions<InternalPostcssOptions>(options)
  return {
    postcssPlugin,
    Once (root, helper) {
      console.log(root, helper)
    }
  }
}

plugin.postcss = true

export default plugin // as Plugin
