import type { TailwindV4CandidateSource } from './types'
import { extractRawCandidatesWithPositions } from 'tailwindcss-patch'

export async function extractTailwindV4CandidatesFromSources(sources: TailwindV4CandidateSource[] = []) {
  const candidates = new Set<string>()
  for (const source of sources) {
    const matches = await extractRawCandidatesWithPositions(source.content, source.extension ?? 'html')
    for (const match of matches) {
      if (match?.rawCandidate) {
        candidates.add(match.rawCandidate)
      }
    }
  }
  return candidates
}
