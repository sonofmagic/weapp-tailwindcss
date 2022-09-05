import postcss from 'postcss'

import type { StyleHandlerOptions } from '@/types'
import { commonChunkPreflight } from './mp'
import { transformSync } from './selectorParser'
// mpAtRulePreflight
// const isMp = true
export function styleHandler (rawSource: string, options: StyleHandlerOptions) {
  const root = postcss.parse(rawSource)
  const { isMainChunk, customRuleCallback } = options
  const flag = typeof customRuleCallback === 'function'
  root.walk((node, idx) => {
    if (node.type === 'rule') {
      // removeUnsupportedRule(node, options)
      transformSync(node, options)
      // if (isMp) {
      // 先处理工具类
      // mpRulePreflight(node, options)
      // 引用传递
      // uni-app common-> main.wxss
      // taro app.wxss
      // 然后处理主要的 preflight
      if (isMainChunk) {
        commonChunkPreflight(node, options)
      }

      flag && customRuleCallback(node, options)
    }
    // }
    //  else if (node.type === 'atrule') {
    //   if (isMp) {
    //     mpAtRulePreflight(node)
    //   }
    // }
    // 顺其自然
    // else if (node.type === 'comment') {
    //   node.remove()
    // }
  })
  return root.toString()
}
