import type { CssPreflightOptions } from '../../types'
import postcss from 'postcss'
import { normalizeMiniProgramPrefixedDeclaration, removeUnsupportedMiniProgramPrefixedAtRule } from '../mini-program-prefixes'
import { collectUsedTailwindcssV4Variables, createMissingCssVarsV4Nodes, normalizeTailwindcssV4Declaration } from '../tailwindcss-v4'
import { removeUnsupportedCascadeLayers, removeUnsupportedMiniProgramAtRules } from './at-rules'
import { isDisplayP3Declaration } from './color-gamut'
import {
  isEmptyTwContentDeclaration,
  isMiniProgramPreflightRule,
  isMiniProgramThemeVariableRule,
  usesTwContentVariable,
} from './predicates'
import {
  removeDisplayP3Declarations,
  removeSpecificityPlaceholders,
  removeUnsupportedBrowserSelectors,
  removeUnsupportedModernColorDeclarations,
} from './root-cleanups'
import { getRuleSelectors, getSortedRuleSelectorKey, MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR, MINI_PROGRAM_ELEMENT_SCOPE_SELECTORS, MINI_PROGRAM_THEME_SCOPE_SELECTOR } from './selectors'

const HOIST_ANCHOR_COMMENT = '__weapp_tailwindcss_base_anchor__'
const TAILWIND_V4_BANNER_RE = /\/\*!\s*tailwindcss v4\./
const GENERATOR_PLACEHOLDER_COMMENT_RE = /^\s*(?:!\s*)?weapp-tailwindcss generator-placeholder\s*$/i
const MINI_PROGRAM_PSEUDO_CONTENT_SCOPE_SELECTOR = '::before,\n::after'
const MINI_PROGRAM_PSEUDO_CONTENT_SELECTORS = new Set(['::before', '::after'])

export interface FinalizeMiniProgramCssOptions {
  cssPreflight?: CssPreflightOptions | undefined
  preservePseudoContentInit?: boolean
  isTailwindcssV4?: boolean | undefined
}

function createPseudoContentInitRule() {
  const rule = postcss.rule({
    selector: MINI_PROGRAM_PSEUDO_CONTENT_SCOPE_SELECTOR,
  })
  rule.append({
    prop: '--tw-content',
    value: '\'\'',
  })
  return rule
}

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

export function collectPreflightRules(root: postcss.Root, options: { preservePseudoContentInit?: boolean, cssPreflight?: CssPreflightOptions | undefined } = {}) {
  const preflightNodes: postcss.Rule[] = []

  for (const node of root.nodes ?? []) {
    if (isMiniProgramPreflightRule(node)) {
      preflightNodes.push(node)
    }
  }

  if (preflightNodes.length === 0) {
    return []
  }

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
      rule.selector = MINI_PROGRAM_PSEUDO_CONTENT_SCOPE_SELECTOR
    }
    else if (hasElementSelector && selectors.every(selector => MINI_PROGRAM_ELEMENT_SCOPE_SELECTORS.has(selector))) {
      rule.selector = MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR
      applyConfiguredPreflightDeclarations(rule, options.cssPreflight)
    }
  }
  const nonEmptyPreflightRules = clonedPreflightRules.filter(rule => (rule.nodes?.length ?? 0) > 0)
  const preflightRules = [
    ...(options.preservePseudoContentInit ? [createPseudoContentInitRule()] : []),
    ...nonEmptyPreflightRules,
  ]
  for (const node of preflightNodes) {
    node.remove()
  }

  return preflightRules
}

