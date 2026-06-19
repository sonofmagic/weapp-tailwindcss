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
  pluginProcessSummary: HmrTimingSummary
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
  notes: string[]
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
  pluginProcessSummary: HmrTimingSummary
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

function formatMs(value: number) {
  return `${Math.round(value)}ms`
}

function formatMb(value: number) {
  return `${Math.round(value)}MB`
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

function toPluginProcessSummary(timings: HmrTimingSample[]) {
  return summarizeHmrTimingSamples(
    timings
      .map(item => item.hotUpdatePluginProcessMs)
      .filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
      .map(hotUpdateEffectiveMs => ({ hotUpdateEffectiveMs })),
  )
}

function createProjectNotes(options: {
  summary: HmrTimingSummary
  pluginProcessSummary: HmrTimingSummary
  memory?: HmrFullRunProjectReport['memory']
}) {
  const notes: string[] = []
  const pluginMax = options.pluginProcessSummary.maxMs
  const e2eMax = options.summary.maxMs
  if (pluginMax > 0 && e2eMax >= Math.max(pluginMax * 5, 5000)) {
    notes.push('端到端 HMR 明显高于插件处理耗时，主要口径包含框架 dev server 编译、产物写入、浏览器/运行时可见等待。')
  }
  if (options.pluginProcessSummary.count === 0) {
    notes.push('未采集到插件处理耗时样本；该场景可能没有输出 [weapp-tailwindcss:hmr] timing，或当前 HMR 验证路径不经过插件 timing 汇总。')
  }
  if (!options.memory || options.memory.debugSampleCount === 0) {
    notes.push('未采集到 plugin heap 样本；需要 WEAPP_TW_HMR_MEMORY_DEBUG=1 且插件日志携带 memoryDebug。')
  }
  else if (options.memory.peakHeapUsedMb === 0) {
    notes.push('采集到了 memoryDebug 样本，但样本内没有有效 process.heapUsedMb。')
  }
  return notes
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
      const projectMemory = memory
        ? {
            sampleCount: memory.sampleCount,
            debugSampleCount: memory.debugSampleCount,
            baselineRssMb: memory.baselineRssMb,
            peakRssMb: memory.peakRssMb,
            rssDeltaMb: memory.rssDeltaMb,
            peakMaxProcessRssMb: memory.peakMaxProcessRssMb,
            peakProcessCount: memory.peakProcessCount,
            peakHeapUsedMb: memory.peakHeapUsedMb,
            peakDebugRssMb: memory.peakDebugRssMb,
          }
        : undefined
      const summary = summarizeHmrTimingSamples(timings)
      const pluginProcessSummary = toPluginProcessSummary(timings)
      cases.push({
        caseName: item.caseName,
        project,
        label: projectReport.label || item.caseName,
        platform: resolveHmrPlatform(entry),
        ...(entry ? { framework: entry.framework, builder: entry.builder, tailwindcss: entry.tailwindcss, sourceShape: entry.sourceShape } : {}),
        reportFile: path.relative(options.repositoryRoot, item.reportFile).split(path.sep).join('/'),
        initialReadyMs: projectReport.initialReadyMs,
        totalMs: projectReport.totalMs,
        summary,
        pluginProcessSummary,
        ...(projectMemory
          ? { memory: projectMemory }
          : {}),
        notes: createProjectNotes({ summary, pluginProcessSummary, memory: projectMemory }),
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
    pluginProcessSummary: toPluginProcessSummary(allTimings),
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

export function renderHmrFullRunMarkdown(report: HmrFullRunReport) {
  const lines = [
    '# HMR 全量运行报告',
    '',
    `- generated_at: ${report.generatedAt}`,
    `- repository_root: \`${report.repositoryRoot}\``,
    `- targets: ${report.targetNames.join(', ') || '-'}`,
    `- cases: ${report.projectCount}`,
    `- timing samples: ${report.timingCount}`,
    `- e2e HMR: avg=${formatMs(report.summary.avgMs)}, p50=${formatMs(report.summary.p50Ms)}, p95=${formatMs(report.summary.p95Ms)}, max=${formatMs(report.summary.maxMs)}`,
    `- plugin process: samples=${report.pluginProcessSummary.count}, avg=${formatMs(report.pluginProcessSummary.avgMs)}, p95=${formatMs(report.pluginProcessSummary.p95Ms)}, max=${formatMs(report.pluginProcessSummary.maxMs)}`,
    `- memory: projects=${report.memory.projectCount}, RSS peak=${formatMb(report.memory.peakRssMb)}, RSS delta=${formatMb(report.memory.maxRssDeltaMb)}, plugin heap peak=${formatMb(report.memory.peakHeapUsedMb)}, debug samples=${report.memory.debugSampleCount}`,
    '',
    '## Case 汇总',
    '',
    '| case | platform | e2e avg | e2e p95 | e2e max | plugin samples | plugin max | RSS peak | RSS delta | heap peak | notes |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ]

  for (const item of report.cases) {
    lines.push([
      item.project,
      item.platform,
      formatMs(item.summary.avgMs),
      formatMs(item.summary.p95Ms),
      formatMs(item.summary.maxMs),
      String(item.pluginProcessSummary.count),
      formatMs(item.pluginProcessSummary.maxMs),
      formatMb(item.memory?.peakRssMb ?? 0),
      formatMb(item.memory?.rssDeltaMb ?? 0),
      formatMb(item.memory?.peakHeapUsedMb ?? 0),
      item.notes.join('<br>') || '-',
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  }

  lines.push('', '## 最慢样本', '')
  const slowest = report.cases
    .flatMap(item => item.timings.map(timing => ({ item, timing })))
    .sort((a, b) => b.timing.hotUpdateEffectiveMs - a.timing.hotUpdateEffectiveMs)
    .slice(0, 20)
  if (slowest.length === 0) {
    lines.push('- no samples')
  }
  else {
    lines.push('| case | platform | surface | e2e HMR | plugin process | rollback | source |')
    lines.push('| --- | --- | --- | ---: | ---: | ---: | --- |')
    for (const { item, timing } of slowest) {
      lines.push([
        item.project,
        item.platform,
        timing.surface,
        formatMs(timing.hotUpdateEffectiveMs),
        timing.hotUpdatePluginProcessMs == null ? '-' : formatMs(timing.hotUpdatePluginProcessMs),
        timing.rollbackEffectiveMs == null ? '-' : formatMs(timing.rollbackEffectiveMs),
        timing.sourceFile ?? '-',
      ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
    }
  }

  lines.push(
    '',
    '## 口径说明',
    '',
    '- e2e HMR 是从写入源文件到测试断言观察到产物/浏览器/运行时生效的端到端耗时。',
    '- plugin process 只统计 `[weapp-tailwindcss:hmr]` timing 日志里的插件处理耗时；缺失时说明该链路未输出插件 timing，不代表插件耗时为 0。',
    '- plugin heap peak 依赖 `WEAPP_TW_HMR_MEMORY_DEBUG=1` 和插件日志里的 `memoryDebug.process.heapUsedMb`。',
    '',
  )
  return `${lines.join('\n')}\n`
}

export async function writeHmrFullRunMarkdown(options: {
  report: HmrFullRunReport
  outputFile: string
}) {
  await writeFile(options.outputFile, renderHmrFullRunMarkdown(options.report), 'utf8')
}
