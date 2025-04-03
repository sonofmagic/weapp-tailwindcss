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

// @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
//   @layer base {
//     *, :before, :after, ::backdrop {
//       --tw-font-weight: initial;
//     }
//   }
// }

const TAILWIND_V4_MODERN_REGEX = /^\(\(-webkit-hyphens:\s*none\)\s+and\s+\(not\s+\(margin-trim:\s*inline\)\)\)\s+or\s+\(\(-moz-orient:\s*inline\)\s+and\s+\(not\s+\(color:\s*rgb\(from\s+red\s+r\s+g\s+b\)\)\)\)$/

function isTailwindcssV4ModernCheck(atRule: AtRule) {
  return atRule.name === 'supports' && TAILWIND_V4_MODERN_REGEX.test(atRule.params)
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
      // Tailwindcss V4.1.1
      else if (isTailwindcssV4ModernCheck(atRule)) {
        if (atRule.first?.type === 'atrule' && atRule.first.name === 'layer') {
          atRule.replaceWith(atRule.first.nodes)
        }
        //
        // atRule.remove()
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
