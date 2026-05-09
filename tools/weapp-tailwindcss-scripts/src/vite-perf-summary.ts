import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

interface Stats {
  mean: number
  median: number
  stddev: number
}

interface SummaryRow {
  metric: string
  optimized: Stats
  legacy: Stats
  improvementPercent: number
}

interface BenchReport {
  generatedAt: string
  summary: SummaryRow[]
}

function parseArg(flag: string, argv: string[]) {
  const index = argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }
  return argv[index + 1]
}

function toMarkdownTable(summary: SummaryRow[]) {
  const lines = [
    '| Metric | Optimized Mean (ms) | Optimized Median (ms) | Optimized StdDev (ms) | Legacy Mean (ms) | Legacy Median (ms) | Legacy StdDev (ms) | Improvement |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]

  for (const row of summary) {
    lines.push(
      `| ${row.metric} | ${row.optimized.mean.toFixed(2)} | ${row.optimized.median.toFixed(2)} | ${row.optimized.stddev.toFixed(2)} | ${row.legacy.mean.toFixed(2)} | ${row.legacy.median.toFixed(2)} | ${row.legacy.stddev.toFixed(2)} | ${row.improvementPercent.toFixed(2)}% |`,
    )
  }

  return lines.join('\n')
}

async function main() {
  const argv = process.argv.slice(2)
  const input = path.resolve(parseArg('--input', argv) ?? path.resolve(process.cwd(), 'benchmark/vite-adapter-perf-report.json'))
  const output = path.resolve(parseArg('--output', argv) ?? path.resolve(process.cwd(), 'benchmark/vite-adapter-perf-summary.md'))

  const raw = await fs.readFile(input, 'utf8')
  const report = JSON.parse(raw) as BenchReport
  const markdown = [
    '# Vite Adapter Performance Summary',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    toMarkdownTable(report.summary ?? []),
    '',
    '## Notes',
    '',
    '- `optimized` uses default runtime signature invalidation + dirty processing + JS precheck.',
    '- `legacy` enables env toggles to emulate baseline behavior:',
    '  - `WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH=1`',
    '  - `WEAPP_TW_VITE_DISABLE_DIRTY=1`',
    '  - `WEAPP_TW_VITE_DISABLE_JS_PRECHECK=1`',
    '',
  ].join('\n')

  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${markdown}\n`, 'utf8')
  process.stdout.write(`[bench] markdown summary written to ${output}\n`)
}

main().catch((error) => {
  console.error('[bench-summary] failed:', error)
  process.exitCode = 1
})
