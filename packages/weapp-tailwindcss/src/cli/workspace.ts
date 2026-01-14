import type { WorkspacePatchOptions, WorkspacePatchResult } from './workspace/types'
import path from 'node:path'
import process from 'node:process'
import { findWorkspaceRoot } from '@/context/workspace'
import { logger } from '@/logger'
import { resolveWorkspacePackageDirs, tryReadJson } from './workspace/package-dirs'
import { patchWorkspacePackage, summarizeWorkspaceResults } from './workspace/patch-package'

export async function patchWorkspace(options: WorkspacePatchOptions) {
  const cwd = options.cwd ?? process.cwd()
  const workspaceRoot = findWorkspaceRoot(cwd) ?? cwd
  const packageDirs = await resolveWorkspacePackageDirs(workspaceRoot)
  if (packageDirs.length === 0) {
    logger.warn('未在 %s 检测到 workspace 包，已跳过批量 patch。', workspaceRoot)
    return
  }

  const results: WorkspacePatchResult[] = []

  for (const dir of packageDirs) {
    const pkgJsonPath = path.join(dir, 'package.json')
    const pkgJson = tryReadJson<{ name?: string }>(pkgJsonPath)
    results.push(await patchWorkspacePackage(workspaceRoot, dir, pkgJson?.name, options))
  }
  summarizeWorkspaceResults(results)
}
