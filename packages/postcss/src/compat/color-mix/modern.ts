import valueParser from 'postcss-value-parser'
import {
  COLOR_MIX_NAME,
  MODERN_COLOR_FUNCTION_NAMES,
  MODERN_COLOR_SYNTAX_FUNCTION_NAMES,
} from './constants'

export function isDisplayP3ColorFunction(colorSource: string) {
  return /^color\(\s*display-p3\b/i.test(colorSource.trim())
}

export function isModernColorSyntaxFunction(colorSource: string) {
  const parsed = valueParser(colorSource.trim())
  const node = parsed.nodes.length === 1 ? parsed.nodes[0] : undefined
  if (node?.type !== 'function') {
    return false
  }
  const name = node.value.toLowerCase()
  if (!MODERN_COLOR_SYNTAX_FUNCTION_NAMES.has(name)) {
    return false
  }
  return !node.nodes.some(child => child.type === 'div' && child.value === ',')
}

export function hasUnsupportedModernColorFunction(value: string) {
  const parsed = valueParser(value)
  let hasUnsupported = false

  parsed.walk((node) => {
    if (node.type !== 'function') {
      return
    }
    const name = node.value.toLowerCase()
    if (
      name === COLOR_MIX_NAME
      || MODERN_COLOR_FUNCTION_NAMES.has(name)
      || (name === 'color' && isDisplayP3ColorFunction(valueParser.stringify(node)))
      || isModernColorSyntaxFunction(valueParser.stringify(node))
    ) {
      hasUnsupported = true
      return false
    }
  })

  return hasUnsupported
}
