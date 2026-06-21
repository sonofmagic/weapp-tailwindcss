import type { OutputWaitDiagnostics, WatchReport } from './types'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { summarizeHmrDurations } from './hmr-durations'
import { DEFAULT_HOT_UPDATE_BUDGET_MS, DEFAULT_PLUGIN_PROCESS_BUDGET_MS, PREFERRED_HOT_UPDATE_TARGET_MS } from './types'

export interface HmrSpeedSample {
  caseName: string
  project: string
  surface: string
  sourceFile: string
  hotUpdateMs: number
  pluginProcessMs?: number
  rollbackMs?: number
  outputDiagnostics?: OutputWaitDiagnostics
  initialReadyMs?: number
  reportFile: string
}

export interface HmrSpeedSummary {
  count: number
  avgMs: number
  minMs: number
  maxMs: number
  p50Ms: number
  p95Ms: number
}

export interface HmrSpeedReport {
  generatedAt: string
  reportCount: number
  sampleCount: number
  maxHotUpdateBudgetMs: number
  maxPluginProcessBudgetMs: number
  preferredHotUpdateTargetMs: number
  withinBudgetCount: number
  withinPluginProcessBudgetCount: number
  withinPreferredTargetCount: number
  summary: HmrSpeedSummary
  initialReady: HmrSpeedSummary
  byProject: Record<string, HmrSpeedSummary>
  bySurface: Record<string, HmrSpeedSummary>
  slowest: HmrSpeedSample[]
  sourceReports: string[]
}

function toFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function pushSpeedSample(samples: HmrSpeedSample[], sample: Omit<HmrSpeedSample, 'hotUpdateMs'> & { hotUpdateMs: unknown }) {
  const hotUpdateMs = toFiniteNumber(sample.hotUpdateMs)
  if (hotUpdateMs == null) {
    return
  }
  const next: HmrSpeedSample = {
    caseName: sample.caseName,
    project: sample.project,
    surface: sample.surface,
    sourceFile: sample.sourceFile,
    hotUpdateMs,
    reportFile: sample.reportFile,
  }
  if (typeof sample.pluginProcessMs === 'number') {
    next.pluginProcessMs = sample.pluginProcessMs
  }
  if (typeof sample.rollbackMs === 'number') {
    next.rollbackMs = sample.rollbackMs
  }
  if (sample.outputDiagnostics) {
    next.outputDiagnostics = sample.outputDiagnostics
  }
  if (typeof sample.initialReadyMs === 'number') {
    next.initialReadyMs = sample.initialReadyMs
  }
  samples.push(next)
}

function percentile(sortedValues: number[], ratio: number) {
  if (sortedValues.length === 0) {
    return 0
  }
  const index = Math.ceil(sortedValues.length * ratio) - 1
  return sortedValues[Math.min(Math.max(index, 0), sortedValues.length - 1)] ?? 0
}

export function summarizeSpeedSamples(samples: Array<Pick<HmrSpeedSample, 'hotUpdateMs'>>): HmrSpeedSummary {
  const values = samples
    .map(item => item.hotUpdateMs)
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
  const minMs = values[0] ?? 0
  const maxMs = values.at(-1) ?? 0
  return {
    count: values.length,
    avgMs: Math.round(sum / values.length),
    minMs,
    maxMs,
    p50Ms: percentile(values, 0.5),
    p95Ms: percentile(values, 0.95),
  }
}

export function groupSpeedSamples(samples: HmrSpeedSample[], key: 'project' | 'surface') {
  const grouped = new Map<string, HmrSpeedSample[]>()
  for (const sample of samples) {
    const groupKey = sample[key] || 'unknown'
    const list = grouped.get(groupKey) ?? []
    list.push(sample)
    grouped.set(groupKey, list)
  }

  return Object.fromEntries(
    [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, groupSamples]) => [name, summarizeSpeedSamples(groupSamples)]),
  )
}

export function collectSpeedSamplesFromReport(report: WatchReport, reportFile: string): HmrSpeedSample[] {
  const samples: HmrSpeedSample[] = []
  const hmrDurations = report.hmrDurations ?? summarizeHmrDurations(report.cases ?? [])
  for (const projectReport of Object.values(hmrDurations.byProject)) {
    const caseName = projectReport.name || projectReport.label || projectReport.project || 'unknown'
    const project = projectReport.project || 'unknown'
    const initialReadyMs = toFiniteNumber(projectReport.initialReadyMs)
    for (const timing of projectReport.timings ?? []) {
      const sample: Omit<HmrSpeedSample, 'hotUpdateMs'> & { hotUpdateMs: unknown } = {
        caseName,
        project,
        surface: timing.surface,
        sourceFile: timing.sourceFile || '',
        hotUpdateMs: timing.hotUpdateEffectiveMs,
        reportFile,
      }
      const pluginProcessMs = toFiniteNumber(timing.hotUpdatePluginProcessMs)
      const rollbackMs = toFiniteNumber(timing.rollbackEffectiveMs)
      if (typeof pluginProcessMs === 'number') {
        sample.pluginProcessMs = pluginProcessMs
      }
      if (typeof rollbackMs === 'number') {
        sample.rollbackMs = rollbackMs
      }
      if (timing.hotUpdateOutputDiagnostics) {
        sample.outputDiagnostics = timing.hotUpdateOutputDiagnostics
      }
      if (typeof initialReadyMs === 'number') {
        sample.initialReadyMs = initialReadyMs
      }
      pushSpeedSample(samples, sample)
    }
  }
  return samples
}

