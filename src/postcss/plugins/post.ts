import type { PluginCreator, Plugin } from 'postcss'
import selectorParser from 'postcss-selector-parser'
import { testIfVariablesScope } from '../mp'
import { VariablesScopeSymbol } from '../symbols'
import type { IStyleHandlerOptions } from '@/types'
import { postcssPlugin } from '@/constants'
export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

const fallback = selectorParser((selectors) => {
  selectors.walk((selector) => {
    if (selector.type === 'universal') {
      selector.parent?.remove()
    }
    if (selector.type === 'pseudo' && selector.value === ':is') {
      selector.parent?.remove()
    }
  })
})

const postcssWeappTailwindcssPostPlugin: PostcssWeappTailwindcssRenamePlugin = (
  options: IStyleHandlerOptions = {
    isMainChunk: true
  }
) => {
  const { customRuleCallback, isMainChunk, ctx } = options
  const p: Plugin = {
    postcssPlugin
  }

  if (isMainChunk) {
    p.OnceExit = (root) => {
      root.walkRules((rule) => {
        if (ctx) {
          if (ctx.variablesScopeWeakMap.get(rule) === VariablesScopeSymbol) {
            fallback.transformSync(rule, {
              updateSelector: true,
              lossless: false
            })
          }
        } else if (testIfVariablesScope(rule)) {
          fallback.transformSync(rule, {
            updateSelector: true,
            lossless: false
          })
        }
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
