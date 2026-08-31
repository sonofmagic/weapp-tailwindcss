import type { CoverageCell, CoverageLayer, CoverageStatus } from './coverageRegistry'
import fs from 'node:fs/promises'
import path from 'node:path'
import { COVERAGE_LAYERS, COVERAGE_REGISTRY, validateCoverageRegistry } from './coverageRegistry'

export const COVERAGE_REPORT_SCHEMA_VERSION = 2 as const
export type CoverageResultStatus = 'passed' | 'failed' | 'blocked' | 'not-run' | 'not-applicable' | 'unsupported'

export interface CoverageEvidence {
  cellId: string
  layer: CoverageLayer
  status: CoverageResultStatus
  executor: string
  evidenceSchema: string
  reason?: string
  checkpoints?: string[]
  artifacts?: string[]
  environment?: Record<string, string | number | boolean>
}

export interface CoverageReport {
  schemaVersion: typeof COVERAGE_REPORT_SCHEMA_VERSION
  generatedAt: string
  source: 'ci' | 'nightly' | 'local' | 'aggregate'
  cells: CoverageEvidence[]
  summary: {
    total: number
    passed: number
    failed: number
    blocked: number
    notRun: number
    notApplicable: number
    unsupported: number
    requiredUnverified: number
    coveragePercent: number
  }
}

function requiredStatus(status: CoverageStatus): boolean {
  return status === 'ci-required' || status === 'ci-nightly' || status === 'local-required' || status === 'unsupported-verified'
}

function resultForCell(cell: CoverageCell, layer: CoverageLayer): CoverageEvidence {
  const contract = cell.layers[layer]
  const status: CoverageResultStatus = contract.status === 'not-applicable'
    ? 'not-applicable'
    : contract.status === 'unsupported-verified'
      ? 'unsupported'
      : 'not-run'
  return {
    cellId: cell.id,
    layer,
    status,
    executor: contract.executor,
    evidenceSchema: contract.evidenceSchema,
    ...(contract.reason ? { reason: contract.reason } : {}),
  }
}

function summarize(cells: readonly CoverageEvidence[], registry: readonly CoverageCell[]) {
  const counts = {
    total: cells.length,
    passed: cells.filter(item => item.status === 'passed').length,
    failed: cells.filter(item => item.status === 'failed').length,
    blocked: cells.filter(item => item.status === 'blocked').length,
    notRun: cells.filter(item => item.status === 'not-run').length,
    notApplicable: cells.filter(item => item.status === 'not-applicable').length,
    unsupported: cells.filter(item => item.status === 'unsupported').length,
    requiredUnverified: 0,
    coveragePercent: 0,
  }
  const byKey = new Map(cells.map(item => [`${item.cellId}:${item.layer}`, item]))
  for (const cell of registry) {
    for (const layer of COVERAGE_LAYERS) {
      const contract = cell.layers[layer]
      const result = byKey.get(`${cell.id}:${layer}`)
      if (requiredStatus(contract.status) && result?.status !== 'passed' && result?.status !== 'unsupported') {
        counts.requiredUnverified++
      }
    }
  }
  const measurable = cells.filter(item => item.status !== 'not-applicable').length
  const verified = cells.filter(item => item.status === 'passed' || item.status === 'unsupported').length
  counts.coveragePercent = measurable === 0 ? 100 : Math.round((verified / measurable) * 10000) / 100
  return counts
}

