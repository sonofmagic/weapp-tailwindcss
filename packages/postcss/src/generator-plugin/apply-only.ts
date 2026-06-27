import type { Root, Rule } from 'postcss'
import { postcss } from '../postcss-runtime'

function normalizeSelector(selector: string) {
  return selector.replace(/:not\(#\\#\)/g, '').trim()
}

export function collectApplyOnlyCssSelectorsRoot(root: Root) {
  const selectors = new Set<string>()
  root.walkRules((rule) => {
    if (!rule.nodes?.some(node => node.type === 'atrule' && node.name === 'apply')) {
      return
    }
    for (const selector of rule.selectors ?? [rule.selector]) {
      const normalized = normalizeSelector(selector)
      if (normalized) {
        selectors.add(normalized)
      }
    }
  })
  return selectors
}

export function collectApplyOnlyCssSelectors(css: string) {
  try {
    return collectApplyOnlyCssSelectorsRoot(postcss.parse(css))
  }
  catch {
    return new Set<string>()
  }
}

function ruleMatchesApplyOnlySelector(rule: Rule, selectors: Set<string>) {
  const ruleSelectors = rule.selectors ?? [rule.selector]
  return ruleSelectors.some(selector => selectors.has(normalizeSelector(selector)))
}

export function filterApplyOnlyGeneratedCssRoot(root: Root, selectors: Set<string>) {
  if (selectors.size === 0) {
    return false
  }

  let changed = false
  root.walkRules((rule) => {
    if (ruleMatchesApplyOnlySelector(rule, selectors) || rule.nodes?.some(node => node.type === 'decl' && node.prop.startsWith('--'))) {
      return
    }
    rule.remove()
    changed = true
  })
  root.walkAtRules((rule) => {
    if (rule.nodes !== undefined && rule.nodes.length === 0) {
      rule.remove()
      changed = true
    }
  })
  return changed
}

export function filterApplyOnlyGeneratedCss(css: string, selectors: Set<string>) {
  if (selectors.size === 0) {
    return css
  }

  try {
    const root = postcss.parse(css)
    return filterApplyOnlyGeneratedCssRoot(root, selectors) ? root.toString() : css
  }
  catch {
    return css
  }
}
