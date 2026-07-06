import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { renderWebTargetComparison } from './report-web-comparison'
import { formatBytes, formatMs } from './stats'
import type { BenchmarkCaseResult, BenchmarkReport } from './types'

function escapeCell(value: unknown) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>')
}

function table(headers: string[], rows: unknown[][]) {
  return [
    `| ${headers.map(escapeCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n')
}

export function caseName(result: BenchmarkCaseResult) {
  const names: Record<string, string> = {
    'weapp-generator-scan-weapp': 'weapp-tailwindcss 生成器 target=weapp scanSources=true',
    'weapp-generator-scan-web': 'weapp-tailwindcss 生成器 target=web scanSources=true',
    'weapp-generator-candidates-weapp': 'weapp-tailwindcss 生成器 target=weapp scanSources=false candidates',
    'weapp-generator-candidates-web': 'weapp-tailwindcss 生成器 target=web scanSources=false candidates',
    'weapp-generator-incremental-cold': 'weapp-tailwindcss 生成器 incrementalCache cold',
    'weapp-generator-incremental-hit': 'weapp-tailwindcss 生成器 incrementalCache hit',
    'weapp-generator-incremental-append': 'weapp-tailwindcss 生成器 incrementalCache append',
    'official-postcss-core': '@tailwindcss/postcss 直接 PostCSS 处理',
    'vite-official-postcss': 'Vite 构建 + @tailwindcss/postcss',
    'vite-official-vite': 'Vite 构建 + @tailwindcss/vite',
    'vite-weapp-target-weapp': "Vite 构建 + weapp-tailwindcss/vite generator.target='weapp'",
    'vite-weapp-target-web': "Vite 构建 + weapp-tailwindcss/vite generator.target='web'",
    'vite-weapp-target-web-compact': "Vite 构建 + weapp-tailwindcss/vite generator.target='web' web-compact",
    'hmr-official-postcss': 'Vite dev/HMR + @tailwindcss/postcss',
    'hmr-official-vite': 'Vite dev/HMR + @tailwindcss/vite',
    'hmr-weapp-target-weapp': "Vite dev/HMR + weapp-tailwindcss/vite generator.target='weapp'",
    'hmr-weapp-target-web': "Vite dev/HMR + weapp-tailwindcss/vite generator.target='web'",
    'hmr-weapp-target-web-compact': "Vite dev/HMR + weapp-tailwindcss/vite generator.target='web' web-compact",
  }
  return names[result.id] ?? result.name
}

function resultRows(results: BenchmarkCaseResult[]) {
  return results.map(result => [
    caseName(result),
    result.plugin,
    result.error ? '错误' : formatMs(result.stats.mean),
    result.error ? '错误' : formatMs(result.stats.median),
    result.error ? '错误' : formatMs(result.stats.p95),
    result.error ? '-' : formatBytes(result.outputCssBytes),
    result.classSetSize ?? '-',
    result.selectorCount ?? '-',
  ])
}

function memoryRows(results: BenchmarkCaseResult[]) {
  return results.map(result => [
    result.scenarioName,
    caseName(result),
    result.plugin,
    result.mode,
    result.memory ? formatBytes(result.memory.rssPeakBytes) : '-',
    result.memory ? formatBytes(result.memory.rssDeltaBytes) : '-',
    result.memory ? formatBytes(result.memory.heapPeakBytes) : '-',
    result.memory ? formatBytes(result.memory.heapDeltaBytes) : '-',
  ])
}

function fastest(results: BenchmarkCaseResult[]) {
  const valid = results.filter(result => !result.error && result.runsMs.length > 0)
  return valid.sort((a, b) => a.stats.median - b.stats.median)[0]
}

function slowest(results: BenchmarkCaseResult[]) {
  const valid = results.filter(result => !result.error && result.runsMs.length > 0)
  return valid.sort((a, b) => b.stats.median - a.stats.median)[0]
}

function highestRss(results: BenchmarkCaseResult[]) {
  const valid = results.filter(result => !result.error && result.memory)
  return valid.sort((a, b) => (b.memory?.rssPeakBytes ?? 0) - (a.memory?.rssPeakBytes ?? 0))[0]
}

function formatRatio(next: number | undefined, base: number | undefined) {
  if (!next || !base || base === 0) {
    return '无法计算'
  }
  return `${(next / base).toFixed(2)}x`
}

function findResult(report: BenchmarkReport, scenarioId: string, id: string) {
  return report.results.find(result => result.scenarioId === scenarioId && result.id === id && !result.error)
}

function renderInsights(report: BenchmarkReport) {
  const lines = ['## 详细解读', '']
  for (const scenario of report.scenarios) {
    const scenarioResults = report.results.filter(result => result.scenarioId === scenario.id)
    const generatorResults = scenarioResults.filter(result => result.mode === 'generator')
    const fullGeneratorFastest = fastest(generatorResults.filter(result => !result.id.includes('incremental')))
    const incrementalHit = generatorResults.find(result => result.id === 'weapp-generator-incremental-hit' && !result.error)
    const incrementalAppend = generatorResults.find(result => result.id === 'weapp-generator-incremental-append' && !result.error)
    const buildFastest = fastest(scenarioResults.filter(result => result.mode === 'vite-build'))
    const hmrFastest = fastest(scenarioResults.filter(result => result.mode === 'vite-hmr'))
    const hmrSlowest = slowest(scenarioResults.filter(result => result.mode === 'vite-hmr'))
    const rssHighest = highestRss(scenarioResults)

    lines.push(`### ${scenario.name}`, '')
    if (fullGeneratorFastest) {
      lines.push(`- 全量生成核心最快的是 ${caseName(fullGeneratorFastest)}，中位数 ${formatMs(fullGeneratorFastest.stats.median)}，输出选择器数 ${fullGeneratorFastest.selectorCount ?? '-'}。`)
    }
    if (incrementalHit && incrementalAppend) {
      lines.push(`- 增量缓存命中路径中位数 ${formatMs(incrementalHit.stats.median)}，追加候选类路径中位数 ${formatMs(incrementalAppend.stats.median)}；这两项只覆盖局部候选类更新，不和全量生成直接等价。`)
    }
    if (buildFastest) {
      lines.push(`- Vite 构建最快的是 ${caseName(buildFastest)}，中位数 ${formatMs(buildFastest.stats.median)}，CSS 大小 ${formatBytes(buildFastest.outputCssBytes)}。`)
    }
    if (hmrFastest && hmrSlowest) {
      lines.push(`- Vite dev/HMR 最快的是 ${caseName(hmrFastest)}（${formatMs(hmrFastest.stats.median)}），最慢的是 ${caseName(hmrSlowest)}（${formatMs(hmrSlowest.stats.median)}），差距约 ${formatRatio(hmrSlowest.stats.median, hmrFastest.stats.median)}。`)
    }
    if (rssHighest?.memory) {
      lines.push(`- RSS 峰值最高的是 ${caseName(rssHighest)}，峰值 ${formatBytes(rssHighest.memory.rssPeakBytes)}，本 case RSS 增量 ${formatBytes(rssHighest.memory.rssDeltaBytes)}。`)
    }
    lines.push('')
  }

  const defaultScenario = report.scenarios.find(scenario => scenario.id === 'default')
  const largeScenario = report.scenarios.find(scenario => scenario.id === 'large-selectors')
  if (defaultScenario && largeScenario) {
    lines.push('### 规模放大观察', '')
    lines.push(`- 候选类数量从 ${defaultScenario.candidateCount} 增加到 ${largeScenario.candidateCount}，约 ${formatRatio(largeScenario.candidateCount, defaultScenario.candidateCount)}。`)
    for (const id of [
      'weapp-generator-scan-weapp',
      'weapp-generator-scan-web',
      'official-postcss-core',
      'vite-weapp-target-weapp',
      'hmr-weapp-target-weapp',
    ]) {
      const base = findResult(report, defaultScenario.id, id)
      const large = findResult(report, largeScenario.id, id)
      if (base && large) {
        lines.push(`- ${caseName(large)}：中位数从 ${formatMs(base.stats.median)} 到 ${formatMs(large.stats.median)}，放大约 ${formatRatio(large.stats.median, base.stats.median)}；RSS 峰值从 ${base.memory ? formatBytes(base.memory.rssPeakBytes) : '-'} 到 ${large.memory ? formatBytes(large.memory.rssPeakBytes) : '-'}。`)
      }
    }
    lines.push('')
  }

  return lines
}

