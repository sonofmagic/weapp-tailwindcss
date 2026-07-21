import { unescape as unescapeClassName } from '@weapp-core/escape'

const ESCAPED_CLASS_TOKEN_RE = /[\w-]+_[A-Z][\w-]*/gi
const TAILWIND_RESTORED_CANDIDATE_SIGNAL_RE = /[[\]:/#!.]/
const MAX_RESTORED_CANDIDATE_VARIANTS = 512
const MAX_DELIMITER_BALANCE_CACHE_SIZE = 8192
const delimiterBalanceCache = new Map<string, boolean>()

function hasBalancedCandidateDelimitersFallback(candidate: string) {
  const stack: string[] = []
  let escaped = false
  let quote: string | undefined
  for (const char of candidate) {
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (char === quote) {
        quote = undefined
      }
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char)
      continue
    }
    if (char === ')' || char === ']' || char === '}') {
      const opening = stack.pop()
      if (!opening
        || (opening === '(' && char !== ')')
        || (opening === '[' && char !== ']')
        || (opening === '{' && char !== '}')) {
        return false
      }
    }
  }
  return stack.length === 0 && quote === undefined && !escaped
}

function computeBalancedCandidateDelimiters(candidate: string) {
  let delimiterStack = 0
  let depth = 0
  let escaped = false
  let quote = 0
  for (let index = 0; index < candidate.length; index++) {
    const code = candidate.charCodeAt(index)
    if (escaped) {
      escaped = false
      continue
    }
    if (code === 92) {
      escaped = true
      continue
    }
    if (quote !== 0) {
      if (code === quote) {
        quote = 0
      }
      continue
    }
    if (code === 34 || code === 39) {
      quote = code
      continue
    }
    const openingType = code === 40 ? 1 : code === 91 ? 2 : code === 123 ? 3 : 0
    if (openingType !== 0) {
      if (depth === 15) {
        return hasBalancedCandidateDelimitersFallback(candidate)
      }
      delimiterStack = (delimiterStack << 2) | openingType
      depth++
      continue
    }
    const closingType = code === 41 ? 1 : code === 93 ? 2 : code === 125 ? 3 : 0
    if (closingType !== 0) {
      if (depth === 0 || (delimiterStack & 3) !== closingType) {
        return false
      }
      delimiterStack >>>= 2
      depth--
    }
  }
  return depth === 0 && quote === 0 && !escaped
}

function hasBalancedCandidateDelimiters(candidate: string) {
  const cached = delimiterBalanceCache.get(candidate)
  if (cached !== undefined) {
    return cached
  }
  const balanced = computeBalancedCandidateDelimiters(candidate)
  if (delimiterBalanceCache.size >= MAX_DELIMITER_BALANCE_CACHE_SIZE) {
    const oldest = delimiterBalanceCache.keys().next().value
    if (oldest !== undefined) {
      delimiterBalanceCache.delete(oldest)
    }
  }
  delimiterBalanceCache.set(candidate, balanced)
  return balanced
}

export function createEscapeFragments(escapeMap: Record<string, string>) {
  return [...new Set(Object.values(escapeMap).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
}

function hasEscapeFragment(token: string, escapeFragments: string[]) {
  return escapeFragments.some(fragment => token.includes(fragment))
}

function createAmbiguousRestoredRuntimeCandidates(
  token: string,
  escapeMap: Record<string, string>,
  escapeFragments: string[],
) {
  if (!hasEscapeFragment(token, escapeFragments)) {
    return []
  }

  const unescapedByFragment = new Map(
    Object.entries(escapeMap).map(([char, fragment]) => [fragment, char]),
  )
  let variants = ['']
  let index = 0

  while (index < token.length) {
    const fragment = escapeFragments.find(item => token.startsWith(item, index))
    if (!fragment) {
      variants = variants.map(item => item + token[index])
      index += 1
      continue
    }

    const nextVariants: string[] = []
    const unescaped = unescapedByFragment.get(fragment)
    for (const variant of variants) {
      nextVariants.push(variant + fragment)
      if (unescaped) {
        nextVariants.push(variant + unescaped)
      }
      if (nextVariants.length >= MAX_RESTORED_CANDIDATE_VARIANTS) {
        break
      }
    }
    variants = nextVariants
    index += fragment.length
  }

  variants.push(unescapeClassName(token, { map: escapeMap }))

  return [...new Set(variants)].filter(restored => restored !== token
    && TAILWIND_RESTORED_CANDIDATE_SIGNAL_RE.test(restored)
    && !/\s/.test(restored)
    && hasBalancedCandidateDelimiters(restored))
}

export function collectEscapedRuntimeCandidates(
  source: string,
  escapeMap: Record<string, string>,
  escapeFragments: string[],
) {
  const candidates = new Set<string>()
  ESCAPED_CLASS_TOKEN_RE.lastIndex = 0
  let match = ESCAPED_CLASS_TOKEN_RE.exec(source)
  while (match) {
    for (const restored of createAmbiguousRestoredRuntimeCandidates(match[0], escapeMap, escapeFragments)) {
      candidates.add(restored)
    }
    match = ESCAPED_CLASS_TOKEN_RE.exec(source)
  }
  return candidates
}

export function collectStrictEscapedRuntimeCandidates(
  source: string,
  escapeMap: Record<string, string>,
  escapeFragments: string[],
) {
  const candidates = new Set<string>()
  ESCAPED_CLASS_TOKEN_RE.lastIndex = 0
  let match = ESCAPED_CLASS_TOKEN_RE.exec(source)
  while (match) {
    const token = match[0]
    if (hasEscapeFragment(token, escapeFragments)) {
      const restored = unescapeClassName(token, { map: escapeMap })
      if (
        restored !== token
        && TAILWIND_RESTORED_CANDIDATE_SIGNAL_RE.test(restored)
        && !/\s/.test(restored)
      ) {
        candidates.add(restored)
      }
    }
    match = ESCAPED_CLASS_TOKEN_RE.exec(source)
  }
  return candidates
}
