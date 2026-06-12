import { access, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  collectCandidatesFromSources,
  demoSources,
  generateStyleFromCandidates,
  runDemo,
} from './index'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

async function createTempDir() {
  const dir = await mkdtemp(path.join(tmpdir(), 'tailwindcss-patch-token-style-'))
  tempDirs.push(dir)
  return dir
}

describe('tailwindcss-patch token style example', () => {
  it('extracts candidates from mixed source types', async () => {
    const candidates = await collectCandidatesFromSources(demoSources)

    expect(candidates).toContain('min-h-screen')
    expect(candidates).toContain('rounded-[18px]')
    expect(candidates).toContain('bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_100%)]')
    expect(candidates).toContain('inline-flex')
  })

  it('generates css from extracted candidates', async () => {
    const candidates = await collectCandidatesFromSources(demoSources)
    const result = await generateStyleFromCandidates(candidates)

    expect(result.classSet).toContain('min-h-screen')
    expect(result.classSet).toContain('rounded-[18px]')
    expect(result.css).toContain('.min-h-screen')
    expect(result.css).toContain('.rounded-\\[18px\\]')
  })

  it('writes token and style artifacts', async () => {
    const outputRoot = await createTempDir()
    const result = await runDemo({ outputRoot })

    expect(result.tokens.length).toBeGreaterThan(0)
    await expect(access(path.join(outputRoot, 'dist', 'tokens.json'))).resolves.toBeUndefined()
    await expect(access(path.join(outputRoot, 'dist', 'style.css'))).resolves.toBeUndefined()
  })
})
