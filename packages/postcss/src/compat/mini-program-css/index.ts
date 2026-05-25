import type { CssPreflightOptions } from '../../types'
import postcss from 'postcss'
import { normalizeMiniProgramPrefixedDeclaration, removeUnsupportedMiniProgramPrefixedAtRule } from '../mini-program-prefixes'
import { removeUnsupportedCascadeLayers, removeUnsupportedMiniProgramAtRules } from './at-rules'
import { isDisplayP3Declaration } from './color-gamut'
import {
  removeDisplayP3Declarations,
  removeSpecificityPlaceholders,
  removeUnsupportedBrowserSelectors,
  removeUnsupportedModernColorDeclarations,
} from './root-cleanups'
import {
  getRuleSelectors,
  MINI_PROGRAM_PREFLIGHT_SELECTORS,
  MINI_PROGRAM_THEME_SCOPE_SELECTOR,
  MINI_PROGRAM_THEME_SCOPE_SELECTORS,
} from './selectors'

export {
  removeUnsupportedAtSupports,
  removeUnsupportedCascadeLayers,
  removeUnsupportedMiniProgramAtRules,
} from './at-rules'

const PREFLIGHT_RESET_PROPS = new Set([
  'box-sizing',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'margin',
  'padding',
])
const CONTENT_VAR_RE = /var\(\s*--tw-content\b/
const HOIST_ANCHOR_COMMENT = '__weapp_tailwindcss_base_anchor__'

interface FinalizeMiniProgramCssOptions {
  cssPreflight?: CssPreflightOptions | undefined
  preservePseudoContentInit?: boolean
}

function isMiniProgramThemeScopeSelector(selectors: string[]) {
  return selectors.length > 0
    && selectors.every(selector => MINI_PROGRAM_THEME_SCOPE_SELECTORS.has(selector))
}

function isMiniProgramPreflightSelector(selectors: string[]) {
  return selectors.length > 0
    && selectors.every(selector => MINI_PROGRAM_PREFLIGHT_SELECTORS.has(selector))
    && selectors.some(selector => selector === '*' || selector === ':before' || selector === ':after' || selector === '::before' || selector === '::after')
}

function hasTailwindPreflightDeclaration(rule: postcss.Rule) {
  let hasTailwindVar = false
  let hasResetProp = false

  rule.walkDecls((decl) => {
    if (decl.prop.startsWith('--tw-')) {
      hasTailwindVar = true
    }
    if (PREFLIGHT_RESET_PROPS.has(decl.prop)) {
      hasResetProp = true
    }
  })

  return hasTailwindVar || hasResetProp
}

function isCustomPropertyOnlyRule(rule: postcss.Rule) {
  let hasDeclaration = false
  let allCustomProperties = true

  rule.each((node) => {
    if (node.type !== 'decl') {
      return
    }
    hasDeclaration = true
    if (!node.prop.startsWith('--')) {
      allCustomProperties = false
    }
  })

  return hasDeclaration && allCustomProperties
}

function hasContentInitDeclaration(rule: postcss.Rule) {
  let hasContentInit = false
  rule.walkDecls('--tw-content', () => {
    hasContentInit = true
  })
  return hasContentInit
}

function isEmptyContentInitDeclaration(decl: postcss.Declaration) {
  return decl.prop === '--tw-content' && (decl.value === '""' || decl.value === '\'\'')
}

function usesTwContentVariable(root: postcss.Root) {
  let used = false
  root.walkDecls((decl) => {
    if (CONTENT_VAR_RE.test(decl.value)) {
      used = true
    }
  })
  return used
}

function isTailwindPreflightRule(node: postcss.Node): node is postcss.Rule {
  if (node.type !== 'rule' || node.parent?.type !== 'root') {
    return false
  }
  const rule = node as postcss.Rule
  const selectors = getRuleSelectors(rule)
  return isMiniProgramPreflightSelector(selectors) && hasTailwindPreflightDeclaration(rule)
}

function isMiniProgramThemeVariableRule(node: postcss.Node): node is postcss.Rule {
  if (node.type !== 'rule' || node.parent?.type !== 'root') {
    return false
  }
  const rule = node as postcss.Rule
  const selectors = getRuleSelectors(rule)
  return isMiniProgramThemeScopeSelector(selectors) && isCustomPropertyOnlyRule(rule)
}

function createPseudoContentInitRule() {
  const rule = postcss.rule({
    selector: '::before,\n::after',
  })
  rule.append({
    prop: '--tw-content',
    value: '\'\'',
  })
  return rule
}

function collectPreflightRules(root: postcss.Root, options: { preservePseudoContentInit?: boolean } = {}) {
  const preflightNodes: postcss.Rule[] = []
  let hasContentInit = false

  for (const node of root.nodes ?? []) {
    if (isTailwindPreflightRule(node)) {
      preflightNodes.push(node)
      if (hasContentInitDeclaration(node)) {
        hasContentInit = true
      }
    }
  }

  if (preflightNodes.length === 0) {
    return []
  }

  const clonedPreflightRules = preflightNodes.map(node => node.clone())
  const contentInitRules = options.preservePseudoContentInit
    ? clonedPreflightRules.filter(rule => hasContentInitDeclaration(rule))
    : []
  const otherPreflightRules = clonedPreflightRules.filter(rule => !hasContentInitDeclaration(rule))
  const preflightRules = hasContentInit
    ? [...contentInitRules, ...otherPreflightRules]
    : [
        ...(options.preservePseudoContentInit ? [createPseudoContentInitRule()] : []),
        ...otherPreflightRules,
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
    selector: 'view,text,:after,:before',
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
      if (!shouldPreserveContentInit && isEmptyContentInitDeclaration(decl)) {
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
    if (isTailwindPreflightRule(node) || isMiniProgramThemeVariableRule(node)) {
      const anchor = postcss.comment({
        text: HOIST_ANCHOR_COMMENT,
      })
      node.before(anchor)
      return anchor
    }
  }
}

function insertHoistedRules(root: postcss.Root, rules: postcss.Rule[], anchor?: postcss.Comment) {
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

function unwrapTailwindSourceMedia(root: postcss.Root) {
  root.walkAtRules('media', (atRule) => {
    if (atRule.params.startsWith('source(') && atRule.nodes && atRule.nodes.length > 0) {
      atRule.replaceWith(...atRule.nodes)
    }
  })
}

function finalizeMiniProgramCssRoot(root: postcss.Root, options: FinalizeMiniProgramCssOptions = {}) {
  removeUnsupportedCascadeLayers(root)
  unwrapTailwindSourceMedia(root)
  root.walkAtRules('property', (atRule) => {
    atRule.remove()
  })
  removeSpecificityPlaceholders(root)
  removeUnsupportedBrowserSelectors(root)
  removeDisplayP3Declarations(root)
  removeUnsupportedModernColorDeclarations(root)
  root.walkDecls((decl) => {
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
  const themeRule = collectThemeVariableRule(root, options)
  const hoistedRules = themeRule ? [...preflightRules, themeRule] : preflightRules
  insertHoistedRules(root, hoistedRules, hoistAnchor)
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
  const cleanedCss = removeUnsupportedMiniProgramAtRules(css)
  try {
    const root = postcss.parse(cleanedCss)
    finalizeMiniProgramCssRoot(root, options)
    return root.toString()
  }
  catch {
    return cleanedCss
  }
}
