import type {
  ClassMutationMetrics,
  CliOptions,
  MutationKind,
  MutationRoundName,
  StyleMutationMetrics,
  WatchCase,
  WatchCaseMetrics,
  WatchCaseMutationMetrics,
  WatchProjectGroup,
  WatchSummary,
} from './types'
import { promises as fs } from 'node:fs'
import process from 'node:process'
import {
  runClassMutation,
  runStyleMutation,
  runSubPackageMutation,
  runUserReportedHotUpdate,
  waitForInitialWarmup,
  waitForOutputsReady,
} from './mutations'
import { resolvePreferredRound } from './mutations/shared'
import { createWatchSession, runPnpmCommand, sleep } from './session'
import { summarizeMutationMetricsByKind } from './summary'
import { writeFilePreserveEol } from './text'
import { runWebHmr } from './web'

interface HotUpdateBudgetSample {
  label: string
  hotUpdateEffectiveMs: number
}

interface PluginProcessBudgetSample {
  label: string
  pluginProcessMs: number
}

function resolveCaseSourceFiles(watchCase: WatchCase) {
  return [...new Set([
    watchCase.contentMutation?.sourceFile,
    watchCase.userReportedHotUpdate?.sourceFile,
    watchCase.templateMutation.sourceFile,
    watchCase.scriptMutation.sourceFile,
    watchCase.skipStyleMutation ? undefined : watchCase.styleMutation.sourceFile,
    ...(watchCase.subPackageMutations ?? []).flatMap(mutation => [
      mutation.templateMutation.sourceFile,
      mutation.skipStyleMutation ? undefined : mutation.styleMutation.sourceFile,
    ]),
    watchCase.webHmr?.sourceFile,
    watchCase.webHmr?.cssEntryFile,
  ].filter((item): item is string => Boolean(item)))]
}

