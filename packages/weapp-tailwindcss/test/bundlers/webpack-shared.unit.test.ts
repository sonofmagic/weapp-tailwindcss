import { describe, expect, it } from 'vitest'
import { hasWatchChanges, isWatchFileInRuntimeDependencies } from '@/bundlers/webpack/BaseUnifiedPlugin/shared'

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

  it('matches changed files against runtime dependency files and contexts', () => {
    expect(isWatchFileInRuntimeDependencies('/workspace/tailwind.config.js', {
      files: new Set(['/workspace/tailwind.config.js']),
    })).toBe(true)
    expect(isWatchFileInRuntimeDependencies('/workspace/src/pages/index.ts', {
      contexts: new Set(['/workspace/src']),
    })).toBe(true)
    expect(isWatchFileInRuntimeDependencies('/workspace/src-other/index.ts', {
      contexts: new Set(['/workspace/src']),
    })).toBe(false)
    expect(isWatchFileInRuntimeDependencies('/workspace/src/pages/index.ts', {
      files: new Set(['/workspace/tailwind.config.js']),
      contexts: new Set(['/workspace/styles']),
    })).toBe(false)
  })
})
