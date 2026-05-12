function toNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function pct(from, to) {
  return from ? ((to - from) / from) * 100 : 0
}

function fmtMs(value) {
  return toNumber(value).toFixed(2)
}

function fmtPct(value) {
  const n = toNumber(value)
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function metric(row, kind) {
  return toNumber(row?.summary?.[`${kind}Steady`]?.median ?? row?.summary?.[kind]?.median)
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
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
    return {
      key: current.key,
      project: current.project,
      baselineBuild,
      currentBuild,
      buildDeltaPct: pct(baselineBuild, currentBuild),
      baselineHmr,
      currentHmr,
      hmrDeltaPct: pct(baselineHmr, currentHmr),
      baselineError: baseline?.error,
      currentError: current.error,
    }
  })
  const errors = rows.filter(row => row.error).map(row => ({
    version: row.version,
    key: row.key,
    error: row.error,
  }))
  const validCompares = compares.filter(item => !item.baselineError && !item.currentError)
  return {
    generatedAt: raw.generatedAt,
    options: raw.options,
    baseline: baselineLabel,
    current: currentLabel,
    compares,
    errors,
    averages: {
      buildDeltaPct: average(validCompares.map(item => item.buildDeltaPct)),
      hmrDeltaPct: average(validCompares.map(item => item.hmrDeltaPct)),
    },
  }
}

export function toMarkdown(summary, baselineSpec) {
  const rows = summary.compares.map((item) => {
    const note = [item.baselineError && 'baseline error', item.currentError && 'current error'].filter(Boolean).join(', ')
    return `| ${item.key} | ${fmtMs(item.baselineBuild)} | ${fmtMs(item.currentBuild)} | ${fmtPct(item.buildDeltaPct)} | ${fmtMs(item.baselineHmr)} | ${fmtMs(item.currentHmr)} | ${fmtPct(item.hmrDeltaPct)} | ${note || '-'} |`
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

- Build 稳态中位数平均变化：${fmtPct(summary.averages.buildDeltaPct)}
- HMR 稳态中位数平均变化：${fmtPct(summary.averages.hmrDeltaPct)}
- 失败项：${summary.errors.length}

## 项目矩阵

| 项目 | Baseline Build(ms) | Current Build(ms) | Build 变化 | Baseline HMR(ms) | Current HMR(ms) | HMR 变化 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## 失败项

${errors}
`
}
