import type { AtRule, Declaration } from 'postcss'

const PRESERVED_WEBKIT_DECLARATION_PROPS = new Set([
  '-webkit-box-orient',
  '-webkit-line-clamp',
  '-webkit-overflow-scrolling',
  '-webkit-text-fill-color',
  '-webkit-text-stroke',
  '-webkit-text-stroke-color',
  '-webkit-text-stroke-width',
])

const PRESERVED_WEBKIT_VALUE_DECLARATIONS = new Map<string, Set<string>>([
  ['display', new Set(['-webkit-box'])],
  ['-webkit-background-clip', new Set(['text'])],
])

const TRANSITION_PROPS = new Set([
  'transition',
  'transition-property',
])

function splitTopLevelCommaList(value: string) {
  const parts: string[] = []
  let start = 0
  let depth = 0
  let quote: string | undefined
  let escaped = false

  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (char === quote) {
        quote = undefined
      }
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '(') {
      depth++
      continue
    }
    if (char === ')') {
      depth = Math.max(0, depth - 1)
      continue
    }
    if (char === ',' && depth === 0) {
      parts.push(value.slice(start, i))
      start = i + 1
    }
  }

  parts.push(value.slice(start))
  return parts
}

function isPreservedWebkitDeclaration(decl: Declaration) {
  const prop = decl.prop.toLowerCase()
  if (prop.startsWith('-webkit-mask')) {
    return true
  }
  if (PRESERVED_WEBKIT_DECLARATION_PROPS.has(prop)) {
    return true
  }

  const preservedValues = PRESERVED_WEBKIT_VALUE_DECLARATIONS.get(prop)
  return preservedValues?.has(decl.value.trim().toLowerCase()) ?? false
}

function normalizeTransitionValue(value: string) {
  return splitTopLevelCommaList(value)
    .map(part => part.trim())
    .filter(part => part.length > 0 && !part.toLowerCase().startsWith('-webkit-'))
    .join(', ')
}

function hasUnsupportedWebkitKeywordValue(decl: Declaration) {
  const value = decl.value.trim().toLowerCase()
  if (!value.startsWith('-webkit-')) {
    return false
  }
  const preservedValues = PRESERVED_WEBKIT_VALUE_DECLARATIONS.get(decl.prop.toLowerCase())
  if (preservedValues?.has(value)) {
    return false
  }
  return /^-webkit-[\w-]+$/.test(value)
}

/**
 * 收敛小程序 CSS 中的 WebKit 前缀，只保留 WXSS 里有实际价值的兼容写法。
 */
export function normalizeMiniProgramPrefixedDeclaration(decl: Declaration) {
  const prop = decl.prop.toLowerCase()
  if (TRANSITION_PROPS.has(prop) && decl.value.toLowerCase().includes('-webkit-')) {
    const value = normalizeTransitionValue(decl.value)
    if (value.length === 0) {
      decl.remove()
      return
    }
    decl.value = value
  }

  if (prop.startsWith('-webkit-') && !isPreservedWebkitDeclaration(decl)) {
    decl.remove()
    return
  }

  if (hasUnsupportedWebkitKeywordValue(decl)) {
    decl.remove()
  }
}

export function removeUnsupportedMiniProgramPrefixedAtRule(atRule: AtRule) {
  if (atRule.name.toLowerCase() === '-webkit-keyframes') {
    atRule.remove()
  }
}
