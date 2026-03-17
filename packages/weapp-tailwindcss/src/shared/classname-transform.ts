import type { IJsHandlerOptions } from '../types'
import { replaceWxml } from '../wxml/shared'

export type ClassNameTransformDecision = 'direct' | 'escaped' | 'fallback' | 'skip'
type EscapeMap = NonNullable<IJsHandlerOptions['escapeMap']>

const escapedCandidateCacheByEscapeMap = new WeakMap<EscapeMap, Map<string, string>>()
const defaultEscapedCandidateCache = new Map<string, string>()
let lastEscapedCandidateEscapeMap: EscapeMap | undefined
let lastEscapedCandidateCacheStore: Map<string, string> | undefined
const ARBITRARY_HEX_COLOR_RE = /#([0-9A-F]{3,8})/gi

/**
 * 决策结果，附带已计算的 escaped 值以避免下游重复计算。
 */
export interface ClassNameTransformResult {
  decision: ClassNameTransformDecision
  /** 仅在 decision 为 'escaped' 时有值，可直接作为替换结果复用 */
  escapedValue?: string
}

interface ResolveClassNameTransformOptions extends Pick<
  IJsHandlerOptions,
  | 'alwaysEscape'
  | 'classNameSet'
  | 'escapeMap'
  | 'jsArbitraryValueFallback'
  | 'jsPreserveClass'
  | 'tailwindcssMajorVersion'
> {
  classContext?: boolean
}

function isUrlLikeCandidate(candidate: string) {
  return candidate.startsWith('//')
    || candidate.startsWith('http://')
    || candidate.startsWith('https://')
}

function isArbitraryValueCandidate(candidate: string) {
  let hasOpenBracket = false
  let hasCloseBracket = false

  for (let i = 0; i < candidate.length; i++) {
    const char = candidate[i]
    if (char === '[') {
      hasOpenBracket = true
    }
    else if (char === ']') {
      hasCloseBracket = true
    }

    if (hasOpenBracket && hasCloseBracket) {
      break
    }
  }

  if (!hasOpenBracket || !hasCloseBracket) {
    return false
  }

  const normalized = candidate.trim()

  // URL 片段中的 [] 不应作为任意值候选处理。
  if (isUrlLikeCandidate(normalized)) {
    return false
  }

  return true
}

function normalizeArbitraryHexColorCandidate(candidate: string) {
  if (!isArbitraryValueCandidate(candidate) || !candidate.includes('#')) {
    return candidate
  }

  return candidate.replace(ARBITRARY_HEX_COLOR_RE, (_, hex: string) => `#${hex.toLowerCase()}`)
}

function shouldEnableArbitraryValueFallbackByInputs(
  classNameSet: ResolveClassNameTransformOptions['classNameSet'],
  jsArbitraryValueFallback: ResolveClassNameTransformOptions['jsArbitraryValueFallback'],
  tailwindcssMajorVersion: ResolveClassNameTransformOptions['tailwindcssMajorVersion'],
) {
  if (jsArbitraryValueFallback === true) {
    return true
  }

  if (jsArbitraryValueFallback === false) {
    return false
  }

  // auto: 仅在 Tailwind v4 且 classNameSet 异常（空）时启用。
  return tailwindcssMajorVersion === 4 && (!classNameSet || classNameSet.size === 0)
}

export function shouldEnableArbitraryValueFallback(
  {
    classNameSet,
    jsArbitraryValueFallback,
    tailwindcssMajorVersion,
  }: Pick<ResolveClassNameTransformOptions, 'classNameSet' | 'jsArbitraryValueFallback' | 'tailwindcssMajorVersion'>,
) {
  return shouldEnableArbitraryValueFallbackByInputs(
    classNameSet,
    jsArbitraryValueFallback,
    tailwindcssMajorVersion,
  )
}