export async function runCase(watchCase: WatchCase, options: CliOptions): Promise<WatchCaseMetrics> {
  const caseStartedAt = Date.now()
  const sourceFiles = resolveCaseSourceFiles(watchCase)
  const sourceOriginals = new Map<string, string>()

  for (const sourceFile of sourceFiles) {
    sourceOriginals.set(sourceFile, await fs.readFile(sourceFile, 'utf8'))
  }

  if (watchCase.initialBuildScript) {
    process.stdout.write(`[watch-hmr] ${watchCase.label} prepare initial build (${watchCase.initialBuildScript})\n`)
    await runPnpmCommand(watchCase.cwd, ['run', watchCase.initialBuildScript], 'prebuild')
  }

  const sessionStartedAt = Date.now()
  const session = createWatchSession(watchCase.cwd, watchCase.devScript, {
    quietSass: options.quietSass,
  }, watchCase.env)
  let sessionStopped = false

  try {
    const outputsReadyMs = await waitForOutputsReady(watchCase, options, session, sessionStartedAt)
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

    const globalStyleOutputs = styleOutputCandidates

    const templateSourceOriginal = sourceOriginals.get(watchCase.templateMutation.sourceFile)
    if (templateSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing template mutation source original`)
    }

    const scriptSourceOriginal = sourceOriginals.get(watchCase.scriptMutation.sourceFile)
    if (scriptSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing script mutation source original`)
    }

    const styleSourceOriginal = watchCase.skipStyleMutation
      ? undefined
      : sourceOriginals.get(watchCase.styleMutation.sourceFile)
    if (!watchCase.skipStyleMutation && styleSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing style mutation source original`)
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

    const styleMetrics = watchCase.skipStyleMutation
      ? undefined
      : await runStyleMutation(
          watchCase,
          options,
          session,
          watchCase.styleMutation,
          styleSourceOriginal!,
          watchCase.outputStyleCandidates,
        )

    let contentMetrics: WatchCaseMutationMetrics | undefined
    if (watchCase.contentMutation) {
      const contentSourceOriginal = sourceOriginals.get(watchCase.contentMutation.sourceFile)
      if (contentSourceOriginal == null) {
        throw new Error(`[${watchCase.label}] missing content mutation source original`)
      }

      // content mutation 替换既有字面量，依赖构建器 watch 与 runtime class set 已经稳定。
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

    let userReportedHotUpdateMetrics
    if (watchCase.userReportedHotUpdate) {
      const userReportedSourceOriginal = sourceOriginals.get(watchCase.userReportedHotUpdate.sourceFile)
      if (userReportedSourceOriginal == null) {
        throw new Error(`[${watchCase.label}] missing user reported hot-update source original`)
      }

      userReportedHotUpdateMetrics = await runUserReportedHotUpdate(
        watchCase,
        options,
        session,
        watchCase.userReportedHotUpdate,
        userReportedSourceOriginal,
        globalStyleOutputs,
      )
    }

    const subPackageMutationMetrics = []
    for (const subPackageMutation of watchCase.subPackageMutations ?? []) {
      subPackageMutationMetrics.push(await runSubPackageMutation(
        watchCase,
        options,
        session,
        subPackageMutation,
        sourceOriginals,
      ))
    }

    if (watchCase.webHmr) {
      await session.stop()
      sessionStopped = true
    }
    const webHmrMetrics = await runWebHmr(watchCase, options, sourceOriginals)

    const preferredRound = resolvePreferredRound(templateMetrics.rounds)
    if (!preferredRound) {
      throw new Error(`[${watchCase.label}] no preferred round produced for template mutation`)
    }

    const mutationMetrics: WatchCaseMutationMetrics[] = [
      templateMetrics,
      scriptMetrics,
      ...(styleMetrics ? [styleMetrics] : []),
      ...(contentMetrics ? [contentMetrics] : []),
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
      ...(userReportedHotUpdateMetrics ? { userReportedHotUpdate: userReportedHotUpdateMetrics } : {}),
      ...(webHmrMetrics ? { webHmr: webHmrMetrics } : {}),
      subPackageMutationMetrics,
      summaryByMutationKind: summarizeMutationMetricsByKind(mutationMetrics),
      initialReadyMs,
      maxPluginProcessMs: watchCase.maxPluginProcessMs,
      hotUpdateOutputMs: preferredRound.hotUpdateOutputMs,
      hotUpdateEffectiveMs: preferredRound.hotUpdateEffectiveMs,
      hotUpdatePluginProcessMs: preferredRound.hotUpdatePluginProcessMs,
      hotUpdatePluginProcessSamples: preferredRound.hotUpdatePluginProcessSamples,
      rollbackOutputMs: preferredRound.rollbackOutputMs,
      rollbackEffectiveMs: preferredRound.rollbackEffectiveMs,
      rollbackPluginProcessMs: preferredRound.rollbackPluginProcessMs,
      rollbackPluginProcessSamples: preferredRound.rollbackPluginProcessSamples,
      totalMs: Date.now() - caseStartedAt,
    }

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} passed (${contentMetrics ? `content=${contentMetrics.hotUpdateEffectiveMs}ms, ` : ''}template=${templateMetrics.hotUpdateEffectiveMs}ms, script=${scriptMetrics.hotUpdateEffectiveMs}ms${styleMetrics ? `, style=${styleMetrics.hotUpdateEffectiveMs}ms` : ''}${webHmrMetrics ? `, web=${webHmrMetrics.hotUpdateEffectiveMs}ms` : ''}, subpackage=${subPackageMutationMetrics.length})\n`,
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
    if (!sessionStopped) {
      await session.stop()
    }
  }
}

export function assertHotUpdateBudget(metrics: WatchCaseMetrics, options: CliOptions) {
  if (options.maxHotUpdateMs == null) {
    return
  }

  for (const sample of collectHotUpdateBudgetSamples(metrics)) {
    if (sample.hotUpdateEffectiveMs > options.maxHotUpdateMs) {
      throw new Error(
        `[${metrics.label}] ${sample.label} hot update exceeded budget: ${sample.hotUpdateEffectiveMs}ms > ${options.maxHotUpdateMs}ms`,
      )
    }
  }
}

