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
const WEAPP_TW_IGNORE_MARKER = 'weapp-tw'
const IGNORE_MARKER = 'ignore'

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

function getReplacement(candidate: string, escapeMap: EscapeMap | undefined, store = getReplacementCacheStore(escapeMap)) {
  let cached = store.get(candidate)
  if (cached === undefined) {
    cached = replaceWxml(candidate, { escapeMap })
    store.set(candidate, cached)
  }
  return cached
}

function hasIgnoreComment(node: StringLiteral | TemplateElement) {
  const { leadingComments } = node
  if (!Array.isArray(leadingComments) || leadingComments.length === 0) {
    return false
  }

  for (const comment of leadingComments) {
    const { value } = comment
    if (value.includes(WEAPP_TW_IGNORE_MARKER) && value.includes(IGNORE_MARKER)) {
      return true
    }
  }

  return false
}

function extractLiteralValue(
  path: NodePath<StringLiteral | TemplateElement>,
  { unescapeUnicode, arbitraryValues }: Pick<IJsHandlerOptions, 'unescapeUnicode' | 'arbitraryValues'>,
) {
  const allowDoubleQuotes = arbitraryValues?.allowDoubleQuotes
  const { node } = path

  let offset = 0
  let original: string
  if (node.type === 'StringLiteral') {
    offset = 1
    original = node.value
  }
  else if (node.type === 'TemplateElement') {
    original = node.value.raw
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
  const replacementCache = getReplacementCacheStore(escapeMap)
  const transformOptions = classContext
    ? {
        ...options,
        classContext,
      }
    : options
  let firstCandidate = ''
  let firstPlan: CandidatePlan | undefined
  let cache: Map<string, CandidatePlan> | undefined

  const buildCandidatePlan = (candidate: string): CandidatePlan => {
    const result = resolveClassNameTransformWithResult(candidate, transformOptions)

    if (result.decision === 'skip') {
      return { result }
    }

    let replacement: string
    if (result.decision === 'escaped' && result.escapedValue) {
      replacement = result.escapedValue
      replacementCache.set(candidate, replacement)
    }
    else {
      replacement = getReplacement(candidate, escapeMap, replacementCache)
    }

    return {
      result,
      replacement,
    }
  }

  return (candidate: string): CandidatePlan => {
    if (cache) {
      const cached = cache.get(candidate)
      if (cached) {
        return cached
      }
    }
    else if (firstPlan && candidate === firstCandidate) {
      return firstPlan
    }

    const plan = buildCandidatePlan(candidate)
    if (!firstPlan) {
      firstCandidate = candidate
      firstPlan = plan
      return plan
    }

    if (!cache) {
      cache = new Map<string, CandidatePlan>()
      cache.set(firstCandidate, firstPlan)
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

  if (!alwaysEscape && !fallbackEnabled && (!classNameSet || classNameSet.size === 0)) {
    return undefined
  }

  if (hasIgnoreComment(path.node)) {
    return undefined
  }

  const { literal, original, allowDoubleQuotes, offset } = extractLiteralValue(path, options)
  const candidates = splitCode(literal, allowDoubleQuotes)
  if (candidates.length === 0) {
    return undefined
  }

  const debugEnabled = debug.enabled
  const classContext = options.wrapExpression || isClassContextLiteralPath(path)
  let transformed = literal
  let mutated = false
  let matchedCandidateCount = 0
  let escapedDecisionCount = 0
  let fallbackDecisionCount = 0
  let escapedSamples: string[] | undefined
  let skippedSamples: string[] | undefined
  const resolveCandidatePlan = createCandidatePlanResolver(options, classContext)

  for (const candidate of candidates) {
    const plan = resolveCandidatePlan(candidate)
    if (plan.result.decision === 'skip') {
      if (debugEnabled) {
        if (!skippedSamples) {
          skippedSamples = []
        }
        if (skippedSamples.length < 6) {
          skippedSamples.push(candidate)
        }
      }
      continue
    }

    if (debugEnabled) {
      matchedCandidateCount += 1
      if (plan.result.decision === 'escaped') {
        escapedDecisionCount += 1
        if (!escapedSamples) {
          escapedSamples = []
        }
        if (escapedSamples.length < 6) {
          escapedSamples.push(candidate)
        }
      }
      if (plan.result.decision === 'fallback') {
        fallbackDecisionCount += 1
      }
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

  if (debugEnabled) {
    debug(
      'runtimeSet size=%d fallbackTriggered=%s candidates=%d matched=%d escapedHits=%d skipped=%d file=%s escapedSamples=%s skippedSamples=%s',
      classNameSet?.size ?? 0,
      fallbackDecisionCount > 0,
      candidates.length,
      matchedCandidateCount,
      escapedDecisionCount,
      skippedSamples?.length ?? 0,
      options.filename ?? 'unknown',
      escapedSamples?.join(',') || '-',
      skippedSamples?.join(',') || '-',
    )
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
