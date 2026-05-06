import { extractRawCandidatesWithPositions } from 'tailwindcss-patch'

export interface GeneratorCandidateSource {
  content: string
  extension?: string
}

export async function collectGeneratorCandidatesFromSources(
  sources: GeneratorCandidateSource[],
  baseCandidates: Iterable<string> = [],
) {
  const candidates = new Set(baseCandidates)

  await Promise.all(sources.map(async (source) => {
    const matches = await extractRawCandidatesWithPositions(source.content, source.extension)
    for (const match of matches) {
      const candidate = match.rawCandidate
      if (typeof candidate === 'string' && candidate.length > 0) {
        candidates.add(candidate)
      }
    }
  }))

  return candidates
}
