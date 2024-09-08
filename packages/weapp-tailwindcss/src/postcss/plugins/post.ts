import type { Plugin, PluginCreator } from 'postcss'
import { postcssPlugin } from '../../constants'
import { testIfVariablesScope } from '../mp'
import { fallbackRemove } from '../selectorParser'
import type { IStyleHandlerOptions } from '../../types'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

const postcssWeappTailwindcssPostPlugin: PostcssWeappTailwindcssRenamePlugin = (
  options: IStyleHandlerOptions = {
    isMainChunk: true,
  },
) => {
  const { customRuleCallback, isMainChunk, ctx } = options
  const p: Plugin = {
    postcssPlugin,
  }

  if (isMainChunk) {
    p.OnceExit = (root) => {
      root.walkRules((rule) => {
        if (ctx) {
          if (ctx.isVariablesScope(rule)) {
            fallbackRemove.transformSync(rule, {
              updateSelector: true,
              lossless: false,
            })
          }
        }
        else if (testIfVariablesScope(rule)) {
          fallbackRemove.transformSync(rule, {
            updateSelector: true,
            lossless: false,
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
