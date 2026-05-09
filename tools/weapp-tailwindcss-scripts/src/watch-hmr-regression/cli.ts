import type { CliOptions } from './types'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function parseArg(flag: string, argv: string[]) {
  const index = argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }
  return argv[index + 1]
}

function parseNumber(value: string | undefined, fallback: number) {
  if (value == null) {
    return fallback
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function parseOptionalNumber(value: string | undefined) {
  if (value == null) {
    return undefined
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

function parseBooleanFlag(flag: string, argv: string[]) {
  return argv.includes(flag)
}

export function resolveOptions(): CliOptions {
  const argv = process.argv.slice(2)
  return {
    caseName: (parseArg('--case', argv) ?? 'all') as CliOptions['caseName'],
    timeoutMs: parseNumber(parseArg('--timeout', argv), 240000),
    pollMs: parseNumber(parseArg('--poll', argv), 240),
    skipBuild: parseBooleanFlag('--skip-build', argv),
    quietSass: parseBooleanFlag('--quiet-sass', argv),
    reportFile: parseArg('--report', argv),
    maxHotUpdateMs: parseOptionalNumber(parseArg('--max-hot-update-ms', argv)),
  }
}

export function resolvePnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

export function formatPath(file: string) {
  return path.relative(process.cwd(), file) || '.'
}

function findWorkspaceRoot(start: string) {
  let current = start
  while (true) {
    if (existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current
    }
    const parent = path.dirname(current)
    if (parent === current) {
      return start
    }
    current = parent
  }
}

export function resolveBaseCwd() {
  const start = process.env.INIT_CWD
    ? path.resolve(process.env.INIT_CWD)
    : process.cwd()
  return findWorkspaceRoot(start)
}
