import type { Node, Pseudo, Selector } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../../types'
import type { TransformContext } from './types'
import { isUniAppXEnabled } from '../../compat/uni-app-x'
import { transformSpacingSelector } from '../spacing'

const RTL_LANGUAGE_ANY_PSEUDO_SET = new Set([
  ':-moz-any',
  ':-webkit-any',
  ':lang',
])

const EMPTY_FUNCTIONAL_PSEUDO_CLEANUP_SET = new Set([
  ':not',
  ':is',
  ':where',
  ':has',
  ':matches',
  ':-webkit-any',
  ':-moz-any',
  ':lang',
])

const UNSUPPORTED_PSEUDO_ELEMENT_SELECTOR_SET = new Set([
  ':after',
  ':before',
  '::after',
  '::before',
  '::backdrop',
  '::-ms-backdrop',
  '::-webkit-backdrop',
  '::file-selector-button',
])

const MINI_PROGRAM_UNSUPPORTED_PSEUDO_ELEMENT_SELECTOR_SET = new Set([
  '::backdrop',
  '::-ms-backdrop',
  '::-webkit-backdrop',
  '::file-selector-button',
])

const NORMALIZED_PSEUDO_ELEMENT_SELECTOR = new Map([
  [':before', '::before'],
  [':after', '::after'],
])

function isRtlLanguageAnyPseudo(node: Node): node is Pseudo {
  return node.type === 'pseudo' && RTL_LANGUAGE_ANY_PSEUDO_SET.has(node.value)
}

function getTopLevelSelector(node: Selector): Selector {
  let current: Node = node
  let topLevel: Selector = node

  while (current.parent) {
    const parent = current.parent
    if (parent.type === 'root') {
      break
    }
    if (parent.type === 'selector') {
      topLevel = parent
    }
    current = parent
  }

  return topLevel
}

function stripUnsupportedRtlLanguagePseudo(node: Pseudo) {
  const selectorParent = node.parent
  if (!selectorParent || selectorParent.type !== 'selector') {
    return
  }

  const maybeNot = selectorParent.parent
  // Tailwind v4 会生成 :not(:-moz-any(:lang(...))) / :not(:-webkit-any(:lang(...)))
  // 这里保留主体选择器，去掉方向条件。
  if (maybeNot && maybeNot.type === 'pseudo' && maybeNot.value === ':not') {
    maybeNot.remove()
    return
  }

  // 纯 RTL 分支（如 :...any(:lang(...))）直接移除，避免微信端不支持伪类报错。
  getTopLevelSelector(selectorParent).remove()
}

export function shouldRemoveEmptyFunctionalPseudo(node: Node): node is Pseudo {
  return (
    node.type === 'pseudo'
    && EMPTY_FUNCTIONAL_PSEUDO_CLEANUP_SET.has(node.value)
    && Array.isArray(node.nodes)
    && node.nodes.length === 0
  )
}

function flattenWherePseudo(node: Pseudo, context: TransformContext, index: number, parent: Selector | undefined) {
  if (isUniAppXEnabled(context.options)) {
    node.value = ':is'
  }

  if (index === 0 && node.length === 1) {
    const targetSelector = node.nodes?.[0]
    if (targetSelector && targetSelector.type === 'selector' && transformSpacingSelector(targetSelector.nodes, context.options)) {
      context.requiresSpacingNormalization = true
    }
    node.replaceWith(...node.nodes)
    if (parent && parent.type === 'selector' && parent.length === 0) {
      parent.remove()
    }
  }
}

export function shouldRemoveUnsupportedPseudoElementSelector(selector: Selector, options: IStyleHandlerOptions) {
  if (!isUniAppXEnabled(options)) {
    return selector.nodes.some(node =>
      node.type === 'pseudo' && MINI_PROGRAM_UNSUPPORTED_PSEUDO_ELEMENT_SELECTOR_SET.has(node.value))
  }

  return selector.nodes.some(node => node.type === 'pseudo' && UNSUPPORTED_PSEUDO_ELEMENT_SELECTOR_SET.has(node.value))
}

export function handlePseudoNode(node: Node, index: number, context: TransformContext, parent: Selector | undefined) {
  if (node.type !== 'pseudo') {
    return
  }

  if (isRtlLanguageAnyPseudo(node)) {
    stripUnsupportedRtlLanguagePseudo(node)
    return
  }

  if (node.value === ':root' && context.rootReplacement) {
    node.value = context.rootReplacement
    return
  }

  const normalizedPseudoElement = NORMALIZED_PSEUDO_ELEMENT_SELECTOR.get(node.value)
  if (normalizedPseudoElement) {
    node.value = normalizedPseudoElement
    return
  }

  if (node.value === ':where') {
    flattenWherePseudo(node, context, index, parent)
  }
}
