import type { Declaration, Root } from 'postcss'
import valueParser from 'postcss-value-parser'
import { MINI_PROGRAM_THEME_SCOPE_SELECTORS } from '../../compat/mini-program-css/selectors'
import { decodeCssIdentifier, getCssAtRulePrelude, getCssCalcVariableReferences, getCssCustomPropertyName, isCssVarFunction } from '../../utils/css-custom-property'

interface ResolvedSignature {
  nodes: unknown[]
  size: number
  unresolved: boolean
}

type ResolveVariable = (name: string) => ResolvedSignature | undefined

const maxSignatureSize = 65_536

function variableName(node: valueParser.FunctionNode) {
  const comma = node.nodes.findIndex(child => child.type === 'div' && child.value === ',')
  return getCssCustomPropertyName(valueParser.stringify(comma < 0 ? node.nodes : node.nodes.slice(0, comma)))
}

function serializeNodes(nodes: valueParser.Node[]): unknown[] {
  return nodes.filter(node => node.type !== 'space' && node.type !== 'comment').flatMap((node): unknown[] => {
    if (node.type === 'function') {
      return [[node.type, node.value, serializeNodes(node.nodes)]]
    }
    return [[node.type, node.value, node.type === 'string' ? node.quote : undefined]]
  })
}

function resolveNodes(nodes: valueParser.Node[], resolveVariable: ResolveVariable): ResolvedSignature | undefined {
  const result: ResolvedSignature = { nodes: [], size: 2, unresolved: false }
  for (const node of nodes) {
    if (node.type === 'space' || node.type === 'comment') {
      continue
    }
    let fragment: ResolvedSignature
    if (node.type === 'function' && isCssVarFunction(node.value)) {
      const name = variableName(node)
      const resolved = name && !node.unclosed ? resolveVariable(name) : undefined
      const raw = resolved ? [] : serializeNodes([node])
      fragment = resolved ?? { nodes: raw, size: JSON.stringify(raw).length, unresolved: true }
    }
    else if (node.type === 'function') {
      const children = resolveNodes(node.nodes, resolveVariable)
      if (!children) {
        return undefined
      }
      fragment = {
        nodes: [[node.type, node.value, children.nodes]],
        size: JSON.stringify([node.type, node.value]).length + children.size + 3,
        unresolved: children.unresolved,
      }
    }
    else {
      const raw = serializeNodes([node])
      fragment = { nodes: raw, size: JSON.stringify(raw).length, unresolved: false }
    }
    const nextSize = result.size + fragment.size - 2 + (result.nodes.length > 0 && fragment.nodes.length > 0 ? 1 : 0)
    if (nextSize > maxSignatureSize) {
      return undefined
    }
    // 先预算再拼接 AST 节点；不能把 var(--number)px 重新分词为长度 token。
    result.nodes.push(...fragment.nodes)
    result.size = nextSize
    result.unresolved ||= fragment.unresolved
  }
  return result
}

export function valueSignature(value: string): unknown[] {
  return serializeNodes(valueParser(value).nodes)
}

function isUnconditionalRootDeclaration(decl: Declaration) {
  const rule = decl.parent
  if (rule?.type !== 'rule' || rule.parent?.type !== 'root') {
    return false
  }
  const selectors = rule.selectors.map(selector => selector.trim())
  return selectors.every(selector => selector === 'html' || MINI_PROGRAM_THEME_SCOPE_SELECTORS.has(selector))
    && selectors.some(selector => selector === ':root' || selector === 'html' || selector === 'page')
}

function isStaticVariableValue(value: string) {
  if (value.length > maxSignatureSize) {
    return false
  }
  const identifier = decodeCssIdentifier(value)
  if (identifier && /^(?:initial|inherit|unset|revert|revert-layer|revert-rule)$/i.test(identifier)) {
    return false
  }
  let safe = value.trim().length > 0
  valueParser(value).walk((node) => {
    if ((node.type === 'word' && /[!;()[\]{}]/.test(node.value))
      || (node.type === 'string' && node.unclosed)) {
      safe = false
    }
    if (node.type !== 'function') {
      return
    }
    const name = decodeCssIdentifier(node.value)?.toLowerCase() ?? node.value
    // 静态证据只支持确定的数学分组与变量；URL、attr、环境值及未知函数不猜测。
    if (node.unclosed || !['', 'calc', 'var'].includes(name)) {
      safe = false
    }
  })
  return safe
}

/** 只展开输入 CSS 中无条件、无覆盖且依赖完整的根变量，不求解 DOM 或运行时层叠。 */
export function createCssValueSignature(root: Root) {
  const bindings = new Map<string, string>()
  const unsafe = new Set<string>()
  root.walkAtRules((rule) => {
    const prelude = getCssAtRulePrelude(rule)
    if (prelude.name.toLowerCase() === 'property') {
      const name = getCssCustomPropertyName(prelude.params)
      if (name) {
        unsafe.add(name)
      }
    }
  })
  root.walkDecls((decl) => {
    const name = getCssCustomPropertyName(decl.prop)
    if (!name) {
      return
    }
    const value = decl.value.trim()
    const previous = bindings.get(name)
    if (!isUnconditionalRootDeclaration(decl) || !isStaticVariableValue(value)
      || (previous !== undefined && JSON.stringify(valueSignature(previous)) !== JSON.stringify(valueSignature(value)))) {
      unsafe.add(name)
    }
    else {
      bindings.set(name, value)
    }
  })
  const cache = new Map<string, ResolvedSignature | undefined>()
  const visiting = new Set<string>()
  const resolveVariable: ResolveVariable = (name) => {
    if (cache.has(name)) {
      return cache.get(name)
    }
    const value = bindings.get(name)
    if (value === undefined || unsafe.has(name) || visiting.has(name) || visiting.size >= 64) {
      return undefined
    }
    visiting.add(name)
    // fallback 中未选中的引用也参与变量依赖图，不能跳过它隐藏的循环。
    for (const dependency of getCssCalcVariableReferences(value).values()) {
      if (resolveVariable(dependency) === undefined) {
        visiting.delete(name)
        cache.set(name, undefined)
        return undefined
      }
    }
    const signature = resolveNodes(valueParser(value).nodes, resolveVariable)
    visiting.delete(name)
    const result = signature?.unresolved ? undefined : signature
    cache.set(name, result)
    return result
  }
  return (value: string) => {
    const nodes = valueParser(value).nodes
    const resolved = value.length <= maxSignatureSize ? resolveNodes(nodes, resolveVariable) : undefined
    // 双方必须仍延迟到 computed-value 阶段；纯字面量可能在解析时即被丢弃。
    return resolved?.unresolved ? resolved.nodes : serializeNodes(nodes)
  }
}
