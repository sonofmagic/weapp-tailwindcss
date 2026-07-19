import { spawnSync } from 'node:child_process'
import process from 'node:process'

const WHITESPACE_RE = /\s+/

function median(values) {
  if (values.length === 0) {
    return 0
  }
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function listDescendantRowsOnPosix(rootPid) {
  const result = spawnSync('ps', ['-Ao', 'pid=,ppid=,rss='], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') {
    return []
  }

  const rows = result.stdout.split(/\r?\n/).flatMap((line) => {
    const [pidText, ppidText, rssText] = line.trim().split(WHITESPACE_RE)
    const pid = Number(pidText)
    const ppid = Number(ppidText)
    const rssKb = Number(rssText)
    return Number.isInteger(pid) && Number.isInteger(ppid) && Number.isFinite(rssKb)
      ? [{ pid, ppid, rssKb }]
      : []
  })
  const childrenByParent = new Map()
  const byPid = new Map(rows.map(row => [row.pid, row]))
  for (const row of rows) {
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
  return {
    at: Date.now(),
    rssMb: rows.reduce((total, row) => total + row.rssKb, 0) / 1024,
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
    '$total = 0',
    'foreach ($process in $tracked.Values) { $workingSet = if ($null -eq $process.WorkingSetSize) { 0 } else { [double]$process.WorkingSetSize }; $total += $workingSet }',
    '[Console]::Out.WriteLine((@{ rssMb = $total / 1MB; processCount = [int]$tracked.Count } | ConvertTo-Json -Compress))',
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
    return { at: Date.now(), ...JSON.parse(result.stdout.trim()) }
  }
  catch {
    return undefined
  }
}

export function sampleProcessTree(rootPid) {
  if (!rootPid) {
    return undefined
  }
  return process.platform === 'win32' ? sampleWindows(rootPid) : samplePosix(rootPid)
}

export function summarizeProcessMemory(samples) {
  const active = samples.filter(sample => sample.processCount > 0 && sample.rssMb > 0)
  if (active.length === 0) {
    return {
      count: 0,
      baselineRssMb: 0,
      peakRssMb: 0,
      steadyRssMb: 0,
      steadyGrowthPct: 0,
    }
  }
  const baselineRssMb = active[0].rssMb
  const steadyCount = Math.max(1, Math.ceil(active.length * 0.2))
  const steadyRssMb = median(active.slice(-steadyCount).map(sample => sample.rssMb))
  return {
    count: active.length,
    baselineRssMb,
    peakRssMb: Math.max(...active.map(sample => sample.rssMb)),
    steadyRssMb,
    steadyGrowthPct: baselineRssMb === 0 ? 0 : ((steadyRssMb - baselineRssMb) / baselineRssMb) * 100,
  }
}

export function createProcessMemorySampler(rootPid, intervalMs = 250) {
  const samples = []
  const record = () => {
    const sample = sampleProcessTree(rootPid)
    if (sample) {
      samples.push(sample)
    }
  }
  record()
  const timer = setInterval(record, intervalMs)
  timer.unref?.()
  let stopped = false
  return {
    stop() {
      if (!stopped) {
        stopped = true
        clearInterval(timer)
        record()
      }
      return summarizeProcessMemory(samples)
    },
  }
}
