import type { Buffer } from 'node:buffer'
import type { CliOptions, WatchSession } from './types'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { resolvePnpmCommand } from './cli'

export async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

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
  const normalized = line.replace(/\u200B/g, '')

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
    for (const line of text.split(/\r?\n/)) {
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
  /built in \d+/i,
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
  return stripAnsiControlSequences(line).replace(/\u200B/g, '').trim()
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
  if (/error/i.test(normalized) && /emfile/i.test(normalized)) {
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
    && /pnpm/i.test(path.basename(npmExecPath))
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
  const lines: string[] = []
  let lastCompileSuccessAt = 0
  let compileFatalError: string | undefined
  const child = spawnPnpm(['run', devScript], {
    cwd,
    env: createSpawnEnv(process.env, {
      WEAPP_TW_WATCH_REGRESSION: '1',
      ...env,
    }),
    detached: process.platform !== 'win32',
    stdio: 'pipe',
  })

  const killWatchProcess = (signal: NodeJS.Signals) => {
    const childPid = child.pid
    if (childPid != null && process.platform !== 'win32') {
      try {
        process.kill(-childPid, signal)
        return
      }
      catch {
      }
    }

    try {
      child.kill(signal)
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
    for (const line of text.split(/\r?\n/)) {
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
    if (child.exitCode != null) {
      return
    }

    collecting = false
    child.stdout.off('data', collect)
    child.stderr.off('data', collect)

    killWatchProcess('SIGINT')

    let startedAt = Date.now()
    while (child.exitCode == null && Date.now() - startedAt < 3000) {
      await sleep(100)
    }

    if (child.exitCode != null) {
      return
    }

    killWatchProcess('SIGTERM')

    startedAt = Date.now()
    while (child.exitCode == null && Date.now() - startedAt < 2000) {
      await sleep(100)
    }

    if (child.exitCode == null) {
      killWatchProcess('SIGKILL')
    }
  }

  return {
    child,
    ensureRunning,
    lastCompileSuccessAt: () => lastCompileSuccessAt,
    logs: () => lines.join('\n'),
    stop,
  }
}
