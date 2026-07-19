import process from 'node:process'
import { pathToFileURL } from 'node:url'

interface BenchmarkStats {
  count: number
  max: number
  mean: number
  median: number
  min: number
  p95: number
  stddev: number
}

interface SourceCandidateStore {
  syncCurrentSource: (file: string, source: string) => Promise<unknown>
  syncSource: (file: string, source: string) => Promise<unknown>
}

interface CreateSourceCandidateStore {
  (options: { extractor: (source: string) => string[] }): SourceCandidateStore
}

interface MemoryStabilityResult {
  baselineHeapUsedMb: number
  growthPct: number
  samples: number[]
  stable: boolean
  steadyHeapUsedMb: number
}

function summarize(values: number[]): BenchmarkStats {
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const medianIndex = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[medianIndex - 1]! + sorted[medianIndex]!) / 2
    : sorted[medianIndex]!
  const p95Index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length
  return {
    count: values.length,
    max: sorted.at(-1)!,
    mean,
    median,
    min: sorted[0]!,
    p95: sorted[p95Index]!,
    stddev: Math.sqrt(variance),
  }
}

async function runSample(createSourceCandidateStore: CreateSourceCandidateStore) {
  const store = createSourceCandidateStore({
    extractor: (source: string) => source.split(/\s+/).filter(Boolean),
  })
  for (let index = 0; index < 5000; index++) {
    await store.syncSource(`/project/${index}.ts`, `shared token-${index}`)
  }
  for (let index = 0; index < 20; index++) {
    await store.syncCurrentSource('/project/0.ts', `shared warm-${index % 2}`)
  }
  const startedAt = performance.now()
  for (let index = 0; index < 200; index++) {
    await store.syncCurrentSource('/project/0.ts', `shared next-${index % 2}`)
  }
  return performance.now() - startedAt
}

function heapUsedMb() {
  const runtimeGlobal = globalThis as typeof globalThis & { gc?: () => void }
  runtimeGlobal.gc?.()
  return process.memoryUsage().heapUsed / 1024 / 1024
}

async function runMemoryStability(createSourceCandidateStore: CreateSourceCandidateStore): Promise<MemoryStabilityResult> {
  const store = createSourceCandidateStore({
    extractor: (source: string) => source.split(/\s+/).filter(Boolean),
  })
  const sourceFile = '/project/memory-stability.ts'
  for (let index = 0; index < 20; index++) {
    await store.syncCurrentSource(sourceFile, `shared warm-${index}`)
    await store.syncCurrentSource(sourceFile, '')
  }

  const samples: number[] = []
  for (let index = 0; index < 100; index++) {
    await store.syncCurrentSource(sourceFile, `shared class-${index}`)
    await store.syncCurrentSource(sourceFile, '')
    if ((index + 1) % 10 === 0) {
      samples.push(heapUsedMb())
    }
  }
  const baselineHeapUsedMb = summarize(samples.slice(0, 3)).median
  const steadyHeapUsedMb = summarize(samples.slice(-3)).median
  const growthPct = baselineHeapUsedMb === 0
    ? 0
    : ((steadyHeapUsedMb - baselineHeapUsedMb) / baselineHeapUsedMb) * 100
  return {
    baselineHeapUsedMb,
    growthPct,
    samples,
    stable: growthPct <= 5,
    steadyHeapUsedMb,
  }
}

async function main() {
  const sourceFile = process.argv[2]
  if (!sourceFile) {
    throw new Error('source candidate module path is required')
  }
  const { createSourceCandidateStore } = await import(pathToFileURL(sourceFile).href)
  const samples: number[] = []
  for (let index = 0; index < 3; index++) {
    samples.push(await runSample(createSourceCandidateStore))
  }
  const memoryStability = await runMemoryStability(createSourceCandidateStore)
  process.stdout.write(`${JSON.stringify({
    memoryStability,
    samples,
    summary: summarize(samples),
  })}\n`)
}

void main()