export async function readCommittedCompatibilityEvidence(repoRoot: string): Promise<CoverageEvidence[]> {
  const evidence: CoverageEvidence[] = []
  const sources = [
    { source: 'react-native', platforms: ['web', 'android', 'ios'], dir: path.join(repoRoot, 'e2e', 'react-native', 'reports') },
    { source: 'lynx', platforms: ['android', 'ios'], dir: path.join(repoRoot, 'e2e', 'lynx', 'reports') },
  ] as const
  for (const item of sources) {
    for (const platform of item.platforms) {
      const file = path.join(item.dir, `${platform}.json`)
      let raw: string
      try {
        raw = await fs.readFile(file, 'utf8')
      }
      catch {
        continue
      }
      const report = JSON.parse(raw) as { results?: Array<{ id: string, status: 'supported' | 'unsupported', reason?: string }> }
      for (const result of report.results ?? []) {
        const cellId = `${item.source}/${platform}/${result.id}`
        const status: CoverageResultStatus = result.status === 'supported' ? 'passed' : 'unsupported'
        const reason = result.reason ?? (status === 'unsupported' ? '兼容性 catalog 明确标记为 unsupported。' : undefined)
        for (const layerName of ['static', 'runtime', 'visual', 'negative'] as const) {
          evidence.push({
            cellId,
            layer: layerName,
            status,
            executor: `pnpm e2e:${item.source}:${platform}`,
            evidenceSchema: `${item.source}-${layerName === 'negative' ? 'negative' : layerName}-v1`,
            ...(reason ? { reason } : {}),
          })
        }
      }
    }
  }
  return evidence
}

export function createCoverageReport(evidence: readonly CoverageEvidence[] = [], source: CoverageReport['source'] = 'aggregate', registry: readonly CoverageCell[] = COVERAGE_REGISTRY): CoverageReport {
  validateCoverageRegistry(registry)
  const expected = registry.flatMap(cell => COVERAGE_LAYERS.map(layer => resultForCell(cell, layer)))
  const byKey = new Map(expected.map(item => [`${item.cellId}:${item.layer}`, item]))
  const seenEvidence = new Set<string>()
  for (const item of evidence) {
    const key = `${item.cellId}:${item.layer}`
    if (!byKey.has(key)) {
      throw new Error(`coverage evidence references unknown cell/layer: ${key}`)
    }
    if (seenEvidence.has(key)) {
      throw new Error(`duplicate coverage evidence input: ${key}`)
    }
    seenEvidence.add(key)
    byKey.set(key, item)
  }
  const cells = [...byKey.values()]
  return {
    schemaVersion: COVERAGE_REPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source,
    cells,
    summary: summarize(cells, registry),
  }
}

export function validateCoverageReport(report: CoverageReport, registry: readonly CoverageCell[] = COVERAGE_REGISTRY) {
  validateCoverageRegistry(registry)
  if (report.schemaVersion !== COVERAGE_REPORT_SCHEMA_VERSION) {
    throw new Error('coverage report schemaVersion is stale')
  }
  const expected = registry.length * COVERAGE_LAYERS.length
  if (report.cells.length !== expected) {
    throw new Error(`coverage report must contain ${expected} cells`)
  }
  const ids = new Set<string>()
  const expectedIds = new Set(registry.flatMap(cell => COVERAGE_LAYERS.map(layer => `${cell.id}:${layer}`)))
  for (const item of report.cells) {
    const key = `${item.cellId}:${item.layer}`
    if (!expectedIds.has(key)) {
      throw new Error(`coverage report references unknown cell/layer: ${key}`)
    }
    if (ids.has(key)) {
      throw new Error(`duplicate coverage evidence: ${key}`)
    }
    ids.add(key)
    if (!item.executor || !item.evidenceSchema) {
      throw new Error(`${key} missing executor/evidenceSchema`)
    }
    if ((item.status === 'blocked' || item.status === 'failed' || item.status === 'unsupported') && !item.reason) {
      throw new Error(`${key} ${item.status} requires reason`)
    }
  }
  if (ids.size !== expectedIds.size) {
    throw new Error('coverage report is missing one or more registry cells')
  }
  const expectedSummary = summarize(report.cells, registry)
  if (JSON.stringify(expectedSummary) !== JSON.stringify(report.summary)) {
    throw new Error('coverage report summary is stale or inconsistent')
  }
  const requiredUnverified = report.summary.requiredUnverified
  if (requiredUnverified !== 0 && (report.source === 'ci' || report.source === 'nightly')) {
    throw new Error(`required coverage is unverified: ${requiredUnverified}`)
  }
  return report
}
