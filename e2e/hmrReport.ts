import type { ProjectHmrDurationReport, WatchReport } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import type { DemoCoverageEntry } from './demoCoverageMatrix'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { DEMO_COVERAGE_MATRIX } from './demoCoverageMatrix'

export interface HmrFullRunCaseReportInput {
  caseName: string
  reportFile: string
}

export interface HmrTimingSample {
  surface: string
  sourceFile?: string
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs?: number
  hotUpdatePluginProcessMs?: number
}

export interface HmrTimingSummary {
  count: number
  avgMs: number
  minMs: number
  maxMs: number
  p50Ms: number
  p95Ms: number
}

export interface HmrFullRunProjectReport {
  caseName: string
  project: string
  label: string
  platform: string
  framework?: DemoCoverageEntry['framework']
  builder?: string
  tailwindcss?: DemoCoverageEntry['tailwindcss']
  sourceShape?: DemoCoverageEntry['sourceShape']
  reportFile: string
  initialReadyMs: number
  totalMs: number
  summary: HmrTimingSummary
  memory?: {
    sampleCount: number
    debugSampleCount: number
    baselineRssMb: number
    peakRssMb: number
    rssDeltaMb: number
    peakMaxProcessRssMb: number
    peakProcessCount: number
    peakHeapUsedMb: number
    peakDebugRssMb: number
  }
  timings: HmrTimingSample[]
}

export interface HmrFullRunReport {
  generatedAt: string
  repositoryRoot: string
  targetNames: string[]
  totalCases: number
  reportCount: number
  projectCount: number
  timingCount: number
  summary: HmrTimingSummary
  byApp: Record<string, {
    project: string
    platforms: Record<string, HmrTimingSummary>
  }>
  byPlatform: Record<string, HmrTimingSummary>
  memory: {
    projectCount: number
    sampleCount: number
    debugSampleCount: number
    peakRssMb: number
    maxRssDeltaMb: number
    peakHeapUsedMb: number
    byApp: Record<string, {
      peakRssMb: number
      maxRssDeltaMb: number
      peakHeapUsedMb: number
    }>
    byPlatform: Record<string, {
      peakRssMb: number
      maxRssDeltaMb: number
      peakHeapUsedMb: number
    }>
  }
  cases: HmrFullRunProjectReport[]
}

function toFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function percentile(sortedValues: number[], ratio: number) {
  if (sortedValues.length === 0) {
    return 0
  }
  const index = Math.ceil(sortedValues.length * ratio) - 1
  return sortedValues[Math.min(Math.max(index, 0), sortedValues.length - 1)]!
}

export function summarizeHmrTimingSamples(samples: Array<Pick<HmrTimingSample, 'hotUpdateEffectiveMs'>>): HmrTimingSummary {
  const values = samples
    .map(item => item.hotUpdateEffectiveMs)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)

  if (values.length === 0) {
    return {
      count: 0,
      avgMs: 0,
      minMs: 0,
      maxMs: 0,
      p50Ms: 0,
      p95Ms: 0,
    }
  }

  const sum = values.reduce((total, value) => total + value, 0)
  return {
    count: values.length,
    avgMs: Math.round(sum / values.length),
    minMs: values[0]!,
    maxMs: values[values.length - 1]!,
    p50Ms: percentile(values, 0.5),
    p95Ms: percentile(values, 0.95),
  }
}

function automatedHotUpdatePlatforms(entry: DemoCoverageEntry) {
  return entry.platforms
    .filter(platform => platform.hmrCoverage === 'automated')
    .filter(platform => platform.command.includes('e2e:hot-update:demo') || platform.command.includes('e2e:taro:web-hmr') || platform.command.includes('web-vite-demo-hmr.test.ts'))
    .map(platform => platform.platform)
}

function resolveHmrPlatform(entry: DemoCoverageEntry | undefined) {
  if (!entry) {
    return 'unknown'
  }

  const platforms = automatedHotUpdatePlatforms(entry)
  if (entry.name.startsWith('web/')) {
    return platforms.includes('web') ? 'web' : (platforms[0] ?? 'web')
  }

  const miniProgramPlatform = platforms.find(platform => platform !== 'h5' && platform !== 'web')
  return miniProgramPlatform ?? platforms[0] ?? 'unknown'
}

function toTimingSamples(report: ProjectHmrDurationReport) {
  const samples: HmrTimingSample[] = []
  for (const timing of report.timings ?? []) {
    const hotUpdateEffectiveMs = toFiniteNumber(timing.hotUpdateEffectiveMs)
    const rollbackEffectiveMs = toFiniteNumber(timing.rollbackEffectiveMs)
    const hotUpdatePluginProcessMs = toFiniteNumber(timing.hotUpdatePluginProcessMs)
    if (hotUpdateEffectiveMs == null) {
      continue
    }
    samples.push({
      surface: timing.surface,
      ...(timing.sourceFile ? { sourceFile: timing.sourceFile } : {}),
      hotUpdateEffectiveMs,
      ...(rollbackEffectiveMs == null ? {} : { rollbackEffectiveMs }),
      ...(hotUpdatePluginProcessMs == null ? {} : { hotUpdatePluginProcessMs }),
    })
  }
  return samples
}

function resolveProjectMemory(report: WatchReport, project: string) {
  return report.memoryReport?.byProject?.[project]
}

