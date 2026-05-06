import postcss from 'postcss'

const MINI_PROGRAM_PREFLIGHT_SELECTORS = new Set([
  '*',
  'view',
  'text',
  ':before',
  ':after',
  '::before',
  '::after',
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

export function hoistTailwindPreflightBase(css: string) {
  try {
    const root = postcss.parse(css)
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
      return css
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

    preflightRules[0]!.raws.before = ''
    root.prepend(...preflightRules)
    return root.toString()
  }
  catch {
    return css
  }
}
