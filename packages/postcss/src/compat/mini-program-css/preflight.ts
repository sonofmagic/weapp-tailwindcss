import type { CssPreflightOptions, CssSelectorReplacement } from '../../types'
import postcss from 'postcss'
import {
  isEmptyTwContentDeclaration,
  isMiniProgramPreflightRule,
} from './predicates'
import {
  getRuleSelectors,
  MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR,
  MINI_PROGRAM_ELEMENT_SCOPE_SELECTORS,
  normalizeMiniProgramThemeScopeSelector,
} from './selectors'

const MINI_PROGRAM_PSEUDO_CONTENT_SELECTORS = new Set(['::before', '::after'])

function applyConfiguredPreflightDeclarations(
  rule: postcss.Rule,
  cssPreflight: CssPreflightOptions | undefined,
) {
  if (!cssPreflight || typeof cssPreflight !== 'object') {
    return
  }

  const configuredProps = new Set(Object.keys(cssPreflight))
  rule.walkDecls((decl) => {
    if (!configuredProps.has(decl.prop)) {
      return
    }
    const value = cssPreflight[decl.prop]
    if (value === false) {
      decl.remove()
      return
    }
    decl.value = value.toString()
  })

  for (const [prop, value] of Object.entries(cssPreflight)) {
    if (value === false || rule.nodes?.some(node => node.type === 'decl' && node.prop === prop)) {
      continue
    }
    rule.append({
      prop,
      value: value.toString(),
    })
  }
}

function collectTailwindRuntimeDeclarations(rule: postcss.Rule) {
  const declarations: postcss.Declaration[] = []
  rule.walkDecls((decl) => {
    if (!decl.prop.startsWith('--tw-') || isEmptyTwContentDeclaration(decl)) {
      return
    }
    declarations.push(decl.clone())
    decl.remove()
  })
  return declarations
}

export function collectPreflightRules(root: postcss.Root, options: { cssPreflight?: CssPreflightOptions | undefined, cssSelectorReplacement?: CssSelectorReplacement | undefined } = {}) {
  const preflightNodes: postcss.Rule[] = []
  const themeScopeSelector = normalizeMiniProgramThemeScopeSelector(options.cssSelectorReplacement?.root)

  for (const node of root.nodes ?? []) {
    if (isMiniProgramPreflightRule(node)) {
      preflightNodes.push(node)
    }
  }

  if (preflightNodes.length === 0) {
    return []
  }

  const runtimeRules: postcss.Rule[] = []
  const clonedPreflightRules = preflightNodes.map((node) => {
    const rule = node.clone()
    rule.walkDecls('--tw-content', (decl) => {
      if (isEmptyTwContentDeclaration(decl)) {
        decl.remove()
      }
    })
    return rule
  })
  for (const rule of clonedPreflightRules) {
    const selectors = getRuleSelectors(rule)
    const hasElementSelector = selectors.some(selector => selector === 'view' || selector === 'text')
    const isPseudoContentScope = selectors.length > 0
      && selectors.every(selector => MINI_PROGRAM_PSEUDO_CONTENT_SELECTORS.has(selector))
    if (isPseudoContentScope) {
      rule.remove()
    }
    else if (hasElementSelector && selectors.every(selector => MINI_PROGRAM_ELEMENT_SCOPE_SELECTORS.has(selector))) {
      const runtimeDeclarations = collectTailwindRuntimeDeclarations(rule)
      if (runtimeDeclarations.length > 0) {
        runtimeRules.push(postcss.rule({
          selector: themeScopeSelector,
          nodes: runtimeDeclarations,
        }))
      }
      if (options.cssPreflight === false) {
        rule.removeAll()
        continue
      }
      rule.selector = MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR
      applyConfiguredPreflightDeclarations(rule, options.cssPreflight)
    }
  }
  const nonEmptyPreflightRules = [
    ...clonedPreflightRules.filter(rule => (rule.nodes?.length ?? 0) > 0),
    ...runtimeRules,
  ]
  for (const node of preflightNodes) {
    node.remove()
  }

  return nonEmptyPreflightRules
}

export function createPreflightResetRule(cssPreflight: CssPreflightOptions | undefined) {
  if (!cssPreflight || typeof cssPreflight !== 'object') {
    return
  }

  const rule = postcss.rule({
    selector: MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR,
  })
  for (const [prop, value] of Object.entries(cssPreflight)) {
    if (value === false) {
      continue
    }
    rule.append({
      prop,
      value: value.toString(),
    })
  }
  return rule.nodes?.length ? rule : undefined
}
