import { extractRawCandidatesWithPositions } from 'tailwindcss-patch'

const SOURCE_INLINE_RE = /@source\s+(not\s+)?inline\(\s*(["'])([\s\S]*?)\2\s*\)\s*;/g

async function extractCandidatesFromInlineValue(value: string) {
  const matches = await extractRawCandidatesWithPositions(value, 'html')
  const candidates = new Set<string>()
  for (const match of matches) {
    if (match?.rawCandidate) {
      candidates.add(match.rawCandidate)
    }
  }
  return candidates
}

export async function collectInlineSourceCandidates(css: string) {
  const included = new Set<string>()
  const excluded = new Set<string>()
  const tasks: Array<Promise<void>> = []

  SOURCE_INLINE_RE.lastIndex = 0
  for (const match of css.matchAll(SOURCE_INLINE_RE)) {
    const negated = Boolean(match[1])
    const value = match[3] ?? ''
    tasks.push((async () => {
      const candidates = await extractCandidatesFromInlineValue(value)
      for (const candidate of candidates) {
        if (negated) {
          excluded.add(candidate)
        }
        else {
          included.add(candidate)
        }
      }
    })())
  }

  await Promise.all(tasks)

  for (const candidate of excluded) {
    included.delete(candidate)
  }

  return {
    included,
    excluded,
  }
}
