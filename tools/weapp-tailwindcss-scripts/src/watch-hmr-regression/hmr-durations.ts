import type { HmrDurationReport, HmrDurationTiming, WatchCaseMetrics, WatchSummary } from './types'

interface DurationSummarySample {
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs: number
}

function summarizeDurationSamples(samples: DurationSummarySample[]): WatchSummary {
  const count = samples.length
  if (count === 0) {
    return {
      count,
      hotUpdateAvgMs: 0,
      hotUpdateMaxMs: 0,
      hotUpdateMinMs: 0,
      rollbackAvgMs: 0,
      rollbackMaxMs: 0,
      rollbackMinMs: 0,
    }
  }

  const hotUpdateDurations = samples.map(item => item.hotUpdateEffectiveMs)
  const rollbackDurations = samples.map(item => item.rollbackEffectiveMs)
  const hotUpdateSum = hotUpdateDurations.reduce((sum, value) => sum + value, 0)
  const rollbackSum = rollbackDurations.reduce((sum, value) => sum + value, 0)

  return {
    count,
    hotUpdateAvgMs: Math.round(hotUpdateSum / count),
    hotUpdateMaxMs: Math.max(...hotUpdateDurations),
    hotUpdateMinMs: Math.min(...hotUpdateDurations),
    rollbackAvgMs: Math.round(rollbackSum / count),
    rollbackMaxMs: Math.max(...rollbackDurations),
    rollbackMinMs: Math.min(...rollbackDurations),
  }
}

function pushTiming(timings: HmrDurationTiming[], timing: HmrDurationTiming) {
  timings.push({
    ...timing,
    hotUpdateEffectiveMs: Math.round(timing.hotUpdateEffectiveMs),
    rollbackEffectiveMs: typeof timing.rollbackEffectiveMs === 'number'
      ? Math.round(timing.rollbackEffectiveMs)
      : undefined,
    hotUpdatePluginProcessMs: typeof timing.hotUpdatePluginProcessMs === 'number'
      ? Math.round(timing.hotUpdatePluginProcessMs)
      : undefined,
  })
}

