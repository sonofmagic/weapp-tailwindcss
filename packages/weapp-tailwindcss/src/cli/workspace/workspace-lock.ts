import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

export function parseImportersFromLock(workspaceRoot: string) {
  const lockPath = path.join(workspaceRoot, 'pnpm-lock.yaml')
  if (!existsSync(lockPath)) {
    return []
  }
  try {
    const parsed = parseYaml(readFileSync(lockPath, 'utf8')) as { importers?: Record<string, unknown> } | undefined
    const importers = parsed?.importers
    if (!importers) {
      return []
    }
    return Object.keys(importers).map((key) => {
      if (!key || key === '.') {
        return workspaceRoot
      }
      return path.join(workspaceRoot, key)
    })
  }
  catch {
    return []
  }
}
