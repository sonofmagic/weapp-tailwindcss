import type {
  CliOptions,
  MutationKind,
  MutationRoundName,
  WatchCase,
  WatchCaseMetrics,
  WatchCaseMutationMetrics,
  WatchProjectGroup,
  WatchSummary,
} from './types'
import { promises as fs } from 'node:fs'
import process from 'node:process'
import {
  resolveOutputFiles,
  runClassMutation,
  runStyleMutation,
  waitForInitialWarmup,
  waitForOutputsReady,
} from './mutations'
import { resolvePreferredRound } from './mutations/shared'
import { createWatchSession, sleep } from './session'
import { summarizeMutationMetricsByKind } from './summary'
import { writeFilePreserveEol } from './text'

function resolveCaseSourceFiles(watchCase: WatchCase) {
  return [...new Set([
    watchCase.contentMutation?.sourceFile,
    watchCase.templateMutation.sourceFile,
    watchCase.scriptMutation.sourceFile,
    watchCase.styleMutation.sourceFile,
  ].filter((item): item is string => Boolean(item)))]
}

export async function runCase(watchCase: WatchCase, options: CliOptions): Promise<WatchCaseMetrics> {
  const caseStartedAt = Date.now()
  const sourceFiles = resolveCaseSourceFiles(watchCase)
  const sourceOriginals = new Map<string, string>()

  for (const sourceFile of sourceFiles) {
    sourceOriginals.set(sourceFile, await fs.readFile(sourceFile, 'utf8'))
  }

  const sessionStartedAt = Date.now()
  const session = createWatchSession(watchCase.cwd, watchCase.devScript, {
    quietSass: options.quietSass,
  }, watchCase.env)

  try {
    const outputsReadyMs = await waitForOutputsReady(watchCase, options, session)
    const warmupMs = await waitForInitialWarmup(watchCase, options, session, sessionStartedAt)
    const initialReadyMs = Math.max(outputsReadyMs, warmupMs)

    if ((watchCase.initialMutationDelayMs ?? 0) > 0) {
      process.stdout.write(
        `[watch-hmr] ${watchCase.label} extra startup settle ${watchCase.initialMutationDelayMs}ms\n`,
      )
      await sleep(watchCase.initialMutationDelayMs!)
      session.ensureRunning()
    }

    const styleOutputCandidates = [...new Set([
      ...watchCase.outputStyleCandidates,
      ...watchCase.globalStyleCandidates,
    ])]

    const globalStyleOutputs = await resolveOutputFiles(
      watchCase,
      styleOutputCandidates,
      'global style',
      options,
      session,
    )

    const templateSourceOriginal = sourceOriginals.get(watchCase.templateMutation.sourceFile)
    if (templateSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing template mutation source original`)
    }

    const scriptSourceOriginal = sourceOriginals.get(watchCase.scriptMutation.sourceFile)
    if (scriptSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing script mutation source original`)
    }

    const styleSourceOriginal = sourceOriginals.get(watchCase.styleMutation.sourceFile)
    if (styleSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing style mutation source original`)
    }

    let contentMetrics: WatchCaseMutationMetrics | undefined
    if (watchCase.contentMutation) {
      const contentSourceOriginal = sourceOriginals.get(watchCase.contentMutation.sourceFile)
      if (contentSourceOriginal == null) {
        throw new Error(`[${watchCase.label}] missing content mutation source original`)
      }

      contentMetrics = await runClassMutation(
        watchCase,
        options,
        session,
        'content',
        watchCase.contentMutation,
        contentSourceOriginal,
        globalStyleOutputs,
      )
    }

    const templateMetrics = await runClassMutation(
      watchCase,
      options,
      session,
      'template',
      watchCase.templateMutation,
      templateSourceOriginal,
      globalStyleOutputs,
    )

    const scriptMetrics = await runClassMutation(
      watchCase,
      options,
      session,
      'script',
      watchCase.scriptMutation,
      scriptSourceOriginal,
      globalStyleOutputs,
    )

    const styleMetrics = await runStyleMutation(
      watchCase,
      options,
      session,
      watchCase.styleMutation,
      styleSourceOriginal,
      watchCase.outputStyleCandidates,
    )

    const preferredRound = resolvePreferredRound(templateMetrics.rounds)
    if (!preferredRound) {
      throw new Error(`[${watchCase.label}] no preferred round produced for template mutation`)
    }

    const mutationMetrics: WatchCaseMutationMetrics[] = [
      ...(contentMetrics ? [contentMetrics] : []),
      templateMetrics,
      scriptMetrics,
      styleMetrics,
    ]

    const metrics: WatchCaseMetrics = {
      name: watchCase.name,
      label: watchCase.label,
      project: watchCase.project,
      projectGroup: watchCase.group,
      marker: preferredRound.marker,
      classLiteral: preferredRound.classLiteral,
      classTokens: preferredRound.classTokens,
      escapedClasses: preferredRound.escapedClasses,
      rounds: templateMetrics.rounds,
      roundComparison: templateMetrics.roundComparison,
      verifyEscapedIn: templateMetrics.verifyEscapedIn,
      verifyClassLiteralIn: templateMetrics.verifyClassLiteralIn,
      globalStyleOutputs,
      mutationMetrics,
      summaryByMutationKind: summarizeMutationMetricsByKind(mutationMetrics),
      initialReadyMs,
      hotUpdateOutputMs: preferredRound.hotUpdateOutputMs,
      hotUpdateEffectiveMs: preferredRound.hotUpdateEffectiveMs,
      rollbackOutputMs: preferredRound.rollbackOutputMs,
      rollbackEffectiveMs: preferredRound.rollbackEffectiveMs,
      totalMs: Date.now() - caseStartedAt,
    }

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} passed (${contentMetrics ? `content=${contentMetrics.hotUpdateEffectiveMs}ms, ` : ''}template=${templateMetrics.hotUpdateEffectiveMs}ms, script=${scriptMetrics.hotUpdateEffectiveMs}ms, style=${styleMetrics.hotUpdateEffectiveMs}ms)\n`,
    )

    return metrics
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const logs = session.logs()
    throw new Error(`${message}\n[${watchCase.label}] recent watch logs:\n${logs}`)
  }
  finally {
    for (const [sourcePath, original] of sourceOriginals.entries()) {
      try {
        await writeFilePreserveEol(sourcePath, original, original)
      }
      catch {
      }
    }
    await session.stop()
  }
}

