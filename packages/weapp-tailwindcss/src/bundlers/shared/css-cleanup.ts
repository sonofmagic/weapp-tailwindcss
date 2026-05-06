import postcss from 'postcss'
import { removeUnsupportedCascadeLayers } from '@/tailwindcss/remove-unsupported-css'

const MINI_PROGRAM_PREFLIGHT_SELECTORS = new Set([
  '*',
  'view',
  'text',
  ':before',
  ':after',
  '::before',
  '::after',
])

const MINI_PROGRAM_THEME_SCOPE_SELECTOR = ':host,page,.tw-root,wx-root-portal-content'
const MINI_PROGRAM_THEME_SCOPE_SELECTORS = new Set([
  ':host',
  ':root',
  'page',
  '.tw-root',
  'wx-root-portal-content',
])
const SPECIFICITY_PLACEHOLDER_SUFFIXES = [':not(#n)', ':not(#\\#)']
const MINI_PROGRAM_UNSUPPORTED_BROWSER_SELECTORS = new Set([
  ':-moz-focusring',
  ':-moz-ui-invalid',
  '::-webkit-calendar-picker-indicator',
  '::-webkit-date-and-time-value',
  '::-webkit-datetime-edit',
  '::-webkit-datetime-edit-day-field',
  '::-webkit-datetime-edit-fields-wrapper',
  '::-webkit-datetime-edit-hour-field',
  '::-webkit-datetime-edit-meridiem-field',
  '::-webkit-datetime-edit-millisecond-field',
  '::-webkit-datetime-edit-minute-field',
  '::-webkit-datetime-edit-month-field',
  '::-webkit-datetime-edit-second-field',
  '::-webkit-datetime-edit-year-field',
  '::-webkit-inner-spin-button',
  '::-webkit-input-placeholder',
  '::-webkit-outer-spin-button',
  '::-webkit-search-decoration',
  '::placeholder',
  '[hidden]:where(:not([hidden=\'until-found\']))',
])
const MINI_PROGRAM_UNSUPPORTED_BROWSER_TAG_SELECTORS = new Set([
  'a',
  'abbr:where([title])',
  'audio',
  'b',
  'button',
  'canvas',
  'code',
  'embed',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'html',
  'iframe',
  'img',
  'input',
  'input:where([type=\'button\'],[type=\'reset\'],[type=\'submit\'])',
  'kbd',
  'menu',
  'object',
  'ol',
  'optgroup',
  'pre',
  'progress',
  'samp',
  'select',
  'select[multiple]optgroup',
  'select[multiple]optgroupoption',
  'select[size]optgroup',
  'select[size]optgroupoption',
  'small',
  'strong',
  'sub',
  'summary',
  'sup',
  'svg',
  'table',
])

const PREFLIGHT_RESET_PROPS = new Set([
  'box-sizing',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'margin',
  'padding',
])

