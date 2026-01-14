import path from 'node:path'
import process from 'node:process'
import { findWorkspaceRoot } from '@/context/workspace'
import { getTailwindcssPackageInfo } from '@/tailwindcss'

/**
 * Resolve default working directory for `weapp-tw patch`.
 * Prefer explicit env overrides to avoid cross-package INIT_CWD pollution.
 */
function normalizeCandidatePath(baseDir: string, candidate: string | undefined) {
  if (!candidate) {
    return undefined
  }
  return path.isAbsolute(candidate) ? path.normalize(candidate) : path.resolve(baseDir, candidate)
}

function detectTailwindWorkspace(paths: string[]) {
  for (const candidate of paths) {
    try {
      const info = getTailwindcssPackageInfo({ paths: [candidate] })
      if (info?.rootPath) {
        return candidate
      }
    }
    catch {
      // ignore resolution errors and continue probing other candidates
    }
  }
  return undefined
}

export function resolvePatchDefaultCwd(currentCwd = process.cwd()) {
  const baseDir = path.normalize(currentCwd)
  const explicitCwd = normalizeCandidatePath(baseDir, process.env.WEAPP_TW_PATCH_CWD)
  if (explicitCwd) {
    return explicitCwd
  }

  const workspaceRoot = findWorkspaceRoot(baseDir)
  const initCwd = normalizeCandidatePath(baseDir, process.env.INIT_CWD)
  const localPrefix = normalizeCandidatePath(baseDir, process.env.npm_config_local_prefix)

  const candidates = [
    baseDir,
    workspaceRoot,
    initCwd,
    localPrefix,
  ].filter(Boolean) as string[]

  const detected = detectTailwindWorkspace([...new Set(candidates)])
  if (detected) {
    return detected
  }

  return initCwd ?? localPrefix ?? workspaceRoot ?? baseDir
}
