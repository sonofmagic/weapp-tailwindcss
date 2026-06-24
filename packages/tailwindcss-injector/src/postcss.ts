import type { PluginCreator } from 'postcss'
import type { Options } from './types'
import { getConfig } from './config'
import { postcssPlugin } from './constants'
import { regExpTest } from './utils'
import { getDepFiles } from './wxml'

// 辅助函数 isObject（当前未启用）:
// function isObject(obj: any): obj is object {
//   return typeof obj === 'object' && obj !== null
// }
export type {
  Options,
}

const creator: PluginCreator<Partial<Options>> = (options) => {
  const { filter, directiveParams, insertAfterAtRulesNames, insertAfterComments } = getConfig(options)

  return {
    postcssPlugin,
    plugins: [
      {
        postcssPlugin: `${postcssPlugin}:post`,
        async Once(root, helpers) {
          const sourceInput = root.source?.input
          if (filter(sourceInput)) {
            const nodes = root.nodes ?? []
            let atruleAnchorIndex = -1
            let commentAnchorIndex = -1
            const directivePresence = new Set<string>()

            nodes.forEach((node, index) => {
              if (node.type === 'atrule') {
                const nameMatches = insertAfterAtRulesNames.includes(node.name)
                if (nameMatches) {
                  atruleAnchorIndex = Math.max(atruleAnchorIndex, index)
                }
                if (typeof node.params === 'string') {
                  directivePresence.add(node.params)
                }
              }
              else if (node.type === 'comment' && regExpTest(insertAfterComments, node.text)) {
                commentAnchorIndex = Math.max(commentAnchorIndex, index)
              }
            })

            const anchorIndex = Math.max(atruleAnchorIndex, commentAnchorIndex)
            const anchorNode = anchorIndex >= 0 ? nodes[anchorIndex] : undefined
            let lastInserted = anchorNode

            for (const params of directiveParams) {
              if (!directivePresence.has(params)) {
                const atRule = helpers.atRule({ name: 'tailwind', params })
                if (lastInserted) {
                  root.insertAfter(lastInserted, atRule)
                }
                else {
                  root.prepend(atRule)
                }
                lastInserted = atRule
                directivePresence.add(params)
              }
            }

            if (sourceInput?.file) {
              const deps = await getDepFiles(sourceInput.file.replace(/\.[^.]+$/, '.wxml'))
              for (const dep of deps) {
                helpers.result.messages.push({
                  type: 'dependency',
                  plugin: postcssPlugin,
                  file: dep,
                })
              }
            }
          }
        },
      },
    ],
  }
}
creator.postcss = true

export default creator
