import type { IJsHandlerOptions } from '../types'
import { replaceWxml } from '../wxml/shared'

export type ClassNameTransformDecision = 'direct' | 'escaped' | 'fallback' | 'skip'

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

/**
 * JS 转译严格遵循 runtime class set：
 * 1. 直接命中 classNameSet 原始值；
 * 2. 兼容命中 classNameSet 中已转义值；
 * 3. 仅在受控条件下允许 class 语义兜底。
 */
export function resolveClassNameTransformDecision(
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
): ClassNameTransformDecision {
  if (alwaysEscape) {
    return 'direct'
  }

  if (jsPreserveClass?.(candidate)) {
    return 'skip'
  }

  if (classNameSet?.has(candidate)) {
    return 'direct'
  }

  if (classNameSet && classNameSet.size > 0) {
    const escapedCandidate = replaceWxml(candidate, { escapeMap })
    if (escapedCandidate !== candidate && classNameSet.has(escapedCandidate)) {
      return 'escaped'
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
    return 'fallback'
  }

  return 'skip'
}

export function shouldTransformClassNameCandidate(
  candidate: string,
  options: ResolveClassNameTransformOptions,
) {
  return resolveClassNameTransformDecision(candidate, options) !== 'skip'
}
