#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parseArg, resolvePath, resolveWorkspaceRoot, sanitizeTextPaths } from './shared.mjs'

function fmtMs(value) {
  if (value == null || Number.isNaN(value)) {
    return 'N/A'
  }
  if (value < 1) {
    return `${value.toFixed(4)}`
  }
  return `${value.toFixed(2)}`
}

function fmtCount(value) {
  if (value == null || Number.isNaN(value)) {
    return '0'
  }
  return String(value)
}

function sortRowsByMetric(rows, getter) {
  return rows
    .map((row) => {
      const value = getter(row)
      return {
        row,
        value: value == null || Number.isNaN(value) ? null : value,
      }
    })
    .filter(item => item.value != null)
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
}

function buildErrorLines(rows, workspaceRoot) {
  const lines = []
  for (const row of rows) {
    const entries = Object.entries(row.errors ?? {}).filter(([, message]) => typeof message === 'string' && message.length > 0)
    if (!entries.length) {
      continue
    }
    lines.push(`- ${row.label} (${row.project})`)
    for (const [phase, message] of entries) {
      const sanitized = sanitizeTextPaths(String(message), workspaceRoot)
      const compact = sanitized.split('\n').slice(0, 2).join(' | ')
      lines.push(`  - ${phase}: ${compact}`)
    }
  }
  return lines
}

function getRuntimeScaleOrder(payload, rows) {
  const fromOptions = Array.isArray(payload?.options?.refBatchScales)
    ? payload.options.refBatchScales
        .map(item => Number(item))
        .filter(item => Number.isFinite(item) && item > 0)
    : []

  if (fromOptions.length) {
    return [...new Set(fromOptions)].sort((a, b) => a - b)
  }

  const values = new Set()
  for (const row of rows) {
    const order = row?.summary?.runtime?.scaleOrder
    if (!Array.isArray(order)) {
      continue
    }
    for (const item of order) {
      const numeric = Number(item)
      if (Number.isFinite(numeric) && numeric > 0) {
        values.add(numeric)
      }
    }
  }
  return [...values].sort((a, b) => a - b)
}

function getRuntimeScaleMetric(row, scale, metricKey) {
  return row?.summary?.runtime?.scales?.[String(scale)]?.[metricKey]?.median ?? null
}

function getRuntimeScaleCount(row, scale) {
  return row?.summary?.runtime?.scales?.[String(scale)]?.count ?? 0
}

function getRuntimeScaleOps(row, scale) {
  return row?.summary?.runtime?.scales?.[String(scale)]?.opsPerRound ?? null
}

function buildMedianTable(rows, runtimePivotScale) {
  const runtimeTitle = runtimePivotScale != null
    ? `Runtime 单次 ref.value 中位数 @${runtimePivotScale} (ms)`
    : 'Runtime 单次 ref.value 中位数 (ms)'
  const roundTitle = runtimePivotScale != null
    ? `Runtime 单轮总耗时中位数 @${runtimePivotScale} (ms)`
    : 'Runtime 单轮总耗时中位数 (ms)'
  const head = [
    `| 框架 | 项目 | Build 中位数 (ms) | HMR 中位数 (ms) | HMR 模式 | ${runtimeTitle} | ${roundTitle} | Runtime 样本数 |`,
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]

  const body = rows.map((row) => {
    const buildMedian = row.summary?.build?.median ?? null
    const hmrMedian = row.summary?.hmr?.median ?? null
    const hmrMode = row.hmrMode ?? 'N/A'
    const runtimeOpMedian = runtimePivotScale == null ? null : getRuntimeScaleMetric(row, runtimePivotScale, 'opMedianMs')
    const runtimeRoundMedian = runtimePivotScale == null ? null : getRuntimeScaleMetric(row, runtimePivotScale, 'roundTotalMs')
    const runtimeCount = runtimePivotScale == null ? 0 : getRuntimeScaleCount(row, runtimePivotScale)
    return `| ${row.label} | ${row.project} | ${fmtMs(buildMedian)} | ${fmtMs(hmrMedian)} | ${hmrMode} | ${fmtMs(runtimeOpMedian)} | ${fmtMs(runtimeRoundMedian)} | ${fmtCount(runtimeCount)} |`
  })

  return [...head, ...body].join('\n')
}

