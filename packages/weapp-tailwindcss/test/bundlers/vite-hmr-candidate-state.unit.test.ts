import { describe, expect, it } from 'vitest'
import { createViteHmrCandidateState } from '../../src/bundlers/vite/shared/framework-hmr-candidate-state'

function createState(isRuntimeAffectingSource?: (file: string) => boolean) {
  return createViteHmrCandidateState({
    cleanGeneratedCssByFile: new Map(),
    generatedClassSetByFile: new Map(),
    getCommand: () => 'serve',
    getGeneratorOptions: () => ({
      hmr: { preserveDeletedCss: true },
      target: 'web',
    }),
    getSourceCandidate: () => undefined,
    isRuntimeAffectingSource,
  })
}

describe('Vite HMR candidate state', () => {
  it('queues uni-app x source candidates for a full CSS regeneration', () => {
    const state = createState(file => /\.(?:uvue|nvue)$/.test(file))

    const change = state.createChange('/project/pages/index.uvue', {
      addedCandidates: new Set(['mt-200']),
      removedCandidates: new Set(),
    })
    state.apply(change)

    expect(change.runtimeAffecting).toBe(true)
    expect(state.hasPendingCandidateAppend()).toBe(false)
    expect(state.hasPendingChange()).toBe(false)
    expect(state.shouldForceFullRegeneration(false)).toBe(true)
  })

  it('keeps append-only candidate generation for ordinary source files', () => {
    const state = createState(file => /\.(?:uvue|nvue)$/.test(file))

    const change = state.createChange('/project/pages/index.vue', {
      addedCandidates: new Set(['mt-200']),
      removedCandidates: new Set(),
    })
    state.apply(change)

    expect(change.runtimeAffecting).toBe(false)
    expect(state.hasPendingCandidateAppend()).toBe(true)
    expect(state.hasPendingChange()).toBe(true)
  })
})
