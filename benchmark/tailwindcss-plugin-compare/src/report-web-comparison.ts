import { formatBytes, formatMs } from './stats'
import type { BenchmarkCaseResult, BenchmarkMode, BenchmarkReport } from './types'

type CaseNameFormatter = (result: BenchmarkCaseResult) => string

interface WebComparisonMode {
  title: string
  mode: BenchmarkMode
  baselineViteId: string
  baselinePostcssId: string
  ids: string[]
}

const WEB_COMPARISON_MODES: WebComparisonMode[] = [
  {
    title: 'Vite 构建',
    mode: 'vite-build',
    baselineViteId: 'vite-official-vite',
    baselinePostcssId: 'vite-official-postcss',
    ids: [
      'vite-official-postcss',
      'vite-official-vite',
      'vite-weapp-target-web',
      'vite-weapp-target-web-compact',
    ],
  },
  {
    title: 'Vite dev/HMR',
    mode: 'vite-hmr',
    baselineViteId: 'hmr-official-vite',
    baselinePostcssId: 'hmr-official-postcss',
    ids: [
      'hmr-official-postcss',
      'hmr-official-vite',
      'hmr-weapp-target-web',
      'hmr-weapp-target-web-compact',
    ],
  },
]

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

function formatRatio(next: number | undefined, base: number | undefined) {
  if (!next || !base || base === 0) {
    return '-'
  }
  return `${(next / base).toFixed(2)}x`
}

function formatPercentDelta(next: number | undefined, base: number | undefined) {
  if (!next || !base || base === 0) {
    return '-'
  }
  const pct = ((next - base) / base) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

function successful(results: BenchmarkCaseResult[]) {
  return results.filter(result => !result.error && result.runsMs.length > 0)
}

function resultById(results: BenchmarkCaseResult[], id: string) {
  return results.find(result => result.id === id && !result.error)
}

function fastest(results: BenchmarkCaseResult[]) {
  return successful(results).sort((a, b) => a.stats.median - b.stats.median)[0]
}

function renderRows(
  mode: WebComparisonMode,
  results: BenchmarkCaseResult[],
  caseName: CaseNameFormatter,
) {
  const baselineVite = resultById(results, mode.baselineViteId)
  const baselinePostcss = resultById(results, mode.baselinePostcssId)
  return mode.ids
    .map(id => resultById(results, id))
    .filter((result): result is BenchmarkCaseResult => Boolean(result))
    .map(result => [
      caseName(result),
      result.plugin,
      formatMs(result.stats.median),
      formatRatio(result.stats.median, baselineVite?.stats.median),
      formatRatio(result.stats.median, baselinePostcss?.stats.median),
      formatBytes(result.outputCssBytes),
      formatPercentDelta(result.outputCssBytes, baselineVite?.outputCssBytes),
      result.selectorCount ?? '-',
      result.memory ? formatBytes(result.memory.rssPeakBytes) : '-',
      result.memory ? formatBytes(result.memory.rssDeltaBytes) : '-',
      result.memory ? formatBytes(result.memory.heapPeakBytes) : '-',
    ])
}

function renderModeSummary(
  mode: WebComparisonMode,
  results: BenchmarkCaseResult[],
  caseName: CaseNameFormatter,
) {
  const modeResults = mode.ids
    .map(id => resultById(results, id))
    .filter((result): result is BenchmarkCaseResult => Boolean(result))
  const fastestResult = fastest(modeResults)
  const web = resultById(results, mode.ids.find(id => id.includes('target-web') && !id.includes('compact')) ?? '')
  const compact = resultById(results, mode.ids.find(id => id.includes('target-web-compact')) ?? '')
  const lines: string[] = []
  if (fastestResult) {
    lines.push(`- ${mode.title}：中位数最快的是 ${caseName(fastestResult)}，为 ${formatMs(fastestResult.stats.median)}。`)
  }
  if (web && compact) {
    lines.push(
      `- ${mode.title}：web-compact 相对普通 web 的耗时比例为 ${formatRatio(compact.stats.median, web.stats.median)}，CSS 大小变化 ${formatPercentDelta(compact.outputCssBytes, web.outputCssBytes)}，RSS 峰值变化 ${formatPercentDelta(compact.memory?.rssPeakBytes, web.memory?.rssPeakBytes)}。`,
    )
  }
  return lines
}

export function renderWebTargetComparison(report: BenchmarkReport, caseName: CaseNameFormatter) {
  const lines = [
    '## Web target 与官方插件对比',
    '',
    "`weapp-tailwindcss/vite generator.target='web'` 用来观察浏览器 Web 输出路径；`web-compact` 在本报告中固定为 `generator.target='web', webCompat=true`，用于观察 legacy WebView 兼容降级后的耗时、产物体积、选择器数量和内存变化。",
    '',
    '对比基线包含 `@tailwindcss/postcss` 与 `@tailwindcss/vite`。表格里的“相对 @tailwindcss/vite”和“相对 @tailwindcss/postcss”均以中位数耗时计算；低于 `1.00x` 表示更快，高于 `1.00x` 表示更慢。',
    '',
  ]

  for (const scenario of report.scenarios) {
    const scenarioResults = report.results.filter(result => result.scenarioId === scenario.id)
    lines.push(`### ${scenario.name}`, '')
    for (const mode of WEB_COMPARISON_MODES) {
      if (mode.mode === 'vite-hmr' && !report.parameters.includeHmr) {
        continue
      }
      const rows = renderRows(mode, scenarioResults, caseName)
      if (rows.length === 0) {
        continue
      }
      lines.push(
        `#### ${mode.title}`,
        '',
        ...renderModeSummary(mode, scenarioResults, caseName),
        '',
        table(
          ['用例', '插件', '中位数', '相对 @tailwindcss/vite', '相对 @tailwindcss/postcss', 'CSS 大小', 'CSS 体积相对 vite', '选择器数', 'RSS 峰值', 'RSS 增量', 'Heap 峰值'],
          rows,
        ),
        '',
      )
    }
  }

  return lines
}
