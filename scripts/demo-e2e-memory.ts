import { spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const WHITESPACE_RE = /\s+/

export interface DemoE2eMemorySample {
  at: number
  rssMb: number
  maxProcessRssMb: number
  processCount: number
}

export interface DemoE2eMemorySummary {
  count: number
  baselineRssMb: number
  peakRssMb: number
  rssDeltaMb: number
  peakMaxProcessRssMb: number
  peakProcessCount: number
  firstAt?: number
  lastAt?: number
  durationMs: number
}

export interface DemoE2eMemoryStepReport {
  name: string
  command: string[]
  exitCode: number
  startedAt: string
  endedAt: string
  local: boolean
  summary: DemoE2eMemorySummary
  samples: DemoE2eMemorySample[]
}

export interface DemoE2eMemoryReport {
  generatedAt: string
  repositoryRoot: string
  includeLocal: boolean
  exitCode: number
  summary: DemoE2eMemorySummary & {
    stepCount: number
    failedStepCount: number
  }
  steps: DemoE2eMemoryStepReport[]
}

interface ProcessRow {
  pid: number
  ppid: number
  rssKb: number
}

interface WriteReportResult {
  jsonFile: string
  markdownFile: string
}

function listDescendantRowsOnPosix(rootPid: number): ProcessRow[] {
  const result = spawnSync('ps', ['-Ao', 'pid=,ppid=,rss='], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') {
    return []
  }

  const rows: ProcessRow[] = []
  for (const line of result.stdout.split(/\r?\n/)) {
    const normalized = line.trim()
    if (!normalized) {
      continue
    }
    const [pidText, ppidText, rssText] = normalized.split(WHITESPACE_RE)
    const pid = Number(pidText)
    const ppid = Number(ppidText)
    const rssKb = Number(rssText)
    if (Number.isInteger(pid) && Number.isInteger(ppid) && Number.isFinite(rssKb)) {
      rows.push({ pid, ppid, rssKb })
    }
  }

  const childrenByParent = new Map<number, ProcessRow[]>()
  const byPid = new Map<number, ProcessRow>()
  for (const row of rows) {
    byPid.set(row.pid, row)
    const children = childrenByParent.get(row.ppid) ?? []
    children.push(row)
    childrenByParent.set(row.ppid, children)
  }

  const tracked = new Map<number, ProcessRow>()
  const root = byPid.get(rootPid)
  if (root) {
    tracked.set(root.pid, root)
  }
  const stack = [...(childrenByParent.get(rootPid) ?? [])]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || tracked.has(current.pid)) {
      continue
    }
    tracked.set(current.pid, current)
    stack.push(...(childrenByParent.get(current.pid) ?? []))
  }
  return [...tracked.values()]
}

function samplePosix(rootPid: number): DemoE2eMemorySample | undefined {
  const rows = listDescendantRowsOnPosix(rootPid)
  if (rows.length === 0) {
    return undefined
  }
  const totalRssKb = rows.reduce((total, row) => total + row.rssKb, 0)
  const maxProcessRssKb = Math.max(...rows.map(row => row.rssKb))
  return {
    at: Date.now(),
    rssMb: Math.round(totalRssKb / 1024),
    maxProcessRssMb: Math.round(maxProcessRssKb / 1024),
    processCount: rows.length,
  }
}

function sampleWindows(rootPid: number): DemoE2eMemorySample | undefined {
  const script = [
    '$root = [int]$args[0]',
    '$processes = Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,WorkingSetSize',
    '$children = @{}',
    'foreach ($process in $processes) { $parent = [int]$process.ParentProcessId; if (-not $children.ContainsKey($parent)) { $children[$parent] = @() }; $children[$parent] += $process }',
    '$tracked = @{}',
    '$stack = New-Object System.Collections.ArrayList',
    '$rootProcess = $processes | Where-Object { [int]$_.ProcessId -eq $root } | Select-Object -First 1',
    'if ($null -ne $rootProcess) { $tracked[[int]$rootProcess.ProcessId] = $rootProcess }',
    'if ($children.ContainsKey($root)) { foreach ($child in $children[$root]) { [void]$stack.Add($child) } }',
    'while ($stack.Count -gt 0) { $current = $stack[$stack.Count - 1]; $stack.RemoveAt($stack.Count - 1); $pid = [int]$current.ProcessId; if ($tracked.ContainsKey($pid)) { continue }; $tracked[$pid] = $current; if ($children.ContainsKey($pid)) { foreach ($child in $children[$pid]) { [void]$stack.Add($child) } } }',
    '$total = 0; $max = 0',
    'foreach ($process in $tracked.Values) { $workingSet = if ($null -eq $process.WorkingSetSize) { 0 } else { [double]$process.WorkingSetSize }; $total += $workingSet; if ($workingSet -gt $max) { $max = $workingSet } }',
    '[Console]::Out.WriteLine((@{ rssMb = [int][Math]::Round($total / 1MB); maxProcessRssMb = [int][Math]::Round($max / 1MB); processCount = [int]$tracked.Count } | ConvertTo-Json -Compress))',
  ].join('; ')
  const result = spawnSync('powershell', ['-NoProfile', '-Command', script, String(rootPid)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    windowsHide: true,
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') {
    return undefined
  }
  try {
    const parsed = JSON.parse(result.stdout.trim()) as Partial<DemoE2eMemorySample>
    if (typeof parsed.rssMb !== 'number') {
      return undefined
    }
    return { at: Date.now(), ...parsed } as DemoE2eMemorySample
  }
  catch {
    return undefined
  }
}

export function sampleProcessTree(pid?: number): DemoE2eMemorySample | undefined {
  if (!pid) {
    return undefined
  }
  return process.platform === 'win32' ? sampleWindows(pid) : samplePosix(pid)
}

export function summarizeMemorySamples(samples: DemoE2eMemorySample[]): DemoE2eMemorySummary {
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
  const firstAt = samples[0]!.at
  const lastAt = samples[samples.length - 1]!.at
  const peakRssMb = Math.max(...samples.map(sample => sample.rssMb))
  return {
    count: samples.length,
    baselineRssMb: first.rssMb,
    peakRssMb,
    rssDeltaMb: Math.max(0, peakRssMb - first.rssMb),
    peakMaxProcessRssMb: Math.max(...samples.map(sample => sample.maxProcessRssMb)),
    peakProcessCount: Math.max(...samples.map(sample => sample.processCount)),
    firstAt,
    lastAt,
    durationMs: Math.max(0, lastAt - firstAt),
  }
}

function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60
  return minutes === 0 ? `${restSeconds}s` : `${minutes}m${String(restSeconds).padStart(2, '0')}s`
}