function createPreflightResetRule(cssPreflight: CssPreflightOptions | undefined) {
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

function collectThemeVariableRule(root: postcss.Root, options: FinalizeMiniProgramCssOptions = {}) {
  const themeRules: postcss.Rule[] = []
  const declarations = new Map<string, postcss.Declaration>()
  const shouldPreserveContentInit = options.preservePseudoContentInit || usesTwContentVariable(root)

  for (const node of root.nodes ?? []) {
    if (!isMiniProgramThemeVariableRule(node)) {
      continue
    }

    themeRules.push(node)
    node.walkDecls((decl) => {
      if (isDisplayP3Declaration(decl)) {
        return
      }
      if (!shouldPreserveContentInit && isEmptyTwContentDeclaration(decl)) {
        return
      }
      declarations.set(decl.prop, decl.clone())
    })
  }

  for (const rule of themeRules) {
    rule.remove()
  }

  if (declarations.size === 0) {
    return
  }

  const rule = postcss.rule({
    selector: MINI_PROGRAM_THEME_SCOPE_SELECTOR,
  })
  for (const decl of declarations.values()) {
    rule.append(decl)
  }
  return rule
}

function hasTailwindcssV4Signal(css: string) {
  if (TAILWIND_V4_BANNER_RE.test(css)) {
    return true
  }
  const root = postcss.parse(css)
  let hasProperty = false
  root.walkAtRules('property', (atRule) => {
    if (atRule.params.trim().startsWith('--tw-')) {
      hasProperty = true
      return false
    }
  })
  return hasProperty
}

function getTopDirectiveTail(root: postcss.Root) {
  let tail: postcss.Node | undefined
  for (const node of root.nodes ?? []) {
    if (node.type === 'atrule' && (node.name === 'charset' || node.name === 'import')) {
      tail = node
      continue
    }
    break
  }
  return tail
}

function createHoistInsertionAnchor(root: postcss.Root) {
  for (const node of root.nodes ?? []) {
    if (isMiniProgramPreflightRule(node) || isMiniProgramThemeVariableRule(node)) {
      const anchor = postcss.comment({
        text: HOIST_ANCHOR_COMMENT,
      })
      node.before(anchor)
      return anchor
    }
  }
}

export function insertHoistedRules(root: postcss.Root, rules: postcss.Rule[], anchor?: postcss.Comment) {
  if (anchor && !anchor.parent) {
    anchor = undefined
  }
  if (rules.length === 0) {
    anchor?.remove()
    return
  }

  const topDirectiveTail = getTopDirectiveTail(root)
  const firstRule = rules[0]
  if (!firstRule) {
    return
  }
  if (anchor) {
    if (anchor.raws.before === undefined) {
      delete firstRule.raws.before
    }
    else {
      firstRule.raws.before = anchor.raws.before
    }
    anchor.replaceWith(rules)
    return
  }
  firstRule.raws.before = topDirectiveTail ? '\n' : ''
  if (topDirectiveTail) {
    topDirectiveTail.after(rules)
  }
  else {
    root.prepend(rules)
  }
}

function mergeEquivalentHoistedRules(rules: postcss.Rule[]) {
  const mergedRules: postcss.Rule[] = []
  const ruleBySelector = new Map<string, postcss.Rule>()

  for (const rule of rules) {
    const key = getSortedRuleSelectorKey(rule)
    const existingRule = ruleBySelector.get(key)
    if (existingRule) {
      existingRule.append(...(rule.nodes ?? []).map(node => node.clone()))
      continue
    }
    ruleBySelector.set(key, rule)
    mergedRules.push(rule)
  }

  return mergedRules
}

function unwrapTailwindSourceMedia(root: postcss.Root) {
  root.walkAtRules('media', (atRule) => {
    if (!atRule.params.startsWith('source(')) {
      return
    }
    if (atRule.nodes && atRule.nodes.length > 0) {
      atRule.replaceWith(...atRule.nodes)
    }
    else {
      atRule.remove()
    }
  })
}

function removeTailwindGenerationDirectives(root: postcss.Root) {
  root.walkComments((comment) => {
    if (GENERATOR_PLACEHOLDER_COMMENT_RE.test(comment.text)) {
      comment.remove()
    }
  })
  root.walkAtRules((atRule) => {
    if (
      atRule.name === 'config'
      || atRule.name === 'source'
      || atRule.name === 'tailwind'
      || atRule.name === 'reference'
      || atRule.name === 'plugin'
    ) {
      atRule.remove()
    }
  })
}

function finalizeMiniProgramCssRoot(root: postcss.Root, options: FinalizeMiniProgramCssOptions = {}) {
  const shouldInjectTailwindcssV4Defaults = options.isTailwindcssV4 === true
  const tailwindcssV4DefaultNodes = shouldInjectTailwindcssV4Defaults
    ? createMissingCssVarsV4Nodes(root, collectUsedTailwindcssV4Variables(root))
    : []
  removeUnsupportedCascadeLayers(root)
  unwrapTailwindSourceMedia(root)
  removeTailwindGenerationDirectives(root)
  root.walkAtRules('property', (atRule) => {
    atRule.remove()
  })
  removeSpecificityPlaceholders(root)
  removeUnsupportedBrowserSelectors(root)
  removeDisplayP3Declarations(root)
  removeUnsupportedModernColorDeclarations(root)
  root.walkDecls((decl) => {
    if (shouldInjectTailwindcssV4Defaults) {
      normalizeTailwindcssV4Declaration(decl)
    }
    normalizeMiniProgramPrefixedDeclaration(decl)
  })
  root.walkAtRules((atRule) => {
    removeUnsupportedMiniProgramPrefixedAtRule(atRule)
  })

  const hoistAnchor = createHoistInsertionAnchor(root)
  const preflightRules = collectPreflightRules(root, options)
  if (preflightRules.length === 0) {
    const resetRule = createPreflightResetRule(options.cssPreflight)
    if (resetRule) {
      preflightRules.push(resetRule)
    }
  }
  if (tailwindcssV4DefaultNodes.length > 0) {
    preflightRules.push(postcss.rule({
      selector: MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR,
      nodes: tailwindcssV4DefaultNodes,
    }))
  }
  const themeRule = collectThemeVariableRule(root, options)
  const hoistedRules = themeRule ? [...preflightRules, themeRule] : preflightRules
  insertHoistedRules(root, mergeEquivalentHoistedRules(hoistedRules), hoistAnchor)
}

export function hoistTailwindPreflightBase(css: string) {
  try {
    const root = postcss.parse(css)
    const preflightRules = collectPreflightRules(root, { preservePseudoContentInit: true })
    insertHoistedRules(root, preflightRules)
    return root.toString()
  }
  catch {
    return css
  }
}

export function finalizeMiniProgramCss(css: string, options: FinalizeMiniProgramCssOptions = {}) {
  let isTailwindcssV4 = options.isTailwindcssV4
  if (isTailwindcssV4 === undefined) {
    try {
      isTailwindcssV4 = hasTailwindcssV4Signal(css)
    }
    catch {
      isTailwindcssV4 = TAILWIND_V4_BANNER_RE.test(css)
    }
  }
  const cleanedCss = removeUnsupportedMiniProgramAtRules(css)
  try {
    const root = postcss.parse(cleanedCss)
    finalizeMiniProgramCssRoot(root, { ...options, isTailwindcssV4 })
    return root.toString()
  }
  catch {
    return cleanedCss
  }
}
