import type { ChildProcess } from 'node:child_process'

export type HBuilderXMiniProgramPlatform = 'mp-weixin' | 'mp-alipay' | 'mp-baidu' | 'mp-toutiao'
export type HBuilderXAppPlatform = 'app-android' | 'app-ios' | 'app-harmony'
export type HBuilderXPlatform = HBuilderXMiniProgramPlatform | HBuilderXAppPlatform

export type HBuilderXIssueKind
  = | 'cli-not-found'
    | 'project-not-uni-app'
    | 'project-type-unsupported'
    | 'config-load-failed'
    | 'android-toolchain-missing'
    | 'ios-toolchain-missing'
    | 'harmony-toolchain-missing'
    | 'timeout'
    | 'process-exit'
    | 'unknown'

export interface HBuilderXIssue {
  kind: HBuilderXIssueKind
  message: string
  hint?: string
}

export interface CommandExit {
  code: number | null
  signal: NodeJS.Signals | null
}

export interface HBuilderXCommandOptions {
  command: string
  args: string[]
  cwd: string
  timeoutMs?: number
  env?: Record<string, string | undefined>
  allowFailure?: boolean
  detached?: boolean
  stdio?: 'pipe' | 'inherit'
}

export interface HBuilderXCommandResult {
  command: string
  args: string[]
  cwd: string
  exit: CommandExit
  logs: string[]
  output: string
  issue: HBuilderXIssue
}

export interface SpawnedHBuilderXCommand {
  child: ChildProcess
  logs: string[]
  command: string
  args: string[]
  cwd: string
  stop: (signal?: NodeJS.Signals) => Promise<void>
  closed: Promise<CommandExit>
  ensureRunning: () => void
}

export interface HBuilderXProjectOptions {
  cwd: string
  hbuilderxCliPath?: string
  env?: Record<string, string | undefined>
  timeoutMs?: number
  allowFailure?: boolean
}

export interface HBuilderXLaunchOptions extends HBuilderXProjectOptions {
  platform: HBuilderXPlatform
  args?: string[]
  compile?: boolean
  runtimeLog?: boolean
}

export interface ToolResult {
  ok: boolean
  output: string
  status: number | null
  signal: NodeJS.Signals | null
}

export interface AndroidToolchain {
  command: string
  output: string
  env: Record<string, string> | undefined
}

export type HBuilderXCliResolutionSource = 'running-process' | 'env' | 'default-path' | 'candidate'

export interface HBuilderXCliResolution {
  path: string
  isRunning: boolean
  source: HBuilderXCliResolutionSource
}
