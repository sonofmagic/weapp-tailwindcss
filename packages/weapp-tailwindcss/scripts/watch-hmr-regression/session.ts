import type { Buffer } from 'node:buffer'
import type { CliOptions, WatchSession } from './types'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { resolvePnpmCommand } from './cli'

export async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

// 模块级正则，避免函数内重复编译
const ZERO_WIDTH_SPACE_RE = /\u200B/g
const NEWLINE_SPLIT_RE = /\r?\n/
const PNPM_RE = /pnpm/i
const ERROR_RE = /error/i
const EMFILE_RE = /emfile/i
const WHITESPACE_RE = /\s+/
const FIRST_WHITESPACE_RE = /\s/
const WATCH_COMMAND_PATTERNS = [
  /weapp-vite(?:\.js)?\s+dev/i,
  /taro-build-guard\.mjs\s+--watch/i,
  /run-mpx-cli-service\.js\s+serve/i,
  /webpack(?:\.js)?\s+--watch/i,
  /\bnpm\b[\s\S]+build:weapp[\s\S]+--watch/i,
] as const

const sassDeprecationLinePatterns = [
  /^DEPRECATION WARNING \[/,
  /More info: https:\/\/sass\.lang\.com\/d\//,
  /More info and automated migrator: https:\/\/sass\.lang\.com\/d\//,
  /^WARNING: \d+ repetitive deprecation warnings omitted\.$/,
  /^\s*[│╷╵^]/,
  /^\s*\d+\s*│/,
  /^\s*stdin\s+\d+:\d+\s+root stylesheet$/,
  /^\s*src\/\S+\s+\d+:\d+\s+@import$/,
] as const

function isSassDeprecationNoiseLine(line: string) {
  const normalized = line.replace(ZERO_WIDTH_SPACE_RE, '')

  if (normalized.includes('sass-lang.com/d/')) {
    return true
  }

  if (normalized.includes('@import') && normalized.includes('│')) {
    return true
  }

  for (const pattern of sassDeprecationLinePatterns) {
    if (pattern.test(normalized)) {
      return true
    }
  }
  return false
}

function createLineCollector(
  prefix: string,
  lines: string[],
  limit = 240,
  options: { quietSass?: boolean } = {},
) {
  const quietSass = options.quietSass === true
  return (chunk: Buffer | string) => {
    const text = chunk.toString()
    for (const line of text.split(NEWLINE_SPLIT_RE)) {
      if (!line) {
        continue
      }

      if (quietSass && isSassDeprecationNoiseLine(line)) {
        continue
      }

      lines.push(line)
      if (lines.length > limit) {
        lines.shift()
      }
      process.stdout.write(`[${prefix}] ${line}\n`)
    }
  }
}

const compileSuccessLinePatterns = [
  /compiled successfully/i,
  /build complete/i,
  /watching for changes/i,
  /ready in \d+/i,
  /dev(?:elopment)? server ready/i,
  /开发服务已就绪/u,
  /built in \d+/i,
  /构建完成/u,
] as const

const compileFailureLinePatterns = [
  /build failed with \d+ error/i,
  /\[unhandleable_error\]/i,
  /unable to start fsevent stream/i,
  /err_pnpm_recursive_run_first_fail/i,
  /error:\s*listen eperm/i,
  /error:\s*listen emfile/i,
] as const

function stripAnsiControlSequences(line: string) {
  let output = ''
  for (let index = 0; index < line.length; index += 1) {
    const current = line.charCodeAt(index)
    const next = line.charCodeAt(index + 1)

    if (current !== 27 || next !== 91) {
      output += line[index]
      continue
    }

    index += 2
    while (index < line.length) {
      const code = line.charCodeAt(index)
      const isUpper = code >= 65 && code <= 90
      const isLower = code >= 97 && code <= 122
      if (isUpper || isLower) {
        break
      }
      index += 1
    }
  }
  return output
}

function normalizeLogLine(line: string) {
  return stripAnsiControlSequences(line).replace(ZERO_WIDTH_SPACE_RE, '').trim()
}

function isCompileSuccessLine(line: string) {
  const normalized = normalizeLogLine(line)
  for (const pattern of compileSuccessLinePatterns) {
    if (pattern.test(normalized)) {
      return true
    }
  }
  return false
}

function resolveCompileFatalError(line: string) {
  const normalized = normalizeLogLine(line)
  for (const pattern of compileFailureLinePatterns) {
    if (pattern.test(normalized)) {
      return normalized
    }
  }

  // Some toolchains prefix fatal lines with `ERROR` but include extra symbols/text.
  if (ERROR_RE.test(normalized) && EMFILE_RE.test(normalized)) {
    return normalized
  }
}

function createSpawnEnv(
  base: NodeJS.ProcessEnv,
  extra: Record<string, string> = {},
): NodeJS.ProcessEnv {
  const merged: NodeJS.ProcessEnv = {
    ...base,
    ...extra,
  }
  const sanitized: NodeJS.ProcessEnv = {}

  for (const [key, value] of Object.entries(merged)) {
    if (typeof value !== 'string') {
      continue
    }
    // Windows keeps internal drive-scoped entries like `=C:` in process.env,
    // which can make child_process.spawn fail with EINVAL.
    if (process.platform === 'win32' && key.includes('=')) {
      continue
    }
    sanitized[key] = value
  }

  return sanitized
}

function spawnPnpm(
  args: string[],
  options: {
    cwd: string
    env: NodeJS.ProcessEnv
    detached?: boolean
    stdio: 'pipe'
  },
) {
  const npmExecPath = process.env.npm_execpath
  if (
    typeof npmExecPath === 'string'
    && npmExecPath.length > 0
    && PNPM_RE.test(path.basename(npmExecPath))
    && existsSync(npmExecPath)
  ) {
    return spawn(process.execPath, [npmExecPath, ...args], options)
  }

  if (process.platform === 'win32') {
    return spawn('pnpm', args, {
      ...options,
      shell: true,
      windowsHide: true,
    })
  }

  return spawn(resolvePnpmCommand(), args, options)
}

function killProcessTreeOnWindows(pid: number) {
  try {
    spawnSync('taskkill', ['/pid', String(pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    })
  }
  catch {
  }
}

function listDescendantPidsOnPosix(rootPid: number) {
  const result = spawnSync('ps', ['-Ao', 'pid=,ppid='], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })

  if (result.status !== 0 || typeof result.stdout !== 'string') {
    return []
  }

  const childrenByParent = new Map<number, number[]>()
  for (const line of result.stdout.split(NEWLINE_SPLIT_RE)) {
    const normalized = line.trim()
    if (!normalized) {
      continue
    }

    const [pidText, ppidText] = normalized.split(WHITESPACE_RE)
    const pid = Number(pidText)
    const ppid = Number(ppidText)
    if (!Number.isInteger(pid) || !Number.isInteger(ppid)) {
      continue
    }

    const siblings = childrenByParent.get(ppid)
    if (siblings) {
      siblings.push(pid)
    }
    else {
      childrenByParent.set(ppid, [pid])
    }
  }

  const descendants: number[] = []
  const stack = [...(childrenByParent.get(rootPid) ?? [])]
  while (stack.length > 0) {
    const current = stack.pop()
    if (current == null) {
      continue
    }
    descendants.push(current)
    const children = childrenByParent.get(current)
    if (children?.length) {
      stack.push(...children)
    }
  }

  return descendants
}

function killProcessTreeOnPosix(pid: number, signal: NodeJS.Signals) {
  const descendants = listDescendantPidsOnPosix(pid)

  for (const childPid of descendants.reverse()) {
    try {
      process.kill(childPid, signal)
    }
    catch {
    }
  }

  for (const childPid of descendants) {
    try {
      process.kill(-childPid, signal)
    }
    catch {
    }
  }

  try {
    process.kill(-pid, signal)
    return
  }
  catch {
  }

  try {
    process.kill(pid, signal)
  }
  catch {
  }
}

function listMatchingWatchPidsByCwd(cwd: string) {
  const result = spawnSync('ps', ['-Ao', 'pid=,command='], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })

  if (result.status !== 0 || typeof result.stdout !== 'string') {
    return []
  }

  const normalizedCwd = path.resolve(cwd)
  const matched = new Set<number>()

  for (const line of result.stdout.split(NEWLINE_SPLIT_RE)) {
    const normalized = line.trim()
    if (!normalized) {
      continue
    }

    const firstWhitespace = normalized.search(FIRST_WHITESPACE_RE)
    if (firstWhitespace <= 0) {
      continue
    }

    const pid = Number(normalized.slice(0, firstWhitespace))
    const command = normalized.slice(firstWhitespace).trim()
    if (!Number.isInteger(pid) || pid <= 0) {
      continue
    }
    if (pid === process.pid) {
      continue
    }
    if (!command.includes(normalizedCwd)) {
      continue
    }
    if (!WATCH_COMMAND_PATTERNS.some(pattern => pattern.test(command))) {
      continue
    }
    matched.add(pid)
  }

  return [...matched]
}

