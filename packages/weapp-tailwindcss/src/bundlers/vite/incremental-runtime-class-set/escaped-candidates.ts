import { unescape as unescapeClassName } from '@weapp-core/escape'

const ESCAPED_CLASS_TOKEN_RE = /[\w-]+_[A-Z][\w-]*/gi
const TAILWIND_RESTORED_CANDIDATE_SIGNAL_RE = /[[\]:/#!.]/
const MAX_RESTORED_CANDIDATE_VARIANTS = 512

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
    && !/\s/.test(restored))
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
