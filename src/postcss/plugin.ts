import type { PluginCreator, Plugin } from 'postcss'
import type { InternalPostcssOptions, IStyleHandlerOptions } from '@/types'
import { transformSync } from './selectorParser'
import { getOptions } from '@/defaults'
import { commonChunkPreflight } from './mp'
import { createInjectPreflight } from './preflight'
import { postcssPlugin } from '@/constants'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<InternalPostcssOptions>

const plugin: PostcssWeappTailwindcssRenamePlugin = (options: InternalPostcssOptions = {}) => {
  const mergedOptions = getOptions(options)
  const { classGenerator } = options
  const { cssPreflight, cssPreflightRange, customRuleCallback, replaceUniversalSelectorWith } = mergedOptions
  const cssInjectPreflight = createInjectPreflight(cssPreflight)
  const opts: IStyleHandlerOptions = {
    cssInjectPreflight,
    cssPreflightRange,
    isMainChunk: true,
    customRuleCallback,
    replaceUniversalSelectorWith,
    classGenerator
  }

  return {
    postcssPlugin,
    Once (css) {
      css.walkRules((rule) => {
        transformSync(rule, opts)
        commonChunkPreflight(rule, opts)
      })
    }
  } as Plugin
}

plugin.postcss = true

export default plugin // as Plugin
