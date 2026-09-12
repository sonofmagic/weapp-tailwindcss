import { describe, expect, it } from 'vitest'
import { CandidateIndex, createCacheTelemetryCollector, createCapabilityDiagnostic, missingCapabilities } from '../../src/compiler'

describe('P1 能力契约与缓存遥测', () => {
  it('报告缺失能力并生成结构化诊断', () => {
    const actual = { adapter: 'test', version: '1', capabilities: ['diagnostics'] as const }
    expect(missingCapabilities(actual, ['diagnostics', 'watchUpdate'])).toEqual(['watchUpdate'])
    expect(createCapabilityDiagnostic(actual, ['watchUpdate'])?.error?.name).toBe('MissingCapability')
  })
  it('按层统计缓存命中率并保留失效原因', () => {
    const collector = createCacheTelemetryCollector()
    collector.record({ layer: 'source-scan', keyFingerprint: 'a', hit: true })
    collector.record({ layer: 'source-scan', keyFingerprint: 'b', hit: false, invalidationReason: 'source-change' })
    expect(collector.hitRate('source-scan')).toBe(0.5)
    expect(collector.snapshot()[1].invalidationReason).toBe('source-change')
    expect(collector.summary('source-scan')[0]).toMatchObject({ samples: 2, hits: 1, invalidations: 1 })
  })
  it('记录候选索引的命中、失效和内存估算', () => {
    const collector = createCacheTelemetryCollector()
    const index = new CandidateIndex(collector)
    index.sync('src\\page.ts', ['text-red-500'])
    index.sync('src\\page.ts', ['text-red-500'])
    index.remove('src\\page.ts')
    expect(collector.summary('candidate-index')[0]).toMatchObject({ samples: 3, hits: 1, evictions: 1 })
  })
})
