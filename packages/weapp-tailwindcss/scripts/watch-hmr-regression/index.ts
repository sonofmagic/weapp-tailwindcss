import type { WatchCaseMetrics } from './types'
import process from 'node:process'
import { buildCases, pickCases } from './cases'
import { formatPath, resolveBaseCwd, resolveOptions } from './cli'
import { assertHotUpdateBudget, logSummary, runCase } from './runner'
import { ensureLocalPackageBuild } from './session'
import {
  summarizeMetrics,
  summarizeMetricsByGroup,
  summarizeMetricsByRound,
  summarizeMutationKindAcrossCases,
  writeReport,
} from './summary'

export async function main() {
  const options = resolveOptions()
  const baseCwd = resolveBaseCwd()
  process.stdout.write(`[watch-hmr] repository root: ${formatPath(baseCwd)}\n`)

  if (!options.skipBuild) {
    await ensureLocalPackageBuild(baseCwd)
  }

  const allCases = buildCases(baseCwd)
  const selected = pickCases(allCases, options.caseName)

  if (selected.length === 0) {
    throw new Error(`no watch case matched --case=${options.caseName}`)
  }

  process.stdout.write(`[watch-hmr] running cases: ${selected.map(item => item.label).join(', ')}\n`)

  const metrics: WatchCaseMetrics[] = []

  for (const watchCase of selected) {
    process.stdout.write(`[watch-hmr] start ${watchCase.label} (${watchCase.devScript})\n`)
    const result = await runCase(watchCase, options)
    assertHotUpdateBudget(result, options)
    metrics.push(result)
  }

  const summary = summarizeMetrics(metrics)
  const summaryByRound = summarizeMetricsByRound(metrics)
  const summaryByGroup = summarizeMetricsByGroup(metrics)
  const summaryByMutationKind = summarizeMutationKindAcrossCases(metrics)

  logSummary(summary, summaryByRound, summaryByGroup, summaryByMutationKind)
  await writeReport(baseCwd, options, metrics)

  if (metrics.length === 0) {
    throw new Error('no metrics collected')
  }

  process.stdout.write('[watch-hmr] all cases passed\n')
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  console.error(`[watch-hmr] failed\n${message}`)
  process.exitCode = 1
})

process.on('unhandledRejection', (reason) => {
  console.error('[watch-hmr] unhandled rejection:', reason)
  process.exitCode = 1
})

process.on('uncaughtException', (error) => {
  console.error('[watch-hmr] uncaught exception:', error)
  process.exitCode = 1
})