function cleanupExistingWatchProcesses(cwd: string) {
  const pids = listMatchingWatchPidsByCwd(cwd)
  if (pids.length === 0) {
    return
  }

  process.stdout.write(
    `[watch-hmr] cleanup stale watch processes for ${path.relative(process.cwd(), cwd) || '.'}: ${pids.join(', ')}\n`,
  )

  for (const pid of pids) {
    if (process.platform === 'win32') {
      killProcessTreeOnWindows(pid)
      continue
    }
    killProcessTreeOnPosix(pid, 'SIGKILL')
  }
}

async function runCommand(cwd: string, args: string[], label: string) {
  const lines: string[] = []
  const child = spawnPnpm(args, {
    cwd,
    env: createSpawnEnv(process.env),
    stdio: 'pipe',
  })

  const collect = createLineCollector(label, lines)
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const exitCode = await new Promise<number>((resolve) => {
    child.on('close', (code) => {
      resolve(code ?? 1)
    })
  })

  if (exitCode !== 0) {
    throw new Error(`[${label}] command failed with code ${exitCode}\n${lines.join('\n')}`)
  }
}

export async function ensureLocalPackageBuild(baseCwd: string) {
  const packageRoot = path.resolve(baseCwd, 'packages/weapp-tailwindcss')
  process.stdout.write('[watch-hmr] prepare local package build\n')
  await runCommand(packageRoot, ['run', 'build'], 'build')
}

