import { postcss } from '../postcss-runtime'
import { isCssRuleCoveredByDeclarations, removeEmptyAtRules } from './coverage'
import { collectCssRuleContentKeys, collectCssRuleDeclarationKeyMap, collectNormalizedCssNodes, getCssRuleContentKey, normalizeCssForContainment } from './structure'

export function filterExistingCssRules(baseCss: string, css: string) {
  const baseRuleKeys = collectCssRuleContentKeys(baseCss)
  if (baseRuleKeys.size === 0) {
    return css
  }
  try {
    const root = postcss.parse(css)
    const baseRuleDeclarationKeys = collectCssRuleDeclarationKeyMap(baseCss)
    let changed = false
    root.walkRules((rule) => {
      const key = getCssRuleContentKey(rule)
      if (
        (key && baseRuleKeys.has(key))
        || isCssRuleCoveredByDeclarations(rule, baseRuleDeclarationKeys)
      ) {
        rule.remove()
        changed = true
      }
    })
    if (!changed) {
      return css
    }
    removeEmptyAtRules(root)
    return root.toString().trim()
  }
  catch {
    return css
  }
}

export function containsCssAfterMinify(baseCss: string, css: string) {
  if (baseCss.includes(css)) {
    return true
  }
  const normalizedBaseCss = normalizeCssForContainment(baseCss)
  const normalizedCss = normalizeCssForContainment(css)
  if (normalizedCss.length > 0 && normalizedBaseCss.includes(normalizedCss)) {
    return true
  }
  const normalizedNodes = collectNormalizedCssNodes(css)
  if (normalizedNodes.length > 0 && normalizedNodes.every(node => normalizedBaseCss.includes(node))) {
    return true
  }
  const baseRuleKeys = collectCssRuleContentKeys(baseCss)
  const ruleKeys = collectCssRuleContentKeys(css)
  return ruleKeys.size > 0
    && [...ruleKeys].every(key => baseRuleKeys.has(key))
}
