import { createHash } from 'node:crypto'
import { mkdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import process from 'node:process'

export function createHBuilderXProjectAliasName(projectRoot, processId = process.pid) {
  const resolvedRoot = resolve(projectRoot)
  const rootHash = createHash('sha256').update(resolvedRoot).digest('hex').slice(0, 10)
  const projectName = basename(resolvedRoot).replace(/[^\w.-]+/g, '-')
  return `${projectName}-${rootHash}-${processId}`
}

export async function createHBuilderXProjectAlias(projectRoot) {
  const aliasRoot = join(tmpdir(), 'weapp-tailwindcss-hbuilderx-projects')
  const projectName = createHBuilderXProjectAliasName(projectRoot)
  const projectPath = join(aliasRoot, projectName)
  await mkdir(aliasRoot, { recursive: true })
  await rm(projectPath, { recursive: true, force: true })
  await symlink(resolve(projectRoot), projectPath, process.platform === 'win32' ? 'junction' : 'dir')
  return {
    projectName,
    projectPath,
    async cleanup() {
      await rm(projectPath, { recursive: true, force: true })
    },
  }
}
