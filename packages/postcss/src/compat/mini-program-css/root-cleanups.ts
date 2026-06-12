import type postcss from 'postcss'
import { normalizeModernColorValue } from '../color-mix'
import { isDisplayP3MediaRule } from './color-gamut'
import { isUnsupportedBrowserPreflightSelector, isUnsupportedBrowserSelector, SPECIFICITY_PLACEHOLDER_SUFFIXES } from './selectors'

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

function isEffectivelyEmptyContainer(container: postcss.Container) {
  return !container.nodes || container.nodes.every(node => node.type === 'comment')
}

export function removeEmptyAtRules(root: postcss.Root) {
  root.walkAtRules((atRule) => {
    if (isEffectivelyEmptyContainer(atRule)) {
      atRule.remove()
    }
  })
}

function removeEmptyAtRuleAncestors(parent: postcss.Container | undefined) {
  while (parent?.type === 'atrule' && isEffectivelyEmptyContainer(parent)) {
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

    if (isUnsupportedBrowserPreflightSelector(rule.selector)) {
      const parent = rule.parent
      rule.remove()
      removeEmptyAtRuleAncestors(parent)
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

const SIMPLE_MIN_WIDTH_MEDIA_RE = /^\(\s*min-width\s*:[^)]+\)$/i
const TAILWIND_GENERATED_TOKEN_COMMENT_RE = /^\s*tokens:\s*container\s*<=\s*<tailwind generated>\s*$/i

interface RemoveTailwindContainerRulesOptions {
  generatedOnly?: boolean
}

function isContainerMaxWidthOnlyRule(rule: postcss.Rule) {
  if (!rule.selectors || rule.selectors.length !== 1 || rule.selectors[0] !== '.container') {
    return false
  }
  const declarations = rule.nodes?.filter(node => node.type === 'decl') ?? []
  return declarations.length === 1
    && declarations[0]?.prop === 'max-width'
    && (rule.nodes ?? []).every(node => node.type === 'decl' || node.type === 'comment')
}

export function removeTailwindContainerMaxWidthMediaRules(root: postcss.Root) {
  root.walkAtRules('media', (atRule) => {
    if (!SIMPLE_MIN_WIDTH_MEDIA_RE.test(atRule.params.trim())) {
      return
    }
    atRule.walkRules((rule) => {
      if (!isContainerMaxWidthOnlyRule(rule)) {
        return
      }
      const parent = rule.parent
      rule.remove()
      removeEmptyAtRuleAncestors(parent)
    })
  })
}

function isContainerWidthOnlyRule(rule: postcss.Rule) {
  if (!rule.selectors || rule.selectors.length !== 1 || rule.selectors[0] !== '.container') {
    return false
  }
  const declarations = rule.nodes?.filter(node => node.type === 'decl') ?? []
  return declarations.length === 1
    && declarations[0]?.prop === 'width'
    && declarations[0].value.trim() === '100%'
    && (rule.nodes ?? []).every(node => node.type === 'decl' || node.type === 'comment')
}

function isTailwindGeneratedContainerRule(rule: postcss.Rule) {
  const previous = rule.prev()
  return previous?.type === 'comment' && TAILWIND_GENERATED_TOKEN_COMMENT_RE.test(previous.text)
}

export function removeTailwindContainerWidthRules(
  root: postcss.Root,
  options: RemoveTailwindContainerRulesOptions = {},
) {
  root.walkRules((rule) => {
    if (!isContainerWidthOnlyRule(rule)) {
      return
    }
    if (options.generatedOnly && !isTailwindGeneratedContainerRule(rule)) {
      return
    }
    const parent = rule.parent
    if (isTailwindGeneratedContainerRule(rule)) {
      rule.prev()?.remove()
    }
    rule.remove()
    removeEmptyAtRuleAncestors(parent)
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
