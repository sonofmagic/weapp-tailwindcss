import type { CandidateChange } from './types'

export class CandidateIndex {
  private readonly candidatesBySource = new Map<string, Set<string>>()

  sync(sourceId: string, candidates: Iterable<string>): CandidateChange {
    const previous = this.candidatesBySource.get(sourceId) ?? new Set<string>()
    const next = new Set(candidates)
    const addedCandidates = new Set([...next].filter(candidate => !previous.has(candidate)))
    const removedCandidates = new Set([...previous].filter(candidate => !next.has(candidate)))
    this.candidatesBySource.set(sourceId, next)
    return { sourceId, addedCandidates, removedCandidates }
  }

  remove(sourceId: string): CandidateChange {
    const previous = this.candidatesBySource.get(sourceId) ?? new Set<string>()
    this.candidatesBySource.delete(sourceId)
    return {
      sourceId,
      addedCandidates: new Set(),
      removedCandidates: new Set(previous),
    }
  }

  values() {
    const values = new Set<string>()
    for (const candidates of this.candidatesBySource.values()) {
      for (const candidate of candidates) {
        values.add(candidate)
      }
    }
    return values
  }

  clear() {
    this.candidatesBySource.clear()
  }
}
