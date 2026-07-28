import type {
  HBuilderXIssueKind,
  HBuilderXLaunchOptions,
  HBuilderXNativeCommandOptions,
  HBuilderXResolvedChannel,
  HBuilderXRunner,
  HBuilderXRunnerOptions,
} from '../types'
import path from 'node:path'
import process from 'node:process'
import { wait } from '../fs'
import { classifyHBuilderXOutput, formatRecentLogs } from '../logs'
import { HBuilderXCommandError, runCommand, spawnCommand } from '../process'
import { inferHBuilderXChannel, resolveHBuilderXChannel, resolveHBuilderXCliInfoFromOptions } from './discovery'

const ansiRE = new RegExp(`${String.fromCharCode(27)}\\[[\\d;]*m`, 'g')
const defaultStartupTimeoutMs = 60_000
const hostPollIntervalMs = 500
const maxSessionLogChunks = 160

export function stripAnsi(value: string) {
  return value.replace(ansiRE, '')
}

export function parseHBuilderXHosts(output: string) {
  return [...new Set(stripAnsi(output)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !/^-?\d+:cli:|命令.+(?:不存在|错误)|not detected running/i.test(line)))]
}

export function parseHBuilderXVersion(output: string) {
  return stripAnsi(output).match(/\b(\d+\.\d+(?:\.\d+)+(?:-[0-9a-z.-]+)?)\b/i)?.[1]
}

export function inferHBuilderXChannelFromVersion(version: string): HBuilderXResolvedChannel {
  return /(?:^|-)alpha(?:\.|$)/i.test(version) ? 'alpha' : 'stable'
}

export function createHBuilderXNativeLaunchArgs(options: HBuilderXLaunchOptions) {
  const args = ['launch', options.platform, '--project', path.resolve(options.cwd), ...(options.args ?? [])]
  if (options.compile != null && !args.includes('--compile')) {
    args.push('--compile', String(options.compile))
  }
  if (options.runtimeLog != null && !args.includes('--runtime-log')) {
    args.push('--runtime-log', String(options.runtimeLog))
  }
  return args
}

function createRunnerError(
  cliPath: string,
  cwd: string,
  args: string[],
  kind: Extract<HBuilderXIssueKind, 'cli-instance-mismatch' | 'cli-host-ambiguous'>,
  message: string,
  hint: string,
  logs: string[],
) {
  const output = formatRecentLogs(logs)
  return new HBuilderXCommandError([
    `${message}: ${cliPath} ${args.join(' ')}`,
    `cwd=${cwd}`,
    `issue=${kind}: ${message}`,
    `hint=${hint}`,
    output,
  ].filter(Boolean).join('\n'), {
    command: cliPath,
    args,
    cwd,
    exit: { code: null, signal: null },
    logs,
    output,
    issue: { kind, message, hint },
  })
}

function bindHost(args: string[], host: string) {
  const hostIndex = args.indexOf('--host')
  if (hostIndex < 0) {
    return [...args, '--host', host]
  }
  if (args[hostIndex + 1] !== host) {
    throw new Error(`runner 已绑定 HBuilderX host=${host}，不能改为 ${args[hostIndex + 1] ?? '空值'}。`)
  }
  return args
}

function appendLogs(target: string[], source: string[]) {
  target.push(...source)
  if (target.length > maxSessionLogChunks) {
    target.splice(0, target.length - maxSessionLogChunks)
  }
}

async function listCompatibleHosts(
  cliPath: string,
  cwd: string,
  env: Record<string, string | undefined>,
  expectedChannel: HBuilderXResolvedChannel,
  explicitHost: string | undefined,
  timeoutMs: number,
) {
  const startedAt = Date.now()
  const logs: string[] = []
  do {
    const listed = await runCommand({
      command: cliPath,
      args: ['listhost'],
      cwd,
      env,
      timeoutMs: Math.min(timeoutMs, 10_000),
      allowFailure: true,
    })
    appendLogs(logs, listed.logs)
    const hosts = explicitHost ? [explicitHost] : parseHBuilderXHosts(listed.output)
    const compatible: Array<{ host: string, version: string, channel: HBuilderXResolvedChannel }> = []
    for (const host of hosts) {
      const versionResult = await runCommand({
        command: cliPath,
        args: ['version', '--host', host],
        cwd,
        env,
        timeoutMs: Math.min(timeoutMs, 10_000),
        allowFailure: true,
      })
      appendLogs(logs, versionResult.logs)
      if (versionResult.issue.kind === 'cli-instance-mismatch') {
        return { compatible: [], logs }
      }
      const version = versionResult.exit.code === 0 ? parseHBuilderXVersion(versionResult.output) : undefined
      if (!version) {
        continue
      }
      const channel = inferHBuilderXChannelFromVersion(version)
      if (expectedChannel === 'unknown' || channel === expectedChannel) {
        compatible.push({ host, version, channel })
      }
    }
    if (compatible.length > 0) {
      return { compatible, logs }
    }
    await wait(hostPollIntervalMs)
  } while (Date.now() - startedAt < timeoutMs)

  return { compatible: [], logs }
}

