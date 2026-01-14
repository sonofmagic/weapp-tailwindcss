import type { Declaration, Rule } from 'postcss'
import type { Node, Pseudo } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import { reorderLiteralFirst } from '../utils/decl-order'
import { getCombinatorSelectorAst } from './utils'

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

export function isNotLastChildPseudo(node?: Node | null): node is Pseudo {
  if (!node || node.type !== 'pseudo' || node.value !== ':not') {
    return false
  }

  const selectors = node.nodes
  if (!selectors || selectors.length !== 1) {
    return false
  }

  const firstSelector = selectors[0]
  if (!firstSelector || firstSelector.type !== 'selector') {
    return false
  }

  const target = firstSelector.nodes?.[0]
  return Boolean(target && target.type === 'pseudo' && target.value === ':last-child')
}

// transformSpacingSelector 识别 space/divide 类型的组合器并替换为兼容写法
export function transformSpacingSelector(nodes: Node[] | undefined, options: IStyleHandlerOptions): boolean {
  if (!nodes || nodes.length === 0) {
    return false
  }

  for (let idx = 0; idx < nodes.length; idx++) {
    const current = nodes[idx]
    if (!current || (current.type !== 'class' && current.type !== 'nesting')) {
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
export function normalizeSpacingDeclarations(rule: Rule) {
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
