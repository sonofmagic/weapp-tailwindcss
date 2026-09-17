import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildCases } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'
import { collectArtifactMtimes, countChangedArtifacts, readArtifacts } from './frameworkIdeHotUpdateArtifacts'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => fs.rm(root, { recursive: true, force: true })))
})

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ide-style-graph-'))
  roots.push(root)
  const shell = path.join(root, 'entry.acss')
  const generated = path.join(root, 'chunks', 'generated.acss')
  await fs.mkdir(path.dirname(generated))
  await fs.writeFile(shell, '@import "./chunks/generated.acss";')
  await fs.writeFile(generated, '@import "../entry.acss";\n.before { color: red; }')
  await fs.writeFile(path.join(root, 'unused.acss'), '.unreachable {}')
  const base = buildCases(root, { includeLocalOnly: true }).find(item => item.name === 'gulp-tailwindcss-v4')!
  return {
    generated,
    shell,
    watchCase: {
      ...base,
      cwd: root,
      outputWxml: path.join(root, 'page.axml'),
      outputJs: path.join(root, 'page.js'),
      outputStyleCandidates: [shell],
      globalStyleCandidates: [shell],
    },
  }
}

describe('IDE HMR style artifact graph', () => {
  it('observes imported stylesheet changes while the import shell stays unchanged', async () => {
    const { watchCase, generated, shell } = await fixture()
    const before = await collectArtifactMtimes(watchCase)
    expect(before.artifacts.map(item => item.file)).toEqual([shell, generated])
    expect(before.mtimes.has(generated)).toBe(true)

    await fs.appendFile(generated, '\n.hmr-marker { padding: 16rpx; }')
    const after = await readArtifacts(watchCase)
    expect(countChangedArtifacts(before.artifacts, after)).toBe(1)
    expect(after.find(item => item.file === generated)?.content).toContain('.hmr-marker')
    expect(after.find(item => item.file === shell)).toEqual(before.artifacts[0])
    expect(after.some(item => item.content.includes('.unreachable'))).toBe(false)
  })

  it('fails when a reachable stylesheet is missing instead of accepting the shell', async () => {
    const { watchCase, generated } = await fixture()
    await fs.rm(generated)
    await expect(readArtifacts(watchCase)).rejects.toThrow(/ENOENT/)
  })
})
