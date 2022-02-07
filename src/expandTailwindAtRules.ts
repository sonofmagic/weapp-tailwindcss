import LRU from 'quick-lru'

const extractorCache = new WeakMap()

// Scans template contents for possible classes. This is a hot path on initial build but
// not too important for subsequent builds. The faster the better though — if we can speed
// up these regexes by 50% that could cut initial build time by like 20%.
export function getClassCandidates (content: string, extractor: (content: string) => string[], candidates: Set<string>, seen: Set<string>) {
  if (!extractorCache.has(extractor)) {
    extractorCache.set(extractor, new LRU({ maxSize: 25000 }))
  }

  for (let line of content.split('\n')) {
    line = line.trim()

    if (seen.has(line)) {
      continue
    }
    seen.add(line)

    if (extractorCache.get(extractor).has(line)) {
      for (const match of extractorCache.get(extractor).get(line)) {
        candidates.add(match)
      }
    } else {
      const extractorMatches = extractor(line).filter((s) => s !== '!*')
      const lineMatchesSet = new Set(extractorMatches)

      for (const match of lineMatchesSet) {
        candidates.add(match)
      }

      extractorCache.get(extractor).set(line, lineMatchesSet)
    }
  }
}
// const candidates = new Set(['*'])
// const seen = new Set()
