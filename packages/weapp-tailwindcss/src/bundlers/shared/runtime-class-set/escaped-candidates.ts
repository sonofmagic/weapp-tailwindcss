import { unescape as unescapeClassName } from '@weapp-core/escape'

const ESCAPED_CLASS_TOKEN_RE = /[\w-]+_[A-Z][\w-]*/gi
const TAILWIND_RESTORED_CANDIDATE_SIGNAL_RE = /[[\]:/#!.]/
const MAX_RESTORED_CANDIDATE_VARIANTS = 512

function hasBalancedCandidateDelimiters(candidate: string) {
  const stack: string[] = []
  const closingByOpening: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
  }
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
    if (closingByOpening[char]) {
      stack.push(char)
      continue
    }
    if (char === ')' || char === ']' || char === '}') {
      const opening = stack.pop()
      if (!opening || closingByOpening[opening] !== char) {
        return false
      }
    }
  }
  return stack.length === 0 && quote === undefined && !escaped
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
