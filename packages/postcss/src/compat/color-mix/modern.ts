import valueParser from 'postcss-value-parser'
import {
  COLOR_MIX_NAME,
  MODERN_COLOR_FUNCTION_NAMES,
} from './constants'

export function isDisplayP3ColorFunction(colorSource: string) {
  return /^color\(\s*display-p3\b/i.test(colorSource.trim())
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
    ) {
      hasUnsupported = true
      return false
    }
  })

  return hasUnsupported
}
