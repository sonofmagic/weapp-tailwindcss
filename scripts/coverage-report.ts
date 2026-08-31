import type { CoverageEvidence, CoverageReport } from '../e2e/coverageReport'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createCoverageReport, readCommittedCompatibilityEvidence, validateCoverageReport } from '../e2e/coverageReport'

function value(name: string, fallback: string) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback
}

async function readEvidence(file: string | undefined) {
  if (!file) {
    return [] as CoverageEvidence[]
  }
  const raw = JSON.parse(await fs.readFile(path.resolve(file), 'utf8')) as unknown
  if (!Array.isArray(raw)) {
    throw new TypeError(`coverage evidence must be an array: ${file}`)
  }
  return raw as CoverageEvidence[]
}

async function main() {
  const source = value('--source', process.env['COVERAGE_REPORT_SOURCE'] ?? 'aggregate') as CoverageReport['source']
  if (!['ci', 'nightly', 'local', 'aggregate'].includes(source)) {
    throw new Error(`invalid coverage report source: ${source}`)
  }
  const evidence = await readEvidence(process.env['COVERAGE_REPORT_INPUT'] ?? (process.argv.includes('--input') ? value('--input', '') : undefined))
  if (process.argv.includes('--include-baselines')) {
    evidence.push(...await readCommittedCompatibilityEvidence(process.cwd()))
  }
  const report = createCoverageReport(evidence, source)
  validateCoverageReport(report)
  const output = path.resolve(value('--out', process.env['COVERAGE_REPORT_OUT'] ?? 'e2e/.artifacts/coverage/coverage-report.json'))
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  process.stdout.write(`[coverage-report] ${report.summary.coveragePercent}% verified (${report.summary.requiredUnverified} required unverified)\n`)
  process.stdout.write(`[coverage-report] report written: ${path.relative(process.cwd(), output)}\n`)
  if ((source === 'ci' || source === 'nightly') && report.summary.requiredUnverified > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
