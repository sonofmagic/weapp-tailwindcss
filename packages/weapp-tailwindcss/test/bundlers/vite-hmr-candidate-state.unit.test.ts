import { describe, expect, it } from 'vitest'
import { createViteHmrCandidateState } from '../../src/bundlers/vite/shared/framework-hmr-candidate-state'

function createState(target: 'web' | 'weapp' = 'web') {
  const cleanGeneratedCssByFile = new Map([
    ['/project/main.css', '.flex { display: flex; }'],
  ])
  const generatedClassSetByFile = new Map([
    ['/project/main.css', new Set(['flex'])],
  ])
  return createViteHmrCandidateState({
    cleanGeneratedCssByFile,
    generatedClassSetByFile,
    getCommand: () => 'serve',
    getGeneratorOptions: () => ({
      hmr: { preserveDeletedCss: true },
      target,
    }),
    isRuntimeAffectingSource: file => target !== 'web' && /\.(?:uvue|nvue)$/.test(file),
  })
}

describe('Vite HMR candidate state', () => {
  it('queues Native uni-app x source candidates for a full CSS regeneration', () => {
    const state = createState('weapp')

    const change = state.createChange('/project/pages/index.uvue', {
      addedCandidates: new Set(['mt-200']),
      removedCandidates: new Set(),
    })
    state.apply(change)

    expect(change.runtimeAffecting).toBe(true)
    expect(state.hasPendingCandidateAppend()).toBe(false)
    expect(state.hasPendingChange()).toBe(true)
    expect(state.shouldForceFullRegeneration('/project/main.css', false)).toBe(false)

    state.armTargets([{ id: '/project/main.css' }], [])

    expect(state.shouldForceFullRegeneration('/project/other.css', false)).toBe(false)
    expect(state.shouldForceFullRegeneration('/project/main.css', false)).toBe(true)
    state.finishTarget('/project/main.css')
    expect(state.hasPendingChange()).toBe(false)
  })

  it('keeps append-only candidate generation for Web uni-app x source files', () => {
    const state = createState('web')

    const change = state.createChange('/project/pages/index.uvue', {
      addedCandidates: new Set(['mt-200']),
      removedCandidates: new Set(),
    })
    state.apply(change)

    expect(change.runtimeAffecting).toBe(false)
    expect(state.hasPendingCandidateAppend()).toBe(true)
    expect(state.hasPendingChange()).toBe(true)
  })

  it('reconciles candidates that entered another source layer before HMR scanning', () => {
    const state = createState('web')

    state.reconcileRuntimeCandidates(
      '/project/pages/index.uvue',
      new Set(['flex', 'mt-200']),
      ['/project/main.css', '/project/main.css?direct'],
    )

    expect(state.hasPendingCandidateAppend()).toBe(true)
    state.armTargets([{ id: '/project/main.css?direct' }], [])
    expect(state.resolve('@import "tailwindcss";', '/project/main.css')).toMatchObject({
      addedCandidates: new Set(['mt-200']),
    })
  })
})
