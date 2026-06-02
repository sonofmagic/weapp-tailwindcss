import { splitCandidateTokens } from '@weapp-tailwindcss/shared/extractors'

const MUSTACHE_EXPRESSION_RE = /\{\{[\s\S]*?\}\}/g
const QUOTED_LITERAL_RE = /'([^']*)'|"([^"]*)"|`([^`]*)`/g

function isArbitraryValueCandidate(candidate: string) {
  return candidate.includes('[') && candidate.includes(']')
}

export function collectUnescapedDynamicCandidates(
  source: string,
  allowedCandidates?: Set<string>,
) {
  const matches = new Set<string>()

  for (const expression of source.match(MUSTACHE_EXPRESSION_RE) ?? []) {
    QUOTED_LITERAL_RE.lastIndex = 0
    let quoted = QUOTED_LITERAL_RE.exec(expression)
    while (quoted !== null) {
      const literal = quoted[1] ?? quoted[2] ?? quoted[3] ?? ''
      for (const candidate of splitCandidateTokens(literal)) {
        const normalized = candidate.trim()
        if (!normalized || !isArbitraryValueCandidate(normalized)) {
          continue
        }
        if (allowedCandidates && !allowedCandidates.has(normalized)) {
          continue
        }
        matches.add(normalized)
      }
      quoted = QUOTED_LITERAL_RE.exec(expression)
    }
  }

  return [...matches]
}

export function collectLegacyContainerCompatCandidates(
  sourceCandidates: Set<string>,
  candidates: Set<string>,
) {
  if (candidates.has('container')) {
    return candidates
  }
  if (!sourceCandidates.has('container')) {
    return candidates
  }
  return new Set([
    ...candidates,
    'container',
  ])
}
