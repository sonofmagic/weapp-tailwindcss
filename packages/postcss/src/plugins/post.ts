import type { Plugin, PluginCreator } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defu } from '@weapp-tailwindcss/shared'
import { postcssPlugin } from '../constants'
import { getFallbackRemove } from '../selectorParser'
// import valueParser from 'postcss-value-parser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>
// tailwindcss@4
const OklabSuffix = 'in oklab'

const postcssWeappTailwindcssPostPlugin: PostcssWeappTailwindcssRenamePlugin = (
  options,
) => {
  const opts = defu(options, {
    isMainChunk: true,
  })
  const p: Plugin = {
    postcssPlugin,
  }

  if (opts.isMainChunk) {
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
          // if (opts.uniAppX && decl.prop.startsWith('--')) {
          //   decl.remove()
          // }
          // else
          if (decl.prop === '--tw-gradient-position' && decl.value.endsWith(OklabSuffix)) {
            decl.value = decl.value.slice(0, decl.value.length - OklabSuffix.length)
          }
          else if (/calc\(\s*infinity\s*\*\s*1px/.test(decl.value)) {
            decl.value = '9999px'
          }
        })
        if (opts.uniAppX) {
          if (rule.nodes.length === 0) {
            rule.remove()
          }
        }
      })
      root.walkAtRules((atRule) => {
        if (opts.cssRemoveProperty && atRule.name === 'property') {
          atRule.remove()
        }
        atRule.nodes?.length === 0 && atRule.remove()
      })
    }
  }
  if (typeof opts.customRuleCallback === 'function') {
    p.Rule = (rule) => {
      opts.customRuleCallback?.(rule, opts)
    }
  }
  return p
}

postcssWeappTailwindcssPostPlugin.postcss = true

export { postcssWeappTailwindcssPostPlugin }
