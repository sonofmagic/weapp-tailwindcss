import { cpus, release } from 'node:os'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createBenchmarkCases } from './cases'
import { countSelectors } from './css-runners'
import { createBenchmarkFixture } from './fixture'
import { summarize } from './stats'
import type {
  BenchmarkCase,
  BenchmarkCaseResult,
  BenchmarkMemoryStats,
  BenchmarkOptions,
  BenchmarkReport,
  BenchmarkScenarioSummary,
  CaseRunResult,
} from './types'

const require = createRequire(import.meta.url)
const execFileAsync = promisify(execFile)

function createMemorySampler() {
  const before = process.memoryUsage()
  let rssPeakBytes = before.rss
  let heapPeakBytes = before.heapUsed

  function sample() {
    const current = process.memoryUsage()
    rssPeakBytes = Math.max(rssPeakBytes, current.rss)
    heapPeakBytes = Math.max(heapPeakBytes, current.heapUsed)
    return current
  }

  const timer = setInterval(sample, 10)
  timer.unref()

  return {
    sample,
    stop(): BenchmarkMemoryStats {
      clearInterval(timer)
      const after = sample()
      return {
        rssBeforeBytes: before.rss,
        rssAfterBytes: after.rss,
        rssPeakBytes,
        rssDeltaBytes: after.rss - before.rss,
        heapBeforeBytes: before.heapUsed,
        heapAfterBytes: after.heapUsed,
        heapPeakBytes,
        heapDeltaBytes: after.heapUsed - before.heapUsed,
      }
    },
  }
}

async function measureCase(testCase: BenchmarkCase, options: Pick<BenchmarkOptions, 'runs' | 'warmups'>): Promise<BenchmarkCaseResult> {
  const warmupMs: number[] = []
  const runsMs: number[] = []
  let lastResult: CaseRunResult | undefined
  const memory = createMemorySampler()

  try {
    for (let index = 0; index < options.warmups; index += 1) {
      memory.sample()
      const start = performance.now()
      lastResult = await testCase.run()
      warmupMs.push(performance.now() - start)
      memory.sample()
    }
    for (let index = 0; index < options.runs; index += 1) {
      memory.sample()
      const start = performance.now()
      lastResult = await testCase.run()
      runsMs.push(performance.now() - start)
      memory.sample()
    }
  }
  catch (error) {
    memory.stop()
    throw error
  }
  finally {
    memory.sample()
  }

  const css = lastResult?.css ?? ''
  const result: BenchmarkCaseResult = {
    id: testCase.id,
    name: testCase.name,
    mode: testCase.mode,
    plugin: testCase.plugin,
    scenarioId: testCase.scenarioId,
    scenarioName: testCase.scenarioName,
    warmupMs,
    runsMs,
    stats: summarize(runsMs),
    outputCssBytes: Buffer.byteLength(css),
    memory: memory.stop(),
    selectorCount: lastResult?.selectorCount ?? countSelectors(css),
  }
  if (lastResult?.details) {
    result.details = lastResult.details
  }
  if (lastResult?.classSetSize !== undefined) {
    result.classSetSize = lastResult.classSetSize
  }
  return result
}

function readPackageVersion(name: string) {
  try {
    return require(`${name}/package.json`).version as string
  }
  catch {
    try {
      let current = path.dirname(require.resolve(name))
      while (current !== path.dirname(current)) {
        const packageJsonPath = path.join(current, 'package.json')
        if (existsSync(packageJsonPath)) {
          return (JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version?: string }).version ?? null
        }
        current = path.dirname(current)
      }
      return null
    }
    catch {
      return null
    }
  }
}

async function readPnpmVersion() {
  try {
    const result = await execFileAsync('pnpm', ['--version'])
    return result.stdout.trim()
  }
  catch {
    return null
  }
}

async function createEnvironment() {
  return {
    node: process.version,
    pnpm: await readPnpmVersion(),
    platform: process.platform,
    arch: process.arch,
    osRelease: release(),
    cpus: [...new Set(cpus().map(cpu => cpu.model))],
    packageVersions: {
      '@tailwindcss/postcss': readPackageVersion('@tailwindcss/postcss'),
      '@tailwindcss/vite': readPackageVersion('@tailwindcss/vite'),
      tailwindcss: readPackageVersion('tailwindcss'),
      vite: readPackageVersion('vite'),
      'weapp-tailwindcss': readPackageVersion('weapp-tailwindcss'),
    },
  }
}

function createScenarioSummary(
  id: string,
  name: string,
  classCount: number,
  sourceFiles: number,
  fixture: Awaited<ReturnType<typeof createBenchmarkFixture>>,
): BenchmarkScenarioSummary {
  return {
    id,
    name,
    classCount,
    sourceFiles,
    candidateCount: fixture.candidates.length,
    appendedCandidateCount: fixture.appendedCandidates.length,
    hmrCandidateCount: fixture.hmrCandidates.length,
  }
}

export async function runBenchmark(options: BenchmarkOptions): Promise<BenchmarkReport> {
  const scenarioInputs = [
    {
      id: 'default',
      name: '默认规模',
      classCount: options.classCount,
      sourceFiles: options.sourceFiles,
    },
    ...(options.includeLarge
      ? [{
          id: 'large-selectors',
          name: '大数量级选择器',
          classCount: options.largeClassCount,
          sourceFiles: options.largeSourceFiles,
        }]
      : []),
  ]

  const results: BenchmarkCaseResult[] = []
  const scenarios: BenchmarkScenarioSummary[] = []

  for (const scenario of scenarioInputs) {
    const fixture = await createBenchmarkFixture({
      classCount: scenario.classCount,
      sourceFiles: scenario.sourceFiles,
    })

    try {
      scenarios.push(createScenarioSummary(
        scenario.id,
        scenario.name,
        scenario.classCount,
        scenario.sourceFiles,
        fixture,
      ))
      const cases = await createBenchmarkCases(fixture, {
        includeHmr: options.includeHmr,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
      })
      for (const testCase of cases) {
        try {
          results.push(await measureCase(testCase, options))
        }
        catch (error) {
          const message = error instanceof Error ? error.stack ?? error.message : String(error)
          results.push({
            id: testCase.id,
            name: testCase.name,
            mode: testCase.mode,
            plugin: testCase.plugin,
            scenarioId: testCase.scenarioId,
            scenarioName: testCase.scenarioName,
            warmupMs: [],
            runsMs: [],
            stats: summarize([]),
            outputCssBytes: 0,
            error: message,
          })
        }
        finally {
          await testCase.dispose?.()
        }
      }
    }
    finally {
      if (!options.keepTemp) {
        await rm(fixture.root, { recursive: true, force: true })
      }
    }
  }

  const report: BenchmarkReport = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    environment: await createEnvironment(),
    parameters: {
      runs: options.runs,
      warmups: options.warmups,
      classCount: options.classCount,
      sourceFiles: options.sourceFiles,
      largeClassCount: options.largeClassCount,
      largeSourceFiles: options.largeSourceFiles,
      includeLarge: options.includeLarge,
      includeHmr: options.includeHmr,
    },
    scenarios,
    results,
  }
  await mkdir(path.dirname(options.out), { recursive: true })
  await writeFile(options.out, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  return report
}
