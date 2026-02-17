import type { IJsHandlerOptions } from '../types'

/**
 * JS 转译严格遵循 runtime class set：
 * 仅转换 tailwindcss-patch 提供的 classNameSet 命中项，避免启发式误伤业务文本。
 */
export function shouldTransformClassNameCandidate(
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

  if (jsPreserveClass?.(candidate)) {
    return false
  }

  if (!classNameSet || classNameSet.size === 0) {
    return false
  }

  return classNameSet.has(candidate)
}
