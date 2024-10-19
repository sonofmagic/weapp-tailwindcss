import type { Plugin, PluginCreator } from 'postcss'
import type { IStyleHandlerOptions } from '../../types'
import { postcssPlugin } from '../../constants'
import { fallbackRemove } from '../selectorParser'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

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
        fallbackRemove.transformSync(rule, {
          updateSelector: true,
          lossless: false,
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
