import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { writeStableJson } from './write-stable-json.mjs'

const tempDirs = []

function createTempFile(name) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'website-stable-json-'))
  tempDirs.push(tempDir)
  return path.join(tempDir, name)
}

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})

describe('writeStableJson', () => {
  it('skips rewriting when only generatedAt changes', () => {
    const file = createTempFile('index.json')
    const previousRaw = '{\n  "version": "1.0.0",\n  "generatedAt": "2026-03-12T00:00:00.000Z",\n  "totals": {\n    "all": 1\n  }\n}\n'
    fs.writeFileSync(file, previousRaw, 'utf8')

    const changed = writeStableJson(file, {
      version: '1.0.0',
      generatedAt: '2026-03-13T00:00:00.000Z',
      totals: { all: 1 },
    })

    expect(changed).toBe(false)
    expect(fs.readFileSync(file, 'utf8')).toBe(previousRaw)
  })

  it('rewrites file when non-volatile content changes', () => {
    const file = createTempFile('report.json')
    fs.writeFileSync(file, '{\n  "generatedAt": "2026-03-12T00:00:00.000Z",\n  "totals": {\n    "issues": 1\n  }\n}\n', 'utf8')

    const changed = writeStableJson(file, {
      generatedAt: '2026-03-13T00:00:00.000Z',
      totals: { issues: 2 },
    })

    expect(changed).toBe(true)
    expect(fs.readFileSync(file, 'utf8')).toContain('"issues": 2')
  })
})
