import type { AtRule, Plugin, PluginCreator } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { postcssPlugin } from '../constants'
import { commonChunkPreflight } from '../mp'
import { ruleTransformSync } from '../selectorParser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

function isAtMediaHover(atRule: AtRule) {
  return (
    /media\(\s*hover\s*:\s*hover\s*\)/.test(atRule.name)
    || (atRule.name === 'media' && /\(\s*hover\s*:\s*hover\s*\)/.test(atRule.params))
  )
}

const postcssWeappTailwindcssPrePlugin: PostcssWeappTailwindcssRenamePlugin = (
  options,
) => {
  const opts = defu(options, { isMainChunk: true })

  const p: Plugin = {
    postcssPlugin,
    Rule(rule) {
      ruleTransformSync(rule, opts)
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
  if (opts.isMainChunk) {
    p.Once = (root) => {
      root.walkRules((rule) => {
        commonChunkPreflight(rule, opts)
      })
    }
  }
  return p
}

postcssWeappTailwindcssPrePlugin.postcss = true

export { postcssWeappTailwindcssPrePlugin }
