import { describe, expect, it } from 'vitest'
import { DefaultCompilationSession } from '@/compiler'

describe('compiler session', () => {
  it('owns candidate revisions and propagates invalidation through explicit edges', () => {
    const session = new DefaultCompilationSession()
    const first = session.update({
      nodes: [
        { id: 'page', kind: 'template', scope: { id: 'page', kind: 'component' } },
        { id: 'theme', kind: 'css', scope: { id: 'global', kind: 'global' } },
      ],
      edges: [
        { from: 'page', to: 'theme', kind: 'depends-on' },
      ],
      candidatesBySource: [
        ['page', ['p-4']],
      ],
    })
    const second = session.update({
      nodes: [
        { id: 'page', kind: 'template', scope: { id: 'page', kind: 'component' } },
        { id: 'theme', kind: 'css', scope: { id: 'global', kind: 'global' } },
      ],
      edges: [
        { from: 'page', to: 'theme', kind: 'depends-on' },
      ],
      candidatesBySource: [
        ['page', ['p-4', 'text-red-500']],
      ],
      changes: [
        { sourceId: 'theme', type: 'dependency-changed' },
      ],
    })

    expect(first.revision).toBe(1)
    expect(second.revision).toBe(2)
    expect(second.candidates).toEqual(new Set(['p-4', 'text-red-500']))
    expect(second.validatedClassSet).toEqual(new Set())
    expect(second.invalidatedScopes).toEqual(new Set(['global', 'page']))
  })

  it('removes candidates with their source', () => {
    const session = new DefaultCompilationSession()
    session.update({
      nodes: [{ id: 'page', kind: 'template', scope: { id: 'page', kind: 'component' } }],
      edges: [],
      candidatesBySource: [['page', ['p-4']]],
    })
    const result = session.update({
      nodes: [],
      edges: [],
      changes: [{ sourceId: 'page', type: 'source-removed' }],
    })

    expect(result.candidates).toEqual(new Set())
    expect(result.invalidatedScopes).toEqual(new Set(['page']))
  })

  it('keeps deleted candidates only when preserveDeletedCss is enabled', () => {
    const session = new DefaultCompilationSession()
    session.update({
      nodes: [{ id: 'page', kind: 'template', scope: { id: 'page', kind: 'component' } }],
      edges: [],
      candidatesBySource: [['page', ['p-4']]],
      preserveDeletedCss: true,
      validatedClassSet: ['p-4'],
    })
    const retained = session.update({
      nodes: [],
      edges: [],
      changes: [{ sourceId: 'page', type: 'source-removed' }],
      preserveDeletedCss: true,
    })
    const removed = session.update({
      nodes: [],
      edges: [],
      preserveDeletedCss: false,
    })

    expect(retained.candidates).toEqual(new Set(['p-4']))
    expect(retained.validatedClassSet).toEqual(new Set(['p-4']))
    expect(removed.candidates).toEqual(new Set())
  })
})
