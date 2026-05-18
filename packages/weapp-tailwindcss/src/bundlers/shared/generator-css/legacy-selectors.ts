import postcss from 'postcss'
import { replaceWxml } from '@/wxml'
import { VITE_MARKER_RE } from './markers'

const CLASS_SELECTOR_RE = /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i
const MINI_PROGRAM_THEME_SCOPE_SELECTORS = new Set([':host', 'page', '.tw-root', 'wx-root-portal-content'])
const SPECIFICITY_PLACEHOLDER_RE = /:not\(#(?:\\#|n)\)/g
const SELECTOR_CACHE_LIMIT = 64
const generatedSelectorCache = new Map<string, Set<string>>()

function setGeneratedSelectorCache(css: string, selectors: Set<string>) {
  if (generatedSelectorCache.size >= SELECTOR_CACHE_LIMIT) {
    const firstKey = generatedSelectorCache.keys().next().value
    if (firstKey !== undefined) {
      generatedSelectorCache.delete(firstKey)
    }
  }
  generatedSelectorCache.set(css, selectors)
}

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
      if (current === undefined) {
        break
      }
      if (current === '\\' && end + 1 < selector.length) {
        const escaped = selector[end + 1]
        if (escaped === undefined) {
          break
        }
        className += current + escaped
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
  const cached = generatedSelectorCache.get(css)
  if (cached) {
    return cached
  }

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
  setGeneratedSelectorCache(css, selectors)
  return selectors
}

function collectGeneratedDeclarationPropsBySelector(generatedCss: string, selectors: Set<string>) {
  const propsBySelector = new Map<string, Set<string>>()
  try {
    const generatedRoot = postcss.parse(generatedCss)
    generatedRoot.walkRules((rule) => {
      const matchedSelectors = getRuleCompatSelectorKeys(rule).filter(selector => selectors.has(selector))
      if (matchedSelectors.length === 0) {
        return
      }
      const props = new Set<string>()
      rule.walkDecls((decl) => {
        props.add(decl.prop)
      })
      for (const selector of matchedSelectors) {
        const existing = propsBySelector.get(selector)
        if (existing) {
          for (const prop of props) {
            existing.add(prop)
          }
        }
        else {
          propsBySelector.set(selector, new Set(props))
        }
      }
    })
  }
  catch {
    return propsBySelector
  }
  return propsBySelector
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
  const generatedDeclarationPropsBySelector = collectGeneratedDeclarationPropsBySelector(generatedCss, generatedSelectors)

  const preservedNodes: postcss.Node[] = []
  try {
    const root = postcss.parse(css)
    root.each((node) => {
      if (node.type === 'rule') {
        const nodeSelectors = getRuleCompatSelectorKeys(node)
        const duplicated = nodeSelectors.some(selector => generatedSelectors.has(selector))
        if (!duplicated) {
          preservedNodes.push(node.clone())
          return
        }
        if (isCustomPropertyOnlyRule(node) && !isPseudoContentInitRule(node) && !hasUtilityClassSelector(node.selector)) {
          const declarationProps = new Set<string>()
          node.walkDecls((decl) => {
            declarationProps.add(decl.prop)
          })
          for (const selector of nodeSelectors) {
            const generatedProps = generatedDeclarationPropsBySelector.get(selector)
            if (!generatedProps) {
              continue
            }
            for (const prop of generatedProps) {
              declarationProps.delete(prop)
            }
          }
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
