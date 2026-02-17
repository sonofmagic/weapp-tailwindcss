import type { IJsHandlerOptions } from '../types'

const arbitraryClassTokenRE = /\[[^\]\r\n]+\]/
const utilityLikeClassRE = /^-?[@\w][\w:/.[\]()%#!,-]*$/
const escapableTokenRE = /[.[\]/:]/
const trailingLocationRE = /^(.+?):\d+(?::\d+)?$/
const sourceLocationFileRE = /(?:^|[/\\])[^/\\]+\.(?:[cm]?[jt]sx?|vue|svelte|astro)$/i

function normalizeToken(candidate: string) {
  return candidate
    .trim()
    .replace(/^[("'`[{]+/, '')
    .replace(/[)"'`,;]+$/, '')
}

function testPattern(value: string, pattern: string | RegExp) {
  if (typeof pattern === 'string') {
    return value.includes(pattern)
  }
  if (!pattern.flags.includes('g')) {
    return pattern.test(value)
  }
  const normalized = new RegExp(pattern.source, pattern.flags.replace(/g/g, ''))
  return normalized.test(value)
}

function isLikelyUrlToken(candidate: string) {
  return candidate.includes('://') || candidate.startsWith('data:')
}

function isLikelyFilePathToken(candidate: string) {
  if (candidate.includes('/')) {
    return true
  }
  if (candidate.includes('\\')) {
    return true
  }
  return false
}

export function isLikelySourceLocationToken(candidate: string) {
  if (!candidate) {
    return false
  }
  const normalized = normalizeToken(candidate)
  if (!normalized || isLikelyUrlToken(normalized)) {
    return false
  }
  const match = trailingLocationRE.exec(normalized)
  if (!match) {
    return false
  }
  const file = match[1]
  return sourceLocationFileRE.test(file)
}

function matchesFallbackExcludePatterns(candidate: string, patterns?: IJsHandlerOptions['fallbackExcludePatterns']) {
  if (!patterns || patterns.length === 0) {
    return false
  }
  return patterns.some(pattern => testPattern(candidate, pattern))
}

function isArbitraryValueClassName(candidate: string) {
  if (!arbitraryClassTokenRE.test(candidate)) {
    return false
  }
  return candidate.startsWith('[') || candidate.includes('-[') || candidate.includes(':[')
}

function shouldFallbackEscapeClassName(
  candidate: string,
  {
    fallbackExcludePatterns,
    fallbackCandidateFilter,
  }: Pick<IJsHandlerOptions, 'fallbackExcludePatterns' | 'fallbackCandidateFilter'>,
) {
  if (!candidate) {
    return false
  }
  const normalized = normalizeToken(candidate)
  if (!normalized) {
    return false
  }
  // Source-location tokens from stack traces/logs must never be treated as utility classes.
  if (isLikelySourceLocationToken(normalized)) {
    return false
  }
  if (isLikelyUrlToken(normalized)) {
    return false
  }
  if (isLikelyFilePathToken(normalized)) {
    return false
  }
  if (fallbackCandidateFilter?.(normalized) === false) {
    return false
  }
  if (matchesFallbackExcludePatterns(normalized, fallbackExcludePatterns)) {
    return false
  }
  if (normalized.startsWith('@')) {
    return false
  }
  if (!utilityLikeClassRE.test(normalized)) {
    return false
  }
  if (isArbitraryValueClassName(normalized)) {
    return true
  }
  if (!escapableTokenRE.test(normalized)) {
    return false
  }
  if (!normalized.includes('.')) {
    return false
  }
  return normalized.includes('-') || normalized.includes(':')
}

export function shouldTransformClassNameCandidate(
  candidate: string,
  {
    alwaysEscape,
    classNameSet,
    staleClassNameFallback,
    jsPreserveClass,
    fallbackExcludePatterns,
    fallbackCandidateFilter,
  }: Pick<
    IJsHandlerOptions,
    | 'alwaysEscape'
    | 'classNameSet'
    | 'staleClassNameFallback'
    | 'jsPreserveClass'
    | 'fallbackExcludePatterns'
    | 'fallbackCandidateFilter'
  >,
) {
  if (alwaysEscape) {
    return true
  }

  if (jsPreserveClass?.(candidate)) {
    return false
  }

  if (!classNameSet || classNameSet.size === 0) {
    if (!staleClassNameFallback) {
      return false
    }
    return shouldFallbackEscapeClassName(candidate, {
      fallbackExcludePatterns,
      fallbackCandidateFilter,
    })
  }

  if (classNameSet.has(candidate)) {
    return true
  }

  if (!staleClassNameFallback) {
    return false
  }

  return shouldFallbackEscapeClassName(candidate, {
    fallbackExcludePatterns,
    fallbackCandidateFilter,
  })
}