export function assertPluginProcessBudget(metrics: WatchCaseMetrics, options: CliOptions) {
  const maxPluginProcessMs = metrics.maxPluginProcessMs ?? options.maxPluginProcessMs
  if (maxPluginProcessMs == null) {
    return
  }

  const samples = collectPluginProcessBudgetSamples(metrics)
  if (samples.length === 0) {
    throw new Error(`[${metrics.label}] no weapp-tailwindcss processing samples were collected`)
  }

  for (const sample of samples) {
    if (sample.pluginProcessMs > maxPluginProcessMs) {
      throw new Error(
        `[${metrics.label}] ${sample.label} weapp-tailwindcss processing exceeded budget: ${sample.pluginProcessMs}ms > ${maxPluginProcessMs}ms`,
      )
    }
  }
}

function collectClassMutationBudgetSamples(
  mutation: ClassMutationMetrics,
): HotUpdateBudgetSample[] {
  const samples: HotUpdateBudgetSample[] = mutation.rounds.map(round => ({
    label: `${mutation.mutationKind}:${round.roundName}`,
    hotUpdateEffectiveMs: round.hotUpdateEffectiveMs,
  }))

  if (mutation.addedClassHmr) {
    samples.push({
      label: `${mutation.mutationKind}:added-class`,
      hotUpdateEffectiveMs: mutation.addedClassHmr.hotUpdateEffectiveMs,
    })
  }
  if (mutation.sameClassLiteralHmr) {
    samples.push({
      label: `${mutation.mutationKind}:same-class-literal`,
      hotUpdateEffectiveMs: mutation.sameClassLiteralHmr.hotUpdateEffectiveMs,
    })
  }
  if (mutation.commentCarrierHmr) {
    samples.push({
      label: `${mutation.mutationKind}:comment-carrier`,
      hotUpdateEffectiveMs: mutation.commentCarrierHmr.hotUpdateEffectiveMs,
    })
  }

  return samples
}

function collectClassMutationPluginProcessBudgetSamples(
  mutation: ClassMutationMetrics,
): PluginProcessBudgetSample[] {
  const samples: PluginProcessBudgetSample[] = mutation.rounds.flatMap(round => [
    {
      label: `${mutation.mutationKind}:${round.roundName}:hot-update`,
      pluginProcessMs: round.hotUpdatePluginProcessMs,
    },
    {
      label: `${mutation.mutationKind}:${round.roundName}:rollback`,
      pluginProcessMs: round.rollbackPluginProcessMs,
    },
  ])

  if (mutation.addedClassHmr) {
    samples.push(
      {
        label: `${mutation.mutationKind}:added-class:hot-update`,
        pluginProcessMs: mutation.addedClassHmr.hotUpdatePluginProcessMs,
      },
      {
        label: `${mutation.mutationKind}:added-class:rollback`,
        pluginProcessMs: mutation.addedClassHmr.rollbackPluginProcessMs,
      },
    )
  }
  if (mutation.sameClassLiteralHmr) {
    samples.push(
      {
        label: `${mutation.mutationKind}:same-class-literal:hot-update`,
        pluginProcessMs: mutation.sameClassLiteralHmr.hotUpdatePluginProcessMs,
      },
      {
        label: `${mutation.mutationKind}:same-class-literal:rollback`,
        pluginProcessMs: mutation.sameClassLiteralHmr.rollbackPluginProcessMs,
      },
    )
  }
  if (mutation.commentCarrierHmr) {
    samples.push(
      {
        label: `${mutation.mutationKind}:comment-carrier:hot-update`,
        pluginProcessMs: mutation.commentCarrierHmr.hotUpdatePluginProcessMs,
      },
      {
        label: `${mutation.mutationKind}:comment-carrier:rollback`,
        pluginProcessMs: mutation.commentCarrierHmr.rollbackPluginProcessMs,
      },
    )
  }

  return samples
}

