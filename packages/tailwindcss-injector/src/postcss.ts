import type { PluginCreator } from 'postcss'
import type { Config } from 'tailwindcss'
import type { Options } from './types'
import process from 'node:process'
import { defu } from 'defu'
import postcss from 'postcss'
import set from 'set-value'
import tailwindcss from 'tailwindcss'
import { loadConfig } from './config'
import { removeFileExtension } from './utils'
// function isObject(obj: any): obj is object {
//   return typeof obj === 'object' && obj !== null
// }
export type {
  Options,
}

const creator: PluginCreator<Partial<Options>> = (options) => {
  const { config, filter, directiveParams, cwd, extensions } = defu<Options, Options[]>(options, {
    filter: () => true,
    config: undefined,
    directiveParams: ['utilities'],
    cwd: process.cwd(),
    extensions: ['wxml', 'js', 'ts'],
  })

  const extensionsGlob = `{${extensions.join(',')}}`

  return {
    postcssPlugin: 'postcss-tailwindcss-injector',
    plugins: [
      {
        postcssPlugin: 'post',
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
            let tailwindcssConfig: Config | undefined
            if (typeof cfg === 'string') {
              tailwindcssConfig = await loadConfig({
                cwd,
                config: cfg,
              })
            }
            else {
              tailwindcssConfig = cfg ?? {
                content: [],
              }
            }

            if (tailwindcssConfig && root.source?.input && root.source.input.file) {
              set(tailwindcssConfig, 'content', [
                `${removeFileExtension(root.source.input.file)}.${extensionsGlob}`,
              ])
            }

            const { root: newRoot } = await postcss([
              tailwindcss(tailwindcssConfig),
            ]).process(_root)

            root.replaceWith(newRoot)
          }
        },
      },
    ],

  }
}
creator.postcss = true

export default creator
