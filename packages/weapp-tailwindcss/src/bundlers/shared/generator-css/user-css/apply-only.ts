import { postcss } from '@weapp-tailwindcss/postcss'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '../directives'
import { preferScopedGeneratedCssRules } from '../scoped-rules'
import { collectApplyOnlySourceSelectors, hasOnlyApplyBackedSourceRules, isEmptyCustomVariantBlock, normalizeGeneratedSelector, removeCssComments } from './user-layers'

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

export function filterApplyOnlyGeneratedCss(
  css: string,
  source: string,
  options: {
    preserveVariables?: boolean | undefined
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
      if (!isApplySelector && (!preserveVariables || !isVariableRule)) {
        rule.remove()
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
      }
    })
    const filteredCss = root.toString()
    const preferredCss = options.preferScopedRules
      ? preferScopedGeneratedCssRules(filteredCss)
      : filteredCss
    return removeCssComments(preferredCss).trim()
  }
  catch {
    return css
  }
}

export function shouldFilterApplyOnlyGeneratedCss(
  _majorVersion: number | undefined,
  target: string,
  source: string,
  options: {
    hasGeneratedCss: boolean
    hasGeneratedMarkers: boolean
  },
) {
  return (target === 'weapp' || target === 'web')
    && hasTailwindApplyDirective(source)
    && !hasTailwindRootDirectives(source)
    && !options.hasGeneratedCss
    && !options.hasGeneratedMarkers
    && collectApplyOnlySourceSelectors(source).size > 0
    && hasOnlyApplyBackedSourceRules(source)
}
