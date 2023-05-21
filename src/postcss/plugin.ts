import type { PluginCreator, Plugin } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import { transformSync } from './selectorParser'
import { commonChunkPreflight } from './mp'
import { postcssPlugin } from '@/constants'
import postcssIsPseudoClass from '@csstools/postcss-is-pseudo-class'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<IStyleHandlerOptions>

const postcssWeappTailwindcss: PostcssWeappTailwindcssRenamePlugin = (
  options: IStyleHandlerOptions = {
    isMainChunk: true
  }
) => {
  const { customRuleCallback, isMainChunk } = options

  const flag = typeof customRuleCallback === 'function'
  return {
    postcssPlugin,
    Once(css) {
      css.walkRules((rule) => {
        transformSync(rule, options)
        isMainChunk && commonChunkPreflight(rule, options)
        flag && customRuleCallback(rule, options)
      })
    }
  } as Plugin
}

postcssWeappTailwindcss.postcss = true

export { postcssWeappTailwindcss, postcssIsPseudoClass }
