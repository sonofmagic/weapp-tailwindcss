import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { afterEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const benchModule = require('../../../demo/bench.cjs')
const benchModulePath = require.resolve('../../../demo/bench.cjs')

const tempDirs: string[] = []

function createTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weapp-tw-bench-'))
  tempDirs.push(tempDir)
  return tempDir
}

afterEach(() => {
  delete process.env.WEAPP_TW_BENCH_OUTPUT_DIR
  delete process.env.WEAPP_TW_BENCH_WRITE_REPO_DATA
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})

describe('demo bench output directory', () => {
  it('defaults to workspace tmp directory', () => {
    const outputDir = benchModule.resolveBenchOutputDir()
    expect(outputDir).toBe(path.resolve(path.dirname(benchModulePath), '../.tmp/benchmark-app/data'))
  })

  it('respects explicit output directory override', () => {
    const tempDir = createTempDir()
    process.env.WEAPP_TW_BENCH_OUTPUT_DIR = tempDir

    const outputDir = benchModule.resolveBenchOutputDir()

    expect(outputDir).toBe(tempDir)
  })

  it('writes benchmark samples into overridden directory', () => {
    const tempDir = createTempDir()
    process.env.WEAPP_TW_BENCH_OUTPUT_DIR = tempDir
    const bench = benchModule('unit-case')
    bench.startTs = 0
    bench.endTs = 12

    bench.dump('build')

    const [filename] = fs.readdirSync(tempDir)
    const payload = JSON.parse(fs.readFileSync(path.join(tempDir, filename), 'utf8'))
    expect(payload['unit-case'].build).toEqual([12])
  })
})
