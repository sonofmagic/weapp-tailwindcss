import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

export function now() {
  return performance.now()
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function parseArg(flag, argv) {
  const index = argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }
  return argv[index + 1]
}

export function parseNumber(flag, argv, fallback) {
  const raw = parseArg(flag, argv)
  if (raw == null) {
    return fallback
  }
  const numeric = Number(raw)
  return Number.isFinite(numeric) ? numeric : fallback
}

export function parseBoolean(flag, argv) {
  return argv.includes(flag)
}

export function parseCsvSet(flag, argv) {
  const raw = parseArg(flag, argv)
  if (!raw) {
    return null
  }
  const values = raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  return new Set(values)
}

export function resolveWorkspaceRoot(start = process.cwd()) {
  let cursor = path.resolve(start)
  while (true) {
    if (existsSync(path.join(cursor, 'pnpm-workspace.yaml'))) {
      return cursor
    }
    const parent = path.dirname(cursor)
    if (parent === cursor) {
      return path.resolve(start)
    }
    cursor = parent
  }
}

export function resolvePath(base, value, fallback) {
  const target = value ?? fallback
  return path.isAbsolute(target) ? target : path.resolve(base, target)
}

export function sanitizeTextPaths(input, workspaceRoot) {
  if (typeof input !== 'string') {
    return input
  }

  let text = input
  const normalizedRoot = workspaceRoot
    ? workspaceRoot.replaceAll('\\', '/').replace(/\/+$/g, '')
    : ''

  if (normalizedRoot) {
    text = text.replaceAll(normalizedRoot, '<REPO_ROOT>')
    text = text.replaceAll(workspaceRoot, '<REPO_ROOT>')
  }

  text = text.replace(/[A-Z]:\\[^\s"'`|)]+/gi, '<ABS_PATH>')
  text = text.replace(/\/(?:Users|home|private|var|tmp|opt|Applications|Library|Volumes|runner)\/[^\s"'`|)]+/g, '<ABS_PATH>')
  return text
}

export async function readText(file) {
  try {
    return await fs.readFile(file, 'utf8')
  }
  catch {
    return ''
  }
}

export async function ensureParentDir(file) {
  await fs.mkdir(path.dirname(file), { recursive: true })
}

export async function writeJson(file, payload) {
  await ensureParentDir(file)
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

export async function waitFor(predicate, options) {
  const startedAt = now()
  while (now() - startedAt <= options.timeoutMs) {
    if (await predicate()) {
      return now() - startedAt
    }
    await sleep(options.pollMs)
  }
  throw new Error(options.timeoutMessage)
}

export function summarize(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null
  }
  const sorted = [...values].sort((a, b) => a - b)
  const mean = sorted.reduce((acc, item) => acc + item, 0) / sorted.length
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
  const variance = sorted.reduce((acc, item) => acc + ((item - mean) ** 2), 0) / sorted.length
  return {
    count: sorted.length,
    mean,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stddev: Math.sqrt(variance),
  }
}

function resolvePnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

export function spawnPnpm(cwd, args, stdio = 'pipe') {
  return spawn(resolvePnpmCommand(), args, {
    cwd,
    stdio,
    detached: process.platform !== 'win32',
    env: { ...process.env },
  })
}

export async function stopChild(child) {
  if (child.exitCode != null || child.signalCode != null) {
    return
  }

  const waitClose = new Promise((resolve) => {
    child.once('close', () => resolve(undefined))
  })

  try {
    if (child.pid && process.platform !== 'win32') {
      process.kill(-child.pid, 'SIGINT')
    }
    else {
      child.kill('SIGINT')
    }
  }
  catch {}

  const softTimer = setTimeout(() => {
    try {
      if (child.pid && process.platform !== 'win32') {
        process.kill(-child.pid, 'SIGTERM')
      }
      else {
        child.kill('SIGTERM')
      }
    }
    catch {}
  }, 1200)

  const hardTimer = setTimeout(() => {
    try {
      if (child.pid && process.platform !== 'win32') {
        process.kill(-child.pid, 'SIGKILL')
      }
      else {
        child.kill('SIGKILL')
      }
    }
    catch {}
  }, 4200)

  await waitClose
  clearTimeout(softTimer)
  clearTimeout(hardTimer)
}

export async function runPnpmOnce(cwd, args, timeoutMs) {
  const child = spawnPnpm(cwd, args, 'pipe')
  const logs = []

  const onData = (chunk) => {
    const text = chunk.toString('utf8')
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }
      logs.push(line)
      if (logs.length > 300) {
        logs.shift()
      }
    }
  }

  child.stdout.on('data', onData)
  child.stderr.on('data', onData)

  const startedAt = now()
  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      await stopChild(child)
      reject(new Error(`pnpm command timeout ${timeoutMs}ms: ${args.join(' ')}`))
    }, timeoutMs)

    child.once('error', reject)
    child.once('close', (exitCode) => {
      clearTimeout(timer)
      resolve(exitCode ?? 1)
    })
  })

  if (code !== 0) {
    const tail = logs.slice(-80).join('\n')
    throw new Error(`pnpm command failed code=${code}: ${args.join(' ')}\n${tail}`)
  }

  return {
    elapsedMs: now() - startedAt,
    logs,
  }
}
