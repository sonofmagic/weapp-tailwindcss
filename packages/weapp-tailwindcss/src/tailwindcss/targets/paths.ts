import { existsSync } from 'node:fs'
import path from 'node:path'
import { md5Hash } from '@/cache/md5'
import { findNearestPackageRoot } from '@/context/workspace'

export const PATCH_INFO_FILENAME = 'tailwindcss-target.json'
export const PATCH_INFO_CACHE_RELATIVE_PATH = path.join('node_modules', '.cache', 'weapp-tailwindcss', PATCH_INFO_FILENAME)
export const PATCH_INFO_LEGACY_RELATIVE_PATH = path.join('.tw-patch', PATCH_INFO_FILENAME)

export function formatRelativeToBase(targetPath: string, baseDir?: string) {
  if (!baseDir) {
    return path.normalize(targetPath)
  }
  const relative = path.relative(baseDir, targetPath)
  if (!relative || relative === '.') {
    return '.'
  }
  if (relative.startsWith('..')) {
    return path.normalize(targetPath)
  }
  return path.join('.', relative)
}

export function resolveRecordLocation(baseDir: string) {
  const normalizedBase = path.normalize(baseDir)
  const packageRoot = findNearestPackageRoot(normalizedBase) ?? normalizedBase
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const hasPackageJson = existsSync(packageJsonPath)
  const recordKeySource = hasPackageJson ? packageJsonPath : normalizedBase
  const recordKey = md5Hash(path.normalize(recordKeySource))
  const recordDir = path.join(packageRoot, 'node_modules', '.cache', 'weapp-tailwindcss', recordKey)
  const recordPath = path.join(recordDir, PATCH_INFO_FILENAME)
  return {
    normalizedBase,
    packageRoot,
    recordDir,
    recordKey,
    recordPath,
    packageJsonPath: hasPackageJson ? packageJsonPath : undefined,
  }
}

export function getRecordFileCandidates(baseDir: string) {
  const { normalizedBase, packageRoot, recordPath } = resolveRecordLocation(baseDir)
  const candidates = new Set<string>([
    recordPath,
    path.join(packageRoot, PATCH_INFO_CACHE_RELATIVE_PATH),
    path.join(normalizedBase, PATCH_INFO_CACHE_RELATIVE_PATH),
    path.join(normalizedBase, PATCH_INFO_LEGACY_RELATIVE_PATH),
  ])
  return [...candidates]
}
