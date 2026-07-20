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

function summaryMetric(row, kind, statistic = 'median') {
  return toNumber(row?.summary?.[kind]?.[statistic])
}

function memoryMetric(row, kind) {
  return summaryMetric(row, kind, 'median')
}

function sampleCount(row, field) {
  return Array.isArray(row?.[field]) ? row[field].length : undefined
}

function numericSamples(row, field) {
  return Array.isArray(row?.[field])
    ? row[field].filter(value => typeof value === 'number' && Number.isFinite(value))
    : []
}

function standardDeviation(values) {
  if (values.length === 0) {
    return 0
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  return Math.sqrt(values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length)
}

export function resolveRegressionNoiseMargin(
  baselineSamples,
  currentSamples,
  minimumAbsoluteDelta,
  noiseSigma = 3,
) {
  const baselineDeviation = standardDeviation(baselineSamples)
  const currentDeviation = standardDeviation(currentSamples)
  const pooledDeviation = Math.sqrt(
    ((baselineDeviation ** 2) + (currentDeviation ** 2)) / 2,
  )
  return Math.max(minimumAbsoluteDelta, pooledDeviation * noiseSigma)
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
    const baselineBuild = summaryMetric(baseline, 'build')
    const currentBuild = summaryMetric(current, 'build')
    const baselineHmr = summaryMetric(baseline, 'hmr', 'p95')
    const currentHmr = summaryMetric(current, 'hmr', 'p95')
    const baselineBuildPlugin = summaryMetric(baseline, 'buildPlugin')
    const currentBuildPlugin = summaryMetric(current, 'buildPlugin')
    const baselineHmrPlugin = summaryMetric(baseline, 'hmrPlugin', 'p95')
    const currentHmrPlugin = summaryMetric(current, 'hmrPlugin', 'p95')
    const baselineBuildPeakRssMb = memoryMetric(baseline, 'buildPeakRssMb')
    const currentBuildPeakRssMb = memoryMetric(current, 'buildPeakRssMb')
    const baselineBuildSteadyRssMb = memoryMetric(baseline, 'buildSteadyRssMb')
    const currentBuildSteadyRssMb = memoryMetric(current, 'buildSteadyRssMb')
    const baselineHmrPeakRssMb = memoryMetric(baseline, 'hmrPeakRssMb')
    const currentHmrPeakRssMb = memoryMetric(current, 'hmrPeakRssMb')
    const baselineHmrSteadyRssMb = memoryMetric(baseline, 'hmrSteadyRssMb')
    const currentHmrSteadyRssMb = memoryMetric(current, 'hmrSteadyRssMb')
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
      baselineBuildPeakRssMb,
      currentBuildPeakRssMb,
      buildPeakRssDeltaPct: pct(baselineBuildPeakRssMb, currentBuildPeakRssMb),
      baselineBuildSteadyRssMb,
      currentBuildSteadyRssMb,
      buildSteadyRssDeltaPct: pct(baselineBuildSteadyRssMb, currentBuildSteadyRssMb),
      baselineHmrPeakRssMb,
      currentHmrPeakRssMb,
      hmrPeakRssDeltaPct: pct(baselineHmrPeakRssMb, currentHmrPeakRssMb),
      baselineHmrSteadyRssMb,
      currentHmrSteadyRssMb,
      hmrSteadyRssDeltaPct: pct(baselineHmrSteadyRssMb, currentHmrSteadyRssMb),
      baselineHmrSampleCount: sampleCount(baseline, 'hmrMs'),
      currentHmrSampleCount: sampleCount(current, 'hmrMs'),
      baselineHmrPluginSampleCount: sampleCount(baseline, 'hmrPluginMs'),
      currentHmrPluginSampleCount: sampleCount(current, 'hmrPluginMs'),
      baselineBuildSamples: numericSamples(baseline, 'buildMs'),
      currentBuildSamples: numericSamples(current, 'buildMs'),
      baselineHmrSamples: numericSamples(baseline, 'hmrMs'),
      currentHmrSamples: numericSamples(current, 'hmrMs'),
      baselineBuildPluginSamples: numericSamples(baseline, 'buildPluginMs'),
      currentBuildPluginSamples: numericSamples(current, 'buildPluginMs'),
      baselineHmrPluginSamples: numericSamples(baseline, 'hmrPluginMs'),
      currentHmrPluginSamples: numericSamples(current, 'hmrPluginMs'),
      baselineBuildPeakRssSamples: numericSamples(baseline, 'buildPeakRssMb'),
      currentBuildPeakRssSamples: numericSamples(current, 'buildPeakRssMb'),
      baselineBuildSteadyRssSamples: numericSamples(baseline, 'buildSteadyRssMb'),
      currentBuildSteadyRssSamples: numericSamples(current, 'buildSteadyRssMb'),
      baselineMemoryStability: baseline?.memoryStability,
      currentMemoryStability: current.memoryStability,
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
  const regressionPercent = toNumber(options.regressionPercent) ?? 5
  const noiseSigma = toNumber(options.noiseSigma) ?? 3
  const violations = summary.currentOnlyErrors.map(item => ({
    key: item.key,
    metric: 'error',
    message: String(item.error).split('\n')[0],
  }))
  const metrics = [
    { metric: 'buildMedian', baseline: 'baselineBuild', current: 'currentBuild', delta: 'buildDeltaPct', baselineSamples: 'baselineBuildSamples', currentSamples: 'currentBuildSamples', minimumAbsoluteDelta: 50 },
    { metric: 'hmrP95', baseline: 'baselineHmr', current: 'currentHmr', delta: 'hmrDeltaPct', baselineSamples: 'baselineHmrSamples', currentSamples: 'currentHmrSamples', minimumAbsoluteDelta: 100, watchOnly: true },
    { metric: 'buildPluginMedian', baseline: 'baselineBuildPlugin', current: 'currentBuildPlugin', delta: 'buildPluginDeltaPct', baselineSamples: 'baselineBuildPluginSamples', currentSamples: 'currentBuildPluginSamples', minimumAbsoluteDelta: 10 },
    { metric: 'hmrPluginP95', baseline: 'baselineHmrPlugin', current: 'currentHmrPlugin', delta: 'hmrPluginDeltaPct', baselineSamples: 'baselineHmrPluginSamples', currentSamples: 'currentHmrPluginSamples', minimumAbsoluteDelta: 10, watchOnly: true },
    { metric: 'buildPeakRssMb', baseline: 'baselineBuildPeakRssMb', current: 'currentBuildPeakRssMb', delta: 'buildPeakRssDeltaPct', baselineSamples: 'baselineBuildPeakRssSamples', currentSamples: 'currentBuildPeakRssSamples', minimumAbsoluteDelta: 64 },
    { metric: 'buildSteadyRssMb', baseline: 'baselineBuildSteadyRssMb', current: 'currentBuildSteadyRssMb', delta: 'buildSteadyRssDeltaPct', baselineSamples: 'baselineBuildSteadyRssSamples', currentSamples: 'currentBuildSteadyRssSamples', minimumAbsoluteDelta: 64 },
  ]

  for (const compare of summary.compares) {
    if (compare.baselineError || compare.currentError) {
      continue
    }
    if (compare.currentMemoryStability?.stable === false) {
      violations.push({
        key: compare.key,
        metric: 'memoryStability100Cycles',
        message: `100 次 class 增删后的稳态 heap 增长 ${fmtPct(compare.currentMemoryStability.growthPct)}`,
      })
    }
    if (
      typeof compare.baselineBuild === 'number'
      && typeof compare.currentBuild === 'number'
      && [
        compare.baselineBuildPeakRssMb,
        compare.currentBuildPeakRssMb,
        compare.baselineBuildSteadyRssMb,
        compare.currentBuildSteadyRssMb,
      ].some(value => typeof value !== 'number')
    ) {
      violations.push({
        key: compare.key,
        metric: 'buildMemorySamples',
        message: 'build peak/steady RSS samples are incomplete',
      })
    }
    if (
      compare.baselineHmrMode === 'watch'
      && compare.currentHmrMode === 'watch'
      && typeof compare.baselineHmr === 'number'
      && typeof compare.currentHmr === 'number'
      && [
        compare.baselineHmrPeakRssMb,
        compare.currentHmrPeakRssMb,
        compare.baselineHmrSteadyRssMb,
        compare.currentHmrSteadyRssMb,
      ].some(value => typeof value !== 'number')
    ) {
      violations.push({
        key: compare.key,
        metric: 'hmrMemorySamples',
        message: 'HMR peak/steady RSS samples are incomplete',
      })
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
      if (config.metric === 'hmrP95' && compare.hmrEndToEndGuard === false) {
        continue
      }
      const baseline = toNumber(compare[config.baseline])
      const current = toNumber(compare[config.current])
      const deltaPercent = toNumber(compare[config.delta])
      if (baseline === undefined || current === undefined || deltaPercent === undefined) {
        continue
      }
      const absoluteDelta = current - baseline
      const noiseMargin = resolveRegressionNoiseMargin(
        compare[config.baselineSamples],
        compare[config.currentSamples],
        config.minimumAbsoluteDelta,
        noiseSigma,
      )
      if (deltaPercent > regressionPercent && absoluteDelta > noiseMargin) {
        violations.push({
          key: compare.key,
          metric: config.metric,
          baseline,
          current,
          deltaPercent,
          absoluteDelta,
          noiseMargin,
          thresholdPercent: regressionPercent,
        })
      }
    }
  }

  return {
    passed: violations.length === 0,
    thresholds: {
      regressionPercent,
      noiseSigma,
      minimumAbsoluteDelta: Object.fromEntries(metrics.map(item => [item.metric, item.minimumAbsoluteDelta])),
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
  const memoryRows = summary.compares.map(item => `| ${item.key} | ${fmtMs(item.baselineBuildPeakRssMb)} | ${fmtMs(item.currentBuildPeakRssMb)} | ${fmtPct(item.buildPeakRssDeltaPct)} | ${fmtMs(item.baselineBuildSteadyRssMb)} | ${fmtMs(item.currentBuildSteadyRssMb)} | ${fmtPct(item.buildSteadyRssDeltaPct)} | ${fmtMs(item.baselineHmrPeakRssMb)} | ${fmtMs(item.currentHmrPeakRssMb)} | ${fmtPct(item.hmrPeakRssDeltaPct)} | ${fmtMs(item.baselineHmrSteadyRssMb)} | ${fmtMs(item.currentHmrSteadyRssMb)} | ${fmtPct(item.hmrSteadyRssDeltaPct)} |`).join('\n')
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
        `- 统一退化阈值：${guard.thresholds.regressionPercent}%`,
        `- 噪声置信边界：${guard.thresholds.noiseSigma} 倍合并标准差，并应用各指标最小绝对变化量`,
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

- 冷构建中位数平均变化：${fmtPct(summary.averages.buildDeltaPct)}（${summary.averages.buildCompareCount} 项）
- 真实 watch HMR P95 平均变化：${fmtPct(summary.averages.hmrDeltaPct)}（${summary.averages.watchHmrCompareCount} 项；fallback-build/unsupported 不参与）
- 插件 Build 中位数平均变化：${fmtPct(summary.averages.buildPluginDeltaPct)}（${summary.averages.buildPluginCompareCount} 项）
- 插件 HMR P95 平均变化：${fmtPct(summary.averages.hmrPluginDeltaPct)}（${summary.averages.watchHmrPluginCompareCount} 项）
- 失败项：${summary.errors.length}
- 当前版本独有失败项：${summary.currentOnlyErrors.length}
- 基线/当前共同失败项：${summary.sharedErrors.length}

## 项目矩阵

| 项目 | 目标平台 | Baseline Build median(ms) | Current Build median(ms) | Build 变化 | HMR 模式 | Baseline HMR P95(ms) | Current HMR P95(ms) | HMR 变化 | 备注 |
| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
${rows}

## 插件处理阶段

| 项目 | Baseline Build Plugin median(ms) | Current Build Plugin median(ms) | Build Plugin 变化 | Baseline HMR Plugin P95(ms) | Current HMR Plugin P95(ms) | HMR Plugin 变化 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${pluginRows}

## 内存

HMR 进程树 peak/steady 仅用于趋势观察；单会话数据不参与相对门禁，HMR 内存泄漏由 100 次 class 增删稳定性用例拦截。

| 项目 | Baseline Build peak(MB) | Current Build peak(MB) | 变化 | Baseline Build steady(MB) | Current Build steady(MB) | 变化 | Baseline HMR peak(MB) | Current HMR peak(MB) | 变化 | Baseline HMR steady(MB) | Current HMR steady(MB) | 变化 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${memoryRows}
${guardLines}

## 失败项

${errors}
`
}
