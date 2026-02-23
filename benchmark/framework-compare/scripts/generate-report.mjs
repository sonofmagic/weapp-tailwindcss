#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parseArg, resolvePath, resolveWorkspaceRoot, sanitizeTextPaths } from './shared.mjs'

function fmtMs(value) {
  if (value == null || Number.isNaN(value)) {
    return 'N/A'
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

function buildMedianTable(rows) {
  const head = [
    '| 框架 | 项目 | Build 中位数 (ms) | HMR 中位数 (ms) | Runtime 冷启动中位数 (ms) | Runtime 首屏中位数 (ms) | Runtime setData 中位数 (ms) | Runtime 样本数 |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]

  const body = rows.map((row) => {
    const buildMedian = row.summary?.build?.median ?? null
    const hmrMedian = row.summary?.hmr?.median ?? null
    const launchMedian = row.summary?.runtime?.launchMs?.median ?? null
    const firstWxmlMedian = row.summary?.runtime?.firstWxmlMs?.median ?? null
    const setDataMedian = row.summary?.runtime?.setDataAvgMs?.median ?? null
    const runtimeCount = row.summary?.runtime?.count ?? 0
    return `| ${row.label} | ${row.project} | ${fmtMs(buildMedian)} | ${fmtMs(hmrMedian)} | ${fmtMs(launchMedian)} | ${fmtMs(firstWxmlMedian)} | ${fmtMs(setDataMedian)} | ${fmtCount(runtimeCount)} |`
  })

  return [...head, ...body].join('\n')
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
    '- HMR：在三组 `.vue` 页面中注入同一批 class 语料，测量源码改动到目标 `.wxml` 出现 marker 的耗时。',
    '- Runtime：基于 `miniprogram-automator` 采集冷启动、首屏可读、`setData` 往返。',
    '',
    '## 总览',
    '',
    buildMedianTable(rows),
    '',
    buildRankingSection(rows, 'Build 排名（中位数，越小越好）', row => row.summary?.build?.median ?? null),
    buildRankingSection(rows, 'HMR 排名（中位数，越小越好）', row => row.summary?.hmr?.median ?? null),
    buildRankingSection(rows, 'Runtime 冷启动排名（中位数，越小越好）', row => row.summary?.runtime?.launchMs?.median ?? null),
    buildRankingSection(rows, 'Runtime 首屏排名（中位数，越小越好）', row => row.summary?.runtime?.firstWxmlMs?.median ?? null),
    buildRankingSection(rows, 'Runtime setData 排名（中位数，越小越好）', row => row.summary?.runtime?.setDataAvgMs?.median ?? null),
  ]

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
