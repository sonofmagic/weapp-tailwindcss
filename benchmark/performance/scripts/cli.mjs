#!/usr/bin/env node
import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import scenariosConfig from '../scenarios.json' with { type: 'json' }
import { measureRuntimeBundles } from '../src/bundles.mjs'
import { evaluateSyntheticGate, loadGateConfig } from '../src/gate.mjs'
import { renderReport } from '../src/report.mjs'
import { createScenarios, resultOf } from '../src/scenarios.mjs'
import { summarize } from '../src/stats.mjs'

const execFileAsync = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(root, '../..')

function arg(name, fallback) {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : process.argv[index + 1] ?? fallback
}

function has(name) {
  return process.argv.includes(name)
}

async function gitHead() {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA
  }
  return (await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot })).stdout.trim()
}

async function runScenario(testCase, warmups, runs) {
  const subject = testCase.fresh ? undefined : await testCase.create()
  const samples = []
  const memories = []
  const hashes = []
  let latest
  const execute = async () => {
    const started = performance.now()
    const before = process.memoryUsage()
    const runner = testCase.fresh ? await testCase.create() : subject
    latest = resultOf(await runner())
    const after = process.memoryUsage()
    samples.push(performance.now() - started)
    memories.push({
      rssMb: after.rss / 1024 / 1024,
      rssDeltaMb: (after.rss - before.rss) / 1024 / 1024,
      heapDeltaMb: (after.heapUsed - before.heapUsed) / 1024 / 1024,
    })
    hashes.push(latest.outputHash)
  }
  for (let index = 0; index < warmups; index += 1) {
    await execute()
  }
  const coldMs = samples[0]
  samples.length = 0
  memories.length = 0
  hashes.length = 0
  for (let index = 0; index < runs; index += 1) {
    await execute()
  }
  return {
    id: testCase.id,
    group: testCase.group,
    complexityGroup: testCase.complexityGroup ?? testCase.group,
    size: testCase.size,
    sampleCount: samples.length,
    coldMs,
    time: summarize(samples),
    memory: {
      peakRssMb: Math.max(...memories.map(item => item.rssMb)),
      peakRssDeltaMb: Math.max(...memories.map(item => item.rssDeltaMb)),
      heapDeltaMb: Math.max(...memories.map(item => item.heapDeltaMb)),
    },
    outputBytes: latest.outputBytes,
    outputHashes: [...new Set(hashes)],
  }
}

async function updateBaseline(results, config) {
  const next = structuredClone(config.budgets)
  next.generatedAt = new Date().toISOString()
  next.commit = await gitHead()
  for (const result of results) {
    next.cases[result.id] = {
      medianMs: Math.ceil(result.time.median * 1.2),
      p95Ms: Math.ceil(result.time.p95 * 1.2),
      peakRssMb: Math.ceil(result.memory.peakRssMb * 1.2),
      outputBytes: Math.ceil(result.outputBytes * 1.2),
    }
  }
  await fs.writeFile(path.join(root, 'budgets.json'), `${JSON.stringify(next, null, 2)}\n`, 'utf8')
}

async function runRealGuard(outDir) {
  const resultDir = path.join(outDir, 'real')
  await execFileAsync(process.execPath, [
    'benchmark/version-compare/scripts/run-ci.mjs',
    '--guard',
    '--result-dir',
    resultDir,
  ], { cwd: repoRoot, env: { ...process.env, CI: '1' } })
}

async function main() {
  const outDir = path.resolve(arg('--out-dir', path.join(repoRoot, '.tmp/performance-report')))
  const warmups = Number(arg('--warmups', scenariosConfig.warmups))
  const runs = Number(arg('--runs', scenariosConfig.runs))
  if (!Number.isInteger(warmups) || warmups < 0 || !Number.isInteger(runs) || runs < 1) {
    throw new Error('--warmups 必须是非负整数，--runs 必须是正整数')
  }
  const selectedGroups = arg('--suite', '')
  const config = { ...scenariosConfig, includeStress: has('--include-stress'), ...(selectedGroups ? { groups: selectedGroups.split(',').filter(Boolean) } : {}) }
  const cases = createScenarios(config)
  await fs.mkdir(outDir, { recursive: true })
  const results = []
  for (const testCase of cases) {
    process.stdout.write(`[performance] ${testCase.id}\n`)
    results.push(await runScenario(testCase, warmups, runs))
  }
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    commit: await gitHead(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpu: os.cpus()[0]?.model ?? 'unknown',
    },
    options: { warmups, runs, groups: config.groups },
    cases: results,
  }
  const gateConfig = await loadGateConfig(root)
  const bundles = await measureRuntimeBundles()
  report.bundles = bundles
  const gate = evaluateSyntheticGate(report, gateConfig)
  await fs.writeFile(path.join(outDir, 'synthetic.json'), `${JSON.stringify({ report, gate }, null, 2)}\n`, 'utf8')
  await fs.writeFile(path.join(outDir, 'synthetic.md'), renderReport(report, gate), 'utf8')
  await fs.writeFile(path.join(outDir, 'replay.json'), `${JSON.stringify({
    command: 'pnpm perf:report',
    args: process.argv.slice(2),
    cwd: repoRoot,
    commit: report.commit,
    environment: report.environment,
  }, null, 2)}\n`, 'utf8')
  if (has('--update-baseline')) {
    await updateBaseline(results, gateConfig)
  }
  if (has('--with-real')) {
    await runRealGuard(outDir)
  }
  process.stdout.write(`[performance] report: ${path.join(outDir, 'synthetic.md')}\n`)
  process.stdout.write(`[performance] gate: ${gate.passed ? 'passed' : 'failed'}; violations=${gate.violations.length}; observations=${gate.observations.length}\n`)
  if (has('--guard') && !gate.passed) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
