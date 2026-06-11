import type { Node, Selector } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../../types'
import type { TransformContext } from './types'
import { stripUnsupportedNodeForUniAppX } from '../../compat/uni-app-x'
import { internalCssSelectorReplacer } from '../../shared'
import { transformSpacingSelector } from '../spacing'
import { getCombinatorSelectorAst } from '../utils'
import { shouldRemoveUnsupportedPseudoElementSelector } from './pseudos'

export function handleClassNode(node: Node, context: TransformContext) {
  if (node.type !== 'class') {
    return
  }
  node.value = context.selectorReplacerOptions === undefined
    ? internalCssSelectorReplacer(node.value)
    : internalCssSelectorReplacer(node.value, context.selectorReplacerOptions)
}

export function handleUniversalNode(node: Node, context: TransformContext) {
  if (node.type !== 'universal') {
    return
  }
  if (context.universalReplacement) {
    node.value = context.universalReplacement
  }
}

function shouldRemoveHoverSelector(selector: Selector, options: IStyleHandlerOptions) {
  if (!options.cssRemoveHoverPseudoClass) {
    return false
  }
  return selector.nodes.some(node => node.type === 'pseudo' && node.value === ':hover')
}

function isHiddenOrTemplateNotPseudo(node?: Node | null) {
  if (!node || node.type !== 'pseudo' || node.value !== ':not') {
    return false
  }

  const selector = node.first
  if (!selector || selector.type !== 'selector') {
    return false
  }

  const first = selector.first
  if (!first) {
    return false
  }

  if (first.type === 'attribute') {
    return first.attribute === 'hidden'
  }

  if (first.type === 'tag') {
    return first.value === 'template'
  }

  return false
}

export function handleCombinatorNode(node: Node, index: number, context: TransformContext) {
  if (node.type !== 'combinator' || node.value !== '>') {
    return
  }

  const nodes = node.parent?.nodes
  if (!nodes) {
    return
  }

  const first = nodes[index + 1]
  const second = nodes[index + 2]
  const third = nodes[index + 3]

  if (
    isHiddenOrTemplateNotPseudo(first)
    && second
    && second.type === 'combinator'
    && (second.value === '~' || second.value === '+')
    && isHiddenOrTemplateNotPseudo(third)
  ) {
    const ast = getCombinatorSelectorAst(context.options)
    nodes.splice(index + 1, 3, ...ast)
  }
}

export function handleTagOrAttribute(node: Node, context: TransformContext) {
  stripUnsupportedNodeForUniAppX(node, context.options)
}

export function handleSelectorNode(selector: Selector, context: TransformContext) {
  if (shouldRemoveUnsupportedPseudoElementSelector(selector, context.options)) {
    selector.remove()
    return
  }

  if (shouldRemoveHoverSelector(selector, context.options)) {
    selector.remove()
    return
  }

  if (transformSpacingSelector(selector.nodes, context.options)) {
    context.requiresSpacingNormalization = true
  }
}
