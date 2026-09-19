import { postcss } from '../../../postcss-runtime'
import { isTailwindRuntimePropertyRule } from '../../uni-app-x-author-apply'
import { preferScopedGeneratedCssRulesRoot } from './scoped-rules'
import { collectApplyOnlySourceSelectors, isEmptyCustomVariantBlock, normalizeGeneratedSelector, removeCssComments } from './user-layers'

export function normalizeEmptyTailwindCustomVariants(css: string) {
  if (!css.includes('@custom-variant')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkAtRules('custom-variant', (rule) => {
      if (!isEmptyCustomVariantBlock(rule)) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}

export function filterTailwindV4ApplyOnlyGeneratedCss(
  css: string,
  source: string,
  options: {
    preserveVariables?: boolean | undefined
    preserveRuntimeProperties?: boolean | undefined
    preferScopedRules?: boolean | undefined
  } = {},
) {
  const selectors = collectApplyOnlySourceSelectors(source)
  if (selectors.size === 0) {
    return css
  }
  const selectorList = [...selectors]
  const preserveVariables = options.preserveVariables !== false

  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const ruleSelectors = rule.selectors ?? [rule.selector]
      const isApplySelector = ruleSelectors.some((selector) => {
        const normalized = normalizeGeneratedSelector(selector)
        return selectorList.some((sourceSelector) => {
          if (normalized === sourceSelector) {
            return true
          }
          if (!normalized.startsWith(sourceSelector)) {
            return false
          }
          const next = normalized[sourceSelector.length]
          return next === ':' || next === '[' || next === '.'
        })
      })
      const isVariableRule = rule.nodes?.some(node => node.type === 'decl' && node.prop.startsWith('--'))
      if (options.preserveRuntimeProperties && isTailwindRuntimePropertyRule(rule)) {
        return
      }
      if (!isApplySelector && (!preserveVariables || !isVariableRule)) {
        rule.remove()
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
      }
    })
    if (options.preferScopedRules && css.includes('data-v-')) {
      preferScopedGeneratedCssRulesRoot(root)
    }
    return removeCssComments(root.toString()).trim()
  }
  catch {
    return css
  }
}
