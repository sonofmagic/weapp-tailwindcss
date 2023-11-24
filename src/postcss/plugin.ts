import type { PluginCreator, Plugin, AtRule } from 'postcss'
import { transformSync } from './selectorParser'
import { commonChunkPreflight } from './mp'
import type { IStyleHandlerOptions } from '@/types'
import { postcssPlugin } from '@/constants'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

function isAtMediaHover(atRule: AtRule) {
  return /media\(\s*hover\s*:\s*hover\s*\)/.test(atRule.name) || (atRule.name === 'media' && /\(\s*hover\s*:\s*hover\s*\)/.test(atRule.params))
}

const postcssWeappTailwindcss: PostcssWeappTailwindcssRenamePlugin = (
  options: IStyleHandlerOptions = {
    isMainChunk: true
  }
) => {
  const { customRuleCallback, isMainChunk } = options

  const isCustomRuleCallbackFn = typeof customRuleCallback === 'function'
  return {
    postcssPlugin,
    Once(css) {
      css.walkRules((rule) => {
        transformSync(rule, options)
        isMainChunk && commonChunkPreflight(rule, options)
        isCustomRuleCallbackFn && customRuleCallback(rule, options)
      })
    },
    AtRule(atRule) {
      if (isAtMediaHover(atRule)) {
        atRule.before(atRule.nodes)
        atRule.remove()
      }
    }
  } as Plugin
}

postcssWeappTailwindcss.postcss = true

export { postcssWeappTailwindcss }

export { default as postcssIsPseudoClass } from '@csstools/postcss-is-pseudo-class'
