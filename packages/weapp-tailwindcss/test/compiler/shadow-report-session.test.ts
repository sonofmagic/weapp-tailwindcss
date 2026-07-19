import type { CompilerShadowReport } from '@/compiler'
import { describe, expect, it } from 'vitest'
import { CompilerShadowReportSession } from '@/compiler'

function createReport(file: string, options: {
  equal?: boolean
  scopeId?: string
  truncated?: boolean
  value?: string
} = {}): CompilerShadowReport {
  const equal = options.equal ?? true
  return {
    file,
    scopeId: options.scopeId ?? file,
    equal,
    differences: equal
      ? []
      : [{
          kind: 'changed',
          path: '$.fragments[0].root[0].selector',
          left: '.legacy',
          right: options.value ?? '.graph',
        }],
    truncated: options.truncated ?? false,
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

describe('CompilerShadowReportSession', () => {
  it('groups reports by explicit run and keeps the latest report for each file', () => {
    const session = new CompilerShadowReportSession()

    expect(session.beginRun()).toBe(1)
    session.record(createReport('b.css'))
    session.record(createReport('a.css', { equal: false, value: '.first' }))
    session.record(createReport('a.css', { equal: false, truncated: true, value: '.latest' }))

    const snapshot = session.snapshot()
    expect(snapshot.revision).toBe(1)
    expect(snapshot.reports.map(report => report.file)).toEqual(['a.css', 'b.css'])
    expect(snapshot.reports[0]?.differences[0]?.right).toBe('.latest')
    expect(snapshot.summary).toEqual({
      total: 2,
      matched: 1,
      mismatched: 1,
      truncated: 1,
      dropped: 0,
    })

    expect(session.beginRun()).toBe(2)
    expect(session.snapshot().reports).toEqual([])
  })

  it('keeps distinct output scopes that share the same source file', () => {
    const session = new CompilerShadowReportSession()
    session.record(createReport('shared.css', { scopeId: 'app.css' }))
    session.record(createReport('shared.css', { scopeId: 'subpackage/app.css' }))

    expect(session.snapshot().reports.map(report => report.scopeId)).toEqual([
      'app.css',
      'subpackage/app.css',
    ])
  })

  it('bounds retained reports and returns isolated snapshots', () => {
    const session = new CompilerShadowReportSession(2)
    session.record(createReport('a.css', { equal: false }))
    session.record(createReport('b.css'))
    session.record(createReport('c.css'))

    const snapshot = session.snapshot()
    expect(snapshot.reports.map(report => report.file)).toEqual(['b.css', 'c.css'])
    expect(snapshot.summary.dropped).toBe(1)

    snapshot.reports[0]!.file = 'mutated.css'
    snapshot.reports[0]!.legacy.fragments = 99
    expect(session.snapshot().reports[0]).toMatchObject({
      file: 'b.css',
      legacy: { fragments: 1 },
    })
  })

  it('discards reports completed after their run revision became stale', () => {
    const session = new CompilerShadowReportSession()
    const staleRevision = session.beginRun()
    const currentRevision = session.beginRun()

    expect(session.record(createReport('stale.css'), staleRevision)).toBe(false)
    expect(session.record(createReport('current.css'), currentRevision)).toBe(true)
    expect(session.snapshot().reports.map(report => report.file)).toEqual(['current.css'])
  })

  it('seals completed runs and rejects late reports', () => {
    const session = new CompilerShadowReportSession()
    const revision = session.beginRun()
    session.record(createReport('current.css'), revision)

    expect(session.completeRun(revision)).toMatchObject({
      revision,
      completed: true,
    })
    expect(session.record(createReport('late.css'), revision)).toBe(false)
    expect(session.snapshot().reports.map(report => report.file)).toEqual(['current.css'])
  })

  it('rejects invalid capacities and access after disposal', () => {
    expect(() => new CompilerShadowReportSession(0)).toThrow('maxReports 必须是正整数')
    const session = new CompilerShadowReportSession()
    session.dispose()
    expect(() => session.snapshot()).toThrow('已释放')
  })
})
