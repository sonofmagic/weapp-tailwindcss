import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { describe, expect, it } from 'vitest'

describe('project build module', () => {
  it('loads in the standalone tsx runtime used by IDE probes', async () => {
    const root = path.resolve(import.meta.dirname, '..')
    const result = await execa(process.execPath, [
      '--import',
      'tsx',
      '--eval',
      'import(\'./e2e/projectBuild.ts\')',
    ], {
      cwd: root,
    })

    expect(result.exitCode).toBe(0)
  })
})
