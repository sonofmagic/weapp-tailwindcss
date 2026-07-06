import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
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

function caseName(result: BenchmarkCaseResult) {
  const names: Record<string, string> = {
    'weapp-generator-scan-weapp': 'weapp-tailwindcss 生成器 target=weapp scanSources=true',
    'weapp-generator-scan-web': 'weapp-tailwindcss 生成器 target=web scanSources=true',
    'weapp-generator-candidates-weapp': 'weapp-tailwindcss 生成器 target=weapp scanSources=false candidates',
    'weapp-generator-candidates-web': 'weapp-tailwindcss 生成器 target=web scanSources=false candidates',
    'weapp-generator-incremental-cold': 'weapp-tailwindcss 生成器 incrementalCache cold',
    'weapp-generator-incremental-hit': 'weapp-tailwindcss 生成器 incrementalCache hit',
    'weapp-generator-incremental-append': 'weapp-tailwindcss 生成器 incrementalCache append',
    'official-postcss-core': '@tailwindcss/postcss 直接 PostCSS 处理',
    'vite-official-postcss': 'Vite build + @tailwindcss/postcss',
    'vite-official-vite': 'Vite build + @tailwindcss/vite',
    'vite-weapp-target-weapp': "Vite build + weapp-tailwindcss/vite generator.target='weapp'",
    'vite-weapp-target-web': "Vite build + weapp-tailwindcss/vite generator.target='web'",
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

function fastest(results: BenchmarkCaseResult[]) {
  const valid = results.filter(result => !result.error && result.runsMs.length > 0)
  return valid.sort((a, b) => a.stats.median - b.stats.median)[0]
}

export function renderMarkdown(report: BenchmarkReport) {
  const generatorResults = report.results.filter(result => result.mode === 'generator')
  const viteResults = report.results.filter(result => result.mode === 'vite-build')
  const fastestGenerator = fastest(generatorResults)
  const fastestVite = fastest(viteResults)
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
        ['目标 class 数量', report.parameters.classCount],
        ['源码文件数量', report.parameters.sourceFiles],
        ['实际生成候选类数量', report.fixture.candidateCount],
      ],
    ),
    '',
    '## 生成核心',
    '',
    fastestGenerator ? `中位数最快：${caseName(fastestGenerator)}（${formatMs(fastestGenerator.stats.median)}）。` : '没有成功的生成核心结果。',
    '',
    table(
      ['用例', '插件', '平均值', '中位数', 'P95', 'CSS 大小', 'Class set', '选择器数'],
      resultRows(generatorResults),
    ),
    '',
    '## Vite Build',
    '',
    fastestVite ? `中位数最快：${caseName(fastestVite)}（${formatMs(fastestVite.stats.median)}）。` : '没有成功的 Vite build 结果。',
    '',
    table(
      ['用例', '插件', '平均值', '中位数', 'P95', 'CSS 大小', 'Class set', '选择器数'],
      resultRows(viteResults),
    ),
  ]

  if (errors.length > 0) {
    lines.push('', '## 错误', '')
    for (const result of errors) {
      lines.push(`### ${caseName(result)}`, '', '```text', result.error ?? '未知错误', '```', '')
    }
  }

  lines.push('', '## 结果解读', '')
  lines.push('- “生成核心”用例隔离 CSS 生成成本，更适合对比插件的生成性能。')
  lines.push('- “Vite Build”用例包含 bundler 启动、Rollup 输出和插件集成开销，可作为端到端参考。')
  lines.push('- `weapp` target 包含小程序选择器和 CSS 兼容转换；`web` target 保留浏览器 CSS 形态。')

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
