import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runBenchmark } from '../src/runner'
import type { BenchmarkReport } from '../src/types'

describe('runBenchmark', () => {
  it('generates valid JSON at a custom output path', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-run-test-'))
    const out = path.join(root, 'result.json')
    const report = await runBenchmark({
      runs: 1,
      warmups: 0,
      classCount: 8,
      sourceFiles: 2,
      out,
      report: path.join(root, 'report.md'),
      keepTemp: false,
    })
    const parsed = JSON.parse(await readFile(out, 'utf8')) as BenchmarkReport
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.results.length).toBeGreaterThanOrEqual(8)
    expect(report.fixture.candidateCount).toBeGreaterThan(0)
  }, 120_000)
})
