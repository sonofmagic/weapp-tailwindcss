export interface BundleMetric {
  total: number
  transformed: number
  cacheHits: number
  elapsed: number
}

export interface BundleMetrics {
  runtimeSet: number
  html: BundleMetric
  js: BundleMetric
  css: BundleMetric
}

export function formatDebugFileList(files: Set<string>, limit = 8) {
  if (files.size === 0) {
    return '-'
  }
  const sorted = [...files].sort()
  if (sorted.length <= limit) {
    return sorted.join(',')
  }
  return `${sorted.slice(0, limit).join(',')},...(+${sorted.length - limit})`
}

function createEmptyMetric(): BundleMetric {
  return {
    total: 0,
    transformed: 0,
    cacheHits: 0,
    elapsed: 0,
  }
}

export function createEmptyMetrics(): BundleMetrics {
  return {
    runtimeSet: 0,
    html: createEmptyMetric(),
    js: createEmptyMetric(),
    css: createEmptyMetric(),
  }
}

export function measureElapsed(start: number) {
  return performance.now() - start
}

export function formatCacheHitRate(metric: BundleMetric) {
  if (metric.total === 0) {
    return '0.00%'
  }
  return `${((metric.cacheHits / metric.total) * 100).toFixed(2)}%`
}

export function formatMs(value: number) {
  return value.toFixed(2)
}
