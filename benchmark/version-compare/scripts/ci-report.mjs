function toNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function pct(from, to) {
  return typeof from === 'number' && from !== 0 && typeof to === 'number'
    ? ((to - from) / from) * 100
    : undefined
}

function fmtMs(value) {
  const n = toNumber(value)
  return n === undefined ? '-' : n.toFixed(2)
}

function fmtPct(value) {
  const n = toNumber(value)
  if (n === undefined) {
    return '-'
  }
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function metric(row, kind) {
  const fullHmrMetric = kind.startsWith('hmr')
    ? toNumber(row?.summary?.[kind]?.median)
    : undefined
  return fullHmrMetric ?? toNumber(row?.summary?.[`${kind}Steady`]?.median ?? row?.summary?.[kind]?.median)
}

function pluginMetric(row, kind) {
  return toNumber(row?.summary?.[`${kind}Plugin`]?.median) ?? metric(row, `${kind}Plugin`)
}

function sampleCount(row, field) {
  return Array.isArray(row?.[field]) ? row[field].length : undefined
}

function average(values) {
  const validValues = values.filter(value => typeof value === 'number' && Number.isFinite(value))
  return validValues.length ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length : undefined
}

function normalizePackageSpec(value) {
  if (value.startsWith('weapp-tailwindcss@')) {
    return value
  }
  return `weapp-tailwindcss@${value}`
}

export function buildSummary(raw, baselineLabel, currentLabel) {
  const rows = raw.rows ?? []
  const byKey = new Map(rows.map(row => [`${row.version}::${row.key}`, row]))
  const currentRows = rows.filter(row => row.version === currentLabel)
  const compares = currentRows.map((current) => {
    const baseline = byKey.get(`${baselineLabel}::${current.key}`)
    const baselineBuild = metric(baseline, 'build')
    const currentBuild = metric(current, 'build')
    const baselineHmr = metric(baseline, 'hmr')
    const currentHmr = metric(current, 'hmr')
    const baselineBuildPlugin = pluginMetric(baseline, 'build')
    const currentBuildPlugin = pluginMetric(current, 'build')
    const baselineHmrPlugin = pluginMetric(baseline, 'hmr')
    const currentHmrPlugin = pluginMetric(current, 'hmr')
    const baselineHmrMode = baseline?.hmrMode ?? 'watch'
    const currentHmrMode = current.hmrMode ?? 'watch'
    const hmrEndToEndGuard = baseline?.hmrEndToEndGuard !== false && current.hmrEndToEndGuard !== false
    return {
      key: current.key,
      project: current.project,
      target: current.target,
      baselineBuild,
      currentBuild,
      buildDeltaPct: pct(baselineBuild, currentBuild),
      baselineHmr,
      currentHmr,
      hmrDeltaPct: pct(baselineHmr, currentHmr),
      baselineBuildPlugin,
      currentBuildPlugin,
      buildPluginDeltaPct: pct(baselineBuildPlugin, currentBuildPlugin),
      baselineHmrPlugin,
      currentHmrPlugin,
      hmrPluginDeltaPct: pct(baselineHmrPlugin, currentHmrPlugin),
      baselineHmrSampleCount: sampleCount(baseline, 'hmrMs'),
      currentHmrSampleCount: sampleCount(current, 'hmrMs'),
      baselineHmrPluginSampleCount: sampleCount(baseline, 'hmrPluginMs'),
      currentHmrPluginSampleCount: sampleCount(current, 'hmrPluginMs'),
      baselineBuildMode: baseline?.buildMode ?? 'build',
      currentBuildMode: current.buildMode ?? 'build',
      baselineHmrMode,
      currentHmrMode,
      hmrEndToEndGuard,
      hmrGuardNote: current.hmrGuardNote ?? baseline?.hmrGuardNote,
      baselineBuildNote: baseline?.buildNote,
      currentBuildNote: current.buildNote,
      baselineHmrNote: baseline?.hmrNote,
      currentHmrNote: current.hmrNote,
      baselineError: baseline?.error,
      currentError: current.error,
    }
  })
  const errors = rows.filter(row => row.error).map(row => ({
    version: row.version,
    key: row.key,
    error: row.error,
  }))
  const baselineErrors = errors.filter(item => item.version === baselineLabel)
  const currentErrors = errors.filter(item => item.version === currentLabel)
  const baselineErrorKeys = new Set(baselineErrors.map(item => item.key))
  const currentErrorKeys = new Set(currentErrors.map(item => item.key))
  const currentOnlyErrors = currentErrors.filter(item => !baselineErrorKeys.has(item.key))
  const sharedErrors = currentErrors
    .filter(item => baselineErrorKeys.has(item.key))
    .map(current => ({
      key: current.key,
      baselineError: baselineErrors.find(item => item.key === current.key)?.error,
      currentError: current.error,
    }))
  const baselineOnlyErrors = baselineErrors.filter(item => !currentErrorKeys.has(item.key))
  const validBuildCompares = compares.filter(item => !item.baselineError && !item.currentError && typeof item.baselineBuild === 'number' && typeof item.currentBuild === 'number')
  const validWatchHmrCompares = compares.filter((item) => {
    return !item.baselineError
      && !item.currentError
      && item.baselineHmrMode === 'watch'
      && item.currentHmrMode === 'watch'
      && typeof item.baselineHmr === 'number'
      && typeof item.currentHmr === 'number'
  })
  const validBuildPluginCompares = compares.filter(item => !item.baselineError && !item.currentError && typeof item.baselineBuildPlugin === 'number' && typeof item.currentBuildPlugin === 'number')
  const validWatchHmrPluginCompares = compares.filter((item) => {
    return !item.baselineError
      && !item.currentError
      && item.baselineHmrMode === 'watch'
      && item.currentHmrMode === 'watch'
      && typeof item.baselineHmrPlugin === 'number'
      && typeof item.currentHmrPlugin === 'number'
  })
  return {
    generatedAt: raw.generatedAt,
    options: raw.options,
    baseline: baselineLabel,
    current: currentLabel,
    compares,
    errors,
    baselineErrors,
    currentErrors,
    currentOnlyErrors,
    sharedErrors,
    baselineOnlyErrors,
    averages: {
      buildDeltaPct: average(validBuildCompares.map(item => item.buildDeltaPct)),
      hmrDeltaPct: average(validWatchHmrCompares.map(item => item.hmrDeltaPct)),
      buildCompareCount: validBuildCompares.length,
      watchHmrCompareCount: validWatchHmrCompares.length,
      buildPluginDeltaPct: average(validBuildPluginCompares.map(item => item.buildPluginDeltaPct)),
      hmrPluginDeltaPct: average(validWatchHmrPluginCompares.map(item => item.hmrPluginDeltaPct)),
      buildPluginCompareCount: validBuildPluginCompares.length,
      watchHmrPluginCompareCount: validWatchHmrPluginCompares.length,
    },
  }
}

export function evaluatePerformanceGuard(summary, options = {}) {
  const pluginRegressionPercent = toNumber(options.pluginRegressionPercent) ?? 15
  const pluginAbsoluteMs = toNumber(options.pluginAbsoluteMs) ?? 40
  const endToEndRegressionPercent = toNumber(options.endToEndRegressionPercent) ?? 15
  const endToEndAbsoluteMs = toNumber(options.endToEndAbsoluteMs) ?? 50
  const violations = summary.currentOnlyErrors.map(item => ({
    key: item.key,
    metric: 'error',
    message: String(item.error).split('\n')[0],
  }))
  const metrics = [
    { metric: 'build', baseline: 'baselineBuild', current: 'currentBuild', delta: 'buildDeltaPct', percent: endToEndRegressionPercent, absoluteMs: endToEndAbsoluteMs },
    { metric: 'hmr', baseline: 'baselineHmr', current: 'currentHmr', delta: 'hmrDeltaPct', percent: endToEndRegressionPercent, absoluteMs: endToEndAbsoluteMs, watchOnly: true },
    { metric: 'buildPlugin', baseline: 'baselineBuildPlugin', current: 'currentBuildPlugin', delta: 'buildPluginDeltaPct', percent: pluginRegressionPercent, absoluteMs: pluginAbsoluteMs },
    { metric: 'hmrPlugin', baseline: 'baselineHmrPlugin', current: 'currentHmrPlugin', delta: 'hmrPluginDeltaPct', percent: pluginRegressionPercent, absoluteMs: pluginAbsoluteMs, watchOnly: true },
  ]

  for (const compare of summary.compares) {
    if (compare.baselineError || compare.currentError) {
      continue
    }
    if (compare.baselineHmrMode === 'watch' && compare.currentHmrMode === 'watch') {
      for (const side of ['baseline', 'current']) {
        const hmrSamples = toNumber(compare[`${side}HmrSampleCount`])
        const pluginSamples = toNumber(compare[`${side}HmrPluginSampleCount`])
        if (hmrSamples !== undefined && hmrSamples > 0 && pluginSamples !== hmrSamples) {
          violations.push({
            key: compare.key,
            metric: `${side}HmrPluginSamples`,
            message: `${side} HMR plugin timing samples ${pluginSamples ?? 0}/${hmrSamples}`,
          })
        }
      }
    }
    for (const config of metrics) {
      if (config.watchOnly && (compare.baselineHmrMode !== 'watch' || compare.currentHmrMode !== 'watch')) {
        continue
      }
      if (config.metric === 'hmr' && compare.hmrEndToEndGuard === false) {
        continue
      }
      const baseline = toNumber(compare[config.baseline])
      const current = toNumber(compare[config.current])
      const deltaPercent = toNumber(compare[config.delta])
      if (baseline === undefined || current === undefined || deltaPercent === undefined) {
        continue
      }
      const absoluteDeltaMs = current - baseline
      if (deltaPercent > config.percent && absoluteDeltaMs > config.absoluteMs) {
        violations.push({
          key: compare.key,
          metric: config.metric,
          baseline,
          current,
          deltaPercent,
          absoluteDeltaMs,
          thresholdPercent: config.percent,
          thresholdAbsoluteMs: config.absoluteMs,
        })
      }
    }
  }

  return {
    passed: violations.length === 0,
    thresholds: {
      pluginRegressionPercent,
      pluginAbsoluteMs,
      endToEndRegressionPercent,
      endToEndAbsoluteMs,
    },
    violations,
  }
}

export function toMarkdown(summary, baselineSpec) {
  const rows = summary.compares.map((item) => {
    const hmrMode = item.baselineHmrMode === item.currentHmrMode
      ? item.currentHmrMode
      : `${item.baselineHmrMode} -> ${item.currentHmrMode}`
    const note = [
      item.baselineError && 'baseline error',
      item.currentError && 'current error',
      item.baselineBuildMode === 'unsupported' && `baseline build: ${item.baselineBuildNote}`,
      item.currentBuildMode === 'unsupported' && `current build: ${item.currentBuildNote}`,
      item.baselineHmrMode !== 'watch' && `baseline HMR: ${item.baselineHmrNote ?? item.baselineHmrMode}`,
      item.currentHmrMode !== 'watch' && `current HMR: ${item.currentHmrNote ?? item.currentHmrMode}`,
      item.hmrEndToEndGuard === false && `HMR end-to-end informational: ${item.hmrGuardNote ?? 'plugin timing remains guarded'}`,
    ].filter(Boolean).join('<br>')
    return `| ${item.key} | ${item.target ?? '-'} | ${fmtMs(item.baselineBuild)} | ${fmtMs(item.currentBuild)} | ${fmtPct(item.buildDeltaPct)} | ${hmrMode} | ${fmtMs(item.baselineHmr)} | ${fmtMs(item.currentHmr)} | ${fmtPct(item.hmrDeltaPct)} | ${note || '-'} |`
  }).join('\n')
  const errors = summary.errors.length
    ? summary.errors.map(item => `- ${item.version} / ${item.key}: ${String(item.error).split('\n')[0]}`).join('\n')
    : '- 无'
  const pluginRows = summary.compares.map(item => `| ${item.key} | ${fmtMs(item.baselineBuildPlugin)} | ${fmtMs(item.currentBuildPlugin)} | ${fmtPct(item.buildPluginDeltaPct)} | ${fmtMs(item.baselineHmrPlugin)} | ${fmtMs(item.currentHmrPlugin)} | ${fmtPct(item.hmrPluginDeltaPct)} |`).join('\n')
  const baselineDisplay = summary.baseline.startsWith('base:')
    ? baselineSpec
    : normalizePackageSpec(baselineSpec)
  const guard = summary.performanceGuard
  const guardLines = guard
    ? [
        '',
        '## 性能门禁',
        '',
        `- 结果：${guard.passed ? '通过' : '失败'}`,
        `- 插件阶段阈值：${guard.thresholds.pluginRegressionPercent}% 且绝对增加超过 ${guard.thresholds.pluginAbsoluteMs}ms`,
        `- 端到端阈值：${guard.thresholds.endToEndRegressionPercent}% 且绝对增加超过 ${guard.thresholds.endToEndAbsoluteMs}ms`,
        `- 违规项：${guard.violations.length}`,
        ...guard.violations.map(item => `- ${item.key} / ${item.metric}: ${item.message ?? `${fmtMs(item.baseline)} -> ${fmtMs(item.current)} (${fmtPct(item.deltaPercent)})`}`),
      ].join('\n')
    : ''

  return `# weapp-tailwindcss 性能对照 Benchmark

生成时间：${summary.generatedAt}

## 基线

- 当前版本：${summary.current}
- 对照基线：${summary.baseline}（${baselineDisplay}）
- 样本参数：build ${summary.options.buildRuns} 次，hmr ${summary.options.hmrRuns} 次，timeout ${summary.options.timeoutMs}ms

## 汇总

- Build 稳态中位数平均变化：${fmtPct(summary.averages.buildDeltaPct)}（${summary.averages.buildCompareCount} 项）
- 真实 watch HMR 中位数平均变化：${fmtPct(summary.averages.hmrDeltaPct)}（${summary.averages.watchHmrCompareCount} 项；fallback-build/unsupported 不参与）
- 插件 Build 稳态中位数平均变化：${fmtPct(summary.averages.buildPluginDeltaPct)}（${summary.averages.buildPluginCompareCount} 项）
- 插件 HMR 中位数平均变化：${fmtPct(summary.averages.hmrPluginDeltaPct)}（${summary.averages.watchHmrPluginCompareCount} 项）
- 失败项：${summary.errors.length}
- 当前版本独有失败项：${summary.currentOnlyErrors.length}
- 基线/当前共同失败项：${summary.sharedErrors.length}

## 项目矩阵

| 项目 | 目标平台 | Baseline Build(ms) | Current Build(ms) | Build 变化 | HMR 模式 | Baseline HMR(ms) | Current HMR(ms) | HMR 变化 | 备注 |
| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
${rows}

## 插件处理阶段

| 项目 | Baseline Build Plugin(ms) | Current Build Plugin(ms) | Build Plugin 变化 | Baseline HMR Plugin(ms) | Current HMR Plugin(ms) | HMR Plugin 变化 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${pluginRows}
${guardLines}

## 失败项

${errors}
`
}
