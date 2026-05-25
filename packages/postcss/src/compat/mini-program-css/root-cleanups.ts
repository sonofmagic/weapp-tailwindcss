import type postcss from 'postcss'
import { normalizeModernColorValue } from '../color-mix'
import { isDisplayP3MediaRule } from './color-gamut'
import { isUnsupportedBrowserSelector, SPECIFICITY_PLACEHOLDER_SUFFIXES } from './selectors'

export function removeSpecificityPlaceholders(root: postcss.Root) {
  root.walkRules((rule) => {
    if (!rule.selectors || rule.selectors.length === 0) {
      return
    }

    let changed = false
    const selectors = rule.selectors.map((selector) => {
      let next = selector
      for (const suffix of SPECIFICITY_PLACEHOLDER_SUFFIXES) {
        if (next.includes(suffix)) {
          next = next.split(suffix).join('')
        }
      }
      if (next !== selector) {
        changed = true
      }
      return next
    })

    if (changed) {
      rule.selectors = selectors
    }
  })
}

function removeEmptyAtRuleAncestors(parent: postcss.Container | undefined) {
  while (parent?.type === 'atrule' && (!parent.nodes || parent.nodes.length === 0)) {
    const nextParent = parent.parent
    parent.remove()
    parent = nextParent?.type === 'atrule' ? nextParent : undefined
  }
}

export function removeUnsupportedBrowserSelectors(root: postcss.Root) {
  root.walkRules((rule) => {
    if (!rule.selectors || rule.selectors.length === 0) {
      return
    }

    const selectors = rule.selectors.filter(selector => !isUnsupportedBrowserSelector(selector))
    if (selectors.length === rule.selectors.length) {
      return
    }

    if (selectors.length === 0) {
      const parent = rule.parent
      rule.remove()
      removeEmptyAtRuleAncestors(parent)
      return
    }

    rule.selectors = selectors
  })
}

function removeDeclarationAndEmptyRule(decl: postcss.Declaration) {
  const parent = decl.parent
  decl.remove()
  if (parent?.type === 'rule' && parent.nodes.length === 0) {
    const ruleParent = parent.parent
    parent.remove()
    removeEmptyAtRuleAncestors(ruleParent)
  }
}

export function removeDisplayP3Declarations(root: postcss.Root) {
  root.walkAtRules((atRule) => {
    if (isDisplayP3MediaRule(atRule)) {
      const parent = atRule.parent
      atRule.remove()
      removeEmptyAtRuleAncestors(parent)
    }
  })
}

export function removeUnsupportedModernColorDeclarations(root: postcss.Root) {
  const customPropertyValues = new Map<string, string>()
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      customPropertyValues.set(decl.prop, decl.value.trim())
    }
  })

  root.walkDecls((decl) => {
    const normalized = normalizeModernColorValue(decl.value, customPropertyValues)
    if (normalized.changed) {
      decl.value = normalized.value
      if (decl.prop.startsWith('--')) {
        customPropertyValues.set(decl.prop, decl.value.trim())
      }
    }
    if (normalized.hasUnsupported) {
      removeDeclarationAndEmptyRule(decl)
    }
  })
}
