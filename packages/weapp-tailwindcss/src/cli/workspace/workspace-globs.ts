import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { tryReadJson } from './workspace-io'

export function parseWorkspaceGlobsFromPackageJson(workspaceRoot: string) {
  const pkgJsonPath = path.join(workspaceRoot, 'package.json')
  const pkg = tryReadJson<{ workspaces?: string[] | { packages?: string[] } }>(pkgJsonPath)
  if (!pkg?.workspaces) {
    return []
  }
  if (Array.isArray(pkg.workspaces)) {
    return pkg.workspaces.filter(Boolean)
  }
  if (Array.isArray(pkg.workspaces.packages)) {
    return pkg.workspaces.packages.filter(Boolean)
  }
  return []
}

export function parseWorkspaceGlobsFromWorkspaceFile(workspaceRoot: string) {
  const workspaceFile = path.join(workspaceRoot, 'pnpm-workspace.yaml')
  if (!existsSync(workspaceFile)) {
    return []
  }
  try {
    const parsed = parseYaml(readFileSync(workspaceFile, 'utf8')) as { packages?: string[] } | undefined
    return Array.isArray(parsed?.packages) ? parsed!.packages.filter(Boolean) : []
  }
  catch {
    return []
  }
}
