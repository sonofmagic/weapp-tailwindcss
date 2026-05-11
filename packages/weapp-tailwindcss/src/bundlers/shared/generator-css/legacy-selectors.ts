import postcss from 'postcss'
import { replaceWxml } from '@/wxml'
import { VITE_MARKER_RE } from './markers'

const CLASS_SELECTOR_RE = /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i
const MINI_PROGRAM_THEME_SCOPE_SELECTORS = new Set([':host', 'page', '.tw-root', 'wx-root-portal-content'])
const SPECIFICITY_PLACEHOLDER_RE = /:not\(#(?:\\#|n)\)/g

function normalizeCompatSelector(selector: string) {
  return selector
    .replace(SPECIFICITY_PLACEHOLDER_RE, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isClassSelectorTerminator(char: string) {
  return /[\s>+~#,.:()[\]]/.test(char)
}

function unescapeSimpleCssIdent(value: string) {
  return value.replaceAll(/\\(.)/g, '$1')
}

function escapeCompatSelectorClasses(selector: string) {
  let result = ''
  let index = 0
  let changed = false
  while (index < selector.length) {
    const char = selector[index]
    if (char !== '.') {
      result += char
      index += 1
      continue
    }

    let end = index + 1
    let className = ''
    while (end < selector.length) {
      const current = selector[end]
      if (current === '\\' && end + 1 < selector.length) {
        className += current + selector[end + 1]
        end += 2
        continue
      }
      if (isClassSelectorTerminator(current)) {
        break
      }
      className += current
      end += 1
    }

    if (className.includes('\\')) {
      result += `.${replaceWxml(unescapeSimpleCssIdent(className))}`
      changed = true
    }
    else {
      result += `.${className}`
    }
    index = end
  }
  return changed ? result : selector
}

export function normalizeCompatSelectors(selector: string) {
  const normalized = normalizeCompatSelector(selector)
  if (!normalized) {
    return []
  }
  const selectors = new Set([normalized])
  const escaped = normalizeCompatSelector(escapeCompatSelectorClasses(normalized))
  if (escaped) {
    selectors.add(escaped)
  }
  return [...selectors]
}

function normalizeCssSelector(selector: string) {
  return selector.trim().replace(/\s+/g, '')
}

function getCompatSelectorKeys(selector: string) {
  return normalizeCompatSelectors(selector).map(normalizeCssSelector)
}

function getRuleCompatSelectorKeys(rule: postcss.Rule) {
  return (rule.selectors?.length ? rule.selectors : [rule.selector])
    .flatMap(selector => getCompatSelectorKeys(selector))
}

function hasClassSelector(selector: string) {
  return CLASS_SELECTOR_RE.test(selector)
}

function getNormalizedSelectorList(selector: string) {
  return selector.split(',').map(normalizeCssSelector).filter(Boolean)
}

function isMiniProgramThemeScopeSelector(selector: string) {
  const selectors = getNormalizedSelectorList(selector)
  return selectors.length > 0
    && selectors.every(item => MINI_PROGRAM_THEME_SCOPE_SELECTORS.has(item))
}

function hasUtilityClassSelector(selector: string) {
  return hasClassSelector(selector) && !isMiniProgramThemeScopeSelector(selector)
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

function isPseudoContentInitRule(rule: postcss.Rule) {
  let hasDeclaration = false
  let onlyContentVariable = true

  rule.each((node) => {
    if (node.type !== 'decl') {
      return
    }
    hasDeclaration = true
    if (node.prop !== '--tw-content') {
      onlyContentVariable = false
    }
  })

  return hasDeclaration && onlyContentVariable
}

export function collectGeneratedSelectors(css: string) {
  const selectors = new Set<string>()
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      if (isCustomPropertyOnlyRule(rule) && !isPseudoContentInitRule(rule) && !hasUtilityClassSelector(rule.selector)) {
        return
      }
      for (const selector of getRuleCompatSelectorKeys(rule)) {
        selectors.add(selector)
      }
    })
  }
  catch {
    return selectors
  }
  return selectors
}

export function removeGeneratedSelectorCompatCss(css: string, generatedCss: string) {
  const generatedSelectors = collectGeneratedSelectors(generatedCss)
  if (generatedSelectors.size === 0) {
    return css
  }

  try {
    const root = postcss.parse(css)
    let removed = false
    root.walkRules((rule) => {
      if (isPseudoContentInitRule(rule)) {
        rule.remove()
        removed = true
        return
      }
      if (isCustomPropertyOnlyRule(rule) && !isPseudoContentInitRule(rule) && !hasUtilityClassSelector(rule.selector)) {
        return
      }
      if (getRuleCompatSelectorKeys(rule).some(selector => generatedSelectors.has(selector))) {
        rule.remove()
        removed = true
      }
    })
    root.walkAtRules((atRule) => {
      if (atRule.nodes && atRule.nodes.length === 0) {
        atRule.remove()
      }
    })
    return removed ? root.toString() : css
  }
  catch {
    return css
  }
}

export function collectDedupedPostTransformCompatCss(css: string, generatedCss: string) {
  const generatedSelectors = collectGeneratedSelectors(generatedCss)
  if (generatedSelectors.size === 0) {
    return css
  }

  const preservedNodes: postcss.Node[] = []
  try {
    const root = postcss.parse(css)
    root.each((node) => {
      if (node.type === 'rule' && getRuleCompatSelectorKeys(node).some(selector => generatedSelectors.has(selector))) {
        if (isCustomPropertyOnlyRule(node) && !isPseudoContentInitRule(node) && !hasUtilityClassSelector(node.selector)) {
          const declarationProps = new Set<string>()
          node.walkDecls((decl) => {
            declarationProps.add(decl.prop)
          })
          const generatedRoot = postcss.parse(generatedCss)
          generatedRoot.walkRules((rule) => {
            const nodeSelectors = new Set(getRuleCompatSelectorKeys(node))
            if (!getRuleCompatSelectorKeys(rule).some(selector => nodeSelectors.has(selector))) {
              return
            }
            rule.walkDecls((decl) => {
              declarationProps.delete(decl.prop)
            })
          })
          const nextRule = node.clone()
          nextRule.walkDecls((decl) => {
            if (!declarationProps.has(decl.prop)) {
              decl.remove()
            }
          })
          if (nextRule.nodes.length > 0) {
            preservedNodes.push(nextRule)
          }
        }
        return
      }
      preservedNodes.push(node.clone())
    })
    if (preservedNodes.length === root.nodes.length) {
      return css
    }
    const nextRoot = postcss.root()
    nextRoot.append(preservedNodes)
    return nextRoot.toString()
  }
  catch {
    return css
  }
}

export function removeDuplicatedViteMarkers(css: string, baseCss: string) {
  if (!VITE_MARKER_RE.test(baseCss)) {
    return css
  }
  VITE_MARKER_RE.lastIndex = 0
  return css.replace(VITE_MARKER_RE, '')
}
