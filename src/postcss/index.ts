import postcss from 'postcss'
import type { StyleHandlerOptions } from '@/types'
import { mpRulePreflight, commonChunkPreflight } from './mp'

// mpAtRulePreflight
const isMp = true
export function styleHandler (rawSource: string, options: StyleHandlerOptions) {
  const root = postcss.parse(rawSource)
  const { cssInjectPreflight, isMainChunk, customRuleCallback } = options
  const flag = typeof customRuleCallback === 'function'
  root.walk((node, idx) => {
    if (node.type === 'rule') {
      if (isMp) {
        // 引用传递
        // uni-app common-> main.wxss
        // taro app.wxss
        if (isMainChunk) {
          commonChunkPreflight(node, cssInjectPreflight)
        }
        mpRulePreflight(node)

        flag &&
          customRuleCallback(node, {
            cssInjectPreflight,
            isMainChunk
          })
      }
    }
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
