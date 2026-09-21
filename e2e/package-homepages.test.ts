import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const root = fileURLToPath(new URL('../', import.meta.url))

describe('published package homepages', () => {
  it('includes every public package in the homepage contract', () => {
    const output = execFileSync(process.execPath, [
      path.join(root, 'scripts', 'verify-package-homepages.mjs'),
      '--skip-network',
    ], { cwd: root, encoding: 'utf8', timeout: 30_000 })
    expect(output).toContain('Validated homepages for')
  })

  it.each(['cn', 'merge'])('uses the declared documentation route for %s', async (name) => {
    const doc = await readFile(path.join(root, 'website', 'docs', 'community', 'merge', 'overview.mdx'), 'utf8')
    const frontmatter = doc.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    expect(frontmatter).not.toBeNull()
    const { slug } = parse(frontmatter![1]!)
    const manifest = JSON.parse(await readFile(path.join(root, 'packages-runtime', name, 'package.json'), 'utf8'))
    expect(new URL(manifest.homepage).pathname).toBe(`/docs${slug}`)
  })
})
