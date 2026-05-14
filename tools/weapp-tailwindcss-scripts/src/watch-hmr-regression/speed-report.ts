import type { WatchReport } from './types'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export interface HmrSpeedSample {
  caseName: string
  project: string
  surface: string
  sourceFile: string
  hotUpdateMs: number
  rollbackMs?: number
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
  samples.push({
    ...sample,
    hotUpdateMs,
  })
}

function percentile(sortedValues: number[], ratio: number) {
  if (sortedValues.length === 0) {
    return 0
  }
  const index = Math.ceil(sortedValues.length * ratio) - 1
  return sortedValues[Math.min(Math.max(index, 0), sortedValues.length - 1)]
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
  return {
    count: values.length,
    avgMs: Math.round(sum / values.length),
    minMs: values[0],
    maxMs: values.at(-1)!,
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
  for (const oneCase of report.cases ?? []) {
    const caseName = oneCase.name || oneCase.label || oneCase.project || 'unknown'
    const project = oneCase.project || 'unknown'
    const initialReadyMs = toFiniteNumber(oneCase.initialReadyMs)
    pushSpeedSample(samples, {
      caseName,
      project,
      surface: 'case-template-preferred',
      sourceFile: '',
      hotUpdateMs: oneCase.hotUpdateEffectiveMs,
      rollbackMs: toFiniteNumber(oneCase.rollbackEffectiveMs),
      initialReadyMs,
      reportFile,
    })

    for (const mutation of oneCase.mutationMetrics ?? []) {
      const sourceFile = mutation.sourceFile || ''
      if ('rounds' in mutation && Array.isArray(mutation.rounds)) {
        for (const round of mutation.rounds) {
          pushSpeedSample(samples, {
            caseName,
            project,
            surface: `${mutation.mutationKind}:${round.roundName}`,
            sourceFile,
            hotUpdateMs: round.hotUpdateEffectiveMs,
            rollbackMs: toFiniteNumber(round.rollbackEffectiveMs),
            initialReadyMs,
            reportFile,
          })
        }
      }
      else {
        pushSpeedSample(samples, {
          caseName,
          project,
          surface: mutation.mutationKind,
          sourceFile,
          hotUpdateMs: mutation.hotUpdateEffectiveMs,
          rollbackMs: toFiniteNumber(mutation.rollbackEffectiveMs),
          initialReadyMs,
          reportFile,
        })
      }

      if ('addedClassHmr' in mutation && mutation.addedClassHmr) {
        pushSpeedSample(samples, {
          caseName,
          project,
          surface: `${mutation.mutationKind}:added-class`,
          sourceFile,
          hotUpdateMs: mutation.addedClassHmr.hotUpdateEffectiveMs,
          rollbackMs: toFiniteNumber(mutation.addedClassHmr.rollbackEffectiveMs),
          initialReadyMs,
          reportFile,
        })
      }
      if ('sameClassLiteralHmr' in mutation && mutation.sameClassLiteralHmr) {
        pushSpeedSample(samples, {
          caseName,
          project,
          surface: `${mutation.mutationKind}:same-class-literal`,
          sourceFile,
          hotUpdateMs: mutation.sameClassLiteralHmr.hotUpdateEffectiveMs,
          rollbackMs: toFiniteNumber(mutation.sameClassLiteralHmr.rollbackEffectiveMs),
          initialReadyMs,
          reportFile,
        })
      }
      if ('commentCarrierHmr' in mutation && mutation.commentCarrierHmr) {
        pushSpeedSample(samples, {
          caseName,
          project,
          surface: `${mutation.mutationKind}:comment-carrier`,
          sourceFile,
          hotUpdateMs: mutation.commentCarrierHmr.hotUpdateEffectiveMs,
          rollbackMs: toFiniteNumber(mutation.commentCarrierHmr.rollbackEffectiveMs),
          initialReadyMs,
          reportFile,
        })
      }
    }

    for (const subPackage of oneCase.subPackageMutationMetrics ?? []) {
      for (const [kind, mutation] of [
        ['template', subPackage.template],
        ['style', subPackage.style],
      ] as const) {
        if (!mutation) {
          continue
        }
        pushSpeedSample(samples, {
          caseName,
          project,
          surface: `subpackage:${subPackage.root}:${kind}`,
          sourceFile: mutation.sourceFile,
          hotUpdateMs: mutation.hotUpdateEffectiveMs,
          rollbackMs: toFiniteNumber(mutation.rollbackEffectiveMs),
          initialReadyMs,
          reportFile,
        })
      }
    }
  }
  return samples
}

export function buildSpeedReport(entries: Array<{ file: string, report: WatchReport }>, generatedAt = new Date().toISOString()): HmrSpeedReport {
  const samples = entries.flatMap(entry =>
    collectSpeedSamplesFromReport(entry.report, path.basename(entry.file)))
  const initialReadySamples = samples
    .map(item => item.initialReadyMs)
    .filter(Number.isFinite)
    .map(value => ({ hotUpdateMs: value }))

  return {
    generatedAt,
    reportCount: entries.length,
    sampleCount: samples.length,
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
      lines.push(`- ${sample.hotUpdateMs}ms | ${sample.project} | ${sample.surface} | ${sample.sourceFile || 'n/a'} | ${sample.reportFile}`)
    }
  }

  lines.push('')
  lines.push('## 实现依据')
  lines.push('- Tailwind v3/v4 官方 Vite/Webpack 插件在 watch 生命周期复用 compiler、scanner 与 candidates 集合。')
  lines.push('- 本仓库 HMR 回归沿用同一思路：启动一次开发 watcher，在同一 session 内连续验证 template/script/style/content/subpackage 变更，并记录增量输出与实际生效耗时。')
  return `${lines.join('\n')}\n`
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
