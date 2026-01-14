import { existsSync } from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'
import { parseWorkspaceGlobsFromPackageJson, parseWorkspaceGlobsFromWorkspaceFile } from './workspace-globs'
import { tryReadJson } from './workspace-io'
import { parseImportersFromLock } from './workspace-lock'

export async function resolveWorkspacePackageDirs(workspaceRoot: string) {
  const dirs = new Set<string>()
  for (const importerDir of parseImportersFromLock(workspaceRoot)) {
    dirs.add(path.normalize(importerDir))
  }

  if (!dirs.size) {
    let globs = parseWorkspaceGlobsFromWorkspaceFile(workspaceRoot)
    if (!globs.length) {
      globs = parseWorkspaceGlobsFromPackageJson(workspaceRoot)
    }
    if (globs.length > 0) {
      const patterns = globs.map((pattern) => {
        const normalized = pattern.replace(/\\/g, '/').replace(/\/+$/, '')
        return normalized.endsWith('package.json') ? normalized : `${normalized}/package.json`
      })
      const packageJsonFiles = await fg(patterns, {
        cwd: workspaceRoot,
        absolute: true,
        onlyFiles: true,
        unique: true,
        ignore: ['**/node_modules/**', '**/.git/**'],
      })
      for (const file of packageJsonFiles) {
        dirs.add(path.normalize(path.dirname(file)))
      }
    }
  }

  const rootPkg = path.join(workspaceRoot, 'package.json')
  if (existsSync(rootPkg)) {
    dirs.add(path.normalize(workspaceRoot))
  }

  return [...dirs]
}

export { tryReadJson }