const SKIP_RESULT: ClassNameTransformResult = { decision: 'skip' }
const DIRECT_RESULT: ClassNameTransformResult = { decision: 'direct' }
const FALLBACK_RESULT: ClassNameTransformResult = { decision: 'fallback' }

function getEscapedCandidateCacheStore(escapeMap?: EscapeMap) {
  if (!escapeMap) {
    return defaultEscapedCandidateCache
  }

  if (escapeMap === lastEscapedCandidateEscapeMap && lastEscapedCandidateCacheStore) {
    return lastEscapedCandidateCacheStore
  }

  let store = escapedCandidateCacheByEscapeMap.get(escapeMap)
  if (!store) {
    store = new Map<string, string>()
    escapedCandidateCacheByEscapeMap.set(escapeMap, store)
  }
  lastEscapedCandidateEscapeMap = escapeMap
  lastEscapedCandidateCacheStore = store
  return store
}

function getEscapedCandidate(candidate: string, escapeMap?: EscapeMap, store = getEscapedCandidateCacheStore(escapeMap)) {
  let cached = store.get(candidate)
  if (cached === undefined) {
    cached = replaceWxml(candidate, { escapeMap })
    store.set(candidate, cached)
  }
  return cached
}

/**
 * JS 转译严格遵循 runtime class set：
 * 1. 直接命中 classNameSet 原始值；
 * 2. 兼容命中 classNameSet 中已转义值；
 * 3. 仅在受控条件下允许 class 语义兜底。
 *
 * 返回结构化结果，附带已计算的 escapedValue 以避免下游重复 escape。
 */
export function resolveClassNameTransformWithResult(
  candidate: string,
  {
    alwaysEscape,
    classNameSet,
    escapeMap,
    jsArbitraryValueFallback,
    jsPreserveClass,
    tailwindcssMajorVersion,
    classContext,
  }: ResolveClassNameTransformOptions,
): ClassNameTransformResult {
  if (alwaysEscape) {
    return DIRECT_RESULT
  }

  if (jsPreserveClass?.(candidate)) {
    return SKIP_RESULT
  }

  if (classNameSet?.has(candidate)) {
    return DIRECT_RESULT
  }

  if (classNameSet && classNameSet.size > 0) {
    const escapedCandidate = getEscapedCandidate(candidate, escapeMap)
    if (escapedCandidate !== candidate && classNameSet.has(escapedCandidate)) {
      return { decision: 'escaped', escapedValue: escapedCandidate }
    }

    const normalizedCandidate = normalizeArbitraryHexColorCandidate(candidate)
    if (normalizedCandidate !== candidate) {
      if (classNameSet.has(normalizedCandidate)) {
        return {
          decision: 'escaped',
          escapedValue: getEscapedCandidate(normalizedCandidate, escapeMap),
        }
      }

      const normalizedEscapedCandidate = getEscapedCandidate(normalizedCandidate, escapeMap)
      if (normalizedEscapedCandidate !== normalizedCandidate && classNameSet.has(normalizedEscapedCandidate)) {
        return {
          decision: 'escaped',
          escapedValue: normalizedEscapedCandidate,
        }
      }
    }
  }

  if (
    classContext
    && shouldEnableArbitraryValueFallbackByInputs(classNameSet, jsArbitraryValueFallback, tailwindcssMajorVersion)
    && isArbitraryValueCandidate(candidate)
  ) {
    return FALLBACK_RESULT
  }

  return SKIP_RESULT
}

/**
 * 兼容旧接口，仅返回 decision 字符串。
 */
export function resolveClassNameTransformDecision(
  candidate: string,
  options: ResolveClassNameTransformOptions,
): ClassNameTransformDecision {
  return resolveClassNameTransformWithResult(candidate, options).decision
}

export function shouldTransformClassNameCandidate(
  candidate: string,
  options: ResolveClassNameTransformOptions,
) {
  return resolveClassNameTransformDecision(candidate, options) !== 'skip'
}