function renderResultSection(title: string, results: BenchmarkCaseResult[]) {
  const fastestResult = fastest(results)
  return [
    `### ${title}`,
    '',
    fastestResult ? `中位数最快：${caseName(fastestResult)}（${formatMs(fastestResult.stats.median)}）。` : `没有成功的${title}结果。`,
    '',
    table(
      ['用例', '插件', '平均值', '中位数', 'P95', 'CSS 大小', 'Class set', '选择器数'],
      resultRows(results),
    ),
    '',
  ]
}

function renderMemorySection(title: string, results: BenchmarkCaseResult[]) {
  return [
    `### ${title}`,
    '',
    table(
      ['场景', '用例', '插件', '模式', 'RSS 峰值', 'RSS 增量', 'Heap 峰值', 'Heap 增量'],
      memoryRows(results),
    ),
    '',
  ]
}

export function renderMarkdown(report: BenchmarkReport) {
  const errors = report.results.filter(result => result.error)

  const lines = [
    '# Tailwind CSS v4 插件性能 Benchmark',
    '',
    `生成时间：${report.generatedAt}`,
    '',
    '## 测试范围',
    '',
    '本 benchmark 在同一份 Tailwind CSS v4 输入下，对比 `weapp-tailwindcss`、`@tailwindcss/postcss` 与 `@tailwindcss/vite` 的隔离生成耗时和完整 Vite build 耗时。官方 Tailwind 插件只在该隔离 fixture 中使用，不接入正常 demo 或生产构建配置。',
    '',
    '## 运行环境',
    '',
    table(
      ['项目', '值'],
      [
        ['Node', report.environment.node],
        ['pnpm', report.environment.pnpm ?? '未知'],
        ['Platform', `${report.environment.platform} ${report.environment.arch} ${report.environment.osRelease}`],
        ['CPU', report.environment.cpus.join(', ')],
        ['weapp-tailwindcss', report.environment.packageVersions['weapp-tailwindcss'] ?? '未知'],
        ['tailwindcss', report.environment.packageVersions['tailwindcss'] ?? '未知'],
        ['@tailwindcss/postcss', report.environment.packageVersions['@tailwindcss/postcss'] ?? '未知'],
        ['@tailwindcss/vite', report.environment.packageVersions['@tailwindcss/vite'] ?? '未知'],
        ['vite', report.environment.packageVersions['vite'] ?? '未知'],
      ],
    ),
    '',
    '## 参数',
    '',
    table(
      ['项目', '值'],
      [
        ['正式轮数', report.parameters.runs],
        ['预热轮数', report.parameters.warmups],
        ['默认目标 class 数量', report.parameters.classCount],
        ['默认源码文件数量', report.parameters.sourceFiles],
        ['大规模目标 class 数量', report.parameters.largeClassCount],
        ['大规模源码文件数量', report.parameters.largeSourceFiles],
        ['是否包含大规模场景', report.parameters.includeLarge ? '是' : '否'],
        ['是否包含 HMR 场景', report.parameters.includeHmr ? '是' : '否'],
      ],
    ),
    '',
    '## 场景',
    '',
    table(
      ['场景', '目标 class 数量', '源码文件数量', '实际候选类数量', 'HMR 候选类数量'],
      report.scenarios.map(scenario => [
        scenario.name,
        scenario.classCount,
        scenario.sourceFiles,
        scenario.candidateCount,
        scenario.hmrCandidateCount,
      ]),
    ),
    '',
    ...renderInsights(report),
    ...renderWebTargetComparison(report, caseName),
  ]

  for (const scenario of report.scenarios) {
    const scenarioResults = report.results.filter(result => result.scenarioId === scenario.id)
    const generatorResults = scenarioResults.filter(result => result.mode === 'generator')
    const viteResults = scenarioResults.filter(result => result.mode === 'vite-build')
    const hmrResults = scenarioResults.filter(result => result.mode === 'vite-hmr')
    lines.push(
      `## ${scenario.name}`,
      '',
      ...renderResultSection('生成核心', generatorResults),
      ...renderResultSection('Vite 构建', viteResults),
    )
    if (report.parameters.includeHmr) {
      lines.push(...renderResultSection('Vite dev/HMR', hmrResults))
    }
    lines.push(...renderMemorySection('内存占用', scenarioResults))
  }

  if (errors.length > 0) {
    lines.push('', '## 错误', '')
    for (const result of errors) {
      lines.push(`### ${caseName(result)}`, '', '```text', result.error ?? '未知错误', '```', '')
    }
  }

  lines.push('', '## 结果解读', '')
  lines.push('- “生成核心”用例隔离 CSS 生成成本，更适合对比插件的生成性能。')
  lines.push('- “Vite 构建”用例包含 bundler 启动、Rollup 输出和插件集成开销，可作为端到端参考。')
  lines.push('- “Vite dev/HMR”用例统计 Vite dev server 已启动后，临时源码文件写入、watcher change、module graph invalidation 与重新请求 CSS transform 的耗时；不包含浏览器 WebSocket 传输和页面应用样式的耗时。')
  lines.push('- “大数量级选择器”场景用于观察 selector 数量上升后的生成、构建与 HMR 变化。')
  lines.push('- 内存数据来自同一 Node 进程的 `process.memoryUsage()`，记录每个 case 的执行前后值、采样峰值和增量；RSS 增量会受 V8 GC 与前序 case 缓存影响，RSS 峰值更适合判断占用上界。')
  lines.push("- `weapp` target 包含小程序选择器和 CSS 兼容转换；`web` target 保留浏览器 CSS 形态；`web-compact` 表示 `target='web'` 且开启 `webCompat=true` 的 legacy WebView 兼容降级输出。")

  return `${lines.join('\n')}\n`
}

export async function writeMarkdownReport(inputPath: string, reportPath: string) {
  const raw = await readFile(inputPath, 'utf8')
  const report = JSON.parse(raw) as BenchmarkReport
  const markdown = renderMarkdown(report)
  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, markdown, 'utf8')
  return markdown
}
