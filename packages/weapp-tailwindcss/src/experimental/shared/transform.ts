import type { IJsHandlerOptions } from '../../types'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { decodeUnicode2 } from '../../utils/decode'
import { getPattern, getReplacement } from './cache'

export function shouldTransformClassName(
  candidate: string,
  {
    alwaysEscape,
    classNameSet,
    jsPreserveClass,
  }: Pick<IJsHandlerOptions, 'alwaysEscape' | 'classNameSet' | 'jsPreserveClass'>,
) {
  if (alwaysEscape) {
    return true
  }
  if (!classNameSet || classNameSet.size === 0) {
    return false
  }
  if (!classNameSet.has(candidate)) {
    return false
  }
  return !jsPreserveClass?.(candidate)
}

/**
 * Compute the transformed literal string given the raw literal text (no quotes).
 * Returns undefined when nothing changes.
 */
export function transformLiteralText(
  literal: string,
  options: IJsHandlerOptions,
): string | undefined {
  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const source = options.unescapeUnicode && literal.includes('\\u') ? decodeUnicode2(literal) : literal
  const candidates = splitCode(source, allowDoubleQuotes)
  if (candidates.length === 0) {
    return undefined
  }

  let transformed = source
  let mutated = false
  for (const candidate of candidates) {
    if (!shouldTransformClassName(candidate, options)) {
      continue
    }
    if (!transformed.includes(candidate)) {
      continue
    }
    const pattern = getPattern(candidate)
    const replacement = getReplacement(candidate, options.escapeMap)
    const replaced = transformed.replace(pattern, replacement)
    if (replaced !== transformed) {
      transformed = replaced
      mutated = true
    }
  }
  if (!mutated) {
    return undefined
  }
  return transformed
}