export function assertHotUpdateBudget(metrics: WatchCaseMetrics, options: CliOptions) {
  if (options.maxHotUpdateMs == null) {
    return
  }

  if (metrics.hotUpdateEffectiveMs > options.maxHotUpdateMs) {
    throw new Error(
      `[${metrics.label}] hot update exceeded budget: ${metrics.hotUpdateEffectiveMs}ms > ${options.maxHotUpdateMs}ms`,
    )
  }

  for (const mutation of metrics.mutationMetrics) {
    if (mutation.mutationKind === 'style') {
      if (mutation.hotUpdateEffectiveMs > options.maxHotUpdateMs) {
        throw new Error(
          `[${metrics.label}] style hot update exceeded budget: ${mutation.hotUpdateEffectiveMs}ms > ${options.maxHotUpdateMs}ms`,
        )
      }
      continue
    }

    const preferredRound = resolvePreferredRound(mutation.rounds)
    if (preferredRound && preferredRound.hotUpdateEffectiveMs > options.maxHotUpdateMs) {
      throw new Error(
        `[${metrics.label}] ${mutation.mutationKind} hot update exceeded budget: ${preferredRound.hotUpdateEffectiveMs}ms > ${options.maxHotUpdateMs}ms`,
      )
    }
  }
}

export function logSummary(
  summary: WatchSummary,
  summaryByRound: Partial<Record<MutationRoundName, WatchSummary>>,
  summaryByGroup: Partial<Record<WatchProjectGroup, WatchSummary>>,
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>,
) {
  process.stdout.write(
    `[watch-hmr] summary: cases=${summary.count}, hotUpdate(avg/min/max)=${summary.hotUpdateAvgMs}/${summary.hotUpdateMinMs}/${summary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${summary.rollbackAvgMs}/${summary.rollbackMinMs}/${summary.rollbackMaxMs}ms\n`,
  )

  for (const [roundName, roundSummary] of Object.entries(summaryByRound)) {
    if (!roundSummary) {
      continue
    }
    process.stdout.write(
      `[watch-hmr] round ${roundName}: cases=${roundSummary.count}, hotUpdate(avg/min/max)=${roundSummary.hotUpdateAvgMs}/${roundSummary.hotUpdateMinMs}/${roundSummary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${roundSummary.rollbackAvgMs}/${roundSummary.rollbackMinMs}/${roundSummary.rollbackMaxMs}ms\n`,
    )
  }

  for (const [groupName, groupSummary] of Object.entries(summaryByGroup)) {
    if (!groupSummary) {
      continue
    }
    process.stdout.write(
      `[watch-hmr] group ${groupName}: cases=${groupSummary.count}, hotUpdate(avg/min/max)=${groupSummary.hotUpdateAvgMs}/${groupSummary.hotUpdateMinMs}/${groupSummary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${groupSummary.rollbackAvgMs}/${groupSummary.rollbackMinMs}/${groupSummary.rollbackMaxMs}ms\n`,
    )
  }

  for (const [kindName, kindSummary] of Object.entries(summaryByMutationKind)) {
    if (!kindSummary) {
      continue
    }
    process.stdout.write(
      `[watch-hmr] mutation ${kindName}: cases=${kindSummary.count}, hotUpdate(avg/min/max)=${kindSummary.hotUpdateAvgMs}/${kindSummary.hotUpdateMinMs}/${kindSummary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${kindSummary.rollbackAvgMs}/${kindSummary.rollbackMinMs}/${kindSummary.rollbackMaxMs}ms\n`,
    )
  }
}
