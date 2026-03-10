import type { NodePath } from '@babel/traverse'
import type { StringLiteral, TemplateElement } from '@babel/types'
import type { ClassNameTransformResult } from '../shared/classname-transform'
import type { IJsHandlerOptions } from '../types'
import type { JsToken } from './types'
import { jsStringEscape } from '@ast-core/escape'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'
import { createDebug } from '@/debug'
import { resolveClassNameTransformWithResult, shouldEnableArbitraryValueFallback } from '../shared/classname-transform'
import { decodeUnicode2 } from '../utils/decode'
import { replaceWxml } from '../wxml/shared'
import { isClassContextLiteralPath } from './class-context'

type EscapeMap = NonNullable<IJsHandlerOptions['escapeMap']>

const debug = createDebug('[js:handlers] ')
const replacementCacheByEscapeMap = new WeakMap<EscapeMap, Map<string, string>>()
const defaultReplacementCache = new Map<string, string>()

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

/**
 * 将 replacement 写入对应的缓存，供后续 getReplacement 命中。
 */
function setReplacementCache(candidate: string, replacement: string, escapeMap?: EscapeMap) {
  if (!escapeMap) {
    defaultReplacementCache.set(candidate, replacement)
  }
  else {
    let store = replacementCacheByEscapeMap.get(escapeMap)
    if (!store) {
      store = new Map<string, string>()
      replacementCacheByEscapeMap.set(escapeMap, store)
    }
    store.set(candidate, replacement)
  }
}

function hasIgnoreComment(node: StringLiteral | TemplateElement) {
  return Array.isArray(node.leadingComments)
    && node.leadingComments.some(comment => comment.value.includes('weapp-tw') && comment.value.includes('ignore'))
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

interface CandidatePlan {
  result: ClassNameTransformResult
  replacement?: string
}

function createCandidatePlanResolver(
  options: IJsHandlerOptions,
  classContext: boolean,
) {
  const { escapeMap } = options
  const cache = new Map<string, CandidatePlan>()

  return (candidate: string): CandidatePlan => {
    const cached = cache.get(candidate)
    if (cached) {
      return cached
    }

    const result = resolveClassNameTransformWithResult(candidate, {
      ...options,
      classContext,
    })

    if (result.decision === 'skip') {
      const plan = { result }
      cache.set(candidate, plan)
      return plan
    }

    let replacement: string
    if (result.decision === 'escaped' && result.escapedValue) {
      replacement = result.escapedValue
      setReplacementCache(candidate, replacement, escapeMap)
    }
    else {
      replacement = getReplacement(candidate, escapeMap)
    }

    const plan = {
      result,
      replacement,
    }
    cache.set(candidate, plan)
    return plan
  }
}

export function replaceHandleValue(
  path: NodePath<StringLiteral | TemplateElement>,
  options: IJsHandlerOptions,
): JsToken | undefined {
  const { needEscaped = false } = options
  const { classNameSet, alwaysEscape } = options
  const fallbackEnabled = shouldEnableArbitraryValueFallback(options)
  const classContext = options.wrapExpression || isClassContextLiteralPath(path)

  if (!alwaysEscape && !fallbackEnabled && (!classNameSet || classNameSet.size === 0)) {
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
  let matchedCandidateCount = 0
  let escapedDecisionCount = 0
  let fallbackDecisionCount = 0
  const escapedSamples: string[] = []
  const skippedSamples: string[] = []
  const resolveCandidatePlan = createCandidatePlanResolver(options, classContext)

  for (const candidate of candidates) {
    const plan = resolveCandidatePlan(candidate)
    if (plan.result.decision === 'skip') {
      if (skippedSamples.length < 6) {
        skippedSamples.push(candidate)
      }
      continue
    }
    matchedCandidateCount += 1
    if (plan.result.decision === 'escaped') {
      escapedDecisionCount += 1
      if (escapedSamples.length < 6) {
        escapedSamples.push(candidate)
      }
    }
    if (plan.result.decision === 'fallback') {
      fallbackDecisionCount += 1
    }

    // 使用 String.replace 仅替换首次出现，与原始行为一致
    const replaced = transformed.replace(candidate, plan.replacement!)
    if (replaced !== transformed) {
      transformed = replaced
      mutated = true
    }
  }

  const node = path.node
  if (!mutated || typeof node.start !== 'number' || typeof node.end !== 'number') {
    return undefined
  }

  debug(
    'runtimeSet size=%d fallbackTriggered=%s candidates=%d matched=%d escapedHits=%d skipped=%d file=%s escapedSamples=%s skippedSamples=%s',
    classNameSet?.size ?? 0,
    fallbackDecisionCount > 0,
    candidates.length,
    matchedCandidateCount,
    escapedDecisionCount,
    skippedSamples.length,
    options.filename ?? 'unknown',
    escapedSamples.join(',') || '-',
    skippedSamples.join(',') || '-',
  )

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