export function createWatchSession(
  cwd: string,
  devScript: string,
  options: Pick<CliOptions, 'quietSass'>,
  env: Record<string, string> = {},
): WatchSession {
  cleanupExistingWatchProcesses(cwd)
  const lines: string[] = []
  let lastCompileSuccessAt = 0
  let compileFatalError: string | undefined
  const child = spawnPnpm(['run', devScript], {
    cwd,
    env: createSpawnEnv(process.env, {
      WEAPP_TW_WATCH_REGRESSION: '1',
      // 回归模式优先稳定性。
      // 宿主机上 Webpack/Taro 的 fs.watch 很容易触发 EMFILE，
      // 这里统一切到 polling watcher，必要时仍允许外部环境覆盖。
      WATCHPACK_POLLING: process.env.WATCHPACK_POLLING ?? 'true',
      WATCHPACK_POLLING_INTERVAL: process.env.WATCHPACK_POLLING_INTERVAL ?? '1000',
      CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? '1',
      CHOKIDAR_INTERVAL: process.env.CHOKIDAR_INTERVAL ?? '1000',
      ...env,
    }),
    detached: process.platform !== 'win32',
    stdio: 'pipe',
  })

  const killWatchProcess = (signal: NodeJS.Signals) => {
    const childPid = child.pid
    if (childPid != null && process.platform === 'win32') {
      killProcessTreeOnWindows(childPid)
      return
    }

    if (childPid != null && process.platform !== 'win32') {
      killProcessTreeOnPosix(childPid, signal)
      return
    }

    try {
      child.kill(signal)
    }
    catch {
    }
  }

  const closePipes = () => {
    try {
      child.stdin.end()
    }
    catch {
    }
    try {
      child.stdin.destroy()
    }
    catch {
    }
    try {
      child.stdout.destroy()
    }
    catch {
    }
    try {
      child.stderr.destroy()
    }
    catch {
    }
  }

  let collecting = true
  const rawCollect = createLineCollector('watch', lines, 240, {
    quietSass: options.quietSass,
  })
  const collect = (chunk: Buffer | string) => {
    if (!collecting) {
      return
    }

    const text = chunk.toString()
    for (const line of text.split(NEWLINE_SPLIT_RE)) {
      if (!line) {
        continue
      }
      if (isCompileSuccessLine(line)) {
        lastCompileSuccessAt = Date.now()
      }
      if (!compileFatalError) {
        compileFatalError = resolveCompileFatalError(line)
      }
    }

    rawCollect(chunk)
  }

  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const ensureRunning = () => {
    if (compileFatalError) {
      throw new Error(`watch process reported fatal error: ${compileFatalError}`)
    }
    if (child.exitCode != null) {
      throw new Error(`watch process exited unexpectedly with code ${child.exitCode}`)
    }
  }

  const stop = async () => {
    const waitForExit = async (timeoutMs: number) => {
      const startedAt = Date.now()
      while (child.exitCode == null && Date.now() - startedAt < timeoutMs) {
        await sleep(100)
      }
      return child.exitCode != null
    }

    if (child.exitCode != null) {
      closePipes()
      return
    }

    collecting = false
    child.stdout.off('data', collect)
    child.stderr.off('data', collect)

    killWatchProcess('SIGINT')
    if (await waitForExit(3000)) {
      closePipes()
      return
    }

    killWatchProcess('SIGTERM')
    if (await waitForExit(2500)) {
      closePipes()
      return
    }

    killWatchProcess('SIGKILL')
    await waitForExit(2500)
    closePipes()
  }

  return {
    child,
    ensureRunning,
    lastCompileSuccessAt: () => lastCompileSuccessAt,
    logs: () => lines.join('\n'),
    stop,
  }
}
