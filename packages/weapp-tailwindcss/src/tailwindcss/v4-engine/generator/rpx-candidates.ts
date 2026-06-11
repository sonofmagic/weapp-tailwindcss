const BARE_RPX_TEXT_CANDIDATE_RE = /(^|:)text-\[([-+]?(?:\d+|\d*\.\d+)rpx)\](.*)$/u
const RPX_TEXT_LENGTH_SELECTOR_RE = /text-\\\[length\\:((?:\\[.+-]|[+\-.\d])+rpx)\\\]/g

function normalizeRpxTextCandidate(candidate: string) {
  return candidate.replace(BARE_RPX_TEXT_CANDIDATE_RE, '$1text-[length:$2]$3')
}

export function normalizeRpxTextCandidates(candidates: Iterable<string>) {
  const normalized = new Set<string>()
  const restoreCandidates = new Map<string, string>()
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeRpxTextCandidate(candidate)
    normalized.add(normalizedCandidate)
    if (normalizedCandidate !== candidate) {
      restoreCandidates.set(normalizedCandidate, candidate)
    }
  }
  return {
    candidates: normalized,
    restoreCandidates,
  }
}

export function restoreRpxTextCandidates(candidates: Iterable<string>, restoreCandidates: ReadonlyMap<string, string>) {
  if (restoreCandidates.size === 0) {
    return new Set(candidates)
  }
  return new Set([...candidates].map(candidate => restoreCandidates.get(candidate) ?? candidate))
}

function normalizeCssEscapedRpxSelectorValue(value: string) {
  return value.replace(/\\([.+-])/g, '$1')
}

export function restoreRpxTextCssSelectors(css: string, restoreCandidates: ReadonlyMap<string, string>) {
  if (restoreCandidates.size === 0 || !css.includes('text-\\[length\\:')) {
    return css
  }
  const restoredValues = new Set(
    [...restoreCandidates.keys()]
      .map((candidate) => {
        const match = BARE_RPX_TEXT_CANDIDATE_RE.exec(candidate.replace('[length:', '['))
        return match?.[2]
      })
      .filter((value): value is string => Boolean(value)),
  )
  return css.replace(RPX_TEXT_LENGTH_SELECTOR_RE, (match, value: string) => {
    return restoredValues.has(normalizeCssEscapedRpxSelectorValue(value)) ? `text-\\[${value}\\]` : match
  })
}
