import type { IJsHandlerOptions } from '../types'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { resolveClassNameTransformWithResult, shouldEnableArbitraryValueFallback } from '../shared/classname-transform'
import { decodeUnicode2 } from '../utils/decode'
import { replaceWxml } from '../wxml/shared'

type EscapeMap = NonNullable<IJsHandlerOptions['escapeMap']>

const replacementCacheByEscapeMap = new WeakMap<EscapeMap, Map<string, string>>()
const defaultReplacementCache = new Map<string, string>()

function getReplacementCacheStore(escapeMap?: EscapeMap) {
  if (!escapeMap) {
    return defaultReplacementCache
  }

  let store = replacementCacheByEscapeMap.get(escapeMap)
  if (!store) {
    store = new Map<string, string>()
    replacementCacheByEscapeMap.set(escapeMap, store)
  }
  return store
}

function getReplacement(
  candidate: string,
  escapeMap: EscapeMap | undefined,
  store = getReplacementCacheStore(escapeMap),
) {
  let cached = store.get(candidate)
  if (cached === undefined) {
    cached = replaceWxml(candidate, { escapeMap })
    store.set(candidate, cached)
  }
  return cached
}

export function transformLiteralText(
  literal: string,
  options: IJsHandlerOptions,
): string | undefined {
  const fallbackEnabled = shouldEnableArbitraryValueFallback(options)
  if (!options.alwaysEscape && !fallbackEnabled && (!options.classNameSet || options.classNameSet.size === 0)) {
    return undefined
  }

  const allowDoubleQuotes = options.arbitraryValues?.allowDoubleQuotes
  const source = options.unescapeUnicode && literal.includes('\\u') ? decodeUnicode2(literal) : literal
  const candidates = splitCode(source, allowDoubleQuotes)
  if (candidates.length === 0) {
    return undefined
  }

  const transformOptions = {
    ...options,
    classContext: true,
  }
  const replacementCache = getReplacementCacheStore(options.escapeMap)
  let transformed = source
  let mutated = false

  for (const candidate of candidates) {
    const result = resolveClassNameTransformWithResult(candidate, transformOptions)
    if (result.decision === 'skip' || !transformed.includes(candidate)) {
      continue
    }

    const replacement = result.decision === 'escaped' && result.escapedValue
      ? result.escapedValue
      : getReplacement(candidate, options.escapeMap, replacementCache)
    const replaced = transformed.replace(candidate, replacement)
    if (replaced !== transformed) {
      transformed = replaced
      mutated = true
    }
  }

  return mutated ? transformed : undefined
}
