import { describe, expect, it } from 'vitest'
import {
  collectEscapedRuntimeCandidates,
  createEscapeFragments,
  getRestoredCandidateCacheStats,
  MAX_RESTORED_CANDIDATE_CACHE_CODE_UNITS,
  MAX_RESTORED_CANDIDATE_CACHE_ENTRIES,
} from '@/bundlers/shared/runtime-class-set/escaped-candidates'

describe('runtime class set escaped candidate cache', () => {
  it('bounds cached empty restoration results by entry count and source size', () => {
    const escapeMap = { '?': '_A' }
    const escapeFragments = createEscapeFragments(escapeMap)
    const source = Array.from({ length: 9000 }, (_, index) => `plain${index}_A`).join(' ')

    expect(collectEscapedRuntimeCandidates(source, escapeMap, escapeFragments)).toEqual(new Set())
    expect(getRestoredCandidateCacheStats(escapeFragments)).toEqual({
      codeUnitCount: expect.any(Number),
      entryCount: MAX_RESTORED_CANDIDATE_CACHE_ENTRIES,
    })
    expect(getRestoredCandidateCacheStats(escapeFragments).codeUnitCount)
      .toBeLessThanOrEqual(MAX_RESTORED_CANDIDATE_CACHE_CODE_UNITS)
  })
})
