import { cpus, release } from 'node:os'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { countSelectors, createBenchmarkCases, type BenchmarkCase, type CaseRunResult } from './cases'
import { createBenchmarkFixture } from './fixture'
import { summarize } from './stats'
import type { BenchmarkCaseResult, BenchmarkOptions, BenchmarkReport } from './types'

const require = createRequire(import.meta.url)
const execFileAsync = promisify(execFile)

async function measureCase(testCase: BenchmarkCase, options: Pick<BenchmarkOptions, 'runs' | 'warmups'>): Promise<BenchmarkCaseResult> {
  const warmupMs: number[] = []
  const runsMs: number[] = []
  let lastResult: CaseRunResult | undefined

  for (let index = 0; index < options.warmups; index += 1) {
    const start = performance.now()
    lastResult = await testCase.run()
    warmupMs.push(performance.now() - start)
  }
  for (let index = 0; index < options.runs; index += 1) {
    const start = performance.now()
    lastResult = await testCase.run()
    runsMs.push(performance.now() - start)
  }

  const css = lastResult?.css ?? ''
  const result: BenchmarkCaseResult = {
    id: testCase.id,
    name: testCase.name,
    mode: testCase.mode,
    plugin: testCase.plugin,
    warmupMs,
    runsMs,
    stats: summarize(runsMs),
    outputCssBytes: Buffer.byteLength(css),
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

export async function runBenchmark(options: BenchmarkOptions): Promise<BenchmarkReport> {
  const fixture = await createBenchmarkFixture({
    classCount: options.classCount,
    sourceFiles: options.sourceFiles,
  })

  try {
    const cases = await createBenchmarkCases(fixture)
    const results: BenchmarkCaseResult[] = []
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
          warmupMs: [],
          runsMs: [],
          stats: summarize([]),
          outputCssBytes: 0,
          error: message,
        })
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
      },
      fixture: {
        classCount: options.classCount,
        sourceFiles: options.sourceFiles,
        candidateCount: fixture.candidates.length,
        appendedCandidateCount: fixture.appendedCandidates.length,
      },
      results,
    }
    await mkdir(path.dirname(options.out), { recursive: true })
    await writeFile(options.out, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    return report
  }
  finally {
    if (!options.keepTemp) {
      await rm(fixture.root, { recursive: true, force: true })
    }
  }
}
