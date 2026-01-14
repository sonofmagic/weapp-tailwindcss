import type { Declaration, Rule } from 'postcss'
import { reorderLiteralFirst } from '../../utils/decl-order'

const logicalPropMap = new Map<string, string>([
  // margin 方向映射
  ['margin-inline-start', 'margin-left'],
  ['margin-inline-end', 'margin-right'],
  ['margin-block-start', 'margin-top'],
  ['margin-block-end', 'margin-bottom'],
  // padding 方向映射
  ['padding-inline-start', 'padding-left'],
  ['padding-inline-end', 'padding-right'],
  ['padding-block-start', 'padding-top'],
  ['padding-block-end', 'padding-bottom'],
  // border 方向映射
  ['border-inline-start', 'border-left'],
  ['border-inline-end', 'border-right'],
  ['border-block-start', 'border-top'],
  ['border-block-end', 'border-bottom'],
  ['border-inline-start-width', 'border-left-width'],
  ['border-inline-end-width', 'border-right-width'],
])

const variablePriorityProps = new Set([
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'border-left-width',
  'border-right-width',
  'border-top-width',
  'border-bottom-width',
])

function getCanonicalProp(prop: string) {
  return logicalPropMap.get(prop) ?? prop
}

// normalizeCalcValue 消除嵌套 calc 带来的冗余括号，兼容小程序解析器
function normalizeCalcValue(value: string) {
  if (!value.includes('calc')) {
    return value
  }

  let next = value
  let prev: string

  do {
    prev = next
    next = prev.replace(/calc\(\s*calc\(/gi, 'calc((')
  } while (next !== prev)

  return next.replace(/calc\(\s*(1\s*-\s*var\([^()]+\))\s*\)/gi, '($1)')
}

interface DedupeEntry {
  decl: Declaration
  normalizedValue: string
  canonicalProp: string
  importantKey: string
  isLogical: boolean
}

function hasVariableReference(value: string) {
  return value.includes('var(')
}

// reorderVariableDeclarations 确保普通声明在变量声明之前，避免被变量覆盖
export function reorderVariableDeclarations(rule: Rule) {
  const groupedByProp = new Map<string, Declaration[]>()

  for (const node of rule.nodes) {
    if (node.type !== 'decl') {
      continue
    }
    if (node.prop.startsWith('--')) {
      continue
    }
    const existing = groupedByProp.get(node.prop)
    if (existing) {
      existing.push(node)
    }
    else {
      groupedByProp.set(node.prop, [node])
    }
  }

  for (const declarations of groupedByProp.values()) {
    reorderLiteralFirst(
      rule,
      declarations,
      decl => hasVariableReference(decl.value),
    )
  }
}

// dedupeDeclarations 去除逻辑属性与变量重复定义，保留最优组合
export function dedupeDeclarations(rule: Rule) {
  const entries: DedupeEntry[] = []

  for (const node of [...rule.nodes]) {
    if (node.type !== 'decl') {
      continue
    }
    const decl = node
    const normalizedValue = normalizeCalcValue(decl.value)
    if (normalizedValue !== decl.value) {
      decl.value = normalizedValue
    }
    const canonicalProp = getCanonicalProp(decl.prop)
    entries.push({
      decl,
      normalizedValue,
      canonicalProp,
      importantKey: decl.important ? '!important' : '',
      isLogical: canonicalProp !== decl.prop,
    })
  }

  const seen = new Map<string, DedupeEntry>()

  for (const entry of entries) {
    const key = `${entry.canonicalProp}${entry.importantKey}@@${entry.normalizedValue}`
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, entry)
      continue
    }

    if (existing.isLogical && !entry.isLogical) {
      existing.decl.remove()
      seen.set(key, entry)
    }
    else {
      entry.decl.remove()
    }
  }

  const reorderGroups = new Map<string, Declaration[]>()

  for (const node of rule.nodes) {
    if (node.type !== 'decl') {
      continue
    }
    const canonical = getCanonicalProp(node.prop)
    if (!variablePriorityProps.has(canonical)) {
      continue
    }
    const existing = reorderGroups.get(canonical)
    if (existing) {
      existing.push(node)
    }
    else {
      reorderGroups.set(canonical, [node])
    }
  }

  for (const declarations of reorderGroups.values()) {
    if (declarations.length <= 1) {
      continue
    }

    reorderLiteralFirst(
      rule,
      declarations,
      decl => hasVariableReference(decl.value),
    )
  }

  const literalSeen = new Map<string, Declaration>()

  for (const node of [...rule.nodes]) {
    if (node.type !== 'decl') {
      continue
    }

    const canonical = getCanonicalProp(node.prop)
    if (!variablePriorityProps.has(canonical)) {
      continue
    }

    if (hasVariableReference(node.value)) {
      continue
    }

    const existing = literalSeen.get(canonical)
    if (existing) {
      node.remove()
    }
    else {
      literalSeen.set(canonical, node)
    }
  }

  // reorderVariableDeclarations(rule)
}
