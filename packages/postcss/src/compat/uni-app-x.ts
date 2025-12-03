// Uni-app X 兼容性相关的辅助方法，集中复用特殊处理逻辑
import type { Rule } from 'postcss'
import type { Node, Pseudo } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'

export function isUniAppXEnabled(options?: Pick<IStyleHandlerOptions, 'uniAppX'>) {
  return Boolean(options?.uniAppX)
}

export function stripUnsupportedPseudoForUniAppX(node: Pseudo, enabled: boolean) {
  if (!enabled) {
    return
  }
  node.remove()
}

export function stripUnsupportedNodeForUniAppX(
  node: Node,
  options: Pick<IStyleHandlerOptions, 'uniAppX'>,
): boolean {
  if (!isUniAppXEnabled(options)) {
    return false
  }
  if (node.type === 'tag' || node.type === 'attribute' || node.type === 'pseudo') {
    node.remove()
    return true
  }
  return false
}

export function shouldRemoveEmptyRuleForUniAppX(
  rule: Rule,
  options: Pick<IStyleHandlerOptions, 'uniAppX'>,
) {
  return isUniAppXEnabled(options) && rule.nodes.length === 0
}
