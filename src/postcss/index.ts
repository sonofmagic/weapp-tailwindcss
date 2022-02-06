import postcss from 'postcss'
import { mpRulePreflight, mpAtRulePreflight } from './mp'

const isMp = true
export function styleHandler (rawSource: string) {
  const root = postcss.parse(rawSource)
  root.walk((node, idx) => {
    if (node.type === 'rule') {
      if (isMp) {
        // 引用传递
        mpRulePreflight(node)
      }
    } else if (node.type === 'atrule') {
      if (isMp) {
        mpAtRulePreflight(node)
      }
    }
    // 顺其自然
    // else if (node.type === 'comment') {
    //   node.remove()
    // }
  })
  return root.toString()
}