function buildRuntimeScaleTable(rows, runtimeScaleOrder) {
  if (!runtimeScaleOrder.length) {
    return '| 框架 | Runtime 多数量级单次中位数 (ms) |\n| --- | --- |\n| N/A | N/A |'
  }

  const headers = ['框架', '项目', ...runtimeScaleOrder.map(scale => `@${scale}`)]
  const aligns = ['---', '---', ...runtimeScaleOrder.map(() => '---:')]
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${aligns.join(' | ')} |`,
  ]

  for (const row of rows) {
    const values = runtimeScaleOrder.map(scale => fmtMs(getRuntimeScaleMetric(row, scale, 'opMedianMs')))
    lines.push(`| ${row.label} | ${row.project} | ${values.join(' | ')} |`)
  }

  return lines.join('\n')
}

function buildRuntimeOpsTable(rows, runtimeScaleOrder) {
  const lines = [
    '| 规模 | 每轮操作次数 |',
    '| ---: | ---: |',
  ]
  for (const scale of runtimeScaleOrder) {
    const opsValues = rows
      .map(row => getRuntimeScaleOps(row, scale))
      .filter(item => item != null)
    const unique = [...new Set(opsValues)]
    const display = unique.length ? unique.join(' / ') : 'N/A'
    lines.push(`| ${scale} | ${display} |`)
  }
  return lines.join('\n')
}

function buildRankingSection(rows, title, getter) {
  const ranked = sortRowsByMetric(rows, getter)
  if (!ranked.length) {
    return [`### ${title}`, '', '- 当前无有效样本。', ''].join('\n')
  }

  const lines = [`### ${title}`, '']
  for (let index = 0; index < ranked.length; index += 1) {
    const item = ranked[index]
    lines.push(`${index + 1}. ${item.row.label} (${item.row.project}) - ${fmtMs(item.value)} ms`)
  }
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const workspaceRoot = resolveWorkspaceRoot(process.env.INIT_CWD ?? process.cwd())
  const input = resolvePath(
    workspaceRoot,
    parseArg('--input', process.argv.slice(2)),
    'benchmark/framework-compare/data/framework-matrix-raw.json',
  )
  const output = resolvePath(
    workspaceRoot,
    parseArg('--output', process.argv.slice(2)),
    'benchmark/framework-compare/report.md',
  )

  const raw = await fs.readFile(input, 'utf8')
  const payload = JSON.parse(raw)
  const rows = Array.isArray(payload.rows) ? payload.rows : []
  const runtimeScaleOrder = getRuntimeScaleOrder(payload, rows)
  const runtimePivotScale = runtimeScaleOrder.length ? runtimeScaleOrder[runtimeScaleOrder.length - 1] : null

  const markdown = [
    '# 小程序框架性能对比（统一场景）',
    '',
    `生成时间：${payload.generatedAt ?? 'unknown'}`,
    '',
    '对比对象：`uni-app vue3`、`taro vue3`、`weapp-vite wevu`。',
    '',
    '统一采集口径：',
    '- 三组用例在采集前均会被临时替换为同一份标准 Vue SFC，采集结束后自动回滚。',
    '- Build：执行项目 `build` 脚本，重复多轮取统计值。',
    '- HMR：优先测量 watch 模式下源码改动到目标 `.wxml` 出现 marker 的耗时；watch 失败时自动回退到“源码改动 + 全量 build”补偿口径并标记模式。',
    '- Runtime：统一执行 `ref.value` 大批量更新基准，按数量级分层统计单次更新耗时。',
    `- Runtime 数量级：${runtimeScaleOrder.length ? runtimeScaleOrder.join(', ') : 'N/A'}`,
    '',
    '## 总览',
    '',
    buildMedianTable(rows, runtimePivotScale),
    '',
    '## Runtime 多数量级',
    '',
    buildRuntimeScaleTable(rows, runtimeScaleOrder),
    '',
    '### Runtime 每轮操作次数',
    '',
    buildRuntimeOpsTable(rows, runtimeScaleOrder),
    '',
    buildRankingSection(rows, 'Build 排名（中位数，越小越好）', row => row.summary?.build?.median ?? null),
    buildRankingSection(rows, 'HMR 排名（中位数，越小越好）', row => row.summary?.hmr?.median ?? null),
  ]

  for (const scale of runtimeScaleOrder) {
    markdown.push(
      buildRankingSection(
        rows,
        `Runtime ref.value 单次更新排名 @${scale}（中位数，越小越好）`,
        row => getRuntimeScaleMetric(row, scale, 'opMedianMs'),
      ),
    )
  }

  const errorLines = buildErrorLines(rows, workspaceRoot)
  if (errorLines.length) {
    markdown.push('## 异常记录', '', ...errorLines, '')
  }

  markdown.push(
    '## 原始数据',
    '',
    `- ${path.relative(workspaceRoot, input)}`,
    '',
  )

  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${markdown.join('\n')}\n`, 'utf8')
  process.stdout.write(`[framework-matrix] markdown report saved: ${output}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
