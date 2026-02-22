import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const dataDir = path.resolve('benchmark/version-compare/data')
const reportPath = path.resolve('benchmark/version-compare/report.md')
const matrixBasePath = path.join(dataDir, 'matrix-raw.json')
const matrixRerunPath = path.join(dataDir, 'matrix-raw-rerun.json')
const matrixFinalPath = path.join(dataDir, 'matrix-final.json')
const summaryPath = path.join(dataDir, 'summary.json')
const single498Path = path.join(dataDir, 'single-raw-4.9.8.json')
const single4102Path = path.join(dataDir, 'single-raw-4.10.2.json')

function toNumber(value) {
  return Number(value ?? 0)
}

function pct(from, to) {
  if (!from) {
    return 0
  }
  return ((to - from) / from) * 100
}

function fmtMs(ms) {
  return `${toNumber(ms).toFixed(2)}`
}

function fmtPct(value) {
  const n = toNumber(value)
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function mean(values) {
  if (!values.length) {
    return 0
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length
}

function median(values) {
  if (!values.length) {
    return 0
  }
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

function steadyMedian(values) {
  const source = values.length > 1 ? values.slice(1) : values
  return median(source)
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

function buildProjectCompare(oldRow, newRow) {
  const oldBuildFirst = toNumber(oldRow.buildMs?.[0])
  const newBuildFirst = toNumber(newRow.buildMs?.[0])
  const oldBuildSteadyMedian = toNumber(oldRow.summary?.buildSteady?.median)
  const newBuildSteadyMedian = toNumber(newRow.summary?.buildSteady?.median)
  const oldHmrFirst = toNumber(oldRow.hmrMs?.[0])
  const newHmrFirst = toNumber(newRow.hmrMs?.[0])
  const oldHmrSteadyMedian = toNumber(oldRow.summary?.hmrSteady?.median)
  const newHmrSteadyMedian = toNumber(newRow.summary?.hmrSteady?.median)

  return {
    key: oldRow.key,
    project: oldRow.project,
    buildFirst: {
      v498: oldBuildFirst,
      v4102: newBuildFirst,
      deltaPct: pct(oldBuildFirst, newBuildFirst),
    },
    buildSteadyMedian: {
      v498: oldBuildSteadyMedian,
      v4102: newBuildSteadyMedian,
      deltaPct: pct(oldBuildSteadyMedian, newBuildSteadyMedian),
    },
    hmrFirst: {
      v498: oldHmrFirst,
      v4102: newHmrFirst,
      deltaPct: pct(oldHmrFirst, newHmrFirst),
    },
    hmrSteadyMedian: {
      v498: oldHmrSteadyMedian,
      v4102: newHmrSteadyMedian,
      deltaPct: pct(oldHmrSteadyMedian, newHmrSteadyMedian),
    },
  }
}

function getCoreConclusions(matrixCompares, singleCompare) {
  const buildSteadyAvg = mean(matrixCompares.map(item => item.buildSteadyMedian.deltaPct))
  const hmrSteadyAvg = mean(matrixCompares.map(item => item.hmrSteadyMedian.deltaPct))
  const buildFirstAvg = mean(matrixCompares.map(item => item.buildFirst.deltaPct))
  const hmrFirstAvg = mean(matrixCompares.map(item => item.hmrFirst.deltaPct))

  return [
    `多项目稳态 Build（中位数）在 4.10.2 相比 4.9.8 平均 ${fmtPct(buildSteadyAvg)}。`,
    `多项目稳态 HMR（中位数）在 4.10.2 相比 4.9.8 平均 ${fmtPct(hmrSteadyAvg)}。`,
    `多项目首轮 Build 在 4.10.2 相比 4.9.8 平均 ${fmtPct(buildFirstAvg)}，首轮 HMR 平均 ${fmtPct(hmrFirstAvg)}。`,
    `单项目深度样本（demo/uni-app-vue3-vite, 5 build / 8 hmr）中，稳态 Build 变化 ${fmtPct(singleCompare.buildSteadyMedian.deltaPct)}，稳态 HMR 变化 ${fmtPct(singleCompare.hmrSteadyMedian.deltaPct)}。`,
  ]
}

function buildSingleCompare(v498, v4102) {
  const buildSeries498 = (v498.buildMs ?? []).map(toNumber)
  const buildSeries4102 = (v4102.buildMs ?? []).map(toNumber)
  const hmrSeries498 = (v498.hmrMs ?? []).map(toNumber)
  const hmrSeries4102 = (v4102.hmrMs ?? []).map(toNumber)
  const buildSteady498 = steadyMedian(buildSeries498)
  const buildSteady4102 = steadyMedian(buildSeries4102)
  const hmrSteady498 = steadyMedian(hmrSeries498)
  const hmrSteady4102 = steadyMedian(hmrSeries4102)

  return {
    key: 'demo-uni-app-vue3-vite',
    project: v498.project,
    params: v498.params,
    buildFirst: {
      v498: toNumber(v498.buildMs?.[0]),
      v4102: toNumber(v4102.buildMs?.[0]),
      deltaPct: pct(toNumber(v498.buildMs?.[0]), toNumber(v4102.buildMs?.[0])),
    },
    buildSteadyMedian: {
      v498: buildSteady498,
      v4102: buildSteady4102,
      deltaPct: pct(buildSteady498, buildSteady4102),
    },
    hmrFirst: {
      v498: toNumber(v498.hmrMs?.[0]),
      v4102: toNumber(v4102.hmrMs?.[0]),
      deltaPct: pct(toNumber(v498.hmrMs?.[0]), toNumber(v4102.hmrMs?.[0])),
    },
    hmrSteadyMedian: {
      v498: hmrSteady498,
      v4102: hmrSteady4102,
      deltaPct: pct(hmrSteady498, hmrSteady4102),
    },
  }
}

function collectAnomalies(baseRows, rerunRows, finalRows) {
  const baseErrors = baseRows.filter(row => row.error)
  const rerunSuccessKeys = new Set(rerunRows.filter(row => !row.error).map(row => `${row.version}::${row.key}`))
  const recovered = baseErrors.filter(row => rerunSuccessKeys.has(`${row.version}::${row.key}`))
  const finalErrors = finalRows.filter(row => row.error)
  const lines = []

  if (baseErrors.length === 0) {
    lines.push('本轮首轮矩阵无失败项，无需补跑。')
  }
  else {
    lines.push(`首轮矩阵失败 ${baseErrors.length} 项。`)
    if (recovered.length > 0) {
      lines.push(`补跑恢复 ${recovered.length} 项。`)
    }
    if (finalErrors.length > 0) {
      lines.push(`最终矩阵仍有 ${finalErrors.length} 项失败，请查看 matrix-final.json 的 error 字段。`)
    }
    else {
      lines.push('最终矩阵失败项已清零。')
    }
  }

  return {
    baseErrorCount: baseErrors.length,
    recoveredCount: recovered.length,
    finalErrorCount: finalErrors.length,
    lines,
  }
}

function toMarkdown({ generatedAt, conclusions, matrixCompares, singleCompare, anomalies }) {
  const matrixRows = matrixCompares.map((item) => {
    return `| ${item.key} | ${fmtMs(item.buildSteadyMedian.v498)} | ${fmtMs(item.buildSteadyMedian.v4102)} | ${fmtPct(item.buildSteadyMedian.deltaPct)} | ${fmtMs(item.hmrSteadyMedian.v498)} | ${fmtMs(item.hmrSteadyMedian.v4102)} | ${fmtPct(item.hmrSteadyMedian.deltaPct)} |`
  }).join('\n')

  const firstRoundRows = matrixCompares.map((item) => {
    return `| ${item.key} | ${fmtMs(item.buildFirst.v498)} | ${fmtMs(item.buildFirst.v4102)} | ${fmtPct(item.buildFirst.deltaPct)} | ${fmtMs(item.hmrFirst.v498)} | ${fmtMs(item.hmrFirst.v4102)} | ${fmtPct(item.hmrFirst.deltaPct)} |`
  }).join('\n')

  return `# weapp-tailwindcss 4.9.8 vs 4.10.2 性能对比

生成时间：${generatedAt}

## 核心结论

- ${conclusions[0]}
- ${conclusions[1]}
- ${conclusions[2]}
- ${conclusions[3]}

## 单项目深度对比（demo/uni-app-vue3-vite）

样本参数：build ${singleCompare.params.buildRuns} 次，hmr ${singleCompare.params.hmrRuns} 次。

| 指标 | 4.9.8 | 4.10.2 | 变化 |
| --- | ---: | ---: | ---: |
| 首轮 Build (ms) | ${fmtMs(singleCompare.buildFirst.v498)} | ${fmtMs(singleCompare.buildFirst.v4102)} | ${fmtPct(singleCompare.buildFirst.deltaPct)} |
| Build 稳态中位数 (ms) | ${fmtMs(singleCompare.buildSteadyMedian.v498)} | ${fmtMs(singleCompare.buildSteadyMedian.v4102)} | ${fmtPct(singleCompare.buildSteadyMedian.deltaPct)} |
| 首轮 HMR (ms) | ${fmtMs(singleCompare.hmrFirst.v498)} | ${fmtMs(singleCompare.hmrFirst.v4102)} | ${fmtPct(singleCompare.hmrFirst.deltaPct)} |
| HMR 稳态中位数 (ms) | ${fmtMs(singleCompare.hmrSteadyMedian.v498)} | ${fmtMs(singleCompare.hmrSteadyMedian.v4102)} | ${fmtPct(singleCompare.hmrSteadyMedian.deltaPct)} |

## 多项目矩阵（稳态中位数）

| 项目 | Build 4.9.8 | Build 4.10.2 | Build 变化 | HMR 4.9.8 | HMR 4.10.2 | HMR 变化 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${matrixRows}

## 多项目矩阵（首轮）

| 项目 | 首轮 Build 4.9.8 | 首轮 Build 4.10.2 | Build 变化 | 首轮 HMR 4.9.8 | 首轮 HMR 4.10.2 | HMR 变化 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${firstRoundRows}

## 异常与处理

${anomalies.lines.map(line => `- ${line}`).join('\n')}

## 数据与脚本

- 矩阵原始数据：\`benchmark/version-compare/data/matrix-raw.json\`
- 矩阵补跑数据：\`benchmark/version-compare/data/matrix-raw-rerun.json\`
- 矩阵最终数据：\`benchmark/version-compare/data/matrix-final.json\`
- 单项目原始数据：\`benchmark/version-compare/data/single-raw-4.9.8.json\`、\`benchmark/version-compare/data/single-raw-4.10.2.json\`
- 汇总 JSON：\`benchmark/version-compare/data/summary.json\`
- 跑矩阵脚本：\`benchmark/version-compare/scripts/run-matrix.mjs\`
- 生成报告脚本：\`benchmark/version-compare/scripts/generate-report.mjs\`

## 复现实验命令

\`\`\`bash
node benchmark/version-compare/scripts/run-matrix.mjs --build-runs 3 --hmr-runs 5 --timeout 180000 --out benchmark/version-compare/data/matrix-raw.json
node benchmark/version-compare/scripts/run-matrix.mjs --build-runs 3 --hmr-runs 5 --timeout 180000 --only <失败项目key逗号列表> --out benchmark/version-compare/data/matrix-raw-rerun.json
node benchmark/version-compare/scripts/generate-report.mjs
\`\`\`
`
}

async function main() {
  const base = await readJson(matrixBasePath)
  const rerun = await readJson(matrixRerunPath)
  const single498 = await readJson(single498Path)
  const single4102 = await readJson(single4102Path)
  const baseRows = base.rows ?? []
  const rerunRows = rerun.rows ?? []

  const map = new Map()
  for (const row of baseRows) {
    map.set(`${row.version}::${row.key}`, row)
  }
  for (const row of rerunRows) {
    map.set(`${row.version}::${row.key}`, row)
  }

  const versions = base.versions.map(item => item.version)
  const projects = base.projects.map(item => item.key)

  const rows = []
  for (const version of versions) {
    for (const key of projects) {
      const row = map.get(`${version}::${key}`)
      if (row) {
        rows.push(row)
      }
    }
  }

  const matrixFinal = {
    generatedAt: new Date().toISOString(),
    mergedFrom: [matrixBasePath, matrixRerunPath],
    options: base.options,
    versions: base.versions,
    projects: base.projects,
    rows,
  }
  await fs.writeFile(matrixFinalPath, JSON.stringify(matrixFinal, null, 2), 'utf8')

  const byVersionKey = new Map(rows.filter(row => !row.error).map(row => [`${row.version}::${row.key}`, row]))
  const matrixCompares = projects.map((key) => {
    const oldRow = byVersionKey.get(`4.9.8::${key}`)
    const newRow = byVersionKey.get(`4.10.2::${key}`)
    if (!oldRow || !newRow) {
      return null
    }
    return buildProjectCompare(oldRow, newRow)
  }).filter(Boolean)

  const singleCompare = buildSingleCompare(single498, single4102)
  const conclusions = getCoreConclusions(matrixCompares, singleCompare)
  const anomalies = collectAnomalies(baseRows, rerunRows, rows)

  const summary = {
    generatedAt: new Date().toISOString(),
    conclusions,
    singleCompare,
    matrixCompares,
    anomalies,
  }
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8')

  const report = toMarkdown({
    generatedAt: summary.generatedAt,
    conclusions,
    matrixCompares,
    singleCompare,
    anomalies,
  })
  await fs.writeFile(reportPath, report, 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
