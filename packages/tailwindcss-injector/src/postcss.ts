import type { PluginCreator } from 'postcss'
import type { Config } from 'tailwindcss'
import { defu } from 'defu'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'

type InlineTailwindcssOptions = string | Config | {
  config: string | Config
} | undefined

export interface Options {
  filter: (input?: postcss.Input) => boolean
  config: InlineTailwindcssOptions | ((input?: postcss.Input) => InlineTailwindcssOptions)
}

const creator: PluginCreator<Partial<Options>> = (options) => {
  const { config, filter } = defu<Options, Options[]>(options, {
    filter: () => true,
    config: undefined,
  })
  return {
    postcssPlugin: 'postcss-tailwindcss-injector',
    async Once(root) {
      if (filter(root.source?.input)) {
        const cfg = typeof config === 'function' ? config(root.source?.input) : config
        const { root: newRoot } = await postcss([
          tailwindcss(cfg),
        ]).process(root)
        root.replaceWith(newRoot)
      }
    },
  }
}
creator.postcss = true

export default creator
