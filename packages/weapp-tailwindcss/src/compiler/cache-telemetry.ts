export type CacheInvalidationReason = 'source-change' | 'config-change' | 'runtime-change' | 'platform-change' | 'manual-clear' | 'capacity-eviction'
export interface CacheTelemetry { layer: 'source-scan' | 'candidate-index' | 'tailwind-generation' | 'postcss-result' | 'asset-emission', keyFingerprint: string, hit: boolean, invalidationReason?: CacheInvalidationReason, evicted?: boolean, entries?: number, memoryBytes?: number, revision?: number, operationId?: string }
export interface CacheTelemetryCollector { record: (entry: CacheTelemetry) => void, snapshot: () => readonly CacheTelemetry[], clear: () => void, hitRate: (layer?: CacheTelemetry['layer']) => number }

export function createCacheTelemetryCollector(): CacheTelemetryCollector {
  const entries: CacheTelemetry[] = []
  return {
    record(entry) { entries.push({ ...entry }) },
    snapshot() { return entries },
    clear() { entries.length = 0 },
    hitRate(layer) {
      const selected = layer ? entries.filter(entry => entry.layer === layer) : entries
      return selected.length === 0 ? 0 : selected.filter(entry => entry.hit).length / selected.length
    },
  }
}
