#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const WHITESPACE_RE = /\s+/

function parseArgs(argv) {
  const args = argv[0] === '--' ? argv.slice(1) : argv
  const options = {
    label: 'ci-command',
    outDir: 'e2e/benchmark/ci-memory',
    maxRssMb: Number(process.env.CI_MEMORY_MAX_RSS_MB || 0),
    maxRssDeltaMb: Number(process.env.CI_MEMORY_MAX_RSS_DELTA_MB || 0),
  }
  const command = []
  for (let index = 0; index < args.length; index += 1) {
    const item = args[index]
    if (item === '--') {
      command.push(...args.slice(index + 1))
      break
    }
    if (item === '--label') {
      options.label = args[++index] ?? options.label
      continue
    }
    if (item === '--out-dir') {
      options.outDir = args[++index] ?? options.outDir
      continue
    }
    if (item === '--max-rss-mb') {
      options.maxRssMb = Number(args[++index] ?? 0)
      continue
    }
    if (item === '--max-rss-delta-mb') {
      options.maxRssDeltaMb = Number(args[++index] ?? 0)
      continue
    }
    command.push(item)
  }
  return { options, command }
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

function listDescendantRowsOnPosix(rootPid) {
  const result = spawnSync('ps', ['-Ao', 'pid=,ppid=,rss='], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') {
    return []
  }

  const rows = []
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

  const childrenByParent = new Map()
  const byPid = new Map()
  for (const row of rows) {
    byPid.set(row.pid, row)
    const children = childrenByParent.get(row.ppid) ?? []
    children.push(row)
    childrenByParent.set(row.ppid, children)
  }

  const tracked = new Map()
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

function samplePosix(rootPid) {
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

function sampleWindows(rootPid) {
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
    const parsed = JSON.parse(result.stdout.trim())
    if (typeof parsed.rssMb !== 'number') {
      return undefined
    }
    return { at: Date.now(), ...parsed }
  }
  catch {
    return undefined
  }
}

function sampleProcessTree(pid) {
  if (!pid) {
    return undefined
  }
  return process.platform === 'win32' ? sampleWindows(pid) : samplePosix(pid)
}

function summarize(samples) {
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
  const first = samples.find(sample => sample.processCount > 1 && sample.rssMb >= 128) ?? samples[0]
  const firstAt = samples[0].at
  const lastAt = samples.at(-1).at
  const peakRssMb = Math.max(...samples.map(sample => sample.rssMb))
  return {
    count: samples.length,
    baselineRssMb: first.rssMb,
    peakRssMb,
    rssDeltaMb: Math.max(0, peakRssMb - first.rssMb),
    peakMaxProcessRssMb: Math.max(...samples.map(sample => sample.maxProcessRssMb)),
    peakProcessCount: Math.max(...samples.map(sample => sample.processCount)),
    durationMs: Math.max(0, lastAt - firstAt),
  }
}

function renderMarkdown(report) {
  return [
    `# CI 内存报告：${report.label}`,
    '',
    `- generated_at: ${report.generatedAt}`,
    `- command: \`${report.command.join(' ')}\``,
    `- exit_code: ${report.exitCode}`,
    `- samples: ${report.summary.count}`,
    `- RSS baseline: ${report.summary.baselineRssMb}MB`,
    `- RSS peak: ${report.summary.peakRssMb}MB`,
    `- RSS delta: ${report.summary.rssDeltaMb}MB`,
    `- max single process RSS: ${report.summary.peakMaxProcessRssMb}MB`,
    `- peak process count: ${report.summary.peakProcessCount}`,
    `- duration: ${Math.round(report.summary.durationMs / 1000)}s`,
    '',
  ].join('\n')
}

async function writeReports(options, report) {
  const outDir = path.resolve(options.outDir)
  await mkdir(outDir, { recursive: true })
  const base = `${formatTimestamp()}-${options.label.replace(/[^\w.-]+/g, '-')}`
  const jsonFile = path.join(outDir, `${base}.json`)
  const mdFile = path.join(outDir, `${base}.md`)
  await writeFile(jsonFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeFile(mdFile, renderMarkdown(report), 'utf8')
  process.stdout.write(`[ci-memory] report written: ${path.relative(process.cwd(), mdFile)}\n`)
}

async function main() {
  const { options, command } = parseArgs(process.argv.slice(2))
  if (command.length === 0) {
    throw new Error('missing command after --')
  }

  const samples = []
  const startedAt = Date.now()
  const child = spawn(command[0], command.slice(1), {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  const record = () => {
    const sample = sampleProcessTree(child.pid)
    if (sample) {
      samples.push(sample)
    }
  }
  const timer = setInterval(record, 1000)
  timer.unref?.()
  record()

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', code => resolve(code ?? 1))
  })
  clearInterval(timer)
  record()

  const summary = summarize(samples)
  const report = {
    generatedAt: new Date(startedAt).toISOString(),
    label: options.label,
    command,
    exitCode,
    summary,
    samples,
  }
  await writeReports(options, report)

  if (exitCode !== 0) {
    process.exitCode = exitCode
    return
  }
  if (options.maxRssMb > 0 && summary.peakRssMb > options.maxRssMb) {
    throw new Error(`[ci-memory] ${options.label} RSS peak exceeded budget: ${summary.peakRssMb}MB > ${options.maxRssMb}MB`)
  }
  if (options.maxRssDeltaMb > 0 && summary.rssDeltaMb > options.maxRssDeltaMb) {
    throw new Error(`[ci-memory] ${options.label} RSS delta exceeded budget: ${summary.rssDeltaMb}MB > ${options.maxRssDeltaMb}MB`)
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
