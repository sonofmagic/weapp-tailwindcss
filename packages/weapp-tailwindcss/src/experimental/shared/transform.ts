import type { IJsHandlerOptions } from '../../types'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { shouldTransformClassNameCandidate } from '../../shared/classname-transform'
import { decodeUnicode2 } from '../../utils/decode'
import { getPattern, getReplacement } from './cache'

export function shouldTransformClassName(
  candidate: string,
  options: Pick<IJsHandlerOptions, 'alwaysEscape' | 'classNameSet' | 'staleClassNameFallback' | 'jsPreserveClass'>,
) {
  return shouldTransformClassNameCandidate(candidate, options)
}

export function transformLiteralText(
  literal: string,
  options: IJsHandlerOptions,
): string | undefined {
  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const source = options.unescapeUnicode && literal.includes('\\u') ? decodeUnicode2(literal) : literal
  if (!options.alwaysEscape && (!options.classNameSet || options.classNameSet.size === 0) && !options.staleClassNameFallback) {
    return undefined
  }
  const candidates = splitCode(source, allowDoubleQuotes)
  if (candidates.length === 0) {
    return undefined
  }

  let transformed = source
  let mutated = false
  for (const candidate of candidates) {
    if (!shouldTransformClassNameCandidate(candidate, options)) {
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
