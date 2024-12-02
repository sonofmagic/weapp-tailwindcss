import type { PluginCreator } from 'postcss'
import type { Config } from 'tailwindcss'
import { defu } from 'defu'
import postcss from 'postcss'
// import set from 'set-value'
import tailwindcss from 'tailwindcss'

// function isObject(obj: any): obj is object {
//   return typeof obj === 'object' && obj !== null
// }

// function isTailwindcssConfig(obj: any): obj is Config {
//   return isObject(obj)
// }

type InlineTailwindcssOptions = string | Config | {
  config: string | Config
} | undefined

export interface Options {
  filter: (input?: postcss.Input) => boolean
  config: InlineTailwindcssOptions | ((input?: postcss.Input) => InlineTailwindcssOptions)
  directiveParams: ('base' | 'components' | 'utilities' | 'variants')[]
}

const creator: PluginCreator<Partial<Options>> = (options) => {
  const { config, filter, directiveParams } = defu<Options, Options[]>(options, {
    filter: () => true,
    config: undefined,
    directiveParams: ['utilities'],
  })
  return {
    postcssPlugin: 'postcss-tailwindcss-injector',
    async Once(root, helpers) {
      if (filter(root.source?.input)) {
        let _root = root
        for (const params of directiveParams) {
          const node = root.nodes.find(x => x.type === 'atrule' && x.params === params)
          if (!node) {
            _root = _root.prepend(helpers.atRule({ name: 'tailwind', params }))
          }
        }

        const cfg = typeof config === 'function' ? config(root.source?.input) : config
        // if (isTailwindcssConfig(cfg)) {
        //   if ('config' in cfg) {

        //   }
        //   else {
        //     cfg.content = []
        //   }
        // }
        const { root: newRoot } = await postcss([
          tailwindcss(cfg),
        ]).process(_root)

        root.replaceWith(newRoot)
      }
    },
  }
}
creator.postcss = true

export default creator
