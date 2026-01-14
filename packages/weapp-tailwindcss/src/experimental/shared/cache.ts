import type { IJsHandlerOptions } from '../../types'
import { escapeStringRegexp } from '@weapp-core/regex'
import { replaceWxml } from '../../wxml/shared'

const patternCache = new Map<string, RegExp>()
const replacementCacheByEscapeMap = new WeakMap<NonNullable<IJsHandlerOptions['escapeMap']>, Map<string, string>>()
const defaultReplacementCache = new Map<string, string>()

export function getPattern(candidate: string) {
  let cached = patternCache.get(candidate)
  if (!cached) {
    cached = new RegExp(escapeStringRegexp(candidate))
    patternCache.set(candidate, cached)
  }
  return cached
}

export function getReplacement(
  candidate: string,
  escapeMap?: NonNullable<IJsHandlerOptions['escapeMap']>,
) {
  if (!escapeMap) {
    let cached = defaultReplacementCache.get(candidate)
    if (cached === undefined) {
      cached = replaceWxml(candidate, { escapeMap })
      defaultReplacementCache.set(candidate, cached)
    }
    return cached
  }

  let store = replacementCacheByEscapeMap.get(escapeMap)
  if (!store) {
    store = new Map<string, string>()
    replacementCacheByEscapeMap.set(escapeMap, store)
  }

  let cached = store.get(candidate)
  if (cached === undefined) {
    cached = replaceWxml(candidate, { escapeMap })
    store.set(candidate, cached)
  }
  return cached
}
