import type { PluginCreator, Plugin } from 'postcss'
import { transformSync } from './selectorParser'
import { commonChunkPreflight } from './mp'
import type { IStyleHandlerOptions } from '@/types'
import { postcssPlugin } from '@/constants'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

const postcssWeappTailwindcss: PostcssWeappTailwindcssRenamePlugin = (
  options: IStyleHandlerOptions = {
    isMainChunk: true
  }
) => {
  const { customRuleCallback } = options

  const isCustomRuleCallbackFn = typeof customRuleCallback === 'function'
  return {
    postcssPlugin,
    Once(css) {
      css.walkRules((rule) => {
        transformSync(rule, options)
        commonChunkPreflight(rule, options)
        isCustomRuleCallbackFn && customRuleCallback(rule, options)
      })
    },
    AtRule(atRule) {
      if (atRule.name === 'media' && /\(hover:\s*hover\)/.test(atRule.params)) {
        atRule.before(atRule.nodes)
        atRule.remove()
      }
    }
  } as Plugin
}

postcssWeappTailwindcss.postcss = true

export { postcssWeappTailwindcss }

export { default as postcssIsPseudoClass } from '@csstools/postcss-is-pseudo-class'
