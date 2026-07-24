import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

function formatNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : '-'
}

function formatPercent(value, signed = true) {
  return typeof value === 'number' && Number.isFinite(value) ? `${signed && value >= 0 ? '+' : ''}${value.toFixed(2)}%` : '-'
}

function formatViolation(item) {
  if (item.message) {
    return `${item.key} / ${item.metric}: ${item.message}`
  }
  return `${item.key} / ${item.metric}: ${formatNumber(item.baseline)} -> ${formatNumber(item.current)} (${formatPercent(item.deltaPercent)}, threshold ${formatPercent(item.thresholdPercent, false)})`
}

export function collectBenchmarkDiagnostics(summary, source = 'summary.json') {
  const diagnostics = []
  for (const item of summary.currentOnlyErrors ?? []) {
    diagnostics.push(`${source}: ${item.key}: ${String(item.error)}`)
  }
  if (summary.performanceGuard?.passed === false) {
    for (const item of summary.performanceGuard.violations ?? []) {
      diagnostics.push(`${source}: ${formatViolation(item)}`)
    }
  }
  return diagnostics
}

function escapeAnnotation(value) {
  return value
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A')
}

export function formatGitHubErrorAnnotation(message) {
  return `::error title=Benchmark shard failure::${escapeAnnotation(message)}`
}

async function findSummaryFiles(root) {
  const files = []
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findSummaryFiles(file))
    }
    else if (entry.name === 'summary.json') {
      files.push(file)
    }
  }
  return files
}

async function main() {
  const root = path.resolve(process.argv[2] ?? '.tmp/benchmark-ci/artifacts')
  let summaryFiles = []
  try {
    summaryFiles = await findSummaryFiles(root)
  }
  catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }

  if (summaryFiles.length === 0) {
    process.stdout.write('::warning title=Benchmark diagnostics unavailable::No benchmark summary artifact was available; inspect the failed shard log.\n')
    return
  }

  let diagnosticCount = 0
  for (const file of summaryFiles.sort()) {
    const summary = JSON.parse(await fs.readFile(file, 'utf8'))
    for (const diagnostic of collectBenchmarkDiagnostics(summary, path.relative(root, file))) {
      diagnosticCount += 1
      process.stdout.write(`${formatGitHubErrorAnnotation(diagnostic)}\n`)
    }
  }
  if (diagnosticCount === 0) {
    process.stdout.write('::warning title=Benchmark shard failed without a reported regression::The shard exited unsuccessfully, but its summaries contain no current-only error or blocking performance violation. Inspect the failed shard log.\n')
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
