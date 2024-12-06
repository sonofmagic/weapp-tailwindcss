import type { PluginCreator } from 'postcss'
import type { Config } from 'tailwindcss'
import type { Options } from './types'
import process from 'node:process'
import postcss from 'postcss'
import set from 'set-value'
import tailwindcss from 'tailwindcss'
import { loadConfig } from 'tailwindcss-config'
import { defuOverrideArray, removeFileExtension } from './utils'
import { getDepFiles } from './wxml'
// function isObject(obj: any): obj is object {
//   return typeof obj === 'object' && obj !== null
// }
export type {
  Options,
}

const creator: PluginCreator<Partial<Options>> = (options) => {
  const { config, filter, directiveParams, cwd, extensions } = defuOverrideArray<Options, Options[]>(options as Options, {
    filter: () => true,
    config: undefined,
    directiveParams: ['utilities', 'components'],
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
              tailwindcssConfig = (cfg ?? {
                content: [],
              }) as Config
            }

            if (tailwindcssConfig && root.source?.input && root.source.input.file) {
              const basename = removeFileExtension(root.source.input.file)
              set(tailwindcssConfig, 'content', [
                `${basename}.${extensionsGlob}`,
              ])

              // 分析模板
              const deps = await getDepFiles(`${basename}.wxml`)
              for (const dep of deps) {
                if (Array.isArray(tailwindcssConfig.content)) {
                  tailwindcssConfig.content.push(`${removeFileExtension(dep)}.${extensionsGlob}`)
                }
              }
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
