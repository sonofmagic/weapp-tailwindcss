import type { PluginCreator, Plugin } from 'postcss'
import type { InternalPostcssOptions, StyleHandlerOptions } from '@/types'
import { transformSync } from './selectorParser'
import { getOptions } from '@/defaults'
import { commonChunkPreflight } from './mp'
import { createInjectPreflight } from './preflight'
import { postcssPlugin } from './shared'

export type PostcssWeappTailwindcssRenamePlugin = PluginCreator<InternalPostcssOptions>

const plugin: PostcssWeappTailwindcssRenamePlugin = (options: InternalPostcssOptions = {}) => {
  const mergedOptions = getOptions(options)
  const { classGenerator } = options
  const { cssPreflight, cssPreflightRange, customRuleCallback, replaceUniversalSelectorWith } = mergedOptions
  const cssInjectPreflight = createInjectPreflight(cssPreflight)
  const opts: StyleHandlerOptions = {
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
