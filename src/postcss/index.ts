import postcss from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import { commonChunkPreflight } from './mp'
import { transformSync } from './selectorParser'
import { defu } from '@/utils'

export function styleHandler (rawSource: string, options: IStyleHandlerOptions) {
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

export function createStyleHandler (options: Partial<IStyleHandlerOptions>) {
  return (rawSource: string, opt: IStyleHandlerOptions) => {
    return styleHandler(rawSource, defu<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(opt, options))
  }
}