export function collectCaseDurationTimings(item: WatchCaseMetrics) {
  const timings: HmrDurationTiming[] = []

  pushTiming(timings, {
    surface: 'template:preferred-round',
    sourceFile: item.mutationMetrics.find(mutation => mutation.mutationKind === 'template')?.sourceFile,
    hotUpdateEffectiveMs: item.hotUpdateEffectiveMs,
    rollbackEffectiveMs: item.rollbackEffectiveMs,
    hotUpdatePluginProcessMs: item.hotUpdatePluginProcessMs,
  })

  for (const mutation of item.mutationMetrics) {
    if ('rounds' in mutation && Array.isArray(mutation.rounds)) {
      for (const round of mutation.rounds) {
        pushTiming(timings, {
          surface: `${mutation.mutationKind}:${round.roundName}`,
          sourceFile: mutation.sourceFile,
          hotUpdateEffectiveMs: round.hotUpdateEffectiveMs,
          rollbackEffectiveMs: round.rollbackEffectiveMs,
          hotUpdatePluginProcessMs: round.hotUpdatePluginProcessMs,
        })
      }
    }
    else {
      pushTiming(timings, {
        surface: mutation.mutationKind,
        sourceFile: mutation.sourceFile,
        hotUpdateEffectiveMs: mutation.hotUpdateEffectiveMs,
        rollbackEffectiveMs: mutation.rollbackEffectiveMs,
        hotUpdatePluginProcessMs: mutation.hotUpdatePluginProcessMs,
      })
    }

    if ('addedClassHmr' in mutation && mutation.addedClassHmr) {
      pushTiming(timings, {
        surface: `${mutation.mutationKind}:added-class`,
        sourceFile: mutation.sourceFile,
        hotUpdateEffectiveMs: mutation.addedClassHmr.hotUpdateEffectiveMs,
        rollbackEffectiveMs: mutation.addedClassHmr.rollbackEffectiveMs,
        hotUpdatePluginProcessMs: mutation.addedClassHmr.hotUpdatePluginProcessMs,
      })
    }
    if ('sameClassLiteralHmr' in mutation && mutation.sameClassLiteralHmr) {
      pushTiming(timings, {
        surface: `${mutation.mutationKind}:same-class-literal`,
        sourceFile: mutation.sourceFile,
        hotUpdateEffectiveMs: mutation.sameClassLiteralHmr.hotUpdateEffectiveMs,
        rollbackEffectiveMs: mutation.sameClassLiteralHmr.rollbackEffectiveMs,
        hotUpdatePluginProcessMs: mutation.sameClassLiteralHmr.hotUpdatePluginProcessMs,
      })
    }
    if ('commentCarrierHmr' in mutation && mutation.commentCarrierHmr) {
      pushTiming(timings, {
        surface: `${mutation.mutationKind}:comment-carrier`,
        sourceFile: mutation.sourceFile,
        hotUpdateEffectiveMs: mutation.commentCarrierHmr.hotUpdateEffectiveMs,
        rollbackEffectiveMs: mutation.commentCarrierHmr.rollbackEffectiveMs,
        hotUpdatePluginProcessMs: mutation.commentCarrierHmr.hotUpdatePluginProcessMs,
      })
    }
  }

  if (item.userReportedHotUpdate) {
    pushTiming(timings, {
      surface: `user-reported:${item.userReportedHotUpdate.label}`,
      sourceFile: item.userReportedHotUpdate.sourceFile,
      hotUpdateEffectiveMs: item.userReportedHotUpdate.hotUpdateEffectiveMs,
      rollbackEffectiveMs: item.userReportedHotUpdate.rollbackEffectiveMs,
      hotUpdatePluginProcessMs: item.userReportedHotUpdate.hotUpdatePluginProcessMs,
    })
  }

  if (item.mainStyleHotUpdate) {
    pushTiming(timings, {
      surface: `main-style:${item.mainStyleHotUpdate.label}`,
      sourceFile: item.mainStyleHotUpdate.sourceFile,
      hotUpdateEffectiveMs: item.mainStyleHotUpdate.hotUpdateEffectiveMs,
      rollbackEffectiveMs: item.mainStyleHotUpdate.rollbackEffectiveMs,
      hotUpdatePluginProcessMs: item.mainStyleHotUpdate.hotUpdatePluginProcessMs,
    })
  }

  if (item.webHmr) {
    pushTiming(timings, {
      surface: 'web',
      sourceFile: item.webHmr.sourceFile,
      hotUpdateEffectiveMs: item.webHmr.hotUpdateEffectiveMs,
      rollbackEffectiveMs: item.webHmr.rollbackEffectiveMs,
      hotUpdatePluginProcessMs: item.webHmr.hotUpdatePluginProcessMs,
    })
    for (const sequence of item.webHmr.sourceClassReplacementSequence ?? []) {
      pushTiming(timings, {
        surface: `web:source-class:${sequence.label}`,
        sourceFile: item.webHmr.sourceFile,
        hotUpdateEffectiveMs: sequence.hotUpdateEffectiveMs,
      })
    }
    for (const sequence of item.webHmr.sourceDomReplacementSequence ?? []) {
      pushTiming(timings, {
        surface: `web:source-dom:${sequence.label}`,
        sourceFile: item.webHmr.sourceFile,
        hotUpdateEffectiveMs: sequence.hotUpdateEffectiveMs,
      })
    }
  }

  for (const subPackage of item.subPackageMainStyleHotUpdates ?? []) {
    pushTiming(timings, {
      surface: `subpackage:${subPackage.root}:main-style:${subPackage.mainStyleHotUpdate.label}`,
      sourceFile: subPackage.mainStyleHotUpdate.sourceFile,
      hotUpdateEffectiveMs: subPackage.mainStyleHotUpdate.hotUpdateEffectiveMs,
      rollbackEffectiveMs: subPackage.mainStyleHotUpdate.rollbackEffectiveMs,
      hotUpdatePluginProcessMs: subPackage.mainStyleHotUpdate.hotUpdatePluginProcessMs,
    })
  }

  for (const subPackage of item.subPackageMutationMetrics) {
    pushTiming(timings, {
      surface: `subpackage:${subPackage.root}:main-style:${subPackage.mainStyleHotUpdate.label}`,
      sourceFile: subPackage.mainStyleHotUpdate.sourceFile,
      hotUpdateEffectiveMs: subPackage.mainStyleHotUpdate.hotUpdateEffectiveMs,
      rollbackEffectiveMs: subPackage.mainStyleHotUpdate.rollbackEffectiveMs,
      hotUpdatePluginProcessMs: subPackage.mainStyleHotUpdate.hotUpdatePluginProcessMs,
    })
    pushTiming(timings, {
      surface: `subpackage:${subPackage.root}:template`,
      sourceFile: subPackage.template.sourceFile,
      hotUpdateEffectiveMs: subPackage.template.hotUpdateEffectiveMs,
      rollbackEffectiveMs: subPackage.template.rollbackEffectiveMs,
      hotUpdatePluginProcessMs: subPackage.template.hotUpdatePluginProcessMs,
    })
    if (subPackage.style) {
      pushTiming(timings, {
        surface: `subpackage:${subPackage.root}:style`,
        sourceFile: subPackage.style.sourceFile,
        hotUpdateEffectiveMs: subPackage.style.hotUpdateEffectiveMs,
        rollbackEffectiveMs: subPackage.style.rollbackEffectiveMs,
        hotUpdatePluginProcessMs: subPackage.style.hotUpdatePluginProcessMs,
      })
    }
  }

  return timings
}

export function summarizeHmrDurations(cases: WatchCaseMetrics[]): HmrDurationReport {
  const byProject = Object.fromEntries(
    cases.map((item) => {
      const timings = collectCaseDurationTimings(item)
      return [item.project, {
        name: item.name,
        label: item.label,
        project: item.project,
        projectGroup: item.projectGroup,
        initialReadyMs: Math.round(item.initialReadyMs),
        totalMs: Math.round(item.totalMs),
        timings,
      }]
    }),
  )

  const groupedSamples = new Map<string, DurationSummarySample[]>()
  for (const item of Object.values(byProject)) {
    for (const timing of item.timings) {
      const samples = groupedSamples.get(timing.surface) ?? []
      samples.push({
        hotUpdateEffectiveMs: timing.hotUpdateEffectiveMs,
        rollbackEffectiveMs: timing.rollbackEffectiveMs ?? 0,
      })
      groupedSamples.set(timing.surface, samples)
    }
  }

  const summaryBySurface = Object.fromEntries(
    [...groupedSamples.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([surface, samples]) => [surface, summarizeDurationSamples(samples)]),
  )

  return {
    summaryBySurface,
    byProject,
  }
}