export function buildSpeedReport(entries: Array<{ file: string, report: WatchReport }>, generatedAt = new Date().toISOString()): HmrSpeedReport {
  const samples = entries.flatMap(entry =>
    collectSpeedSamplesFromReport(entry.report, path.basename(entry.file)))
  const initialReadySamples = samples
    .map(item => item.initialReadyMs)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    .map(value => ({ hotUpdateMs: value }))

  return {
    generatedAt,
    reportCount: entries.length,
    sampleCount: samples.length,
    maxHotUpdateBudgetMs: DEFAULT_HOT_UPDATE_BUDGET_MS,
    maxPluginProcessBudgetMs: DEFAULT_PLUGIN_PROCESS_BUDGET_MS,
    preferredHotUpdateTargetMs: PREFERRED_HOT_UPDATE_TARGET_MS,
    withinBudgetCount: samples.filter(item => item.hotUpdateMs <= DEFAULT_HOT_UPDATE_BUDGET_MS).length,
    withinPluginProcessBudgetCount: samples.filter(item => (item.pluginProcessMs ?? 0) <= DEFAULT_PLUGIN_PROCESS_BUDGET_MS).length,
    withinPreferredTargetCount: samples.filter(item => item.hotUpdateMs <= PREFERRED_HOT_UPDATE_TARGET_MS).length,
    summary: summarizeSpeedSamples(samples),
    initialReady: summarizeSpeedSamples(initialReadySamples),
    byProject: groupSpeedSamples(samples, 'project'),
    bySurface: groupSpeedSamples(samples, 'surface'),
    slowest: [...samples].sort((a, b) => b.hotUpdateMs - a.hotUpdateMs).slice(0, 10),
    sourceReports: entries.map(entry => path.basename(entry.file)),
  }
}

export function renderSpeedReportMarkdown(report: HmrSpeedReport) {
  const lines = [
    '# e2e-watch HMR 速度报告',
    '',
    `- generated_at: ${report.generatedAt}`,
    `- source reports: ${report.reportCount}`,
    `- samples: ${report.sampleCount}`,
    `- budget: <=${report.maxHotUpdateBudgetMs}ms`,
    `- plugin process budget: <=${report.maxPluginProcessBudgetMs}ms (${report.withinPluginProcessBudgetCount}/${report.sampleCount} samples)`,
    `- preferred target: <=${report.preferredHotUpdateTargetMs}ms (${report.withinPreferredTargetCount}/${report.sampleCount} samples)`,
    `- within budget: ${report.withinBudgetCount}/${report.sampleCount} samples`,
    `- hot update: avg=${report.summary.avgMs}ms, p50=${report.summary.p50Ms}ms, p95=${report.summary.p95Ms}ms, max=${report.summary.maxMs}ms`,
    `- initial ready: avg=${report.initialReady.avgMs}ms, p50=${report.initialReady.p50Ms}ms, p95=${report.initialReady.p95Ms}ms, max=${report.initialReady.maxMs}ms`,
    '',
    '## 按项目',
    ...renderSummaryTable(report.byProject),
    '',
    '## 按 HMR 场景',
    ...renderSummaryTable(report.bySurface),
    '',
    '## 最慢样本',
  ]

  if (report.slowest.length === 0) {
    lines.push('- no samples')
  }
  else {
    for (const sample of report.slowest) {
      lines.push(`- ${sample.hotUpdateMs}ms hot-update, ${sample.pluginProcessMs ?? 0}ms plugin${formatOutputDiagnostics(sample.outputDiagnostics)} | ${sample.project} | ${sample.surface} | ${sample.sourceFile || 'n/a'} | ${sample.reportFile}`)
    }
  }

  lines.push('')
  lines.push('## 实现依据')
  lines.push('- Tailwind v4/v4 官方 Vite/Webpack 插件在 watch 生命周期复用 compiler、scanner 与 candidates 集合。')
  lines.push('- 本仓库 HMR 回归沿用同一思路：启动一次开发 watcher，在同一 session 内连续验证 template/script/style/content/subpackage 变更，并记录增量输出与实际生效耗时。')
  return `${lines.join('\n')}\n`
}

function formatOutputDiagnostics(diagnostics: OutputWaitDiagnostics | undefined) {
  if (!diagnostics) {
    return ''
  }
  const updated = diagnostics.updatedFiles.length
  const missing = diagnostics.missingExactFiles.length
  return `, output=${diagnostics.trigger}, resolved=${diagnostics.resolvedFileCount}/${diagnostics.fileCount}, updated=${updated}, missing=${missing}`
}

function renderSummaryTable(grouped: Record<string, HmrSpeedSummary>) {
  const lines = [
    '| name | count | avg | p50 | p95 | min | max |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]
  for (const [name, summary] of Object.entries(grouped)) {
    lines.push(`| ${name} | ${summary.count} | ${summary.avgMs}ms | ${summary.p50Ms}ms | ${summary.p95Ms}ms | ${summary.minMs}ms | ${summary.maxMs}ms |`)
  }
  return lines
}

export async function readWatchReports(rootDir: string) {
  const files = (await fs.readdir(rootDir).catch(() => []))
    .filter(name => name.endsWith('.json') && name !== 'hmr-speed-report.json')
    .map(name => path.join(rootDir, name))
    .sort()
  const reports: Array<{ file: string, report: WatchReport }> = []
  for (const file of files) {
    try {
      reports.push({
        file,
        report: JSON.parse(await fs.readFile(file, 'utf8')) as WatchReport,
      })
    }
    catch {
    }
  }
  return reports
}
