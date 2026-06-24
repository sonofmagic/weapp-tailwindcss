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
  return toNumber(row?.summary?.[`${kind}Steady`]?.median ?? row?.summary?.[kind]?.median)
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
    const baselineHmrMode = baseline?.hmrMode ?? 'watch'
    const currentHmrMode = current.hmrMode ?? 'watch'
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
      baselineBuildMode: baseline?.buildMode ?? 'build',
      currentBuildMode: current.buildMode ?? 'build',
      baselineHmrMode,
      currentHmrMode,
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
    },
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
    ].filter(Boolean).join('<br>')
    return `| ${item.key} | ${item.target ?? '-'} | ${fmtMs(item.baselineBuild)} | ${fmtMs(item.currentBuild)} | ${fmtPct(item.buildDeltaPct)} | ${hmrMode} | ${fmtMs(item.baselineHmr)} | ${fmtMs(item.currentHmr)} | ${fmtPct(item.hmrDeltaPct)} | ${note || '-'} |`
  }).join('\n')
  const errors = summary.errors.length
    ? summary.errors.map(item => `- ${item.version} / ${item.key}: ${String(item.error).split('\n')[0]}`).join('\n')
    : '- 无'

  return `# weapp-tailwindcss 当前版本 vs 发布版本 Benchmark

生成时间：${summary.generatedAt}

## 基线

- 当前版本：${summary.current}
- 发布基线：${summary.baseline}（${normalizePackageSpec(baselineSpec)}）
- 样本参数：build ${summary.options.buildRuns} 次，hmr ${summary.options.hmrRuns} 次，timeout ${summary.options.timeoutMs}ms

## 汇总

- Build 稳态中位数平均变化：${fmtPct(summary.averages.buildDeltaPct)}（${summary.averages.buildCompareCount} 项）
- 真实 watch HMR 稳态中位数平均变化：${fmtPct(summary.averages.hmrDeltaPct)}（${summary.averages.watchHmrCompareCount} 项；fallback-build/unsupported 不参与）
- 失败项：${summary.errors.length}
- 当前版本独有失败项：${summary.currentOnlyErrors.length}
- 基线/当前共同失败项：${summary.sharedErrors.length}

## 项目矩阵

| 项目 | 目标平台 | Baseline Build(ms) | Current Build(ms) | Build 变化 | HMR 模式 | Baseline HMR(ms) | Current HMR(ms) | HMR 变化 | 备注 |
| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | --- |
${rows}

## 失败项

${errors}
`
}
