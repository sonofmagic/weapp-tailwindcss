import { spawn, spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const appRoot = path.resolve(import.meta.dirname, '..')
const repositoryRoot = path.resolve(appRoot, '../..')
const defaultOutDir = path.resolve(repositoryRoot, 'e2e/benchmark/official-tailwindcss-memory')
const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const targetFile = path.resolve(appRoot, 'src/pages/index.vue')
const label = 'official-tailwindcss-vite-dev-hmr'

function parseArgs(argv) {
  const options = {
    outDir: defaultOutDir,
    port: Number(process.env.OFFICIAL_TW_MEMORY_PORT || 5185),
    host: process.env.OFFICIAL_TW_MEMORY_HOST || '127.0.0.1',
    sampleMs: Number(process.env.OFFICIAL_TW_MEMORY_SAMPLE_MS || 100),
    idleMs: Number(process.env.OFFICIAL_TW_MEMORY_IDLE_MS || 2000),
    updateMs: Number(process.env.OFFICIAL_TW_MEMORY_UPDATE_MS || 2500),
  }

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]
    if (item === '--') {
      continue
    }
    if (item === '--out-dir') {
      options.outDir = path.resolve(repositoryRoot, argv[++index] ?? options.outDir)
      continue
    }
    if (item === '--port') {
      options.port = Number(argv[++index] ?? options.port)
      continue
    }
    if (item === '--host') {
      options.host = argv[++index] ?? options.host
      continue
    }
    if (item === '--sample-ms') {
      options.sampleMs = Number(argv[++index] ?? options.sampleMs)
      continue
    }
  }
  return options
}

function formatTimestamp(date) {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
    const [pidText, ppidText, rssText] = line.trim().split(/\s+/)
    const pid = Number(pidText)
    const ppid = Number(ppidText)
    const rssKb = Number(rssText)
    if (Number.isInteger(pid) && Number.isInteger(ppid) && Number.isFinite(rssKb)) {
      rows.push({ pid, ppid, rssKb })
    }
  }

  const byPid = new Map()
  const childrenByParent = new Map()
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

function listDescendantRowsOnWindows(rootPid) {
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
    '$rows = @()',
    'foreach ($process in $tracked.Values) { $rows += @{ pid = [int]$process.ProcessId; rssKb = [int][Math]::Round(([double]$process.WorkingSetSize) / 1KB) } }',
    '[Console]::Out.WriteLine(($rows | ConvertTo-Json -Compress))',
  ].join('; ')
  const result = spawnSync('powershell', ['-NoProfile', '-Command', script, String(rootPid)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    windowsHide: true,
  })
  if (result.status !== 0 || typeof result.stdout !== 'string') {
    return []
  }
  try {
    const parsed = JSON.parse(result.stdout.trim())
    return (Array.isArray(parsed) ? parsed : [parsed])
      .filter(row => Number.isFinite(row.rssKb))
      .map(row => ({ pid: Number(row.pid), rssKb: Number(row.rssKb) }))
  }
  catch {
    return []
  }
}

function sampleProcessTree(rootPid, phase) {
  const rows = process.platform === 'win32'
    ? listDescendantRowsOnWindows(rootPid)
    : listDescendantRowsOnPosix(rootPid)
  if (rows.length === 0) {
    return undefined
  }
  const rssMb = Math.round(rows.reduce((total, row) => total + row.rssKb, 0) / 1024)
  const maxProcessRssMb = Math.round(Math.max(...rows.map(row => row.rssKb)) / 1024)
  return {
    at: Date.now(),
    phase,
    rssMb,
    maxProcessRssMb,
    processCount: rows.length,
  }
}

async function waitForServer(child, logLines, options) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`vite exited before ready: ${child.exitCode}`)
    }
    if (logLines.some(line => line.includes('Local:') || line.includes(`localhost:${options.port}`) || line.includes(`${options.host}:${options.port}`))) {
      return
    }
    await sleep(100)
  }
  throw new Error('timed out waiting for vite dev server')
}

