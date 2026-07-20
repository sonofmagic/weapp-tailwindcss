import type { Root, Rule } from 'postcss'
import valueParser from 'postcss-value-parser'

const SYSTEM_ROOT_SELECTORS = new Set([
  ':host',
  ':root',
  '.tw-root',
  'page',
  'uni-page-body',
  'wx-root-portal-content',
])

function normalizeSelector(selector: string) {
  return selector.replace(/\s+/g, '').toLowerCase()
}

export function isUniAppXSystemRootCarrierRule(rule: Rule) {
  const selectors = rule.selectors ?? []
  if (selectors.length === 0) {
    return false
  }
  let hasRootMarker = false
  for (const selector of selectors) {
    const normalized = normalizeSelector(selector)
    if (!SYSTEM_ROOT_SELECTORS.has(normalized)) {
      return false
    }
    if (normalized === ':host' || normalized === ':root' || normalized === '.tw-root') {
      hasRootMarker = true
    }
  }
  return hasRootMarker
}

function resolveNodes(
  nodes: valueParser.Node[],
  variables: ReadonlyMap<string, string>,
  resolving: ReadonlySet<string>,
) {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]
    if (node?.type !== 'function') {
      continue
    }
    if (node.value.toLowerCase() !== 'var') {
      resolveNodes(node.nodes, variables, resolving)
      continue
    }

    const variable = node.nodes.find(child => child.type === 'word')
    if (variable?.type !== 'word' || !variable.value.startsWith('--')) {
      resolveNodes(node.nodes, variables, resolving)
      continue
    }

    const commaIndex = node.nodes.findIndex(child => child.type === 'div' && child.value === ',')
    const fallback = commaIndex >= 0
      ? valueParser.stringify(node.nodes.slice(commaIndex + 1)).trim()
      : ''
    const configured = variables.get(variable.value)
    let replacement: string | undefined

    if (configured !== undefined && !resolving.has(variable.value)) {
      replacement = resolveThemeValue(
        configured,
        variables,
        new Set([...resolving, variable.value]),
      )
    }
    else if (variable.value.startsWith('--tw-') && fallback) {
      replacement = resolveThemeValue(fallback, variables, resolving)
    }

    if (replacement === undefined) {
      resolveNodes(node.nodes, variables, resolving)
      continue
    }

    const replacementNodes = valueParser(replacement).nodes
    nodes.splice(index, 1, ...replacementNodes)
    index += replacementNodes.length - 1
  }
}

function resolveThemeValue(
  value: string,
  variables: ReadonlyMap<string, string>,
  resolving: ReadonlySet<string> = new Set(),
) {
  if (!value.includes('var(')) {
    return value
  }
  const parsed = valueParser(value)
  resolveNodes(parsed.nodes, variables, resolving)
  return parsed.toString()
}

/**
 * UVUE 不支持 Tailwind 的混合根选择器，因此先把根作用域中的静态主题 token
 * 内联到实际 utility，再移除仅用于变量承载的系统规则。
 */
export function consumeUniAppXSystemRootTheme(
  root: Root,
  customPropertyValues?: ReadonlyMap<string, string>,
) {
  const carrierRules: Rule[] = []
  const variables = new Map(customPropertyValues)

  root.walkRules((rule) => {
    if (!isUniAppXSystemRootCarrierRule(rule)) {
      return
    }
    carrierRules.push(rule)
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        variables.set(decl.prop, decl.value)
      }
    })
  })

  if (variables.size > 0) {
    const carriers = new Set(carrierRules)
    root.walkDecls((decl) => {
      if (decl.parent?.type === 'rule' && carriers.has(decl.parent)) {
        return
      }
      decl.value = resolveThemeValue(decl.value, variables)
    })
  }

  for (const rule of carrierRules) {
    rule.remove()
  }
}