function collectStyleMutationPluginProcessBudgetSamples(
  mutation: StyleMutationMetrics,
): PluginProcessBudgetSample[] {
  return [
    {
      label: `${mutation.mutationKind}:hot-update`,
      pluginProcessMs: mutation.hotUpdatePluginProcessMs,
    },
    {
      label: `${mutation.mutationKind}:rollback`,
      pluginProcessMs: mutation.rollbackPluginProcessMs,
    },
  ]
}

function collectPluginProcessBudgetSamples(metrics: WatchCaseMetrics): PluginProcessBudgetSample[] {
  const samples: PluginProcessBudgetSample[] = [{
    label: 'case-template-preferred:hot-update',
    pluginProcessMs: metrics.hotUpdatePluginProcessMs,
  }]

  for (const mutation of metrics.mutationMetrics) {
    if (mutation.mutationKind === 'style') {
      samples.push(...collectStyleMutationPluginProcessBudgetSamples(mutation))
      continue
    }
    samples.push(...collectClassMutationPluginProcessBudgetSamples(mutation))
  }

  if (metrics.userReportedHotUpdate) {
    samples.push(
      {
        label: `user-reported:${metrics.userReportedHotUpdate.label}:hot-update`,
        pluginProcessMs: metrics.userReportedHotUpdate.hotUpdatePluginProcessMs,
      },
      {
        label: `user-reported:${metrics.userReportedHotUpdate.label}:rollback`,
        pluginProcessMs: metrics.userReportedHotUpdate.rollbackPluginProcessMs,
      },
    )
  }

  for (const subPackage of metrics.subPackageMutationMetrics) {
    samples.push(
      ...collectClassMutationPluginProcessBudgetSamples(subPackage.template).map(sample => ({
        ...sample,
        label: `subpackage:${subPackage.root}:${sample.label}`,
      })),
    )
    if (subPackage.style) {
      samples.push(
        ...collectStyleMutationPluginProcessBudgetSamples(subPackage.style).map(sample => ({
          ...sample,
          label: `subpackage:${subPackage.root}:${sample.label}`,
        })),
      )
    }
  }

  return samples
}

function collectStyleMutationBudgetSample(
  mutation: StyleMutationMetrics,
): HotUpdateBudgetSample {
  return {
    label: mutation.mutationKind,
    hotUpdateEffectiveMs: mutation.hotUpdateEffectiveMs,
  }
}

function collectHotUpdateBudgetSamples(metrics: WatchCaseMetrics): HotUpdateBudgetSample[] {
  const samples: HotUpdateBudgetSample[] = [{
    label: 'case-template-preferred',
    hotUpdateEffectiveMs: metrics.hotUpdateEffectiveMs,
  }]

  for (const mutation of metrics.mutationMetrics) {
    if (mutation.mutationKind === 'style') {
      samples.push(collectStyleMutationBudgetSample(mutation))
      continue
    }
    samples.push(...collectClassMutationBudgetSamples(mutation))
  }

  if (metrics.userReportedHotUpdate) {
    samples.push({
      label: `user-reported:${metrics.userReportedHotUpdate.label}`,
      hotUpdateEffectiveMs: metrics.userReportedHotUpdate.hotUpdateEffectiveMs,
    })
  }

  for (const subPackage of metrics.subPackageMutationMetrics) {
    samples.push(
      ...collectClassMutationBudgetSamples(subPackage.template).map(sample => ({
        ...sample,
        label: `subpackage:${subPackage.root}:${sample.label}`,
      })),
    )
    if (subPackage.style) {
      const sample = collectStyleMutationBudgetSample(subPackage.style)
      samples.push({
        ...sample,
        label: `subpackage:${subPackage.root}:${sample.label}`,
      })
    }
  }

  return samples
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
