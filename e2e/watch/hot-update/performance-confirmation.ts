import fs from 'node:fs/promises'
import path from 'node:path'

const PERFORMANCE_BUDGET_RE = /^(?:Error:\s*)?\[([^\]]+)\] (.+?) (hot update|weapp-tailwindcss processing|memory RSS peak|memory RSS delta|heap used) exceeded budget:/m
const FAILURE_LOG_SUFFIX = '-watch-hmr-runner-failure.log'

export interface PerformanceBudgetFailure {
  key: string
  label: string
}

export type PerformanceBudgetConfirmationDecision
  = | { action: 'none' }
    | { action: 'retry', failure: PerformanceBudgetFailure }
    | { action: 'confirmed', failure: PerformanceBudgetFailure }
    | { action: 'inconclusive', expected: PerformanceBudgetFailure, actual?: PerformanceBudgetFailure }

export function parsePerformanceBudgetFailure(message: string): PerformanceBudgetFailure | undefined {
  const matched = message.match(PERFORMANCE_BUDGET_RE)
  if (!matched) {
    return undefined
  }

  const [, project, sample, budget] = matched
  const label = `${project}: ${sample} ${budget}`
  return {
    key: `${project}\0${sample}\0${budget}`,
    label,
  }
}

export function resolvePerformanceBudgetConfirmation(
  enabled: boolean,
  expected: PerformanceBudgetFailure | undefined,
  actual: PerformanceBudgetFailure | undefined,
): PerformanceBudgetConfirmationDecision {
  if (!expected) {
    return enabled && actual
      ? { action: 'retry', failure: actual }
      : { action: 'none' }
  }

  if (actual?.key === expected.key) {
    return { action: 'confirmed', failure: actual }
  }

  return { action: 'inconclusive', expected, actual }
}

export async function listWatchHmrFailureLogs(cwd: string) {
  const failuresDir = path.resolve(cwd, 'benchmark/e2e-watch-hmr/failures')
  const entries = await fs.readdir(failuresDir, { withFileTypes: true }).catch(() => [])
  return new Set(entries
    .filter(entry => entry.isFile() && entry.name.endsWith(FAILURE_LOG_SUFFIX))
    .map(entry => entry.name))
}

export async function readNewPerformanceBudgetFailure(cwd: string, previousLogs: Set<string>) {
  const failuresDir = path.resolve(cwd, 'benchmark/e2e-watch-hmr/failures')
  const currentLogs = await listWatchHmrFailureLogs(cwd)
  const newLogs = [...currentLogs].filter(file => !previousLogs.has(file)).sort().reverse()

  for (const file of newLogs) {
    const content = await fs.readFile(path.join(failuresDir, file), 'utf8').catch(() => '')
    const failure = parsePerformanceBudgetFailure(content)
    if (failure) {
      return failure
    }
  }

  return undefined
}
