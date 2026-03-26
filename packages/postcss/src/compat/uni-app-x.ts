// Uni-app X 兼容性相关的辅助方法，集中复用特殊处理逻辑
import type { Result as PostcssResult, Rule } from 'postcss'
import type { Node, Pseudo } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import postcss from 'postcss'

const UNI_APP_X_BASE_CARRIER_SELECTORS = new Set([
  '*',
  'view',
  'text',
  '::before',
  '::after',
  ':before',
  ':after',
  '::backdrop',
])
const REQUIRED_TW_VAR_RE = /var\(\s*(--tw-[\w-]+)\s*\)/g
const CLASS_SELECTOR_RE = /\.[\w-]+/
const SELECTOR_WHITESPACE_RE = /\s+/g

interface TwDefaultDeclaration {
  prop: string
  value: string
  important: boolean
}

export function isUniAppXEnabled(options?: Pick<IStyleHandlerOptions, 'uniAppX'>) {
  return Boolean(options?.uniAppX)
}

function normalizeSelector(selector: string) {
  return selector.replace(SELECTOR_WHITESPACE_RE, '').toLowerCase()
}

function isBaseCarrierSelector(selector: string) {
  return UNI_APP_X_BASE_CARRIER_SELECTORS.has(normalizeSelector(selector))
}

function isBaseCarrierRule(rule: Rule) {
  return Array.isArray(rule.selectors)
    && rule.selectors.length > 0
    && rule.selectors.every(isBaseCarrierSelector)
}

function hasClassSelector(rule: Rule) {
  return Array.isArray(rule.selectors) && rule.selectors.some(selector => CLASS_SELECTOR_RE.test(selector))
}

function collectRequiredTwVars(value: string) {
  const result = new Set<string>()
  for (const match of value.matchAll(REQUIRED_TW_VAR_RE)) {
    const variableName = match[1]
    if (variableName) {
      result.add(variableName)
    }
  }
  return result
}

function extractUniAppXBaseDefaults(result: PostcssResult) {
  const defaults = new Map<string, TwDefaultDeclaration>()
  result.root.walkRules((rule) => {
    if (!isBaseCarrierRule(rule)) {
      return
    }
    rule.walkDecls((decl) => {
      if (!decl.prop.startsWith('--tw-') || defaults.has(decl.prop)) {
        return
      }
      defaults.set(decl.prop, {
        prop: decl.prop,
        value: decl.value,
        important: decl.important,
      })
    })
    rule.remove()
  })
  return defaults
}

function injectUniAppXBaseDefaults(
  result: PostcssResult,
  defaults: Map<string, TwDefaultDeclaration>,
) {
  if (defaults.size === 0) {
    return
  }

  result.root.walkRules((rule) => {
    if (!hasClassSelector(rule)) {
      return
    }

    const declaredProps = new Set<string>()
    const requiredProps = new Set<string>()

    rule.walkDecls((decl) => {
      declaredProps.add(decl.prop)
      for (const variableName of collectRequiredTwVars(decl.value)) {
        requiredProps.add(variableName)
      }
    })

    const prependDecls: TwDefaultDeclaration[] = []
    for (const variableName of requiredProps) {
      if (declaredProps.has(variableName)) {
        continue
      }
      const declaration = defaults.get(variableName)
      if (declaration) {
        prependDecls.push(declaration)
      }
    }

    for (const declaration of prependDecls.reverse()) {
      rule.prepend(postcss.decl({
        prop: declaration.prop,
        value: declaration.value,
        important: declaration.important,
      }))
    }
  })
}

export function applyUniAppXBaseCompatibility(
  result: PostcssResult,
  options?: Pick<IStyleHandlerOptions, 'uniAppX'>,
) {
  if (!isUniAppXEnabled(options)) {
    return result
  }

  const defaults = extractUniAppXBaseDefaults(result)
  injectUniAppXBaseDefaults(result, defaults)
  if (defaults.size === 0) {
    return result
  }
  return result.root.toResult(result.opts)
}

export function stripUnsupportedPseudoForUniAppX(node: Pseudo, enabled: boolean) {
  if (!enabled) {
    return
  }
  // :host 仍需保留给 root 变量作用域，避免在 post 阶段被重复移除/追加导致死循环。
  if (node.value === ':host') {
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
  if (node.type === 'attribute' || node.type === 'pseudo') {
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
