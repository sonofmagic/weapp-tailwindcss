import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createSourceCandidateEligibilityMatcher } from '@/bundlers/shared/source-candidates/scan-root'

describe('source candidate eligibility', () => {
  it('applies Tailwind default ignores to implicit root scans', () => {
    const root = path.resolve('workspace/packages/app')
    const matches = createSourceCandidateEligibilityMatcher([{ root, outDir: 'dist' }])

    expect(matches(path.join(root, 'src/App.vue'))).toBe(true)
    expect(matches(path.join(root, 'node_modules/monaco/editor.ts'))).toBe(false)
    expect(matches(path.join(root, 'dist/assets/index.js'))).toBe(false)
    expect(matches(path.resolve(root, '../../node_modules/monaco/editor.ts'))).toBe(false)
  })

  it('allows explicitly included dependency sources outside the vite root', () => {
    const root = path.resolve('workspace/packages/app')
    const dependencyRoot = path.resolve(root, '../../node_modules/example')
    const matches = createSourceCandidateEligibilityMatcher([{
      root,
      explicit: true,
      entries: [{
        base: dependencyRoot,
        pattern: '**/*.ts',
        negated: false,
      }],
    }])

    expect(matches(path.join(dependencyRoot, 'src/index.ts'))).toBe(true)
    expect(matches(path.resolve(root, '../../node_modules/other/index.ts'))).toBe(false)
  })

  it('does not treat an uninitialized explicit negative scan as match-all', () => {
    const root = path.resolve('workspace/packages/app')
    const matches = createSourceCandidateEligibilityMatcher([{
      root,
      explicit: true,
      entries: [{
        base: root,
        pattern: 'node_modules/**',
        negated: true,
      }],
    }])

    expect(matches(path.join(root, 'src/App.vue'))).toBe(false)
  })

  it('applies implicit negative sources to transformed modules', () => {
    const root = path.resolve('workspace/packages/app')
    const generatedRoot = path.join(root, 'src/generated')
    const matches = createSourceCandidateEligibilityMatcher([{
      root,
      entries: [{
        base: generatedRoot,
        pattern: '**/*',
        negated: true,
      }],
    }])

    expect(matches(path.join(root, 'src/App.vue'))).toBe(true)
    expect(matches(path.join(generatedRoot, 'client.ts'))).toBe(false)
  })

  it('accepts files from every implicit source root', () => {
    const appRoot = path.resolve('workspace/packages/app')
    const sharedRoot = path.resolve('workspace/shared-ui')
    const matches = createSourceCandidateEligibilityMatcher([
      { root: appRoot },
      { root: sharedRoot },
    ])

    expect(matches(path.join(appRoot, 'src/App.vue'))).toBe(true)
    expect(matches(path.join(sharedRoot, 'Button.vue'))).toBe(true)
    expect(matches(path.resolve('workspace/unrelated/index.ts'))).toBe(false)
  })
})
