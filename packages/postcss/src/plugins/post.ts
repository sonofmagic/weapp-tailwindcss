import type { Plugin, PluginCreator } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { postcssPlugin } from '../constants'
import { getFallbackRemove } from '../selectorParser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

const OklabSuffix = 'in oklab'

const postcssWeappTailwindcssPostPlugin: PostcssWeappTailwindcssRenamePlugin = (
  options: IStyleHandlerOptions = {
    isMainChunk: true,
  },
) => {
  const { customRuleCallback, isMainChunk } = options
  const p: Plugin = {
    postcssPlugin,
  }

  if (isMainChunk) {
    p.OnceExit = (root) => {
      root.walkRules((rule) => {
        getFallbackRemove(rule).transformSync(rule, {
          updateSelector: true,
          lossless: false,
        })

        if (rule.selectors.length === 0 || (rule.selectors.length === 1 && rule.selector.trim() === '')) {
          rule.remove()
        }
        // tailwindcss v4
        rule.walkDecls((decl) => {
          if (decl.prop === '--tw-gradient-position' && decl.value.endsWith(OklabSuffix)) {
            decl.value = decl.value.slice(0, decl.value.length - OklabSuffix.length)
          }
        })
      })
    }
  }
  if (typeof customRuleCallback === 'function') {
    p.Rule = (rule) => {
      customRuleCallback(rule, options)
    }
  }
  return p
}

postcssWeappTailwindcssPostPlugin.postcss = true

export { postcssWeappTailwindcssPostPlugin }
