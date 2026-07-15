import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sourceRoot = fileURLToPath(new URL('../src', import.meta.url))
const maximumLines = 500

async function collectTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return collectTypeScriptFiles(file)
    }
    return /\.tsx?$/.test(entry.name) ? [file] : []
  }))
  return files.flat()
}

describe('production source line limit', () => {
  it('keeps TypeScript source files within 500 physical lines', async () => {
    const oversized: string[] = []
    for (const file of await collectTypeScriptFiles(sourceRoot)) {
      const source = await readFile(file, 'utf8')
      const lines = source.length === 0 ? 0 : source.replace(/\r?\n$/, '').split(/\r?\n/).length
      if (lines > maximumLines) {
        oversized.push(`${path.relative(sourceRoot, file)}: ${lines} lines`)
      }
    }
    expect(oversized, `Production TypeScript files exceed ${maximumLines} lines:\n${oversized.join('\n')}`).toEqual([])
  })
})