function groupSummary<T>(items: T[], getKey: (item: T) => string, getSamples: (item: T) => HmrTimingSample[]) {
  const groups = new Map<string, HmrTimingSample[]>()
  for (const item of items) {
    const key = getKey(item) || 'unknown'
    const samples = groups.get(key) ?? []
    samples.push(...getSamples(item))
    groups.set(key, samples)
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, samples]) => [key, summarizeHmrTimingSamples(samples)]),
  )
}

function buildByApp(cases: HmrFullRunProjectReport[]) {
  const apps = new Map<string, HmrFullRunProjectReport[]>()
  for (const item of cases) {
    const group = apps.get(item.project) ?? []
    group.push(item)
    apps.set(item.project, group)
  }

  return Object.fromEntries(
    [...apps.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([project, projectCases]) => [
        project,
        {
          project,
          platforms: groupSummary(projectCases, item => item.platform, item => item.timings),
        },
      ]),
  )
}

function groupMemory<T>(items: T[], getKey: (item: T) => string, getMemory: (item: T) => HmrFullRunProjectReport['memory']) {
  const groups = new Map<string, NonNullable<HmrFullRunProjectReport['memory']>[]>()
  for (const item of items) {
    const memory = getMemory(item)
    if (!memory) {
      continue
    }
    const key = getKey(item) || 'unknown'
    const samples = groups.get(key) ?? []
    samples.push(memory)
    groups.set(key, samples)
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, samples]) => [key, {
        peakRssMb: Math.max(0, ...samples.map(sample => sample.peakRssMb)),
        maxRssDeltaMb: Math.max(0, ...samples.map(sample => sample.rssDeltaMb)),
        peakHeapUsedMb: Math.max(0, ...samples.map(sample => sample.peakHeapUsedMb)),
      }]),
  )
}

function buildMemorySummary(cases: HmrFullRunProjectReport[]) {
  const memorySamples = cases
    .map(item => item.memory)
    .filter((item): item is NonNullable<HmrFullRunProjectReport['memory']> => Boolean(item))

  return {
    projectCount: memorySamples.length,
    sampleCount: memorySamples.reduce((total, item) => total + item.sampleCount, 0),
    debugSampleCount: memorySamples.reduce((total, item) => total + item.debugSampleCount, 0),
    peakRssMb: Math.max(0, ...memorySamples.map(item => item.peakRssMb)),
    maxRssDeltaMb: Math.max(0, ...memorySamples.map(item => item.rssDeltaMb)),
    peakHeapUsedMb: Math.max(0, ...memorySamples.map(item => item.peakHeapUsedMb)),
    byApp: groupMemory(cases, item => item.project, item => item.memory),
    byPlatform: groupMemory(cases, item => item.platform, item => item.memory),
  }
}

export async function buildHmrFullRunReport(options: {
  generatedAt: string
  repositoryRoot: string
  targetNames: string[]
  reports: HmrFullRunCaseReportInput[]
}): Promise<HmrFullRunReport> {
  const entriesByName = new Map(DEMO_COVERAGE_MATRIX.map(entry => [entry.name, entry]))
  const cases: HmrFullRunProjectReport[] = []

  for (const item of options.reports) {
    const raw = await readFile(item.reportFile, 'utf8')
    const report = JSON.parse(raw) as WatchReport
    for (const projectReport of Object.values(report.hmrDurations?.byProject ?? {})) {
      const project = projectReport.project || item.caseName
      const entry = entriesByName.get(project) ?? entriesByName.get(item.caseName)
      const timings = toTimingSamples(projectReport)
      const memory = resolveProjectMemory(report, project)
      cases.push({
        caseName: item.caseName,
        project,
        label: projectReport.label || item.caseName,
        platform: resolveHmrPlatform(entry),
        ...(entry ? { framework: entry.framework, builder: entry.builder, tailwindcss: entry.tailwindcss, sourceShape: entry.sourceShape } : {}),
        reportFile: path.relative(options.repositoryRoot, item.reportFile).split(path.sep).join('/'),
        initialReadyMs: projectReport.initialReadyMs,
        totalMs: projectReport.totalMs,
        summary: summarizeHmrTimingSamples(timings),
        ...(memory
          ? {
              memory: {
                sampleCount: memory.sampleCount,
                debugSampleCount: memory.debugSampleCount,
                baselineRssMb: memory.baselineRssMb,
                peakRssMb: memory.peakRssMb,
                rssDeltaMb: memory.rssDeltaMb,
                peakMaxProcessRssMb: memory.peakMaxProcessRssMb,
                peakProcessCount: memory.peakProcessCount,
                peakHeapUsedMb: memory.peakHeapUsedMb,
                peakDebugRssMb: memory.peakDebugRssMb,
              },
            }
          : {}),
        timings,
      })
    }
  }

  const allTimings = cases.flatMap(item => item.timings)
  return {
    generatedAt: options.generatedAt,
    repositoryRoot: options.repositoryRoot,
    targetNames: options.targetNames,
    totalCases: options.reports.length,
    reportCount: options.reports.length,
    projectCount: cases.length,
    timingCount: allTimings.length,
    summary: summarizeHmrTimingSamples(allTimings),
    byApp: buildByApp(cases),
    byPlatform: groupSummary(cases, item => item.platform, item => item.timings),
    memory: buildMemorySummary(cases),
    cases,
  }
}

export async function writeHmrFullRunReport(options: {
  generatedAt: string
  repositoryRoot: string
  targetNames: string[]
  reports: HmrFullRunCaseReportInput[]
  outputFile: string
}) {
  const report = await buildHmrFullRunReport(options)
  await writeFile(options.outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  return report
}
