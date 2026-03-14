import { describe, expect, it } from 'vitest'
import { hasWatchChanges } from '@/bundlers/webpack/BaseUnifiedPlugin/shared'

describe('bundlers/webpack shared helpers', () => {
  it('detects watch changes from modifiedFiles', () => {
    expect(hasWatchChanges({
      modifiedFiles: new Set(['/workspace/src/index.ts']),
    })).toBe(true)
  })

  it('detects watch changes from removedFiles', () => {
    expect(hasWatchChanges({
      removedFiles: new Set(['/workspace/src/old.ts']),
    })).toBe(true)
  })

  it('returns false when watch changes are absent', () => {
    expect(hasWatchChanges({})).toBe(false)
    expect(hasWatchChanges({
      modifiedFiles: new Set(),
      removedFiles: new Set(),
    })).toBe(false)
  })
})
