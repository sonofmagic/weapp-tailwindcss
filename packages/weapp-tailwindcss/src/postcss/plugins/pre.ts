import type { AtRule, Plugin, PluginCreator } from 'postcss'
import { ruleTransformSync } from '../selectorParser'
import { commonChunkPreflight } from '../mp'
import type { IStyleHandlerOptions } from '../../types'
import { postcssPlugin } from '../../constants'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

function isAtMediaHover(atRule: AtRule) {
  return (
    /media\(\s*hover\s*:\s*hover\s*\)/.test(atRule.name)
    || (atRule.name === 'media' && /\(\s*hover\s*:\s*hover\s*\)/.test(atRule.params))
  )
}

const postcssWeappTailwindcssPrePlugin: PostcssWeappTailwindcssRenamePlugin = (
  options: IStyleHandlerOptions = {
    isMainChunk: true,
  },
) => {
  const { isMainChunk } = options
  const p: Plugin = {
    postcssPlugin,
    Rule(rule) {
      ruleTransformSync(rule, options)
    },
    AtRule(atRule) {
      if (isAtMediaHover(atRule)) {
        if (atRule.nodes) {
          atRule.replaceWith(atRule.nodes)
        }
        else {
          atRule.remove()
        }
      }
    },
  }
  if (isMainChunk) {
    p.Once = (root) => {
      root.walkRules((rule) => {
        commonChunkPreflight(rule, options)
      })
    }
  }
  return p
}

postcssWeappTailwindcssPrePlugin.postcss = true

export { postcssWeappTailwindcssPrePlugin }
