import type { NodePath } from '@babel/traverse'
import type { StringLiteral, TemplateElement } from '@babel/types'
import type { IJsHandlerOptions } from '../types'
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String
import type { JsToken } from './types'
import { jsStringEscape } from '@ast-core/escape'
import { escapeStringRegexp } from '@weapp-core/regex'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { decodeUnicode2 } from '../utils/decode'
import { replaceWxml } from '../wxml/shared'

type EscapeMap = NonNullable<IJsHandlerOptions['escapeMap']>

const patternCache = new Map<string, RegExp>()
const replacementCacheByEscapeMap = new WeakMap<EscapeMap, Map<string, string>>()
const defaultReplacementCache = new Map<string, string>()

function getPattern(candidate: string) {
  let cached = patternCache.get(candidate)
  if (!cached) {
    cached = new RegExp(escapeStringRegexp(candidate))
    patternCache.set(candidate, cached)
  }
  return cached
}

function getReplacement(candidate: string, escapeMap?: EscapeMap) {
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

function hasIgnoreComment(node: StringLiteral | TemplateElement) {
  return Array.isArray(node.leadingComments)
    && node.leadingComments.some(comment => comment.value.includes('weapp-tw') && comment.value.includes('ignore'))
}

function shouldTransformClassName(
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

  if (!classNameSet) {
    return false
  }

  if (!classNameSet.has(candidate)) {
    return false
  }

  return !jsPreserveClass?.(candidate)
}

function extractLiteralValue(
  path: NodePath<StringLiteral | TemplateElement>,
  { unescapeUnicode, arbitraryValues }: Pick<IJsHandlerOptions, 'unescapeUnicode' | 'arbitraryValues'>,
) {
  const allowDoubleQuotes = arbitraryValues?.allowDoubleQuotes

  let offset = 0
  let original: string
  if (path.isStringLiteral()) {
    offset = 1
    original = path.node.value
  }
  else if (path.isTemplateElement()) {
    original = path.node.value.raw
  }
  else {
    original = ''
  }

  let literal = original
  if (unescapeUnicode && original.includes('\\u')) {
    literal = decodeUnicode2(original)
  }

  return {
    allowDoubleQuotes,
    literal,
    offset,
    original,
  }
}

/**
 * Computes the replacement token for a string literal or template element.
 * Returns `undefined` when no mutation is required.
 */
export function replaceHandleValue(
  path: NodePath<StringLiteral | TemplateElement>,
  options: IJsHandlerOptions,
): JsToken | undefined {
  const {
    escapeMap,
    mangleContext,
    needEscaped = false,
  } = options
  const { classNameSet, alwaysEscape } = options

  if (!alwaysEscape && (!classNameSet || classNameSet.size === 0)) {
    return undefined
  }

  const { literal, original, allowDoubleQuotes, offset } = extractLiteralValue(path, options)
  if (hasIgnoreComment(path.node)) {
    return undefined
  }

  const candidates = splitCode(literal, allowDoubleQuotes)
  if (candidates.length === 0) {
    return undefined
  }

  let transformed = literal
  let mutated = false

  let normalised = false

  for (const candidate of candidates) {
    if (!shouldTransformClassName(candidate, options)) {
      continue
    }

    if (mangleContext && !normalised) {
      // Ensure mangle context can normalise class names before replacement.
      const mangled = mangleContext.jsHandler(transformed)
      if (mangled !== transformed) {
        transformed = mangled
        mutated = true
      }
      normalised = true
    }

    if (!transformed.includes(candidate)) {
      continue
    }

    const pattern = getPattern(candidate)
    const replacement = getReplacement(candidate, escapeMap)
    const replaced = transformed.replace(pattern, replacement)

    if (replaced !== transformed) {
      transformed = replaced
      mutated = true
    }
  }

  const node = path.node
  if (!mutated || typeof node.start !== 'number' || typeof node.end !== 'number') {
    return undefined
  }

  const start = node.start + offset
  const end = node.end - offset
  if (start >= end || transformed === original) {
    return undefined
  }

  const value = needEscaped ? jsStringEscape(transformed) : transformed

  return {
    start,
    end,
    value,
    path,
  }
}
