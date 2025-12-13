import type { Rule } from 'postcss'

/**
 * 判断规则内是否包含一定数量的 Tailwind CSS 变量声明。
 */
export function hasTwVars(rule: Rule, count = 2) {
  let matched = 0

  for (const node of rule.nodes ?? []) {
    if (node.type === 'decl' && node.prop.startsWith('--tw-')) {
      matched++
      if (matched >= count) {
        return true
      }
    }
  }

  return false
}
