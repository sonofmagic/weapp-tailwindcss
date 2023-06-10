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

export { postcssWeappTailwindcss }

export { default as postcssIsPseudoClass } from '@csstools/postcss-is-pseudo-class'
