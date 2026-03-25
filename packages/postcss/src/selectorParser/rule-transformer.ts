// selector 规则级处理器，负责重写选择器并规整相关声明
import type { Rule } from 'postcss'
import type { Node, Pseudo, Root, Selector, SyncProcessor } from 'postcss-selector-parser'
import type { InternalCssSelectorReplacerOptions, IStyleHandlerOptions } from '../types'
import psp from 'postcss-selector-parser'
import { isUniAppXEnabled, stripUnsupportedNodeForUniAppX } from '../compat/uni-app-x'
import { composeIsPseudo, internalCssSelectorReplacer } from '../shared'
import {
  isNotLastChildPseudo,
  normalizeSpacingDeclarations,
  transformSpacingSelector,
} from './spacing'
import {
  getCombinatorSelectorAst,
  normalizeTransformOptions,
} from './utils'

export type RuleTransformer = (rule: Rule) => void

const ruleTransformCache = new WeakMap<IStyleHandlerOptions, RuleTransformer>()

const SELECTOR_TRANSFORM_OPTIONS = normalizeTransformOptions()
const SIMPLE_SELECTOR_FAST_PATH = /^[#.][\w-]+(?:\s+[#.][\w-]+)*$/

interface TransformContext {
  rule: Rule
  options: IStyleHandlerOptions
  requiresSpacingNormalization: boolean
  rootReplacement?: string
  universalReplacement?: string
  selectorReplacerOptions?: InternalCssSelectorReplacerOptions
}

interface CachedSelectorTransformResult {
  action: 'keep' | 'update' | 'remove'
  selector?: string
}

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

function shouldRemoveEmptyFunctionalPseudo(node: Node): node is Pseudo {
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

function handleClassNode(node: Node, context: TransformContext) {
  if (node.type !== 'class') {
    return
  }
  node.value = context.selectorReplacerOptions === undefined
    ? internalCssSelectorReplacer(node.value)
    : internalCssSelectorReplacer(node.value, context.selectorReplacerOptions)
}

function handleUniversalNode(node: Node, context: TransformContext) {
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

const UNSUPPORTED_PSEUDO_ELEMENT_SELECTOR_SET = new Set([
  ':after',
  ':before',
  '::after',
  '::before',
  '::backdrop',
  '::file-selector-button',
])

function shouldRemoveUnsupportedPseudoElementSelector(selector: Selector, options: IStyleHandlerOptions) {
  if (!isUniAppXEnabled(options)) {
    return selector.nodes.some(node =>
      node.type === 'pseudo' && (node.value === '::backdrop' || node.value === '::file-selector-button'))
  }

  return selector.nodes.some(node => node.type === 'pseudo' && UNSUPPORTED_PSEUDO_ELEMENT_SELECTOR_SET.has(node.value))
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

function handleCombinatorNode(node: Node, index: number, context: TransformContext) {
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

function handlePseudoNode(node: Node, index: number, context: TransformContext, parent: Selector | undefined) {
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

  if (node.value === ':where') {
    flattenWherePseudo(node, context, index, parent)
  }
}

function handleTagOrAttribute(node: Node, context: TransformContext) {
  stripUnsupportedNodeForUniAppX(node, context.options)
}

function handleSelectorNode(selector: Selector, context: TransformContext) {
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

function canSkipRuleTransform(rule: Rule) {
  const selector = rule.selector.trim()
  if (!selector) {
    return false
  }

  // Fast path: pure #id/.class descendant selectors are already valid in weapp
  // and never require escape/pseudo/combinator rewrites.
  return SIMPLE_SELECTOR_FAST_PATH.test(selector)
}

// transformSelectors 会遍历选择器 AST 并触发各类节点处理逻辑
function transformSelectors(selectors: Root, context: TransformContext) {
  selectors.walk((node, index) => {
    const parent = node.parent?.type === 'selector'
      ? node.parent as Selector
      : undefined

    switch (node.type) {
      case 'class':
        handleClassNode(node, context)
        break
      case 'universal':
        handleUniversalNode(node, context)
        break
      case 'selector':
        handleSelectorNode(node, context)
        break
      case 'pseudo':
        if (!isNotLastChildPseudo(node)) {
          handlePseudoNode(node, index, context, parent)
        }
        break
      case 'combinator':
        handleCombinatorNode(node, index, context)
        break
      case 'tag':
      case 'attribute':
        handleTagOrAttribute(node, context)
        break
      default:
        break
    }
  })

  if (context.requiresSpacingNormalization) {
    normalizeSpacingDeclarations(context.rule)
  }

  selectors.walk((node) => {
    if (shouldRemoveEmptyFunctionalPseudo(node)) {
      node.remove()
      return
    }

    if (node.type === 'selector' && node.length === 0) {
      node.remove()
    }
  })

  if (selectors.length === 0) {
    context.rule.remove()
  }
}

// createRuleTransformer 结合上下文执行器与 parser，生成可复用的规则转换函数
function createRuleTransformer(options: IStyleHandlerOptions): RuleTransformer {
  let context: TransformContext | undefined
  const selectorResultCache = new Map<string, CachedSelectorTransformResult>()
  const selectorResultCacheLimit = 50000
  const rootReplacement = options.cssSelectorReplacement?.root
    ? composeIsPseudo(options.cssSelectorReplacement.root)
    : undefined
  const universalReplacement = options.cssSelectorReplacement?.universal
    ? composeIsPseudo(options.cssSelectorReplacement.universal)
    : undefined
  const selectorReplacerOptions = options.escapeMap
    ? { escapeMap: options.escapeMap }
    : undefined

  function writeSelectorResultCache(selector: string, result: CachedSelectorTransformResult) {
    if (selectorResultCache.size >= selectorResultCacheLimit) {
      selectorResultCache.clear()
    }
    selectorResultCache.set(selector, result)
  }

  const transform: SyncProcessor = (selectors) => {
    if (!context) {
      return
    }
    transformSelectors(selectors, context)
  }

  const parser = psp(transform)

  return (rule: Rule) => {
    const sourceSelector = rule.selector
    if (!sourceSelector) {
      return
    }

    const cached = selectorResultCache.get(sourceSelector)
    if (cached) {
      if (cached.action === 'remove') {
        rule.remove()
      }
      else if (cached.action === 'update' && cached.selector && cached.selector !== sourceSelector) {
        rule.selector = cached.selector
      }
      return
    }

    if (canSkipRuleTransform(rule)) {
      writeSelectorResultCache(sourceSelector, { action: 'keep' })
      return
    }

    context = {
      options,
      requiresSpacingNormalization: false,
      rule,
      rootReplacement,
      universalReplacement,
      selectorReplacerOptions,
    }

    let wasRemoved = false
    let requiresSpacingNormalization = false

    try {
      parser.transformSync(rule, SELECTOR_TRANSFORM_OPTIONS)
    }
    finally {
      const currentContext = context
      wasRemoved = rule.parent == null
      requiresSpacingNormalization = currentContext?.requiresSpacingNormalization === true
      context = undefined
    }

    if (wasRemoved) {
      writeSelectorResultCache(sourceSelector, { action: 'remove' })
      return
    }

    if (requiresSpacingNormalization) {
      return
    }

    const transformedSelector = rule.selector
    if (transformedSelector === sourceSelector) {
      writeSelectorResultCache(sourceSelector, { action: 'keep' })
    }
    else {
      writeSelectorResultCache(sourceSelector, {
        action: 'update',
        selector: transformedSelector,
      })
    }
  }
}

// ruleTransformSync 提供同步的规则转换入口，并基于配置缓存转换器
export function ruleTransformSync(rule: Rule, options: IStyleHandlerOptions) {
  let transformer = ruleTransformCache.get(options)
  if (!transformer) {
    transformer = createRuleTransformer(options)
    ruleTransformCache.set(options, transformer)
  }
  transformer(rule)
}
