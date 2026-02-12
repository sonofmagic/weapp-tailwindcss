import type { IJsHandlerOptions } from '../types'

const arbitraryClassTokenRE = /\[[^\]\r\n]+\]/
const utilityLikeClassRE = /^-?[@\w][\w:/.[\]()%#!,-]*$/
const escapableTokenRE = /[.[\]/:]/

function isArbitraryValueClassName(candidate: string) {
  if (!arbitraryClassTokenRE.test(candidate)) {
    return false
  }
  return candidate.startsWith('[') || candidate.includes('-[') || candidate.includes(':[')
}

function shouldFallbackEscapeClassName(candidate: string) {
  if (!candidate) {
    return false
  }
  if (candidate.startsWith('@')) {
    return false
  }
  if (candidate.includes('://')) {
    return false
  }
  if (candidate.includes('/')) {
    return false
  }
  if (!utilityLikeClassRE.test(candidate)) {
    return false
  }
  if (isArbitraryValueClassName(candidate)) {
    return true
  }
  if (!escapableTokenRE.test(candidate)) {
    return false
  }
  if (!candidate.includes('.')) {
    return false
  }
  return candidate.includes('-') || candidate.includes(':')
}

export function shouldTransformClassNameCandidate(
  candidate: string,
  {
    alwaysEscape,
    classNameSet,
    staleClassNameFallback,
    jsPreserveClass,
  }: Pick<IJsHandlerOptions, 'alwaysEscape' | 'classNameSet' | 'staleClassNameFallback' | 'jsPreserveClass'>,
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

  if (classNameSet.has(candidate)) {
    return true
  }

  if (!staleClassNameFallback) {
    return false
  }

  return shouldFallbackEscapeClassName(candidate)
}
