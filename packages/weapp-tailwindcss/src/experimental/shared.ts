/**
 * Experimental shared helpers for SWC/OXC POCs.
 * These helpers intentionally mirror the light‑weight, token‑based writeback
 * strategy used by the Babel implementation to avoid re-printing the AST and
 * preserve original formatting.
 *
 * NOTE: These files are not wired into the public build. They are here as POCs.
 * To run them, you must add the corresponding deps (@swc/core or an OXC parser)
 * and write a tiny harness in your app/tests.
 */
import type { IJsHandlerOptions } from '../types'
import { escapeStringRegexp } from '@weapp-core/regex'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { decodeUnicode2 } from '../utils/decode'
import { replaceWxml } from '../wxml/shared'

// Local caches similar to src/js/handlers.ts, kept minimal on purpose.
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

export function createToken(
  start: number,
  end: number,
  value: string,
): { start: number, end: number, value: string } {
  return { start, end, value }
}

/**
 * Basic matcher for identifiers (string or RegExp array), copied from the
 * name matcher used in Babel path walker, but simplified to avoid extra deps.
 */
export function createNameMatcher(
  patterns: (string | RegExp)[] | undefined,
  exact = true,
) {
  const arr = patterns ?? []
  return (name: string) => {
    for (const p of arr) {
      if (typeof p === 'string') {
        if (exact ? name === p : name.includes(p)) {
          return true
        }
      }
      else if (p.test(name)) {
        return true
      }
    }
    return false
  }
}
