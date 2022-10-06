import postcss from 'postcss'
import type { StyleHandlerOptions } from '@/types'
import { commonChunkPreflight } from './mp'
import { transformSync } from './selectorParser'
import { defu } from '@/shared'

export function styleHandler (rawSource: string, options: StyleHandlerOptions) {
  const root = postcss.parse(rawSource)
  const { isMainChunk, customRuleCallback } = options
  const flag = typeof customRuleCallback === 'function'
  root.walk((node) => {
    if (node.type === 'rule') {
      transformSync(node, options)

      if (isMainChunk) {
        commonChunkPreflight(node, options)
      }

      flag && customRuleCallback(node, options)
    }
  })
  return root.toString()
}

export function createStyleHandler (options: Partial<StyleHandlerOptions>) {
  return (rawSource: string, opt: StyleHandlerOptions) => {
    return styleHandler(rawSource, defu<StyleHandlerOptions, Partial<StyleHandlerOptions>[]>(opt, options))
  }
}
