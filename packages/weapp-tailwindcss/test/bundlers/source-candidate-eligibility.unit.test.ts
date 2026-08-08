import { describe, expect, it } from 'vitest'
import { createSourceCandidateEligibilityMatcher } from '@/bundlers/shared/source-candidates/scan-root'

describe('source candidate eligibility', () => {
  it('applies Tailwind default ignores to implicit root scans', () => {
    const matches = createSourceCandidateEligibilityMatcher({ root: '/project', outDir: 'dist' })

    expect(matches('/project/src/App.vue')).toBe(true)
    expect(matches('/project/node_modules/monaco/editor.ts')).toBe(false)
    expect(matches('/project/dist/assets/index.js')).toBe(false)
  })

  it('allows explicitly included dependency sources', () => {
    const matches = createSourceCandidateEligibilityMatcher({
      root: '/project',
      explicit: true,
      entries: [{
        base: '/project',
        pattern: 'node_modules/example/**/*.ts',
        negated: false,
      }],
    })

    expect(matches('/project/node_modules/example/index.ts')).toBe(true)
    expect(matches('/project/node_modules/other/index.ts')).toBe(false)
  })

  it('does not treat an uninitialized explicit negative scan as match-all', () => {
    const matches = createSourceCandidateEligibilityMatcher({
      root: '/project',
      explicit: true,
      entries: [{
        base: '/project',
        pattern: 'node_modules/**',
        negated: true,
      }],
    })

    expect(matches('/project/src/App.vue')).toBe(false)
  })
})
