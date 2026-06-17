import type {
  HmrMemoryDebugSample,
  HmrMemoryDebugSummary,
  HmrMemoryProjectReport,
  HmrMemoryReport,
  MemoryUsageSample,
  MemoryUsageSummary,
  WatchCaseMetrics,
} from './types'

function toFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function readProcessMemoryValue(sample: HmrMemoryDebugSample, key: 'heapUsedMb' | 'rssMb') {
  const processStats = sample.data.process
  if (!processStats || typeof processStats !== 'object' || Array.isArray(processStats)) {
    return undefined
  }
  return toFiniteNumber((processStats as Record<string, unknown>)[key])
}

export function summarizeMemorySamples(samples: MemoryUsageSample[]): MemoryUsageSummary {
  if (samples.length === 0) {
    return {
      count: 0,
      baselineRssMb: 0,
      peakRssMb: 0,
      rssDeltaMb: 0,
      peakMaxProcessRssMb: 0,
      peakProcessCount: 0,
      durationMs: 0,
    }
  }

  const first = samples.find(sample => sample.processCount > 1 && sample.rssMb >= 128) ?? samples[0]!
  const peakRssMb = Math.max(...samples.map(sample => sample.rssMb))
  const peakMaxProcessRssMb = Math.max(...samples.map(sample => sample.maxProcessRssMb))
  const peakProcessCount = Math.max(...samples.map(sample => sample.processCount))
  const firstAt = samples[0]!.at
  const lastAt = samples[samples.length - 1]!.at
  return {
    count: samples.length,
    baselineRssMb: first.rssMb,
    peakRssMb,
    rssDeltaMb: Math.max(0, peakRssMb - first.rssMb),
    peakMaxProcessRssMb,
    peakProcessCount,
    firstAt,
    lastAt,
    durationMs: Math.max(0, lastAt - firstAt),
  }
}

export function summarizeMemoryDebugSamples(samples: HmrMemoryDebugSample[]): HmrMemoryDebugSummary {
  const byBundlerPhase = new Map<string, {
    count: number
    peakHeapUsedMb: number
    peakRssMb: number
  }>()

  let peakHeapUsedMb = 0
  let peakRssMb = 0
  for (const sample of samples) {
    const heapUsedMb = readProcessMemoryValue(sample, 'heapUsedMb') ?? 0
    const rssMb = readProcessMemoryValue(sample, 'rssMb') ?? 0
    peakHeapUsedMb = Math.max(peakHeapUsedMb, heapUsedMb)
    peakRssMb = Math.max(peakRssMb, rssMb)

    const key = `${sample.bundler}:${sample.phase}`
    const current = byBundlerPhase.get(key) ?? {
      count: 0,
      peakHeapUsedMb: 0,
      peakRssMb: 0,
    }
    current.count += 1
    current.peakHeapUsedMb = Math.max(current.peakHeapUsedMb, heapUsedMb)
    current.peakRssMb = Math.max(current.peakRssMb, rssMb)
    byBundlerPhase.set(key, current)
  }

  return {
    count: samples.length,
    peakHeapUsedMb,
    peakRssMb,
    byBundlerPhase: Object.fromEntries(
      [...byBundlerPhase.entries()].sort(([a], [b]) => a.localeCompare(b)),
    ),
  }
}

function createProjectMemoryReport(item: WatchCaseMetrics): HmrMemoryProjectReport {
  return {
    name: item.name,
    label: item.label,
    project: item.project,
    projectGroup: item.projectGroup,
    initialReadyMs: Math.round(item.initialReadyMs),
    totalMs: Math.round(item.totalMs),
    sampleCount: item.memorySummary.count,
    debugSampleCount: item.memoryDebugSummary.count,
    baselineRssMb: item.memorySummary.baselineRssMb,
    peakRssMb: item.memorySummary.peakRssMb,
    rssDeltaMb: item.memorySummary.rssDeltaMb,
    peakMaxProcessRssMb: item.memorySummary.peakMaxProcessRssMb,
    peakProcessCount: item.memorySummary.peakProcessCount,
    peakHeapUsedMb: item.memoryDebugSummary.peakHeapUsedMb,
    peakDebugRssMb: item.memoryDebugSummary.peakRssMb,
  }
}

export function summarizeHmrMemoryReport(cases: WatchCaseMetrics[]): HmrMemoryReport {
  const byProject = Object.fromEntries(
    cases.map(item => [item.project, createProjectMemoryReport(item)]),
  )
  const projects = Object.values(byProject)
  const sampleCount = projects.reduce((total, item) => total + item.sampleCount, 0)
  const debugSampleCount = projects.reduce((total, item) => total + item.debugSampleCount, 0)

  return {
    summary: {
      projectCount: projects.length,
      sampleCount,
      debugSampleCount,
      peakRssMb: Math.max(0, ...projects.map(item => item.peakRssMb)),
      maxRssDeltaMb: Math.max(0, ...projects.map(item => item.rssDeltaMb)),
      peakHeapUsedMb: Math.max(0, ...projects.map(item => item.peakHeapUsedMb)),
    },
    byProject,
  }
}
