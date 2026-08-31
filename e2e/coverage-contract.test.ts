import { describe, expect, it } from 'vitest'
import { COVERAGE_LAYERS, COVERAGE_REGISTRY, validateCoverageRegistry } from './coverageRegistry'
import { createCoverageReport, validateCoverageReport } from './coverageReport'

describe('多端 coverage registry contract', () => {
  it('keeps every cell unique and every layer executable', () => {
    expect(COVERAGE_REGISTRY.length).toBeGreaterThan(109)
    expect(new Set(COVERAGE_REGISTRY.map(item => item.id)).size).toBe(COVERAGE_REGISTRY.length)
    expect(validateCoverageRegistry()).toBe(COVERAGE_REGISTRY)
    for (const cell of COVERAGE_REGISTRY) {
      for (const layer of COVERAGE_LAYERS) {
        expect(cell.layers[layer].executor, `${cell.id}:${layer}`).toBeTruthy()
        expect(cell.layers[layer].evidenceSchema, `${cell.id}:${layer}`).toBeTruthy()
      }
    }
  })

  it('does not treat blocked or not-run required cells as passing', () => {
    const report = createCoverageReport([], 'aggregate')
    expect(report.summary.requiredUnverified).toBeGreaterThan(0)
    expect(report.summary.coveragePercent).toBeLessThan(100)
    expect(() => validateCoverageReport({ ...report, source: 'ci' })).toThrow(/required coverage/)
  })

  it('requires reasons for unsupported evidence and rejects unknown cells', () => {
    expect(() => createCoverageReport([{
      cellId: 'unknown',
      layer: 'negative',
      status: 'unsupported',
      executor: 'test',
      evidenceSchema: 'negative-v1',
      reason: 'unknown',
    }])).toThrow(/unknown cell/)
    const report = createCoverageReport([{
      cellId: 'react-native/web/layout-columns',
      layer: 'negative',
      status: 'unsupported',
      executor: 'test',
      evidenceSchema: 'negative-v1',
      reason: '明确不支持',
    }], 'aggregate')
    const item = report.cells.find(item => item.cellId === 'react-native/web/layout-columns' && item.layer === 'negative')
    expect(item).toBeDefined()
    const invalidCells = report.cells.map((current) => {
      if (current !== item) {
        return current
      }
      const { reason: _reason, ...withoutReason } = current
      return withoutReason
    })
    expect(() => validateCoverageReport({ ...report, cells: invalidCells })).toThrow(/requires reason/)
  })

  it('rejects duplicate or unknown evidence instead of silently overwriting it', () => {
    const evidence = {
      cellId: 'react-native/web/layout-columns',
      layer: 'negative' as const,
      status: 'unsupported' as const,
      executor: 'test',
      evidenceSchema: 'negative-v1',
      reason: '明确不支持',
    }
    expect(() => createCoverageReport([evidence, evidence], 'aggregate')).toThrow(/duplicate coverage evidence input/)
    expect(() => createCoverageReport([{ ...evidence, cellId: 'missing' }], 'aggregate')).toThrow(/unknown cell/)
  })
})
