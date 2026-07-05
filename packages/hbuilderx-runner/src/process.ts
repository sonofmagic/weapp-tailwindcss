import type { ChildProcess } from 'node:child_process'
import type { CommandExit, HBuilderXCommandOptions, HBuilderXCommandResult, SpawnedHBuilderXCommand } from './types'
import { spawn, spawnSync } from 'node:child_process'
import process from 'node:process'
import { wait } from './fs'
import { classifyHBuilderXOutput, collectProcessOutput, createTimeoutIssue, formatRecentLogs } from './logs'

export class HBuilderXCommandError extends Error {
  readonly result: HBuilderXCommandResult

  constructor(message: string, result: HBuilderXCommandResult) {
    super(message)
    this.name = 'HBuilderXCommandError'
    this.result = result
  }
}

export function killProcessTree(child: ChildProcess, signal: NodeJS.Signals = 'SIGTERM') {
  const pid = child.pid
  if (!pid || child.exitCode != null) {
    return
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    })
    return
  }

  try {
    process.kill(-pid, signal)
  }
  catch {
    try {
      child.kill(signal)
    }
    catch {
    }
  }
}

function createCommandResult(options: HBuilderXCommandOptions, exit: CommandExit, logs: string[], timedOut = false): HBuilderXCommandResult {
  const output = formatRecentLogs(logs)
  return {
    command: options.command,
    args: options.args,
    cwd: options.cwd,
    exit,
    logs,
    output,
    issue: timedOut ? createTimeoutIssue() : classifyHBuilderXOutput(output),
  }
}

function buildCommandError(prefix: string, options: HBuilderXCommandOptions, exit: CommandExit, logs: string[], timedOut = false) {
  const result = createCommandResult(options, exit, logs, timedOut)
  return new HBuilderXCommandError([
    `${prefix}: ${options.command} ${options.args.join(' ')}`,
    `cwd=${options.cwd}`,
    `exit=${exit.signal ?? exit.code}`,
    `issue=${result.issue.kind}: ${result.issue.message}`,
    result.issue.hint ? `hint=${result.issue.hint}` : '',
    result.output,
  ].filter(Boolean).join('\n'), result)
}

export function spawnCommand(options: HBuilderXCommandOptions): SpawnedHBuilderXCommand {
  const child = spawn(options.command, options.args, {
    cwd: options.cwd,
    detached: options.detached ?? process.platform !== 'win32',
    shell: process.platform === 'win32',
    stdio: options.stdio === 'inherit' ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ...options.env,
      NODE_OPTIONS: options.env?.NODE_OPTIONS ?? process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
    },
  })
  const logs = options.stdio === 'inherit' ? [] : collectProcessOutput(child)
  let exit: CommandExit | undefined
  const closed = new Promise<CommandExit>((resolve) => {
    child.on('close', (code, signal) => {
      exit = { code, signal }
      resolve(exit)
    })
  })
  return {
    child,
    logs,
    command: options.command,
    args: options.args,
    cwd: options.cwd,
    closed,
    ensureRunning() {
      if (exit && exit.code !== 0) {
        throw buildCommandError('命令提前退出', options, exit, logs)
      }
    },
    async stop(signal: NodeJS.Signals = 'SIGTERM') {
      killProcessTree(child, signal)
      await Promise.race([closed, wait(5000)])
    },
  }
}

export async function runCommand(options: HBuilderXCommandOptions): Promise<HBuilderXCommandResult> {
  const spawned = spawnCommand(options)
  let timer: NodeJS.Timeout | undefined
  let timedOut = false
  try {
    const timeout = options.timeoutMs == null
      ? spawned.closed
      : Promise.race([
          spawned.closed,
          new Promise<CommandExit>((resolve) => {
            timer = setTimeout(() => {
              timedOut = true
              killProcessTree(spawned.child)
              resolve({ code: null, signal: 'SIGTERM' })
            }, options.timeoutMs)
          }),
        ])
    const exit = await timeout
    const result = createCommandResult(options, exit, spawned.logs, timedOut)
    if (exit.code === 0 || options.allowFailure) {
      return result
    }
    const prefix = options.timeoutMs != null && exit.code == null ? '命令超时' : '命令失败'
    throw buildCommandError(prefix, options, exit, spawned.logs, timedOut)
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

export function createProcessExitTracker(child: ChildProcess) {
  let exit: CommandExit | undefined
  const closed = new Promise<CommandExit>((resolve) => {
    child.on('close', (code, signal) => {
      exit = { code, signal }
      resolve(exit)
    })
  })
  return {
    closed,
    ensureRunning(logs: string[]) {
      if (exit && exit.code !== 0) {
        const result = createCommandResult({ command: 'hbuilderx', args: ['launch'], cwd: process.cwd() }, exit, logs)
        throw new HBuilderXCommandError(`HBuilderX launch 提前退出\nissue=${result.issue.kind}: ${result.issue.message}\n${result.output}`, result)
      }
    },
  }
}
