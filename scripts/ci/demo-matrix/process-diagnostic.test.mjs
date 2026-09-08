import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { expect, it } from 'vitest'
import { repo } from './catalog.mjs'

it.each([
  { source: 'Promise.resolve()', code: 0, events: ['start', 'beforeExit', 'exit'] },
  { source: 'process.exit(7)', code: 7, events: ['start', 'exit'] },
  { source: 'throw new Error("diagnostic-probe")', code: 1, events: ['start', 'uncaughtException', 'exit'] },
])('records process lifecycle without masking exit $code', async ({ source, code, events }) => {
  const result = await execa(process.execPath, [
    '--require',
    path.join(repo, 'scripts/ci/demo-matrix/process-diagnostic.cjs'),
    '-e',
    source,
  ], { reject: false, timeout: 5000 })
  expect(result.exitCode).toBe(code)
  const records = result.stderr.split('\n').filter(line => line.startsWith('[demo-process] ')).map(line => JSON.parse(line.slice('[demo-process] '.length)))
  expect(records.map(record => record.event)).toEqual(events)
  expect(records.at(-1).code).toBe(code)
  expect(records.every(record => record.pid > 0 && Array.isArray(record.resources))).toBe(true)
  if (code === 1) {
    expect(records.find(record => record.event === 'uncaughtException').error).toContain('diagnostic-probe')
  }
})
