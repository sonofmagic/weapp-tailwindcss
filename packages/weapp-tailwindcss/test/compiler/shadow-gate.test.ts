import type { CompilerShadowReport } from '@/compiler'
import { describe, expect, it, vi } from 'vitest'
import {
  beginCompilerShadowRun,
  COMPILER_SHADOW_GATE_ENV,
  COMPILER_MODE_ENV,
  finalizeCompilerShadowRun,
  getCompilerShadowReportSession,
  getCompilerShadowRunSnapshot,
  resolveCompilerShadowGateMode,
} from '@/compiler'

function createReport(equal: boolean): CompilerShadowReport {
  return {
    file: '/workspace/src/app.css',
    scopeId: 'app.css',
    equal,
    differences: equal
      ? []
      : [{
          kind: 'changed',
          path: '$.fragments[0].root[0].selector',
          left: '.legacy',
          right: '.graph',
        }],
    truncated: !equal,
    legacy: {
      present: true,
      fragments: 1,
      classes: 1,
      rawCandidates: 1,
      dependencies: 0,
      sourceEntries: 1,
    },
    graph: {
      present: true,
      fragments: 1,
      classes: 1,
      rawCandidates: 1,
      dependencies: 0,
      sourceEntries: 1,
    },
  }
}

function createShadowEnv(mode: 'off' | 'report' | 'error') {
  return {
    [COMPILER_MODE_ENV]: 'shadow',
    [COMPILER_SHADOW_GATE_ENV]: mode,
  }
}

describe('compiler shadow gate', () => {
  it('resolves opt-in gate modes and defaults invalid values to off', () => {
    expect(resolveCompilerShadowGateMode({})).toBe('off')
    expect(resolveCompilerShadowGateMode({ [COMPILER_SHADOW_GATE_ENV]: 'report' })).toBe('report')
    expect(resolveCompilerShadowGateMode({ [COMPILER_SHADOW_GATE_ENV]: 'ERROR' })).toBe('error')
    expect(resolveCompilerShadowGateMode({ [COMPILER_SHADOW_GATE_ENV]: 'strict' })).toBe('off')
  })

  it('reports successful completed runs without changing build behavior', () => {
    const owner = {}
    const emit = vi.fn()
    beginCompilerShadowRun(owner)
    getCompilerShadowReportSession(owner).record(createReport(true))

    const result = finalizeCompilerShadowRun(owner, {
      emit,
      env: createShadowEnv('report'),
    })

    expect(result).toMatchObject({ passed: true, issues: [] })
    expect(result?.snapshot.completed).toBe(true)
    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ passed: true }))
  })

  it('throws only in error mode and seals the completed revision', () => {
    const owner = {}
    const revision = beginCompilerShadowRun(owner)
    const session = getCompilerShadowReportSession(owner)
    session.record(createReport(false), revision)

    expect(() => finalizeCompilerShadowRun(owner, {
      emit: vi.fn(),
      env: createShadowEnv('error'),
      revision,
    })).toThrow('semantic-mismatch, truncated-report')
    expect(getCompilerShadowRunSnapshot(owner).completed).toBe(true)
    expect(session.record(createReport(true), revision)).toBe(false)
  })

  it('ignores gate finalization outside shadow compiler mode', () => {
    const owner = {}
    beginCompilerShadowRun(owner)

    expect(finalizeCompilerShadowRun(owner, {
      env: { [COMPILER_MODE_ENV]: 'graph', [COMPILER_SHADOW_GATE_ENV]: 'error' },
    })).toBeUndefined()
    expect(getCompilerShadowRunSnapshot(owner).completed).toBe(false)
  })
})