function summarize(samples) {
  const byPhase = new Map()
  for (const sample of samples) {
    const current = byPhase.get(sample.phase) ?? {
      count: 0,
      peakRssMb: 0,
      peakMaxProcessRssMb: 0,
      peakProcessCount: 0,
    }
    current.count += 1
    current.peakRssMb = Math.max(current.peakRssMb, sample.rssMb)
    current.peakMaxProcessRssMb = Math.max(current.peakMaxProcessRssMb, sample.maxProcessRssMb)
    current.peakProcessCount = Math.max(current.peakProcessCount, sample.processCount)
    byPhase.set(sample.phase, current)
  }

  const first = samples[0]
  const last = samples.at(-1)
  const peakRssMb = Math.max(0, ...samples.map(sample => sample.rssMb))
  return {
    count: samples.length,
    baselineRssMb: first?.rssMb ?? 0,
    peakRssMb,
    rssDeltaMb: Math.max(0, peakRssMb - (first?.rssMb ?? 0)),
    peakMaxProcessRssMb: Math.max(0, ...samples.map(sample => sample.maxProcessRssMb)),
    peakProcessCount: Math.max(0, ...samples.map(sample => sample.processCount)),
    durationMs: first && last ? last.at - first.at : 0,
    phases: Object.fromEntries(byPhase),
  }
}

async function writeReport(options, report) {
  await mkdir(options.outDir, { recursive: true })
  const base = `${formatTimestamp(new Date(report.generatedAt))}-${report.label}`
  const jsonFile = path.join(options.outDir, `${base}.json`)
  const mdFile = path.join(options.outDir, `${base}.md`)
  await writeFile(jsonFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeFile(mdFile, [
    `# CI 内存报告：${report.label}`,
    '',
    `- generated_at: ${report.generatedAt}`,
    `- command: \`${report.command.join(' ')}\``,
    `- samples: ${report.summary.count}`,
    `- RSS baseline: ${report.summary.baselineRssMb}MB`,
    `- RSS peak: ${report.summary.peakRssMb}MB`,
    `- RSS delta: ${report.summary.rssDeltaMb}MB`,
    `- max single process RSS: ${report.summary.peakMaxProcessRssMb}MB`,
    `- peak process count: ${report.summary.peakProcessCount}`,
    `- duration: ${Math.round(report.summary.durationMs / 1000)}s`,
    `- phase peaks: \`${JSON.stringify(report.summary.phases)}\``,
    '',
  ].join('\n'), 'utf8')
  process.stdout.write(`[official-vite-hmr-memory] report written: ${path.relative(repositoryRoot, mdFile)}\n`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const original = await readFile(targetFile, 'utf8')
  const command = ['exec', 'vite', '--host', options.host, '--port', String(options.port), '--strictPort']
  const startedAt = new Date()
  const samples = []
  const events = []
  const logLines = []
  let phase = 'startup'

  const child = spawn(pnpmCmd, command, {
    cwd: appRoot,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })
  child.stdout.on('data', (chunk) => {
    const text = chunk.toString()
    logLines.push(...text.split(/\r?\n/).filter(Boolean))
    process.stdout.write(text)
  })
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString()
    logLines.push(...text.split(/\r?\n/).filter(Boolean))
    process.stderr.write(text)
  })

  const record = () => {
    const sample = sampleProcessTree(child.pid, phase)
    if (sample) {
      samples.push(sample)
    }
  }
  const timer = setInterval(record, options.sampleMs)
  timer.unref?.()

  try {
    await waitForServer(child, logLines, options)
    events.push({ at: Date.now(), type: 'server-ready' })
    await fetch(`http://${options.host}:${options.port}/`)
    phase = 'idle'
    await sleep(options.idleMs)

    phase = 'hmr-update'
    const patched = original.replace('class="min-h-screen bg-slate-950 text-slate-100"', 'class="min-h-screen bg-slate-950 text-slate-100 ring-1 ring-emerald-500"')
    if (patched === original) {
      throw new Error('failed to patch HMR target class')
    }
    await writeFile(targetFile, patched, 'utf8')
    events.push({ at: Date.now(), type: 'write-update' })
    await sleep(options.updateMs)

    phase = 'hmr-rollback'
    await writeFile(targetFile, original, 'utf8')
    events.push({ at: Date.now(), type: 'write-rollback' })
    await sleep(options.updateMs)
  }
  finally {
    clearInterval(timer)
    record()
    await writeFile(targetFile, original, 'utf8')
    child.kill('SIGTERM')
    await Promise.race([
      new Promise(resolve => child.on('close', resolve)),
      sleep(3000).then(() => child.kill('SIGKILL')),
    ])
  }

  await writeReport(options, {
    generatedAt: startedAt.toISOString(),
    label,
    command: [pnpmCmd, ...command],
    exitCode: child.exitCode,
    summary: summarize(samples),
    events,
    samples,
  })
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
