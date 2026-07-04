import type { HBuilderXCliResolution, HBuilderXCliResolutionSource, HBuilderXLaunchOptions, HBuilderXProjectOptions } from './types'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileExists } from './fs'
import { runCommand, spawnCommand } from './process'

const macOSDefaultCli = '/Applications/HBuilderX.app/Contents/MacOS/cli'

export function getDefaultHBuilderXCliCandidates(env: NodeJS.ProcessEnv = process.env) {
  return [
    env.HBUILDERX_CLI_PATH,
    process.platform === 'darwin' ? macOSDefaultCli : undefined,
  ].filter((item): item is string => Boolean(item))
}

export function extractHBuilderXMacOSExecutable(line: string) {
  return line.match(/(\/.*?HBuilderX[^/]*\.app\/Contents\/MacOS\/HBuilderX)(?:\s|$)/i)?.[1]
}

export function extractHBuilderXWindowsExecutable(line: string) {
  const columns = line.split(',')
  const executable = columns.at(-1)?.trim()
  return executable?.toLowerCase().endsWith('hbuilderx.exe') ? executable : undefined
}

export function extractHBuilderXExecutableFromProcessOutput(output: string, platform: NodeJS.Platform = process.platform) {
  for (const line of output.split(/\r?\n/)) {
    const executable = platform === 'win32'
      ? extractHBuilderXWindowsExecutable(line)
      : extractHBuilderXMacOSExecutable(line)
    if (executable) {
      return executable
    }
  }
  return undefined
}

export async function findRunningHBuilderXCli(platform: NodeJS.Platform = process.platform) {
  const result = platform === 'win32'
    ? spawnSync('wmic', ['process', 'where', 'name=\'HBuilderX.exe\'', 'get', 'executablepath', '/format:csv'], { encoding: 'utf8', windowsHide: true })
    : spawnSync('ps', ['-ax', '-o', 'command='], { encoding: 'utf8' })

  if (result.error || result.status !== 0) {
    return undefined
  }

  const executable = extractHBuilderXExecutableFromProcessOutput(`${result.stdout ?? ''}${result.stderr ?? ''}`, platform)
  if (!executable || !(await fileExists(executable))) {
    return undefined
  }

  const cli = path.join(path.dirname(executable), platform === 'win32' ? 'cli.exe' : 'cli')
  return (await fileExists(cli)) ? cli : undefined
}

function resolveCandidateSource(candidate: string, env: NodeJS.ProcessEnv): HBuilderXCliResolutionSource {
  if (candidate === env.HBUILDERX_CLI_PATH) {
    return 'env'
  }
  if (candidate === macOSDefaultCli) {
    return 'default-path'
  }
  return 'candidate'
}

export async function resolveHBuilderXCliInfo(candidates?: string[], env: NodeJS.ProcessEnv = process.env): Promise<HBuilderXCliResolution> {
  if (!candidates) {
    const runningCli = await findRunningHBuilderXCli()
    if (runningCli) {
      return {
        path: runningCli,
        isRunning: true,
        source: 'running-process',
      }
    }
  }

  const items = candidates ?? getDefaultHBuilderXCliCandidates(env)
  for (const item of items) {
    if (await fileExists(item)) {
      return {
        path: item,
        isRunning: false,
        source: resolveCandidateSource(item, env),
      }
    }
  }
  throw new Error('未找到 HBuilderX CLI。请先安装 HBuilderX，或设置 HBUILDERX_CLI_PATH=/path/to/cli。')
}

export async function resolveHBuilderXCli(candidates?: string[]) {
  return (await resolveHBuilderXCliInfo(candidates)).path
}

export function createHBuilderXEnv(options: { hbuilderxCliPath?: string, env?: Record<string, string | undefined> } = {}) {
  return {
    ...options.env,
    HBUILDERX_CLI_PATH: options.hbuilderxCliPath ?? options.env?.HBUILDERX_CLI_PATH ?? process.env.HBUILDERX_CLI_PATH ?? getDefaultHBuilderXCliCandidates()[0],
    NODE_OPTIONS: options.env?.NODE_OPTIONS ?? process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
  }
}

export function hbuilderxPnpmArgs(args: string[]) {
  return ['exec', 'hbuilderx', ...args]
}

export async function runPnpmCommand(options: HBuilderXProjectOptions & { args: string[] }) {
  return await runCommand({
    command: 'pnpm',
    args: options.args,
    cwd: options.cwd,
    timeoutMs: options.timeoutMs,
    allowFailure: options.allowFailure,
    env: createHBuilderXEnv(options),
  })
}

export function spawnPnpmCommand(options: HBuilderXProjectOptions & { args: string[] }) {
  return spawnCommand({
    command: 'pnpm',
    args: options.args,
    cwd: options.cwd,
    env: createHBuilderXEnv(options),
  })
}

export async function closeProject(options: HBuilderXProjectOptions) {
  return await runPnpmCommand({
    ...options,
    args: hbuilderxPnpmArgs(['project', 'close', '--path', path.resolve(options.cwd)]),
    allowFailure: options.allowFailure ?? true,
  })
}

export async function openProject(options: HBuilderXProjectOptions) {
  return await runPnpmCommand({
    ...options,
    args: hbuilderxPnpmArgs(['project', 'open', '--path', path.resolve(options.cwd)]),
  })
}

export async function prepareProject(options: HBuilderXProjectOptions) {
  await closeProject({ ...options, allowFailure: true })
  return await openProject(options)
}

export function createLaunchArgs(options: HBuilderXLaunchOptions) {
  const args = ['launch', options.platform, '--project', path.resolve(options.cwd), ...(options.args ?? [])]
  if (options.compile != null && !args.includes('--compile')) {
    args.push('--compile', String(options.compile))
  }
  if (options.runtimeLog != null && !args.includes('--runtime-log')) {
    args.push('--runtime-log', String(options.runtimeLog))
  }
  return hbuilderxPnpmArgs(args)
}

export async function launchProject(options: HBuilderXLaunchOptions) {
  return await runPnpmCommand({
    ...options,
    args: createLaunchArgs(options),
  })
}

export function startLaunch(options: HBuilderXLaunchOptions) {
  return spawnPnpmCommand({
    ...options,
    args: createLaunchArgs(options),
  })
}
