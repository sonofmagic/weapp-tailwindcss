import type { BenchmarkStats } from './types'

export function percentile(values: number[], pct: number) {
  if (values.length === 0) {
    return 0
  }
  if (pct <= 0) {
    return Math.min(...values)
  }
  if (pct >= 100) {
    return Math.max(...values)
  }
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((pct / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))]!
}

export function median(values: number[]) {
  if (values.length === 0) {
    return 0
  }
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!
}

export function summarize(values: number[]): BenchmarkStats {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      p75: 0,
      p95: 0,
    }
  }
  return {
    mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    median: median(values),
    min: Math.min(...values),
    max: Math.max(...values),
    p75: percentile(values, 75),
    p95: percentile(values, 95),
  }
}

export function formatMs(value: number) {
  return `${value.toFixed(2)}ms`
}

export function formatBytes(value: number) {
  const sign = value < 0 ? '-' : ''
  const absolute = Math.abs(value)
  if (absolute < 1024) {
    return `${sign}${absolute} B`
  }
  if (absolute < 1024 * 1024) {
    return `${sign}${(absolute / 1024).toFixed(1)} KiB`
  }
  return `${sign}${(absolute / 1024 / 1024).toFixed(2)} MiB`
}