function commandText(command: string[]) {
  return command.map(part => part.includes(' ') ? JSON.stringify(part) : part).join(' ')
}

function buildOverallSummary(steps: DemoE2eMemoryStepReport[]): DemoE2eMemoryReport['summary'] {
  const samples = steps.flatMap(step => step.samples)
  const summary = summarizeMemorySamples(samples)
  return {
    ...summary,
    stepCount: steps.length,
    failedStepCount: steps.filter(step => step.exitCode !== 0).length,
  }
}

export function createDemoE2eMemoryReport(options: {
  repositoryRoot: string
  includeLocal: boolean
  exitCode: number
  generatedAt?: string
  steps: DemoE2eMemoryStepReport[]
}): DemoE2eMemoryReport {
  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    repositoryRoot: options.repositoryRoot,
    includeLocal: options.includeLocal,
    exitCode: options.exitCode,
    summary: buildOverallSummary(options.steps),
    steps: options.steps,
  }
}

export function renderDemoE2eMemoryMarkdown(report: DemoE2eMemoryReport) {
  const lines = [
    '# Demo E2E 内存占用报告',
    '',
    `- generated_at: ${report.generatedAt}`,
    `- repository_root: \`${report.repositoryRoot}\``,
    `- include_local: ${report.includeLocal}`,
    `- exit_code: ${report.exitCode}`,
    `- steps: ${report.summary.stepCount}`,
    `- failed_steps: ${report.summary.failedStepCount}`,
    `- samples: ${report.summary.count}`,
    `- RSS baseline: ${report.summary.baselineRssMb}MB`,
    `- RSS peak: ${report.summary.peakRssMb}MB`,
    `- RSS delta: ${report.summary.rssDeltaMb}MB`,
    `- max single process RSS: ${report.summary.peakMaxProcessRssMb}MB`,
    `- peak process count: ${report.summary.peakProcessCount}`,
    `- duration: ${formatDuration(report.summary.durationMs)}`,
    '',
    '## 分阶段汇总',
    '',
    '| step | exit | samples | baseline RSS | peak RSS | RSS delta | max process RSS | peak processes | duration | command |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ]

  for (const step of report.steps) {
    lines.push([
      step.local ? `${step.name} (local)` : step.name,
      String(step.exitCode),
      String(step.summary.count),
      `${step.summary.baselineRssMb}MB`,
      `${step.summary.peakRssMb}MB`,
      `${step.summary.rssDeltaMb}MB`,
      `${step.summary.peakMaxProcessRssMb}MB`,
      String(step.summary.peakProcessCount),
      formatDuration(step.summary.durationMs),
      `\`${commandText(step.command)}\``,
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  }

  lines.push('')
  return lines.join('\n')
}

export async function writeDemoE2eMemoryReport(options: {
  report: DemoE2eMemoryReport
  outDir?: string
}): Promise<WriteReportResult> {
  const outDir = path.resolve(options.outDir ?? 'e2e/benchmark/demo-e2e-memory')
  await mkdir(outDir, { recursive: true })
  const jsonFile = path.join(outDir, 'demo-e2e-memory-report.json')
  const markdownFile = path.join(outDir, 'demo-e2e-memory-report.md')
  await writeFile(jsonFile, `${JSON.stringify(options.report, null, 2)}\n`, 'utf8')
  await writeFile(markdownFile, renderDemoE2eMemoryMarkdown(options.report), 'utf8')
  return { jsonFile, markdownFile }
}
