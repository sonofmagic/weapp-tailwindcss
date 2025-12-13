// selector 规则级处理器，负责重写选择器并规整相关声明
import type { Declaration, Rule } from 'postcss'
import type { Node, Pseudo, Root, Selector, SyncProcessor } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import psp from 'postcss-selector-parser'
import { isUniAppXEnabled, stripUnsupportedNodeForUniAppX } from '../compat/uni-app-x'
import { composeIsPseudo, internalCssSelectorReplacer } from '../shared'
import { reorderLiteralFirst } from '../utils/decl-order'
import {
  getCombinatorSelectorAst,
  normalizeTransformOptions,
} from './utils'

export type RuleTransformer = (rule: Rule) => void

const ruleTransformCache = new WeakMap<IStyleHandlerOptions, RuleTransformer>()

const MIRROR_PROP_PAIRS: Array<[string, string]> = [
  ['margin-top', 'margin-bottom'],
  ['margin-left', 'margin-right'],
  ['margin-inline-start', 'margin-inline-end'],
  ['margin-block-start', 'margin-block-end'],
  ['border-top-width', 'border-bottom-width'],
  ['border-left-width', 'border-right-width'],
  ['border-inline-start-width', 'border-inline-end-width'],
  ['border-block-start-width', 'border-block-end-width'],
]

const MIRROR_PROP_MAP = new Map<string, string>()
const SPACING_PROP_SET = new Set<string>()

for (const [a, b] of MIRROR_PROP_PAIRS) {
  MIRROR_PROP_MAP.set(a, b)
  MIRROR_PROP_MAP.set(b, a)
  SPACING_PROP_SET.add(a)
  SPACING_PROP_SET.add(b)
}

const LEGACY_WEBKIT_SPACING_PROPS = new Set([
  '-webkit-margin-start',
  '-webkit-margin-end',
  '-webkit-margin-before',
  '-webkit-margin-after',
])

const VAR_REFERENCE_PATTERN = /var\(/i
const SELECTOR_TRANSFORM_OPTIONS = normalizeTransformOptions()

interface TransformContext {
  rule: Rule
  options: IStyleHandlerOptions
  requiresSpacingNormalization: boolean
}

// dedupeSpacingProps 去重并调整带变量的间距属性，确保静态声明优先
function dedupeSpacingProps(rule: Rule) {
  const grouped = new Map<string, Declaration[]>()

  for (const node of rule.nodes) {
    if (node.type !== 'decl') {
      continue
    }
    if (!SPACING_PROP_SET.has(node.prop)) {
      continue
    }
    const list = grouped.get(node.prop)
    if (list) {
      list.push(node)
    }
    else {
      grouped.set(node.prop, [node])
    }
  }

  for (const [, declarations] of grouped) {
    if (declarations.length <= 1) {
      continue
    }

    const unique: Declaration[] = []
    const seenValues = new Set<string>()

    for (const decl of declarations) {
      if (decl.parent !== rule) {
        continue
      }
      const key = `${decl.important ? '!important@@' : ''}${decl.value}`
      if (seenValues.has(key)) {
        decl.remove()
        continue
      }
      seenValues.add(key)
      unique.push(decl)
    }

    if (unique.length <= 1) {
      continue
    }

    reorderLiteralFirst(
      rule,
      unique,
      decl => VAR_REFERENCE_PATTERN.test(decl.value),
    )
  }
}

function isNotLastChildPseudo(node?: Node | null): node is Pseudo {
  if (!node || node.type !== 'pseudo' || node.value !== ':not') {
    return false
  }

  const selectors = node.nodes
  if (!selectors || selectors.length !== 1) {
    return false
  }

  const firstSelector = selectors[0]
  if (firstSelector.type !== 'selector') {
    return false
  }

  const target = firstSelector.nodes?.[0]
  return Boolean(target && target.type === 'pseudo' && target.value === ':last-child')
}

// transformSpacingSelector 识别 space/divide 类型的组合器并替换为兼容写法
function transformSpacingSelector(nodes: Node[] | undefined, options: IStyleHandlerOptions): boolean {
  if (!nodes || nodes.length === 0) {
    return false
  }

  for (let idx = 0; idx < nodes.length; idx++) {
    const current = nodes[idx]
    if (current.type !== 'class' && current.type !== 'nesting') {
      continue
    }

    const combinator = nodes[idx + 1]
    if (!combinator || combinator.type !== 'combinator' || combinator.value !== '>') {
      continue
    }

    const candidate = nodes[idx + 2]
    if (!isNotLastChildPseudo(candidate)) {
      continue
    }

    const ast = getCombinatorSelectorAst(options)
    candidate.replaceWith(...ast)
    return true
  }

  return false
}

// normalizeSpacingDeclarations 统一逻辑属性方向，兼容不支持的 -webkit 前缀
function normalizeSpacingDeclarations(rule: Rule) {
  for (const node of [...rule.nodes]) {
    if (node.type !== 'decl') {
      continue
    }

    if (LEGACY_WEBKIT_SPACING_PROPS.has(node.prop)) {
      node.remove()
      continue
    }

    const mirror = MIRROR_PROP_MAP.get(node.prop)
    if (mirror) {
      node.prop = mirror
    }
  }

  dedupeSpacingProps(rule)
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
  node.value = internalCssSelectorReplacer(node.value, { escapeMap: context.options.escapeMap })
}

function handleUniversalNode(node: Node, context: TransformContext) {
  if (node.type !== 'universal') {
    return
  }
  const replacement = context.options.cssSelectorReplacement?.universal
  if (replacement) {
    node.value = composeIsPseudo(replacement)
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

  if (node.value === ':root' && context.options.cssSelectorReplacement?.root) {
    node.value = composeIsPseudo(context.options.cssSelectorReplacement.root)
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
  if (shouldRemoveHoverSelector(selector, context.options)) {
    selector.remove()
    return
  }

  if (transformSpacingSelector(selector.nodes, context.options)) {
    context.requiresSpacingNormalization = true
  }
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

  const transform: SyncProcessor = (selectors) => {
    if (!context) {
      return
    }
    transformSelectors(selectors, context)
  }

  const parser = psp(transform)

  return (rule: Rule) => {
    context = {
      options,
      requiresSpacingNormalization: false,
      rule,
    }

    try {
      parser.transformSync(rule, SELECTOR_TRANSFORM_OPTIONS)
    }
    finally {
      context = undefined
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
