import type {
  HBuilderXChannel,
  HBuilderXCliResolution,
  HBuilderXCliResolutionSource,
  HBuilderXCliResolveOptions,
  HBuilderXResolvedChannel,
} from '../types'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileExists } from '../fs'

export const macOSStableCli = '/Applications/HBuilderX.app/Contents/MacOS/cli'
export const macOSAlphaCli = '/Applications/HBuilderX-Alpha.app/Contents/MacOS/cli'

function unique(items: string[]) {
  return [...new Set(items)]
}

function normalizeFile(file: string, platform: NodeJS.Platform = process.platform) {
  const normalized = path.normalize(file)
  return platform === 'win32' ? normalized.toLowerCase() : normalized
}

export function resolveHBuilderXChannel(channel?: string): HBuilderXChannel {
  const value = channel ?? 'auto'
  if (value === 'auto' || value === 'stable' || value === 'alpha') {
    return value
  }
  throw new Error(`无效的 HBuilderX channel：${value}。可选值为 auto、stable、alpha。`)
}

export function inferHBuilderXChannel(file: string): HBuilderXResolvedChannel {
  if (/HBuilderX(?:-|\s*)Alpha(?:\.app)?[\\/]/i.test(file) || /(?:^|[\\/])alpha(?:[\\/]|$)/i.test(file)) {
    return 'alpha'
  }
  if (/HBuilderX(?:\.app)?[\\/]/i.test(file) || /HBuilderX\.exe$/i.test(file)) {
    return 'stable'
  }
  return 'unknown'
}

export function getDefaultHBuilderXCliCandidates(
  env: NodeJS.ProcessEnv = process.env,
  channel: HBuilderXChannel = resolveHBuilderXChannel(env.HBUILDERX_CHANNEL),
  platform: NodeJS.Platform = process.platform,
) {
  const defaults = platform === 'darwin'
    ? channel === 'stable'
      ? [macOSStableCli]
      : channel === 'alpha'
        ? [macOSAlphaCli]
        : [macOSStableCli, macOSAlphaCli]
    : []
  return unique([
    env.HBUILDERX_CLI_PATH,
    ...defaults,
  ].filter((item): item is string => Boolean(item)))
}

export function extractHBuilderXMacOSExecutables(output: string) {
  return unique(Array.from(
    output.matchAll(/(\/[^\r\n]*?HBuilderX(?:-Alpha|\s+Alpha)?\.app\/Contents\/MacOS\/HBuilderX)(?=\s|$)/gi),
    match => match[1],
  ))
}

export function extractHBuilderXWindowsExecutables(output: string) {
  const executables: string[] = []
  for (const line of output.split(/\r?\n/)) {
    const executable = line.split(',').at(-1)?.trim()
    if (executable?.toLowerCase().endsWith('hbuilderx.exe')) {
      executables.push(executable)
    }
  }
  return unique(executables)
}

export function extractHBuilderXExecutablesFromProcessOutput(output: string, platform: NodeJS.Platform = process.platform) {
  return platform === 'win32'
    ? extractHBuilderXWindowsExecutables(output)
    : extractHBuilderXMacOSExecutables(output)
}

export function extractHBuilderXMacOSExecutable(line: string) {
  return extractHBuilderXMacOSExecutables(line)[0]
}

export function extractHBuilderXWindowsExecutable(line: string) {
  return extractHBuilderXWindowsExecutables(line)[0]
}

export function extractHBuilderXExecutableFromProcessOutput(output: string, platform: NodeJS.Platform = process.platform) {
  return extractHBuilderXExecutablesFromProcessOutput(output, platform)[0]
}

