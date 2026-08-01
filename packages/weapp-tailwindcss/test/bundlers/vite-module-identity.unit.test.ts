import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { hasSameViteModuleIdentity, resolveViteModuleIdentity } from '@/bundlers/vite/module-identity'

describe('bundlers/vite module identity', () => {
  it('normalizes Windows drive casing, separators, query fragments, and /@fs/ urls', () => {
    const root = 'C:\\Work\\UniAppX'
    const ids = [
      'C:\\Work\\UniAppX\\src\\pages\\Index.uvue?vue&type=style',
      'c:/work/uniappx/src/pages/index.uvue#style',
      '/@fs/C:/WORK/UNIAPPX/src/pages/index.uvue?direct',
      'file:///c:/work/uniappx/src/pages/index.uvue',
    ]
    const identities = ids.map(id => resolveViteModuleIdentity(id, root))

    expect(new Set(identities.map(identity => identity.key)).size).toBe(1)
    expect(hasSameViteModuleIdentity(ids[0], ids[2], root)).toBe(true)
    expect(identities[0]?.key).toBe('c:/work/uniappx/src/pages/index.uvue')
  })

  it('uses the real path as identity for project aliases and junction-compatible links', async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tw-module-identity-'))
    const projectRoot = path.join(tempRoot, 'project')
    const aliasRoot = path.join(tempRoot, 'project-alias')
    try {
      await fs.mkdir(path.join(projectRoot, 'src'), { recursive: true })
      await fs.writeFile(path.join(projectRoot, 'src/main.css'), '@import "tailwindcss";', 'utf8')
      await fs.symlink(projectRoot, aliasRoot, process.platform === 'win32' ? 'junction' : 'dir')

      const projectFile = path.join(projectRoot, 'src/main.css')
      const aliasFile = path.join(aliasRoot, 'src/main.css')
      expect(resolveViteModuleIdentity(projectFile).key).toBe(resolveViteModuleIdentity(aliasFile).key)

      const deletedProjectFile = path.join(projectRoot, 'src/deleted.uvue')
      const deletedAliasFile = path.join(aliasRoot, 'src/deleted.uvue')
      expect(resolveViteModuleIdentity(deletedProjectFile).key).toBe(resolveViteModuleIdentity(deletedAliasFile).key)
    }
    finally {
      await fs.rm(tempRoot, { recursive: true, force: true })
    }
  })
})
