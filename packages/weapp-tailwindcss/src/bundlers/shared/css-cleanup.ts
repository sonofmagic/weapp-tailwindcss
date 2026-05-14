import postcss from 'postcss'
import { removeUnsupportedCascadeLayers } from '@/tailwindcss/remove-unsupported-css'
import { removeUnsupportedMiniProgramAtRules } from './css-cleanup/at-rules'
import { isDisplayP3Declaration } from './css-cleanup/color-gamut'
import { removeDisplayP3Declarations, removeSpecificityPlaceholders, removeUnsupportedBrowserSelectors } from './css-cleanup/root-cleanups'
import { getRuleSelectors, MINI_PROGRAM_PREFLIGHT_SELECTORS, MINI_PROGRAM_THEME_SCOPE_SELECTOR, MINI_PROGRAM_THEME_SCOPE_SELECTORS } from './css-cleanup/selectors'

export { removeUnsupportedAtSupports, removeUnsupportedMiniProgramAtRules } from './css-cleanup/at-rules'

const PREFLIGHT_RESET_PROPS = new Set([
  'box-sizing',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'margin',
  'padding',
])

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

function collectPreflightRules(root: postcss.Root) {
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
  const contentInitRules = clonedPreflightRules.filter(rule => hasContentInitDeclaration(rule))
  const otherPreflightRules = clonedPreflightRules.filter(rule => !hasContentInitDeclaration(rule))
  const preflightRules = hasContentInit
    ? [...contentInitRules, ...otherPreflightRules]
    : [createPseudoContentInitRule(), ...otherPreflightRules]
  for (const node of preflightNodes) {
    node.remove()
  }

  return preflightRules
}

function collectThemeVariableRule(root: postcss.Root) {
  const themeRules: postcss.Rule[] = []
  const declarations = new Map<string, postcss.Declaration>()

  for (const node of root.nodes ?? []) {
    if (!isMiniProgramThemeVariableRule(node)) {
      continue
    }

    themeRules.push(node)
    node.walkDecls((decl) => {
      if (isDisplayP3Declaration(decl)) {
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

function insertHoistedRules(root: postcss.Root, rules: postcss.Rule[]) {
  if (rules.length === 0) {
    return
  }

  const topDirectiveTail = getTopDirectiveTail(root)
  const firstRule = rules[0]
  if (!firstRule) {
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

function finalizeMiniProgramCssRoot(root: postcss.Root) {
  removeUnsupportedCascadeLayers(root)
  root.walkAtRules('property', (atRule) => {
    atRule.remove()
  })
  removeSpecificityPlaceholders(root)
  removeUnsupportedBrowserSelectors(root)
  removeDisplayP3Declarations(root)

  const preflightRules = collectPreflightRules(root)
  const themeRule = collectThemeVariableRule(root)
  const hoistedRules = themeRule ? [...preflightRules, themeRule] : preflightRules
  insertHoistedRules(root, hoistedRules)
}

export function hoistTailwindPreflightBase(css: string) {
  try {
    const root = postcss.parse(css)
    const preflightRules = collectPreflightRules(root)
    insertHoistedRules(root, preflightRules)
    return root.toString()
  }
  catch {
    return css
  }
}

export function finalizeMiniProgramCss(css: string) {
  const cleanedCss = removeUnsupportedMiniProgramAtRules(css)
  try {
    const root = postcss.parse(cleanedCss)
    finalizeMiniProgramCssRoot(root)
    return root.toString()
  }
  catch {
    return cleanedCss
  }
}