export async function createHBuilderXRunner(options: HBuilderXRunnerOptions = {}): Promise<HBuilderXRunner> {
  const env = {
    ...process.env,
    ...options.env,
  }
  const cwd = options.cwd ?? process.cwd()
  const timeoutMs = options.timeoutMs ?? defaultStartupTimeoutMs
  const resolution = await resolveHBuilderXCliInfoFromOptions({
    candidates: options.hbuilderxCliPath ? [options.hbuilderxCliPath] : options.candidates,
    channel: options.channel,
    env,
    host: options.host,
  })
  const cliEnv = {
    ...env,
    HBUILDERX_CLI_PATH: resolution.path,
  }

  if (!resolution.isRunning) {
    const opened = await runCommand({
      command: resolution.path,
      args: ['open'],
      cwd,
      env: cliEnv,
      timeoutMs,
      allowFailure: true,
    })
    const openIssue = classifyHBuilderXOutput(opened.output)
    if (opened.exit.code !== 0 || openIssue.kind === 'cli-instance-mismatch' || openIssue.kind === 'cli-host-ambiguous') {
      throw createRunnerError(
        resolution.path,
        cwd,
        ['open'],
        openIssue.kind === 'cli-host-ambiguous' ? 'cli-host-ambiguous' : 'cli-instance-mismatch',
        openIssue.message,
        openIssue.hint ?? '请检查目标 HBuilderX 运行实例。',
        opened.logs,
      )
    }
  }

  const requestedChannel = resolveHBuilderXChannel(options.channel ?? env.HBUILDERX_CHANNEL)
  const expectedChannel = resolution.channel !== 'unknown'
    ? resolution.channel
    : requestedChannel === 'auto' ? inferHBuilderXChannel(resolution.path) : requestedChannel
  const explicitHost = options.host ?? env.HBUILDERX_HOST
  const { compatible, logs } = await listCompatibleHosts(
    resolution.path,
    cwd,
    cliEnv,
    expectedChannel,
    explicitHost,
    timeoutMs,
  )

  if (compatible.length === 0) {
    throw createRunnerError(
      resolution.path,
      cwd,
      ['listhost'],
      'cli-instance-mismatch',
      `未找到与 ${expectedChannel} CLI 匹配的 HBuilderX host`,
      '请启动对应版本，或检查 HBUILDERX_CLI_PATH、HBUILDERX_CHANNEL 和 HBUILDERX_HOST。',
      logs,
    )
  }
  if (compatible.length > 1) {
    throw createRunnerError(
      resolution.path,
      cwd,
      ['listhost'],
      'cli-host-ambiguous',
      `检测到多个匹配的 HBuilderX host：${compatible.map(item => item.host).join(', ')}`,
      '请设置 HBUILDERX_HOST，或在 createHBuilderXRunner options 中显式传入 host。',
      logs,
    )
  }

  const selected = compatible[0]
  const boundResolution = {
    ...resolution,
    isRunning: true,
    channel: selected.channel,
    host: selected.host,
    version: selected.version,
  }
  const run = async (commandOptions: HBuilderXNativeCommandOptions) => await runCommand({
    ...commandOptions,
    command: resolution.path,
    args: bindHost(commandOptions.args, selected.host),
    cwd: commandOptions.cwd ?? cwd,
    env: {
      ...cliEnv,
      ...commandOptions.env,
    },
  })
  const spawn = (commandOptions: HBuilderXNativeCommandOptions) => spawnCommand({
    ...commandOptions,
    command: resolution.path,
    args: bindHost(commandOptions.args, selected.host),
    cwd: commandOptions.cwd ?? cwd,
    env: {
      ...cliEnv,
      ...commandOptions.env,
    },
  })

  const runner: HBuilderXRunner = {
    resolution: boundResolution,
    run,
    spawn,
    async closeProject(projectOptions) {
      return await run({
        ...projectOptions,
        args: ['project', 'close', '--path', path.resolve(projectOptions.cwd)],
        allowFailure: projectOptions.allowFailure ?? true,
      })
    },
    async openProject(projectOptions) {
      return await run({
        ...projectOptions,
        args: ['project', 'open', '--path', path.resolve(projectOptions.cwd)],
      })
    },
    async prepareProject(projectOptions) {
      await runner.closeProject({ ...projectOptions, allowFailure: true })
      return await runner.openProject(projectOptions)
    },
    async launchProject(launchOptions) {
      return await run({
        ...launchOptions,
        args: createHBuilderXNativeLaunchArgs(launchOptions),
      })
    },
    startLaunch(launchOptions) {
      return spawn({
        ...launchOptions,
        args: createHBuilderXNativeLaunchArgs(launchOptions),
      })
    },
  }
  return runner
}
