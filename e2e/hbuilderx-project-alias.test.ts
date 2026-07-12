import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createHBuilderXProjectAlias, createHBuilderXProjectAliasName } from '../scripts/hbuilderx-project-alias.mjs'

describe('HBuilderX project alias', () => {
  it('separates same-name projects from different worktrees', () => {
    const main = createHBuilderXProjectAliasName('/repo/main/demo/uni-app-x', 42)
    const worktree = createHBuilderXProjectAliasName('/repo/worktree/demo/uni-app-x', 42)

    expect(main).not.toBe(worktree)
    expect(main).toMatch(/^uni-app-x-[a-f0-9]{10}-42$/)
    expect(worktree).toMatch(/^uni-app-x-[a-f0-9]{10}-42$/)
  })

  it('separates concurrent launches of the same project', () => {
    const first = createHBuilderXProjectAliasName('/repo/demo/uni-app-x', 42)
    const second = createHBuilderXProjectAliasName('/repo/demo/uni-app-x', 43)

    expect(first).not.toBe(second)
  })

  it('keeps source mutations on the imported alias path and real project in sync', async () => {
    const projectRoot = await fs.mkdtemp(path.join(tmpdir(), 'hbuilderx-project-alias-source-'))
    const sourceFile = path.join(projectRoot, 'pages.uvue')
    await fs.writeFile(sourceFile, 'before')
    const alias = await createHBuilderXProjectAlias(projectRoot)
    try {
      await fs.writeFile(path.join(alias.projectPath, 'pages.uvue'), 'after')
      expect(await fs.readFile(sourceFile, 'utf8')).toBe('after')
    }
    finally {
      await alias.cleanup()
      await fs.rm(projectRoot, { recursive: true, force: true })
    }
  })
})