const DISPLAY_P3_VALUE_RE = /color\(\s*display-p3\b/i
const COLOR_GAMUT_P3_RE = /\(\s*color-gamut\s*:\s*p3\s*\)/i
const UNSUPPORTED_FONT_VALUE_RE = /\bui-(?:sans-serif|monospace)\b|var\(\s*--(?:font-(?:sans|serif|mono)|default-(?:mono-)?font-(?:family|feature-settings|variation-settings))\b/i
const UNSUPPORTED_FONT_DECLARATION_PROPS = new Set([
  'font-family',
  'font-feature-settings',
  '-webkit-font-feature-settings',
  'font-variation-settings',
])
const UNSUPPORTED_FONT_THEME_PROPS = new Set([
  '--font-sans',
  '--font-serif',
  '--font-mono',
  '--default-font-family',
  '--default-font-feature-settings',
  '--default-font-variation-settings',
  '--default-mono-font-family',
  '--default-mono-font-feature-settings',
  '--default-mono-font-variation-settings',
])

function removeAtSupportsByScan(css: string) {
  let index = 0
  let result = ''

  while (index < css.length) {
    const start = css.indexOf('@supports', index)
    if (start === -1) {
      result += css.slice(index)
      break
    }

    result += css.slice(index, start)
    const blockStart = css.indexOf('{', start)
    if (blockStart === -1) {
      result += css.slice(start)
      break
    }

    let depth = 0
    let cursor = blockStart
    for (; cursor < css.length; cursor++) {
      const char = css[cursor]
      if (char === '{') {
        depth++
      }
      else if (char === '}') {
        depth--
        if (depth === 0) {
          cursor++
          break
        }
      }
    }

    index = cursor
  }

  return result
}

export function removeUnsupportedAtSupports(css: string) {
  try {
    const root = postcss.parse(css)
    root.walkAtRules('supports', (atRule) => {
      atRule.remove()
    })
    root.walkAtRules((atRule) => {
      if (!atRule.nodes || atRule.nodes.length === 0) {
        atRule.remove()
      }
    })
    return root.toString()
  }
  catch {
    return removeAtSupportsByScan(css)
  }
}

function normalizeSelector(selector: string) {
  return selector.trim().replace(/\s+/g, '')
}

function getRuleSelectors(rule: postcss.Rule) {
  return rule.selector
    .split(',')
    .map(normalizeSelector)
    .filter(Boolean)
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

function isTailwindPreflightRule(node: postcss.Node): node is postcss.Rule {
  if (node.type !== 'rule' || node.parent?.type !== 'root') {
    return false
  }
  const selectors = getRuleSelectors(node)
  return isMiniProgramPreflightSelector(selectors) && hasTailwindPreflightDeclaration(node)
}

function isMiniProgramThemeVariableRule(node: postcss.Node): node is postcss.Rule {
  if (node.type !== 'rule' || node.parent?.type !== 'root') {
    return false
  }
  const selectors = getRuleSelectors(node)
  return isMiniProgramThemeScopeSelector(selectors) && isCustomPropertyOnlyRule(node)
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

function isDisplayP3MediaRule(atRule: postcss.AtRule) {
  return atRule.name === 'media' && COLOR_GAMUT_P3_RE.test(atRule.params)
}

function isDisplayP3Declaration(decl: postcss.Declaration) {
  return DISPLAY_P3_VALUE_RE.test(decl.value)
}

function isUnsupportedFontThemeDeclaration(decl: postcss.Declaration) {
  return UNSUPPORTED_FONT_THEME_PROPS.has(decl.prop)
    || decl.prop.startsWith('--font-sans--')
    || decl.prop.startsWith('--font-serif--')
    || decl.prop.startsWith('--font-mono--')
}

function isUnsupportedFontDeclaration(decl: postcss.Declaration) {
  return UNSUPPORTED_FONT_DECLARATION_PROPS.has(decl.prop)
    && UNSUPPORTED_FONT_VALUE_RE.test(decl.value)
}

function removeSpecificityPlaceholders(root: postcss.Root) {
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

function isUnsupportedBrowserSelector(selector: string) {
  const normalized = normalizeSelector(selector)
  return MINI_PROGRAM_UNSUPPORTED_BROWSER_SELECTORS.has(normalized)
    || MINI_PROGRAM_UNSUPPORTED_BROWSER_TAG_SELECTORS.has(normalized)
}

function removeUnsupportedBrowserSelectors(root: postcss.Root) {
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

function removeEmptyAtRuleAncestors(parent: postcss.Container | undefined) {
  while (parent?.type === 'atrule' && (!parent.nodes || parent.nodes.length === 0)) {
    const nextParent = parent.parent
    parent.remove()
    parent = nextParent
  }
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

function removeDisplayP3AndUnsupportedFontDeclarations(root: postcss.Root) {
  root.walkAtRules((atRule) => {
    if (isDisplayP3MediaRule(atRule)) {
      const parent = atRule.parent
      atRule.remove()
      removeEmptyAtRuleAncestors(parent)
    }
  })

  root.walkDecls((decl) => {
    if (
      isDisplayP3Declaration(decl)
      || isUnsupportedFontDeclaration(decl)
      || isUnsupportedFontThemeDeclaration(decl)
    ) {
      removeDeclarationAndEmptyRule(decl)
    }
  })
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
      if (isDisplayP3Declaration(decl) || isUnsupportedFontThemeDeclaration(decl)) {
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
  rules[0]!.raws.before = topDirectiveTail ? '\n' : ''
  if (topDirectiveTail) {
    topDirectiveTail.after(...rules)
  }
  else {
    root.prepend(...rules)
  }
}

function finalizeMiniProgramCssRoot(root: postcss.Root) {
  removeUnsupportedCascadeLayers(root)
  removeSpecificityPlaceholders(root)
  removeUnsupportedBrowserSelectors(root)
  removeDisplayP3AndUnsupportedFontDeclarations(root)

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
  const cleanedCss = removeUnsupportedAtSupports(css)
  try {
    const root = postcss.parse(cleanedCss)
    finalizeMiniProgramCssRoot(root)
    return root.toString()
  }
  catch {
    return cleanedCss
  }
}