export async function findRunningHBuilderXCliCandidates(platform: NodeJS.Platform = process.platform) {
  const result = platform === 'win32'
    ? spawnSync('wmic', ['process', 'where', 'name=\'HBuilderX.exe\'', 'get', 'executablepath', '/format:csv'], { encoding: 'utf8', windowsHide: true })
    : spawnSync('ps', ['-ax', '-o', 'command='], { encoding: 'utf8' })

  if (result.error || result.status !== 0) {
    return []
  }

  const executables = extractHBuilderXExecutablesFromProcessOutput(`${result.stdout ?? ''}${result.stderr ?? ''}`, platform)
  const candidates: string[] = []
  for (const executable of executables) {
    if (!(await fileExists(executable))) {
      continue
    }
    const cli = path.join(path.dirname(executable), platform === 'win32' ? 'cli.exe' : 'cli')
    if (await fileExists(cli)) {
      candidates.push(cli)
    }
  }
  return unique(candidates)
}

export async function findRunningHBuilderXCli(platform: NodeJS.Platform = process.platform) {
  return (await findRunningHBuilderXCliCandidates(platform))[0]
}

function sortByChannel(items: string[]) {
  const weights: Record<HBuilderXResolvedChannel, number> = {
    stable: 0,
    alpha: 1,
    unknown: 2,
  }
  return [...items].sort((left, right) => weights[inferHBuilderXChannel(left)] - weights[inferHBuilderXChannel(right)])
}

export function selectHBuilderXCliCandidatesForChannel(items: string[], channel: HBuilderXChannel) {
  if (channel === 'auto') {
    return sortByChannel(items)
  }
  return items.filter(item => inferHBuilderXChannel(item) === channel)
}

function resolveCandidateSource(candidate: string, env: NodeJS.ProcessEnv): HBuilderXCliResolutionSource {
  if (candidate === env.HBUILDERX_CLI_PATH) {
    return 'env'
  }
  if (candidate === macOSStableCli || candidate === macOSAlphaCli) {
    return 'default-path'
  }
  return 'candidate'
}

async function firstExisting(items: string[]) {
  for (const item of items) {
    if (await fileExists(item)) {
      return item
    }
  }
  return undefined
}

export async function resolveHBuilderXCliInfoFromOptions(options: HBuilderXCliResolveOptions = {}): Promise<HBuilderXCliResolution> {
  const env = options.env ?? process.env
  const channel = resolveHBuilderXChannel(options.channel ?? env.HBUILDERX_CHANNEL)
  const running = await findRunningHBuilderXCliCandidates()

  if (options.candidates) {
    const candidate = await firstExisting(options.candidates)
    if (candidate) {
      return {
        path: candidate,
        isRunning: running.some(item => normalizeFile(item) === normalizeFile(candidate)),
        source: resolveCandidateSource(candidate, env),
        channel: inferHBuilderXChannel(candidate),
      }
    }
    throw new Error('未找到显式指定的 HBuilderX CLI candidate。')
  }

  if (env.HBUILDERX_CLI_PATH && await fileExists(env.HBUILDERX_CLI_PATH)) {
    return {
      path: env.HBUILDERX_CLI_PATH,
      isRunning: running.some(item => normalizeFile(item) === normalizeFile(env.HBUILDERX_CLI_PATH!)),
      source: 'env',
      channel: inferHBuilderXChannel(env.HBUILDERX_CLI_PATH),
    }
  }

  const runningCandidate = selectHBuilderXCliCandidatesForChannel(running, channel)[0]
  if (runningCandidate) {
    return {
      path: runningCandidate,
      isRunning: true,
      source: 'running-process',
      channel: inferHBuilderXChannel(runningCandidate),
    }
  }

  const defaultCandidate = await firstExisting(getDefaultHBuilderXCliCandidates({}, channel))
  if (defaultCandidate) {
    return {
      path: defaultCandidate,
      isRunning: false,
      source: 'default-path',
      channel: inferHBuilderXChannel(defaultCandidate),
    }
  }

  throw new Error([
    `未找到 HBuilderX ${channel === 'auto' ? '' : `${channel} `}CLI。`,
    '请安装 HBuilderX，或设置 HBUILDERX_CLI_PATH=/path/to/cli。',
  ].join(''))
}
