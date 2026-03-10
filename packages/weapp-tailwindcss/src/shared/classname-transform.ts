import type { IJsHandlerOptions } from '../types'
import { replaceWxml } from '../wxml/shared'

export type ClassNameTransformDecision = 'direct' | 'escaped' | 'fallback' | 'skip'

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

function isArbitraryValueCandidate(candidate: string) {
  const normalized = candidate.trim()
  if (!normalized.includes('[') || !normalized.includes(']')) {
    return false
  }

  // URL 片段中的 [] 不应作为任意值候选处理。
  if (/^(?:https?:)?\/\//.test(normalized)) {
    return false
  }

  return true
}

export function shouldEnableArbitraryValueFallback(
  {
    classNameSet,
    jsArbitraryValueFallback,
    tailwindcssMajorVersion,
  }: Pick<ResolveClassNameTransformOptions, 'classNameSet' | 'jsArbitraryValueFallback' | 'tailwindcssMajorVersion'>,
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

const SKIP_RESULT: ClassNameTransformResult = { decision: 'skip' }
const DIRECT_RESULT: ClassNameTransformResult = { decision: 'direct' }
const FALLBACK_RESULT: ClassNameTransformResult = { decision: 'fallback' }

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
    const escapedCandidate = replaceWxml(candidate, { escapeMap })
    if (escapedCandidate !== candidate && classNameSet.has(escapedCandidate)) {
      return { decision: 'escaped', escapedValue: escapedCandidate }
    }
  }

  if (
    classContext
    && isArbitraryValueCandidate(candidate)
    && shouldEnableArbitraryValueFallback({
      classNameSet,
      jsArbitraryValueFallback,
      tailwindcssMajorVersion,
    })
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
