import { describe, expect, it } from 'vitest'
import { createRuntimeClassSetManager } from '@/bundlers/shared/runtime-class-set'
import * as sharedEscapedCandidates from '@/bundlers/shared/runtime-class-set/escaped-candidates'
import * as sharedSignatures from '@/bundlers/shared/runtime-signatures'
import { createBundleRuntimeClassSetManager } from '@/bundlers/vite/incremental-runtime-class-set'
import * as viteEscapedCandidates from '@/bundlers/vite/incremental-runtime-class-set/escaped-candidates'
import * as viteSignatures from '@/bundlers/vite/generate-bundle/signatures'

describe('runtime classSet bundler boundary', () => {
  it('keeps Vite runtime entry points as compatibility facades', () => {
    expect(createBundleRuntimeClassSetManager).toBe(createRuntimeClassSetManager)
    expect(viteEscapedCandidates.createEscapeFragments).toBe(sharedEscapedCandidates.createEscapeFragments)
    expect(viteEscapedCandidates.collectEscapedRuntimeCandidates).toBe(sharedEscapedCandidates.collectEscapedRuntimeCandidates)
    expect(viteSignatures.createCandidateSignature).toBe(sharedSignatures.createCandidateSignature)
    expect(viteSignatures.hasRuntimeAffectingSourceChanges).toBe(sharedSignatures.hasRuntimeAffectingSourceChanges)
  })

  it('creates stable candidate signatures independent of insertion order', () => {
    expect(sharedSignatures.createCandidateSignature(new Set(['flex', 'grid'])))
      .toBe(sharedSignatures.createCandidateSignature(new Set(['grid', 'flex'])))
  })
})
